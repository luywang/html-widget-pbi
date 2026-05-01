import { EmojiAdd, Edit, Dots } from './common'
import './MessageActions.css'

// Hover toolbar shown above a message bubble. Contains quick emoji reactions,
// the full emoji picker trigger, a divider, then edit/more-options.
// All actions are static placeholders for now — wire real handlers when the
// reaction data model is implemented.
const QUICK_REACTIONS = [
  { key: 'like', emoji: '👍', label: 'Like' },
  { key: 'heart', emoji: '❤️', label: 'Heart' },
  { key: 'laugh', emoji: '😂', label: 'Laugh' },
  { key: 'surprise', emoji: '😮', label: 'Surprise' },
]

export default function MessageActions({ onReact }) {
  return (
    <>
      <div className="message-actions-trigger" aria-hidden="true" />
      <div className="message-actions" onClick={(e) => e.stopPropagation()}>
      {QUICK_REACTIONS.map((r) => (
        <button
          key={r.key}
          type="button"
          className="message-action-btn message-action-emoji"
          aria-label={r.label}
          onClick={() => onReact?.(r.emoji)}
        >
          <span aria-hidden="true">{r.emoji}</span>
        </button>
      ))}
      <button type="button" className="message-action-btn" aria-label="More emojis">
        <EmojiAdd size={18} />
      </button>
      <span className="message-actions-divider" aria-hidden="true" />
      <button type="button" className="message-action-btn" aria-label="Edit">
        <Edit size={16} />
      </button>
      <button type="button" className="message-action-btn" aria-label="More options">
        <Dots size={18} />
      </button>
      </div>
    </>
  )
}
