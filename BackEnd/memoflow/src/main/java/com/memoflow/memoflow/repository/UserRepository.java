package com.memoflow.memoflow.repository;

import com.memoflow.memoflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByEmailAndIsRegisteredTrue(String email);

    Optional<User> findByFacebookId(String facebookId);

    User findByEmailAndVerificationCodeValueAndVerificationCodeExpiresAtAfter(String email, String code, LocalDateTime now);
}
