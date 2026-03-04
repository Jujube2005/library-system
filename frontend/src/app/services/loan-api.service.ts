import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Loan } from '../models/loan.model';

export interface LoanResponse {
  data: Loan;
}

export interface LoansResponse {
  data: Loan[];
}

@Injectable({
  providedIn: 'root'
})
export class LoanApiService {
  constructor(private api: ApiService) { }

  getAllLoansInSystem(status?: string, limit?: number) {
    let url = '/api/loans/system?';
    if (status) url += `status=${status}&`;
    if (limit) url += `limit=${limit}&`;
    return this.api.get<LoansResponse>(url);
  }

  getLoanStats() {
    return this.api.get<{ data: { active: number, overdue: number, returnedToday: number } }>('/api/loans/stats');
  }

  getLoanById(id: string) {
    return this.api.get<LoanResponse>(`/api/loans/${id}`);
  }

  createLoan(userId: string, bookId: string, dueDate: string) {
    return this.api.post<LoanResponse>('/api/loans', { userId, bookId, due_date: dueDate });
  }

  returnLoan(loanId: string) {
    return this.api.patch<LoanResponse>(`/api/loans/${loanId}/return`, {});
  }

  renewLoanByStaff(loanId: string, newDueDate: string) {
    return this.api.patch<LoanResponse>(`/api/loans/${loanId}/renew-by-staff`, { new_due_date: newDueDate });
  }

  updateLoan(loanId: string, loan: Partial<Loan>) {
    return this.api.patch<LoanResponse>(`/api/loans/${loanId}`, loan);
  }

  getMyLoans() {
    return this.api.get<LoansResponse>('/api/loans/my');
  }

  renewLoan(loanId: string) {
    return this.api.patch<LoanResponse>(`/api/loans/${loanId}/renew`, {});
  }
}
