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
      title: 'อย่า!',
      author: 'ผู้เขียนตัวอย่าง',
      status: 'available',
      coverUrl: '/assets/books/ya.jpg'
    },
    {
      id: 2,
      title: 'ภาพวาดปริศนากับการตามหาฆาตกร',
      author: 'ผู้เขียนตัวอย่าง',
      status: 'reserved',
      coverUrl: '/assets/books/mystery-painting.jpg'
    },
    {
      id: 3,
      title: 'เพราะเป็นวัยรุ่นจึงเจ็บปวด',
      author: 'ผู้เขียนตัวอย่าง',
      status: 'borrowed',
      coverUrl: '/assets/books/youth-pain.jpg'
    }
  ];

  statusClass(status: string) {
    if (status === 'available') return 'bg-[#22c55e]/10 text-[#4ade80]';
    if (status === 'borrowed') return 'bg-amber-500/10 text-amber-300';
    if (status === 'reserved') return 'bg-sky-500/10 text-sky-300';
    return 'bg-rose-500/10 text-rose-300';
  }
}
