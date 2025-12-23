package com.domain.chat_app.chat.repository;

import com.domain.chat_app.chat.model.Chat;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRepository  extends CrudRepository<Chat, String> {

    @Query("SELECT DISTINCT  c FROM Chat  c WHERE  c.sender.id = :senderId OR c.recipient.id= :senderId")
    List<Chat> findChatsBySenderId(@Param("senderId")String senderId);

    @Query("SELECT DISTINCT c FROM Chat c WHERE (c.sender.id = :senderId AND c.recipient.id = :recipientId) OR (c.sender.id = :recipientId AND c.recipient.id = :senderId) ORDER BY c.createdDate DESC")
    Optional<Chat> findChatByReceiverAndSender(@Param("senderId") String id, @Param("recipientId") String recipientId);
}
