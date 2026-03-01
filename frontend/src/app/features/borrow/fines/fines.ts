import { Component, OnInit } from '@angular/core'
import { NgFor, NgIf } from '@angular/common'
import { FineApiService } from '../../../services/fine-api.service'
import { UserApiService } from '../../../services/user-api.service'
import { Fine } from '../../../models/fine.model'
import { Profile } from '../../../models/profile.model'

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
  profile: Profile | null = null

  constructor(
    private fineApi: FineApiService,
    private userApi: UserApiService
  ) {}

  get isStaff() {
    return this.profile?.role === 'staff'
  }

  get outstandingTotal() {
    return this.fines
      .filter(f => f.status === 'unpaid')
      .reduce((sum, f) => sum + f.amount, 0)
  }

  ngOnInit() {
    void this.init()
  }

  private async init() {
    await this.loadProfile()
    await this.loadFines()
  }

  private async loadProfile() {
    try {
      this.profile = await this.userApi.getMe()
    } catch {
      this.profile = null
    }
  }

  async loadFines() {
    this.loading = true
    this.error = ''

    try {
      if (this.isStaff) {
        const res = await this.fineApi.getAllFines()
        this.fines = res.data
      } else {
        const res = await this.fineApi.getMyFines()
        this.fines = res.data
      }
    } catch {
      this.error = 'ไม่สามารถดึงรายการค่าปรับได้'
    } finally {
      this.loading = false
    }
  }

  async markAsPaid(fine: Fine) {
    if (this.loading || !this.isStaff || fine.status === 'paid') return

    try {
      await this.fineApi.markAsPaid(fine.id)
      await this.loadFines()
    } catch {
      this.error = 'ไม่สามารถอัปเดตสถานะค่าปรับได้'
    }
  }
}

