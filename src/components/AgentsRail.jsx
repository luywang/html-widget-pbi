import { useState, useRef, useEffect } from 'react'
import { Avatar, LinkCard, IconButton, PrivateDisclaimer, TypingIndicator, Close, Clock, ChevronLeft, Send } from './common'
import './AgentsRail.css'

function AgentItem({ agent, onClick }) {
  return (
    <div
      className={`agent-item ${onClick ? 'agent-item-clickable' : ''}`}
      onClick={onClick}
    >
      <Avatar contact={agent} size={32} />
      <div className="agent-item-text">
        <div className="agent-item-name">{agent.name}</div>
        {agent.description && (
          <div className="agent-item-description">{agent.description}</div>
        )}
      </div>
    </div>
  )
}

function renderText(text) {
  if (Array.isArray(text)) {
    return text.map((part, i) =>
      typeof part === 'string'
        ? part
        : <span key={i} className="mention">{part.name}</span>
    )
  }
  return text
}

function AgentChat({ agent, messages, onSendMessage, composeHint, isTyping }) {
  // Derive the initial input from the compose hint so a prefilled suggestion
  // shows up without a setState-in-effect round trip. Keyed on hint+agent so
  // a new hint or a new agent resets the field.
  const hintText = composeHint && composeHint.agentId === agent.id ? composeHint.text : ''
  const [input, setInput] = useState(hintText)
  const [inputKey, setInputKey] = useState(`${agent.id}:${hintText}`)
  const nextKey = `${agent.id}:${hintText}`
  if (inputKey !== nextKey) {
    setInputKey(nextKey)
    setInput(hintText)
  }
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const send = () => {
    const text = input.trim()
    if (!text) return
    onSendMessage(text)
    setInput('')
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      send()
    }
  }

  // Jira demo hint-arrow condition — kept for reference.
  // const showHintArrow =
  //   composeHint && composeHint.agentId === agent.id && input.trim().length > 0

  return (
    <div className="agent-chat">
      <div className="agent-chat-context">
        <PrivateDisclaimer />
      </div>
      <div className="agent-chat-messages">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`agent-chat-row ${m.from === 'me' ? 'agent-chat-row-mine' : ''}`}
          >
            <div className="agent-chat-meta">
              <span className="agent-chat-sender-name">{m.from === 'me' ? 'You' : agent.name}</span>
              {m.time && <span className="agent-chat-timestamp">{m.time}</span>}
            </div>
            <div className="agent-chat-bubble">
              {renderText(m.text)}
              {m.link && <LinkCard link={m.link} />}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      {isTyping && (
        <TypingIndicator
          contact={agent}
          avatarSize={24}
          dotSize={4}
          className="agent-chat-typing"
        />
      )}
      <div className="agent-chat-compose">
        {/* Jira demo hint arrow removed — `.agent-chat-hint-arrow` remains in CSS if needed. */}
        <div className="agent-chat-compose-box">
          <input
            type="text"
            className="agent-chat-input"
            placeholder={`Message ${agent.name}`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <IconButton label="Send" className="agent-chat-send" onClick={send}>
            <Send />
          </IconButton>
        </div>
      </div>
    </div>
  )
}

function AgentDetailView({ agent, messages, onSendMessage, composeHint, isTyping, onBack, onClose }) {
  const sessions = [
    { id: 'current', name: 'Current conversation', time: 'Just now' },
    { id: 'blockers', name: 'Blockers recap', time: 'Yesterday' },
    { id: 'sprint', name: 'Sprint planning', time: 'April 10' },
  ]
  const [activeSessionId, setActiveSessionId] = useState('current')
  const [showSessionMenu, setShowSessionMenu] = useState(false)
  const sessionsWrapRef = useRef(null)

  useEffect(() => {
    if (!showSessionMenu) return
    const onDown = (e) => {
      if (sessionsWrapRef.current && !sessionsWrapRef.current.contains(e.target)) {
        setShowSessionMenu(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [showSessionMenu])

  return (
    <div className="agents-rail">
      <div className="agents-rail-header">
        <div className="agents-rail-header-left">
          <IconButton label="Back" className="agents-rail-icon-btn" onClick={onBack}>
            <ChevronLeft />
          </IconButton>
          <Avatar contact={agent} size={24} />
          <span className="agents-rail-title">{agent.name}</span>
        </div>
        <div className="agents-rail-header-actions">
          <div className="agents-rail-sessions-wrap" ref={sessionsWrapRef}>
            <IconButton
              label="Sessions"
              className="agents-rail-icon-btn"
              active={showSessionMenu}
              onClick={() => setShowSessionMenu((v) => !v)}
            >
              <Clock size={16} />
            </IconButton>
            {showSessionMenu && (
              <div className="agents-rail-session-menu">
                {sessions.map((s) => (
                  <button
                    key={s.id}
                    className={`agents-rail-session-item ${s.id === activeSessionId ? 'agents-rail-session-item-active' : ''}`}
                    onClick={() => {
                      setActiveSessionId(s.id)
                      setShowSessionMenu(false)
                    }}
                  >
                    <div className="agents-rail-session-name">{s.name}</div>
                    <div className="agents-rail-session-time">{s.time}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <IconButton label="Close" className="agents-rail-icon-btn" onClick={onClose}>
            <Close />
          </IconButton>
        </div>
      </div>
      <AgentChat
        agent={agent}
        messages={messages}
        onSendMessage={onSendMessage}
        composeHint={composeHint}
        isTyping={isTyping}
      />
    </div>
  )
}

export default function AgentsRail({
  agents,
  recommended = [],
  selectedAgent,
  onSelectAgent,
  messages = [],
  onSendMessage,
  composeHint,
  typingAgentId,
  onClose,
}) {
  const hasAgents = agents.length > 0
  const hasRecommended = recommended.length > 0

  if (selectedAgent) {
    return (
      <AgentDetailView
        agent={selectedAgent}
        messages={messages}
        onSendMessage={onSendMessage}
        composeHint={composeHint}
        isTyping={typingAgentId === selectedAgent.id}
        onBack={() => onSelectAgent(null)}
        onClose={onClose}
      />
    )
  }

  return (
    <div className="agents-rail">
      <div className="agents-rail-header">
        <span className="agents-rail-title">Agents</span>
        <IconButton label="Close" className="agents-rail-icon-btn" onClick={onClose}>
          <Close />
        </IconButton>
      </div>
      <div className="agents-rail-body">
        {!hasAgents && !hasRecommended && (
          <div className="agents-rail-empty">No agents in this conversation</div>
        )}
        {hasAgents && (
          <div className="agents-rail-group">
            <div className="agents-rail-group-title">Agents in this conversation</div>
            {agents.map((agent) => (
              <AgentItem
                key={agent.id}
                agent={agent}
                onClick={() => onSelectAgent(agent)}
              />
            ))}
          </div>
        )}
        {hasRecommended && (
          <div className="agents-rail-group">
            <div className="agents-rail-group-title">Recommended</div>
            {recommended.map((agent) => (
              <AgentItem key={agent.id} agent={agent} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
