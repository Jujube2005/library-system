import { Component, inject, ChangeDetectorRef } from '@angular/core'
import { Router, RouterOutlet } from '@angular/router'
import { UserApiService } from '../../../services/user-api.service'
import { AuthService } from '../../../core/auth.service'
import { Profile } from '../../../models/profile.model'
import { NavbarComponent } from '../../../navbar/navbar'
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar'

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent],
  templateUrl: './dashboard-layout.html',
  styleUrls: ['./dashboard-layout.css']
})
export class DashboardLayoutComponent {
  profile: Profile | null = null
  isDarkMode = false
  private userApi = inject(UserApiService)
  private authService = inject(AuthService)
  private router = inject(Router)
  private cdr = inject(ChangeDetectorRef)

  constructor() {
    void this.loadProfile()
    this.isDarkMode = localStorage.getItem('theme') === 'dark'
    this.applyTheme()
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light')
    this.applyTheme()
  }

  private applyTheme() {
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
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
    } finally {
      this.cdr.detectChanges()
    }
  }

  async logout() {
    await this.authService.signOut()
    await this.router.navigateByUrl('/')
  }
}

