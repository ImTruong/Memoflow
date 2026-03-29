package com.memoflow.memoflow.service.impl;

import com.memoflow.memoflow.dto.request.CreateFlashcardLearningLessonRequest;
import com.memoflow.memoflow.dto.request.SubmitListeningLessonRequest;
import com.memoflow.memoflow.dto.request.UpdateFlashcardLearningLessonRequest;
import com.memoflow.memoflow.dto.response.*;
import com.memoflow.memoflow.entity.*;
import com.memoflow.memoflow.exception.ResourceNotFoundException;
import com.memoflow.memoflow.repository.*;
import com.memoflow.memoflow.security.UserPrincipal;
import com.memoflow.memoflow.entity.enums.MediaType;
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
import java.util.*;
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
    private final UserLessonProgressRepository userLessonProgressRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final QuizOptionRepository quizOptionRepository;
    private final UserQuizAnswerRepository userQuizAnswerRepository;

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

    @Override
    public PageResponse<ListeningLessonResponse> getListeningLessons(
            UserPrincipal userPrincipal,
            Long part,
            String status,
            Pageable pageable) {
        String type="LISTENING_PART_"+part;
        Page<ListeningLessonResponse> responsesPage=learningLessonRepository.findListeningLessons(
                userPrincipal.getId(),type,status,pageable);
        return PageResponse.<ListeningLessonResponse>builder()
                .content(responsesPage.getContent())
                .pageNumber(responsesPage.getNumber())
                .pageSize(responsesPage.getSize())
                .totalElements(responsesPage.getTotalElements())
                .totalPages(responsesPage.getTotalPages())
                .last(responsesPage.isLast())
                .build();
    }

    @Override
    public ListeningLessonDetailResponse getListeningLessonDetail(Long lessonId) {
        LearningLesson lesson = learningLessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        return ListeningLessonDetailResponse.builder()
                .lessonId(lesson.getId())
                .title(lesson.getTitle())
                .type(lesson.getType())
                .groups(
                        lesson.getQuizGroups().stream()
                                .sorted(Comparator.comparing(QuizGroup::getOrderIndex))
                                .map(group ->
                                        ListeningLessonDetailResponse.GroupResponse.builder()
                                                .groupId(group.getId())
                                                .audio(group.getAudio() != null ? new ListeningLessonDetailResponse.MediaResponse(group.getAudio().getUrl()) : null)
                                                .images(group.getImage() != null ? new ListeningLessonDetailResponse.MediaResponse(group.getImage().getUrl()) : null)
                                                .quizzes(
                                                        group.getQuizQuestions().stream()
                                                                .sorted(Comparator.comparing(QuizQuestion::getOrderIndex))
                                                                .map(q ->
                                                                        ListeningLessonDetailResponse.QuizResponse.builder()
                                                                                .quizId(q.getId())
                                                                                .questionText(q.getQuestionText() != null ? q.getQuestionText() : "")
                                                                                .options(
                                                                                        q.getQuizOptions().stream()
                                                                                                .sorted(Comparator.comparing(QuizOption::getOrderIndex))
                                                                                                .map(opt ->
                                                                                                        ListeningLessonDetailResponse.OptionResponse.builder()
                                                                                                                .optionId(opt.getId())
                                                                                                                .optionText(opt.getOptionText() != null ? opt.getOptionText() : "")
                                                                                                                .build()
                                                                                                ).collect(Collectors.toList())
                                                                                )
                                                                                .build()
                                                                ).collect(Collectors.toList())
                                                )
                                                .build()
                                ).collect(Collectors.toList())
                )
                .build();
    }

    @Override
    public void submitListeningLesson(UserPrincipal userPrincipal, Long lessonId,
                                      SubmitListeningLessonRequest request, boolean isCompleted) {
        LearningLesson lesson = learningLessonRepository.findById(lessonId).orElseThrow();
        User user = userRepository.findById(userPrincipal.getId()).orElseThrow();

        UserLessonProgress progress = userLessonProgressRepository
                .findByUserIdAndLearningLessonId(user.getId(), lesson.getId());
        if (progress == null) {
            progress = UserLessonProgress.builder()
                    .user(user)
                    .learningLesson(lesson)
                    .build();
        }
        progress.setIsCompleted(isCompleted);

        userLessonProgressRepository.save(progress);
        Set<Long> submittedQuizIds = request.getAnswers().stream()
                .map(SubmitListeningLessonRequest.Answer::getQuizId)
                .collect(Collectors.toSet());

        List<UserQuizAnswer> existingAnswers = userQuizAnswerRepository.findByUserId(user.getId());
        for (UserQuizAnswer existing : existingAnswers) {
            if (!submittedQuizIds.contains(existing.getQuizQuestion().getId())) {
                userQuizAnswerRepository.delete(existing);
            }
        }

        for (SubmitListeningLessonRequest.Answer ans : request.getAnswers()) {
            QuizQuestion question = quizQuestionRepository.findById(ans.getQuizId()).orElseThrow();
            UserQuizAnswer existing = userQuizAnswerRepository
                    .findByUserIdAndQuizQuestionId(user.getId(), question.getId())
                    .orElse(null);

            if (ans.getOptionId() == null) {
                if (existing != null) {
                    userQuizAnswerRepository.delete(existing);
                }
            } else {
                QuizOption option = quizOptionRepository.findById(ans.getOptionId()).orElseThrow();
                if (existing != null) {
                    existing.setQuizOption(option);
                    userQuizAnswerRepository.save(existing);
                } else {
                    UserQuizAnswer userAnswer = UserQuizAnswer.builder()
                            .user(user)
                            .quizQuestion(question)
                            .quizOption(option)
                            .build();
                    userQuizAnswerRepository.save(userAnswer);
                }
            }
        }
    }


    @Override
    public ListeningLessonSubmissionResponse getListeningSubmission(UserPrincipal userPrincipal, Long lessonId) {
        List<UserQuizAnswer> userAnswers = userQuizAnswerRepository.findByUserIdAndLessonId(userPrincipal.getId(), lessonId);

        List<ListeningLessonSubmissionResponse.Answer> answers = userAnswers.stream()
                .map(ans -> {
                    ListeningLessonSubmissionResponse.Answer answer = new ListeningLessonSubmissionResponse.Answer();
                    answer.setQuizId(ans.getQuizQuestion().getId());
                    answer.setOptionId(ans.getQuizOption() != null ? ans.getQuizOption().getId() : null);
                    return answer;
                })
                .toList();

        ListeningLessonSubmissionResponse response = new ListeningLessonSubmissionResponse();
        response.setLessonId(lessonId);
        response.setAnswers(answers);

        return response;
    }

    @Override
    public ListeningResultResponse getListeningResult(UserPrincipal userPrincipal, Long lessonId) {

        LearningLesson lesson = learningLessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        List<UserQuizAnswer> userAnswers = userQuizAnswerRepository.findByUserIdAndLessonId(userPrincipal.getId(), lessonId);

        int totalQuestion = lesson.getQuizGroups().stream()
                .mapToInt(group -> group.getQuizQuestions().size())
                .sum();

        int score = (int) userAnswers.stream()
                .filter(ans -> ans.getQuizOption() != null && Boolean.TRUE.equals(ans.getQuizOption().getIsCorrect()))
                .count();

        ListeningResultResponse response = new ListeningResultResponse();
        response.setLessonId(lesson.getId());
        response.setTitle(lesson.getTitle());
        response.setType(lesson.getType());
        response.setTotalQuestion(totalQuestion);
        response.setScore(score);

        List<ListeningResultResponse.GroupResult> groupResults = lesson.getQuizGroups().stream().map(group -> {
            ListeningResultResponse.GroupResult groupResult = new ListeningResultResponse.GroupResult();
            groupResult.setGroupId(group.getId());

            groupResult.setAudio(group.getAudio() != null
                    ? new ListeningResultResponse.Media(group.getAudio().getUrl())
                    : null);

            groupResult.setImages(group.getImage() != null
                    ? new ListeningResultResponse.Media(group.getImage().getUrl())
                    : null);

            groupResult.setTranscript(group.getTranscript());
            groupResult.setTranslation(group.getTranslation());

            List<ListeningResultResponse.QuizResult> quizResults = group.getQuizQuestions().stream().map(q -> {
                ListeningResultResponse.QuizResult quizResult = new ListeningResultResponse.QuizResult();
                quizResult.setQuizId(q.getId());
                quizResult.setQuestionText(q.getQuestionText());
                quizResult.setTranslation(q.getTranslation());

                // tìm đáp án user chọn
                Integer userAnswerId = userAnswers.stream()
                        .filter(ans -> ans.getQuizQuestion().getId().equals(q.getId()))
                        .map(ans -> ans.getQuizOption() != null ? ans.getQuizOption().getId().intValue() : null)
                        .findFirst().orElse(null);
                quizResult.setUserAnswer(userAnswerId);

                List<ListeningResultResponse.OptionResult> optionResults = q.getQuizOptions().stream().map(opt ->
                        new ListeningResultResponse.OptionResult(
                                opt.getId().intValue(),
                                opt.getOptionText(),
                                opt.getIsCorrect()
                        )
                ).collect(Collectors.toList());

                quizResult.setOptions(optionResults);
                return quizResult;
            }).collect(Collectors.toList());

            groupResult.setQuizzes(quizResults);
            return groupResult;
        }).collect(Collectors.toList());

        response.setGroups(groupResults);
        return response;
    }

    @Override
    public PageResponse<BilingualResponse> searchBilingual(String keyword, Pageable pageable, String filter) {
        Page<LearningLesson> responsesPage;
        if("newest".equals(filter)){
            responsesPage = learningLessonRepository.findBilingualNewest(keyword,pageable);
        }
        else if("oldest".equals(filter)){
            responsesPage = learningLessonRepository.findBilingualOldest(keyword,pageable);
        }
        else{
            responsesPage = learningLessonRepository.findBilingualPopular(keyword,pageable);
        }
        List<BilingualResponse> content = responsesPage.getContent().stream()
                .map(l -> new BilingualResponse(
                        l.getId(),
                        l.getTitle(),
                        l.getDescription(),
                        l.getContent(),
                        l.getImage() != null ? new BilingualResponse.Media(l.getImage().getUrl()) : null
                ))
                .collect(Collectors.toList());

        return PageResponse.<BilingualResponse>builder()
                .content(content)
                .pageNumber(responsesPage.getNumber())
                .pageSize(responsesPage.getSize())
                .totalElements(responsesPage.getTotalElements())
                .totalPages(responsesPage.getTotalPages())
                .last(responsesPage.isLast())
                .build();
    }

    @Override
    public BilingualResponse getBilingualById(Long id) {
        LearningLesson lesson = learningLessonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        return new BilingualResponse(
                lesson.getId(),
                lesson.getTitle(),
                lesson.getDescription(),
                lesson.getContent(),
                lesson.getImage() != null ? new BilingualResponse.Media(lesson.getImage().getUrl()) : null
        );
    }

    @Override
    public void markAsSeen(Long lessonId, UserPrincipal userPrincipal) {
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        learningLessonRepository.incrementViews(lessonId);
        LearningLesson lesson = learningLessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

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
}
