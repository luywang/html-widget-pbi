import { IconButton, Send } from './common'
import { copilotLogo } from '../shared/assets'
import './Compose.css'

// Main-canvas compose input. Sits below the chat messages. Handles a few
// specifics on top of a plain input:
//   • When a `/mention` is present (e.g. "/Jira …"), it's rendered as a
//     purple pill in front of the input; Backspace on an empty input clears it.
//   • Channels use "Start a new post" placeholder instead of "Type a message".
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
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Backspace' && value === '' && mention) {
      e.preventDefault()
      onClearMention()
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

  return (
    <div className="chat-compose">
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
