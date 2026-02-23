import { Injectable } from '@angular/core'
import { ApiService } from './api.service'
import { Fine } from '../models/fine.model'

interface FineListResponse {
  data: Fine[]
}

@Injectable({
  providedIn: 'root'
})
export class FineApiService {
  constructor(private api: ApiService) {}

  getMyFines() {
    return this.api.get<FineListResponse>('/api/fines/my')
  }
}

