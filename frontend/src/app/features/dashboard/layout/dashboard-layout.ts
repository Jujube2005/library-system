import { Component, inject } from '@angular/core'
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router'
import { NgIf } from '@angular/common'
import { UserApiService } from '../../../services/user-api.service'
import { Profile } from '../../../models/profile.model'

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, NgIf],
  templateUrl: './dashboard-layout.html',
  styleUrls: ['./dashboard-layout.css']
})
export class DashboardLayoutComponent {
  profile: Profile | null = null
  private userApi = inject(UserApiService)

  constructor() {
    void this.loadProfile()
  }

  get isStaff() {
    return this.profile?.role === 'staff'
  }

  private async loadProfile() {
    try {
      const profile = await this.userApi.getMe()
      this.profile = profile
    } catch {
      this.profile = null
    }
  }
}
