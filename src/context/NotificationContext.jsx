import { createContext, useContext, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { getIncoming, getOutgoing } from '../api/swaps'
import { useAuth } from './AuthContext'

const POLL_INTERVAL_MS = 20000
// Polling has no pagination UI of its own — fetch a large page so status
// changes across the full set of requests are detected, not just page 1.
const POLL_PARAMS = { page: 1, limit: 100 }

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [pendingIncomingCount, setPendingIncomingCount] = useState(0)
  const seenStatusesRef = useRef(new Map())
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!user || user.role === 'admin') {
      seenStatusesRef.current = new Map()
      initializedRef.current = false
      setPendingIncomingCount(0)
      return
    }

    let cancelled = false

    async function poll() {
      let incoming
      let outgoing
      try {
        const [incomingRes, outgoingRes] = await Promise.all([
          getIncoming(POLL_PARAMS),
          getOutgoing(POLL_PARAMS),
        ])
        incoming = incomingRes.swapRequests
        outgoing = outgoingRes.swapRequests
      } catch {
        return
      }
      if (cancelled) return

      if (initializedRef.current) {
        incoming.forEach((request) => {
          const prevStatus = seenStatusesRef.current.get(request.id)
          if (prevStatus === undefined && request.status === 'pending') {
            toast('New swap request received')
          }
        })

        outgoing.forEach((request) => {
          const prevStatus = seenStatusesRef.current.get(request.id)
          if (prevStatus && prevStatus !== request.status) {
            if (request.status === 'accepted') {
              toast.success('Your swap request was accepted')
            } else if (request.status === 'rejected') {
              toast.error('Your swap request was rejected')
            } else if (request.status === 'expired') {
              toast('Your swap request expired')
            }
          }
        })
      } else {
        initializedRef.current = true
      }

      const nextSeen = new Map()
      incoming.forEach((request) => nextSeen.set(request.id, request.status))
      outgoing.forEach((request) => nextSeen.set(request.id, request.status))
      seenStatusesRef.current = nextSeen

      setPendingIncomingCount(
        incoming.filter((request) => request.status === 'pending').length,
      )
    }

    poll()
    const intervalId = setInterval(poll, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      clearInterval(intervalId)
    }
  }, [user])

  return (
    <NotificationContext.Provider value={{ pendingIncomingCount }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
