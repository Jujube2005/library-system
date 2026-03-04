import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { BookApiService } from '../../../services/book-api.service'
import { ReservationApiService } from '../../../services/reservation-api.service'
import { UserApiService } from '../../../services/user-api.service'
import { LoanApiService } from '../../../services/loan-api.service'
import { Book } from '../../../models/book.model'
import { Reservation } from '../../../models/reservation.model'
import { Profile } from '../../../models/profile.model'

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './book-detail.html',
  styleUrls: ['./book-detail.css']
})
export class BookDetailComponent implements OnInit {
  book: Book | null = null
  loading = false
  error = ''

  myReservation: Reservation | null = null
  reserving = false
  userProfile: Profile | null = null

  // For Toast
  toastMessage: { message: string, type: 'success' | 'error' } | null = null;
  private toastTimeout: any;

  // For Reservation Date
  showDatePicker = false;
  selectedPickupDate: string = '';

  private route = inject(ActivatedRoute);
  private bookApi = inject(BookApiService);
  private reservationApi = inject(ReservationApiService);
  private userApi = inject(UserApiService);
  private loanApi = inject(LoanApiService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    void this.load()
    void this.loadUserProfile()
  }

  showToast(message: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = { message, type };
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.toastMessage = null;
      this.cdr.detectChanges();
    }, 3000);
    this.cdr.detectChanges();
  }

  private async loadUserProfile() {
    try {
      const res = await this.userApi.getMe();
      this.userProfile = res;
    } catch {
      console.log('User not logged in or profile fetch failed');
    }
  }

  private async load() {
    const id = this.route.snapshot.paramMap.get('id')

    if (!id) {
      this.error = 'ไม่พบรหัสหนังสือ'
      return
    }

    this.loading = true
    this.error = ''

    try {
      const [bookRes, myResv] = await Promise.all([
        this.bookApi.getBook(id),
        this.reservationApi.getMyReservations().catch(() => ({ data: [] as Reservation[] }))
      ])

      this.book = bookRes.data

      const reservations = (myResv as any).data as Reservation[]
      this.myReservation =
        reservations.find(
          r => r.book_id === id && r.status !== 'cancelled' && r.status !== 'expired' && r.status !== 'completed'
        ) ?? null
    } catch {
      this.error = 'ไม่สามารถดึงข้อมูลหนังสือได้'
    } finally {
      this.loading = false
      this.cdr.detectChanges()
    }
  }

  get canReserve() {
    return (
      !!this.book &&
      !this.myReservation &&
      this.book.status === 'available' &&
      this.book.available_copies > 0
    )
  }

  get isStaff() {
    return this.userProfile?.role === 'staff'
  }

  get hasActiveReservation() {
    return !!this.myReservation
  }

  toggleDatePicker() {
    this.showDatePicker = !this.showDatePicker;
    if (this.showDatePicker) {
      // Set default date to today
      const today = new Date();
      this.selectedPickupDate = today.toISOString().split('T')[0];
    }
  }

  async reserve() {
    if (!this.book || this.reserving) return

    // If date picker not shown, show it first
    if (!this.showDatePicker) {
      this.toggleDatePicker();
      return;
    }

    if (!this.selectedPickupDate) {
      this.showToast('กรุณาเลือกวันที่ต้องการรับหนังสือ', 'error');
      return;
    }

    this.reserving = true
    this.error = ''

    try {
      // We'll use the selected date as expires_at (end of that day)
      const expiresAt = new Date(this.selectedPickupDate);
      expiresAt.setHours(23, 59, 59, 999);

      const res = await this.reservationApi.createReservation(this.book.id, expiresAt.toISOString())
      this.myReservation = res.data
      this.showToast('จองหนังสือสำเร็จแล้ว!');
      this.showDatePicker = false;
    } catch (err: any) {
      this.error = err.error?.error || err.error?.message || 'ไม่สามารถจองหนังสือได้'
      this.showToast(this.error, 'error');
    } finally {
      this.reserving = false
      this.cdr.detectChanges()
    }
  }

  async quickBorrow() {
    if (!this.book || !this.isStaff) return;

    const targetUserId = prompt('กรุณาระบุรหัสผู้ใช้ (User ID) หรือ รหัสนักศึกษา ที่ต้องการยืม:');
    if (!targetUserId) return;

    this.reserving = true;
    try {
      // Calculate default due date based on common rules (7 days)
      // Staff can adjust later in Loan Management
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      await this.loanApi.createLoan(targetUserId, this.book.id, dueDate.toISOString().split('T')[0]);
      this.showToast('บันทึกการยืมสำเร็จ!');
      void this.load(); // Refresh book status
    } catch (err: any) {
      const msg = err.error?.error || err.message || 'ไม่สามารถบันทึกการยืมได้';
      this.showToast(msg, 'error');
    } finally {
      this.reserving = false;
      this.cdr.detectChanges();
    }
  }

  async cancelReservation() {
    if (!this.myReservation || this.reserving) return

    this.reserving = true
    this.error = ''

    try {
      await this.reservationApi.cancelReservation(this.myReservation.id)
      this.myReservation = null
      this.showToast('ยกเลิกการจองแล้ว');
    } catch {
      this.error = 'ไม่สามารถยกเลิกการจองได้'
      this.showToast(this.error, 'error');
    } finally {
      this.reserving = false
      this.cdr.detectChanges()
    }
  }

  getBookCover(book: Book | null): string {
    if (!book) return '/default-book-cover.svg';
    if (book.image_url) return book.image_url;
    if (book.cover_image_url) return book.cover_image_url;

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
    return coverByTitle[titleKey] || '/default-book-cover.svg'
  }
}
