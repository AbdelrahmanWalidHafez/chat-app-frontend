package com.domain.chat_app.ws.notification.service;

import com.domain.chat_app.ws.notification.model.Notification;

public interface NotificationService {
    void sendNotification(Notification notification, String userId);
}
