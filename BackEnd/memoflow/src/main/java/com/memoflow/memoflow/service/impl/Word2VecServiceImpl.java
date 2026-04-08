package com.memoflow.memoflow.service.impl;

import com.memoflow.memoflow.service.Word2VecService;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.deeplearning4j.models.embeddings.loader.WordVectorSerializer;
import org.deeplearning4j.models.embeddings.wordvectors.WordVectors;
import org.nd4j.linalg.api.ndarray.INDArray;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class Word2VecServiceImpl implements Word2VecService {

    private WordVectors wordVectors;
    private boolean isLoaded = false;

    @PostConstruct
    public void init() {
        // Load model in a separate thread to not block Spring startup too long
        new Thread(() -> {
            try {
                log.info("Starting to load Word2Vec model...");
                long startTime = System.currentTimeMillis();
                
                // Using ClassPathResource to find the SLIM model
                File modelFile = new ClassPathResource("GoogleNews-vectors-negative300-SLIM.bin").getFile();
                
                if (!modelFile.exists()) {
                    throw new FileNotFoundException("Word2Vec model file not found in resources");
                }

                // Load Google model (binary format) using the correct method for DL4J 1.0.0-M2.1
                wordVectors = WordVectorSerializer.readWord2VecModel(modelFile);
                
                long endTime = System.currentTimeMillis();
                isLoaded = true;
                log.info("Word2Vec model loaded successfully in {} ms", (endTime - startTime));
            } catch (Exception e) {
                log.error("Failed to load Word2Vec model: {}", e.getMessage(), e);
            }
        }).start();
    }

    @Override
    public List<String> getSuggestions(List<String> learnedWords, int topN) {
        // Fallback for new users
        if (learnedWords == null || learnedWords.isEmpty()) {
            return List.of("hello", "peace", "sunshine", "together");
        }

        if (!isLoaded || wordVectors == null) {
            return new ArrayList<>();
        }

        try {
            List<INDArray> vectors = new ArrayList<>();
            List<String> cleanLearnedWords = new ArrayList<>();

            for (String word : learnedWords) {
                String cleanWord = word.trim().toLowerCase();
                if (wordVectors.hasWord(cleanWord)) {
                    vectors.add(wordVectors.getWordVectorMatrix(cleanWord));
                    cleanLearnedWords.add(cleanWord);
                }
            }

            if (vectors.isEmpty()) {
                return new ArrayList<>();
            }

            // Calculate Mean Vector
            INDArray meanVector = vectors.get(0).dup();
            for (int i = 1; i < vectors.size(); i++) {
                meanVector.addi(vectors.get(i));
            }
            meanVector.divi(vectors.size());

            // Get nearest words (get more to filter out noise)
            Collection<String> nearest = wordVectors.wordsNearest(meanVector, topN + 15);

            // Filter: 
            // 1. Not in original list
            // 2. No underscores (avoids phrases/entities like New_York)
            // 3. Not just numbers
            // 4. Length > 2
            return nearest.stream()
                    .map(String::toLowerCase)
                    .filter(w -> !cleanLearnedWords.contains(w))
                    .filter(w -> !w.contains("_"))
                    .filter(w -> w.length() > 2)
                    .filter(w -> w.matches("[a-z]+"))
                    .distinct()
                    .limit(topN)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Error generating Word2Vec suggestions: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    @Override
    public double calculateSimilarity(List<String> userWords, List<String> lessonWords) {
        try {
            double word2vecSim = 0.0;
            if (isLoaded && wordVectors != null) {
                INDArray userMean = getMeanVectorForWords(userWords);
                INDArray lessonMean = getMeanVectorForWords(lessonWords);

                if (userMean != null && lessonMean != null) {
                    double dot = userMean.mul(lessonMean).sumNumber().doubleValue();
                    double normUser = userMean.norm2Number().doubleValue();
                    double normLesson = lessonMean.norm2Number().doubleValue();
                    if (normUser != 0 && normLesson != 0) {
                        word2vecSim = dot / (normUser * normLesson);
                    }
                }
            }

            // Lexical overlap fallback/bonus
            long overlapCount = userWords.stream()
                .filter(uw -> lessonWords.stream().anyMatch(lw -> lw.contains(uw) || uw.contains(lw)))
                .count();
            double lexicalSim = (double) overlapCount / Math.max(userWords.size(), 1);

            return (word2vecSim * 0.7) + (lexicalSim * 0.3);

        } catch (Exception e) {
            log.error("Error calculating similarity: {}", e.getMessage());
            return 0.0;
        }
    }

    private INDArray getMeanVectorForWords(List<String> words) {
        List<INDArray> vectors = new ArrayList<>();
        for (String word : words) {
            String cleanWord = word.trim().toLowerCase();
            if (wordVectors.hasWord(cleanWord)) {
                vectors.add(wordVectors.getWordVectorMatrix(cleanWord));
            }
        }

        if (vectors.isEmpty()) return null;

        INDArray mean = vectors.get(0).dup();
        for (int i = 1; i < vectors.size(); i++) {
            mean.addi(vectors.get(i));
        }
        return mean.divi(vectors.size());
    }
}
