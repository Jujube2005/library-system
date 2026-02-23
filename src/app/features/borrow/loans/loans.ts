import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-loans',
  standalone: true,
  imports: [FormsModule, NgFor],
  templateUrl: './loans.html'
})
export class LoansComponent {
  search = '';

  loans = [
    { id: 1, code: 'LN-0001', member: 'Student 001', book: 'TypeScript เบื้องต้น', due: '2026-03-01', status: 'borrowed' },
    { id: 2, code: 'LN-0002', member: 'Student 002', book: 'Database Design', due: '2026-02-10', status: 'overdue' }
  ];
}
