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

  newLoan = {
    memberCode: '',
    bookCode: '',
    loanDate: '',
    dueDate: ''
  };

  get filteredLoans() {
    const term = this.search.trim().toLowerCase();
    if (!term) return this.loans;
    return this.loans.filter(l => {
      return (
        l.code.toLowerCase().includes(term) ||
        l.member.toLowerCase().includes(term) ||
        l.book.toLowerCase().includes(term)
      );
    });
  }

  returnBook(loan: { id: number }) {
    this.loans = this.loans.filter(l => l.id !== loan.id);
  }

  createLoan() {
    if (!this.newLoan.memberCode || !this.newLoan.bookCode) return;

    const nextId = this.loans.length ? Math.max(...this.loans.map(l => l.id)) + 1 : 1;
    const code = `LN-${nextId.toString().padStart(4, '0')}`;

    this.loans = [
      ...this.loans,
      {
        id: nextId,
        code,
        member: this.newLoan.memberCode,
        book: this.newLoan.bookCode,
        due: this.newLoan.dueDate || this.newLoan.loanDate || '',
        status: 'borrowed'
      }
    ];

    this.newLoan = {
      memberCode: '',
      bookCode: '',
      loanDate: '',
      dueDate: ''
    };
  }
}
