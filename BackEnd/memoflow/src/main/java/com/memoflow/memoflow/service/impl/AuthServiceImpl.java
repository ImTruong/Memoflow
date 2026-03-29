package com.memoflow.memoflow.service.impl;

import com.memoflow.memoflow.dto.request.LoginRequest;
import com.memoflow.memoflow.dto.request.RegisterRequest;
import com.memoflow.memoflow.dto.request.VerifyAccountRequest;
import com.memoflow.memoflow.dto.response.LoginResponse;
import com.memoflow.memoflow.entity.User;
import com.memoflow.memoflow.entity.VerificationCode;
import com.memoflow.memoflow.repository.RoleRepository;
import com.memoflow.memoflow.repository.UserRepository;
import com.memoflow.memoflow.service.AuthService;
import com.memoflow.memoflow.service.VerificationCodeService;
import com.memoflow.memoflow.util.JwtUtil;
import com.memoflow.memoflow.util.SenderUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final VerificationCodeService verificationCodeService;
    private final SenderUtil senderUtil;

    @Override
    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        String token = jwtUtil.generateToken(authentication);
        return new LoginResponse(token);
    }

    @Override
    public void register(RegisterRequest request) {
        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());
        User user;
        if(optionalUser.isPresent()){
            user=optionalUser.get();
            if(user.isRegistered()){
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Email đã được sử dụng.");
            }
            mapToUser(request,user);
        }
        else{
            user=new User();
            mapToUser(request, user);
        }
        User pendingUser=userRepository.save(user);
        senderUtil.sendVerificationCode(pendingUser.getEmail(), pendingUser.getVerificationCode().getValue());
    }

    @Override
    public LoginResponse verifyAccount(VerifyAccountRequest request) {
        User user = userRepository.findByEmailAndVerificationCodeValueAndVerificationCodeExpiresAtAfter(request.getEmail(), request.getCode(), LocalDateTime.now());
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã xác thực không hợp lệ.");
        }
        activeUser(user);
        LoginRequest loginRequest=new LoginRequest(user.getEmail(), request.getPassword());
        return login(loginRequest);
    }

    public void activeUser(User user) {
        user.setRegistered(true);
        user.setVerificationCode(null);
        userRepository.save(user);
    }

    public void mapToUser(RegisterRequest request,User user){
        user.setEmail(request.getEmail());
        user.setName(request.getName());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(roleRepository.findByName("ROLE_USER").orElse(null));
        if(user.getVerificationCode()==null){
            VerificationCode code = new VerificationCode();
            code.setValue(verificationCodeService.generateCode());
            code.setUser(user);
            user.setVerificationCode(code);
        }
        else{
            user.getVerificationCode().setValue(verificationCodeService.generateCode());
        }
    }

    @Override
    public void forgotPassword(Map<String,String> request){
        String email=request.get("email");
        String newPassword= request.get("newPassword");
        User user=userRepository.findByEmailAndIsRegisteredTrue(email).orElseThrow(
                ()->new ResponseStatusException(HttpStatus.NOT_FOUND, "Địa chỉ email chưa được đăng ký.")
        );
        if(user.getVerificationCode()==null){
            VerificationCode code = new VerificationCode();
            code.setValue(verificationCodeService.generateCode());
            code.setUser(user);
            code.setNewPassword(passwordEncoder.encode(newPassword));
            user.setVerificationCode(code);
        }
        else{
            user.getVerificationCode().setValue(verificationCodeService.generateCode());
            user.getVerificationCode().setNewPassword(passwordEncoder.encode(newPassword));
        }
        User pendingUser=userRepository.save(user);
        senderUtil.sendPasswordResetCode(pendingUser.getEmail(), pendingUser.getVerificationCode().getValue());
    }

    @Override
    public void restPassword(Map<String,String> request){
        String email=request.get("email");
        String code=request.get("code");
        User user = userRepository.findByEmailAndVerificationCodeValueAndVerificationCodeExpiresAtAfter(email, code, LocalDateTime.now());
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã xác thực không hợp lệ.");
        }
        String newPassword=user.getVerificationCode().getNewPassword();
        user.setPassword(newPassword);
        user.setVerificationCode(null);
        userRepository.save(user);
    }
}
