import apiClient from './client'

export function getUsers(page, limit) {
  return apiClient
    .get('/admin/users', { params: { page, limit } })
    .then((res) => ({ users: res.data.users, pagination: res.data.pagination }))
}

export function deactivateUser(id) {
  return apiClient
    .patch(`/admin/users/${id}/deactivate`)
    .then((res) => res.data.user)
}

export function activateUser(id) {
  return apiClient
    .patch(`/admin/users/${id}/activate`)
    .then((res) => res.data.user)
}

export function getListings(filters = {}) {
  return apiClient.get('/admin/listings', { params: filters }).then((res) => ({
    listings: res.data.listings,
    pagination: res.data.pagination,
  }))
}

export function forceDeleteListing(id) {
  return apiClient.delete(`/admin/listings/${id}`).then((res) => res.data)
}

export function getSwaps(page, limit) {
  return apiClient
    .get('/admin/swaps', { params: { page, limit } })
    .then((res) => ({
      swapRequests: res.data.swapRequests,
      pagination: res.data.pagination,
    }))
}

export function getSwapMessages(id) {
  return apiClient
    .get(`/admin/swaps/${id}/messages`)
    .then((res) => res.data.messages)
}

export function forceSwapStatus(id, status) {
  return apiClient
    .patch(`/admin/swaps/${id}/force-status`, { status })
    .then((res) => res.data.swapRequest)
}

export function getAnalytics() {
  return apiClient.get('/admin/analytics').then((res) => res.data)
}
