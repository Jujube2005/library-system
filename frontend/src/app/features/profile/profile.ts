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
    isEditing = false
    saving = false
    error = ''

    // Edit fields
    editFullName = ''
    editPhone = ''
    editStudentId = ''

    private userApi = inject(UserApiService)
    private cdr = inject(ChangeDetectorRef)

    get isStaff(): boolean {
        return this.profile?.role === 'staff'
    }

    ngOnInit() {
        void this.loadProfile()
    }

    async loadProfile() {
        this.loading = true
        this.error = ''
        try {
            this.profile = await this.userApi.getMe()
            if (this.profile) {
                this.resetEditFields()
            }
        } catch (err) {
            console.error('Error loading profile:', err)
            this.error = 'ไม่สามารถโหลดข้อมูลโปรไฟล์ได้ กรุณาลองใหม่อีกครั้ง'
        } finally {
            this.loading = false
            this.cdr.detectChanges()
        }
    }

    resetEditFields() {
        if (this.profile) {
            this.editFullName = this.profile.full_name || ''
            this.editPhone = this.profile.phone || ''
            this.editStudentId = this.profile.student_id || ''
        }
    }

    toggleEdit() {
        if (this.isEditing) {
            this.resetEditFields()
        }
        this.isEditing = !this.isEditing
    }

    async saveProfile() {
        if (!this.profile) return

        this.saving = true
        this.error = ''
        try {
            const updates = {
                full_name: this.editFullName,
                phone: this.editPhone,
                student_id: this.editStudentId
            }
            this.profile = await this.userApi.updateMe(updates as any)
            this.isEditing = false
            alert('อัปเดตโปรไฟล์สำเร็จ')
        } catch (err: any) {
            console.error('Error saving profile:', err)
            this.error = err.message || 'ไม่สามารถบันทึกข้อมูลได้'
        } finally {
            this.saving = false
            this.cdr.detectChanges()
        }
    }
}
