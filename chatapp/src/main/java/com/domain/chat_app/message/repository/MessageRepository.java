package com.domain.chat_app.message.repository;

import com.domain.chat_app.message.model.Message;
import com.domain.chat_app.message.model.enums.MessageState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message,Long> {

    List<Message> findMessageByChatId(String id);

    @Modifying
    @Query("UPDATE Message SET state= :newState WHERE chat.id= :chatId")
    void setMessagesToSeen(@Param("chatId") String chatId, @Param("newState") MessageState newState);
}
