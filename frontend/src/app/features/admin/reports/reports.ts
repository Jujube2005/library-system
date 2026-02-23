import { Component, OnInit } from '@angular/core'
import { NgFor, NgIf } from '@angular/common'
import { ReportApiService, PopularBookItem, OverdueFineItem } from '../../../services/report-api.service'

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './reports.html'
})
export class ReportsComponent implements OnInit {
  popularBooks: PopularBookItem[] = []
  overdueFines: OverdueFineItem[] = []
  totalUnpaid = 0
  loading = false
  error = ''

  constructor(private reportApi: ReportApiService) {}

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
    } catch {
      this.error = 'ไม่สามารถดึงข้อมูลรายงานได้'
    } finally {
      this.loading = false
    }
  }
}
