import api from './axios'

export const booksApi = {
  getAll: (page = 0, size = 10) => api.get(`/books?page=${page}&size=${size}`),
  getById: (id) => api.get(`/books/${id}`),
  search: (title) => api.get(`/books/search?title=${encodeURIComponent(title)}`),
  create: (data) => api.post('/books', data),
  update: (id, data) => api.put(`/books/${id}`, data),
  delete: (id) => api.delete(`/books/${id}`),
}
