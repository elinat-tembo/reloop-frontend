import apiClient from './client'

export function createListing(data) {
  return apiClient
    .post('/listings', data)
    .then((res) => res.data.listing)
}

export function getListings(filters = {}) {
  return apiClient.get('/listings', { params: filters }).then((res) => ({
    listings: res.data.listings,
    pagination: res.data.pagination,
  }))
}

export function getListingById(id) {
  return apiClient
    .get(`/listings/${id}`)
    .then((res) => res.data.listing)
}

export function getMyListings(params = {}) {
  return apiClient.get('/listings/mine', { params }).then((res) => ({
    listings: res.data.listings,
    pagination: res.data.pagination,
  }))
}

export function updateListing(id, data) {
  return apiClient
    .put(`/listings/${id}`, data)
    .then((res) => res.data.listing)
}

export function deleteListing(id) {
  return apiClient.delete(`/listings/${id}`).then((res) => res.data)
}
