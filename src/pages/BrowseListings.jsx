import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getListings } from '../api/listings'
import ListingCard from '../components/ListingCard'
import Spinner from '../components/Spinner'
import Pagination from '../components/Pagination'
import { useAuth } from '../context/AuthContext'
import { CATEGORIES } from '../utils/categories'
import { LOCATIONS, CITIES, REGIONS } from '../utils/locations'
import { CONDITIONS } from '../utils/conditions'

const EMPTY_FILTERS = {
  city: '',
  region: '',
  type: '',
  condition: '',
}
const PAGE_LIMIT = 20

function BrowseListings() {
  const { user } = useAuth()
  const [listings, setListings] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [page, setPage] = useState(1)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== ''),
    )

    getListings({ ...activeFilters, page, limit: PAGE_LIMIT })
      .then(({ listings: data, pagination: paginationData }) => {
        if (!cancelled) {
          setListings(data.filter((listing) => listing.ownerId !== user?.id))
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
  }, [filters, page, user])

  function handleFilterChange(e) {
    const { name, value } = e.target
    if (name === 'region') {
      setFilters((prev) => ({ ...prev, region: value, city: '' }))
    } else {
      setFilters((prev) => ({ ...prev, [name]: value }))
    }
    setPage(1)
  }

  const cityOptions = filters.region ? LOCATIONS[filters.region] : CITIES

  return (
    <div className="min-h-[calc(100vh-73px)] bg-background px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Browse Listings</h1>
          <Link
            to="/listings/new"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-secondary transition-colors"
          >
            Create New Listing
          </Link>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
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
    </div>
  )
}

export default BrowseListings
