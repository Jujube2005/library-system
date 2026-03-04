import { Component, inject, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
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
    image_url: ''
  };
  isSubmitting = false;
  showAddForm = false;
  errorMessage = '';
  successMessage = '';

  stats = {
    total: 0,
    available: 0,
    categories: 0
  };

  // Image Upload properties
  imagePreview: string | null = null;

  // Book list and editing
  books: Book[] = [];
  loadingBooks = false;
  booksError = '';
  selectedBook: Book | null = null; // Book currently being edited
  editBookForm: Partial<Book> = {}; // Form data for editing
  isSavingEdit = false;

  isUploadingCover = false;

  searchQuery = '';

  // Pagination & Filters
  currentPage = 1;
  pageSize = 10;
  totalBooks = 0;
  totalPages = 0;
  selectedCategory = '';
  sortOption = 'title.asc';

  // History
  isShowingHistory = false;
  historyData: any[] = [];
  loadingHistory = false;
  selectedBookForHistory: Book | null = null;

  categories = [
    'Programming',
    'Database',
    'Networking',
    'AI/Data Science',
    'Mathematics',
    'Science',
    'Business/Management',
    'General',
    'Fiction',
    'Non-Fiction',
    'History',
    'Biography',
    'Other'
  ];

  shelfLocations = [
    'PROG-01', 'PROG-02', 'PROG-03',
    'DB-01', 'DB-02',
    'NET-01', 'NET-02',
    'AI-01', 'AI-02',
    'MATH-01', 'MATH-02',
    'SCI-01', 'SCI-02',
    'BIZ-01', 'BIZ-02',
    'GEN-01', 'GEN-02', 'GEN-03',
    'Other'
  ];

  toastMessage: { message: string, type: 'success' | 'error' } | null = null;
  private toastTimeout: any;

  private bookApi = inject(BookApiService);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);

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
      const response = await this.bookApi.searchBooks({
        q: this.searchQuery || undefined,
        category: this.selectedCategory || undefined,
        sort: this.sortOption,
        page: this.currentPage,
        limit: this.pageSize
      });

      this.zone.run(() => {
        this.books = response.data;
        this.totalBooks = response.pagination.total;
        this.totalPages = Math.ceil(this.totalBooks / this.pageSize);

        // Basic stats calculation based on current batch (real apps would use a dedicated stats API)
        this.stats.total = this.totalBooks;
        this.stats.available = this.books.filter(b => b.available_copies > 0).length + (this.totalBooks - this.books.length); // Estimated
        this.stats.categories = new Set(this.books.map(b => b.category)).size;
      });
    } catch (err: any) {
      this.zone.run(() => {
        this.booksError = err.message || 'ไม่สามารถโหลดรายการหนังสือได้';
      });
    } finally {
      this.zone.run(() => {
        this.loadingBooks = false;
        this.cdr.detectChanges();
      });
    }
  }

  changePage(page: number) {
    if (page >= 1 && page <= (this.totalPages || 1)) {
      this.currentPage = page;
      void this.loadBooks();
    }
  }

  applyFilter() {
    this.currentPage = 1; // Reset to page 1 on new search
    void this.loadBooks();
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    this.errorMessage = '';
    this.successMessage = '';
  }

  getBookCover(book: Book): string {
    if (book.image_url) return book.image_url;
    if (book.cover_image_url) return book.cover_image_url;

    const titleKey = (book.title || '').trim().toLowerCase()
    const coverByTitle: Record<string, string> = {
      'เพราะเป็นวัยรุ่นจึงเจ็บปวด': '/book1.jpg',
      'กล้าที่จะถูกเกลียด': '/book2.jpg',
      'i decided to live as myself': '/book3.jpg',
      'อยากตายแต่ก็อยากกินต๊อกบกกี #2': '/book4.jpg',
      'sapiens: a brief history of humankind': '/book5.jpg',
      'sapiens a brief history of humankind': '/book5.jpg',
      'the intelligent investor': '/book6.jpg',
      'ต้นส้มแสนรัก': '/book7.jpg',
      'ก็แค่ปล่อยมันไป': '/book8jpg.jpg',
      'เจ้าชายน้อย': '/book9.jpg'
    }

    return coverByTitle[titleKey] || '/default-book-cover.svg'
  }

  onImgError(event: any) {
    event.target.src = '/default-book-cover.svg';
  }

  // Filter replaced by server-side applyFilter()




  async createBook() {
    // Validation
    if (!this.newBook.title || !this.newBook.author || !this.newBook.category || !this.newBook.shelf_location) {
      this.showToast('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (ชื่อ, ผู้แต่ง, หมวดหมู่, ชั้นวาง)', 'error');
      return;
    }

    if (this.newBook.isbn && this.newBook.isbn.replace(/[-\s]/g, '').length > 13) {
      this.showToast('ISBN ต้องไม่เกิน 13 ตัวอักษร', 'error');
      return;
    }

    if (this.newBook.total_copies < 1) {
      this.showToast('จำนวนเล่มต้องมีอย่างน้อย 1 เล่ม', 'error');
      return;
    }

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
        image_url: ''
      };
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
        image_url: this.editBookForm.image_url
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

  async updateCopies(bookId: string, bookTitle: string, intent: number) {
    const actionText = intent > 0 ? 'เพิ่ม' : 'ลด';
    const amountStr = prompt(`กรุณาระบุจำนวนสำเนาที่ต้องการ${actionText}สำหรับหนังสือ "${bookTitle}":`, "1");
    if (!amountStr) return;

    const amount = parseInt(amountStr, 10);
    if (isNaN(amount) || amount <= 0) {
      alert("กรุณาระบุจำนวนที่ถูกต้อง (ต้องเป็นตัวเลขมากกว่า 0)");
      return;
    }

    const change = intent > 0 ? amount : -amount;

    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการ${actionText}จำนวนสำเนาหนังสือ "${bookTitle}" จำนวน ${amount} เล่ม?`)) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    try {
      await this.bookApi.updateBookCopies(bookId, change);
      this.successMessage = `${actionText}จำนวนสำเนาหนังสือ "${bookTitle}" สำเร็จ!`;
      this.showToast(this.successMessage, 'success');
      void this.loadBooks(); // Reload books after update
    } catch (err: any) {
      this.errorMessage = err.message || 'ไม่สามารถอัปเดตจำนวนสำเนาได้';
      this.showToast(this.errorMessage, 'error');
    }
  }

  async onFileSelected(event: any, isEdit: boolean = false) {
    const file = event.target.files[0];
    if (!file) return;

    // Validation
    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'กรุณาเลือกไฟล์รูปภาพเท่านั้น';
      return;
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB Limit
      this.errorMessage = 'ขนาดไฟล์ต้องไม่เกิน 2MB';
      return;
    }

    this.isUploadingCover = true;
    this.errorMessage = '';

    try {
      // Local preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);

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
        this.editBookForm.image_url = publicUrlData.publicUrl;
      } else {
        this.newBook.image_url = publicUrlData.publicUrl;
      }
    } catch (err: any) {
      this.errorMessage = 'ล้มเหลวในการอัปโหลดรูปภาพ: ' + (err.message || 'Unknown error');
      console.error('Upload Error:', err);
    } finally {
      this.isUploadingCover = false;
      this.cdr.detectChanges();
    }
  }

  // --- New Features Logic ---


  printBarcode(book: Book) {
    const textToEncode = book.isbn || book.id;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(textToEncode)}`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Label - ${book.title}</title>
            <style>
              body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
              .label-card { border: 1px solid #000; padding: 20px; text-align: center; width: 300px; }
              .qr-code { width: 150px; height: 150px; margin-bottom: 10px; }
              .title { font-weight: bold; font-size: 14px; margin-bottom: 5px; word-wrap: break-word;}
              .info { font-size: 12px; color: #333; }
              @media print {
                body { height: auto; }
                .label-card { border: 1px dashed #ccc; page-break-inside: avoid; }
              }
            </style>
          </head>
          <body>
            <div class="label-card">
              <img src="${qrUrl}" class="qr-code" alt="QR Code" />
              <div class="title">${book.title}</div>
              <div class="info">ID: ${book.id}</div>
              ${book.isbn ? `<div class="info">ISBN: ${book.isbn}</div>` : ''}
              <div class="info">Shelf: ${book.shelf_location}</div>
            </div>
            <script>
              window.onload = () => { window.print(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  }

  async viewHistory(book: Book) {
    this.selectedBookForHistory = book;
    this.isShowingHistory = true;
    this.loadingHistory = true;
    this.historyData = [];

    try {
      const response = await this.bookApi.getBookHistory(book.id);
      this.historyData = response.data;
    } catch (error: any) {
      this.showToast('ไม่สามารถดึงประวัติการยืมได้', 'error');
    } finally {
      this.loadingHistory = false;
      this.cdr.detectChanges();
    }
  }

  closeHistoryView() {
    this.isShowingHistory = false;
    this.selectedBookForHistory = null;
  }

  async exportToCSV() {
    if (this.totalBooks === 0) {
      this.showToast('ไม่มีข้อมูลหนังสือสำหรับ Export', 'error');
      return;
    }

    this.showToast('กำลังเตรียมไฟล์ Export...', 'success');

    try {
      // Fetch all books for export (bypass pagination by setting high limit)
      const response = await this.bookApi.searchBooks({
        limit: 1000, // Reasonable cap for CSV export
        sort: this.sortOption
      });

      const allBooks = response.data;
      const headers = ['ID', 'Title', 'Author', 'ISBN', 'Category', 'Shelf Location', 'Total Copies', 'Available Copies', 'Status'];
      const csvRows = [headers.join(',')];

      allBooks.forEach(book => {
        const row = [
          book.id,
          `"${book.title.replace(/"/g, '""')}"`,
          `"${book.author.replace(/"/g, '""')}"`,
          book.isbn || '',
          book.category,
          book.shelf_location,
          book.total_copies,
          book.available_copies,
          book.status
        ];
        csvRows.push(row.join(','));
      });

      const csvContent = '\ufeff' + csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `books_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      this.showToast('Export สำเร็จ!', 'success');
    } catch (err) {
      this.showToast('เกิดข้อผิดพลาดในการ Export ข้อมูล', 'error');
    }
  }

  triggerImport() {
    document.getElementById('csvImportInput')?.click();
  }

  async onFileImport(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const rows = text.split('\n').filter(row => row.trim() !== '');
      if (rows.length <= 1) return; // Only headers

      this.isSubmitting = true;
      let successCount = 0;
      let errorCount = 0;

      // Expected simple CSV: Title,Author,ISBN,Category,ShelfLocation,TotalCopies
      // Skip header row (i=1)
      for (let i = 1; i < rows.length; i++) {
        // Very basic CSV parsing (won't handle commas inside quotes well without regex, but okay for demo)
        const cols = rows[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        if (cols.length >= 6) {
          try {
            const parsedBook = {
              title: cols[0],
              author: cols[1],
              isbn: cols[2],
              category: cols[3],
              shelf_location: cols[4],
              total_copies: parseInt(cols[5], 10) || 1,
              image_url: ''
            };
            await this.bookApi.createBook(parsedBook as any);
            successCount++;
          } catch (err) {
            errorCount++;
          }
        }
      }

      this.showToast(`นำเข้าสำเร็จ ${successCount} รายการ, ผิดพลาด ${errorCount} รายการ`, successCount > 0 ? 'success' : 'error');
      this.isSubmitting = false;
      this.applyFilter(); // reload books
    };
    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  }
}
