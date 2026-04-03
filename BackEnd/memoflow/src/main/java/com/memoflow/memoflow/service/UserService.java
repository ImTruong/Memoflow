package com.memoflow.memoflow.service;

import com.memoflow.memoflow.dto.request.UpdateUserProfileRequest;
import com.memoflow.memoflow.dto.response.UserResponse;
import com.memoflow.memoflow.entity.User;
import com.memoflow.memoflow.security.UserPrincipal;

import java.util.List;
import java.util.Optional;

public interface UserService {

    List<User> findAll();

    Optional<User> findById(Long id);

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    User save(User user);

    User update(Long id, User user);

    UserResponse updateProfile(UserPrincipal userPrincipal, UpdateUserProfileRequest request);
    
    UserResponse getUserProfile(UserPrincipal userPrincipal);

    void deleteById(Long id);

    UserResponse changeRole(Long userId, Long roleId);

    void changePassword(Long userId, String newPassword);
}
