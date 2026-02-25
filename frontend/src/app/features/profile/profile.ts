import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core'
import { NgIf, DatePipe } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { UserApiService } from '../../services/user-api.service'
import { Profile } from '../../models/profile.model'

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [NgIf, FormsModule, DatePipe],
    templateUrl: './profile.html',
    styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
    profile: Profile | null = null
    loading = false
    saving = false
    message = ''
    error = ''

    private userApi = inject(UserApiService)
    private cdr = inject(ChangeDetectorRef)

    ngOnInit() {
        void this.loadProfile()
    }

    async loadProfile() {
        this.loading = true
        try {
            this.profile = await this.userApi.getMe()
        } catch (err) {
            this.error = 'ไม่สามารถโหลดข้อมูลโปรไฟล์ได้'
        } finally {
            this.loading = false
            this.cdr.detectChanges()
        }
    }

    async saveProfile() {
        if (!this.profile) return

        this.saving = true
        this.message = ''
        this.error = ''

        try {
            if (!this.profile) return
            await this.userApi.updateMe({
                full_name: this.profile.full_name,
                email: this.profile.email,
                student_id: this.profile.student_id,
                phone: this.profile.phone
            })
            this.message = 'บันทึกข้อมูลสำเร็จ'
        } catch (err) {
            this.error = 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
        } finally {
            this.saving = false
            this.cdr.detectChanges()
        }
    }
}
