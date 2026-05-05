import { useState, memo, useEffect } from 'react'
import { agentLogos } from '../shared/agentLogos'
import { contacts, currentUser } from '../data/contacts'
import { Avatar, LinkCard, PrivateDisclaimer } from './common'
import MessageActions from './MessageActions'

// Combine seeded-in-data reactions with the current user's reactions into an
// ordered list of pills. `byMe: true` → purple outline in the UI.
function buildReactionList(baseReactions, myEmojis) {
  const map = new Map()
  for (const r of baseReactions || []) {
    map.set(r.emoji, { emoji: r.emoji, count: r.count, byMe: false })
  }
  for (const emoji of myEmojis) {
    const existing = map.get(emoji)
    if (existing) {
      map.set(emoji, { ...existing, count: existing.count + 1, byMe: true })
    } else {
      map.set(emoji, { emoji, count: 1, byMe: true })
    }
  }
  return [...map.values()]
}

function ThreadReplyBadge({ reply, onClick }) {
  const ids = reply.participantIds || (reply.agentId ? [reply.agentId] : [])
  const participants = ids
    .map((id) => (id === 'me' ? currentUser : contacts.find((c) => c.id === id)))
    .filter(Boolean)
  if (!participants.length) return null
  const label = reply.count === 1 ? '1 reply' : `${reply.count} replies`
  return (
    <button type="button" className="message-thread-replies" onClick={onClick}>
      <span className="message-thread-replies-avatars">
        {participants.map((p, i) => (
          <span
            key={i}
            className="message-thread-replies-avatar"
            style={{ background: p.avatar ? 'transparent' : p.color || '#6264A7' }}
          >
            {p.avatar ? (
              <img src={p.avatar} alt="" />
            ) : p.isAgent ? (
              agentLogos[p.logo](10)
            ) : (
              p.initials
            )}
          </span>
        ))}
      </span>
      <span className="message-thread-replies-label">{label}</span>
    </button>
  )
}

const MessageRow = memo(function MessageRow({ message, activeContact, onOpenThread }) {
  const isMe = message.senderId === 'me'
  const isMultiParty = activeContact.isGroup || activeContact.isChannel
  const sender = isMe
    ? currentUser
    : isMultiParty
      ? contacts.find(c => c.id === message.senderId)
      : activeContact

  const [myReactions, setMyReactions] = useState(() => new Set())
  const toggleReaction = (emoji) => {
    setMyReactions(prev => {
      const next = new Set(prev)
      if (next.has(emoji)) next.delete(emoji)
      else next.add(emoji)
      return next
    })
  }
  const reactions = buildReactionList(message.reactions, myReactions)

  // Handle delayed card unfurling for realistic loading experience
  const [showCards, setShowCards] = useState(!message.delayedCards)
  useEffect(() => {
    if (message.delayedCards && !showCards) {
      const timer = setTimeout(() => {
        setShowCards(true)
        // Scroll to bottom of message after card unfurls
        setTimeout(() => {
          const messageEl = document.querySelector(`[data-message-id="${message.id}"]`)
          if (messageEl) {
            messageEl.scrollIntoView({ behavior: 'smooth', block: 'end' })
          }
        }, 100)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [message.delayedCards, showCards, message.id])

  return (
    <div
      className={`message-row ${isMe ? 'message-mine' : ''}`}
      data-message-id={message.id}
    >
      {!isMe && (
        <div className="message-avatar-col">
          <Avatar contact={sender} size={32} />
        </div>
      )}
      <div className="message-content-wrap">
        <div className="message-meta">
          {!isMe && <span className="message-sender-name">{sender.name}</span>}
          <span className="message-timestamp">{message.time}</span>
        </div>
        <div className={`message-bubble ${message.isPrivate ? 'message-bubble-private' : ''}`}>
          <MessageActions onReact={toggleReaction} />
          {message.isPrivate && <PrivateDisclaimer />}
          {message.forwardedFrom && (
            <div className="forwarded-message">
              <div className="forwarded-sender">{message.forwardedFrom.sender}</div>
              <div className="forwarded-text">{message.forwardedFrom.text}</div>
            </div>
          )}
          {message.subject && <div className="message-subject">{message.subject}</div>}
          {Array.isArray(message.text)
            ? message.text.map((part, i) => {
                if (typeof part === 'string') return part
                if (part.type === 'mention') return <span key={i} className="mention">{part.name}</span>
                if (part.type === 'link') return (
                  <a
                    key={i}
                    href={part.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#6264A7', textDecoration: 'underline' }}
                  >
                    {part.text}
                  </a>
                )
                return null
              })
            : message.text}
          {message.link && <LinkCard link={message.link} />}
          {message.cards && showCards && (
            <div className="message-cards">
              {message.cards.map((card, i) => (
                <div key={i} className="adaptive-card" style={{ borderLeftColor: card.accentColor }}>
                  {card.htmlWidget && (
                    <div className="card-html-widget" dangerouslySetInnerHTML={{ __html: card.htmlWidget }} />
                  )}
                  {card.reportName && (
                    <div className="card-report-name">{card.reportName}</div>
                  )}
                  {card.title && (
                    <div className="card-title">{card.title}</div>
                  )}
                  {card.summary && (
                    <div className="card-summary">
                      {Array.isArray(card.summary)
                        ? card.summary.map((part, j) =>
                            typeof part === 'string' ? part : <strong key={j}>{part.text}</strong>
                          )
                        : card.summary}
                    </div>
                  )}
                  {card.facts && (
                    <div className="card-facts">
                      {card.facts.map((fact, j) => (
                        <span key={j} className="card-fact">
                          <span className="card-fact-label">{fact.label}:</span> {fact.value}
                        </span>
                      ))}
                    </div>
                  )}
                  {card.actions && (
                    <div className="card-actions">
                      {card.actions.map((action, j) => (
                        <button key={j} className="card-action-btn">{action}</button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        {reactions.length > 0 && (
          <div className="message-reactions-bar">
            {reactions.map((r) => (
              <button
                key={r.emoji}
                type="button"
                className={`reaction-pill ${r.byMe ? 'reaction-pill-mine' : ''}`}
                onClick={() => toggleReaction(r.emoji)}
                aria-label={`${r.byMe ? 'Remove' : 'Add'} reaction ${r.emoji}`}
              >
                <span aria-hidden="true">{r.emoji}</span>
                {r.count > 1 && <span className="reaction-pill-count">{r.count}</span>}
              </button>
            ))}
          </div>
        )}
        {message.threadReply && (
          <ThreadReplyBadge
            reply={message.threadReply}
            onClick={() => onOpenThread?.(message)}
          />
        )}
      </div>
      {isMe && isMultiParty && (
        <div className="message-avatar-col">
          <Avatar contact={currentUser} size={32} />
        </div>
      )}
    </div>
  )
})

export default MessageRow
