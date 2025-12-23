package com.domain.chat_app.user.mapper;

import com.domain.chat_app.user.dto.UserResponse;
import com.domain.chat_app.user.model.User;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;

@Component
public class UserMapper {
    public User fromTokenAttributes(Map<String, Object> claims) {
        User user=new User();
        if(claims.containsKey("sub")){
            user.setId(claims.get("sub").toString());
        }
        if(claims.containsKey("given_name")){
            user.setFirstName(claims.get("given_name").toString());
        }else if(claims.containsKey("nickname")) {
            user.setFirstName(claims.get("given_name").toString());
        }
        if(claims.containsKey("family_name")) {
            user.setLastName(claims.get("family_name").toString());
        }
        if(claims.containsKey("email")) {
            user.setEmail(claims.get("email").toString());
        }
        user.setLastSeen(LocalDateTime.now());
        return  user;
    }

    public UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .lastSeen(user.getLastSeen())
                .isOnline(user.isUserOnline())
                .build();
    }
}
