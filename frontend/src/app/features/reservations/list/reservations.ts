import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core'
import { NgFor, NgIf, DatePipe, NgClass } from '@angular/common'
import { ReservationApiService } from '../../../services/reservation-api.service'
import { Reservation } from '../../../models/reservation.model'

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, NgClass],
  templateUrl: './reservations.html',
  styleUrls: ['./reservations.css']
})
export class MyReservationsComponent implements OnInit {
  reservations: Reservation[] = []
  loading = false
  error = ''
  private cdr = inject(ChangeDetectorRef)
  private reservationApi = inject(ReservationApiService)

  constructor() { }

  ngOnInit() {
    console.log('[Reservations] Component Initialized - Design v2')
    void this.loadReservations()
  }

  async loadReservations() {
    this.loading = true
    this.error = ''

    try {
      const res = await this.reservationApi.getMyReservations()
      this.reservations = res.data
    } catch {
      this.error = 'ไม่สามารถดึงรายการจองหนังสือได้'
    } finally {
      this.loading = false
      this.cdr.detectChanges()
    }
  }

  async cancel(reservation: Reservation) {
    if (this.loading) return

    try {
      await this.reservationApi.cancelReservation(reservation.id)
      this.reservations = this.reservations.filter(r => r.id !== reservation.id)
      this.cdr.detectChanges()
    } catch {
      this.error = 'ไม่สามารถยกเลิกการจองได้'
      this.cdr.detectChanges()
    }
  }
}
