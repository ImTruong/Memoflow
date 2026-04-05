package com.memoflow.memoflow.service.impl;

import com.memoflow.memoflow.dto.request.CreateWordRequest;
import com.memoflow.memoflow.dto.request.UpdateWordRequest;
import com.memoflow.memoflow.dto.response.PageResponse;
import com.memoflow.memoflow.dto.response.WordResponse;
import com.memoflow.memoflow.entity.LearningLesson;
import com.memoflow.memoflow.entity.Media;
import com.memoflow.memoflow.entity.enums.MediaType;
import com.memoflow.memoflow.exception.ResourceNotFoundException;
import com.memoflow.memoflow.security.UserPrincipal;
import com.memoflow.memoflow.entity.Word;
import com.memoflow.memoflow.repository.FlashcardReviewRepository;
import com.memoflow.memoflow.repository.LearningLessonRepository;
import com.memoflow.memoflow.repository.WordRepository;
import com.memoflow.memoflow.service.CloudinaryService;
import com.memoflow.memoflow.service.WordService;

import lombok.RequiredArgsConstructor;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class WordServiceImpl implements WordService {

    private final WordRepository wordRepository;
    private final ModelMapper modelMapper;
    private final LearningLessonRepository learningLessonRepository;
    private final CloudinaryService cloudinaryService;
    private final FlashcardReviewRepository flashcardReviewRepository;

    @Override
    public void deleteWord(Long id, UserPrincipal userPrincipal) {
        Word word = findWordById(id);

        if (hasBeenReviewed(word.getId())) {
            softDeleteWord(word);
        } else {
            hardDeleteWord(id);
        }
    }

    /**
     * Check if a word has been reviewed by any user
     */
    private boolean hasBeenReviewed(Long wordId) {
        return !flashcardReviewRepository.findByWordId(wordId).isEmpty();
    }

    /**
     * Soft delete: mark word as deleted (preserves learning history)
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
     * Find word by ID or throw exception
     */
    private Word findWordById(Long id) {
        return wordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Word not found with id: " + id));
    }

    @Override
    public WordResponse createWord(Long flashcardLessonId, CreateWordRequest createWordRequest,
            UserPrincipal userPrincipal) {
        WordResponse wordResponse = null;
        try {
            String imageUrl = null;
            String publicId = null;
            if (createWordRequest.getImage() != null && !createWordRequest.getImage().isEmpty()) {
                Map<String, String> uploadResult = cloudinaryService.uploadFile(createWordRequest.getImage(), "words");
                imageUrl = uploadResult.get("url");
                publicId = uploadResult.get("public_id");
            }
            wordResponse = saveWordToDatabase(flashcardLessonId, createWordRequest, imageUrl, publicId);
        } catch (IOException e) {
            throw new RuntimeException("Error uploading file", e);
        }
        return wordResponse;
    }

    @Override
    public WordResponse updateWord(Long id, UpdateWordRequest updateWordRequest, UserPrincipal userPrincipal) {
        Word word = wordRepository.getReferenceById(id);

        // Manual mapping to avoid modelMapper wiping complex objects or incorrect
        // mappings
        word.setName(updateWordRequest.getName());
        word.setIpa(updateWordRequest.getIpa());
        word.setDefinition(updateWordRequest.getDefinition());
        word.setExample(updateWordRequest.getExample());

        if (updateWordRequest.getImage() != null && !updateWordRequest.getImage().isEmpty()) {
            try {
                Map<String, String> uploadResult = cloudinaryService.uploadFile(updateWordRequest.getImage(), "words");
                Media imageMedia = Media.builder()
                        .url(uploadResult.get("url"))
                        .publicId(uploadResult.get("public_id"))
                        .type(MediaType.IMAGE)
                        .build();
                word.setImage(imageMedia);
            } catch (IOException e) {
                throw new RuntimeException("Error uploading file", e);
            }
        }

        if (updateWordRequest.getAudioUrl() != null && !updateWordRequest.getAudioUrl().isEmpty()) {
            Media audioMedia = Media.builder()
                    .url(updateWordRequest.getAudioUrl())
                    .type(MediaType.AUDIO)
                    .build();
            word.setAudio(audioMedia);
        }

        Word savedWord = wordRepository.save(word);
        WordResponse wordResponse = modelMapper.map(savedWord, WordResponse.class);
        if (savedWord.getAudio() != null) {
            wordResponse.setAudioUrl(savedWord.getAudio().getUrl());
        }
        if (savedWord.getImage() != null) {
            wordResponse.setImageUrl(savedWord.getImage().getUrl());
        }
        wordResponse.setFlashcardLessonId(savedWord.getLearningLesson().getId());
        return wordResponse;
    }

    @Transactional
    public WordResponse saveWordToDatabase(Long flashcardLessonId, CreateWordRequest createWordRequest, String imageUrl,
            String publicId) {
        Word word = modelMapper.map(createWordRequest, Word.class);
        LearningLesson learningLesson = learningLessonRepository
                .getReferenceById(flashcardLessonId);
        word.setLearningLesson(learningLesson);

        if (imageUrl != null && publicId != null) {
            Media imageMedia = Media.builder()
                    .url(imageUrl)
                    .publicId(publicId)
                    .type(MediaType.IMAGE)
                    .build();
            word.setImage(imageMedia);
        }
        if (createWordRequest.getAudioUrl() != null && !createWordRequest.getAudioUrl().isEmpty()) {
            Media audioMedia = Media.builder()
                    .url(createWordRequest.getAudioUrl())
                    .type(MediaType.AUDIO)
                    .build();
            word.setAudio(audioMedia);
        }
        Word savedWord = wordRepository.save(word);
        WordResponse wordResponse = modelMapper.map(savedWord, WordResponse.class);
        if (savedWord.getAudio() != null) {
            wordResponse.setAudioUrl(savedWord.getAudio().getUrl());
        }
        if (savedWord.getImage() != null) {
            wordResponse.setImageUrl(savedWord.getImage().getUrl());
        }
        wordResponse.setFlashcardLessonId(learningLesson.getId());
        return wordResponse;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<WordResponse> getWordsByFlashcardLessonId(Long flashcardLessonId, Pageable pageable,
            UserPrincipal userPrincipal) {
        Page<Word> wordPage = wordRepository.findByFlashcardLessonId(flashcardLessonId, pageable);

        List<WordResponse> wordResponses = wordPage.getContent().stream()
                .map(word -> {
                    WordResponse wordResponse = modelMapper.map(word, WordResponse.class);
                    if (word.getAudio() != null) {
                        wordResponse.setAudioUrl(word.getAudio().getUrl());
                    }
                    if (word.getImage() != null) {
                        wordResponse.setImageUrl(word.getImage().getUrl());
                    }
                    wordResponse.setFlashcardLessonId(word.getLearningLesson().getId());
                    return wordResponse;
                })
                .collect(Collectors.toList());

        return PageResponse.<WordResponse>builder()
                .content(wordResponses)
                .pageNumber(wordPage.getNumber())
                .pageSize(wordPage.getSize())
                .totalElements(wordPage.getTotalElements())
                .totalPages(wordPage.getTotalPages())
                .last(wordPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<WordResponse> searchWordsInLesson(Long flashcardLessonId, String keyword, Pageable pageable,
            UserPrincipal userPrincipal) {
        Page<Word> wordPage = wordRepository.findByFlashcardLessonIdAndName(flashcardLessonId, keyword, pageable);

        List<WordResponse> wordResponses = wordPage.getContent().stream()
                .map(word -> {
                    WordResponse wordResponse = modelMapper.map(word, WordResponse.class);
                    if (word.getAudio() != null) {
                        wordResponse.setAudioUrl(word.getAudio().getUrl());
                    }
                    if (word.getImage() != null) {
                        wordResponse.setImageUrl(word.getImage().getUrl());
                    }
                    wordResponse.setFlashcardLessonId(word.getLearningLesson().getId());
                    return wordResponse;
                })
                .collect(Collectors.toList());

        return PageResponse.<WordResponse>builder()
                .content(wordResponses)
                .pageNumber(wordPage.getNumber())
                .pageSize(wordPage.getSize())
                .totalElements(wordPage.getTotalElements())
                .totalPages(wordPage.getTotalPages())
                .last(wordPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<WordResponse> getDueWordsByFlashcardLessonId(Long flashcardLessonId, Pageable pageable,
            UserPrincipal userPrincipal) {
        LocalDateTime now = LocalDateTime.now();
        Page<Word> wordPage = wordRepository.findDueWordsByLessonAndUser(flashcardLessonId, userPrincipal.getId(), now,
                pageable);

        List<WordResponse> wordResponses = wordPage.getContent().stream()
                .map(word -> {
                    WordResponse wordResponse = modelMapper.map(word, WordResponse.class);
                    if (word.getAudio() != null) {
                        wordResponse.setAudioUrl(word.getAudio().getUrl());
                    }
                    if (word.getImage() != null) {
                        wordResponse.setImageUrl(word.getImage().getUrl());
                    }
                    wordResponse.setFlashcardLessonId(word.getLearningLesson().getId());
                    return wordResponse;
                })
                .collect(Collectors.toList());

        return PageResponse.<WordResponse>builder()
                .content(wordResponses)
                .pageNumber(wordPage.getNumber())
                .pageSize(wordPage.getSize())
                .totalElements(wordPage.getTotalElements())
                .totalPages(wordPage.getTotalPages())
                .last(wordPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<WordResponse> getDueWordsForUser(Pageable pageable, UserPrincipal userPrincipal) {
        LocalDateTime endOfToday = LocalDateTime.now().with(LocalTime.MAX);
        Page<Word> wordPage = wordRepository.findDueWordsByUser(userPrincipal.getId(), endOfToday, pageable);

        List<WordResponse> wordResponses = wordPage.getContent().stream()
                .map(word -> {
                    WordResponse wordResponse = modelMapper.map(word, WordResponse.class);
                    if (word.getAudio() != null) {
                        wordResponse.setAudioUrl(word.getAudio().getUrl());
                    }
                    if (word.getImage() != null) {
                        wordResponse.setImageUrl(word.getImage().getUrl());
                    }
                    wordResponse.setFlashcardLessonId(word.getLearningLesson().getId());
                    return wordResponse;
                })
                .collect(Collectors.toList());

        return PageResponse.<WordResponse>builder()
                .content(wordResponses)
                .pageNumber(wordPage.getNumber())
                .pageSize(wordPage.getSize())
                .totalElements(wordPage.getTotalElements())
                .totalPages(wordPage.getTotalPages())
                .last(wordPage.isLast())
                .build();
    }
}
