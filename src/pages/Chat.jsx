import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getSwapById } from '../api/swaps'
import { getListingById } from '../api/listings'
import { sendMessage, getMessages } from '../api/chat'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/Spinner'

const POLL_INTERVAL_MS = 3500

function Chat() {
  const { swapId } = useParams()
  const { user } = useAuth()

  const [swap, setSwap] = useState(null)
  const [requestedItem, setRequestedItem] = useState(null)
  const [offeredItem, setOfferedItem] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)

  const messagesEndRef = useRef(null)
  const highestMessageIdRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const swapData = await getSwapById(swapId)
        if (cancelled) return
        setSwap(swapData)

        const [reqItem, offItem, initialMessages] = await Promise.all([
          getListingById(swapData.requestedItemId),
          getListingById(swapData.offeredItemId),
          getMessages(swapId),
        ])
        if (cancelled) return

        setRequestedItem(reqItem)
        setOfferedItem(offItem)
        setMessages(initialMessages)
        if (initialMessages.length) {
          highestMessageIdRef.current =
            initialMessages[initialMessages.length - 1].id
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(err.response?.data?.error || 'Failed to load chat.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [swapId])

  useEffect(() => {
    if (loading) return

    let cancelled = false

    const intervalId = setInterval(async () => {
      try {
        const newMessages = await getMessages(
          swapId,
          highestMessageIdRef.current,
        )
        if (cancelled || newMessages.length === 0) return

        setMessages((prev) => [...prev, ...newMessages])
        highestMessageIdRef.current = newMessages[newMessages.length - 1].id
      } catch {
        // ignore transient poll failures
      }
    }, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      clearInterval(intervalId)
    }
  }, [swapId, loading])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e) {
    e.preventDefault()
    const trimmed = content.trim()
    if (!trimmed) return

    setSending(true)
    try {
      const message = await sendMessage(swapId, trimmed)
      setMessages((prev) => [...prev, message])
      highestMessageIdRef.current = message.id
      setContent('')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send message.')
    } finally {
      setSending(false)
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

  const otherPartyId =
    user?.id === swap.fromUserId ? swap.toUserId : swap.fromUserId

  return (
    <div className="min-h-[calc(100vh-73px)] bg-background px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <nav className="mb-4 text-sm text-gray-500">
          <Link to="/dashboard" className="hover:text-primary transition-colors">
            Dashboard
          </Link>
          <span className="mx-2">/</span>
          <Link
            to={`/swaps/${swapId}`}
            className="hover:text-primary transition-colors"
          >
            Swap Request
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">Chat</span>
        </nav>

        <div className="rounded-2xl bg-white shadow-lg shadow-primary/10 border border-secondary/30 flex flex-col h-[70vh]">
          <div className="border-b border-secondary/30 px-6 py-4">
            <h1 className="font-bold text-gray-900">
              Negotiating: {requestedItem.type} for {offeredItem.type}
            </h1>
            <p className="text-xs text-gray-500">
              With user #{otherPartyId}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
            {messages.length === 0 ? (
              <p className="text-sm text-gray-500 text-center pt-8">
                No messages yet — start the conversation.
              </p>
            ) : (
              messages.map((message) => {
                const isMine = message.senderId === user?.id
                return (
                  <div
                    key={message.id}
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                        isMine
                          ? 'bg-primary text-white'
                          : 'bg-accent-mist text-gray-900'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSend}
            className="flex gap-2 border-t border-secondary/30 px-4 py-3"
          >
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type a message…"
              className="flex-1 rounded-lg border border-secondary/50 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={sending || !content.trim()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-secondary transition-colors disabled:opacity-60 cursor-pointer"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Chat
