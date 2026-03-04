import { Component, inject, HostListener, ChangeDetectorRef, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { Router, RouterLink } from '@angular/router'
import { NgIf } from '@angular/common'
import { AuthService } from '../core/auth.service'
import { Profile } from '../models/profile.model'
import { NotificationService } from '../services/notification.service'
import { Notification } from '../models/notification.model'
import { DatePipe, NgClass, NgFor } from '@angular/common'

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [RouterLink, NgIf, NgFor, NgClass, DatePipe],
    templateUrl: './navbar.html',
    styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit {
    @Input() profile: Profile | null = null
    @Input() isDarkMode = false
    @Output() toggleTheme = new EventEmitter<void>()
    @Output() logoutNeeded = new EventEmitter<void>()

    showProfileMenu = false
    showNotificationMenu = false
    unreadCount = 0
    notifications: Notification[] = []

    private cdr = inject(ChangeDetectorRef)
    private notificationService = inject(NotificationService)

    ngOnInit() {
        this.loadUnreadCount()
    }

    loadUnreadCount() {
        if (this.profile) {
            this.notificationService.getUnreadCount().subscribe({
                next: (res) => {
                    this.unreadCount = res.data
                    this.cdr.detectChanges()
                },
                error: (err) => console.error('Error fetching unread count:', err)
            })
        }
    }

    toggleNotificationMenu(event: Event) {
        event.stopPropagation()
        this.showNotificationMenu = !this.showNotificationMenu
        this.showProfileMenu = false

        if (this.showNotificationMenu) {
            this.notificationService.getNotifications().subscribe({
                next: (res) => {
                    this.notifications = res.data.slice(0, 5) // Last 5
                    this.cdr.detectChanges()
                },
                error: (err) => console.error('Error fetching notification:', err)
            })
        }
    }

    markAsReadAndGo(notif: Notification, event: Event) {
        event.stopPropagation();
        if (!notif.is_read) {
            this.notificationService.markAsRead(notif.id).subscribe({
                next: () => {
                    notif.is_read = true;
                    if (this.unreadCount > 0) this.unreadCount--;
                    this.cdr.detectChanges();
                }
            });
        }
    }

    toggleDarkMode() {
        this.toggleTheme.emit()
    }

    async logout() {
        this.logoutNeeded.emit()
    }

    toggleProfileMenu(event: Event) {
        event.stopPropagation()
        this.showProfileMenu = !this.showProfileMenu
        this.showNotificationMenu = false
    }

    @HostListener('document:click')
    closeMenus() {
        this.showProfileMenu = false
        this.showNotificationMenu = false
    }
}
