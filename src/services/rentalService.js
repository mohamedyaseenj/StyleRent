import api from './api'

export const rentalService = {
  getAll: async (params = {}) => {
    const response = await api.get('/rentals', { params })
    return response.data
  },
  
  getById: async (id) => {
    const response = await api.get(`/rentals/${id}`)
    return response.data
  },
  
  create: async (rentalData) => {
    const response = await api.post('/rentals', rentalData)
    return response.data
  },
  
  updateStatus: async (id, status) => {
    const response = await api.put(`/rentals/${id}/status`, { status })
    return response.data
  },
  
  cancel: async (id) => {
    await api.post(`/rentals/${id}/cancel`)
  },
  
  getHistory: async () => {
    const response = await api.get('/rentals/history')
    return response.data
  },
}

export default rentalService
