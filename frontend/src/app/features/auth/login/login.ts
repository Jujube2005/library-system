import { Component, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { NgIf } from '@angular/common'
import { Router, RouterLink } from '@angular/router'
import { AuthService } from '../../../core/auth.service'

@Component({
  selector: 'app-login-view',
  standalone: true,
  imports: [FormsModule, NgIf, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  email = ''
  password = ''
  isSubmitting = false
  errorMessage = ''
  isDarkMode = false

  private auth = inject(AuthService)
  private router = inject(Router)

  constructor() {
    const savedTheme = localStorage.getItem('theme')
    this.isDarkMode = savedTheme === 'dark'
  }

  goBack() {
    this.router.navigateByUrl('/')
  }

  async login() {
    this.errorMessage = ''
    this.isSubmitting = true

    try {
      await this.auth.signIn(this.email, this.password)
      await this.router.navigateByUrl('/dashboard')
    } catch (err: any) {
      this.errorMessage = err?.message ?? 'Incorrect email or password'
    } finally {
      this.isSubmitting = false
    }
  }
}
