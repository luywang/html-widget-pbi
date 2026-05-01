import Avatar from './Avatar'
import './TypingIndicator.css'

// Canonical typing indicator: a typing user's avatar next to three
// bouncing dots. Reuse this anywhere the UI needs to show "X is typing"
// — do not roll a new one. Positioning (floating above compose, inline
// in a rail, etc.) is the caller's responsibility; this component only
// owns the avatar + dots visual.
export default function TypingIndicator({ contact, avatarSize = 32, dotSize = 5, className = '' }) {
  if (!contact) return null
  return (
    <div
      className={`typing-indicator ${className}`.trim()}
      aria-label={`${contact.name} is typing`}
      style={{ '--typing-dot-size': `${dotSize}px` }}
    >
      <Avatar contact={contact} size={avatarSize} />
      <span className="typing-indicator-dots">
        <span /><span /><span />
      </span>
    </div>
  )
}
