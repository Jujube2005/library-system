import { Injectable } from '@angular/core'
import { ApiService } from './api.service'
import { Book } from '../models/book.model'

export interface BookSearchResponse {
  data: Book[]
  pagination: {
    page: number
    limit: number
    total: number
  }
}

@Injectable({
  providedIn: 'root'
})
export class BookApiService {
  constructor(private api: ApiService) {}

  getBook(id: string) {
    return this.api.get<{ data: Book }>(`/api/books/${id}`)
  }

  searchBooks(params: {
    q?: string
    category?: string
    page?: number
    limit?: number
    sort?: string
  }) {
    const search = new URLSearchParams()

    if (params.q) search.set('q', params.q)
    if (params.category) search.set('category', params.category)
    if (params.page) search.set('page', String(params.page))
    if (params.limit) search.set('limit', String(params.limit))
    if (params.sort) search.set('sort', params.sort)

    const queryString = search.toString()
    const path = queryString ? `/api/books?${queryString}` : '/api/books'

    return this.api.get<BookSearchResponse>(path)
  }

  createBook(book: Omit<Book, 'id' | 'created_at' | 'updated_at' | 'available_copies' | 'status'>) {
    return this.api.post<{ data: Book }>('/api/books', book)
  }

  updateBook(id: string, book: Partial<Book>) {
    return this.api.patch<{ data: Book }>(`/api/books/${id}`, book)
  }

  deleteBook(id: string) {
    return this.api.delete<{ data: { message: string } }>(`/api/books/${id}`)
  }

  updateBookCopies(id: string, change: number) {
    return this.api.patch<{ data: Book }>(`/api/books/${id}/copies`, { change })
  }
}
