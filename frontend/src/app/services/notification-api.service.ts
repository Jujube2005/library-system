import { Injectable } from '@angular/core'
import { ApiService } from './api.service'
import { Notification } from '../models/notification.model'

interface NotificationListResponse {
  data: Notification[]
}

interface NotificationResponse {
  data: Notification
}

@Injectable({
  providedIn: 'root'
})
export class NotificationApiService {
  constructor(private api: ApiService) {}

  getMyNotifications() {
    return this.api.get<NotificationListResponse>('/api/notifications/my')
  }

  markAsRead(id: string) {
    return this.api.patch<NotificationResponse>(`/api/notifications/${id}/read`, {})
  }
}

