import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getListingById, getMyListings } from '../api/listings'
import { createSwapRequest } from '../api/swaps'
import { formatEstimatedValue } from '../utils/listingHelpers'
import Spinner from '../components/Spinner'

function SwapRequest() {
  const { itemId } = useParams()
  const navigate = useNavigate()

  const [listing, setListing] = useState(null)
  const [myListings, setMyListings] = useState([])
  const [offeredItemId, setOfferedItemId] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false

    Promise.all([getListingById(itemId), getMyListings({ limit: 100 })])
      .then(([item, myListingsRes]) => {
        if (cancelled) return
        setListing(item)
        const available = myListingsRes.listings.filter(
          (candidate) => candidate.availability === 'available',
        )
        setMyListings(available)
        if (available.length) setOfferedItemId(String(available[0].id))
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load swap details.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [itemId])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!offeredItemId) return

    setSubmitting(true)
    try {
      await createSwapRequest({
        requestedItemId: Number(itemId),
        offeredItemId: Number(offeredItemId),
      })
      toast.success('Swap request sent')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send swap request.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-background px-6 py-12 flex justify-center">
        <Spinner />
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-background px-6 py-12">
        <p className="text-gray-500">Listing not found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-73px)] bg-background px-6 py-12">
      <div className="mx-auto max-w-lg">
        <nav className="mb-4 text-sm text-gray-500">
          <Link to="/dashboard" className="hover:text-primary transition-colors">
            Dashboard
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">Request Swap</span>
        </nav>

        <div className="rounded-2xl bg-white p-8 shadow-lg shadow-primary/10 border border-secondary/30">
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            Request Swap
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Offer one of your available items in exchange for{' '}
            <span className="font-medium text-gray-700">
              {listing.brand} {listing.type}
            </span>
            .
          </p>

          <div className="flex items-center gap-4 mb-6 rounded-xl border border-secondary/30 p-4">
            <div className="h-16 w-16 rounded-lg overflow-hidden bg-accent-mist shrink-0">
              {listing.images?.[0] && (
                <img
                  src={listing.images[0]}
                  alt={listing.type}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {listing.type} — {listing.brand}
              </p>
              <p className="text-sm text-gray-500">
                {formatEstimatedValue(listing.estimatedValue)}
              </p>
            </div>
          </div>

          {myListings.length === 0 ? (
            <p className="text-sm text-gray-500">
              You don&apos;t have any available listings to offer.{' '}
              <Link to="/listings/new" className="text-primary hover:underline">
                Create one first
              </Link>
              .
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Offer one of your items
                </label>
                <select
                  value={offeredItemId}
                  onChange={(e) => setOfferedItemId(e.target.value)}
                  className="w-full rounded-lg border border-secondary/50 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {myListings.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.type} — {item.brand} (
                      {formatEstimatedValue(item.estimatedValue)})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-primary py-2.5 font-semibold text-white hover:bg-secondary transition-colors disabled:opacity-60 cursor-pointer"
              >
                {submitting ? 'Sending…' : 'Send Swap Request'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default SwapRequest
