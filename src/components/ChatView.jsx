import { useState, useEffect, useRef, useCallback } from 'react'
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
  const [mainTypingContact, setMainTypingContact] = useState(null)
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

  const openJiraThread = useCallback(() => {
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
  }, [showAgents, selectedRailAgent])

  const toggleChannelThread = useCallback((message) => {
    setChannelThreadPostId((prev) => (prev === message.id ? null : message.id))
  }, [])

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

  const handleMentionSelect = (agentName) => {
    // Add system message when an agent is added via @mention
    const systemMessage = {
      id: `system-${Date.now()}`,
      senderId: 'system',
      text: `${agentName} is added here. Try chat with the agent.`,
      time: nowTimeStr(),
      isSystem: true,
    }
    setExtraMessages((prev) => ({
      ...prev,
      [canvasKey]: [...(prev[canvasKey] || []), systemMessage],
    }))
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

    // Power BI auto-response in Conversational AI Team (id 11)
    const isPowerBIContext = chatId === 11 && (
      sentText.includes('@Power BI') ||
      (extraMessages[bucket] || []).some(m => m.isSystem && m.text?.includes('Power BI is added here'))
    )
    if (isPowerBIContext) {
      const powerBIContact = contacts.find(c => c.id === 31)
      setMainTypingAgentId(chatId)
      setMainTypingContact(powerBIContact)
      setTimeout(() => {
        setMainTypingAgentId((prev) => (prev === chatId ? null : prev))
        setMainTypingContact(null)
        setExtraMessages((prev) => ({
          ...prev,
          [bucket]: [...(prev[bucket] || []), {
            id: `powerbi-reply-${Date.now()}`,
            senderId: 31,
            text: 'I will fix the vertical scale issue. Here is an updated chart with clear difference between the days:',
            time: nowTimeStr(),
            htmlWidget: `<iframe width="100%" height="320" scrolling="no" style="border: 1px solid #E0E0E0; border-radius: 4px; overflow: hidden;" srcdoc="<!DOCTYPE html><html><head><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',sans-serif;overflow:hidden}.chart-column{transition:transform .2s,box-shadow .2s;cursor:pointer;position:relative}.chart-column:hover{transform:translateY(-4px);box-shadow:0 4px 12px rgba(0,0,0,.15)}.column-value{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-size:11px;font-weight:700;opacity:0;transition:opacity .2s;pointer-events:none;z-index:2}.chart-column:hover .column-value{opacity:1}.tooltip{position:absolute;bottom:100%;left:50%;transform:translateX(-50%);margin-bottom:8px;background:rgba(36,36,36,.95);color:#fff;padding:6px 10px;border-radius:4px;font-size:11px;pointer-events:none;opacity:0;transition:opacity .2s;white-space:nowrap;z-index:10}.chart-column:hover .tooltip{opacity:1}.action-btn{background:#fff;border:1px solid #e0e0e0;border-radius:4px;padding:6px;font-size:12px;font-weight:600;color:#242424;cursor:pointer;transition:all .2s;font-family:inherit;display:inline-flex;align-items:center;gap:4px;text-decoration:none}.action-btn:hover{background:#f5f5f5;border-color:#c8c8c8}.action-btn:active{background:#e8e8e8}@keyframes shimmer{0%{background-position:-1000px 0}100%{background-position:1000px 0}}.skeleton-bar{background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);background-size:1000px 100%;animation:shimmer 2s infinite linear;border-radius:2px 2px 0 0}</style></head><body><div id=&quot;loading&quot; style=&quot;display:flex;flex-direction:column;height:100%;padding:16px;background:#fff&quot;><div style=&quot;font-size:14px;font-weight:600;color:#e0e0e0;margin-bottom:12px&quot;>Agent Handoff Success Rate - 30 Day Trend</div><div style=&quot;height:220px;display:flex;align-items:flex-end;gap:3px;padding:0 4px&quot;><div style=&quot;flex:1;height:90px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:162px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:126px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:171px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:135px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:153px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:180px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:144px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:117px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:158px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:166px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:140px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:149px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:188px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:154px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:130px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:160px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:175px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:145px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:138px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:164px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:150px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:170px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:156px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:142px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:147px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:184px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:161px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:192px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:196px&quot; class=&quot;skeleton-bar&quot;></div></div></div><script>window.chartData=[];function expandChart(){window.parent.postMessage({type:'expandPowerBI',data:{reportName:'Northwind Agent Handoff Metrics - 30 Day Trend',chartData:window.chartData}},'*');}function init(){const data=[];const base=95.3;const today=new Date();for(let i=29;i>=0;i--){const d=new Date(today);d.setDate(d.getDate()-i);const m=d.getMonth()+1;const day=d.getDate();const v=base+Math.sin(i/3)*2+(Math.random()-0.5)*1.5;const val=Math.round(Math.min(99.9,Math.max(90,v))*10)/10;const h=Math.floor(1200+Math.random()*400);data.push({date:m+'/'+day,value:val,count:h+' handoffs',height:Math.floor((val-90)*18+20),modalHeight:Math.floor((val-90)*18+20),highlighted:false});}window.chartData=data.map(d=>({date:d.date,value:d.value,count:d.count,height:d.modalHeight,highlighted:d.highlighted}));setTimeout(()=>{document.body.innerHTML='<div style=&quot;display:flex;flex-direction:column;height:100%;padding:16px;background:#fff;position:relative&quot;><button class=&quot;action-btn&quot; onclick=&quot;expandChart()&quot; style=&quot;position:absolute;top:16px;right:16px;z-index:10&quot; title=&quot;Expand&quot;><svg width=&quot;16&quot; height=&quot;16&quot; viewBox=&quot;0 0 16 16&quot; fill=&quot;none&quot;><path d=&quot;M2 9v4a1 1 0 001 1h4M14 7V3a1 1 0 00-1-1H9&quot; stroke=&quot;#424242&quot; stroke-width=&quot;1.5&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot;/><path d=&quot;M14 2L9 7M2 14l5-5&quot; stroke=&quot;#424242&quot; stroke-width=&quot;1.5&quot; stroke-linecap=&quot;round&quot;/></svg></button><div style=&quot;font-size:14px;font-weight:600;color:#242424;margin-bottom:12px&quot;>Agent Handoff Success Rate - 30 Day Trend</div><div style=&quot;height:220px;display:flex;align-items:flex-end;gap:3px;padding:0 4px;overflow-x:auto&quot;>'+data.map(d=>'<div style=&quot;flex:1;display:flex;flex-direction:column;align-items:center;min-width:0&quot;><div class=&quot;chart-column&quot; style=&quot;width:100%;background:'+(d.highlighted?'linear-gradient(180deg,#0078D4 0%,#1890E8 100%)':'linear-gradient(180deg,#6264A7 0%,#7C7EB8 100%)')+';border-radius:2px 2px 0 0;height:'+d.height+'px&quot;><div class=&quot;column-value&quot;>'+d.value+'%</div><div class=&quot;tooltip&quot;>'+d.date+': '+d.value+'% &bull; '+d.count+'</div></div><div style=&quot;margin-top:6px;font-size:9px;color:'+(d.highlighted?'#242424':'#999')+';text-align:center;font-weight:'+(d.highlighted?'600':'400')+';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;width:100%&quot;>'+d.date+'</div></div>').join('')+'</div><div style=&quot;margin-top:12px&quot;><a href=&quot;https://app.powerbi.com&quot; target=&quot;_blank&quot; rel=&quot;noopener noreferrer&quot; class=&quot;action-btn&quot; style=&quot;padding:6px 12px&quot; title=&quot;Opens in new window&quot;><svg width=&quot;14&quot; height=&quot;14&quot; viewBox=&quot;0 0 16 16&quot; fill=&quot;none&quot;><rect x=&quot;2&quot; y=&quot;6&quot; width=&quot;3&quot; height=&quot;8&quot; rx=&quot;1&quot; fill=&quot;#F2C811&quot;/><rect x=&quot;6.5&quot; y=&quot;4&quot; width=&quot;3&quot; height=&quot;10&quot; rx=&quot;1&quot; fill=&quot;#F2C811&quot;/><rect x=&quot;11&quot; y=&quot;2&quot; width=&quot;3&quot; height=&quot;12&quot; rx=&quot;1&quot; fill=&quot;#F2C811&quot;/></svg>Open in Power BI<svg width=&quot;12&quot; height=&quot;12&quot; viewBox=&quot;0 0 16 16&quot; fill=&quot;none&quot; style=&quot;margin-left:4px&quot;><path d=&quot;M6 3h7v7M13 3L3 13&quot; stroke=&quot;#424242&quot; stroke-width=&quot;1.5&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot;/></svg></a></div></div>';},2000);}init();</script></body></html>"></iframe>`,
          }],
        }))

        // After Power BI responds, Sarah Chen asks a follow-up question
        setTimeout(() => {
          const sarahContact = contacts.find(c => c.id === 1)
          setMainTypingAgentId(1)
          setMainTypingContact(sarahContact)

          setTimeout(() => {
            setMainTypingAgentId(null)
            setMainTypingContact(null)

            // Sarah's follow-up question with @Power BI mention
            const sarahQuestion = [
              { type: 'mention', name: 'Power BI' },
              ', how many days do we have success rate > 95%?'
            ]
            setExtraMessages((prev) => ({
              ...prev,
              [bucket]: [...(prev[bucket] || []), {
                id: `sarah-followup-${Date.now()}`,
                senderId: 1,
                text: sarahQuestion,
                time: nowTimeStr(),
              }],
            }))

            // Power BI types and responds to Sarah's question
            setTimeout(() => {
              setMainTypingAgentId(chatId)
              setMainTypingContact(powerBIContact)

              setTimeout(() => {
                setMainTypingAgentId(null)
                setMainTypingContact(null)
                setExtraMessages((prev) => ({
                  ...prev,
                  [bucket]: [...(prev[bucket] || []), {
                    id: `powerbi-answer-${Date.now()}`,
                    senderId: 31,
                    text: 'Based on the 30-day trend data, 24 out of 30 days (80%) had a success rate above 95%. The daily success rates ranged from 92.8% to 98.7%, with most days clustering around the 95-97% range.',
                    time: nowTimeStr(),
                  }],
                }))

                // After 5 seconds, Kevin Park asks to add a cutline
                setTimeout(() => {
                  const kevinContact = contacts.find(c => c.id === 15)
                  setMainTypingAgentId(15)
                  setMainTypingContact(kevinContact)

                  setTimeout(() => {
                    setMainTypingAgentId(null)
                    setMainTypingContact(null)

                    // Kevin's request with @Power BI mention
                    const kevinRequest = [
                      { type: 'mention', name: 'Power BI' },
                      ', add visual cutline at 95%'
                    ]
                    setExtraMessages((prev) => ({
                      ...prev,
                      [bucket]: [...(prev[bucket] || []), {
                        id: `kevin-request-${Date.now()}`,
                        senderId: 15,
                        text: kevinRequest,
                        time: nowTimeStr(),
                      }],
                    }))

                    // Power BI types and responds with adaptive card
                    setTimeout(() => {
                      setMainTypingAgentId(chatId)
                      setMainTypingContact(powerBIContact)

                      setTimeout(() => {
                        setMainTypingAgentId(null)
                        setMainTypingContact(null)
                        setExtraMessages((prev) => ({
                          ...prev,
                          [bucket]: [...(prev[bucket] || []), {
                            id: `powerbi-cutline-${Date.now()}`,
                            senderId: 31,
                            text: 'I\'ve added a visual cutline at 95% to highlight the threshold. Here\'s the updated chart:',
                            time: nowTimeStr(),
                            cards: [{
                              cardHeader: { appName: 'Power BI' },
                              htmlWidget: `<iframe width="100%" height="320" scrolling="no" style="border: 1px solid #E0E0E0; border-radius: 4px; overflow: hidden;" srcdoc="<!DOCTYPE html><html><head><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',sans-serif;overflow:hidden}.chart-column{transition:transform .2s,box-shadow .2s;cursor:pointer;position:relative}.chart-column:hover{transform:translateY(-4px);box-shadow:0 4px 12px rgba(0,0,0,.15)}.column-value{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-size:11px;font-weight:700;opacity:0;transition:opacity .2s;pointer-events:none;z-index:2}.chart-column:hover .column-value{opacity:1}.tooltip{position:absolute;bottom:100%;left:50%;transform:translateX(-50%);margin-bottom:8px;background:rgba(36,36,36,.95);color:#fff;padding:6px 10px;border-radius:4px;font-size:11px;pointer-events:none;opacity:0;transition:opacity .2s;white-space:nowrap;z-index:10}.chart-column:hover .tooltip{opacity:1}.action-btn{background:#fff;border:1px solid #e0e0e0;border-radius:4px;padding:6px;font-size:12px;font-weight:600;color:#242424;cursor:pointer;transition:all .2s;font-family:inherit;display:inline-flex;align-items:center;gap:4px;text-decoration:none}.action-btn:hover{background:#f5f5f5;border-color:#c8c8c8}.action-btn:active{background:#e8e8e8}@keyframes shimmer{0%{background-position:-1000px 0}100%{background-position:1000px 0}}.skeleton-bar{background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);background-size:1000px 100%;animation:shimmer 2s infinite linear;border-radius:2px 2px 0 0}.cutline{position:absolute;left:0;right:0;height:2px;background:repeating-linear-gradient(90deg,#E74856 0,#E74856 8px,transparent 8px,transparent 14px);z-index:5;pointer-events:none}.cutline-label{position:absolute;right:8px;top:-10px;background:#fff;padding:0 4px;font-size:10px;font-weight:600;color:#E74856}</style></head><body><div id=&quot;loading&quot; style=&quot;display:flex;flex-direction:column;height:100%;padding:16px;background:#fff&quot;><div style=&quot;font-size:14px;font-weight:600;color:#e0e0e0;margin-bottom:12px&quot;>Agent Handoff Success Rate - 30 Day Trend</div><div style=&quot;height:220px;display:flex;align-items:flex-end;gap:3px;padding:0 4px&quot;><div style=&quot;flex:1;height:90px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:162px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:126px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:171px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:135px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:153px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:180px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:144px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:117px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:158px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:166px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:140px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:149px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:188px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:154px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:130px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:160px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:175px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:145px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:138px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:164px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:150px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:170px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:156px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:142px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:147px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:184px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:161px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:192px&quot; class=&quot;skeleton-bar&quot;></div><div style=&quot;flex:1;height:196px&quot; class=&quot;skeleton-bar&quot;></div></div></div><script>window.chartData=[];function expandChart(){window.parent.postMessage({type:'expandPowerBI',data:{reportName:'Northwind Agent Handoff Metrics - 30 Day Trend',chartData:window.chartData}},'*');}function init(){const data=[];const base=95.3;const today=new Date();for(let i=29;i>=0;i--){const d=new Date(today);d.setDate(d.getDate()-i);const m=d.getMonth()+1;const day=d.getDate();const v=base+Math.sin(i/3)*2+(Math.random()-0.5)*1.5;const val=Math.round(Math.min(99.9,Math.max(90,v))*10)/10;const h=Math.floor(1200+Math.random()*400);data.push({date:m+'/'+day,value:val,count:h+' handoffs',height:Math.floor((val-90)*18+20),modalHeight:Math.floor((val-90)*18+20),highlighted:false});}window.chartData=data.map(d=>({date:d.date,value:d.value,count:d.count,height:d.modalHeight,highlighted:d.highlighted}));setTimeout(()=>{document.body.innerHTML='<div style=&quot;display:flex;flex-direction:column;height:100%;padding:16px;background:#fff;position:relative&quot;><button class=&quot;action-btn&quot; onclick=&quot;expandChart()&quot; style=&quot;position:absolute;top:16px;right:16px;z-index:10&quot; title=&quot;Expand&quot;><svg width=&quot;16&quot; height=&quot;16&quot; viewBox=&quot;0 0 16 16&quot; fill=&quot;none&quot;><path d=&quot;M2 9v4a1 1 0 001 1h4M14 7V3a1 1 0 00-1-1H9&quot; stroke=&quot;#424242&quot; stroke-width=&quot;1.5&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot;/><path d=&quot;M14 2L9 7M2 14l5-5&quot; stroke=&quot;#424242&quot; stroke-width=&quot;1.5&quot; stroke-linecap=&quot;round&quot;/></svg></button><div style=&quot;font-size:14px;font-weight:600;color:#242424;margin-bottom:12px&quot;>Agent Handoff Success Rate - 30 Day Trend</div><div style=&quot;height:220px;display:flex;align-items:flex-end;gap:3px;padding:0 4px;overflow-x:auto;position:relative&quot;><div class=&quot;cutline&quot; style=&quot;bottom:110px&quot;><span class=&quot;cutline-label&quot;>95%</span></div>'+data.map(d=>'<div style=&quot;flex:1;display:flex;flex-direction:column;align-items:center;min-width:0&quot;><div class=&quot;chart-column&quot; style=&quot;width:100%;background:'+(d.highlighted?'linear-gradient(180deg,#0078D4 0%,#1890E8 100%)':'linear-gradient(180deg,#6264A7 0%,#7C7EB8 100%)')+';border-radius:2px 2px 0 0;height:'+d.height+'px&quot;><div class=&quot;column-value&quot;>'+d.value+'%</div><div class=&quot;tooltip&quot;>'+d.date+': '+d.value+'% &bull; '+d.count+'</div></div><div style=&quot;margin-top:6px;font-size:9px;color:'+(d.highlighted?'#242424':'#999')+';text-align:center;font-weight:'+(d.highlighted?'600':'400')+';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;width:100%&quot;>'+d.date+'</div></div>').join('')+'</div><div style=&quot;margin-top:12px&quot;><a href=&quot;https://app.powerbi.com&quot; target=&quot;_blank&quot; rel=&quot;noopener noreferrer&quot; class=&quot;action-btn&quot; style=&quot;padding:6px 12px&quot; title=&quot;Opens in new window&quot;><svg width=&quot;14&quot; height=&quot;14&quot; viewBox=&quot;0 0 16 16&quot; fill=&quot;none&quot;><rect x=&quot;2&quot; y=&quot;6&quot; width=&quot;3&quot; height=&quot;8&quot; rx=&quot;1&quot; fill=&quot;#F2C811&quot;/><rect x=&quot;6.5&quot; y=&quot;4&quot; width=&quot;3&quot; height=&quot;10&quot; rx=&quot;1&quot; fill=&quot;#F2C811&quot;/><rect x=&quot;11&quot; y=&quot;2&quot; width=&quot;3&quot; height=&quot;12&quot; rx=&quot;1&quot; fill=&quot;#F2C811&quot;/></svg>Open in Power BI<svg width=&quot;12&quot; height=&quot;12&quot; viewBox=&quot;0 0 16 16&quot; fill=&quot;none&quot; style=&quot;margin-left:4px&quot;><path d=&quot;M6 3h7v7M13 3L3 13&quot; stroke=&quot;#424242&quot; stroke-width=&quot;1.5&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot;/></svg></a></div></div>';},2000);}init();</script></body></html>"></iframe>`,
                              summary: 'Would you like me to make this change in the Power BI report?',
                              actions: [
                                'Yes, accept the change automatically',
                                'Yes, open Power BI and make change there',
                                'No, do not make a change'
                              ]
                            }]
                          }],
                        }))
                      }, 3000)
                    }, 1200)
                  }, 2600)
                }, 5000)
              }, 2500)
            }, 1000)
          }, 2800)
        }, 3000)
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
                  onOpenThread={toggleChannelThread}
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
                msg.isSystem ? (
                  <div key={msg.id} className="system-message">
                    <div className="system-message-icon">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="2" width="16" height="16" rx="4" fill="#E8E8E8"/>
                        <rect x="5" y="5" width="10" height="10" rx="2" fill="#999"/>
                      </svg>
                    </div>
                    <span className="system-message-text">
                      {msg.text.split(/(Power BI)/).map((part, i) =>
                        part === 'Power BI' ? (
                          <button
                            key={i}
                            className="system-message-link"
                            onClick={() => {
                              // Navigate to Power BI agent chat when clicked
                              const powerBIAgent = contacts.find(c => c.name === 'Power BI')
                              if (powerBIAgent) {
                                onSelectChat(powerBIAgent.id)
                              }
                            }}
                          >
                            {part}
                          </button>
                        ) : (
                          part
                        )
                      )}
                    </span>
                  </div>
                ) : (
                  <MessageRow
                    key={msg.id}
                    message={msg}
                    activeContact={activeContact}
                    onOpenThread={openJiraThread}
                  />
                )
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="chat-compose-area">
          {(mainTypingAgentId === activeChatId || (activeChatId === 11 && mainTypingContact)) && (
            <TypingIndicator
              contact={mainTypingContact || activeContact}
              className="chat-compose-typing"
              showText={!!mainTypingContact}
            />
          )}
          <Compose
            value={inputValue}
            mention={composeMention}
            onChange={setInputValue}
            onClearMention={() => setComposeMention(null)}
            onSend={handleSend}
            isChannel={isChannel}
            onMentionSelect={handleMentionSelect}
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
