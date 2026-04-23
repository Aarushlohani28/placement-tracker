import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000'
})

// Before every request, grab the token from
// localStorage and attach it to the header automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// If any request gets a 401 (unauthorized)
// it means the token expired — log the user out automatically
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Skip redirection if the 401 error originates directly from the manual login attempt itself
    const isLoginRequest = error.config?.url?.includes('/api/auth/login')
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export default api