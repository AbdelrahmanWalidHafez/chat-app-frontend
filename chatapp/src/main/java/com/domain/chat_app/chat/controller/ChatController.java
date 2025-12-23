package com.domain.chat_app.chat.controller;

import com.domain.chat_app.chat.dto.ChatResponse;
import com.domain.chat_app.chat.service.ChatService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chats")
@RequiredArgsConstructor
@Tag(name="Chat")
public class ChatController {
    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<?> createChat(@RequestParam(name = "sender-id") String senderId
            , @RequestParam(name = "receiver-id") String recipientId) {
        final String chatId = chatService.createChat(senderId, recipientId);
        return ResponseEntity.ok().body("chat_id: " + chatId);
    }

    @GetMapping
    public ResponseEntity<List<ChatResponse>> getChatsByReceiver(Authentication currentUser) {
        return ResponseEntity.ok().body(chatService.getChatsByReceiverId(currentUser));
    }
}
