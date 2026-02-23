import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [NgIf, RouterLink],
  templateUrl: './book-detail.html'
})
export class BookDetailComponent {
  hasAvailableCopy = true;
  isReserved = false;
}
