import { Component, OnInit, ChangeDetectorRef } from '@angular/core'
import { NgFor, NgIf, DatePipe } from '@angular/common'
import { NotificationApiService } from '../../../services/notification-api.service'
import { BookApiService } from '../../../services/book-api.service'
import { Notification } from '../../../models/notification.model'
import { Book } from '../../../models/book.model'
import { RouterLink } from '@angular/router'

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, RouterLink],
  templateUrl: './overview.html',
  styleUrls: ['./overview.css']
})
export class DashboardOverviewComponent implements OnInit {
  notifications: Notification[] = []
  featuredBooks: Book[] = []
  loading = false
  error = ''

  constructor(
    private notificationApi: NotificationApiService,
    private bookApi: BookApiService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    void this.load()
  }

  async load() {
    this.loading = true
    this.error = ''

    // Load Featured Books (Public)
    try {
      const bookRes = await this.bookApi.searchBooks({ limit: 4, sort: 'newest' })
      this.featuredBooks = bookRes.data
    } catch (err) {
      console.error('Featured books load error:', err)
    }

    // Load Notifications (Auth required)
    try {
      const notifRes = await this.notificationApi.getMyNotifications()
      this.notifications = notifRes.data
    } catch (err) {
      console.warn('Notifications load error (likely unauthorized):', err)
      this.notifications = []
    } finally {
      this.loading = false
      this.cdr.detectChanges()
    }
  }

  getBookCover(book: Book): string {
    const titleKey = (book.title || '').trim().toLowerCase()

    const coverByTitle: Record<string, string> = {
      'เพราะเป็นวัยรุ่นจึงเจ็บปวด': '/book1.jpg',
      'กล้าที่จะถูกเกลียด': '/book2.jpg',
      'i decided to live as myself': '/book3.jpg',
      'อยากตายแต่ก็อยากกินต๊อกบกกี #2': '/book4.jpg',
      'sapiens: a brief history of humankind': '/book5.jpg',
      'sapiens a brief history of humankind': '/book5.jpg',
      'the intelligent investor': '/book6.jpg',
      'ต้นส้มแสนรัก': '/book7.jpg',
      'ก็แค่ปล่อยมันไป': '/book8jpg.jpg',
      'เจ้าชายน้อย': '/book9.jpg'
    }

    return coverByTitle[titleKey] || '/book1.jpg'
  }
}
