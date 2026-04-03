package com.memoflow.memoflow.service.impl;

import com.memoflow.memoflow.dto.request.UpdateUserProfileRequest;
import com.memoflow.memoflow.dto.response.UserResponse;
import com.memoflow.memoflow.entity.Media;
import com.memoflow.memoflow.entity.User;
import com.memoflow.memoflow.entity.enums.MediaType;
import com.memoflow.memoflow.exception.ResourceNotFoundException;
import com.memoflow.memoflow.repository.UserRepository;
import com.memoflow.memoflow.security.UserPrincipal;
import com.memoflow.memoflow.service.CloudinaryService;
import com.memoflow.memoflow.service.UserService;
import com.memoflow.memoflow.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CloudinaryService cloudinaryService;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public List<User> findAll() {
        return userRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public User save(User user) {
        return userRepository.save(user);
    }

    @Override
    public User update(Long id, User user) {
        userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        user.setId(id);
        return userRepository.save(user);
    }

    @Override
    public UserResponse updateProfile(UserPrincipal userPrincipal, UpdateUserProfileRequest request) {
        User currentUser = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userPrincipal.getId()));

        currentUser.setName(request.getName());
        currentUser.setEmail(request.getEmail());
        currentUser.setDateOfBirth(request.getDateOfBirth());

        if (request.getAvatar() != null && !request.getAvatar().isEmpty()) {
            try {
                Map<String, String> uploadResult = cloudinaryService.uploadFile(request.getAvatar(), "avatars");
                Media avatarMedia = Media.builder()
                        .url(uploadResult.get("url"))
                        .publicId(uploadResult.get("public_id"))
                        .type(MediaType.IMAGE)
                        .build();
                currentUser.setAvatar(avatarMedia);
            } catch (IOException e) {
                throw new RuntimeException("Error uploading avatar", e);
            }
        }

        User updatedUser = userRepository.save(currentUser);
        UserResponse response = modelMapper.map(updatedUser, UserResponse.class);
        if (updatedUser.getAvatar() != null) {
            response.setAvatar(updatedUser.getAvatar().getUrl());
        }
        if (updatedUser.getRole() != null) {
            response.setRole(updatedUser.getRole().getName());
        }
        response.setStreakDays(12); // Fake streak
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserProfile(UserPrincipal userPrincipal) {
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userPrincipal.getId()));
        
        UserResponse response = modelMapper.map(user, UserResponse.class);
        if (user.getAvatar() != null) {
            response.setAvatar(user.getAvatar().getUrl());
        }
        if (user.getRole() != null) {
            response.setRole(user.getRole().getName());
        }
        response.setStreakDays(12); // Fake streak
        return response;
    }

    @Override
    public void deleteById(Long id) {
        userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        userRepository.deleteById(id);
    }

    @Override
    public UserResponse changeRole(Long userId, Long roleId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        var role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", roleId));
        
        user.setRole(role);
        User updatedUser = userRepository.save(user);
        return modelMapper.map(updatedUser, UserResponse.class);
    }

    @Override
    public void changePassword(Long userId, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
