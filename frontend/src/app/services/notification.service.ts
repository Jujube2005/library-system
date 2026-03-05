import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Notification } from '../models/notification.model';
import { apiBaseUrl } from '../../environments';

interface NotificationListResponse {
    data: Notification[];
}

interface NotificationCountResponse {
    data: number;
}

interface SingleNotificationResponse {
    data: Notification;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private http = inject(HttpClient);
    private baseUrl = `${apiBaseUrl}/api/notifications`;

    getNotifications(): Observable<NotificationListResponse> {
        return this.http.get<NotificationListResponse>(this.baseUrl);
    }

    getUnreadCount(): Observable<NotificationCountResponse> {
        return this.http.get<NotificationCountResponse>(`${this.baseUrl}/unread-count`);
    }

    markAsRead(id: string): Observable<SingleNotificationResponse> {
        return this.http.patch<SingleNotificationResponse>(`${this.baseUrl}/${id}/read`, {});
    }
}
