import { Component, inject, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { NgIf } from '@angular/common'
import { Router, RouterLink, ActivatedRoute } from '@angular/router'
import { AuthService } from '../../../core/auth.service'

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [FormsModule, NgIf, RouterLink],
    templateUrl: './register.html',
    styleUrls: ['./register.css']
})
export class RegisterComponent implements OnInit {
    email = ''
    password = ''
    confirmPassword = ''
    fullName = ''
    phone = ''
    studentId = ''
    role = 'student'
    isSubmitting = false
    errorMessage = ''
    isDarkMode = false

    private auth = inject(AuthService)
    private router = inject(Router)
    private route = inject(ActivatedRoute)

    constructor() {
        const savedTheme = localStorage.getItem('theme')
        this.isDarkMode = savedTheme === 'dark'
    }

    ngOnInit() {
        // รับค่า role จาก query parameters เช่น /register?role=staff
        this.route.queryParams.subscribe(params => {
            if (params['role']) {
                this.role = params['role']
            }
        })
    }

    goBack() {
        this.router.navigateByUrl('/')
    }

    async register() {
        this.errorMessage = ''

        // 1. ตรวจสอบข้อมูลครบถ้วน (ยกเว้น studentId ที่เป็น optional)
        if (!this.email || !this.password || !this.confirmPassword || !this.fullName || !this.phone) {
            this.errorMessage = 'กรุณากรอกข้อมูลให้ครบถ้วน'
            return
        }

        // 2. ตรวจสอบรหัสผ่านตรงกัน
        if (this.password !== this.confirmPassword) {
            this.errorMessage = 'รหัสผ่านไม่ตรงกัน'
            return
        }

        // 3. ตรวจสอบความยาวรหัสผ่าน (ขั้นต่ำ 6 ตัวตามมาตรฐาน Supabase)
        if (this.password.length < 6) {
            this.errorMessage = 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร'
            return
        }

        this.isSubmitting = true
        
        try {
            await this.auth.signUp(
                this.email,
                this.password,
                this.fullName,
                this.phone,
                this.studentId || undefined,
                this.role
            )
            alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ')
            // พาล็อกอินตาม role ที่สมัคร
            await this.router.navigate(['/login'], { queryParams: { role: this.role } })
        } catch (err: any) {
            this.errorMessage = err?.message ?? 'สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
        } finally {
            this.isSubmitting = false
        }
    }
}
