import { Injectable } from '@angular/core'
import { ApiService } from './api.service'

export interface PopularBookItem {
  book_id: string
  title: string | null
  loan_count: number
}

export interface OverdueFineItem {
  id: string
  user_id: string
  user_name: string | null
  amount: number
  status: string
}

interface PopularBooksResponse {
  data: PopularBookItem[]
}

interface OverdueFinesResponse {
  data: OverdueFineItem[]
  summary: {
    total_unpaid: number
    total_paid: number
    total_revenue: number
  }
}

@Injectable({
  providedIn: 'root'
})
export class ReportApiService {
  constructor(private api: ApiService) { }

  getPopularBooks() {
    return this.api.get<PopularBooksResponse>('/api/reports/popular-books')
  }

  getOverdueFines() {
    return this.api.get<OverdueFinesResponse>('/api/reports/overdue-fines')
  }
}

