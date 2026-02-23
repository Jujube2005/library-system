import { Component } from '@angular/core';
import { NgFor, NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [NgFor, NgClass, NgIf],
  templateUrl: './overview.html'
})
export class DashboardOverviewComponent {
  stats = [
    { label: 'จำนวนหนังสือทั้งหมด', value: '15,000+', tone: 'bg-[#22c55e]/10 text-[#4ade80]' },
    { label: 'สมาชิกทั้งหมด', value: '2,500+', tone: 'bg-sky-500/10 text-sky-300' },
    { label: 'กำลังยืมใช้งาน', value: '120', tone: 'bg-amber-500/10 text-amber-300' },
    { label: 'รายการค้างส่ง', value: '8', tone: 'bg-rose-500/10 text-rose-300' }
  ];

  alerts = [
    {
      title: 'มีรายการยืมเกินกำหนด',
      detail: 'มีหนังสือ 8 รายการที่เกินกำหนดส่งแล้ว',
      tone: 'border border-rose-500/40 bg-rose-500/10 text-rose-100'
    },
    {
      title: 'หนังสือยอดนิยม',
      detail: 'สัปดาห์นี้มีการยืมหนังสือหมวดเทคโนโลยีมากที่สุด',
      tone: 'border border-[#22c55e]/40 bg-[#22c55e]/10 text-[#bbf7d0]'
    }
  ];

  activeLoans = [
    { id: 'LN-0001', member: 'Student 001', book: 'เพราะเป็นวัยรุ่นจึงเจ็บปวด', due: '2026-03-01', status: 'active' },
    { id: 'LN-0002', member: 'Student 002', book: 'อย่า!', due: '2026-02-28', status: 'overdue' }
  ];
}
