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
  constructor(private api: ApiService) { }

  getMyReservations() {
    return this.api.get<ReservationListResponse>('/api/reservations/my')
  }

  getAllReservations() {
    return this.api.get<ReservationListResponse>('/api/reservations/all')
  }

  createReservation(bookId: string, expiresAt?: string) {
    return this.api.post<{ data: Reservation }>('/api/reservations', { bookId, expiresAt })
  }

  cancelReservation(id: string) {
    return this.api.delete<{ data: { deleted: boolean } }>(`/api/reservations/${id}`)
  }

  updateReservationStatus(id: string, status: string) {
    return this.api.patch<{ data: any }>(`/api/reservations/${id}`, { status })
  }
}

