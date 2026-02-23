import { Component } from '@angular/core';
import { LoginComponent } from './pages/login/login';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LoginComponent],  
  templateUrl: './app.html',
})
export class App {}
