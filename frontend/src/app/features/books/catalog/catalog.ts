import { Component, OnInit, ChangeDetectorRef } from '@angular/core'
import { NgFor, NgIf } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterLink } from '@angular/router'
import { BookApiService } from '../../../services/book-api.service'
import { Book } from '../../../models/book.model'

@Component({
  selector: 'app-book-catalog',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, RouterLink],
  templateUrl: './catalog.html',
  styleUrls: ['./catalog.css']
})
export class BookCatalogComponent implements OnInit {
  books: Book[] = []
  page = 1
  limit = 10
  total = 0
  q = ''
  category = ''
  loading = false
  error = ''

  categories = [
    { id: '', name: 'All Collections' },
    { id: 'Programming', name: 'Software Development' },
    { id: 'Psychology', name: 'Mind & Mental Health' },
    { id: 'Self-Help', name: 'Personal Growth' },
    { id: 'Science', name: 'Science & History' },
    { id: 'Business', name: 'Investing & Business' },
    { id: 'Children', name: 'Children Literature' },
    { id: 'Philosophy', name: 'Philosophy' }
  ]

  constructor(
    private bookApi: BookApiService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    console.log('[Catalog] ngOnInit fired')
    // Check if category in query params
    const params = new URLSearchParams(window.location.search)
    this.category = params.get('category') || ''
    this.q = params.get('q') || ''
    void this.loadBooks()
  }

  async loadBooks(page = 1) {
    console.log(`[Catalog] Loading books for page ${page}...`)
    this.loading = true
    this.error = ''

    try {
      const res = await this.bookApi.searchBooks({
        q: this.q || undefined,
        category: this.category || undefined,
        page,
        limit: this.limit
      })
      console.log('[Catalog] Books received:', res.data.length)
      this.books = res.data
      this.page = res.pagination.page
      this.limit = res.pagination.limit
      this.total = res.pagination.total
    } catch (err) {
      console.error('[Catalog] Load failed:', err)
      this.error = 'ไม่สามารถดึงรายการหนังสือได้'
    } finally {
      this.loading = false
      console.log('[Catalog] Loading finished. books count:', this.books.length)
      this.cdr.detectChanges()
    }
  }

  onSearch() {
    void this.loadBooks(1)
  }

  canPrev() {
    return this.page > 1
  }

  canNext() {
    return this.page * this.limit < this.total
  }

  prevPage() {
    if (!this.canPrev()) return
    void this.loadBooks(this.page - 1)
  }

  nextPage() {
    if (!this.canNext()) return
    void this.loadBooks(this.page + 1)
  }

  totalPages() {
    return this.total > 0 ? Math.ceil(this.total / this.limit) : 1
  }

  getBookCover(book: Book): string {
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

    if (coverByTitle[titleKey]) {
      return coverByTitle[titleKey]
    }

    return '/default-book-cover.svg'
  }
}
