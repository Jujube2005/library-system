import { Component, OnInit, ChangeDetectorRef } from '@angular/core'
import { NgFor, NgIf, DatePipe, DecimalPipe } from '@angular/common'
import { FineApiService } from '../../../services/fine-api.service'
import { LoanApiService } from '../../../services/loan-api.service'
import { Fine } from '../../../models/fine.model'
import { calculateCurrentFine } from './fine-utils'

@Component({
  selector: 'app-fines',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, DecimalPipe],
  templateUrl: './fines.html',
  styleUrls: ['./fines.css']
})
export class FinesComponent implements OnInit {
  fines: Fine[] = []
  estimatedFines: any[] = []
  loading = false
  error = ''

  constructor(
    private fineApi: FineApiService,
    private loanApi: LoanApiService,
    private cdr: ChangeDetectorRef
  ) { }

  get outstandingTotal() {
    const paidFines = this.fines
      .filter(f => f.status === 'unpaid')
      .reduce((sum, f) => sum + f.amount, 0)

    const activeFines = this.estimatedFines.reduce((sum, f) => sum + f.amount, 0)

    return paidFines + activeFines
  }

  ngOnInit() {
    void this.loadFines()
  }

  async loadFines() {
    this.loading = true
    this.error = ''
    try {
      // 1. Get official recorded fines
      const res = await this.fineApi.getMyFines()
      this.fines = res.data

      // 2. Get active loans to calculate "In-Progress" fines
      const loanRes = await this.loanApi.getMyLoans()
      this.estimatedFines = loanRes.data
        .filter((l: any) => l.status === 'overdue' || (l.status === 'active' && new Date(l.due_date) < new Date()))
        .map((l: any) => ({
          book_title: l.books?.title || 'Unknown Book',
          due_date: l.due_date,
          amount: calculateCurrentFine(l.due_date)
        }))
        .filter((f: any) => f.amount > 0)

    } catch (err) {
      console.error('Load Fines Error:', err)
      this.error = 'ไม่สามารถดึงข้อมูลค่าปรับได้'
    } finally {
      this.loading = false
      this.cdr.detectChanges()
    }
  }
}
