package com.domain.chat_app.user.service.impl;

import com.domain.chat_app.user.dto.UserResponse;
import com.domain.chat_app.user.mapper.UserMapper;
import com.domain.chat_app.user.repository.UserRepository;
import com.domain.chat_app.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    private final UserMapper userMapper;

    public List<UserResponse> getAllUsersExceptSelf(Authentication authentication){

        return userRepository.findAllExceptSelf(authentication.getName())
                .stream()
                .map(userMapper::toUserResponse)
                .toList();

    }

}
