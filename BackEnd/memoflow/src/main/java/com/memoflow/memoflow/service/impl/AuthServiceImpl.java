package com.memoflow.memoflow.service.impl;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
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
import com.memoflow.memoflow.security.UserPrincipal;
import com.memoflow.memoflow.dto.response.UserResponse;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.cloudinary.json.JSONObject;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.GeneralSecurityException;
import java.time.LocalDateTime;
import java.util.Arrays;
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
    private final ModelMapper modelMapper;

    @Override
    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        String token = jwtUtil.generateToken(authentication);

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Người dùng không tồn tại."));

        UserResponse userResponse = modelMapper.map(user, UserResponse.class);
        if (user.getAvatar() != null) {
            userResponse.setAvatar(user.getAvatar().getUrl());
        }
        if (user.getRole() != null) {
            userResponse.setRole(user.getRole().getName());
        }
        userResponse.setStreakDays(12); // Fake streak

        return new LoginResponse(token, userResponse);
    }

    @Override
    public LoginResponse loginWithGoogle(String idToken) throws GeneralSecurityException, IOException {
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Arrays.asList(
                        "742848434445-lo5epsqjkqd887c43rkbdvvuns5rd826.apps.googleusercontent.com",
                        "742848434445-l6gbkf7q2sq4ai27n6s6srmt4le34j1r.apps.googleusercontent.com"
                ))
                .build();
        GoogleIdToken googleIdToken = verifier.verify(idToken);
        if (googleIdToken == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Thông tin không hợp lệ.");
        }

        GoogleIdToken.Payload payload = googleIdToken.getPayload();
        String email = payload.getEmail();
        String name = (String) payload.get("name");

        User user = userRepository.findByEmailAndIsRegisteredTrue(email)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setName(name);
                    newUser.setRole(roleRepository.findByName("ROLE_USER").orElse(null));
                    newUser.setRegistered(true);
                    return userRepository.save(newUser);
                });
        String token = jwtUtil.generateToken(user);
        UserResponse userResponse = modelMapper.map(user, UserResponse.class);
        if (user.getAvatar() != null) {
            userResponse.setAvatar(user.getAvatar().getUrl());
        }
        if (user.getRole() != null) {
            userResponse.setRole(user.getRole().getName());
        }
        userResponse.setStreakDays(12); // Fake streak

        return new LoginResponse(token, userResponse);
    }

    @Override
    public LoginResponse loginWithFacebook(String accessToken) throws IOException {
        String url = "https://graph.facebook.com/me?fields=id,name&access_token=" + accessToken;
        HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
        connection.setRequestMethod("GET");
        if (connection.getResponseCode() != 200) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Token Facebook không hợp lệ.");
        }
        BufferedReader in = new BufferedReader(new InputStreamReader(connection.getInputStream()));
        StringBuilder response = new StringBuilder();
        String inputLine;
        while ((inputLine = in.readLine()) != null) {
            response.append(inputLine);
        }
        in.close();
        JSONObject json = new JSONObject(response.toString());
        String fbId = json.optString("id");
        String name = json.optString("name");
        User user = userRepository.findByFacebookId(fbId)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setFacebookId(fbId);
                    newUser.setName(name);
                    newUser.setRole(roleRepository.findByName("ROLE_USER").orElse(null));
                    newUser.setRegistered(true);
                    return userRepository.save(newUser);
                });
        String token = jwtUtil.generateToken(user);
        UserResponse userResponse = modelMapper.map(user, UserResponse.class);
        if (user.getAvatar() != null) {
            userResponse.setAvatar(user.getAvatar().getUrl());
        }
        if (user.getRole() != null) {
            userResponse.setRole(user.getRole().getName());
        }
        userResponse.setStreakDays(12); // Fake streak

        return new LoginResponse(token, userResponse);
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
