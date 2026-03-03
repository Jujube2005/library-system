import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoanApiService } from '../../../services/loan-api.service';
import { Loan } from '../../../models/loan.model';

@Component({
  selector: 'app-loan-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './loan-management.html',
  styleUrls: ['./loan-management.css']
})
export class LoanManagementComponent implements OnInit {
  loans: Loan[] = [];
  loadingLoans = false;
  loansError = '';

  // For Toast
  toastMessage: { message: string, type: 'success' | 'error' } | null = null;
  private toastTimeout: any;

  // New Loan Form
  newLoan = {
    userId: '',
    bookId: ''
  };
  isCreatingLoan = false;

  private loanApi = inject(LoanApiService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    void this.loadLoans();
  }

  showToast(message: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = { message, type };
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.toastMessage = null;
      this.cdr.detectChanges();
    }, 3000);
    this.cdr.detectChanges();
  }

  get stats() {
    const active = this.loans.filter(l => l.status === 'active').length;
    const overdue = this.loans.filter(l => l.status === 'overdue').length;
    const returnedToday = this.loans.filter(l => {
      if (l.status !== 'returned' || !l.return_date) return false;
      const today = new Date().toISOString().split('T')[0];
      return l.return_date.startsWith(today);
    }).length;

    return { active, overdue, returnedToday };
  }

  async loadLoans() {
    this.loadingLoans = true;
    this.loansError = '';
    try {
      const response = await this.loanApi.getAllLoansInSystem();
      this.loans = response.data;
    } catch (err: any) {
      this.loansError = err.message || 'ไม่สามารถโหลดรายการการยืมได้';
    } finally {
      this.loadingLoans = false;
      this.cdr.detectChanges();
    }
  }

  async createLoan() {
    if (!this.newLoan.userId || !this.newLoan.bookId) {
      this.showToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
      return;
    }

    this.isCreatingLoan = true;
    try {
      // Due date is now handled by backend based on role
      const res = await this.loanApi.createLoan(this.newLoan.userId, this.newLoan.bookId, '');
      this.showToast('บันทึกการยืมสำเร็จ!');
      this.newLoan = { userId: '', bookId: '' };
      void this.loadLoans();
    } catch (err: any) {
      const msg = err.error?.error || err.message || 'ไม่สามารถบันทึกการยืมได้';
      this.showToast(msg, 'error');
    } finally {
      this.isCreatingLoan = false;
      this.cdr.detectChanges();
    }
  }

  async returnLoan(loanId: string) {
    try {
      await this.loanApi.returnLoan(loanId);
      this.showToast('บันทึกการคืนสำเร็จ');
      void this.loadLoans();
    } catch (err: any) {
      this.showToast(err.message || 'Error', 'error');
    }
  }

  async renewLoan(loanId: string, currentDueDate: string) {
    const newDueDate = prompt(`ระบุวันที่คืนใหม่ (ปัจจุบัน: ${currentDueDate}):`);
    if (!newDueDate) return;

    try {
      await this.loanApi.renewLoanByStaff(loanId, newDueDate);
      this.showToast('ต่ออายุสำเร็จ');
      void this.loadLoans();
    } catch (err: any) {
      this.showToast(err.message || 'Error', 'error');
    }
  }

  getUserFullName(loan: Loan): string {
    return (loan as any).user?.full_name || 'Unknown User';
  }

  getBookTitle(loan: Loan): string {
    return (loan as any).book?.title || 'Unknown Book';
  }
}
