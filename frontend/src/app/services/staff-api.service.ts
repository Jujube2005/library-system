import { Injectable } from '@angular/core'
import { ApiService } from './api.service'
import { UserRole } from '../models/profile.model'

interface InviteResponse {
  data: {
    id: string
    email: string
    fullName: string
    role: string
  }
}

@Injectable({
  providedIn: 'root'
})
export class StaffApiService {
  constructor(private api: ApiService) {}

  inviteUser(email: string, fullName: string, role: UserRole) {
    return this.api.post<InviteResponse>('/api/staff/users/invite', {
      email,
      fullName,
      role
    })
  }
}

