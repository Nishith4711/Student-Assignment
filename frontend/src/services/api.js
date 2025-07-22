import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

console.log('API Base URL:', API_BASE_URL)

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  console.log('API Request:', config.method?.toUpperCase(), config.url)
  return config
})

// Handle responses
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data)
    return response
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data || error.message)
    return Promise.reject(error)
  }
)

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
  submit: async (formData) => {
    console.log('=== FRONTEND SUBMISSION START ===')

    // Log form data contents
    console.log('FormData contents:')
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: File - ${value.name} (${value.size} bytes, ${value.type})`)
      } else {
        console.log(`${key}: ${value}`)
      }
    }

    try {
      const response = await api.post('/submissions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
      })

      console.log('=== SUBMISSION SUCCESS ===')
      console.log('Response:', response.data)
      return response

    } catch (error) {
      console.error('=== SUBMISSION ERROR ===')
      console.error('Error details:', error.response?.data || error.message)
      throw error
    }
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