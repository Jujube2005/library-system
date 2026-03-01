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

  // Image Upload properties
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isUploading = false;

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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'กรุณาเลือกไฟล์รูปภาพเท่านั้น';
        return;
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB Limit
        this.errorMessage = 'ขนาดไฟล์ต้องไม่เกิน 2MB';
        return;
      }

      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async uploadImage(file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = fileName; // ใช้แค่ fileName เพื่อให้ URL สั้นลง (bucket/fileName)

      const { error: uploadError } = await supabase.storage
        .from('book-covers')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('book-covers')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (err: any) {
      console.error('Upload Image Error:', err);
      this.errorMessage = `อัปโหลดรูปภาพไม่สำเร็จ: ${err.message}`;
      return null;
    }
  }

  async createBook() {
    // Validation
    if (this.newBook.isbn && this.newBook.isbn.replace(/[-\s]/g, '').length > 13) {
      this.errorMessage = 'ISBN ต้องไม่เกิน 13 ตัวอักษร (ไม่รวมขีดหรือเว้นวรรค)';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      // Upload image if selected
      if (this.selectedFile) {
        this.isUploading = true;
        const imageUrl = await this.uploadImage(this.selectedFile);
        if (imageUrl) {
          this.newBook.image_url = imageUrl;
        }
        this.isUploading = false;
      }

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
      this.selectedFile = null;
      this.imagePreview = null;
      void this.loadBooks(); // Reload books after creation
    } catch (err: any) {
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
