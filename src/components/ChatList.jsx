import { useState } from 'react'
import { favorites, projectNorthwind, chatList, contacts, teams } from '../data'
import { copilotLogo } from '../shared/assets'
import { Avatar, ChevronDown, Dots, Search } from './common'
import './ChatList.css'

// Small rounded-square team icon used in the Teams & channels section. Mirrors
// the channel avatar treatment but is standalone (no status dot, no agent
// logo) so we don't need to add a synthetic contact for each team. Renders
// `team.avatar` if set, otherwise falls back to initials over `team.color`.
function TeamIcon({ team, size = 20 }) {
  const radius = Math.max(3, Math.round(size * 0.18))
  return (
    <div
      className="team-icon"
      style={{
        width: size,
        height: size,
        background: team.avatar ? 'transparent' : team.color,
        borderRadius: radius,
        fontSize: size * 0.4,
      }}
    >
      {team.avatar ? (
        <img
          src={team.avatar}
          alt=""
          style={{ width: size, height: size, borderRadius: radius, display: 'block' }}
        />
      ) : (
        team.initials
      )}
    </div>
  )
}

function SectionHeader({ label, collapsed, onToggle }) {
  return (
    <button
      type="button"
      className="chat-list-section-header"
      aria-expanded={!collapsed}
      onClick={onToggle}
    >
      <span className={`section-chevron-down ${collapsed ? 'section-chevron-collapsed' : ''}`}>
        <ChevronDown />
      </span>
      <span>{label}</span>
    </button>
  )
}

export default function ChatList({ activeChatId, onSelectChat, readChatIds }) {
  const isUnread = (bold, contactId) => bold && !readChatIds?.has(contactId)
  const [collapsed, setCollapsed] = useState(() => new Set())
  const isCollapsed = (key) => collapsed.has(key)
  const toggleSection = (key) => setCollapsed((prev) => {
    const next = new Set(prev)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    return next
  })

  const renderItem = (chat) => {
    const contact = contacts.find(c => c.id === chat.contactId)
    const unread = isUnread(chat.bold, contact.id)
    return (
      <div
        key={contact.id}
        className={`chat-list-item ${contact.id === activeChatId ? 'selected' : ''}`}
        onClick={() => onSelectChat(contact.id)}
      >
        <Avatar contact={contact} size={20} />
        <span className={`chat-item-name ${unread ? 'chat-item-bold' : ''}`}>{contact.name}</span>
        {unread && <span className="unread-dot" />}
      </div>
    )
  }

  return (
    <div className="chat-list-panel">
      {/* Row 1: Title + actions */}
      <div className="chat-list-header">
        <h2 className="chat-list-title">Chat</h2>
        <div className="chat-list-actions">
          <button className="icon-btn" aria-label="More options">
            <Dots size={20} />
          </button>
          <button className="icon-btn" aria-label="Search">
            <Search />
          </button>
          <div className="compose-btn-group">
            <button className="icon-btn" aria-label="New chat">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11.5 2.5H4a1.5 1.5 0 0 0-1.5 1.5v12a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5V9"/>
                <path d="M16.5 2.5l-9 9V14.5h3l9-9"/>
              </svg>
            </button>
            <button className="icon-btn compose-chevron" aria-label="New chat options">
              <ChevronDown />
            </button>
          </div>
        </div>
      </div>

      <div className="chat-list-divider" />

      {/* Row 2: Filter pills */}
      <div className="chat-list-filters">
        <div className="filter-pills">
          <button className="filter-pill">Unread</button>
          <button className="filter-pill">Channels</button>
          <button className="filter-pill">Chats</button>
        </div>
        <button className="icon-btn filter-chevron" aria-label="More filters">
          <ChevronDown size={16} />
        </button>
      </div>

      <div className="chat-list-divider" />

      {/* Row 3: Copilot + Quick views */}
      <div className="chat-list-pinned">
        <div className="pinned-item">
          <div className="copilot-icon">
            <img src={copilotLogo} alt="Copilot" width="20" height="20" />
          </div>
          <span className="pinned-label">Copilot</span>
        </div>
        <div className="pinned-item">
          {/* Right-facing chevron: rotate the shared ChevronDown. */}
          <span className="section-chevron section-chevron-right">
            <ChevronDown size={12} />
          </span>
          <span className="pinned-label pinned-label-bold">Quick views</span>
          <span className="quick-views-badge">46</span>
        </div>
      </div>

      <div className="chat-list-divider" />

      {/* Favorites section */}
      <SectionHeader
        label="Favorites"
        collapsed={isCollapsed('favorites')}
        onToggle={() => toggleSection('favorites')}
      />

      <div className="chat-list-items">
        {!isCollapsed('favorites') && favorites.map(renderItem)}

        {/* Project Northwind section */}
        <SectionHeader
          label="Project Northwind"
          collapsed={isCollapsed('northwind')}
          onToggle={() => toggleSection('northwind')}
        />

        {!isCollapsed('northwind') && projectNorthwind.map(renderItem)}

        {/* Chats section */}
        <SectionHeader
          label="Chats"
          collapsed={isCollapsed('chats')}
          onToggle={() => toggleSection('chats')}
        />

        {!isCollapsed('chats') && chatList.map(renderItem)}

        {/* Teams and channels section */}
        <SectionHeader
          label="Teams and channels"
          collapsed={isCollapsed('teams')}
          onToggle={() => toggleSection('teams')}
        />

        {!isCollapsed('teams') && teams.map((team) => {
          const teamKey = `team-${team.id}`
          const teamCollapsed = isCollapsed(teamKey)
          return (
            <div key={team.id} className="team-group">
              <button
                type="button"
                className="team-row"
                aria-expanded={!teamCollapsed}
                onClick={() => toggleSection(teamKey)}
              >
                <span className={`section-chevron-down ${teamCollapsed ? 'section-chevron-collapsed' : ''}`}>
                  <ChevronDown />
                </span>
                <TeamIcon team={team} size={20} />
                <span className="team-name">{team.name}</span>
              </button>
              {!teamCollapsed && team.channels.map((entry) => {
                const channel = contacts.find((c) => c.id === entry.id)
                if (!channel) return null
                const unread = isUnread(entry.bold, channel.id)
                return (
                  <div
                    key={channel.id}
                    className={`channel-row ${channel.id === activeChatId ? 'selected' : ''}`}
                    onClick={() => onSelectChat(channel.id)}
                  >
                    <span className={`channel-name ${unread ? 'chat-item-bold' : ''}`}>
                      {channel.name}
                    </span>
                    {unread && <span className="unread-dot" />}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
