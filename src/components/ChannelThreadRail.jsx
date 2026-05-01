import { useState, useRef, useEffect } from 'react'
import MessageRow from './MessageRow'
import { IconButton, Close, Send } from './common'
import './ChannelThreadRail.css'

// Right-pane thread view for a channel post. Shows the root post, all replies,
// and a compose input at the bottom. Replies added here are ephemeral
// (prototype state only) — the root post data in channelPosts.js is not
// mutated.
export default function ChannelThreadRail({ post, activeContact, onClose }) {
  const [extraReplies, setExtraReplies] = useState([])
  const [input, setInput] = useState('')
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [extraReplies, post?.id])

  const allReplies = [...(post.replies || []), ...extraReplies]

  // Title for the rail: "Threads > [initial message]". Prefer the post's
  // subject when it has one; otherwise use the flattened post text.
  const firstLine = (() => {
    if (post.subject) return post.subject
    if (Array.isArray(post.text)) {
      return post.text.map((p) => (typeof p === 'string' ? p : p.name)).join('')
    }
    return post.text || ''
  })().replace(/\s+/g, ' ').trim()

  const send = () => {
    const text = input.trim()
    if (!text) return
    const now = new Date()
    const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    setExtraReplies((prev) => [
      ...prev,
      { id: `reply-${Date.now()}`, senderId: 'me', text, time },
    ])
    setInput('')
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="channel-thread-rail">
      <div className="channel-thread-rail-header">
        <div className="channel-thread-rail-title" title={`Threads > ${firstLine}`}>
          <span className="channel-thread-rail-title-prefix">Threads</span>
          <span className="channel-thread-rail-title-chevron" aria-hidden="true">›</span>
          <span className="channel-thread-rail-title-subject">{firstLine}</span>
        </div>
        <IconButton label="Close" className="channel-thread-rail-close" onClick={onClose}>
          <Close />
        </IconButton>
      </div>

      <div className="channel-thread-rail-body">
        <div className="channel-thread-rail-messages">
          <MessageRow
            message={{ ...post, threadReply: undefined }}
            activeContact={activeContact}
          />
          {allReplies.map((reply) => (
            <MessageRow
              key={reply.id}
              message={reply}
              activeContact={activeContact}
            />
          ))}
          <div ref={endRef} />
        </div>
      </div>

      <div className="channel-thread-rail-compose">
        <div className="channel-thread-rail-compose-box">
          <input
            type="text"
            className="channel-thread-rail-input"
            placeholder="Reply"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <IconButton label="Send" className="channel-thread-rail-send" onClick={send}>
            <Send />
          </IconButton>
        </div>
      </div>
    </div>
  )
}
