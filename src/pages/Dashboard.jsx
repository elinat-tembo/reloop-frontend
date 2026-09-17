import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { InboxArrowDownIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'
import { getMyListings, getListingById } from '../api/listings'
import { getIncoming, getOutgoing } from '../api/swaps'
import { isListingAvailable } from '../utils/listingHelpers'
import Spinner from '../components/Spinner'
import StatusBadge from '../components/StatusBadge'
import Pagination from '../components/Pagination'
import IconTab from '../components/IconTab'

const PAGE_LIMIT = 5

async function fetchListingsMap(ids) {
  const uniqueIds = [...new Set(ids)]
  const entries = await Promise.all(
    uniqueIds.map(async (id) => {
      try {
        return [id, await getListingById(id)]
      } catch {
        return [id, null]
      }
    }),
  )
  return Object.fromEntries(entries)
}

function SwapRequestList({ requests, listings, showSender }) {
  if (requests.length === 0) {
    return <p className="text-gray-500">No swap requests here yet.</p>
  }

  return (
    <div className="rounded-xl border border-secondary/30 bg-white divide-y divide-secondary/20">
      {requests.map((request) => {
        const item = listings[request.requestedItemId]
        return (
          <Link
            key={request.id}
            to={`/swaps/${request.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-accent-mist/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg overflow-hidden bg-accent-mist shrink-0">
                {item?.images?.[0] && (
                  <img
                    src={item.images[0]}
                    alt={item.type}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {item ? `${item.type} — ${item.brand}` : `Listing #${request.requestedItemId}`}
                </p>
                {showSender && (
                  <p className="text-xs text-gray-500">
                    From user #{request.fromUserId}
                  </p>
                )}
              </div>
            </div>
            <StatusBadge status={request.status} />
          </Link>
        )
      })}
    </div>
  )
}

function Dashboard() {
  const [listings, setListings] = useState([])
  const [listingsPagination, setListingsPagination] = useState(null)
  const [listingsPage, setListingsPage] = useState(1)
  const [listingsLoading, setListingsLoading] = useState(true)

  const [incoming, setIncoming] = useState([])
  const [incomingPagination, setIncomingPagination] = useState(null)
  const [incomingPage, setIncomingPage] = useState(1)
  const [incomingLoading, setIncomingLoading] = useState(true)

  const [outgoing, setOutgoing] = useState([])
  const [outgoingPagination, setOutgoingPagination] = useState(null)
  const [outgoingPage, setOutgoingPage] = useState(1)
  const [outgoingLoading, setOutgoingLoading] = useState(true)

  const [swapListings, setSwapListings] = useState({})

  useEffect(() => {
    let cancelled = false
    setListingsLoading(true)

    getMyListings({ page: listingsPage, limit: PAGE_LIMIT })
      .then(({ listings: data, pagination }) => {
        if (!cancelled) {
          setListings(data)
          setListingsPagination(pagination)
        }
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load your listings.')
      })
      .finally(() => {
        if (!cancelled) setListingsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [listingsPage])

  useEffect(() => {
    let cancelled = false
    setIncomingLoading(true)

    getIncoming({ page: incomingPage, limit: PAGE_LIMIT })
      .then(async ({ swapRequests, pagination }) => {
        if (cancelled) return
        setIncoming(swapRequests)
        setIncomingPagination(pagination)
        const map = await fetchListingsMap(
          swapRequests.map((request) => request.requestedItemId),
        )
        if (!cancelled) setSwapListings((prev) => ({ ...prev, ...map }))
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load incoming swap requests.')
      })
      .finally(() => {
        if (!cancelled) setIncomingLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [incomingPage])

  useEffect(() => {
    let cancelled = false
    setOutgoingLoading(true)

    getOutgoing({ page: outgoingPage, limit: PAGE_LIMIT })
      .then(async ({ swapRequests, pagination }) => {
        if (cancelled) return
        setOutgoing(swapRequests)
        setOutgoingPagination(pagination)
        const map = await fetchListingsMap(
          swapRequests.map((request) => request.requestedItemId),
        )
        if (!cancelled) setSwapListings((prev) => ({ ...prev, ...map }))
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load outgoing swap requests.')
      })
      .finally(() => {
        if (!cancelled) setOutgoingLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [outgoingPage])

  return (
    <div className="min-h-[calc(100vh-73px)] bg-background px-6 py-12">
      <div className="mx-auto max-w-4xl space-y-10">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

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

          {listingsLoading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : listings.length === 0 ? (
            <p className="text-gray-500">
              You haven&apos;t created any listings yet.
            </p>
          ) : (
            <>
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

              {listingsPagination && (
                <Pagination
                  page={listingsPagination.page}
                  totalPages={listingsPagination.totalPages}
                  hasPrev={listingsPagination.hasPrev}
                  hasNext={listingsPagination.hasNext}
                  onChange={setListingsPage}
                />
              )}
            </>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Swap Requests
          </h2>

          <TabGroup>
            <TabList className="flex gap-2 mb-4">
              <Tab className="focus:outline-none">
                {({ selected }) => (
                  <IconTab
                    icon={InboxArrowDownIcon}
                    label="Incoming"
                    selected={selected}
                  />
                )}
              </Tab>
              <Tab className="focus:outline-none">
                {({ selected }) => (
                  <IconTab
                    icon={PaperAirplaneIcon}
                    label="Outgoing"
                    selected={selected}
                  />
                )}
              </Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                {incomingLoading ? (
                  <div className="flex justify-center py-12">
                    <Spinner />
                  </div>
                ) : (
                  <>
                    <SwapRequestList
                      requests={incoming}
                      listings={swapListings}
                      showSender
                    />
                    {incomingPagination && (
                      <Pagination
                        page={incomingPagination.page}
                        totalPages={incomingPagination.totalPages}
                        hasPrev={incomingPagination.hasPrev}
                        hasNext={incomingPagination.hasNext}
                        onChange={setIncomingPage}
                      />
                    )}
                  </>
                )}
              </TabPanel>
              <TabPanel>
                {outgoingLoading ? (
                  <div className="flex justify-center py-12">
                    <Spinner />
                  </div>
                ) : (
                  <>
                    <SwapRequestList
                      requests={outgoing}
                      listings={swapListings}
                    />
                    {outgoingPagination && (
                      <Pagination
                        page={outgoingPagination.page}
                        totalPages={outgoingPagination.totalPages}
                        hasPrev={outgoingPagination.hasPrev}
                        hasNext={outgoingPagination.hasNext}
                        onChange={setOutgoingPage}
                      />
                    )}
                  </>
                )}
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </section>
      </div>
    </div>
  )
}

export default Dashboard
