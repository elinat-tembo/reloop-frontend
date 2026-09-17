import { Link } from 'react-router-dom'
import { PhotoIcon } from '@heroicons/react/24/outline'
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
          <div className="flex h-full w-full items-center justify-center text-gray-300">
            <PhotoIcon className="h-8 w-8" />
          </div>
        )}
        {!isAvailable && (
          <span className="absolute top-1.5 right-1.5 rounded-full bg-gray-800 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            Unavailable
          </span>
        )}
      </div>

      <div className="p-2.5 space-y-0.5">
        <div className="flex items-center justify-between gap-1">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {listing.type}
          </h3>
          <span className="text-xs font-medium text-accent whitespace-nowrap">
            {formatEstimatedValue(listing.estimatedValue)}
          </span>
        </div>
        <p className="text-xs text-gray-600 truncate">{listing.brand}</p>
        <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] text-gray-500">
          <span>Size {listing.size}</span>
          <span>{listing.condition}</span>
          <span>{listing.city}</span>
        </div>
      </div>
    </Link>
  )
}

export default ListingCard
