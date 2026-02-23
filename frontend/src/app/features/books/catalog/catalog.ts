import { Component, OnInit } from '@angular/core'
import { NgFor, NgIf } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { BookApiService } from '../../../services/book-api.service'
import { Book } from '../../../models/book.model'

@Component({
  selector: 'app-book-catalog',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './catalog.html'
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

  constructor(private bookApi: BookApiService) {}

  ngOnInit() {
    void this.loadBooks()
  }

  async loadBooks(page = 1) {
    this.loading = true
    this.error = ''

    try {
      const res = await this.bookApi.searchBooks({
        q: this.q || undefined,
        category: this.category || undefined,
        page,
        limit: this.limit,
        sort: 'title_asc'
      })

      this.books = res.data
      this.page = res.pagination.page
      this.limit = res.pagination.limit
      this.total = res.pagination.total
    } catch {
      this.error = 'ไม่สามารถดึงรายการหนังสือได้'
    } finally {
      this.loading = false
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
}
