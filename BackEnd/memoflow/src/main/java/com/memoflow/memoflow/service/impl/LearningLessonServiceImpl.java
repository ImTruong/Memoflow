package com.memoflow.memoflow.service.impl;

import com.memoflow.memoflow.dto.request.*;
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
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.function.Function;
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
    private final QuizAnswerRepository quizAnswerRepository;
    private final UserQuizAnswerRepository userQuizAnswerRepository;
    public final MediaRepository mediaRepository;

    private static final String GRAMMAR_TOPIC_TYPE = "GRAMMAR_TOPIC";
    private static final String GRAMMAR_LESSON_TYPE = "GRAMMAR_LESSON";
    private static final String GRAMMAR_PRACTICE_TYPE = "GRAMMAR_PRACTICE";

    private enum GrammarLessonState {
        NOT_STARTED,
        IN_PROGRESS,
        COMPLETED
    }

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
        LearningLesson lesson = findLessonById(id);
        List<Word> words = wordRepository.findByFlashcardLessonId(id);

        boolean hasStudiedWords = deleteAllWordsInLesson(words);

        if (hasStudiedWords) {
            softDeleteLesson(lesson);
        } else {
            hardDeleteLesson(id);
        }
    }

    /**
     * Delete all words in a lesson and return whether any were soft deleted
     * 
     * @return true if at least one word was soft deleted (had reviews), false
     *         otherwise
     */
    private boolean deleteAllWordsInLesson(List<Word> words) {
        boolean hasStudiedWord = false;

        for (Word word : words) {
            if (hasBeenReviewed(word.getId())) {
                softDeleteWord(word);
                hasStudiedWord = true;
            } else {
                hardDeleteWord(word.getId());
            }
        }

        return hasStudiedWord;
    }

    /**
     * Check if a word has been reviewed by any user
     */
    private boolean hasBeenReviewed(Long wordId) {
        return !flashcardReviewRepository.findByWordId(wordId).isEmpty();
    }

    /**
     * Soft delete: mark word as deleted
     */
    private void softDeleteWord(Word word) {
        word.setDeleted(true);
        wordRepository.save(word);
    }

    /**
     * Hard delete: permanently remove word from database
     */
    private void hardDeleteWord(Long wordId) {
        wordRepository.deleteById(wordId);
    }

    /**
     * Soft delete: mark lesson as deleted (preserves learning history)
     */
    private void softDeleteLesson(LearningLesson lesson) {
        lesson.setDeleted(true);
        learningLessonRepository.save(lesson);
    }

    /**
     * Hard delete: permanently remove lesson from database
     */
    private void hardDeleteLesson(Long lessonId) {
        learningLessonRepository.deleteById(lessonId);
    }

    /**
     * Find lesson by ID or throw exception
     */
    private LearningLesson findLessonById(Long id) {
        return learningLessonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Flashcard lesson not found with id: " + id));
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
                    summary.setCreatorId(lesson.getCreator().getId());
                    summary.setCreatorName(lesson.getCreator().getName());
                    summary.setLearningActivityId(lesson.getLearningActivity().getId());
                    summary.setContent(lesson.getContent());

                    long totalWords = wordRepository.countByFlashcardLessonId(lesson.getId());
                    long learnedWords = flashcardReviewRepository.countLearnedWordsByFlashcardLesson(lesson.getId(),
                            userId,
                            now);
                    long totalDueWord = flashcardReviewRepository
                            .countWordsLearnedAtLeastOnceByFlashcardLesson(lesson.getId(), userId);

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
        lessonResponse.setCreatorId(lesson.getCreator().getId());
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
        String type = "LISTENING_PART_" + part;
        Page<ListeningLessonResponse> responsesPage = learningLessonRepository.findListeningLessons(
                userPrincipal.getId(), type, status, pageable);
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
                                .map(group -> ListeningLessonDetailResponse.GroupResponse.builder()
                                        .groupId(group.getId())
                                        .audio(group.getAudio() != null
                                                ? new ListeningLessonDetailResponse.MediaResponse(
                                                        group.getAudio().getUrl())
                                                : null)
                                        .images(group.getImage() != null
                                                ? new ListeningLessonDetailResponse.MediaResponse(
                                                        group.getImage().getUrl())
                                                : null)
                                        .quizzes(
                                                group.getQuizQuestions().stream()
                                                        .sorted(Comparator.comparing(QuizQuestion::getOrderIndex))
                                                        .map(q -> ListeningLessonDetailResponse.QuizResponse.builder()
                                                                .quizId(q.getId())
                                                                .questionText(q.getQuestionText() != null
                                                                        ? q.getQuestionText()
                                                                        : "")
                                                                .options(
                                                                        q.getQuizOptions().stream()
                                                                                .sorted(Comparator.comparing(
                                                                                        QuizOption::getOrderIndex))
                                                                                .map(opt -> ListeningLessonDetailResponse.OptionResponse
                                                                                        .builder()
                                                                                        .optionId(opt.getId())
                                                                                        .optionText(opt
                                                                                                .getOptionText() != null
                                                                                                        ? opt.getOptionText()
                                                                                                        : "")
                                                                                        .build())
                                                                                .collect(Collectors.toList()))
                                                                .build())
                                                        .collect(Collectors.toList()))
                                        .build())
                                .collect(Collectors.toList()))
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

        int score = 0;
        if (!isCompleted) {
            score = (int) request.getAnswers().stream()
                    .filter(ans -> ans.getOptionId() != null)
                    .count();
        } else {
            for (SubmitListeningLessonRequest.Answer ans : request.getAnswers()) {
                if (ans.getOptionId() != null) {
                    QuizOption option = quizOptionRepository.findById(ans.getOptionId()).orElseThrow();
                    if (Boolean.TRUE.equals(option.getIsCorrect())) {
                        score++;
                    }
                }
            }
        }
        progress.setScore(score);

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
        List<UserQuizAnswer> userAnswers = userQuizAnswerRepository.findByUserIdAndLessonId(userPrincipal.getId(),
                lessonId);

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

        if (!userLessonProgressRepository.existsByUserIdAndLearningLessonIdAndIsCompletedTrue(userPrincipal.getId(), lessonId)) {
            throw new ResourceNotFoundException("Bài làm không tồn tại hoặc chưa nộp.");
        }

        List<UserQuizAnswer> userAnswers = userQuizAnswerRepository.findByUserIdAndLessonId(userPrincipal.getId(),
                lessonId);

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

                Integer userAnswerId = userAnswers.stream()
                        .filter(ans -> ans.getQuizQuestion().getId().equals(q.getId()))
                        .map(ans -> ans.getQuizOption() != null ? ans.getQuizOption().getId().intValue() : null)
                        .findFirst().orElse(null);
                quizResult.setUserAnswer(userAnswerId);

                List<ListeningResultResponse.OptionResult> optionResults = q.getQuizOptions().stream()
                        .map(opt -> new ListeningResultResponse.OptionResult(
                                opt.getId().intValue(),
                                opt.getOptionText(),
                                opt.getIsCorrect()))
                        .collect(Collectors.toList());

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
    public ListeningLessonDetailResponse createListeningLesson(CreateListeningLessonRequest request,
                                                               List<MultipartFile> audios,
                                                               List<MultipartFile> images) throws IOException {
        LearningLesson lesson = new LearningLesson();
        lesson.setTitle(request.getTitle());
        lesson.setType("LISTENING_PART_" + request.getPart());

        LearningActivity activity = learningActivityRepository.findById(8L)
                .orElseThrow(() -> new RuntimeException("Activity not found"));
        lesson.setLearningActivity(activity);

        List<QuizGroup> groups = new ArrayList<>();
        int audioIndex = 0;
        int imageIndex = 0;

        for (CreateListeningLessonRequest.ListeningGroupRequest gReq : request.getGroups()) {
            QuizGroup group = new QuizGroup();
            group.setOrderIndex(gReq.getOrderIndex());
            group.setType(gReq.getType());
            group.setTranscript(gReq.getTranscript());
            group.setTranslation(gReq.getTranslation());
            group.setLearningLesson(lesson);

            if (Boolean.TRUE.equals(gReq.getHasAudio()) && audios != null && audioIndex < audios.size()) {
                MultipartFile audioFile = audios.get(audioIndex++);
                if (audioFile != null && !audioFile.isEmpty()) {
                    Map<String, String> uploadResult = cloudinaryService.uploadFile(audioFile, "listening/audio");
                    Media audio = new Media();
                    audio.setType(MediaType.AUDIO);
                    audio.setUrl(uploadResult.get("url"));
                    audio.setPublicId(uploadResult.get("publicId"));
                    group.setAudio(audio);
                }
            }

            if (Boolean.TRUE.equals(gReq.getHasImage()) && images != null && imageIndex < images.size()) {
                MultipartFile imageFile = images.get(imageIndex++);
                if (imageFile != null && !imageFile.isEmpty()) {
                    Map<String, String> uploadResult = cloudinaryService.uploadFile(imageFile, "listening/image");
                    Media image = new Media();
                    image.setType(MediaType.IMAGE);
                    image.setUrl(uploadResult.get("url"));
                    image.setPublicId(uploadResult.get("publicId"));
                    group.setImage(image);
                }
            }

            List<QuizQuestion> questions = new ArrayList<>();
            for (CreateListeningLessonRequest.ListeningQuizRequest qReq : gReq.getQuizzes()) {
                QuizQuestion question = new QuizQuestion();
                question.setQuestionText(qReq.getQuestionText());
                question.setTranslation(qReq.getTranslation());
                question.setType("MULTIPLE_CHOICE");
                question.setOrderIndex(qReq.getOrderIndex());
                question.setQuizGroup(group);

                List<QuizOption> options = new ArrayList<>();
                for (CreateListeningLessonRequest.ListeningOptionRequest oReq : qReq.getOptions()) {
                    QuizOption option = new QuizOption();
                    option.setOrderIndex(oReq.getOrderIndex());
                    option.setOptionText(oReq.getOptionText());
                    option.setIsCorrect(oReq.getIsCorrect());
                    option.setQuizQuestion(question);
                    options.add(option);
                }
                question.setQuizOptions(options);
                questions.add(question);
            }
            group.setQuizQuestions(questions);
            groups.add(group);
        }

        lesson.setQuizGroups(groups);
        lesson = learningLessonRepository.save(lesson);
        return getListeningLessonDetail(lesson.getId());
    }

    @Override
    public void deleteListeningLesson(Long id) throws IOException {
        LearningLesson lesson = learningLessonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
        userLessonProgressRepository.deleteByLearningLessonId(id);
        for (QuizGroup group : lesson.getQuizGroups()) {
            if (group.getAudio() != null) {
                cloudinaryService.deleteImage(group.getAudio().getPublicId());
            }
            if (group.getImage() != null) {
                cloudinaryService.deleteImage(group.getImage().getPublicId());
            }
            for (QuizQuestion q : group.getQuizQuestions()) {
                userQuizAnswerRepository.deleteByQuizQuestionId(q.getId());
                for (QuizOption o : q.getQuizOptions()) {
                    userQuizAnswerRepository.deleteByQuizOptionId(o.getId());
                }
            }
        }
        learningLessonRepository.delete(lesson);
    }

    @Override
    public ListeningLessonDetailResponse updateListeningLesson(Long id,
                                                               UpdateListeningLessonRequest request,
                                                               List<MultipartFile> audios,
                                                               List<MultipartFile> images) throws IOException {
        LearningLesson lesson = learningLessonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
        Iterator<QuizGroup> gIterator = lesson.getQuizGroups().iterator();
        while (gIterator.hasNext()) {
            QuizGroup oldGroup = gIterator.next();
            boolean stillExists = request.getGroups().stream()
                    .anyMatch(g -> g.getId() != null && g.getId().equals(oldGroup.getId()));
            if (!stillExists) {
                if (oldGroup.getAudio() != null) cloudinaryService.deleteImage(oldGroup.getAudio().getPublicId());
                if (oldGroup.getImage() != null) cloudinaryService.deleteImage(oldGroup.getImage().getPublicId());
                for (QuizQuestion q : oldGroup.getQuizQuestions()) {
                    userQuizAnswerRepository.deleteByQuizQuestionId(q.getId());
                    for (QuizOption o : q.getQuizOptions()) {
                        userQuizAnswerRepository.deleteByQuizOptionId(o.getId());
                    }
                }
                gIterator.remove();
            }
        }
        int audioIndex = 0;
        int imageIndex = 0;
        for (UpdateListeningLessonRequest.UpdateListeningGroupRequest gReq : request.getGroups()) {
            QuizGroup group = lesson.getQuizGroups().stream()
                    .filter(gr -> gr.getId().equals(gReq.getId()))
                    .findFirst()
                    .orElse(new QuizGroup());

            group.setId(gReq.getId());
            group.setOrderIndex(gReq.getOrderIndex());
            group.setType(gReq.getType());
            group.setTranscript(gReq.getTranscript());
            group.setTranslation(gReq.getTranslation());
            group.setLearningLesson(lesson);
            if (Boolean.TRUE.equals(gReq.getHasAudio()) && audios != null && audioIndex < audios.size()) {
                MultipartFile audioFile = audios.get(audioIndex++);
                if (audioFile != null && !audioFile.isEmpty()) {
                    if (group.getAudio() != null) {
                        cloudinaryService.deleteImage(group.getAudio().getPublicId());
                    }
                    Map<String, String> uploadResult = cloudinaryService.uploadFile(audioFile, "listening/audio");
                    Media audio = new Media();
                    audio.setUrl(uploadResult.get("url"));
                    audio.setPublicId(uploadResult.get("publicId"));
                    audio.setType(MediaType.AUDIO);
                    group.setAudio(audio);
                }
            } else if (Boolean.TRUE.equals(gReq.getDeleteAudio())) {
                if (group.getAudio() != null) {
                    cloudinaryService.deleteImage(group.getAudio().getPublicId());
                }
                group.setAudio(null);
            }

            if (Boolean.TRUE.equals(gReq.getHasImage()) && images != null && imageIndex < images.size()) {
                MultipartFile imageFile = images.get(imageIndex++);
                if (imageFile != null && !imageFile.isEmpty()) {
                    if (group.getImage() != null) {
                        cloudinaryService.deleteImage(group.getImage().getPublicId());
                    }
                    Map<String, String> uploadResult = cloudinaryService.uploadFile(imageFile, "listening/image");
                    Media image = new Media();
                    image.setUrl(uploadResult.get("url"));
                    image.setPublicId(uploadResult.get("publicId"));
                    image.setType(MediaType.IMAGE);
                    group.setImage(image);
                }
            } else if (Boolean.TRUE.equals(gReq.getDeleteImage())) {
                if (group.getImage() != null) {
                    cloudinaryService.deleteImage(group.getImage().getPublicId());
                }
                group.setImage(null);
            }

            Iterator<QuizQuestion> qIterator = group.getQuizQuestions().iterator();
            while (qIterator.hasNext()) {
                QuizQuestion oldQ = qIterator.next();
                boolean stillExists = gReq.getQuizzes().stream()
                        .anyMatch(q -> q.getId() != null && q.getId().equals(oldQ.getId()));
                if (!stillExists) {
                    userQuizAnswerRepository.deleteByQuizQuestionId(oldQ.getId());
                    for (QuizOption o : oldQ.getQuizOptions()) {
                        userQuizAnswerRepository.deleteByQuizOptionId(o.getId());
                    }
                    qIterator.remove();
                }
            }

            for (UpdateListeningLessonRequest.UpdateListeningQuizRequest qReq : gReq.getQuizzes()) {
                QuizQuestion question = group.getQuizQuestions().stream()
                        .filter(q -> q.getId().equals(qReq.getId()))
                        .findFirst()
                        .orElse(new QuizQuestion());

                question.setId(qReq.getId());
                question.setQuestionText(qReq.getQuestionText());
                question.setTranslation(qReq.getTranslation());
                question.setType("MULTIPLE_CHOICE");
                question.setOrderIndex(qReq.getOrderIndex());
                question.setQuizGroup(group);

                Iterator<QuizOption> oIterator = question.getQuizOptions().iterator();
                while (oIterator.hasNext()) {
                    QuizOption oldO = oIterator.next();
                    boolean stillExists = qReq.getOptions().stream()
                            .anyMatch(o -> o.getId() != null && o.getId().equals(oldO.getId()));
                    if (!stillExists) {
                        userQuizAnswerRepository.deleteByQuizOptionId(oldO.getId());
                        oIterator.remove();
                    }
                }

                for (UpdateListeningLessonRequest.UpdateListeningOptionRequest oReq : qReq.getOptions()) {
                    QuizOption option = question.getQuizOptions().stream()
                            .filter(o -> o.getId().equals(oReq.getId()))
                            .findFirst()
                            .orElse(new QuizOption());

                    option.setId(oReq.getId());
                    option.setOrderIndex(oReq.getOrderIndex());
                    option.setOptionText(oReq.getOptionText());
                    option.setIsCorrect(oReq.getIsCorrect());
                    option.setQuizQuestion(question);

                    if (!question.getQuizOptions().contains(option)) {
                        question.getQuizOptions().add(option);
                    }
                }

                if (!group.getQuizQuestions().contains(question)) {
                    group.getQuizQuestions().add(question);
                }
            }

            if (!lesson.getQuizGroups().contains(group)) {
                lesson.getQuizGroups().add(group);
            }
        }
        lesson.setTitle(request.getTitle());
        lesson.setType("LISTENING_PART_" + request.getPart());
        lesson = learningLessonRepository.save(lesson);
        return getListeningLessonDetail(lesson.getId());
    }

    @Override
    public PageResponse<BilingualResponse> searchBilingual(
            String keyword,
            Pageable pageable,
            String _sort,
            String readFilter,
            UserPrincipal userPrincipal
    ) {
        Long userId = userPrincipal.getId();
        Page<LearningLesson> responsesPage;

        if ("read".equals(readFilter)) {
            responsesPage = switch (_sort) {
                case "oldest" -> learningLessonRepository.findBilingualReadOldest(keyword, userId, pageable);
                case "popular" -> learningLessonRepository.findBilingualReadPopular(keyword, userId, pageable);
                default -> learningLessonRepository.findBilingualReadNewest(keyword, userId, pageable);
            };
        } else if ("unread".equals(readFilter)) {
            responsesPage = switch (_sort) {
                case "oldest" -> learningLessonRepository.findBilingualUnreadOldest(keyword, userId, pageable);
                case "popular" -> learningLessonRepository.findBilingualUnreadPopular(keyword, userId, pageable);
                default -> learningLessonRepository.findBilingualUnreadNewest(keyword, userId, pageable);
            };
        } else {
            responsesPage = switch (_sort) {
                case "oldest" -> learningLessonRepository.findBilingualOldest(keyword, pageable);
                case "popular" -> learningLessonRepository.findBilingualPopular(keyword, pageable);
                default -> learningLessonRepository.findBilingualNewest(keyword, pageable);
            };
        }

        List<Long> lessonIds = responsesPage.getContent()
                .stream().map(LearningLesson::getId).collect(Collectors.toList());
        Set<Long> readIds = lessonIds.isEmpty()
                ? Collections.emptySet()
                : new HashSet<>(learningLessonRepository.findReadLessonIds(userId, lessonIds));

        List<BilingualResponse> content = responsesPage.getContent().stream()
                .map(l -> BilingualResponse.builder()
                        .id(l.getId())
                        .title(l.getTitle())
                        .description(l.getDescription())
                        .content(l.getContent())
                        .media(l.getImage() != null
                                ? new BilingualResponse.Media(l.getImage().getUrl())
                                : null)
                        .isRead(readIds.contains(l.getId()))
                        .build())
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

    public BilingualResponse getBilingualById(Long id) {
        LearningLesson lesson = learningLessonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        return new BilingualResponse(
                lesson.getId(),
                lesson.getTitle(),
                lesson.getDescription(),
                lesson.getContent(),
                lesson.getImage() != null ? new BilingualResponse.Media(lesson.getImage().getUrl()) : null,
                null
        );
    }

    @Override
    public BilingualResponse getBilingualDetail(Long lessonId, Long userId) {

        LearningLesson l = learningLessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        boolean isRead = userLessonProgressRepository
                .existsByUserIdAndLearningLessonIdAndIsCompletedTrue(userId, lessonId);

        return BilingualResponse.builder()
                .id(l.getId())
                .title(l.getTitle())
                .description(l.getDescription())
                .content(l.getContent())
                .media(l.getImage() != null
                        ? new BilingualResponse.Media(l.getImage().getUrl())
                        : null)
                .isRead(isRead)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<GrammarTopicResponse> getGrammarTopics(UserPrincipal userPrincipal) {
        List<LearningLesson> topics = learningLessonRepository.findByTypeOrderByIdAsc(GRAMMAR_TOPIC_TYPE);
        List<LearningLesson> grammarLessons = learningLessonRepository.findByTypeOrderByIdAsc(GRAMMAR_LESSON_TYPE);

        Map<Long, GrammarLessonState> lessonStateMap = buildGrammarLessonStateMap(
            userPrincipal.getId(),
            grammarLessons);

        return topics.stream().map(topic -> {
            List<LearningLesson> topicLessons = grammarLessons.stream()
                    .filter(lesson -> topic.getId().equals(readLongContent(lesson.getContent(), "topicId")))
                    .sorted(grammarOrderComparator())
                    .toList();

            int totalLessons = topicLessons.size();
            int completedLessons = (int) topicLessons.stream()
                    .filter(lesson -> lessonStateMap.getOrDefault(lesson.getId(), GrammarLessonState.NOT_STARTED)
                        == GrammarLessonState.COMPLETED)
                    .count();
            int progressPercent = totalLessons == 0 ? 0 : (completedLessons * 100) / totalLessons;

            return GrammarTopicResponse.builder()
                    .id(topic.getId())
                    .title(topic.getTitle())
                    .description(topic.getDescription())
                    .progressLabel(completedLessons + "/" + totalLessons + " Đã học")
                    .progressPercent(progressPercent)
                    .build();
        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public GrammarTopicDetailResponse getGrammarTopicDetail(Long topicId, UserPrincipal userPrincipal) {
        LearningLesson topic = getLearningLessonByType(topicId, GRAMMAR_TOPIC_TYPE);
        List<LearningLesson> grammarLessons = learningLessonRepository.findByTypeOrderByIdAsc(GRAMMAR_LESSON_TYPE).stream()
                .filter(lesson -> topic.getId().equals(readLongContent(lesson.getContent(), "topicId")))
                .sorted(grammarOrderComparator())
                .toList();

        Map<Long, GrammarLessonState> lessonStateMap = buildGrammarLessonStateMap(
            userPrincipal.getId(),
            grammarLessons);

        List<GrammarTopicDetailResponse.SubLessonResponse> subLessons = grammarLessons.stream()
                .map(lesson -> {
                    String status;
                    GrammarLessonState state = lessonStateMap.getOrDefault(lesson.getId(), GrammarLessonState.NOT_STARTED);
                    if (state == GrammarLessonState.NOT_STARTED) {
                        status = "Chưa học";
                    } else if (state == GrammarLessonState.COMPLETED) {
                        status = "Đã xong";
                    } else {
                        status = "Đang học";
                    }
                    return GrammarTopicDetailResponse.SubLessonResponse.builder()
                            .id(lesson.getId())
                            .title(lesson.getTitle())
                            .subTitle(readStringContent(lesson.getContent(), "engTitle"))
                            .status(status)
                            .build();
                })
                .toList();

        int totalLessons = grammarLessons.size();
        int completedLessons = (int) grammarLessons.stream()
                .filter(lesson -> lessonStateMap.getOrDefault(lesson.getId(), GrammarLessonState.NOT_STARTED)
                        == GrammarLessonState.COMPLETED)
                .count();

        return GrammarTopicDetailResponse.builder()
                .topicId(topic.getId())
                .title(topic.getTitle())
                .description(topic.getDescription())
                .progressLabel(completedLessons + "/" + totalLessons + " Đã học")
                .progressPercent(totalLessons == 0 ? 0 : (completedLessons * 100) / totalLessons)
                .subLessons(subLessons)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public GrammarLessonDetailResponse getGrammarLessonDetail(Long lessonId, UserPrincipal userPrincipal) {
        LearningLesson lesson = getLearningLessonByType(lessonId, GRAMMAR_LESSON_TYPE);

        List<LearningLesson> allPractices = learningLessonRepository.findByTypeOrderByIdAsc(GRAMMAR_PRACTICE_TYPE);
        Map<Long, Long> grammarLessonIdByPracticeId = resolveGrammarLessonIdByPractice(allPractices);

        List<LearningLesson> practices = allPractices.stream()
                .filter(practice -> lessonId.equals(grammarLessonIdByPracticeId.get(practice.getId())))
                .sorted(grammarOrderComparator())
                .toList();

        Map<Long, UserLessonProgress> practiceProgressMap = loadProgressMap(
                userPrincipal.getId(),
                practices.stream().map(LearningLesson::getId).toList());

        List<GrammarPracticeTaskResponse> practiceTasks = buildPracticeTaskResponses(practices, practiceProgressMap);

        Long suggestedPracticeId = practiceTasks.stream()
                .filter(task -> "ACTIVE".equals(task.getType()))
                .map(GrammarPracticeTaskResponse::getId)
                .findFirst()
                .orElse(practiceTasks.stream().map(GrammarPracticeTaskResponse::getId).findFirst().orElse(null));

        return GrammarLessonDetailResponse.builder()
                .id(lesson.getId())
                .title(lesson.getTitle())
                .engTitle(readStringContent(lesson.getContent(), "engTitle"))
                .description(lesson.getDescription())
                .sections(readSections(lesson.getContent()))
                .suggestedPracticeId(suggestedPracticeId)
                .practiceTasks(practiceTasks)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<GrammarPracticeOverviewResponse> getGrammarPracticeOverview(UserPrincipal userPrincipal) {
        List<LearningLesson> grammarLessons = learningLessonRepository.findByTypeOrderByIdAsc(GRAMMAR_LESSON_TYPE);
        List<LearningLesson> allPractices = learningLessonRepository.findByTypeOrderByIdAsc(GRAMMAR_PRACTICE_TYPE);

        Map<Long, Long> grammarLessonIdByPracticeId = resolveGrammarLessonIdByPractice(allPractices);
        Map<Long, List<LearningLesson>> practicesByLessonId = new HashMap<>();
        for (LearningLesson practice : allPractices) {
            Long grammarLessonId = grammarLessonIdByPracticeId.get(practice.getId());
            if (grammarLessonId != null) {
                practicesByLessonId.computeIfAbsent(grammarLessonId, ignored -> new ArrayList<>()).add(practice);
            }
        }

        Map<Long, UserLessonProgress> practiceProgressMap = loadProgressMap(
                userPrincipal.getId(),
                allPractices.stream().map(LearningLesson::getId).toList());

        return grammarLessons.stream()
                .filter(lesson -> practicesByLessonId.containsKey(lesson.getId()))
                .sorted(grammarOrderComparator())
                .map(lesson -> {
                    List<LearningLesson> practices = practicesByLessonId.get(lesson.getId()).stream()
                            .sorted(grammarOrderComparator())
                            .toList();
                    List<GrammarPracticeTaskResponse> tasks = buildPracticeTaskResponses(practices, practiceProgressMap);

                    int completed = (int) tasks.stream().filter(task -> "COMPLETED".equals(task.getType())).count();
                    int overallProgress = tasks.isEmpty() ? 0 : (completed * 100) / tasks.size();

                    return GrammarPracticeOverviewResponse.builder()
                            .id(lesson.getId())
                            .title("Bài tập " + lesson.getTitle())
                            .description(lesson.getDescription())
                            .overallProgress(overallProgress)
                            .tasks(tasks)
                            .build();
                })
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public GrammarPracticeDetailResponse getGrammarPracticeDetail(Long practiceId, UserPrincipal userPrincipal) {
        LearningLesson selectedPractice = getLearningLessonByType(practiceId, GRAMMAR_PRACTICE_TYPE);
        List<LearningLesson> allPractices = learningLessonRepository.findByTypeOrderByIdAsc(GRAMMAR_PRACTICE_TYPE);
        Map<Long, Long> grammarLessonIdByPracticeId = resolveGrammarLessonIdByPractice(allPractices);

        Long grammarLessonId = grammarLessonIdByPracticeId.get(practiceId);
        LearningLesson grammarLesson = grammarLessonId == null
                ? null
                : learningLessonRepository.findById(grammarLessonId).orElse(null);

        List<LearningLesson> siblingPractices = allPractices.stream()
                .filter(practice -> Objects.equals(grammarLessonIdByPracticeId.get(practice.getId()), grammarLessonId))
                .sorted(grammarOrderComparator())
                .toList();
        if (siblingPractices.isEmpty()) {
            siblingPractices = List.of(selectedPractice);
        }

        Map<Long, UserLessonProgress> practiceProgressMap = loadProgressMap(
                userPrincipal.getId(),
                siblingPractices.stream().map(LearningLesson::getId).toList());

        List<GrammarPracticeTaskResponse> tasks = buildPracticeTaskResponses(siblingPractices, practiceProgressMap);
        GrammarPracticeTaskResponse currentTask = tasks.stream()
                .filter(task -> Objects.equals(task.getId(), practiceId))
                .findFirst()
                .orElseGet(() -> buildPracticeTaskResponses(List.of(selectedPractice), practiceProgressMap).stream()
                        .findFirst()
                        .orElse(null));

        int completed = (int) tasks.stream().filter(task -> "COMPLETED".equals(task.getType())).count();
        int overallProgress = tasks.isEmpty() ? 0 : (completed * 100) / tasks.size();

        return GrammarPracticeDetailResponse.builder()
                .practiceId(practiceId)
                .title(selectedPractice.getTitle())
                .lessonTitle(grammarLesson != null ? grammarLesson.getTitle() : "Ôn luyện ngữ pháp")
                .overallProgress(overallProgress)
                .totalQuestions(currentTask != null ? currentTask.getTotalQuestions() : 0)
                .difficulty(currentTask != null ? currentTask.getDifficulty() : null)
                .durationMinutes(currentTask != null ? currentTask.getDurationMinutes() : null)
                .tasks(tasks)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public GrammarPracticeQuizResponse getGrammarPracticeQuiz(Long practiceId) {
        LearningLesson practice = getLearningLessonByType(practiceId, GRAMMAR_PRACTICE_TYPE);
        List<QuizQuestion> questions = quizQuestionRepository.findByLearningLessonIdOrderByGroupAndQuestion(practiceId);

        List<GrammarPracticeQuizResponse.QuestionResponse> questionResponses = questions.stream()
                .map(question -> GrammarPracticeQuizResponse.QuestionResponse.builder()
                        .quizId(question.getId())
                        .questionText(question.getQuestionText())
                        .type(question.getType())
                        .explanation(question.getTranslation())
                        .options(question.getQuizOptions() == null ? Collections.emptyList() : question.getQuizOptions().stream()
                                .sorted(Comparator.comparing(QuizOption::getOrderIndex))
                                .map(option -> GrammarPracticeQuizResponse.OptionResponse.builder()
                                        .optionId(option.getId())
                                        .optionText(option.getOptionText())
                                        .orderIndex(option.getOrderIndex())
                                        .build())
                                .toList())
                        .build())
                .toList();

        return GrammarPracticeQuizResponse.builder()
                .practiceId(practiceId)
                .title(practice.getTitle())
                .totalQuestions(questionResponses.size())
                .questions(questionResponses)
                .build();
    }

    @Override
    public void submitGrammarPractice(UserPrincipal userPrincipal, Long practiceId, SubmitGrammarPracticeRequest request,
                                      boolean isCompleted) {
        User user = userRepository.findById(userPrincipal.getId())
            .or(() -> userRepository.findByEmail(userPrincipal.getUsername()))
            .orElseThrow(() -> new ResourceNotFoundException("User", "id/email", userPrincipal.getId() + "/" + userPrincipal.getUsername()));
        getLearningLessonByType(practiceId, GRAMMAR_PRACTICE_TYPE);

        List<QuizQuestion> questions = quizQuestionRepository.findByLearningLessonIdOrderByGroupAndQuestion(practiceId);
        Map<Long, QuizQuestion> questionById = questions.stream()
                .collect(Collectors.toMap(QuizQuestion::getId, Function.identity()));

        Map<Long, SubmitGrammarPracticeRequest.Answer> submittedByQuestion = new LinkedHashMap<>();
        if (request != null && request.getAnswers() != null) {
            for (SubmitGrammarPracticeRequest.Answer answer : request.getAnswers()) {
                if (answer != null && answer.getQuizId() != null && questionById.containsKey(answer.getQuizId())) {
                    submittedByQuestion.put(answer.getQuizId(), answer);
                }
            }
        }

        List<UserQuizAnswer> existingAnswers = userQuizAnswerRepository.findByUserIdAndLessonId(user.getId(), practiceId);
        Map<Long, UserQuizAnswer> existingByQuestion = existingAnswers.stream()
                .collect(Collectors.toMap(answer -> answer.getQuizQuestion().getId(), Function.identity(), (a, b) -> a));

        for (UserQuizAnswer existing : existingAnswers) {
            SubmitGrammarPracticeRequest.Answer submitted = submittedByQuestion.get(existing.getQuizQuestion().getId());
            if (submitted == null || isBlankGrammarSubmission(submitted, existing.getQuizQuestion())) {
                userQuizAnswerRepository.delete(existing);
                existingByQuestion.remove(existing.getQuizQuestion().getId());
            }
        }

        for (Map.Entry<Long, SubmitGrammarPracticeRequest.Answer> entry : submittedByQuestion.entrySet()) {
            QuizQuestion question = questionById.get(entry.getKey());
            SubmitGrammarPracticeRequest.Answer submitted = entry.getValue();

            if (question == null || isBlankGrammarSubmission(submitted, question)) {
                continue;
            }

            UserQuizAnswer answer = existingByQuestion.get(question.getId());
            if (answer == null) {
                answer = UserQuizAnswer.builder()
                        .user(user)
                        .quizQuestion(question)
                        .build();
            }

            if (isFillInBlankType(question.getType())) {
                answer.setQuizOption(null);
                answer.setTextAnswer(safeTrim(submitted.getTextAnswer()));
            } else {
                QuizOption selectedOption = quizOptionRepository.findById(submitted.getOptionId())
                        .orElseThrow(() -> new RuntimeException("Option not found"));
                if (!selectedOption.getQuizQuestion().getId().equals(question.getId())) {
                    throw new RuntimeException("Option does not belong to question " + question.getId());
                }
                answer.setQuizOption(selectedOption);
                answer.setTextAnswer(null);
            }

            userQuizAnswerRepository.save(answer);
        }

        List<UserQuizAnswer> finalAnswers = userQuizAnswerRepository.findByUserIdAndLessonId(user.getId(), practiceId);
        int totalQuestions = questions.size();
        int answeredCount = (int) finalAnswers.stream()
                .filter(ans -> ans.getQuizOption() != null || !isBlank(ans.getTextAnswer()))
                .count();
        int score = calculateGrammarScore(questions, finalAnswers);

        UserLessonProgress progress = userLessonProgressRepository.findByUserIdAndLearningLessonId(user.getId(), practiceId);
        if (progress == null) {
            LearningLesson practice = learningLessonRepository.findById(practiceId)
                    .orElseThrow(() -> new RuntimeException("Practice not found"));
            progress = UserLessonProgress.builder()
                    .user(user)
                    .learningLesson(practice)
                    .build();
        }

        progress.setIsCompleted(isCompleted);
        if (isCompleted) {
            progress.setProgressPercent(100.0);
            progress.setScore(score);
            progress.setCompletedAt(LocalDateTime.now());
        } else {
            progress.setProgressPercent(totalQuestions == 0 ? 0.0 : (answeredCount * 100.0) / totalQuestions);
            progress.setScore(null);
            progress.setCompletedAt(null);
        }

        userLessonProgressRepository.save(progress);
    }

    @Override
    @Transactional(readOnly = true)
    public GrammarPracticeSubmissionResponse getGrammarPracticeSubmission(UserPrincipal userPrincipal, Long practiceId) {
        getLearningLessonByType(practiceId, GRAMMAR_PRACTICE_TYPE);
        List<UserQuizAnswer> userAnswers = userQuizAnswerRepository.findByUserIdAndLessonId(userPrincipal.getId(), practiceId);

        List<GrammarPracticeSubmissionResponse.AnswerResponse> answers = userAnswers.stream()
                .sorted(Comparator.comparing(answer -> answer.getQuizQuestion().getId()))
                .map(answer -> GrammarPracticeSubmissionResponse.AnswerResponse.builder()
                        .quizId(answer.getQuizQuestion().getId())
                        .optionId(answer.getQuizOption() != null ? answer.getQuizOption().getId() : null)
                        .textAnswer(answer.getTextAnswer())
                        .build())
                .toList();

        return GrammarPracticeSubmissionResponse.builder()
                .practiceId(practiceId)
                .answers(answers)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public GrammarPracticeResultResponse getGrammarPracticeResult(UserPrincipal userPrincipal, Long practiceId) {
        LearningLesson practice = getLearningLessonByType(practiceId, GRAMMAR_PRACTICE_TYPE);
        List<QuizQuestion> questions = quizQuestionRepository.findByLearningLessonIdOrderByGroupAndQuestion(practiceId);
        List<UserQuizAnswer> userAnswers = userQuizAnswerRepository.findByUserIdAndLessonId(userPrincipal.getId(), practiceId);

        Map<Long, UserQuizAnswer> userAnswerByQuestion = userAnswers.stream()
                .collect(Collectors.toMap(answer -> answer.getQuizQuestion().getId(), Function.identity(), (a, b) -> a));

        Map<Long, String> correctTextByQuestion = quizAnswerRepository
                .findByQuizQuestionIdIn(questions.stream().map(QuizQuestion::getId).toList())
                .stream()
                .collect(Collectors.toMap(answer -> answer.getQuizQuestion().getId(), QuizAnswer::getAnswerText, (a, b) -> a));

        int score = 0;
        List<GrammarPracticeResultResponse.QuestionResult> questionResults = new ArrayList<>();

        for (QuizQuestion question : questions) {
            UserQuizAnswer userAnswer = userAnswerByQuestion.get(question.getId());
            boolean isFillQuestion = isFillInBlankType(question.getType());
            boolean correct;

            Long userOptionId = userAnswer != null && userAnswer.getQuizOption() != null
                    ? userAnswer.getQuizOption().getId()
                    : null;
            String userTextAnswer = userAnswer != null ? userAnswer.getTextAnswer() : null;

            Long correctOptionId = null;
            String correctTextAnswer = null;

            List<GrammarPracticeResultResponse.OptionResult> optionResults = question.getQuizOptions() == null
                    ? Collections.emptyList()
                    : question.getQuizOptions().stream()
                    .sorted(Comparator.comparing(QuizOption::getOrderIndex))
                    .map(option -> {
                        if (Boolean.TRUE.equals(option.getIsCorrect())) {
                            // holder value, used below
                        }
                        return GrammarPracticeResultResponse.OptionResult.builder()
                                .optionId(option.getId())
                                .optionText(option.getOptionText())
                                .isCorrect(Boolean.TRUE.equals(option.getIsCorrect()))
                                .build();
                    })
                    .toList();

            if (isFillQuestion) {
                correctTextAnswer = correctTextByQuestion.get(question.getId());
                correct = !isBlank(userTextAnswer)
                        && normalizeAnswer(userTextAnswer).equals(normalizeAnswer(correctTextAnswer));
            } else {
                Optional<QuizOption> correctOption = question.getQuizOptions() == null
                        ? Optional.empty()
                        : question.getQuizOptions().stream().filter(opt -> Boolean.TRUE.equals(opt.getIsCorrect())).findFirst();
                if (correctOption.isPresent()) {
                    correctOptionId = correctOption.get().getId();
                    correctTextAnswer = correctOption.get().getOptionText();
                }
                correct = userOptionId != null && Objects.equals(userOptionId, correctOptionId);
            }

            if (correct) {
                score++;
            }

            questionResults.add(GrammarPracticeResultResponse.QuestionResult.builder()
                    .quizId(question.getId())
                    .questionText(question.getQuestionText())
                    .type(question.getType())
                    .explanation(question.getTranslation())
                    .userOptionId(userOptionId)
                    .userTextAnswer(userTextAnswer)
                    .correctOptionId(correctOptionId)
                    .correctTextAnswer(correctTextAnswer)
                    .correct(correct)
                    .options(optionResults)
                    .build());
        }

        return GrammarPracticeResultResponse.builder()
                .practiceId(practiceId)
                .title(practice.getTitle())
                .totalQuestions(questions.size())
                .score(score)
                .questions(questionResults)
                .build();
    }

    private LearningLesson getLearningLessonByType(Long id, String type) {
        LearningLesson lesson = learningLessonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LearningLesson", "id", id));
        if (!type.equals(lesson.getType())) {
            throw new ResourceNotFoundException("LearningLesson", "id", id);
        }
        return lesson;
    }

    private Map<Long, UserLessonProgress> loadProgressMap(Long userId, List<Long> lessonIds) {
        if (lessonIds == null || lessonIds.isEmpty()) {
            return Collections.emptyMap();
        }
        return userLessonProgressRepository.findByUserIdAndLearningLessonIdIn(userId, lessonIds).stream()
                .collect(Collectors.toMap(progress -> progress.getLearningLesson().getId(), Function.identity(), (a, b) -> a));
    }

    private Comparator<LearningLesson> grammarOrderComparator() {
        return Comparator
                .comparing((LearningLesson lesson) -> Optional.ofNullable(readIntegerContent(lesson.getContent(), "order"))
                        .orElse(Integer.MAX_VALUE))
                .thenComparing(LearningLesson::getId);
    }

    private Map<Long, Long> resolveGrammarLessonIdByPractice(List<LearningLesson> practices) {
        List<LearningLesson> grammarLessons = learningLessonRepository.findByTypeOrderByIdAsc(GRAMMAR_LESSON_TYPE);
        Map<String, Long> lessonIdByTitle = grammarLessons.stream()
                .collect(Collectors.toMap(LearningLesson::getTitle, LearningLesson::getId, (a, b) -> a));

        Map<Long, Long> result = new HashMap<>();
        for (LearningLesson practice : practices) {
            Long grammarLessonId = readLongContent(practice.getContent(), "grammarLessonId");
            if (grammarLessonId == null) {
                String lessonTitle = readStringContent(practice.getContent(), "grammarLessonTitle");
                grammarLessonId = lessonIdByTitle.get(lessonTitle);
            }
            result.put(practice.getId(), grammarLessonId);
        }
        return result;
    }

    private Map<Long, GrammarLessonState> buildGrammarLessonStateMap(Long userId, List<LearningLesson> grammarLessons) {
        if (grammarLessons == null || grammarLessons.isEmpty()) {
            return Collections.emptyMap();
        }

        List<Long> grammarLessonIds = grammarLessons.stream().map(LearningLesson::getId).toList();
        Map<Long, UserLessonProgress> grammarLessonProgressMap = loadProgressMap(userId, grammarLessonIds);

        List<LearningLesson> allPractices = learningLessonRepository.findByTypeOrderByIdAsc(GRAMMAR_PRACTICE_TYPE);
        Map<Long, Long> grammarLessonIdByPracticeId = resolveGrammarLessonIdByPractice(allPractices);
        Map<Long, List<Long>> practiceIdsByGrammarLessonId = new HashMap<>();
        for (LearningLesson practice : allPractices) {
            Long lessonId = grammarLessonIdByPracticeId.get(practice.getId());
            if (lessonId != null) {
                practiceIdsByGrammarLessonId.computeIfAbsent(lessonId, ignored -> new ArrayList<>())
                        .add(practice.getId());
            }
        }

        Map<Long, UserLessonProgress> practiceProgressMap = loadProgressMap(
                userId,
                allPractices.stream().map(LearningLesson::getId).toList());

        Map<Long, GrammarLessonState> stateMap = new HashMap<>();
        for (LearningLesson lesson : grammarLessons) {
            Long lessonId = lesson.getId();
            UserLessonProgress lessonProgress = grammarLessonProgressMap.get(lessonId);

            boolean lessonCompleted = lessonProgress != null && Boolean.TRUE.equals(lessonProgress.getIsCompleted());
            if (lessonCompleted) {
                stateMap.put(lessonId, GrammarLessonState.COMPLETED);
                continue;
            }

            List<Long> practiceIds = practiceIdsByGrammarLessonId.getOrDefault(lessonId, Collections.emptyList());
            int practiceCount = practiceIds.size();
            int completedPracticeCount = 0;
            int attemptedPracticeCount = 0;

            for (Long practiceId : practiceIds) {
                UserLessonProgress practiceProgress = practiceProgressMap.get(practiceId);
                if (practiceProgress == null) {
                    continue;
                }
                attemptedPracticeCount++;
                if (Boolean.TRUE.equals(practiceProgress.getIsCompleted())) {
                    completedPracticeCount++;
                }
            }

            if (practiceCount > 0 && completedPracticeCount == practiceCount) {
                stateMap.put(lessonId, GrammarLessonState.COMPLETED);
            } else if (lessonProgress != null || attemptedPracticeCount > 0) {
                stateMap.put(lessonId, GrammarLessonState.IN_PROGRESS);
            } else {
                stateMap.put(lessonId, GrammarLessonState.NOT_STARTED);
            }
        }

        return stateMap;
    }

    private List<GrammarPracticeTaskResponse> buildPracticeTaskResponses(
            List<LearningLesson> practices,
            Map<Long, UserLessonProgress> progressByPracticeId) {
        if (practices == null || practices.isEmpty()) {
            return Collections.emptyList();
        }

        List<LearningLesson> orderedPractices = practices.stream()
                .sorted(grammarOrderComparator())
                .toList();

        Long activePracticeId = orderedPractices.stream()
                .filter(practice -> {
                    UserLessonProgress progress = progressByPracticeId.get(practice.getId());
                    return progress == null || !Boolean.TRUE.equals(progress.getIsCompleted());
                })
                .map(LearningLesson::getId)
                .findFirst()
                .orElse(null);

        return orderedPractices.stream().map(practice -> {
            UserLessonProgress progress = progressByPracticeId.get(practice.getId());
            boolean isCompleted = progress != null && Boolean.TRUE.equals(progress.getIsCompleted());

            int totalQuestions = quizQuestionRepository.findByLearningLessonIdOrderByGroupAndQuestion(practice.getId()).size();
            String type = isCompleted ? "COMPLETED"
                    : Objects.equals(activePracticeId, practice.getId()) ? "ACTIVE" : "LOCKED";

            String scoreText = null;
            if (isCompleted && progress.getScore() != null) {
                scoreText = progress.getScore() + "/" + totalQuestions + " điểm";
            }

            return GrammarPracticeTaskResponse.builder()
                    .id(practice.getId())
                    .title(practice.getTitle())
                    .status(isCompleted ? "Đã làm" : "Chưa làm")
                    .type(type)
                    .score(scoreText)
                    .count(totalQuestions + " câu")
                    .totalQuestions(totalQuestions)
                    .difficulty(readStringContent(practice.getContent(), "difficulty"))
                    .durationMinutes(readIntegerContent(practice.getContent(), "durationMinutes"))
                    .build();
        }).toList();
    }

    private int calculateGrammarScore(List<QuizQuestion> questions, List<UserQuizAnswer> userAnswers) {
        Map<Long, UserQuizAnswer> userAnswerByQuestion = userAnswers.stream()
                .collect(Collectors.toMap(answer -> answer.getQuizQuestion().getId(), Function.identity(), (a, b) -> a));
        Map<Long, String> correctTextByQuestion = quizAnswerRepository
                .findByQuizQuestionIdIn(questions.stream().map(QuizQuestion::getId).toList())
                .stream()
                .collect(Collectors.toMap(answer -> answer.getQuizQuestion().getId(), QuizAnswer::getAnswerText, (a, b) -> a));

        int score = 0;
        for (QuizQuestion question : questions) {
            UserQuizAnswer answer = userAnswerByQuestion.get(question.getId());
            boolean correct;
            if (isFillInBlankType(question.getType())) {
                String correctText = correctTextByQuestion.get(question.getId());
                correct = answer != null
                        && !isBlank(answer.getTextAnswer())
                        && normalizeAnswer(answer.getTextAnswer()).equals(normalizeAnswer(correctText));
            } else {
                correct = answer != null
                        && answer.getQuizOption() != null
                        && Boolean.TRUE.equals(answer.getQuizOption().getIsCorrect());
            }
            if (correct) {
                score++;
            }
        }
        return score;
    }

    private boolean isBlankGrammarSubmission(SubmitGrammarPracticeRequest.Answer answer, QuizQuestion question) {
        if (answer == null) {
            return true;
        }
        if (isFillInBlankType(question.getType())) {
            return isBlank(answer.getTextAnswer());
        }
        return answer.getOptionId() == null;
    }

    private boolean isFillInBlankType(String type) {
        if (type == null) {
            return false;
        }
        String normalized = type.trim().toUpperCase(Locale.ROOT);
        return normalized.contains("FILL") || normalized.contains("ĐIỀN") || normalized.contains("DIEN");
    }

    private String normalizeAnswer(String value) {
        if (value == null) {
            return "";
        }
        return value.trim().replaceAll("\\s+", " ").toLowerCase(Locale.ROOT);
    }

    private String safeTrim(String value) {
        return value == null ? null : value.trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private List<Map<String, Object>> readSections(Map<String, Object> content) {
        if (content == null) {
            return Collections.emptyList();
        }
        Object sections = content.get("sections");
        if (!(sections instanceof List<?> rawList)) {
            return Collections.emptyList();
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Object item : rawList) {
            if (item instanceof Map<?, ?> rawMap) {
                Map<String, Object> mapped = new LinkedHashMap<>();
                for (Map.Entry<?, ?> entry : rawMap.entrySet()) {
                    mapped.put(String.valueOf(entry.getKey()), entry.getValue());
                }
                result.add(mapped);
            }
        }
        return result;
    }

    private Long readLongContent(Map<String, Object> content, String key) {
        if (content == null || key == null) {
            return null;
        }
        Object value = content.get(key);
        if (value instanceof Number number) {
            return number.longValue();
        }
        if (value instanceof String text && !text.isBlank()) {
            try {
                return Long.parseLong(text);
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }

    private Integer readIntegerContent(Map<String, Object> content, String key) {
        Long value = readLongContent(content, key);
        return value == null ? null : value.intValue();
    }

    private String readStringContent(Map<String, Object> content, String key) {
        if (content == null || key == null) {
            return null;
        }
        Object value = content.get(key);
        return value == null ? null : String.valueOf(value);
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

    @Override
    public BilingualResponse createBilingualLesson(CreateBilingualLessonRequest request, MultipartFile file) {
        LearningLesson lesson = new LearningLesson();
        lesson.setTitle(request.getTitle());
        lesson.setDescription(request.getDescription());
        lesson.setType("BILINGUAL");
        LearningActivity activity = learningActivityRepository.findById(3L)
                .orElseThrow(() -> new RuntimeException("Activity not found"));
        lesson.setLearningActivity(activity);
        Map<String, Object> contentMap = new HashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        contentMap.put("createdAt", LocalDateTime.now().format(formatter));
        contentMap.put("views", 0);
        contentMap.put("paragraphs", request.getContent().getParagraphs());
        lesson.setContent(contentMap);
        try {
            if (file != null && !file.isEmpty()) {
                Map<String, String> uploadResult = cloudinaryService.uploadFile(file, "bilingual");
                Media media = new Media();
                media.setUrl(uploadResult.get("url"));
                media.setPublicId(uploadResult.get("publicId"));
                media.setType(MediaType.IMAGE);
                lesson.setImage(media);
            }
        } catch (IOException e) {
            log.error("Failed to upload image from Cloudinary");
        }
        lesson = learningLessonRepository.save(lesson);
        return getBilingualById(lesson.getId());
    }

    @Override
    public BilingualResponse updateBilingualLesson(Long id, CreateBilingualLessonRequest request, MultipartFile file) {
        LearningLesson lesson = learningLessonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
        lesson.setTitle(request.getTitle());
        lesson.setDescription(request.getDescription());
        lesson.setType("BILINGUAL");
        LearningActivity activity = learningActivityRepository.findById(3L)
                .orElseThrow(() -> new RuntimeException("Activity not found"));
        lesson.setLearningActivity(activity);
        Map<String, Object> contentMap = new HashMap<>();
        contentMap.put("createdAt", lesson.getContent().get("createdAt"));
        contentMap.put("views", lesson.getContent().get("views"));
        contentMap.put("paragraphs", request.getContent().getParagraphs());
        lesson.setContent(contentMap);

        try {
            if (file != null && !file.isEmpty()) {
                Map<String, String> uploadResult = cloudinaryService.uploadFile(file, "bilingual");
                Media media = lesson.getImage();
                if (media == null) {
                    media = new Media();
                } else {
                    if (media.getPublicId() != null) {
                        cloudinaryService.deleteImage(media.getPublicId());
                    }
                }
                media.setUrl(uploadResult.get("url"));
                media.setPublicId(uploadResult.get("publicId"));
                media.setType(MediaType.IMAGE);
                lesson.setImage(media);
            }
        } catch (IOException e) {
            log.error("Failed to upload image from Cloudinary");
        }

        lesson = learningLessonRepository.save(lesson);
        return getBilingualById(lesson.getId());
    }

    @Override
    public void deleteBilingualLesson(Long id) {
        LearningLesson lesson = learningLessonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
        userLessonProgressRepository.deleteByLearningLessonId(id);
        if (lesson.getImage() != null && lesson.getImage().getPublicId() != null) {
            try {
                cloudinaryService.deleteImage(lesson.getImage().getPublicId());
            } catch (IOException e) {
                log.error("Failed to delete image from Cloudinary: {}", e.getMessage());
            }
        }
        if (lesson.getImage() != null) {
            mediaRepository.deleteById(lesson.getImage().getId());
            lesson.setImage(null);
        }
        learningLessonRepository.delete(lesson);
    }

    @Override
    public PageResponse<FlashcardLessonSummaryResponse> getAllFlashcardLessons(Pageable pageable) {
        Page<LearningLesson> lessonPage = learningLessonRepository.findByType("FLASHCARD", pageable);
        // Using -1 for userId as Admin is just viewing summaries, not tracking their own progress here
        return mapToFlashcardLessonSummaryPageResponse(lessonPage, -1L);
    }

    @Override
    public void deleteFlashcardLessonAdmin(Long id) {
        LearningLesson lesson = findLessonById(id);
        List<Word> words = wordRepository.findByFlashcardLessonId(id);
        
        // Administrative delete: we don't care about review history as much, we just delete everything
        // But to be safe and consistent with existing logic:
        for (Word word : words) {
            flashcardReviewRepository.deleteByWordId(word.getId());
            wordRepository.deleteById(word.getId());
        }
        
        userLessonProgressRepository.deleteByLearningLessonId(id);
        
        if (lesson.getImage() != null && lesson.getImage().getPublicId() != null) {
            try {
                cloudinaryService.deleteImage(lesson.getImage().getPublicId());
            } catch (IOException e) {
                log.error("Failed to delete image: {}", e.getMessage());
            }
        }
        
        learningLessonRepository.delete(lesson);
    }
}
