import { Component, OnInit } from '@angular/core'
import { NgFor, NgIf } from '@angular/common'
import { LoanApiService } from '../../../services/loan-api.service'
import { Loan } from '../../../models/loan.model'

@Component({
  selector: 'app-loans',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './loans.html'
})
export class LoansComponent implements OnInit {
  loans: Loan[] = []
  loading = false
  error = ''

  constructor(private loanApi: LoanApiService) {}

  ngOnInit() {
    void this.loadLoans()
  }

  async loadLoans() {
    this.loading = true
    this.error = ''

    try {
      const res = await this.loanApi.getMyLoans()
      this.loans = res.data
    } catch {
      this.error = 'ไม่สามารถดึงรายการยืมหนังสือได้'
    } finally {
      this.loading = false
    }
  }

  async renew(loan: Loan) {
    if (this.loading) return

    try {
      const res = await this.loanApi.renewLoan(loan.id)
      const updated = res.data

      this.loans = this.loans.map(l => (l.id === loan.id ? { ...l, ...updated } : l))
    } catch {
      this.error = 'ไม่สามารถต่ออายุการยืมได้ (ตรวจสอบสิทธิ์หรือสถานะการยืม)'
    }
  }
}
