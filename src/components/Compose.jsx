import { useState, useRef, useEffect } from 'react'
import { IconButton, Send } from './common'
import { copilotLogo } from '../shared/assets'
import './Compose.css'

// Main-canvas compose input. Sits below the chat messages. Handles a few
// specifics on top of a plain input:
//   • When a `/mention` is present (e.g. "/Jira …"), it's rendered as a
//     purple pill in front of the input; Backspace on an empty input clears it.
//   • Channels use "Start a new post" placeholder instead of "Type a message".
//   • When typing "@" followed by text, shows an at-mention suggestion menu.
//
// All action buttons except Send are placeholder styling — wire them up
// when you need them for a prototype.
export default function Compose({
  value,
  mention,
  onChange,
  onClearMention,
  onSend,
  isChannel,
  onMentionSelect,
}) {
  const [showMentionMenu, setShowMentionMenu] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const composeRef = useRef(null)

  // Detect @ mentions in the input
  useEffect(() => {
    const atIndex = value.lastIndexOf('@')
    if (atIndex !== -1) {
      const textAfterAt = value.slice(atIndex + 1)
      // Show menu if @ is at start or preceded by space, and followed by text
      const beforeAt = value.slice(0, atIndex)
      const isValidMention = beforeAt === '' || beforeAt.endsWith(' ')

      // Only show menu if user has typed at least "@Power" (case-insensitive)
      if (isValidMention) {
        const query = textAfterAt.toLowerCase()
        const powerBI = 'power bi'
        const shouldShow = query.length >= 5 && powerBI.startsWith(query)
        setMentionQuery(textAfterAt)
        setShowMentionMenu(shouldShow)
      } else {
        setShowMentionMenu(false)
      }
    } else {
      setShowMentionMenu(false)
    }
  }, [value])

  const handleKeyDown = (e) => {
    if (e.key === 'Backspace' && value === '' && mention) {
      e.preventDefault()
      onClearMention()
      return
    }
    if (e.key === 'Escape' && showMentionMenu) {
      setShowMentionMenu(false)
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      onSend()
    }
  }

  const placeholder = mention
    ? ''
    : isChannel ? 'Start a new post' : 'Type a message'

  const handleMentionClick = () => {
    // Replace the @mention with @Power BI
    const atIndex = value.lastIndexOf('@')
    if (atIndex !== -1) {
      const beforeAt = value.slice(0, atIndex)
      const newValue = beforeAt + '@Power BI '
      onChange(newValue)
      setShowMentionMenu(false)
      if (onMentionSelect) {
        onMentionSelect('Power BI')
      }
    }
  }

  return (
    <div className="chat-compose" ref={composeRef}>
      {showMentionMenu && (
        <div className="mention-suggestion-menu">
          <div className="mention-suggestion-header">Suggestions</div>
          <div className="mention-suggestion-item" onClick={handleMentionClick}>
            <div className="mention-suggestion-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="8" width="4" height="10" rx="1" fill="#F2C811"/>
                <rect x="8" y="5" width="4" height="13" rx="1" fill="#F2C811"/>
                <rect x="14" y="2" width="4" height="16" rx="1" fill="#F2C811"/>
              </svg>
            </div>
            <div className="mention-suggestion-content">
              <div className="mention-suggestion-title">Add an agent to the chat</div>
              <div className="mention-suggestion-subtitle">Power BI</div>
            </div>
          </div>
        </div>
      )}
      <div className="compose-box-wrap">
        <div className="compose-box">
          {mention && (
            <span className="mention compose-mention">/{mention}</span>
          )}
          <input
            type="text"
            className="compose-input"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="compose-actions">
            <button className="compose-btn" aria-label="Format">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 15l3-10 3 10M8 12h4"/>
                <path d="M15 5l2 2"/>
              </svg>
            </button>
            <button className="compose-btn" aria-label="Emoji">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="10" cy="10" r="8"/>
                <path d="M6.5 11.5s1.5 2 3.5 2 3.5-2 3.5-2"/>
                <circle cx="7.5" cy="7.5" r=".75" fill="currentColor" stroke="none"/>
                <circle cx="12.5" cy="7.5" r=".75" fill="currentColor" stroke="none"/>
              </svg>
            </button>
            <button className="compose-btn" aria-label="Attach">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 10.5l-5 5a3.54 3.54 0 0 1-5-5l7-7a2.36 2.36 0 0 1 3.33 3.33l-7 7a1.18 1.18 0 0 1-1.67-1.67l5-5"/>
              </svg>
            </button>
            <button className="compose-btn" aria-label="Copilot">
              <img src={copilotLogo} alt="Copilot" className="copilot-logo-img-sm" />
            </button>
            <button className="compose-btn" aria-label="More apps">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 3a.75.75 0 0 1 .75.75v5.5h5.5a.75.75 0 0 1 0 1.5h-5.5v5.5a.75.75 0 0 1-1.5 0v-5.5h-5.5a.75.75 0 0 1 0-1.5h5.5v-5.5A.75.75 0 0 1 10 3z"/>
              </svg>
            </button>
            <div className="compose-divider" />
            <IconButton label="Send" className="send-btn" onClick={onSend}>
              <Send />
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  )
}
