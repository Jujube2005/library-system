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

  loanStats = { active: 0, overdue: 0, returnedToday: 0 };
  showActiveOnly = true; // Default to active/overdue only for better performance

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
    return this.loanStats;
  }

  async loadLoans() {
    this.loadingLoans = true;
    this.loansError = '';
    try {
      // 1. Get stats for the headers
      const statsRes = await this.loanApi.getLoanStats();
      this.loanStats = statsRes.data;

      // 2. Get loan list (filtered if needed)
      const limit = this.showActiveOnly ? 200 : 500;
      const response = await this.loanApi.getAllLoansInSystem(undefined, limit);

      if (this.showActiveOnly) {
        this.loans = response.data.filter(l => l.status === 'active' || l.status === 'overdue');
      } else {
        this.loans = response.data;
      }
    } catch (err: any) {
      this.loansError = err.message || 'ไม่สามารถโหลดรายการการยืมได้';
    } finally {
      this.loadingLoans = false;
      this.cdr.detectChanges();
    }
  }

  toggleActiveFilter() {
    this.showActiveOnly = !this.showActiveOnly;
    void this.loadLoans();
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
      const res = await this.loanApi.returnLoan(loanId);
      const fineAmount = (res.data as any).fine?.amount;

      if (fineAmount > 0) {
        this.showToast(`คืนสำเร็จ! มีค่าปรับจำนวน ${fineAmount} บาท`, 'success');
      } else {
        this.showToast('บันทึกการคืนสำเร็จ', 'success');
      }

      void this.loadLoans();
    } catch (err: any) {
      const msg = err.error?.error || err.message || 'Error';
      this.showToast(msg, 'error');
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
