import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoanApiService } from '../../../services/loan-api.service'; // Will create this service next
import { Loan, LoanStatus } from '../../../models/loan.model';
import { Book } from '../../../models/book.model'; // For displaying book info
import { Profile } from '../../../models/profile.model'; // For displaying user info

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
  successMessage = '';
  errorMessage = '';

  // For creating a new loan
  newLoan: { userId: string; bookId: string; dueDate: string } = {
    userId: '',
    bookId: '',
    dueDate: ''
  };
  isCreatingLoan = false;

  // For editing/renewing a loan
  selectedLoan: Loan | null = null;
  editLoanForm: Partial<Loan> = {};
  isSavingEdit = false;

  private loanApi = inject(LoanApiService);

  ngOnInit() {
    void this.loadLoans();
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
    }
  }

  async createLoan() {
    this.isCreatingLoan = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const createdLoan = await this.loanApi.createLoan(this.newLoan.userId, this.newLoan.bookId, this.newLoan.dueDate);
      this.successMessage = `บันทึกการยืมสำหรับผู้ใช้ ${createdLoan.data.user_id} และหนังสือ ${createdLoan.data.book_id} สำเร็จ!`;
      // Reset form
      this.newLoan = { userId: '', bookId: '', dueDate: '' };
      void this.loadLoans(); // Reload loans after creation
    } catch (err: any) {
      this.errorMessage = err.message || 'ไม่สามารถบันทึกการยืมได้';
    } finally {
      this.isCreatingLoan = false;
    }
  }

  editLoan(loan: Loan) {
    this.selectedLoan = { ...loan };
    this.editLoanForm = { ...loan };
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelEdit() {
    this.selectedLoan = null;
    this.editLoanForm = {};
    this.errorMessage = '';
    this.successMessage = '';
  }

  async saveEditedLoan() {
    if (!this.selectedLoan?.id) return;

    this.isSavingEdit = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      // Assuming updateLoan method exists in LoanApiService for general updates
      // For now, we'll focus on status and due_date if needed
      const updatedLoan = await this.loanApi.updateLoan(this.selectedLoan.id, this.editLoanForm);
      this.successMessage = `อัปเดตการยืม ${updatedLoan.data.id} สำเร็จ!`;
      this.selectedLoan = null;
      void this.loadLoans();
    } catch (err: any) {
      this.errorMessage = err.message || 'ไม่สามารถอัปเดตการยืมได้';
    } finally {
      this.isSavingEdit = false;
    }
  }

  async returnLoan(loanId: string) {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการบันทึกการคืนสำหรับการยืม ID: ${loanId}?`)) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    try {
      await this.loanApi.returnLoan(loanId);
      this.successMessage = `บันทึกการคืนสำหรับการยืม ID: ${loanId} สำเร็จ!`;
      void this.loadLoans();
    } catch (err: any) {
      this.errorMessage = err.message || 'ไม่สามารถบันทึกการคืนได้';
    }
  }

  async renewLoan(loanId: string, currentDueDate: string) {
    const newDueDate = prompt(`ป้อนวันครบกำหนดใหม่สำหรับการยืม ID: ${loanId} (ปัจจุบัน: ${currentDueDate}):`);
    if (!newDueDate) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    try {
      await this.loanApi.renewLoanByStaff(loanId, newDueDate);
      this.successMessage = `ต่ออายุการยืม ID: ${loanId} เป็น ${newDueDate} สำเร็จ!`;
      void this.loadLoans();
    } catch (err: any) {
      this.errorMessage = err.message || 'ไม่สามารถต่ออายุการยืมได้';
    }
  }

  // Helper to get user full name from joined data
  getUserFullName(loan: Loan): string {
    return loan.user && loan.user.length > 0 ? loan.user[0].full_name : 'N/A';
  }

  // Helper to get book title from joined data
  getBookTitle(loan: Loan): string {
    return loan.books ? loan.books.title : 'N/A';
  }
}
