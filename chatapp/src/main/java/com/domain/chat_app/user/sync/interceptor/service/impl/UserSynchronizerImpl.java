package com.domain.chat_app.user.sync.interceptor.service.impl;

import com.domain.chat_app.user.mapper.UserMapper;
import com.domain.chat_app.user.model.User;
import com.domain.chat_app.user.repository.UserRepository;
import com.domain.chat_app.user.sync.interceptor.service.UserSynchronizer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserSynchronizerImpl implements UserSynchronizer {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    
    @Transactional
    public void synchronizeWithIdp(Jwt token) {
        getUserEmail(token).ifPresent(u -> {
            log.info("Synchronizing user with email {}", u);
            Optional<User>optionalUser=userRepository.findByEmail(u);
            if(optionalUser.isPresent()){
                User existingUser = optionalUser.get();
                existingUser.setLastSeen(LocalDateTime.now());
                userRepository.save(existingUser);
                log.debug("Updated lastSeen for user: {}", u);
                return;
            }
            User user=userMapper.fromTokenAttributes(token.getClaims());
            user.setLastSeen(LocalDateTime.now());
            userRepository.save(user);
        });
    }

    @Transactional
    public void updateLastSeen(String userId) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setLastSeen(LocalDateTime.now());
            userRepository.save(user);
            log.debug("Updated lastSeen for user ID: {}", userId);
        });
    }

    private Optional<String> getUserEmail(Jwt token) {
        return Optional.ofNullable((String)token.getClaims().get("email"));
    }

}
