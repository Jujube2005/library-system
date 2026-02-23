import { Component } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [NgFor],
  templateUrl: './reservations.html'
})
export class ReservationsComponent {
  reservations = [
    { id: 1, member: 'Student 001', book: 'TypeScript เบื้องต้น', status: 'active', position: 1 },
    { id: 2, member: 'Student 002', book: 'Database Design', status: 'active', position: 2 }
  ];
}
