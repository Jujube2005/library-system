import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../models/notification.model';

@Component({
    selector: 'app-notifications',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './notifications.html',
    styleUrls: ['./notifications.css']
})
export class NotificationsComponent implements OnInit {
    notifications: Notification[] = [];
    loading = false;
    error = '';

    private notificationService = inject(NotificationService);

    ngOnInit() {
        this.loadNotifications();
    }

    loadNotifications() {
        this.loading = true;
        this.error = '';

        this.notificationService.getNotifications().subscribe({
            next: (res) => {
                this.notifications = res.data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Failed to load notifications', err);
                this.error = 'ไม่สามารถดึงข้อมูลการแจ้งเตือนได้';
                this.loading = false;
            }
        });
    }

    markAsRead(notif: Notification) {
        if (notif.is_read) return;

        this.notificationService.markAsRead(notif.id).subscribe({
            next: () => {
                notif.is_read = true;
            },
            error: (err) => console.error('Failed to mark as read', err)
        });
    }
}
