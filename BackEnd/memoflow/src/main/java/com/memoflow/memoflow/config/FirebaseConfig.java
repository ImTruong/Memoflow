package com.memoflow.memoflow.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import jakarta.annotation.PostConstruct;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

/**
 * Firebase Cloud Messaging configuration class.
 * Initializes Firebase Admin SDK for sending push notifications.
 */
@Configuration
@Slf4j
public class FirebaseConfig {

//    @Value("${firebase.config.file:firebase-service-account.json}")
//    private String firebaseConfigPath;
//
//    @PostConstruct
//    public void initialize() {
//        try {
//            if (FirebaseApp.getApps().isEmpty()) {
//                InputStream serviceAccount = getFirebaseCredentials();
//
//                FirebaseOptions options = FirebaseOptions.builder()
//                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
//                        .build();
//
//                FirebaseApp.initializeApp(options);
//                log.info("Firebase Admin SDK initialized successfully");
//            } else {
//                log.info("Firebase Admin SDK already initialized");
//            }
//        } catch (IOException e) {
//            log.error("Failed to initialize Firebase Admin SDK", e);
//            throw new RuntimeException("Failed to initialize Firebase", e);
//        }
//    }
//
//    /**
//     * Get Firebase credentials from classpath or file system
//     */
//    private InputStream getFirebaseCredentials() throws IOException {
//        try {
//            // Try to load from classpath (src/main/resources)
//            ClassPathResource resource = new ClassPathResource(firebaseConfigPath);
//            if (resource.exists()) {
//                log.info("Loading Firebase config from classpath: {}", firebaseConfigPath);
//                return resource.getInputStream();
//            }
//        } catch (Exception e) {
//            log.warn("Firebase config not found in classpath, trying file system");
//        }
//
//        // Try to load from file system
//        try {
//            log.info("Loading Firebase config from file system: {}", firebaseConfigPath);
//            return new FileInputStream(firebaseConfigPath);
//        } catch (IOException e) {
//            log.error("Firebase service account file not found: {}", firebaseConfigPath);
//            throw new IOException("Firebase service account file not found. " +
//                    "Please add firebase-service-account.json to src/main/resources/ " +
//                    "or configure firebase.config.file property", e);
//        }
//    }
}
