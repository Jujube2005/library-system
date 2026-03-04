import { Component, OnInit, ChangeDetectorRef } from '@angular/core'
import { NgFor, NgIf, DatePipe, UpperCasePipe } from '@angular/common'
import { LoanApiService } from '../../../services/loan-api.service'
import { UserApiService } from '../../../services/user-api.service'
import { Loan } from '../../../models/loan.model'
import { Profile } from '../../../models/profile.model'

@Component({
  selector: 'app-loans',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe],
  templateUrl: './loans.html',
  styleUrls: ['./loans.css']
})
export class LoansComponent implements OnInit {
  loans: Loan[] = []
  loading = false
  error = ''
  profile: Profile | null = null

  constructor(
    private loanApi: LoanApiService,
    private userApi: UserApiService,
    private cdr: ChangeDetectorRef
  ) { }

  get isStaff() {
    return this.profile?.role === 'staff'
  }

  ngOnInit() {
    void this.init()
  }

  private async init() {
    await this.loadProfile()
    await this.loadLoans()
  }

  private async loadProfile() {
    try {
      this.profile = await this.userApi.getMe()
    } catch {
      this.profile = null
    }
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
      this.cdr.detectChanges()
    }
  }

  async renew(loan: Loan) {
    if (this.loading || this.isStaff) return

    try {
      const res = await this.loanApi.renewLoan(loan.id)
      const updated = res.data

      this.loans = this.loans.map(l => (l.id === loan.id ? { ...l, ...updated } : l))
    } catch {
      this.error = 'ไม่สามารถต่ออายุการยืมได้ (ตรวจสอบสิทธิ์หรือสถานะการยืม)'
    } finally {
      this.cdr.detectChanges()
    }
  }

  async returnLoan(loan: Loan) {
    if (this.loading || !this.isStaff) return

    try {
      await this.loanApi.returnLoan(loan.id)
      await this.loadLoans()
    } catch {
      this.error = 'ไม่สามารถบันทึกการคืนหนังสือได้'
    } finally {
      this.cdr.detectChanges()
    }
  }
}
