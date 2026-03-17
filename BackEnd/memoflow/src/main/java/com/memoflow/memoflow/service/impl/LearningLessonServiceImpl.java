package com.memoflow.memoflow.service.impl;

import com.memoflow.memoflow.dto.request.CreateFlashcardLearningLessonRequest;
import com.memoflow.memoflow.dto.request.UpdateFlashcardLearningLessonRequest;
import com.memoflow.memoflow.dto.response.FlashcardLessonDetailResponse;
import com.memoflow.memoflow.dto.response.FlashcardLessonResponse;
import com.memoflow.memoflow.dto.response.FlashcardLessonSummaryResponse;
import com.memoflow.memoflow.dto.response.PageResponse;
import com.memoflow.memoflow.dto.response.WordResponse;
import com.memoflow.memoflow.exception.ResourceNotFoundException;
import com.memoflow.memoflow.entity.LearningActivity;
import com.memoflow.memoflow.entity.LearningLesson;
import com.memoflow.memoflow.entity.Media;
import com.memoflow.memoflow.security.UserPrincipal;
import com.memoflow.memoflow.entity.User;
import com.memoflow.memoflow.entity.enums.MediaType;
import com.memoflow.memoflow.repository.FlashcardReviewRepository;
import com.memoflow.memoflow.repository.LearningActivityRepository;
import com.memoflow.memoflow.repository.LearningLessonRepository;
import com.memoflow.memoflow.repository.UserRepository;
import com.memoflow.memoflow.repository.WordRepository;
import com.memoflow.memoflow.service.CloudinaryService;
import com.memoflow.memoflow.service.LearningLessonService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class LearningLessonServiceImpl implements LearningLessonService {

    private final LearningLessonRepository learningLessonRepository;
    private final LearningActivityRepository learningActivityRepository;
    private final UserRepository userRepository;
    private final WordRepository wordRepository;
    private final FlashcardReviewRepository flashcardReviewRepository;
    private final ModelMapper modelMapper;
    private final CloudinaryService cloudinaryService;

    @Override
    public FlashcardLessonResponse createFlashcardLesson(Long learningActivityId,
            CreateFlashcardLearningLessonRequest request, UserPrincipal userPrincipal) {
        String publicId = null;
        try {
            Media imageMedia = null;
            if (request.getImage() != null && !request.getImage().isEmpty()) {
                imageMedia = uploadLessonImage(request);
                publicId = imageMedia.getPublicId();
            }

            User user = userRepository.findById(userPrincipal.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", userPrincipal.getId()));

            return saveLessonToDatabase(learningActivityId, request, user, imageMedia);

        } catch (Exception e) {
            if (publicId != null) {
                try {
                    cloudinaryService.deleteImage(publicId);
                } catch (IOException ioException) {
                    log.error("Failed to delete image from Cloudinary after failed lesson creation: {}", publicId,
                            ioException);
                }
            }
            throw e instanceof RuntimeException ? (RuntimeException) e
                    : new RuntimeException("Error creating lesson", e);
        }
    }

    private Media uploadLessonImage(CreateFlashcardLearningLessonRequest request) {
        try {
            Map<String, String> uploadResult = cloudinaryService.uploadFile(request.getImage(), "lessons");
            return Media.builder()
                    .url(uploadResult.get("url"))
                    .publicId(uploadResult.get("public_id"))
                    .type(MediaType.IMAGE)
                    .build();
        } catch (IOException e) {
            throw new RuntimeException("Error uploading lesson image", e);
        }
    }

    @Transactional
    public FlashcardLessonResponse saveLessonToDatabase(Long learningActivityId,
            CreateFlashcardLearningLessonRequest request, User user, Media imageMedia) {
        LearningActivity activity = learningActivityRepository.getReferenceById(learningActivityId);

        LearningLesson lesson = LearningLesson.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .type("FLASHCARD")
                .learningActivity(activity)
                .creator(user)
                .image(imageMedia)
                .build();

        Map<String, Object> content = new HashMap<>();
        content.put("privacyMode", request.getPrivacyMode());
        lesson.setContent(content);

        LearningLesson savedLesson = learningLessonRepository.save(lesson);

        FlashcardLessonResponse response = modelMapper.map(savedLesson, FlashcardLessonResponse.class);
        if (savedLesson.getImage() != null) {
            response.setImageUrl(savedLesson.getImage().getUrl());
        }
        response.setLearningActivityId(learningActivityId);
        response.setCreatorName(user.getName());

        return response;
    }

    @Override
    public FlashcardLessonResponse updateFlashcardLesson(Long id, UpdateFlashcardLearningLessonRequest request,
            UserPrincipal userPrincipal) {
        LearningLesson lesson = learningLessonRepository.getReferenceById(id);

        lesson.setTitle(request.getTitle());
        lesson.setDescription(request.getDescription());

        Map<String, Object> content = lesson.getContent();
        if (content == null) {
            content = new HashMap<>();
        }
        content.put("privacyMode", request.getPrivacyMode());
        lesson.setContent(content);

        if (request.getImage() != null && !request.getImage().isEmpty()) {
            try {
                Map<String, String> uploadResult = cloudinaryService.uploadFile(request.getImage(), "lessons");
                Media imageMedia = Media.builder()
                        .url(uploadResult.get("url"))
                        .publicId(uploadResult.get("public_id"))
                        .type(MediaType.IMAGE)
                        .build();
                lesson.setImage(imageMedia);
            } catch (IOException e) {
                throw new RuntimeException("Error uploading lesson image during update", e);
            }
        }

        LearningLesson savedLesson = learningLessonRepository.save(lesson);

        FlashcardLessonResponse response = modelMapper.map(savedLesson, FlashcardLessonResponse.class);
        if (savedLesson.getImage() != null) {
            response.setImageUrl(savedLesson.getImage().getUrl());
        }
        response.setLearningActivityId(savedLesson.getLearningActivity().getId());
        response.setCreatorName(savedLesson.getCreator().getName());

        return response;
    }

    @Override
    public void deleteFlashcardLesson(Long id, UserPrincipal userPrincipal) {
        learningLessonRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<FlashcardLessonSummaryResponse> getMyFlashcardLessons(UserPrincipal userPrincipal,
            Pageable pageable) {
        Page<LearningLesson> lessonPage = learningLessonRepository.findByCreatorId(userPrincipal.getId(), pageable);
        return mapToFlashcardLessonSummaryPageResponse(lessonPage, userPrincipal.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<FlashcardLessonSummaryResponse> getCommunityFlashcardLessons(UserPrincipal userPrincipal,
            Pageable pageable) {
        Page<LearningLesson> lessonPage = learningLessonRepository.findCommunityFlashcardLessons(pageable);
        return mapToFlashcardLessonSummaryPageResponse(lessonPage, userPrincipal.getId());
    }

    private PageResponse<FlashcardLessonSummaryResponse> mapToFlashcardLessonSummaryPageResponse(
            Page<LearningLesson> lessonPage, Long userId) {
        LocalDateTime now = LocalDateTime.now();
        List<FlashcardLessonSummaryResponse> content = lessonPage.getContent().stream()
                .map(lesson -> {
                    FlashcardLessonSummaryResponse summary = modelMapper.map(lesson,
                            FlashcardLessonSummaryResponse.class);
                    if (lesson.getImage() != null) {
                        summary.setImageUrl(lesson.getImage().getUrl());
                    }
                    summary.setCreatorName(lesson.getCreator().getName());
                    summary.setLearningActivityId(lesson.getLearningActivity().getId());
                    summary.setContent(lesson.getContent());


                    long totalWords = wordRepository.countByFlashcardLessonId(lesson.getId());
                    long learnedWords = flashcardReviewRepository.countLearnedWordsByFlashcardLesson(lesson.getId(), userId,
                            now);
                    long totalDueWord = flashcardReviewRepository.countWordsLearnedAtLeastOnceByFlashcardLesson(lesson.getId(), userId);

                    summary.setTotalWords(totalWords);
                    summary.setLearnedWords(learnedWords);
                    summary.setTotalDueWord(totalDueWord);


                    return summary;
                })
                .collect(Collectors.toList());

        return PageResponse.<FlashcardLessonSummaryResponse>builder()
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
    public FlashcardLessonDetailResponse getFlashcardLessonDetail(Long id, UserPrincipal userPrincipal,
            Pageable pageable) {
        LearningLesson lesson = learningLessonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Flashcard Lesson", "id", id));

        FlashcardLessonResponse lessonResponse = modelMapper.map(lesson, FlashcardLessonResponse.class);
        if (lesson.getImage() != null) {
            lessonResponse.setImageUrl(lesson.getImage().getUrl());
        }
        lessonResponse.setLearningActivityId(lesson.getLearningActivity().getId());
        lessonResponse.setCreatorName(lesson.getCreator().getName());

        Page<com.memoflow.memoflow.entity.Word> wordPage = wordRepository.findByFlashcardLessonId(id, pageable);
        List<WordResponse> wordResponses = wordPage.getContent().stream()
                .map(word -> {
                    WordResponse wr = modelMapper.map(word, WordResponse.class);
                    if (word.getImage() != null) {
                        wr.setImageUrl(word.getImage().getUrl());
                    }
                    if (word.getAudio() != null) {
                        wr.setAudioUrl(word.getAudio().getUrl());
                    }
                    wr.setFlashcardLessonId(id);
                    return wr;
                })
                .collect(Collectors.toList());

        PageResponse<WordResponse> wordsPageResponse = PageResponse.<WordResponse>builder()
                .content(wordResponses)
                .pageNumber(wordPage.getNumber())
                .pageSize(wordPage.getSize())
                .totalElements(wordPage.getTotalElements())
                .totalPages(wordPage.getTotalPages())
                .last(wordPage.isLast())
                .build();

        return FlashcardLessonDetailResponse.builder()
                .lessonInfo(lessonResponse)
                .words(wordsPageResponse)
                .build();
    }
}
