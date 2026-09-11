import axios from 'axios'

const STORAGE_KEY = 'auth'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

apiClient.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const token = raw ? JSON.parse(raw).token : null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch {
    // no stored auth
  }
  return config
})

export default apiClient
