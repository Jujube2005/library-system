import { Component } from '@angular/core';
import { NgFor, NgClass, DecimalPipe, NgIf } from '@angular/common';

@Component({
  selector: 'app-fines',
  standalone: true,
  imports: [NgFor, NgClass, DecimalPipe, NgIf],
  templateUrl: './fines.html'
})
export class FinesComponent {
  fines = [
    { id: 1, member: 'Student 001', amount: 50, status: 'unpaid' },
    { id: 2, member: 'Student 002', amount: 20, status: 'paid' }
  ];
}
