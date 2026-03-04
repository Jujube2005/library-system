import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core'
import { NgFor, NgIf, DecimalPipe } from '@angular/common'
import { ReportApiService, PopularBookItem, OverdueFineItem } from '../../../services/report-api.service'
import { FineApiService } from '../../../services/fine-api.service'

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [NgFor, NgIf, DecimalPipe],
  templateUrl: './reports.html',
  styleUrls: ['./reports.css']
})
export class ReportsComponent implements OnInit {
  popularBooks: PopularBookItem[] = []
  overdueFines: OverdueFineItem[] = []
  totalUnpaid = 0
  totalPaid = 0
  loading = false
  error = ''

  private reportApi = inject(ReportApiService)
  private fineApi = inject(FineApiService)
  private cdr = inject(ChangeDetectorRef)

  ngOnInit() {
    void this.load()
  }

  async load() {
    this.loading = true
    this.error = ''

    try {
      const [popular, overdue] = await Promise.all([
        this.reportApi.getPopularBooks(),
        this.reportApi.getOverdueFines()
      ])

      this.popularBooks = popular.data
      this.overdueFines = overdue.data
      this.totalUnpaid = overdue.summary.total_unpaid
      this.totalPaid = overdue.summary.total_paid
    } catch {
      this.error = 'ไม่สามารถดึงข้อมูลรายงานได้'
    } finally {
      this.loading = false
      this.cdr.detectChanges()
    }
  }

  async payFine(fineId: string) {
    if (!confirm('ยืนยันบันทึกการรับชำระเงินค่าปรับจำนวนนี้?')) return;

    try {
      await this.fineApi.markAsPaid(fineId);
      await this.load(); // Refresh data
    } catch (err: any) {
      alert('ไม่สามารถบันทึกยอดชำระได้: ' + (err.error?.error || err.message));
    }
  }
}
