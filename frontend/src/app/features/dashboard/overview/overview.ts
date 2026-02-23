import { Component, OnInit } from '@angular/core'
import { NgFor, NgIf } from '@angular/common'
import { NotificationApiService } from '../../../services/notification-api.service'
import { Notification } from '../../../models/notification.model'

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './overview.html'
})
export class DashboardOverviewComponent implements OnInit {
  notifications: Notification[] = []
  loading = false
  error = ''

  constructor(private notificationApi: NotificationApiService) {}

  ngOnInit() {
    void this.load()
  }

  async load() {
    this.loading = true
    this.error = ''

    try {
      const res = await this.notificationApi.getMyNotifications()
      this.notifications = res.data
    } catch {
      this.error = 'ไม่สามารถดึงการแจ้งเตือนได้'
    } finally {
      this.loading = false
    }
  }
}
