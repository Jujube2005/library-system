import { Component } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [NgFor],
  templateUrl: './reports.html'
})
export class ReportsComponent {
  popularBooks = [
    { title: 'TypeScript เบื้องต้น', count: 32 },
    { title: 'Database Design', count: 24 },
    { title: 'UI/UX Design', count: 18 }
  ];
}
