import { Injectable } from '@angular/core'
import { ApiService } from './api.service'
import { Profile } from '../models/profile.model'

@Injectable({
  providedIn: 'root'
})
export class UserApiService {
  constructor(private api: ApiService) {}

  getMe() {
    return this.api.get<Profile>('/api/users/me')
  }
}
