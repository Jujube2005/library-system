import { Component } from '@angular/core';
import { NgFor, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgFor, NgClass, FormsModule, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {
  activeTab = 'books';
  query = '';

  readonly tabs = [
    { id: 'books', label: 'ค้นหาหนังสือ' },
    { id: 'digital', label: 'ห้องสมุดดิจิทัล' },
    { id: 'services', label: 'บริการห้องสมุด' }
  ];

  setTab(id: string) {
    this.activeTab = id;
  }

  search() {
    console.log('search', this.activeTab, this.query);
  }
}
