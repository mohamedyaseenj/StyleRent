import api from './api'

export const adminService = {
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard')
    return response.data
  },
  
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params })
    return response.data
  },
  
  getOwners: async (params = {}) => {
    const response = await api.get('/admin/owners', { params })
    return response.data
  },
  
  getRentals: async (params = {}) => {
    const response = await api.get('/admin/rentals', { params })
    return response.data
  },
  
  getActivities: async (params = {}) => {
    const response = await api.get('/admin/activities', { params })
    return response.data
  },
  
  updateUserStatus: async (id, status) => {
    const response = await api.put(`/admin/users/${id}/status`, { status })
    return response.data
  },
}

export default adminService
