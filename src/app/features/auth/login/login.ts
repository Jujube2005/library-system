import { Component } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { NgIf } from '@angular/common'
import { supabase } from '../../../../lib/supabase'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './login.html'
})
export class LoginComponent {
  email = ''
  password = ''
  isSubmitting = false
  errorMessage = ''

  async login() {
    if (!supabase) {
      this.errorMessage = 'ยังไม่ได้ตั้งค่า Supabase URL และ Key'
      return
    }

    this.isSubmitting = true
    this.errorMessage = ''

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: this.email,
        password: this.password
      })

      if (error) {
        this.errorMessage = error.message
        return
      }

      window.location.href = '/dashboard'
    } catch {
      this.errorMessage = 'Incorrect email or password'
    } finally {
      this.isSubmitting = false
    }
  }
}
