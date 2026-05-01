import { useState, useEffect, useRef } from 'react'
import {
  messagesByContact,
  contacts,
  favorites,
  projectNorthwind,
  chatList,
  channelPostsByContact,
  sessionMessages,
  promptSuggestions,
  copilotAgent,
  designerAgent,
  pollyAgent,
  breakthuAgent,
} from '../data'
import { TypingIndicator } from './common'
import MessageRow from './MessageRow'
import SessionsRail from './SessionsRail'
import AgentsRail from './AgentsRail'
import PromptSuggestions from './PromptSuggestions'
import ChannelThreadRail from './ChannelThreadRail'
import ChatHeader from './ChatHeader'
import Compose from './Compose'
import './ChatView.css'

// Convert a channel post (root + replies) into the message shape MessageRow
// expects, attaching a threadReply badge built from the replies' unique
// senders. Replies themselves are not shown in the main canvas — clicking the
// badge opens ChannelThreadRail.
function postToMessage(post) {
  const replyCount = post.replies?.length || 0
  if (!replyCount) return { ...post }
  const seen = new Set()
  const participantIds = []
  for (const r of post.replies) {
    if (seen.has(r.senderId)) continue
    seen.add(r.senderId)
    participantIds.push(r.senderId)
    if (participantIds.length === 3) break
  }
  return { ...post, threadReply: { participantIds, count: replyCount } }
}

function parseDraft(d) {
  const m = d.match(/^\/Jira\b\s*/i)
  return m ? { mention: 'Jira', text: d.slice(m[0].length) } : { mention: null, text: d }
}

// ── Scripted Jira demo flow (disabled) ─────────────────────────────────────
// Kept as a reference pattern for scripted agent flows. Flip JIRA_FLOW_ENABLED
// and restore the `draft: '/Jira …'` entry in chatList to re-enable. See
// CLAUDE.md for policy on this flow.
const JIRA_FLOW_ENABLED = false

const jiraScript = [
  {
    text: 'You have 1 blocker for the April 25 milestone — the PR is in review with all signoffs and CI passing. Want me to merge it?',
    link: {
      source: 'jira',
      title: 'Handle delegation timeout during agent handoff',
      subtitle: 'JIRA-4552 · In review · Due April 22',
      url: '#',
    },
    seed: 'Yes',
  },
  {
    text: 'Merged — here\'s the PR:',
    link: {
      source: 'github',
      title: 'Handle delegation timeout during agent handoff',
      subtitle: 'teams/agent-handoff #4552 · Merged',
      url: '#',
    },
    seed: null,
  },
]

