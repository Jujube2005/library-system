import { Component } from '@angular/core'
import { supabase } from '../../../lib/supabase'
import { FormsModule } from '@angular/forms'

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html'
})
export class LoginComponent {
  email = ''
  password = ''

  async login() {
    const { error } = await supabase.auth.signInWithPassword({
      email: this.email,
      password: this.password
    })

    if (error) alert(error.message)
    else alert('login success')
  }
}
