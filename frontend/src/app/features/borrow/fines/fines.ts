import { Component, OnInit } from '@angular/core'
import { NgFor, NgIf } from '@angular/common'
import { FineApiService } from '../../../services/fine-api.service'
import { Fine } from '../../../models/fine.model'

@Component({
  selector: 'app-fines',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './fines.html'
})
export class FinesComponent implements OnInit {
  fines: Fine[] = []
  loading = false
  error = ''

  constructor(private fineApi: FineApiService) {}

  ngOnInit() {
    void this.loadFines()
  }

  async loadFines() {
    this.loading = true
    this.error = ''

    try {
      const res = await this.fineApi.getMyFines()
      this.fines = res.data
    } catch {
      this.error = 'ไม่สามารถดึงรายการค่าปรับได้'
    } finally {
      this.loading = false
    }
  }
}

