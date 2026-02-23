import { Component, OnInit } from '@angular/core'
import { NgFor, NgIf } from '@angular/common'
import { ReservationApiService } from '../../../services/reservation-api.service'
import { Reservation } from '../../../models/reservation.model'

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './reservations.html'
})
export class ReservationsComponent implements OnInit {
  reservations: Reservation[] = []
  loading = false
  error = ''

  constructor(private reservationApi: ReservationApiService) {}

  ngOnInit() {
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
    }
  }

  async cancel(reservation: Reservation) {
    if (this.loading) return

    try {
      await this.reservationApi.cancelReservation(reservation.id)
      this.reservations = this.reservations.filter(r => r.id !== reservation.id)
    } catch {
      this.error = 'ไม่สามารถยกเลิกการจองได้'
    }
  }
}
