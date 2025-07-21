import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
}

// Assignments API
export const assignmentsAPI = {
  getAll: () => api.get('/assignments'),
  getStudentAssignments: () => api.get('/assignments/student'),
  create: (data) => api.post('/assignments', data),
  update: (id, data) => api.put(`/assignments/${id}`, data),
  delete: (id) => api.delete(`/assignments/${id}`),
}

// Submissions API
export const submissionsAPI = {
  submit: (formData) => {
    console.log('API: Submitting form data:', formData)
    return api.post('/submissions', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data'
      },
      timeout: 30000 // 30 second timeout for file uploads
    })
  },
  getAll: () => api.get('/submissions'),
  getLateSubmissions: () => api.get('/submissions/late'),
  getMySubmissions: () => api.get('/submissions/my-submissions'),
  updateStatus: (id, data) => api.put(`/submissions/${id}/status`, data),
  download: (id) => api.get(`/submissions/${id}/download`, { 
    responseType: 'blob',
    timeout: 30000
  }),
}

// Grades API
export const gradesAPI = {
  assign: (data) => api.post('/grades', data),
  getAll: () => api.get('/grades'),
  getMyGrades: () => api.get('/grades/my-grades'),
  update: (id, data) => api.put(`/grades/${id}`, data),
}

export default api