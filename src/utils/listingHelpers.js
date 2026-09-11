export function isListingAvailable(listing) {
  return listing.availability !== 'unavailable'
}

export function formatEstimatedValue(estimatedValue) {
  if (estimatedValue == null) return '—'
  const parsed = Number(estimatedValue)
  return Number.isNaN(parsed) ? '—' : `$${parsed.toFixed(2)}`
}
