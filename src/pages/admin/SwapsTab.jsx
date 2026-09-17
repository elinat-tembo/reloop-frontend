import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getSwaps, getSwapMessages, forceSwapStatus } from '../../api/admin'
import Spinner from '../../components/Spinner'
import Pagination from '../../components/Pagination'
import StatusBadge from '../../components/StatusBadge'
import Modal from '../../components/Modal'
import MessageThread from '../../components/MessageThread'
import { SWAP_STATUSES } from '../../utils/swapStatus'

const PAGE_LIMIT = 10

function SwapRow({ swap, onStatusChanged, onViewChat }) {
  const [draftStatus, setDraftStatus] = useState(swap.status)
  const [applying, setApplying] = useState(false)

  async function handleApply() {
    if (draftStatus === swap.status) return

    setApplying(true)
    try {
      const updated = await forceSwapStatus(swap.id, draftStatus)
      onStatusChanged(updated)
      toast.success(`Swap #${swap.id} status set to ${updated.status}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update status.')
      setDraftStatus(swap.status)
    } finally {
      setApplying(false)
    }
  }

  return (
    <tr>
      <td className="px-4 py-2 text-gray-900">#{swap.id}</td>
      <td className="px-4 py-2 text-gray-500">#{swap.fromUserId}</td>
      <td className="px-4 py-2 text-gray-500">#{swap.toUserId}</td>
      <td className="px-4 py-2 text-gray-500">#{swap.requestedItemId}</td>
      <td className="px-4 py-2 text-gray-500">#{swap.offeredItemId}</td>
      <td className="px-4 py-2">
        <StatusBadge status={swap.status} />
      </td>
      <td className="px-4 py-2 text-gray-500">
        {new Date(swap.createdAt).toLocaleDateString()}
      </td>
      <td className="px-4 py-2">
        <button
          type="button"
          onClick={() => onViewChat(swap)}
          className="rounded-lg border border-secondary/50 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-accent-mist transition-colors cursor-pointer"
        >
          View Chat
        </button>
      </td>
      <td className="px-4 py-2">
        <div className="flex items-center gap-2">
          <select
            value={draftStatus}
            onChange={(e) => setDraftStatus(e.target.value)}
            className="rounded-lg border border-secondary/50 px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {SWAP_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleApply}
            disabled={applying || draftStatus === swap.status}
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-secondary transition-colors disabled:opacity-60 cursor-pointer"
          >
            Apply
          </button>
        </div>
      </td>
    </tr>
  )
}

function SwapsTab() {
  const [swaps, setSwaps] = useState([])
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const [viewingSwap, setViewingSwap] = useState(null)
  const [messages, setMessages] = useState([])
  const [messagesLoading, setMessagesLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    getSwaps(page, PAGE_LIMIT)
      .then(({ swapRequests, pagination: paginationData }) => {
        if (!cancelled) {
          setSwaps(swapRequests)
          setPagination(paginationData)
        }
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load swap requests.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [page])

  function handleStatusChanged(updated) {
    setSwaps((prev) =>
      prev.map((swap) => (swap.id === updated.id ? updated : swap)),
    )
  }

  function handleViewChat(swap) {
    setViewingSwap(swap)
    setMessagesLoading(true)
    getSwapMessages(swap.id)
      .then(setMessages)
      .catch((err) => {
        toast.error(
          err.response?.data?.error || 'Failed to load chat history.',
        )
        setMessages([])
      })
      .finally(() => setMessagesLoading(false))
  }

  function closeModal() {
    setViewingSwap(null)
    setMessages([])
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  if (swaps.length === 0) {
    return <p className="text-gray-500">No swap requests found.</p>
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-secondary/30 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-secondary/30 text-left text-xs text-gray-500">
              <th className="px-4 py-2 font-medium">ID</th>
              <th className="px-4 py-2 font-medium">From</th>
              <th className="px-4 py-2 font-medium">To</th>
              <th className="px-4 py-2 font-medium">Requested Item</th>
              <th className="px-4 py-2 font-medium">Offered Item</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Created</th>
              <th className="px-4 py-2 font-medium">Chat</th>
              <th className="px-4 py-2 font-medium">Force Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary/20">
            {swaps.map((swap) => (
              <SwapRow
                key={swap.id}
                swap={swap}
                onStatusChanged={handleStatusChanged}
                onViewChat={handleViewChat}
              />
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

      {viewingSwap && (
        <Modal title={`Swap #${viewingSwap.id} — Chat History`} onClose={closeModal}>
          {messagesLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : (
            <MessageThread
              messages={messages}
              isMine={(message) => message.senderId === viewingSwap.fromUserId}
              emptyText="No messages in this conversation."
            />
          )}
        </Modal>
      )}
    </div>
  )
}

export default SwapsTab
