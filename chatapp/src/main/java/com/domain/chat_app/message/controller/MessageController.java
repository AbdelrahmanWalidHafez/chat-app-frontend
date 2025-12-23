package com.domain.chat_app.message.controller;

import com.domain.chat_app.message.dto.MessageRequest;
import com.domain.chat_app.message.dto.MessageResponse;
import com.domain.chat_app.message.service.MessageService;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/messages")
@RequiredArgsConstructor
@Tag(name="Message")
public class MessageController {
    private final MessageService messageService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void saveMessage(@RequestBody MessageRequest messageRequest) {
        messageService.save(messageRequest);
    }

    @PostMapping(value = "upload-media",consumes = "multipart/form-data")
    @ResponseStatus(HttpStatus.CREATED)
    public void uploadMedia(@RequestParam("file")  @Parameter MultipartFile file
            , @RequestParam("chat-id")String chatId
            , Authentication authentication) {
        messageService.uploadMediaMessage(chatId, file, authentication);
    }

    @PatchMapping
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void setMessagesToSeen(@RequestParam("chat-id") String chatId,Authentication authentication) {
        messageService.setMessageToSeen(chatId, authentication);
    }

    @GetMapping("/chat/{chat-id}")
    public ResponseEntity<List<MessageResponse>> getMessages(@PathVariable("chat-id") String chatId) {
        return ResponseEntity.ok(messageService.findChatMessages(chatId));
    }

    @PutMapping("/{message-id}")
    @ResponseStatus(HttpStatus.OK)
    public void updateMessage(@PathVariable("message-id") Long messageId,
                              @RequestParam("content") String content,
                              Authentication authentication) {
        messageService.updateMessage(messageId, content, authentication);
    }

    @DeleteMapping("/{message-id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMessage(@PathVariable("message-id") Long messageId,
                              Authentication authentication) {
        messageService.deleteMessage(messageId, authentication);
    }

}
