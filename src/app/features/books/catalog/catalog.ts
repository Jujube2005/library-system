import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgClass, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-book-catalog',
  standalone: true,
  imports: [FormsModule, NgFor, NgClass, NgSwitch, NgSwitchCase, NgSwitchDefault, RouterLink],
  templateUrl: './catalog.html'
})
export class BookCatalogComponent {
  query = '';
  category = 'all';
  sort = 'title';

  books = [
    {
      id: 1,
      title: 'I Decided to Live as Myself',
      author: 'ผู้เขียนตัวอย่าง',
      status: 'available',
      coverUrl: '/assets/i-decided-to-live-as-myself.jpg'
    },
    {
      id: 2,
      title: 'ก็แค่ปล่อยมันไป',
      author: 'ผู้เขียนตัวอย่าง',
      status: 'available',
      coverUrl: '/assets/ก็แค่ปล่อยมันไป-Dont-Break-Apart.jpg'
    },
    {
      id: 3,
      title: 'กล้าที่จะถูกเกลียด',
      author: 'ผู้เขียนตัวอย่าง',
      status: 'available',
      coverUrl: '/assets/กล้าที่จะถูกเกลียด.jpg'
    },
    {
      id: 4,
      title: 'คัมภีร์การลงทุนแบบคุ้มค่า',
      author: 'ผู้เขียนตัวอย่าง',
      status: 'available',
      coverUrl: '/assets/คัมภีร์การลงทุนแบบคุ้มค่า.jpg'
    },
    {
      id: 5,
      title: 'เจ้าชายน้อย Le Petit Prince',
      author: 'ผู้เขียนตัวอย่าง',
      status: 'available',
      coverUrl: '/assets/เจ้าชายน้อย-Le-Petit-Prince.jpg'
    },
    {
      id: 6,
      title: 'เซเปียนส์ ประวัติย่อมนุษยชาติ',
      author: 'ผู้เขียนตัวอย่าง',
      status: 'available',
      coverUrl: '/assets/เซเปียนส์-ประวัติย่อมนุษยชาติ.jpg'
    },
    {
      id: 7,
      title: 'ต้นส้มแสนรัก',
      author: 'ผู้เขียนตัวอย่าง',
      status: 'available',
      coverUrl: '/assets/ต้นส้มแสนรัก.jpg'
    },
    {
      id: 8,
      title: 'เพราะเป็นวัยรุ่นจึงเจ็บปวด',
      author: 'ผู้เขียนตัวอย่าง',
      status: 'available',
      coverUrl: '/assets/เพราะเป็นวัยรุ่นจึงเจ็บปวด.jpg'
    },
    {
      id: 9,
      title: 'อยากตาย แต่ก็อยากกินต๊อกบกกี',
      author: 'ผู้เขียนตัวอย่าง',
      status: 'available',
      coverUrl: '/assets/อยากตาย-แต่ก็อยากกินต๊อกบกกี.jpg'
    }
  ];

  categories = [
    { id: 'all', label: 'ทั้งหมด' },
    { id: 'prism', label: 'Prism' },
    { id: 'youth', label: 'วัยรุ่น' }
  ];

  selectedBook = this.books[0];

  selectBook(book: any) {
    this.selectedBook = book;
  }

  statusClass(status: string) {
    if (status === 'available') return 'bg-[#22c55e]/10 text-[#4ade80]';
    if (status === 'borrowed') return 'bg-amber-500/10 text-amber-300';
    if (status === 'reserved') return 'bg-sky-500/10 text-sky-300';
    return 'bg-rose-500/10 text-rose-300';
  }
}
