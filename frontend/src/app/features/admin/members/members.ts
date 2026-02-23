import { Component, OnInit } from '@angular/core'
import { NgFor, NgIf } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { AdminApiService } from '../../../services/admin-api.service'
import { StaffApiService } from '../../../services/staff-api.service'
import { Profile, UserRole } from '../../../models/profile.model'

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './members.html'
})
export class MembersComponent implements OnInit {
  users: Profile[] = []
  filtered: Profile[] = []
  search = ''
  loading = false
  error = ''

  inviteEmail = ''
  inviteName = ''
  inviteRole: UserRole = 'student'
  inviting = false

  savingUserId: string | null = null

  constructor(
    private adminApi: AdminApiService,
    private staffApi: StaffApiService
  ) {}

  ngOnInit() {
    void this.load()
  }

  async load() {
    this.loading = true
    this.error = ''

    try {
      const res = await this.adminApi.getUsers()
      this.users = res.data
      this.applyFilter()
    } catch {
      this.error = 'ไม่สามารถดึงรายการผู้ใช้ได้'
    } finally {
      this.loading = false
    }
  }

  applyFilter() {
    const q = this.search.toLowerCase()

    if (!q) {
      this.filtered = [...this.users]
      return
    }

    this.filtered = this.users.filter(u =>
      (u.full_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.student_id?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q))
    )
  }

  async changeRole(user: Profile, role: UserRole) {
    if (this.savingUserId) return

    this.savingUserId = user.id
    this.error = ''

    try {
      const res = await this.adminApi.updateUserRole(user.id, role)
      const updated = Array.isArray(res.data) ? res.data[0] : res.data

      this.users = this.users.map(u => (u.id === user.id ? (updated as Profile) : u))
      this.applyFilter()
    } catch {
      this.error = 'ไม่สามารถเปลี่ยนสิทธิ์ผู้ใช้ได้'
    } finally {
      this.savingUserId = null
    }
  }

  async toggleActive(user: Profile) {
    if (this.savingUserId) return

    this.savingUserId = user.id
    this.error = ''

    try {
      const res = await this.adminApi.updateUserStatus(user.id, !user.is_active)
      const updated = res.data as Profile

      this.users = this.users.map(u => (u.id === user.id ? updated : u))
      this.applyFilter()
    } catch {
      this.error = 'ไม่สามารถเปลี่ยนสถานะบัญชีได้'
    } finally {
      this.savingUserId = null
    }
  }

  async invite() {
    if (this.inviting) return
    if (!this.inviteEmail || !this.inviteName) {
      this.error = 'กรุณากรอก email และชื่อให้ครบ'
      return
    }

    this.inviting = true
    this.error = ''

    try {
      await this.staffApi.inviteUser(this.inviteEmail, this.inviteName, this.inviteRole)
      this.inviteEmail = ''
      this.inviteName = ''
      this.inviteRole = 'student'
      await this.load()
    } catch {
      this.error = 'ไม่สามารถส่ง invite ได้'
    } finally {
      this.inviting = false
    }
  }
}
