import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getMyListings } from '../api/listings'
import { isListingAvailable } from '../utils/listingHelpers'

function Dashboard() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    getMyListings()
      .then((data) => {
        if (!cancelled) setListings(data)
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load your listings.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-h-[calc(100vh-73px)] bg-background px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              My Listings
            </h2>
            <Link
              to="/listings/new"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-secondary transition-colors"
            >
              Create New Listing
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <span className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
          ) : listings.length === 0 ? (
            <p className="text-gray-500">
              You haven&apos;t created any listings yet.
            </p>
          ) : (
            <div className="rounded-xl border border-secondary/30 bg-white divide-y divide-secondary/20">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {listing.type}{' '}
                      <span className="text-gray-500 font-normal">
                        — {listing.brand}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {listing.city} · {listing.condition}
                      {!isListingAvailable(listing) && ' · Unavailable'}
                    </p>
                  </div>
                  <div className="flex gap-3 text-sm font-medium">
                    <Link
                      to={`/listings/${listing.id}`}
                      className="text-gray-600 hover:text-primary transition-colors"
                    >
                      View
                    </Link>
                    <Link
                      to={`/listings/${listing.id}/edit`}
                      className="text-primary hover:text-accent transition-colors"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default Dashboard
