package com.memoflow.memoflow.service.impl;

import com.memoflow.memoflow.dto.request.CreateStoryLearningLessonRequest;
import com.memoflow.memoflow.dto.request.UpdateStoryLearningLessonRequest;
import com.memoflow.memoflow.dto.response.PageResponse;
import com.memoflow.memoflow.dto.response.StoryLessonProgressResponse;
import com.memoflow.memoflow.dto.response.StoryLessonResponse;
import com.memoflow.memoflow.entity.LearningActivity;
import com.memoflow.memoflow.entity.LearningLesson;
import com.memoflow.memoflow.entity.Media;
import com.memoflow.memoflow.entity.User;
import com.memoflow.memoflow.entity.UserLessonProgress;
import com.memoflow.memoflow.entity.enums.MediaType;
import com.memoflow.memoflow.exception.ResourceNotFoundException;
import com.memoflow.memoflow.repository.LearningActivityRepository;
import com.memoflow.memoflow.repository.LearningLessonRepository;
import com.memoflow.memoflow.repository.UserLessonProgressRepository;
import com.memoflow.memoflow.repository.UserRepository;
import com.memoflow.memoflow.security.UserPrincipal;
import com.memoflow.memoflow.service.CloudinaryService;
import com.memoflow.memoflow.service.StoryLessonService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class StoryLessonServiceImpl implements StoryLessonService {

    private static final String STORY_TYPE = "TRUYEN_CHEM";

    private final LearningLessonRepository learningLessonRepository;
    private final LearningActivityRepository learningActivityRepository;
    private final UserLessonProgressRepository userLessonProgressRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

    @Override
    public StoryLessonResponse createLesson(Long learningActivityId,
                                            CreateStoryLearningLessonRequest request,
                                            MultipartFile image,
                                            UserPrincipal userPrincipal) {
        LearningActivity activity = learningActivityRepository.findById(learningActivityId)
                .orElseThrow(() -> new ResourceNotFoundException("Learning Activity", "id", learningActivityId));

        User creator = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userPrincipal.getId()));

        LearningLesson lesson = LearningLesson.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .type(STORY_TYPE)
                .learningActivity(activity)
                .image(buildStoryImage(image))
                .build();

        lesson.setContent(buildStoryContent(request));

        return mapToLessonResponse(learningLessonRepository.save(lesson));
    }

    @Override
    public StoryLessonResponse updateLesson(Long lessonId,
                                            UpdateStoryLearningLessonRequest request,
                                            MultipartFile image,
                                            UserPrincipal userPrincipal) {
        LearningLesson lesson = findStoryLessonById(lessonId);

        lesson.setTitle(request.getTitle());
        lesson.setDescription(request.getDescription());

        Map<String, Object> content = lesson.getContent();
        if (content == null) {
            content = new HashMap<>();
        }

        if (request.getEnglishTitle() != null) {
            if (request.getEnglishTitle().isBlank()) {
                content.remove("englishTitle");
            } else {
                content.put("englishTitle", request.getEnglishTitle());
            }
        }

        content.put("paragraphs", request.getParagraphs());

        if (request.getVocabulary() != null) {
            List<Map<String, Object>> vocabulary = request.getVocabulary().stream()
                    .map(v -> Map.<String, Object>of("word", v.getWord()))
                    .collect(Collectors.toList());
            content.put("vocabulary", vocabulary);
        }

        lesson.setContent(content);

        if (image != null && !image.isEmpty()) {
            lesson.setImage(buildStoryImage(image));
        }

        return mapToLessonResponse(learningLessonRepository.save(lesson));
    }

    @Override
    public void deleteLesson(Long lessonId, UserPrincipal userPrincipal) {
        LearningLesson lesson = findStoryLessonById(lessonId);
        learningLessonRepository.delete(lesson);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<StoryLessonProgressResponse> getLessons(UserPrincipal userPrincipal, Pageable pageable) {
        Page<LearningLesson> lessonPage = learningLessonRepository.findByType(STORY_TYPE, pageable);

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

        List<StoryLessonProgressResponse> content = lessonPage.getContent().stream()
                .map(lesson -> mapToProgressResponse(lesson, progressMap.get(lesson.getId())))
                .collect(Collectors.toList());

        return PageResponse.<StoryLessonProgressResponse>builder()
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
    public StoryLessonProgressResponse getLessonDetail(Long lessonId, UserPrincipal userPrincipal) {
        LearningLesson lesson = findStoryLessonById(lessonId);
        UserLessonProgress progress = userLessonProgressRepository
                .findByUserIdAndLearningLessonId(userPrincipal.getId(), lessonId);

        return mapToProgressResponse(lesson, progress);
    }

    @Override
    public void completeLesson(Long lessonId, UserPrincipal userPrincipal) {
        LearningLesson lesson = findStoryLessonById(lessonId);

        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userPrincipal.getId()));

        UserLessonProgress progress = userLessonProgressRepository
                .findByUserAndLearningLesson(user, lesson)
                .orElse(UserLessonProgress.builder()
                        .user(user)
                        .learningLesson(lesson)
                        .build());

        progress.setIsCompleted(true);
        progress.setProgressPercent(100.0);
        progress.setCompletedAt(LocalDateTime.now());

        userLessonProgressRepository.save(progress);
    }

    private LearningLesson findStoryLessonById(Long lessonId) {
        LearningLesson lesson = learningLessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Story Lesson", "id", lessonId));

        if (!STORY_TYPE.equals(lesson.getType())) {
            throw new ResourceNotFoundException("Story Lesson", "id", lessonId);
        }

        return lesson;
    }

    private Media buildStoryImage(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            return null;
        }

        try {
            Map<String, String> uploadResult = cloudinaryService.uploadFile(image, "stories");
            String publicId = uploadResult.get("public_id");
            if (publicId == null) {
                publicId = uploadResult.get("publicId");
            }
            return Media.builder()
                    .url(uploadResult.get("url"))
                    .publicId(publicId)
                    .type(MediaType.IMAGE)
                    .build();
        } catch (IOException e) {
            throw new RuntimeException("Error uploading story image", e);
        }
    }

    private Map<String, Object> buildStoryContent(CreateStoryLearningLessonRequest request) {
        Map<String, Object> content = new HashMap<>();

        if (request.getEnglishTitle() != null && !request.getEnglishTitle().isBlank()) {
            content.put("englishTitle", request.getEnglishTitle());
        }

        content.put("paragraphs", request.getParagraphs());

        List<Map<String, Object>> vocabulary = Collections.emptyList();
        if (request.getVocabulary() != null && !request.getVocabulary().isEmpty()) {
            vocabulary = request.getVocabulary().stream()
                    .map(v -> Map.<String, Object>of("word", v.getWord()))
                    .collect(Collectors.toList());
        }

        content.put("vocabulary", vocabulary);
        return content;
    }

    private StoryLessonResponse mapToLessonResponse(LearningLesson lesson) {
        StoryLessonResponse.Media image = null;
        if (lesson.getImage() != null) {
            image = StoryLessonResponse.Media.builder()
                    .url(lesson.getImage().getUrl())
                    .build();
        }

        return StoryLessonResponse.builder()
                .id(lesson.getId())
                .title(lesson.getTitle())
                .type(lesson.getType())
                .description(lesson.getDescription())
                .image(image)
                .content(lesson.getContent())
                .learningActivityId(lesson.getLearningActivity() != null ? lesson.getLearningActivity().getId() : null)
                .build();
    }

    private StoryLessonProgressResponse mapToProgressResponse(LearningLesson lesson, UserLessonProgress progress) {
        StoryLessonResponse lessonResponse = mapToLessonResponse(lesson);
        boolean isCompleted = progress != null && Boolean.TRUE.equals(progress.getIsCompleted());

        return StoryLessonProgressResponse.builder()
                .id(progress != null ? progress.getId() : lesson.getId())
                .isCompleted(isCompleted)
                .progressPercent(progress != null && progress.getProgressPercent() != null
                        ? progress.getProgressPercent()
                        : (isCompleted ? 100.0 : 0.0))
                .score(progress != null ? progress.getScore() : null)
                .createdAt(progress != null ? progress.getCreatedAt() : null)
                .completedAt(progress != null ? progress.getCompletedAt() : null)
                .learningLesson(lessonResponse)
                .build();
    }
}
