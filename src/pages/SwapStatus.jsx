import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getSwapById, acceptSwap, rejectSwap, cancelSwap } from '../api/swaps'
import { getListingById } from '../api/listings'
import { useAuth } from '../context/AuthContext'
import { formatEstimatedValue } from '../utils/listingHelpers'
import Spinner from '../components/Spinner'
import StatusBadge from '../components/StatusBadge'

function SwapItemCard({ label, listing }) {
  return (
    <div className="rounded-xl border border-secondary/30 p-4">
      <p className="text-xs font-medium text-gray-500 mb-2">{label}</p>
      <div className="flex gap-3">
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
          <p className="font-semibold text-gray-900">{listing.type}</p>
          <p className="text-sm text-gray-600">{listing.brand}</p>
          <p className="text-sm text-gray-500">
            {formatEstimatedValue(listing.estimatedValue)}
          </p>
        </div>
      </div>
    </div>
  )
}

function SwapStatus() {
  const { swapId } = useParams()
  const { user } = useAuth()

  const [swap, setSwap] = useState(null)
  const [requestedItem, setRequestedItem] = useState(null)
  const [offeredItem, setOfferedItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const loadSwap = useCallback(async () => {
    const data = await getSwapById(swapId)
    const [reqItem, offItem] = await Promise.all([
      getListingById(data.requestedItemId),
      getListingById(data.offeredItemId),
    ])
    setSwap(data)
    setRequestedItem(reqItem)
    setOfferedItem(offItem)
  }, [swapId])

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    loadSwap()
      .catch((err) => {
        if (!cancelled) {
          toast.error(
            err.response?.data?.error || 'Failed to load swap request.',
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [loadSwap])

  async function handleAction(action, successMessage) {
    setActionLoading(true)
    try {
      const updated = await action(swapId)
      setSwap(updated)
      toast.success(successMessage)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action failed.')
      loadSwap().catch(() => {})
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-background px-6 py-12 flex justify-center">
        <Spinner />
      </div>
    )
  }

  if (!swap || !requestedItem || !offeredItem) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-background px-6 py-12">
        <p className="text-gray-500">Swap request not found.</p>
      </div>
    )
  }

  const isRecipient = user && swap.toUserId === user.id
  const isSender = user && swap.fromUserId === user.id
  const isPending = swap.status === 'pending'

  return (
    <div className="min-h-[calc(100vh-73px)] bg-background px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <nav className="mb-4 text-sm text-gray-500">
          <Link to="/dashboard" className="hover:text-primary transition-colors">
            Dashboard
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">Swap Request</span>
        </nav>

        <div className="rounded-2xl bg-white p-8 shadow-lg shadow-primary/10 border border-secondary/30">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-gray-900">
              Swap Request #{swap.id}
            </h1>
            <StatusBadge status={swap.status} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <SwapItemCard label="Requested Item" listing={requestedItem} />
            <SwapItemCard label="Offered Item" listing={offeredItem} />
          </div>

          {isPending && isRecipient && (
            <div className="flex gap-3">
              <button
                onClick={() =>
                  handleAction(acceptSwap, 'Swap request accepted')
                }
                disabled={actionLoading}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-secondary transition-colors disabled:opacity-60 cursor-pointer"
              >
                Accept
              </button>
              <button
                onClick={() =>
                  handleAction(rejectSwap, 'Swap request rejected')
                }
                disabled={actionLoading}
                className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60 cursor-pointer"
              >
                Reject
              </button>
            </div>
          )}

          {isPending && isSender && (
            <button
              onClick={() =>
                handleAction(cancelSwap, 'Swap request cancelled')
              }
              disabled={actionLoading}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60 cursor-pointer"
            >
              Cancel Request
            </button>
          )}

          {swap.status === 'accepted' && (
            <Link
              to={`/swaps/${swap.id}/chat`}
              className="inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-secondary transition-colors"
            >
              Go to Chat
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default SwapStatus
