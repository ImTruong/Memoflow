package com.memoflow.memoflow.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.memoflow.memoflow.repository.LearningActivityRepository;
import com.memoflow.memoflow.repository.LearningLessonRepository;
import com.memoflow.memoflow.repository.WordRepository;

import org.springframework.transaction.annotation.Transactional;

@Component("securityService")
@Transactional(readOnly = true)
public class SecurityService {
    @Autowired
    private LearningLessonRepository learningLessonRepository;

    @Autowired
    private WordRepository wordRepository;

    @Autowired
    private LearningActivityRepository learningActivityRepository;

    public boolean isActivityExist(Long activityId) {
        return learningActivityRepository.existsById(activityId);
    }

    public boolean isWordOwner(Long wordId, Long userId) {
        return wordRepository.findById(wordId)
                .map(word -> word.getLearningLesson().getCreator().getId().equals(userId))
                .orElse(false);
    }

    public boolean isFlashcardLessonOwner(Long flashcardLessonId, Long userId) {
        return learningLessonRepository.findById(flashcardLessonId)
                .map(learningLesson -> learningLesson.getCreator().getId().equals(userId))
                .orElse(false);
    }

    public boolean canAccessFlashcardLesson(Long flashcardLessonId, Long userId) {
        return learningLessonRepository.findById(flashcardLessonId)
                .map(learningLesson -> learningLesson.getCreator().getId().equals(userId)
                        || (learningLesson.getContent() != null && "PUBLIC".equals(learningLesson.getContent().get("privacyMode"))))
                .orElse(false);
    }

    public boolean canAccessWord(Long wordId, Long userId) {
        return wordRepository.findById(wordId)
                .map(word -> word.getLearningLesson().getCreator().getId().equals(userId)
                        || (word.getLearningLesson().getContent() != null && "PUBLIC".equals(word.getLearningLesson().getContent().get("privacyMode"))))
                .orElse(false);
    }

}
