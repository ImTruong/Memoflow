package com.memoflow.memoflow.service;

import java.util.List;

public interface Word2VecService {
    /**
     * Gợi ý các từ liên quan dựa trên danh sách từ đã học
     * @param learnedWords Danh sách tên các từ vừa học
     * @param topN Số lượng từ gợi ý
     * @return Danh sách các từ gợi ý
     */
    List<String> getSuggestions(List<String> learnedWords, int topN);

    double calculateSimilarity(List<String> userWords, List<String> lessonWords);
}
