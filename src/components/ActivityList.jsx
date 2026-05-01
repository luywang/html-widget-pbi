import { useMemo, useState } from 'react'
import {
  contacts,
  messagesByContact,
  channelPostsByContact,
} from '../data'
import { Avatar } from './common'
import './ActivityList.css'

function flattenText(text) {
  if (!text) return ''
  if (typeof text === 'string') return text
  return text
    .map((part) => (typeof part === 'string' ? part : part?.name || ''))
    .join('')
}

function snippet(text, max = 140) {
  const s = flattenText(text).replace(/\s+/g, ' ').trim()
  return s.length > max ? s.slice(0, max - 1) + '…' : s
}

// Resolve an event into the pieces ActivityList needs to render it:
//   actor, actionLabel (bold sentence), contentPreview, locationLabel
function resolveEvent(event) {
  const actor = contacts.find((c) => c.id === event.actorId)
  const chat = contacts.find((c) => c.id === event.chatId)
  if (!actor || !chat) return null

  const isChannel = !!chat.isChannel
  const posts = isChannel ? channelPostsByContact[event.chatId] || [] : null
  const post = event.postId ? posts?.find((p) => p.id === event.postId) : null
  const reply = post && event.replyId ? post.replies?.find((r) => r.id === event.replyId) : null

  const chatMessages = !isChannel ? messagesByContact[event.chatId] || [] : null
  const anchorMessage = chatMessages?.find((m) => m.id === event.messageId)

  let actionLabel
  let contentPreview
  const locationLabel = isChannel
    ? post?.subject
      ? `${chat.name} · ${post.subject}`
      : chat.name
    : chat.name

  if (event.type === 'reaction') {
    actionLabel = `reacted ${event.emoji} to your message`
    contentPreview = snippet(anchorMessage?.text || post?.text || '')
  } else if (event.type === 'reply') {
    actionLabel = 'replied to your post'
    contentPreview = snippet(reply?.text || '')
  } else if (event.type === 'mention') {
    actionLabel = `mentioned you in ${chat.isGroup || chat.isChannel ? chat.name : 'a chat'}`
    contentPreview = snippet(anchorMessage?.text || '')
  }

  return { actor, chat, actionLabel, contentPreview, locationLabel }
}

function ReactionBadge({ emoji }) {
  return <span className="activity-badge activity-badge-emoji">{emoji}</span>
}

function ReplyBadge() {
  return (
    <span className="activity-badge activity-badge-reply" aria-hidden="true">
      <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
        <path d="M7.78 2.22a.75.75 0 0 1 0 1.06L5.31 5.75H9.5a4.5 4.5 0 0 1 0 9h-1a.75.75 0 0 1 0-1.5h1a3 3 0 0 0 0-6H5.31l2.47 2.47a.75.75 0 1 1-1.06 1.06l-3.75-3.75a.75.75 0 0 1 0-1.06l3.75-3.75a.75.75 0 0 1 1.06 0z"/>
      </svg>
    </span>
  )
}

function MentionBadge() {
  return <span className="activity-badge activity-badge-mention" aria-hidden="true">@</span>
}

// Filter pills. Single-select — clicking the active pill deselects, so
// the default view (no pill active) shows the full feed.
const FILTERS = [
  { id: 'unread', label: 'Unread', match: (e) => e.unread },
  { id: 'mention', label: '@Mentions', match: (e) => e.type === 'mention' },
  { id: 'tag-mention', label: 'Tag Mentions', match: (e) => e.type === 'tag-mention' },
]

export default function ActivityList({ events, activeEventId, onSelectEvent }) {
  const [activeFilter, setActiveFilter] = useState(null)
  const toggleFilter = (id) => setActiveFilter((prev) => (prev === id ? null : id))

  const resolved = useMemo(() => {
    const filter = FILTERS.find((f) => f.id === activeFilter)
    const filtered = filter ? events.filter(filter.match) : events
    return filtered
      .map((event) => {
        const r = resolveEvent(event)
        return r ? { event, ...r } : null
      })
      .filter(Boolean)
  }, [events, activeFilter])

  return (
    <aside className="activity-rail">
      <div className="activity-rail-header">
        <div className="activity-rail-title">Activity</div>
      </div>
      <div className="activity-rail-filters">
        {FILTERS.map((f) => {
          const isActive = f.id === activeFilter
          return (
            <button
              key={f.id}
              type="button"
              className={`activity-filter-pill${isActive ? ' activity-filter-pill-active' : ''}`}
              aria-pressed={isActive}
              onClick={() => toggleFilter(f.id)}
            >
              {f.label}
            </button>
          )
        })}
      </div>
      <div className="activity-rail-divider" />
      <div className="activity-rail-list">
        {resolved.length === 0 && (
          <div className="activity-rail-empty">
            No {FILTERS.find((f) => f.id === activeFilter)?.label.toLowerCase()} notifications.
          </div>
        )}
        {resolved.map(({ event, actor, actionLabel, contentPreview, locationLabel }) => {
          const isSelected = event.id === activeEventId
          const isUnread = event.unread && !isSelected
          return (
            <button
              key={event.id}
              type="button"
              className={`activity-item${isSelected ? ' activity-item-selected' : ''}${isUnread ? ' activity-item-unread' : ''}`}
              onClick={() => onSelectEvent(event)}
            >
              <div className="activity-avatar-wrap">
                <Avatar contact={actor} size={32} />
                {event.type === 'reaction' && <ReactionBadge emoji={event.emoji} />}
                {event.type === 'reply' && <ReplyBadge />}
                {event.type === 'mention' && <MentionBadge />}
              </div>
              <div className="activity-body">
                <div className="activity-title">
                  <span className="activity-actor">{actor.name}</span>{' '}
                  <span className="activity-action">{actionLabel}</span>
                </div>
                {contentPreview && <div className="activity-preview">{contentPreview}</div>}
                <div className="activity-meta">
                  <span className="activity-location">{locationLabel}</span>
                  <span className="activity-meta-sep">·</span>
                  <span className="activity-time">{event.time}</span>
                </div>
              </div>
              {isUnread && <span className="activity-unread-dot" aria-label="unread" />}
            </button>
          )
        })}
      </div>
    </aside>
  )
}
