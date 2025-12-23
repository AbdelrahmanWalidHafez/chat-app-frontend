package com.domain.chat_app.user.service;

import com.domain.chat_app.user.dto.UserResponse;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface UserService {
    public List<UserResponse> getAllUsersExceptSelf(Authentication authentication);
}
