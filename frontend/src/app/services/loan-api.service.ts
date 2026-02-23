import { Injectable } from '@angular/core'
import { ApiService } from './api.service'
import { Loan } from '../models/loan.model'

interface LoanListResponse {
  data: Loan[]
}

@Injectable({
  providedIn: 'root'
})
export class LoanApiService {
  constructor(private api: ApiService) {}

  getMyLoans() {
    return this.api.get<LoanListResponse>('/api/loans/my')
  }

  getAllLoans() {
    return this.api.get<LoanListResponse>('/api/loans')
  }

  renewLoan(id: string) {
    return this.api.post<{ data: Loan }>(`/api/loans/${id}/renew`, {})
  }

  returnLoan(id: string) {
    return this.api.post<{ data: { loan: Loan } }>(`/api/loans/${id}/return`, {})
  }
}

