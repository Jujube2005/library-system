import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core'
import { NgIf, NgFor, DatePipe } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { UserApiService } from '../../services/user-api.service'
import { Profile } from '../../models/profile.model'

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [NgIf, NgFor, FormsModule, DatePipe],
    templateUrl: './profile.html',
    styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit {
    profile: Profile | null = null
    loading = false
    error = ''

    private userApi = inject(UserApiService)
    private cdr = inject(ChangeDetectorRef)

    ngOnInit() {
        void this.loadProfile()
    }

    async loadProfile() {
        this.loading = true
        this.error = ''
        try {
            this.profile = await this.userApi.getMe()
        } catch (err) {
            console.error('Error loading profile:', err)
            this.error = 'ไม่สามารถโหลดข้อมูลโปรไฟล์ได้ กรุณาลองใหม่อีกครั้ง'
        } finally {
            this.loading = false
            this.cdr.detectChanges()
        }
    }
}
