import { Component } from '@angular/core';
import { NgFor, NgClass } from '@angular/common';

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [NgFor, NgClass],
  templateUrl: './overview.html'
})
export class DashboardOverviewComponent {
  stats = [
    { label: 'จำนวนหนังสือทั้งหมด', value: '15,000+', tone: 'bg-sky-50 text-sky-700' },
    { label: 'สมาชิกทั้งหมด', value: '2,500+', tone: 'bg-emerald-50 text-emerald-700' },
    { label: 'กำลังยืมใช้งาน', value: '120', tone: 'bg-amber-50 text-amber-700' },
    { label: 'รายการค้างส่ง', value: '8', tone: 'bg-rose-50 text-rose-700' }
  ];

  alerts = [
    {
      title: 'มีรายการยืมเกินกำหนด',
      detail: 'มีหนังสือ 8 รายการที่เกินกำหนดส่งแล้ว',
      tone: 'bg-rose-50 border-rose-200 text-rose-800'
    },
    {
      title: 'หนังสือยอดนิยม',
      detail: 'สัปดาห์นี้มีการยืมหนังสือหมวดเทคโนโลยีมากที่สุด',
      tone: 'bg-emerald-50 border-emerald-200 text-emerald-800'
    }
  ];
}
