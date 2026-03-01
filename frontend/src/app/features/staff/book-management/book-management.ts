import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookApiService } from '../../../services/book-api.service';
import { Book } from '../../../models/book.model';
import { supabase } from '../../../../lib/supabase';

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
    total_copies: 1,
    cover_image_url: ''
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

  isUploadingCover = false;

  searchQuery = ''; // New property for search input
  allBooks: Book[] = []; // To store all books before filtering

  toastMessage: { message: string, type: 'success' | 'error' } | null = null;
  private toastTimeout: any;

  private bookApi = inject(BookApiService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    void this.loadBooks();
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
    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const createdBook = await this.bookApi.createBook(this.newBook);
      this.successMessage = `เพิ่มหนังสือ "${createdBook.data.title}" สำเร็จ!`;
      this.showToast(`เพิ่มหนังสือ "${createdBook.data.title}" สำเร็จ!`, 'success');
      // Reset form
      this.newBook = {
        title: '',
        author: '',
        isbn: '',
        category: '',
        shelf_location: '',
        total_copies: 1,
        cover_image_url: ''
      };
      void this.loadBooks(); // Reload books after creation
    } catch (err: any) {
      this.errorMessage = err.error?.error || err.message || 'ไม่สามารถเพิ่มหนังสือได้';
      console.error(err);
    } finally {
      this.isSubmitting = false;
      this.cdr.detectChanges();
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
      const updatePayload = {
        title: this.editBookForm.title,
        author: this.editBookForm.author,
        isbn: this.editBookForm.isbn,
        category: this.editBookForm.category,
        shelf_location: this.editBookForm.shelf_location,
        cover_image_url: this.editBookForm.cover_image_url
      };

      const updatedBook = await this.bookApi.updateBook(this.selectedBook.id, updatePayload);
      this.successMessage = `อัปเดตหนังสือ "${updatedBook.data.title}" สำเร็จ!`;
      this.showToast(`อัปเดตหนังสือ "${updatedBook.data.title}" สำเร็จ!`, 'success');
      this.selectedBook = null; // Close edit form
      void this.loadBooks(); // Reload books after update
    } catch (err: any) {
      this.errorMessage = err.error?.error || err.message || 'ไม่สามารถอัปเดตหนังสือได้';
      console.error(err);
    } finally {
      this.isSavingEdit = false;
      this.cdr.detectChanges();
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
      this.showToast(this.successMessage, 'success');
      void this.loadBooks(); // Reload books after deletion
    } catch (err: any) {
      this.errorMessage = err.error?.error || err.message || 'ไม่สามารถลบหนังสือได้';
    } finally {
      this.cdr.detectChanges();
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

  async onFileSelected(event: any, isEdit: boolean = false) {
    const file = event.target.files[0];
    if (!file) return;

    this.isUploadingCover = true;
    this.errorMessage = '';

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${new Date().getTime()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('book-covers')
        .upload(filePath, file);

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('book-covers')
        .getPublicUrl(filePath);

      if (isEdit) {
        this.editBookForm.cover_image_url = publicUrlData.publicUrl;
      } else {
        this.newBook.cover_image_url = publicUrlData.publicUrl;
      }
    } catch (err: any) {
      this.errorMessage = 'ล้มเหลวในการอัปโหลดรูปภาพ: ' + (err.message || 'Unknown error');
      console.error('Upload Error:', err);
    } finally {
      this.isUploadingCover = false;
      this.cdr.detectChanges();
    }
  }
}
