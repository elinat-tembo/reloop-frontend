import apiClient from './client'

export function createSwapRequest(data) {
  return apiClient.post('/swaps', data).then((res) => res.data.swapRequest)
}

export function getIncoming(params = {}) {
  return apiClient.get('/swaps/incoming', { params }).then((res) => ({
    swapRequests: res.data.swapRequests,
    pagination: res.data.pagination,
  }))
}

export function getOutgoing(params = {}) {
  return apiClient.get('/swaps/outgoing', { params }).then((res) => ({
    swapRequests: res.data.swapRequests,
    pagination: res.data.pagination,
  }))
}

export function getSwapById(id) {
  return apiClient.get(`/swaps/${id}`).then((res) => res.data.swapRequest)
}

export function acceptSwap(id) {
  return apiClient
    .patch(`/swaps/${id}/accept`)
    .then((res) => res.data.swapRequest)
}

export function rejectSwap(id) {
  return apiClient
    .patch(`/swaps/${id}/reject`)
    .then((res) => res.data.swapRequest)
}

export function cancelSwap(id) {
  return apiClient
    .patch(`/swaps/${id}/cancel`)
    .then((res) => res.data.swapRequest)
}
