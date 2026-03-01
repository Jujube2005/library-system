import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookApiService } from '../../../services/book-api.service';
import { Book } from '../../../models/book.model';

@Component({
  selector: 'app-book-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './book-management.html',
  styleUrls: ['./book-management.css']
})
export class BookManagementComponent implements OnInit {
  // Form fields for new book
  newBook: Omit<Book, 'id' | 'created_at' | 'updated_at' | 'available_copies' | 'status'> = {
    title: '',
    author: '',
    isbn: '',
    category: '',
    shelf_location: '',
    total_copies: 1
  };
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  // Book list and editing
  books: Book[] = [];
  loadingBooks = false;
  booksError = '';
  selectedBook: Book | null = null; // Book currently being edited
  editBookForm: Partial<Book> = {}; // Form data for editing
  isSavingEdit = false;

  searchQuery = ''; // New property for search input
  allBooks: Book[] = []; // To store all books before filtering

  private bookApi = inject(BookApiService);

  ngOnInit() {
    void this.loadBooks();
  }

  async loadBooks() {
    this.loadingBooks = true;
    this.booksError = '';
    try {
      const response = await this.bookApi.searchBooks({});
      this.allBooks = response.data; // Store all books
      this.applyFilter(); // Apply filter after loading
    } catch (err: any) {
      this.booksError = err.message || 'ไม่สามารถโหลดรายการหนังสือได้';
    } finally {
      this.loadingBooks = false;
    }
  }

  applyFilter() {
    // ปรับปรุงประสิทธิภาพการกรองโดยการใช้ debounce หรือตรวจสอบความยาว (ในที่นี้ทำแบบเรียบง่ายแต่ลดภาระ UI)
    if (!this.searchQuery || this.searchQuery.length < 2) {
      this.books = [...this.allBooks].slice(0, 50); // โหลดแค่ 50 เล่มแรกเพื่อความเร็ว
      return;
    }

    const lowerCaseQuery = this.searchQuery.toLowerCase();
    this.books = this.allBooks.filter(book =>
      book.title.toLowerCase().includes(lowerCaseQuery) ||
      book.author.toLowerCase().includes(lowerCaseQuery) ||
      book.isbn.toLowerCase().includes(lowerCaseQuery) ||
      book.category.toLowerCase().includes(lowerCaseQuery)
    ).slice(0, 50); // จำกัดผลลัพธ์การค้นหาเพื่อไม่ให้ UI กระตุก
  }

  async createBook() {
<<<<<<< HEAD
    // Validation
    if (this.newBook.isbn && this.newBook.isbn.replace(/[-\s]/g, '').length > 13) {
      this.errorMessage = 'ISBN ต้องไม่เกิน 13 ตัวอักษร (ไม่รวมขีดหรือเว้นวรรค)';
      return;
    }

=======
>>>>>>> ef204752f8201bc1bc181265c95d460b01f0ce6c
    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const createdBook = await this.bookApi.createBook(this.newBook);
      this.successMessage = `เพิ่มหนังสือ "${createdBook.data.title}" สำเร็จ!`;
      // Reset form
      this.newBook = {
        title: '',
        author: '',
        isbn: '',
        category: '',
        shelf_location: '',
        total_copies: 1
      };
      void this.loadBooks(); // Reload books after creation
    } catch (err: any) {
<<<<<<< HEAD
      console.error('Create Book Error - Full Error Object:', err);
      const backendError = err.error;
      if (backendError) {
        console.error('Backend Error Body:', JSON.stringify(backendError, null, 2));
      }
      
      if (backendError?.error) {
        let msg = `Backend Error: ${backendError.error}`;
        if (backendError.details) msg += ` | Details: ${backendError.details}`;
        if (backendError.hint) msg += ` | Hint: ${backendError.hint}`;
        if (backendError.code) msg += ` | Code: ${backendError.code}`;
        this.errorMessage = msg;
      } else if (backendError?.message) {
        this.errorMessage = `Backend Message: ${backendError.message}`;
      } else if (err.status) {
        // Fallback if structure is different
        this.errorMessage = `HTTP ${err.status}: ${JSON.stringify(backendError || err.message)}`;
      } else {
        this.errorMessage = err.message || 'ไม่สามารถเพิ่มหนังสือได้';
      }
=======
      this.errorMessage = err.message || 'ไม่สามารถเพิ่มหนังสือได้';
>>>>>>> ef204752f8201bc1bc181265c95d460b01f0ce6c
    } finally {
      this.isSubmitting = false;
    }
  }

  editBook(book: Book) {
    this.selectedBook = { ...book }; // Create a copy to avoid direct mutation
    this.editBookForm = { ...book }; // Initialize form with current book data
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelEdit() {
    this.selectedBook = null;
    this.editBookForm = {};
    this.errorMessage = '';
    this.successMessage = '';
  }

  async saveEditedBook() {
    if (!this.selectedBook?.id) return;

    this.isSavingEdit = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const updatedBook = await this.bookApi.updateBook(this.selectedBook.id, this.editBookForm);
      this.successMessage = `อัปเดตหนังสือ "${updatedBook.data.title}" สำเร็จ!`;
      this.selectedBook = null; // Close edit form
      void this.loadBooks(); // Reload books after update
    } catch (err: any) {
      this.errorMessage = err.message || 'ไม่สามารถอัปเดตหนังสือได้';
    } finally {
      this.isSavingEdit = false;
    }
  }

  async deleteBook(bookId: string, bookTitle: string) {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบหนังสือ "${bookTitle}"?`)) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    try {
      await this.bookApi.deleteBook(bookId);
      this.successMessage = `ลบหนังสือ "${bookTitle}" สำเร็จ!`;
      void this.loadBooks(); // Reload books after deletion
    } catch (err: any) {
      this.errorMessage = err.message || 'ไม่สามารถลบหนังสือได้';
    }
  }

  async updateCopies(bookId: string, bookTitle: string, change: number) {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการ ${change > 0 ? 'เพิ่ม' : 'ลด'} จำนวนสำเนาหนังสือ "${bookTitle}" ${Math.abs(change)} เล่ม?`)) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    try {
      await this.bookApi.updateBookCopies(bookId, change);
      this.successMessage = `${change > 0 ? 'เพิ่ม' : 'ลด'} จำนวนสำเนาหนังสือ "${bookTitle}" สำเร็จ!`;
      void this.loadBooks(); // Reload books after update
    } catch (err: any) {
      this.errorMessage = err.message || 'ไม่สามารถอัปเดตจำนวนสำเนาได้';
    }
  }
}
