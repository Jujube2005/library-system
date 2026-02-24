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
      const res = await this.reservationApi.createReservation(this.book.id)
      this.myReservation = res.data
    } catch {
      this.error = 'ไม่สามารถจองหนังสือได้'
    } finally {
      this.reserving = false
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
    }
  }

  getBookCover(id: string): string {
    // This is a fallback if needed, but we should use a consistent logic
    const num = (id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 9) + 1;
    if (num === 8) return '/book8jpg.jpg';
    return `/book${num}.jpg`;
  }
}
