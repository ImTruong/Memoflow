package com.memoflow.memoflow.service;

import com.memoflow.memoflow.dto.request.CreateWordRequest;
import com.memoflow.memoflow.dto.request.UpdateWordRequest;
import com.memoflow.memoflow.dto.response.PageResponse;
import com.memoflow.memoflow.dto.response.WordResponse;
import com.memoflow.memoflow.security.UserPrincipal;

import org.springframework.data.domain.Pageable;

public interface WordService {

    void deleteWord(Long id, UserPrincipal userPrincipal);

    WordResponse createWord(Long flashcardLessonId, CreateWordRequest createWordRequest, UserPrincipal userPrincipal);

    WordResponse updateWord(Long id, UpdateWordRequest updateWordRequest, UserPrincipal userPrincipal);

    PageResponse<WordResponse> getWordsByFlashcardLessonId(Long flashcardLessonId, Pageable pageable, UserPrincipal userPrincipal);

    PageResponse<WordResponse> searchWordsInLesson(Long flashcardLessonId, String keyword, Pageable pageable, UserPrincipal userPrincipal);

    PageResponse<WordResponse> getDueWordsByFlashcardLessonId(Long flashcardLessonId, Pageable pageable, UserPrincipal userPrincipal);
 
    PageResponse<WordResponse> getDueWordsForUser(Pageable pageable, UserPrincipal userPrincipal);
}
