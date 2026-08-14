import api from './api'

export const ownerService = {
  getDashboard: async () => {
    const response = await api.get('/owner/dashboard')
    return response.data
  },
  
  getClothing: async (params = {}) => {
    const response = await api.get('/owner/clothing', { params })
    return response.data
  },
  
  createClothing: async (clothingData) => {
    const response = await api.post('/owner/clothing', clothingData)
    return response.data
  },
  
  updateClothing: async (id, clothingData) => {
    const response = await api.put(`/owner/clothing/${id}`, clothingData)
    return response.data
  },
  
  deleteClothing: async (id) => {
    await api.delete(`/owner/clothing/${id}`)
  },
  
  getInventory: async () => {
    const response = await api.get('/owner/inventory')
    return response.data
  },
  
  getBookings: async (params = {}) => {
    const response = await api.get('/owner/bookings', { params })
    return response.data
  },
}

export default ownerService
