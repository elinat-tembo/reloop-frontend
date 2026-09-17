import apiClient from './client'

export function updateProfile(data) {
  return apiClient.put('/users/me', data).then((res) => res.data.user)
}

export function changePassword(data) {
  return apiClient
    .patch('/users/me/password', data)
    .then((res) => res.data.message)
}
