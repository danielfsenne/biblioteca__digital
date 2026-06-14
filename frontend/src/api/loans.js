import api from './axios'

export const loansApi = {
  getAll: () => api.get('/loans'),
  getById: (id) => api.get(`/loans/${id}`),
  create: (data) => api.post('/loans', data),
  returnLoan: (id) => api.put(`/loans/${id}/return`),
}
