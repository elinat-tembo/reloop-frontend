import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

export function register(data) {
  return apiClient.post('/auth/register', data).then((res) => res.data)
}

export function login(data) {
  return apiClient.post('/auth/login', data).then((res) => res.data)
}

export function getMe(token) {
  return apiClient
    .get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => res.data)
}
