import apiClient from './client'

export function sendMessage(swapId, content) {
  return apiClient
    .post(`/swaps/${swapId}/messages`, { content })
    .then((res) => res.data.message)
}

export function getMessages(swapId, afterId) {
  const params = afterId != null ? { after: afterId } : {}
  return apiClient
    .get(`/swaps/${swapId}/messages`, { params })
    .then((res) => res.data.messages)
}
