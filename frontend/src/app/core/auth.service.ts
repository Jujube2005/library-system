import { Injectable } from '@angular/core'
import { supabase } from '../../lib/supabase'

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  async signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      throw error
    }
  }

  async signOut() {
    await supabase.auth.signOut()
  }

  async isLoggedIn(): Promise<boolean> {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Failed to get session', error)
      return false
    }

    return !!data.session
  }

  async getAccessToken(): Promise<string | null> {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      return null
    }

    return data.session?.access_token ?? null
  }
}

