import api from './api'

export const clothingService = {
  getAll: async (params = {}) => {
    const response = await api.get('/clothing', { params })
    return response.data
  },
  
  getById: async (id) => {
    const response = await api.get(`/clothing/${id}`)
    return response.data
  },
  
  create: async (clothingData) => {
    const response = await api.post('/clothing', clothingData)
    return response.data
  },
  
  update: async (id, clothingData) => {
    const response = await api.put(`/clothing/${id}`, clothingData)
    return response.data
  },
  
  delete: async (id) => {
    await api.delete(`/clothing/${id}`)
  },
  
  getCategories: async () => {
    const response = await api.get('/clothing/categories')
    return response.data
  },
  
  search: async (query) => {
    const response = await api.get('/clothing/search', { params: { q: query } })
    return response.data
  },
}

export default clothingService
