import { Link } from 'react-router-dom'
import { isListingAvailable, formatEstimatedValue } from '../utils/listingHelpers'

function ListingCard({ listing }) {
  const isAvailable = isListingAvailable(listing)
  const image = listing.images?.[0]

  return (
    <Link
      to={`/listings/${listing.id}`}
      className={`block rounded-xl border border-secondary/30 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
        isAvailable ? '' : 'opacity-50 grayscale'
      }`}
    >
      <div className="relative aspect-square bg-accent-mist">
        {image ? (
          <img
            src={image}
            alt={listing.brand || listing.type}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
            No image
          </div>
        )}
        {!isAvailable && (
          <span className="absolute top-2 right-2 rounded-full bg-gray-800 px-2 py-1 text-xs font-semibold text-white">
            Unavailable
          </span>
        )}
      </div>

      <div className="p-4 space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{listing.type}</h3>
          <span className="text-sm font-medium text-accent">
            {formatEstimatedValue(listing.estimatedValue)}
          </span>
        </div>
        <p className="text-sm text-gray-600">{listing.brand}</p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
          <span>Size {listing.size}</span>
          <span>{listing.condition}</span>
          <span>{listing.city}</span>
        </div>
      </div>
    </Link>
  )
}

export default ListingCard
