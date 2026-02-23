import { Injectable } from '@angular/core'
import { ApiService } from './api.service'
import { Profile, UserRole } from '../models/profile.model'

interface UserListResponse {
  data: Profile[]
}

interface UserResponse {
  data: Profile | Profile[]
}

@Injectable({
  providedIn: 'root'
})
export class AdminApiService {
  constructor(private api: ApiService) {}

  getUsers() {
    return this.api.get<UserListResponse>('/api/admin/users')
  }

  updateUserRole(id: string, role: UserRole) {
    return this.api.patch<UserResponse>(`/api/admin/users/${id}/role`, { role })
  }

  updateUserStatus(id: string, isActive: boolean) {
    return this.api.patch<UserResponse>(`/api/admin/users/${id}/status`, { is_active: isActive })
  }
}

