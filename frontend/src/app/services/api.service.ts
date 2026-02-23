import { Injectable } from '@angular/core'
import { AuthService } from '../core/auth.service'

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:4000'

  constructor(private auth: AuthService) {}

  private buildUrl(path: string) {
    return `${this.baseUrl}${path}`
  }

  private async buildHeaders(extra?: HeadersInit) {
    const token = await this.auth.getAccessToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(extra as Record<string, string> | undefined)
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }

  async get<T>(path: string, options?: RequestInit): Promise<T> {
    const headers = await this.buildHeaders(options?.headers ?? {})

    const res = await fetch(this.buildUrl(path), {
      method: 'GET',
      credentials: 'include',
      headers,
      ...options
    })

    if (!res.ok) {
      throw new Error(`Request failed: ${res.status}`)
    }

    return res.json() as Promise<T>
  }

  async post<T>(path: string, body: unknown, options?: RequestInit): Promise<T> {
    const headers = await this.buildHeaders(options?.headers ?? {})

    const res = await fetch(this.buildUrl(path), {
      method: 'POST',
      credentials: 'include',
      headers,
      body: JSON.stringify(body),
      ...options
    })

    if (!res.ok) {
      throw new Error(`Request failed: ${res.status}`)
    }

    return res.json() as Promise<T>
  }

  async patch<T>(path: string, body: unknown, options?: RequestInit): Promise<T> {
    const headers = await this.buildHeaders(options?.headers ?? {})

    const res = await fetch(this.buildUrl(path), {
      method: 'PATCH',
      credentials: 'include',
      headers,
      body: JSON.stringify(body),
      ...options
    })

    if (!res.ok) {
      throw new Error(`Request failed: ${res.status}`)
    }

    return res.json() as Promise<T>
  }

  async delete<T>(path: string, options?: RequestInit): Promise<T> {
    const headers = await this.buildHeaders(options?.headers ?? {})

    const res = await fetch(this.buildUrl(path), {
      method: 'DELETE',
      credentials: 'include',
      headers,
      ...options
    })

    if (!res.ok) {
      throw new Error(`Request failed: ${res.status}`)
    }

    return res.json() as Promise<T>
  }
}
