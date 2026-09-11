import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getListingById, deleteListing } from '../api/listings'
import { useAuth } from '../context/AuthContext'
import { isListingAvailable, formatEstimatedValue } from '../utils/listingHelpers'

function ItemDetail() {
  const { itemId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    getListingById(itemId)
      .then((data) => {
        if (!cancelled) setListing(data)
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load this listing.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [itemId])

  async function handleDelete() {
    if (!window.confirm('Delete this listing? This cannot be undone.')) return

    setDeleting(true)
    try {
      await deleteListing(itemId)
      toast.success('Listing deleted.')
      navigate('/listings')
    } catch (err) {
      const message = err.response?.data?.error
      toast.error(message || 'Failed to delete listing.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-background px-6 py-12 flex justify-center">
        <span className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
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

  const isAvailable = isListingAvailable(listing)
  const isOwner = user && listing.ownerId === user.id
  const images = listing.images?.length ? listing.images : []

  return (
    <div className="min-h-[calc(100vh-73px)] bg-background px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <nav className="mb-4 text-sm text-gray-500">
          <Link to="/dashboard" className="hover:text-primary transition-colors">
            Dashboard
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">{listing.type}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <div className="aspect-square rounded-xl overflow-hidden bg-accent-mist border border-secondary/30">
            {images[0] ? (
              <img
                src={images[0]}
                alt={listing.brand || listing.type}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
                No image
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.slice(1).map((src) => (
                <div
                  key={src}
                  className="aspect-square rounded-lg overflow-hidden bg-accent-mist border border-secondary/30"
                >
                  <img
                    src={src}
                    alt={listing.brand || listing.type}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{listing.type}</h1>
            {!isAvailable && (
              <span className="rounded-full bg-gray-800 px-2 py-1 text-xs font-semibold text-white">
                Unavailable
              </span>
            )}
          </div>
          <p className="text-lg text-gray-700 mb-4">{listing.brand}</p>

          <dl className="space-y-2 text-sm mb-6">
            <div className="flex justify-between border-b border-secondary/30 py-2">
              <dt className="text-gray-500">Size</dt>
              <dd className="text-gray-900 font-medium">{listing.size}</dd>
            </div>
            <div className="flex justify-between border-b border-secondary/30 py-2">
              <dt className="text-gray-500">Condition</dt>
              <dd className="text-gray-900 font-medium">{listing.condition}</dd>
            </div>
            <div className="flex justify-between border-b border-secondary/30 py-2">
              <dt className="text-gray-500">Estimated value</dt>
              <dd className="text-gray-900 font-medium">
                {formatEstimatedValue(listing.estimatedValue)}
              </dd>
            </div>
            <div className="flex justify-between border-b border-secondary/30 py-2">
              <dt className="text-gray-500">City</dt>
              <dd className="text-gray-900 font-medium">{listing.city}</dd>
            </div>
            <div className="flex justify-between border-b border-secondary/30 py-2">
              <dt className="text-gray-500">Region</dt>
              <dd className="text-gray-900 font-medium">{listing.region}</dd>
            </div>
          </dl>

          {isOwner ? (
            <div className="flex gap-3">
              <Link
                to={`/listings/${itemId}/edit`}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-secondary transition-colors"
              >
                Edit
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60 cursor-pointer"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          ) : (
            isAvailable && (
              <Link
                to={`/listings/${itemId}/swap-request`}
                className="inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-secondary transition-colors"
              >
                Request Swap
              </Link>
            )
          )}
        </div>
        </div>
      </div>
    </div>
  )
}

export default ItemDetail
