package com.memoflow.memoflow.service.impl;

import com.memoflow.memoflow.dto.request.UpsertWordRaceLessonRequest;
import com.memoflow.memoflow.dto.response.PageResponse;
import com.memoflow.memoflow.dto.response.WordRaceLessonResponse;
import com.memoflow.memoflow.entity.LearningActivity;
import com.memoflow.memoflow.entity.LearningLesson;
import com.memoflow.memoflow.entity.User;
import com.memoflow.memoflow.exception.ResourceNotFoundException;
import com.memoflow.memoflow.repository.LearningActivityRepository;
import com.memoflow.memoflow.repository.LearningLessonRepository;
import com.memoflow.memoflow.repository.UserRepository;
import com.memoflow.memoflow.security.UserPrincipal;
import com.memoflow.memoflow.service.WordRaceLessonService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WordRaceLessonServiceImpl implements WordRaceLessonService {

    private static final String WORD_RACE_TYPE = "WORD_RACE";

    private final LearningLessonRepository learningLessonRepository;
    private final LearningActivityRepository learningActivityRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public WordRaceLessonResponse createLesson(Long learningActivityId,
                                               UpsertWordRaceLessonRequest request,
                                               UserPrincipal userPrincipal) {
        LearningActivity activity = learningActivityRepository.findById(learningActivityId)
                .orElseThrow(() -> new ResourceNotFoundException("Learning Activity", "id", learningActivityId));

        User creator = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userPrincipal.getId()));

        LearningLesson lesson = LearningLesson.builder()
                .title(request.getTitle().trim())
                .type(WORD_RACE_TYPE)
                .description(trimToNull(request.getDescription()))
                .content(buildContent(request))
                .learningActivity(activity)
                .build();

        return mapToLessonResponse(learningLessonRepository.save(lesson));
    }

    @Override
    @Transactional
    public WordRaceLessonResponse updateLesson(Long lessonId, UpsertWordRaceLessonRequest request) {
        LearningLesson lesson = findWordRaceLessonById(lessonId);

        lesson.setTitle(request.getTitle().trim());
        lesson.setDescription(trimToNull(request.getDescription()));
        lesson.setContent(buildContent(request));

        return mapToLessonResponse(learningLessonRepository.save(lesson));
    }

    @Override
    @Transactional
    public void deleteLesson(Long lessonId) {
        LearningLesson lesson = findWordRaceLessonById(lessonId);
        learningLessonRepository.delete(lesson);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<WordRaceLessonResponse> getLessons(Pageable pageable) {
        Page<LearningLesson> lessonPage = learningLessonRepository.findByType(WORD_RACE_TYPE, pageable);

        List<WordRaceLessonResponse> content = lessonPage.getContent().stream()
                .map(this::mapToLessonResponse)
                .collect(Collectors.toList());

        return PageResponse.<WordRaceLessonResponse>builder()
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
    public WordRaceLessonResponse getLessonDetail(Long lessonId) {
        return mapToLessonResponse(findWordRaceLessonById(lessonId));
    }

    private LearningLesson findWordRaceLessonById(Long lessonId) {
        LearningLesson lesson = learningLessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Word Race Lesson", "id", lessonId));

        if (!WORD_RACE_TYPE.equals(lesson.getType())) {
            throw new ResourceNotFoundException("Word Race Lesson", "id", lessonId);
        }

        return lesson;
    }

    private Map<String, Object> buildContent(UpsertWordRaceLessonRequest request) {
        Map<String, Object> content = new LinkedHashMap<>();
        content.put("targetScore", request.getTargetScore());
        content.put("timeLimit", request.getTimeLimit());

        List<String> forbiddenEndings = sanitizeForbiddenEndings(request.getForbiddenEndings());
        content.put("forbiddenEndings", forbiddenEndings);

        return content;
    }

    private List<String> sanitizeForbiddenEndings(List<String> endings) {
        if (endings == null) {
            return List.of();
        }

        return endings.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(StringUtils::hasText)
                .map(String::toLowerCase)
                .distinct()
                .collect(Collectors.toList());
    }

    private String trimToNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }

        return value.trim();
    }

    private WordRaceLessonResponse mapToLessonResponse(LearningLesson lesson) {
        return WordRaceLessonResponse.builder()
                .id(lesson.getId())
                .title(lesson.getTitle())
                .type(lesson.getType())
                .description(lesson.getDescription())
                .content(lesson.getContent())
                .learningActivityId(lesson.getLearningActivity() != null ? lesson.getLearningActivity().getId() : null)
                .build();
    }
}
