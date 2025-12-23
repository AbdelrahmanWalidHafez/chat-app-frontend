package com.domain.chat_app.chat.service.impl;

import com.domain.chat_app.chat.dto.ChatResponse;
import com.domain.chat_app.chat.mapper.ChatMapper;
import com.domain.chat_app.chat.model.Chat;
import com.domain.chat_app.chat.repository.ChatRepository;
import com.domain.chat_app.chat.service.ChatService;
import com.domain.chat_app.user.model.User;
import com.domain.chat_app.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {
    private final ChatRepository chatRepository;

    private final UserRepository userRepository;

    private final ChatMapper chatMapper;

    @Transactional(readOnly = true)
    public List<ChatResponse> getChatsByReceiverId(Authentication currentUser){
        final String userId = currentUser.getName();
        return  chatRepository.findChatsBySenderId(userId)
                .stream()
                .map(c-> chatMapper.toChatResponse(c,userId))
                .toList();
    }

    public String createChat(String senderId, String recipientId) {
        Optional<Chat> exsisting=chatRepository.findChatByReceiverAndSender(senderId,recipientId);
        if(exsisting.isPresent()){
            return exsisting.get().getId();
        }
        User sender=userRepository.findById(senderId).orElseThrow(()->new EntityNotFoundException("User not found"));
        User recipient=userRepository.findById(recipientId).orElseThrow(()->new EntityNotFoundException("User not found"));
        Chat chat=new Chat();
        chat.setSender(sender);
        chat.setRecipient(recipient);
        return chatRepository.save(chat).getId();
    }
}
