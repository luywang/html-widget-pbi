import { Avatar, IconButton, Clock, Plus, Dots } from './common'
import './ChatHeader.css'

// Teams-style chat header: avatar + name, inline tabs, and the right-side
// action cluster (meet, participants, notes, sessions, apps, more). Static
// placeholders for most actions — the sessions toggle is the only wired one.
export default function ChatHeader({
  activeContact,
  isChannel,
  participantCount,
  hasSessions,
  showSessions,
  onToggleSessions,
}) {
  return (
    <div className="chat-view-header">
      <div className="chat-header-row">
        <Avatar contact={activeContact} size={28} />
        <span className="chat-header-name">{activeContact.name}</span>
        <div className="chat-header-tabs">
          {isChannel ? (
            <>
              <button className="chat-view-tab active">Conversation</button>
              <button className="chat-view-tab">Shared</button>
            </>
          ) : (
            <>
              <button className="chat-view-tab active">Chat</button>
              <button className="chat-view-tab">Shared</button>
              <button className="chat-view-tab">Recap</button>
              <button className="chat-view-tab">Storyline</button>
            </>
          )}
          <button className="chat-view-tab tab-add" aria-label="Add tab">
            <Plus />
          </button>
        </div>
        <div className="chat-header-actions">
          <button className="meet-now-btn" aria-label="Meet now">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="12" height="11" rx="1.5"/>
              <path d="M14 8.5l4-2.5v8l-4-2.5"/>
            </svg>
            <span>Meet now</span>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor" className="meet-chevron">
              <path d="M2.15 4.15a.5.5 0 0 1 .7 0L6 7.29l3.15-3.14a.5.5 0 0 1 .7.7l-3.5 3.5a.5.5 0 0 1-.7 0l-3.5-3.5a.5.5 0 0 1 0-.7z"/>
            </svg>
          </button>
          <button className="header-action-btn participants-btn" aria-label="Participants">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="7.5" cy="6" r="2.5"/>
              <path d="M2 15c0-2.5 2-4.5 5.5-4.5S13 12.5 13 15"/>
              <circle cx="14" cy="7" r="2"/>
              <path d="M14 11.5c2.5 0 4 1.5 4 3.5"/>
            </svg>
            <span className="participants-count">{participantCount}</span>
          </button>
          <div className="header-divider" />
          <button className="header-action-btn" aria-label="Notes">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 3h10a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4V3z"/>
              <path d="M7 7h4M7 10h4M7 13h2"/>
              <path d="M15 11l2-2v7a1 1 0 0 1-1 1h-1"/>
            </svg>
          </button>
          {hasSessions && (
            <IconButton
              label="Sessions"
              active={showSessions}
              className="header-action-btn"
              onClick={onToggleSessions}
            >
              <Clock />
            </IconButton>
          )}
          <button className="header-action-btn" aria-label="Apps">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="6" height="6" rx="1"/>
              <rect x="11" y="3" width="6" height="6" rx="1"/>
              <rect x="3" y="11" width="6" height="6" rx="1"/>
              <rect x="11" y="11" width="6" height="6" rx="1"/>
            </svg>
          </button>
          <button className="header-action-btn" aria-label="More options">
            <Dots size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
