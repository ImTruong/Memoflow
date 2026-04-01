package com.memoflow.memoflow.service.impl;

import com.memoflow.memoflow.dto.request.UpdateWordHuntProgressRequest;
import com.memoflow.memoflow.dto.request.UpsertWordHuntLessonRequest;
import com.memoflow.memoflow.dto.response.PageResponse;
import com.memoflow.memoflow.dto.response.WordHuntLessonResponse;
import com.memoflow.memoflow.dto.response.WordHuntProgressResponse;
import com.memoflow.memoflow.entity.LearningActivity;
import com.memoflow.memoflow.entity.LearningLesson;
import com.memoflow.memoflow.entity.User;
import com.memoflow.memoflow.entity.UserLessonProgress;
import com.memoflow.memoflow.exception.ResourceNotFoundException;
import com.memoflow.memoflow.repository.LearningActivityRepository;
import com.memoflow.memoflow.repository.LearningLessonRepository;
import com.memoflow.memoflow.repository.UserLessonProgressRepository;
import com.memoflow.memoflow.repository.UserRepository;
import com.memoflow.memoflow.security.UserPrincipal;
import com.memoflow.memoflow.service.WordHuntLessonService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WordHuntLessonServiceImpl implements WordHuntLessonService {

    private static final String WORD_HUNT_TYPE = "WORD_HUNT";

    private final LearningLessonRepository learningLessonRepository;
    private final LearningActivityRepository learningActivityRepository;
    private final UserLessonProgressRepository userLessonProgressRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public WordHuntLessonResponse createLesson(Long learningActivityId,
                                               UpsertWordHuntLessonRequest request,
                                               UserPrincipal userPrincipal) {
        LearningActivity activity = learningActivityRepository.findById(learningActivityId)
                .orElseThrow(() -> new ResourceNotFoundException("Learning Activity", "id", learningActivityId));

        User creator = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userPrincipal.getId()));

        LearningLesson lesson = LearningLesson.builder()
                .title(request.getTitle().trim())
                .type(WORD_HUNT_TYPE)
                .description(request.getDescription())
                .content(buildContent(request))
                .learningActivity(activity)
                .build();

        return mapToLessonResponse(learningLessonRepository.save(lesson));
    }

    @Override
    @Transactional
    public WordHuntLessonResponse updateLesson(Long lessonId, UpsertWordHuntLessonRequest request) {
        LearningLesson lesson = findWordHuntLessonById(lessonId);

        lesson.setTitle(request.getTitle().trim());
        lesson.setDescription(request.getDescription());
        lesson.setContent(buildContent(request));

        return mapToLessonResponse(learningLessonRepository.save(lesson));
    }

    @Override
    @Transactional
    public void deleteLesson(Long lessonId) {
        LearningLesson lesson = findWordHuntLessonById(lessonId);
        learningLessonRepository.delete(lesson);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<WordHuntProgressResponse> getLessons(UserPrincipal userPrincipal, Pageable pageable) {
        Page<LearningLesson> lessonPage = learningLessonRepository.findByType(WORD_HUNT_TYPE, pageable);

        List<Long> lessonIds = lessonPage.getContent().stream()
                .map(LearningLesson::getId)
                .collect(Collectors.toList());

        Map<Long, UserLessonProgress> tmp = Collections.emptyMap();
        if (!lessonIds.isEmpty()) {
            tmp = userLessonProgressRepository
                    .findByUserIdAndLearningLessonIdIn(userPrincipal.getId(), lessonIds)
                    .stream()
                    .collect(Collectors.toMap(
                            p -> p.getLearningLesson().getId(),
                            Function.identity()
                    ));
        }
        final Map<Long, UserLessonProgress> progressMap = tmp;

        List<WordHuntProgressResponse> content = lessonPage.getContent().stream()
                .map(lesson -> mapToProgressResponse(lesson, progressMap.get(lesson.getId())))
                .collect(Collectors.toList());

        return PageResponse.<WordHuntProgressResponse>builder()
                .content(content)
                .pageNumber(lessonPage.getNumber())
                .pageSize(lessonPage.getSize())
                .totalElements(lessonPage.getTotalElements())
                .totalPages(lessonPage.getTotalPages())
                .last(lessonPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public WordHuntProgressResponse getLessonDetail(Long lessonId, UserPrincipal userPrincipal) {
        LearningLesson lesson = findWordHuntLessonById(lessonId);
        UserLessonProgress progress = userLessonProgressRepository
                .findByUserIdAndLearningLessonId(userPrincipal.getId(), lessonId);
        return mapToProgressResponse(lesson, progress);
    }

    @Override
    @Transactional
    public WordHuntProgressResponse updateProgress(Long lessonId,
                                                   UpdateWordHuntProgressRequest request,
                                                   UserPrincipal userPrincipal) {
        LearningLesson lesson = findWordHuntLessonById(lessonId);

        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userPrincipal.getId()));

        UserLessonProgress progress = userLessonProgressRepository
                .findByUserAndLearningLesson(user, lesson)
                .orElse(UserLessonProgress.builder()
                        .user(user)
                        .learningLesson(lesson)
                        .build());

        boolean wasCompleted = Boolean.TRUE.equals(progress.getIsCompleted());
        boolean incomingCompleted = Boolean.TRUE.equals(request.getIsCompleted());
        boolean nextCompleted = wasCompleted || incomingCompleted;

        double existingPercent = progress.getProgressPercent() != null ? progress.getProgressPercent() : 0.0;
        double incomingPercent = request.getProgressPercent() != null
                ? clampProgress(request.getProgressPercent())
                : 0.0;

        progress.setIsCompleted(nextCompleted);
        progress.setProgressPercent(nextCompleted ? 100.0 : Math.max(existingPercent, incomingPercent));

        if (request.getScore() != null) {
            progress.setScore(request.getScore());
        }

        if (request.getHintsUsedToday() != null) {
            progress.setHintsUsedToday(Math.max(0, request.getHintsUsedToday()));
        } else if (progress.getHintsUsedToday() == null) {
            progress.setHintsUsedToday(0);
        }

        if (request.getHintsUsedDate() != null) {
            progress.setHintsUsedDate(request.getHintsUsedDate());
        }

        if (nextCompleted && progress.getCompletedAt() == null) {
            progress.setCompletedAt(LocalDateTime.now());
        }

        UserLessonProgress savedProgress = userLessonProgressRepository.save(progress);
        return mapToProgressResponse(lesson, savedProgress);
    }

    private LearningLesson findWordHuntLessonById(Long lessonId) {
        LearningLesson lesson = learningLessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Word Hunt Lesson", "id", lessonId));

        if (!WORD_HUNT_TYPE.equals(lesson.getType())) {
            throw new ResourceNotFoundException("Word Hunt Lesson", "id", lessonId);
        }

        return lesson;
    }

    private Map<String, Object> buildContent(UpsertWordHuntLessonRequest request) {
        List<String> sanitizedWords = sanitizeWords(request.getWords());
        int targetWordCount = Math.min(request.getTargetWordCount(), sanitizedWords.size());

        Map<String, Object> content = new LinkedHashMap<>();
        content.put("categoryKey", request.getCategoryKey().trim());
        content.put("categoryLabel", request.getCategoryLabel().trim());
        content.put("boardSize", request.getBoardSize());
        content.put("timeLimitSeconds", request.getTimeLimitSeconds());
        content.put("targetWordCount", targetWordCount);
        content.put("maxHintsPerDay", request.getMaxHintsPerDay());
        content.put("objectiveText", request.getObjectiveText().trim());

        if (StringUtils.hasText(request.getUnlockRequirementText())) {
            content.put("unlockRequirementText", request.getUnlockRequirementText().trim());
        }

        content.put("words", sanitizedWords);
        return content;
    }

    private List<String> sanitizeWords(List<String> words) {
        return words.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(StringUtils::hasText)
                .map(String::toUpperCase)
                .distinct()
                .collect(Collectors.toList());
    }

    private double clampProgress(double progressPercent) {
        return Math.max(0.0, Math.min(100.0, progressPercent));
    }

    private WordHuntLessonResponse mapToLessonResponse(LearningLesson lesson) {
        return WordHuntLessonResponse.builder()
                .id(lesson.getId())
                .title(lesson.getTitle())
                .type(lesson.getType())
                .description(lesson.getDescription())
                .content(lesson.getContent())
                .learningActivityId(lesson.getLearningActivity() != null ? lesson.getLearningActivity().getId() : null)
                .build();
    }

    private WordHuntProgressResponse mapToProgressResponse(LearningLesson lesson, UserLessonProgress progress) {
        boolean isCompleted = progress != null && Boolean.TRUE.equals(progress.getIsCompleted());

        return WordHuntProgressResponse.builder()
                .id(progress != null ? progress.getId() : lesson.getId())
                .isCompleted(isCompleted)
                .progressPercent(progress != null && progress.getProgressPercent() != null
                        ? progress.getProgressPercent()
                        : (isCompleted ? 100.0 : 0.0))
                .score(progress != null ? progress.getScore() : null)
                .createdAt(progress != null ? progress.getCreatedAt() : null)
                .completedAt(progress != null ? progress.getCompletedAt() : null)
                .hintsUsedToday(progress != null && progress.getHintsUsedToday() != null
                        ? progress.getHintsUsedToday()
                        : 0)
                .hintsUsedDate(progress != null ? progress.getHintsUsedDate() : null)
                .learningLesson(mapToLessonResponse(lesson))
                .build();
    }
}
