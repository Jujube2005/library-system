import { Component } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { supabase } from '../../../../lib/supabase'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html'
})
export class LoginComponent {
  email = ''
  password = ''

  async login() {
    if (!supabase) {
      alert('ยังไม่ได้ตั้งค่า Supabase URL และ Key')
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: this.email,
      password: this.password
    })

    if (error) alert(error.message)
    else alert('login success')
  }
}
