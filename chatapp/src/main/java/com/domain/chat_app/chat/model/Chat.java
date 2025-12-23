package com.domain.chat_app.chat.model;

import com.domain.chat_app.common.model.BaseAuditingEntity;
import com.domain.chat_app.message.model.Message;
import com.domain.chat_app.message.model.enums.MessageState;
import com.domain.chat_app.message.model.enums.MessageType;
import com.domain.chat_app.user.model.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;


@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Chat extends BaseAuditingEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name="sender_id")
    private User sender;

    @ManyToOne
    @JoinColumn(name = "recipient_id")
    private User recipient;

    @OneToMany(mappedBy = "chat",fetch = FetchType.EAGER)
    @OrderBy("createdDate DESC")
    private List<Message> messages;

    @Transient
    public String getChatName(final String senderId){
        if(recipient.getId().equals(senderId)){
            return sender.getFirstName()+" "+sender.getLastName();
        }
        return recipient.getFirstName()+" "+recipient.getLastName();
    }

    @Transient
    public Long getUnreadMessagesCount(final String senderId){
        return messages
                .stream()
                .filter(message -> message.getRecipientId().equals(senderId))
                .filter(message -> message.getState().equals(MessageState.SENT))
                .count();
    }

    @Transient

    public String getLastMessage(){
        if(messages!=null&&!messages.isEmpty()){
            if(messages.getFirst().getType()!= MessageType.TEXT){
                return "Attachment";
            }else{
                return messages.getFirst().getContent();
            }
        }
        return null;
    }

    @Transient
    public LocalDateTime getLastMessageTime(){
        if(messages!=null&&!messages.isEmpty()){
            return messages.getFirst().getCreatedDate();
        }
        return null;
    }


}