export default function ChatView({
  activeChatId,
  onSelectChat,
  sessions,
  addSession,
  updateSession,
  updateSessionMessages,
  dynamicSessionMessages,
  navIntent,
  clearNavIntent,
}) {
  const activeContact = contacts.find((c) => c.id === activeChatId)
  const baseMessages = messagesByContact[activeChatId] || []
  const participantCount = activeContact.isGroup || activeContact.isChannel
    ? activeContact.memberCount ?? new Set(baseMessages.map((m) => m.senderId)).size
    : 2
  const allChats = [...favorites, ...projectNorthwind, ...chatList]
  const chatEntry = allChats.find((c) => c.contactId === activeChatId)
  const draft = chatEntry?.draft || ''
  const parsedDraft = parseDraft(draft)

  const isAgent = activeContact.isAgent && !activeContact.isGroup
  const isChannel = !!activeContact.isChannel
  const channelPosts = isChannel ? channelPostsByContact[activeChatId] || [] : null
  const hasSessions = isAgent && sessions[activeChatId]

  const [extraMessages, setExtraMessages] = useState({})
  const [inputValue, setInputValue] = useState(parsedDraft.text)
  const [composeMention, setComposeMention] = useState(parsedDraft.mention)
  const [showSessions, setShowSessions] = useState(hasSessions)
  const [showAgents, setShowAgents] = useState(false)
  const [selectedRailAgent, setSelectedRailAgent] = useState(null)
  const [agentChatMessages, setAgentChatMessages] = useState({})
  const [railComposeHint, setRailComposeHint] = useState(null)
  const [railTypingAgentId, setRailTypingAgentId] = useState(null)
  const [railJiraStep, setRailJiraStep] = useState(0)
  const [jiraGroupSessionId, setJiraGroupSessionId] = useState(null)
  const [activeSessionId, setActiveSessionId] = useState(null)
  const [jiraThreadAnchorId, setJiraThreadAnchorId] = useState(null)
  const [mainTypingAgentId, setMainTypingAgentId] = useState(null)
  const [channelThreadPostId, setChannelThreadPostId] = useState(null)
  const [highlightMessageId, setHighlightMessageId] = useState(null)
  const messagesEndRef = useRef(null)

  // Reset per-chat ephemeral state when activeChatId changes. Using the
  // render-phase state-adjustment pattern (rather than useEffect) avoids the
  // cascade-render warning and lands the new state in the first paint.
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [chatIdCursor, setChatIdCursor] = useState(activeChatId)
  const [navIntentCursor, setNavIntentCursor] = useState(navIntent)
  if (chatIdCursor !== activeChatId) {
    setChatIdCursor(activeChatId)
    setInputValue(parsedDraft.text)
    setComposeMention(parsedDraft.mention)
    setShowAgents(false)
    setSelectedRailAgent(null)
    setRailJiraStep(0)
    setRailComposeHint(null)
    setRailTypingAgentId(null)
    setJiraThreadAnchorId(null)
    setChannelThreadPostId(null)
    setHighlightMessageId(null)
    const intentMatches = navIntent && navIntent.chatId === activeChatId
    const intentHasSession = intentMatches && 'sessionId' in navIntent
    if (intentHasSession) {
      setShowSessions(true)
      setActiveSessionId(navIntent.sessionId || null)
    } else {
      setShowSessions(!!hasSessions)
      const agentSessionList = sessions[activeChatId]
      setActiveSessionId(agentSessionList?.length > 0 ? agentSessionList[0].id : null)
    }
    if (intentMatches && navIntent.channelThreadPostId) {
      setChannelThreadPostId(navIntent.channelThreadPostId)
    }
    if (intentMatches && navIntent.highlightMessageId) {
      setHighlightMessageId(navIntent.highlightMessageId)
    }
    if (intentMatches) clearNavIntent()
  } else if (navIntent !== navIntentCursor && navIntent?.chatId === activeChatId) {
    setNavIntentCursor(navIntent)
    if ('sessionId' in navIntent) {
      setShowSessions(true)
      if (navIntent.sessionId) setActiveSessionId(navIntent.sessionId)
    }
    if (navIntent.channelThreadPostId) {
      setChannelThreadPostId(navIntent.channelThreadPostId)
    }
    if (navIntent.highlightMessageId) {
      setHighlightMessageId(navIntent.highlightMessageId)
    }
    clearNavIntent()
  }

  useEffect(() => {
    if (highlightMessageId) {
      // Activity-navigation: scroll the triggering message into view and
      // flash it briefly so the user sees where the notification landed.
      const el = document.querySelector(
        `[data-message-id="${CSS.escape(String(highlightMessageId))}"]`
      )
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.classList.add('message-row-highlight')
        const t = setTimeout(() => {
          el.classList.remove('message-row-highlight')
          setHighlightMessageId(null)
        }, 1800)
        return () => clearTimeout(t)
      }
      return
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [extraMessages, activeChatId, activeSessionId, mainTypingAgentId, highlightMessageId])

  // Mirror the rail's Jira thread messages back into the source chat's
  // session so the conversation is discoverable from Jira's sessions list.
  useEffect(() => {
    if (!jiraGroupSessionId) return
    const msgs = agentChatMessages[4] || []
    const converted = msgs
      .filter((m) => !String(m.id).startsWith('intro-'))
      .map((m) => ({
        id: m.id,
        senderId: m.from === 'me' ? 'me' : 4,
        text: m.text,
        time: m.time,
        link: m.link,
      }))
    updateSessionMessages(jiraGroupSessionId, converted)
  }, [agentChatMessages, jiraGroupSessionId, updateSessionMessages])

  const sessionMsgs = activeSessionId && (dynamicSessionMessages[activeSessionId] || sessionMessages[activeSessionId])
  const displayBaseMessages = sessionMsgs || baseMessages
  // Per-session bucket for in-canvas messages so switching to a new pending
  // session starts with a blank canvas instead of inheriting the previous
  // session's messages. Non-session chats fall back to the chat id.
  const canvasKey = activeSessionId || activeChatId
  const messages = [...displayBaseMessages, ...(extraMessages[canvasKey] || [])]

  const activeSession = hasSessions && sessions[activeChatId]?.find((s) => s.id === activeSessionId)
  const sourceChat = activeSession?.sourceChatId ? contacts.find((c) => c.id === activeSession.sourceChatId) : null

  const { agentsInConversation, recommendedAgents } = (() => {
    if (activeChatId === 11) {
      const jira = contacts.find((c) => c.id === 4)
      return {
        agentsInConversation: [copilotAgent, jira, designerAgent],
        recommendedAgents: [pollyAgent, breakthuAgent],
      }
    }
    const agentsById = new Map(contacts.filter((c) => c.isAgent).map((a) => [a.id, a]))
    const agentsByName = new Map(contacts.filter((c) => c.isAgent).map((a) => [a.name.toLowerCase(), a]))
    const found = new Map()
    if (activeContact.isAgent) found.set(activeContact.id, activeContact)
    for (const m of baseMessages) {
      if (agentsById.has(m.senderId)) found.set(m.senderId, agentsById.get(m.senderId))
      if (Array.isArray(m.text)) {
        for (const part of m.text) {
          if (part && typeof part === 'object' && part.type === 'mention') {
            const agent = agentsByName.get(part.name.toLowerCase())
            if (agent) found.set(agent.id, agent)
          }
        }
      }
    }
    return { agentsInConversation: Array.from(found.values()), recommendedAgents: [] }
  })()

  const handleNewSession = () => {
    // Only one pending "New conversation" per agent — if one already exists,
    // just switch to it instead of creating another. It becomes a real session
    // once the user sends their first message (see finalizePendingSession).
    const existingPending = (sessions[activeChatId] || []).find((s) => s.isPending)
    if (existingPending) {
      setActiveSessionId(existingPending.id)
      return
    }
    const now = new Date()
    const sessionId = `s-new-${Date.now()}`
    const newSession = {
      id: sessionId,
      name: 'New conversation',
      time: now.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
      preview: '',
      isPending: true,
    }
    addSession(activeChatId, newSession, [])
    setActiveSessionId(sessionId)
  }

  const finalizePendingSession = (firstText, nameHint) => {
    if (!isAgent || !activeSessionId) return
    const current = (sessions[activeChatId] || []).find((s) => s.id === activeSessionId)
    if (!current?.isPending) return
    const trimmed = String(firstText || '').trim()
    const name = (nameHint && nameHint.trim()) || trimmed.slice(0, 60) || 'New conversation'
    const preview = trimmed.slice(0, 100)
    const now = new Date()
    updateSession(activeChatId, activeSessionId, {
      name,
      preview,
      time: now.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
      isPending: false,
    })
  }

  const nowTimeStr = () => new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

  const selectRailAgent = (agent) => {
    setSelectedRailAgent(agent)
    if (agent && !agentChatMessages[agent.id]) {
      const intro = {
        id: `intro-${agent.id}`,
        from: 'agent',
        text: `Hi! I'm ${agent.name}. Ask me anything in the context of ${activeContact.name}.`,
        time: nowTimeStr(),
      }
      setAgentChatMessages((prev) => ({ ...prev, [agent.id]: [intro] }))
    }
  }

  const bumpThreadReply = (anchorId, participantId) => {
    if (!anchorId) return
    setExtraMessages((prev) => {
      const list = prev[activeChatId] || []
      if (!list.some((m) => m.id === anchorId)) return prev
      return {
        ...prev,
        [activeChatId]: list.map((m) => {
          if (m.id !== anchorId) return m
          const existingIds = m.threadReply?.participantIds || []
          const participantIds = existingIds.includes(participantId)
            ? existingIds
            : [...existingIds, participantId]
          return {
            ...m,
            threadReply: {
              participantIds,
              count: (m.threadReply?.count || 0) + 1,
            },
          }
        }),
      }
    })
  }

  const scheduleJiraResponse = (index, anchorIdOverride) => {
    if (index < 0 || index >= jiraScript.length) return
    // Callers that just queued a setJiraThreadAnchorId in the same tick pass
    // the id explicitly; otherwise fall back to the latest committed state.
    const anchorId = anchorIdOverride ?? jiraThreadAnchorId
    setRailTypingAgentId(4)
    setTimeout(() => {
      const step = jiraScript[index]
      const jiraMsg = {
        id: `l2j-${Date.now()}`,
        from: 'agent',
        text: step.text,
        link: step.link,
        time: nowTimeStr(),
      }
      setAgentChatMessages((prev) => ({ ...prev, [4]: [...(prev[4] || []), jiraMsg] }))
      setRailTypingAgentId(null)
      setRailComposeHint(step.seed ? { agentId: 4, text: step.seed } : null)
      setRailJiraStep(index + 1)
      bumpThreadReply(anchorId, 4)

      if (index === jiraScript.length - 1) {
        setInputValue('Had 1 blocker, but just merged the fix — all set now!')
        setComposeMention(null)
      }
    }, 3200)
  }

  const sendInRail = (text) => {
    if (!selectedRailAgent) return
    const agentId = selectedRailAgent.id
    setAgentChatMessages((prev) => ({
      ...prev,
      [agentId]: [...(prev[agentId] || []), { id: `l2-${Date.now()}`, from: 'me', text, time: nowTimeStr() }],
    }))
    setRailComposeHint(null)
    // User replies on the Jira thread count too (and pull the current user's
    // avatar into the reply indicator).
    if (agentId === 4) bumpThreadReply(jiraThreadAnchorId, 'me')
    if (agentId === 4 && railJiraStep > 0 && railJiraStep < jiraScript.length) {
      scheduleJiraResponse(railJiraStep)
    }
  }

  const openJiraThread = () => {
    // The reply indicator acts as a toggle: if the rail is already showing
    // the Jira thread, collapse it; otherwise open it on Jira.
    if (showAgents && selectedRailAgent?.id === 4) {
      setShowAgents(false)
      return
    }
    const jira = contacts.find((c) => c.id === 4)
    if (!jira) return
    setSelectedRailAgent(jira)
    setShowAgents(true)
  }

  const startJiraDemoFlow = (sentText) => {
    const parts = []
    let remaining = sentText
    const regex = /\/Jira/i
    let match
    while ((match = regex.exec(remaining)) !== null) {
      if (match.index > 0) parts.push(remaining.slice(0, match.index))
      parts.push({ type: 'mention', name: 'Jira' })
      remaining = remaining.slice(match.index + match[0].length)
    }
    if (remaining) parts.push(remaining)
    const messageText = parts.length > 1 || typeof parts[0] !== 'string' ? parts : sentText

    const userTime = nowTimeStr()
    const userMsgId = `thread-u-${Date.now()}`

    // The user's message is the anchor of a new thread in the main canvas.
    // It's flagged private so the bubble shows the "Only you can see this
    // conversation" disclaimer and the subtle gray border — both indicate
    // the thread is visible only to the user and the agent.
    setExtraMessages((prev) => ({
      ...prev,
      [activeChatId]: [
        ...(prev[activeChatId] || []),
        { id: userMsgId, senderId: 'me', text: messageText, time: userTime, isPrivate: true },
      ],
    }))
    setJiraThreadAnchorId(userMsgId)

    // Seed the rail thread so it shows the anchor at the top when it opens.
    setAgentChatMessages((prev) => ({
      ...prev,
      4: [{ id: userMsgId, from: 'me', text: messageText, time: userTime }],
    }))

    // Create the session so the thread is discoverable later from Jira's
    // sessions list.
    const jira = contacts.find((c) => c.id === 4)
    const now = new Date()
    const sessionId = `s4-group-${Date.now()}`
    const previewText = Array.isArray(messageText)
      ? messageText.map((p) => (typeof p === 'string' ? p : `/${p.name}`)).join('')
      : messageText
    const sessionName = previewText.replace(/^\/?jira\s*/i, '').trim().slice(0, 60) || 'Blocker discussion'
    addSession(4, {
      id: sessionId,
      name: sessionName,
      time: now.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
      preview: previewText,
      sourceChatId: activeChatId,
    })
    setJiraGroupSessionId(sessionId)

    // Open the rail with Jira selected and start the reply.
    setSelectedRailAgent(jira)
    setShowAgents(true)
    scheduleJiraResponse(0, userMsgId)
  }

  const handleSend = () => {
    if (!composeMention && !inputValue.trim()) return

    const chatId = activeChatId
    const bucket = canvasKey
    const sentText = composeMention
      ? `/${composeMention}${inputValue ? ' ' + inputValue.trimStart() : ''}`
      : inputValue
    setInputValue('')
    setComposeMention(null)

    const isJiraInvocation = JIRA_FLOW_ENABLED && chatId === 11 && sentText.toLowerCase().includes('jira')
    if (isJiraInvocation) {
      startJiraDemoFlow(sentText)
      return
    }

    const myMessage = {
      id: `extra-${Date.now()}`,
      senderId: 'me',
      text: sentText,
      time: nowTimeStr(),
    }
    setExtraMessages((prev) => ({
      ...prev,
      [bucket]: [...(prev[bucket] || []), myMessage],
    }))
    finalizePendingSession(sentText)

    // Sarah Chen (id 1) scripted auto-response — exercises the typing
    // indicator flow end-to-end from a regular 1:1 chat.
    if (chatId === 1) {
      setMainTypingAgentId(chatId)
      setTimeout(() => {
        setMainTypingAgentId((prev) => (prev === chatId ? null : prev))
        setExtraMessages((prev) => ({
          ...prev,
          [bucket]: [...(prev[bucket] || []), {
            id: `sarah-reply-${Date.now()}`,
            senderId: 1,
            text: 'got it — taking a look now, will ping you in a bit',
            time: nowTimeStr(),
          }],
        }))
      }, 2000)
    }
  }

  const sendPromptSuggestion = (suggestion) => {
    const chatId = activeChatId
    const bucket = canvasKey
    const myMessage = {
      id: `extra-${Date.now()}`,
      senderId: 'me',
      text: suggestion.text,
      time: nowTimeStr(),
    }
    setExtraMessages((prev) => ({
      ...prev,
      [bucket]: [...(prev[bucket] || []), myMessage],
    }))
    finalizePendingSession(suggestion.text, suggestion.title)

    // Typing indicator then the prepared response.
    setMainTypingAgentId(chatId)
    const delay = 2000 + Math.floor(Math.random() * 1000)
    setTimeout(() => {
      setMainTypingAgentId((prev) => (prev === chatId ? null : prev))
      const agentMessage = {
        id: `extra-${Date.now()}-r`,
        senderId: chatId,
        text: suggestion.response,
        time: nowTimeStr(),
      }
      setExtraMessages((prev) => ({
        ...prev,
        [bucket]: [...(prev[bucket] || []), agentMessage],
      }))
    }, delay)
  }

  const agentSuggestions = isAgent ? promptSuggestions[activeChatId] : null
  const showPromptSuggestions = !!agentSuggestions && messages.length === 0 && mainTypingAgentId !== activeChatId

  return (
    <div className="chat-view">
      <div className="chat-view-main">
        <ChatHeader
          activeContact={activeContact}
          isChannel={isChannel}
          participantCount={participantCount}
          hasSessions={hasSessions}
          showSessions={showSessions}
          onToggleSessions={() => setShowSessions((prev) => !prev)}
        />

        <div className="chat-messages">
          {isChannel ? (
            <div className="messages-container messages-container-channel">
              {channelPosts.map((post) => (
                <MessageRow
                  key={post.id}
                  message={postToMessage(post)}
                  activeContact={activeContact}
                  onOpenThread={() => {
                    setChannelThreadPostId((prev) => (prev === post.id ? null : post.id))
                  }}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : showPromptSuggestions ? (
            <PromptSuggestions
              agent={activeContact}
              suggestions={agentSuggestions}
              onSelectPrompt={sendPromptSuggestion}
            />
          ) : (
            <div className="messages-container">
              {sourceChat && (
                <div className="session-source-banner">
                  Started conversation from{' '}
                  <a
                    className="session-source-banner-link"
                    href="#"
                    onClick={(e) => { e.preventDefault(); onSelectChat(sourceChat.id) }}
                  >{sourceChat.name}</a>
                  <br />
                  Recent context from the conversation has been shared with this session.
                </div>
              )}
              {messages.map((msg) => (
                <MessageRow
                  key={msg.id}
                  message={msg}
                  activeContact={activeContact}
                  onOpenThread={openJiraThread}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="chat-compose-area">
          {mainTypingAgentId === activeChatId && (
            <TypingIndicator
              contact={activeContact}
              className="chat-compose-typing"
            />
          )}
          <Compose
            value={inputValue}
            mention={composeMention}
            onChange={setInputValue}
            onClearMention={() => setComposeMention(null)}
            onSend={handleSend}
            isChannel={isChannel}
          />
        </div>
      </div>

      {showSessions && (
        <SessionsRail
          sessions={sessions[activeChatId] || []}
          activeSessionId={activeSessionId}
          onSelectSession={setActiveSessionId}
          onClose={() => setShowSessions(false)}
          onNewSession={handleNewSession}
        />
      )}
      {showAgents && (
        <AgentsRail
          agents={agentsInConversation}
          recommended={recommendedAgents}
          selectedAgent={selectedRailAgent}
          onSelectAgent={selectRailAgent}
          messages={selectedRailAgent ? agentChatMessages[selectedRailAgent.id] || [] : []}
          onSendMessage={sendInRail}
          composeHint={railComposeHint}
          typingAgentId={railTypingAgentId}
          onClose={() => setShowAgents(false)}
        />
      )}
      {isChannel && channelThreadPostId && (() => {
        const post = channelPosts.find((p) => p.id === channelThreadPostId)
        if (!post) return null
        return (
          <ChannelThreadRail
            post={post}
            activeContact={activeContact}
            onClose={() => setChannelThreadPostId(null)}
          />
        )
      })()}
    </div>
  )
}
