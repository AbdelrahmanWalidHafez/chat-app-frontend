package com.domain.chat_app.user.sync.interceptor.service;

import org.springframework.security.oauth2.jwt.Jwt;

public interface UserSynchronizer {
    void synchronizeWithIdp(Jwt token);
    void updateLastSeen(String userId);
}
