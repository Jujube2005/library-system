import { Injectable } from '@angular/core'
import { ApiService } from './api.service'
import { Reservation } from '../models/reservation.model'

interface ReservationListResponse {
  data: Reservation[]
}

@Injectable({
  providedIn: 'root'
})
export class ReservationApiService {
  constructor(private api: ApiService) {}

  getMyReservations() {
    return this.api.get<ReservationListResponse>('/api/reservations/my')
  }

  createReservation(bookId: string) {
    return this.api.post<{ data: Reservation }>('/api/reservations', { bookId })
  }

  cancelReservation(id: string) {
    return this.api.delete<{ data: { deleted: boolean } }>(`/api/reservations/${id}`)
  }
}

