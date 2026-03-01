import { Component, inject, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { NgIf } from '@angular/common'
import { Router, RouterLink, ActivatedRoute } from '@angular/router'
import { AuthService } from '../../../core/auth.service'

@Component({
  selector: 'app-login-view',
  standalone: true,
  imports: [FormsModule, NgIf, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  email = ''
  password = ''
  isSubmitting = false
  errorMessage = ''
  isDarkMode = false
  loginRole: 'student' | 'staff' = 'student'

  private auth = inject(AuthService)
  private router = inject(Router)
  private route = inject(ActivatedRoute)

  constructor() {
    const savedTheme = localStorage.getItem('theme')
    this.isDarkMode = savedTheme === 'dark'
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['role'] === 'staff' || params['role'] === 'student') {
        this.loginRole = params['role']
      }
    })
  }

  setRole(role: 'student' | 'staff') {
    this.loginRole = role
    this.errorMessage = ''
  }

  goBack() {
    this.router.navigateByUrl('/')
  }

  async login() {
    this.errorMessage = ''
    this.isSubmitting = true

    try {
      await this.auth.signIn(this.email, this.password)
      
      // หลังจาก login สำเร็จ ตรวจสอบสิทธิ์ (role)
      // หากเลือก login เป็น staff แต่ role จริงไม่ใช่ staff ให้แสดง error
      // หรือในระบบนี้เราอาจจะอนุญาตให้ login เข้าไปก่อนแล้วค่อยแยกหน้า dashboard
      await this.router.navigateByUrl('/dashboard')
    } catch (err: any) {
      this.errorMessage = err?.message ?? 'Incorrect email or password'
    } finally {
      this.isSubmitting = false
    }
  }
}
