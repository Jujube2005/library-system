import { Component, OnInit, ChangeDetectorRef } from '@angular/core'
import { NgIf } from '@angular/common'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { BookApiService } from '../../../services/book-api.service'
import { ReservationApiService } from '../../../services/reservation-api.service'
import { Book } from '../../../models/book.model'
import { Reservation } from '../../../models/reservation.model'

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [NgIf, RouterLink],
  templateUrl: './book-detail.html',
  styleUrls: ['./book-detail.css']
})
export class BookDetailComponent implements OnInit {
  book: Book | null = null
  loading = false
  error = ''

  myReservation: Reservation | null = null
  reserving = false

  constructor(
    private route: ActivatedRoute,
    private bookApi: BookApiService,
    private reservationApi: ReservationApiService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    void this.load()
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
          r => r.book_id === id && r.status !== 'cancelled' && r.status !== 'expired'
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

  get hasActiveReservation() {
    return !!this.myReservation
  }

  async reserve() {
    if (!this.book || this.reserving) return

    this.reserving = true
    this.error = ''

    try {
      console.log('Reserving Book ID:', this.book.id)
      const res = await this.reservationApi.createReservation(this.book.id)
      this.myReservation = res.data
    } catch (err: any) {
      this.error = err.error?.error || err.error?.message || 'ไม่สามารถจองหนังสือได้'
    } finally {
      this.reserving = false
      this.cdr.detectChanges()
    }
  }

  async cancelReservation() {
    if (!this.myReservation || this.reserving) return

    this.reserving = true
    this.error = ''

    try {
      await this.reservationApi.cancelReservation(this.myReservation.id)
      this.myReservation = null
    } catch {
      this.error = 'ไม่สามารถยกเลิกการจองได้'
    } finally {
      this.reserving = false
      this.cdr.detectChanges()
    }
  }

  getBookCover(book: Book | null): string {
    if (book?.cover_image_url) {
      return book.cover_image_url;
    }

    const titleKey = (book?.title || '').trim().toLowerCase()
    const coverByTitle: Record<string, string> = {
      'เพราะเป็นวัยรุ่นจึงเจ็บปวด': '/book1.jpg',
      'กล้าที่จะถูกเกลียด': '/book2.jpg',
      'i decided to live as myself': '/book3.jpg',
      'อยากตายแต่ก็อยากกินต๊อกบกกี #2': '/book4.jpg',
      'sapiens: a brief history of humankind': '/book5.jpg',
      'the intelligent investor': '/book6.jpg',
      'ต้นส้มแสนรัก': '/book7.jpg',
      'ก็แค่ปล่อยมันไป': '/book8jpg.jpg',
      'เจ้าชายน้อย': '/book9.jpg'
    }
    return coverByTitle[titleKey] || '/default-book-cover.svg'
  }
}
