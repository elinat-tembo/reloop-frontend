import apiClient from './client'

export function createListing(data) {
  return apiClient
    .post('/listings', data)
    .then((res) => res.data.listing)
}

export function getListings(filters = {}) {
  return apiClient
    .get('/listings', { params: filters })
    .then((res) => res.data.listings)
}

export function getListingById(id) {
  return apiClient
    .get(`/listings/${id}`)
    .then((res) => res.data.listing)
}

export function getMyListings() {
  return apiClient.get('/listings/mine').then((res) => res.data.listings)
}

export function updateListing(id, data) {
  return apiClient
    .put(`/listings/${id}`, data)
    .then((res) => res.data.listing)
}

export function deleteListing(id) {
  return apiClient.delete(`/listings/${id}`).then((res) => res.data)
}
