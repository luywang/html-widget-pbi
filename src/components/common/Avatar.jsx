import { agentLogos } from '../../shared/agentLogos'
import './Avatar.css'

// Renders a contact/agent/group avatar. Status dot scales with `size` so it
// stays visually balanced across usages (title bar 28, message row 32, etc).
// Groups and agents typically have no `contact.status` — no dot is drawn.
export default function Avatar({ contact, size = 36 }) {
  const logoSize = size * 0.4
  const dotSize = Math.max(6, Math.round(size * 0.28))
  // Channels use rounded-square avatars; everything else stays circular.
  const radius = contact.isChannel ? Math.max(3, Math.round(size * 0.18)) : '50%'
  return (
    <div
      className={`avatar ${contact.isChannel ? 'avatar-channel' : ''}`}
      style={{
        width: size,
        height: size,
        background: contact.avatar ? 'transparent' : contact.color,
        fontSize: size * 0.36,
        borderRadius: radius,
      }}
    >
      {contact.avatar ? (
        <img
          src={contact.avatar}
          alt=""
          className="avatar-img"
          style={{ width: size, height: size, borderRadius: radius }}
        />
      ) : contact.isAgent ? agentLogos[contact.logo](logoSize) : contact.initials}
      {contact.status && (
        <span
          className={`status-dot status-${contact.status}`}
          style={{ width: dotSize, height: dotSize }}
        />
      )}
    </div>
  )
}
