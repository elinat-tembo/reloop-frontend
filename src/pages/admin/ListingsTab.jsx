import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getListings, forceDeleteListing } from '../../api/admin'
import Spinner from '../../components/Spinner'
import Pagination from '../../components/Pagination'
import { CATEGORIES } from '../../utils/categories'
import { LOCATIONS, CITIES, REGIONS } from '../../utils/locations'
import { CONDITIONS } from '../../utils/conditions'
import { formatEstimatedValue } from '../../utils/listingHelpers'

const PAGE_LIMIT = 10
const EMPTY_FILTERS = { city: '', region: '', type: '', condition: '' }

function AvailabilityPill({ availability }) {
  const isAvailable = availability !== 'unavailable'
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
        isAvailable
          ? 'bg-green-100 text-green-700'
          : 'bg-gray-200 text-gray-600'
      }`}
    >
      {isAvailable ? 'Available' : 'Unavailable'}
    </span>
  )
}

function ListingsTab() {
  const [listings, setListings] = useState([])
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== ''),
    )

    getListings({ ...activeFilters, page, limit: PAGE_LIMIT })
      .then(({ listings: data, pagination: paginationData }) => {
        if (!cancelled) {
          setListings(data)
          setPagination(paginationData)
        }
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load listings.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [filters, page])

  function handleFilterChange(e) {
    const { name, value } = e.target
    if (name === 'region') {
      setFilters((prev) => ({ ...prev, region: value, city: '' }))
    } else {
      setFilters((prev) => ({ ...prev, [name]: value }))
    }
    setPage(1)
  }

  async function handleDelete(listing) {
    if (
      !window.confirm(
        `Delete listing #${listing.id} (${listing.type} — ${listing.brand})? This bypasses the pending-swap protection and cannot be undone.`,
      )
    ) {
      return
    }

    setDeletingId(listing.id)
    try {
      const result = await forceDeleteListing(listing.id)
      setListings((prev) => prev.filter((item) => item.id !== listing.id))
      toast.success(
        result.cancelledSwapRequests > 0
          ? `Listing deleted. ${result.cancelledSwapRequests} pending swap request${
              result.cancelledSwapRequests === 1 ? '' : 's'
            } was cancelled.`
          : 'Listing deleted.',
      )
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete listing.')
    } finally {
      setDeletingId(null)
    }
  }

  const cityOptions = filters.region ? LOCATIONS[filters.region] : CITIES

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <select
          name="region"
          value={filters.region}
          onChange={handleFilterChange}
          className="rounded-lg border border-secondary/50 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All regions</option>
          {REGIONS.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>

        <select
          name="city"
          value={filters.city}
          onChange={handleFilterChange}
          className="rounded-lg border border-secondary/50 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All cities</option>
          {cityOptions.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>

        <select
          name="type"
          value={filters.type}
          onChange={handleFilterChange}
          className="rounded-lg border border-secondary/50 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All types</option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          name="condition"
          value={filters.condition}
          onChange={handleFilterChange}
          className="rounded-lg border border-secondary/50 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All conditions</option>
          {CONDITIONS.map((condition) => (
            <option key={condition} value={condition}>
              {condition}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : listings.length === 0 ? (
        <p className="text-gray-500">No listings match these filters.</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-secondary/30 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-secondary/30 text-left text-xs text-gray-500">
                  <th className="px-4 py-2 font-medium">Type</th>
                  <th className="px-4 py-2 font-medium">Brand</th>
                  <th className="px-4 py-2 font-medium">Owner</th>
                  <th className="px-4 py-2 font-medium">City</th>
                  <th className="px-4 py-2 font-medium">Value</th>
                  <th className="px-4 py-2 font-medium">Availability</th>
                  <th className="px-4 py-2 font-medium">Created</th>
                  <th className="px-4 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary/20">
                {listings.map((listing) => (
                  <tr key={listing.id}>
                    <td className="px-4 py-2 text-gray-900">{listing.type}</td>
                    <td className="px-4 py-2 text-gray-700">
                      {listing.brand}
                    </td>
                    <td className="px-4 py-2 text-gray-500">
                      #{listing.ownerId}
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      {listing.city}
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      {formatEstimatedValue(listing.estimatedValue)}
                    </td>
                    <td className="px-4 py-2">
                      <AvailabilityPill availability={listing.availability} />
                    </td>
                    <td className="px-4 py-2 text-gray-500">
                      {new Date(listing.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(listing)}
                        disabled={deletingId === listing.id}
                        className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60 cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && (
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              hasPrev={pagination.hasPrev}
              hasNext={pagination.hasNext}
              onChange={setPage}
            />
          )}
        </>
      )}
    </div>
  )
}

export default ListingsTab
