import { useState, useCallback, useEffect } from 'react'
import { agentSessions as initialSessions, activityEvents as seedActivityEvents } from './data'
import NavRail from './components/NavRail'
import ChatList from './components/ChatList'
import ChatView from './components/ChatView'
import ActivityList from './components/ActivityList'
import TitleBar from './components/TitleBar'
import PowerBIModal from './components/PowerBIModal'
import './App.css'
import './components/PowerBIModal.css'

export default function App() {
  const [activeView, setActiveView] = useState('chat') // 'chat' | 'activity'
  const [activeChatId, setActiveChatId] = useState(1)
  const [readChatIds, setReadChatIds] = useState(() => new Set([1]))
  const [sessions, setSessions] = useState(initialSessions)
  const [dynamicSessionMessages, setDynamicSessionMessages] = useState({})
  // Activity feed: persist which events the user has opened so unread decorations clear.
  const [activityEvents, setActivityEvents] = useState(seedActivityEvents)
  const [activeActivityId, setActiveActivityId] = useState(null)
  // When navigating to a chat, optionally tell ChatView to open a specific
  // session (sessions rail), open a specific channel thread, or flash a
  // specific message so the user can see where a notification landed.
  const [navIntent, setNavIntent] = useState(null)
  // Power BI modal state
  const [powerBIModal, setPowerBIModal] = useState({ isOpen: false, reportName: '', chartData: [] })

  const selectChat = useCallback((chatId) => {
    setActiveChatId(chatId)
    setReadChatIds(prev => (prev.has(chatId) ? prev : new Set(prev).add(chatId)))
  }, [])

  const navigateToChat = useCallback((chatId, { showSessions, sessionId } = {}) => {
    selectChat(chatId)
    if (showSessions) setNavIntent({ chatId, sessionId: sessionId || null })
  }, [selectChat])

  const clearNavIntent = useCallback(() => setNavIntent(null), [])

  const addSession = useCallback((agentId, session, messages) => {
    setSessions(prev => ({
      ...prev,
      [agentId]: [session, ...(prev[agentId] || [])],
    }))
    if (messages) {
      setDynamicSessionMessages(prev => ({ ...prev, [session.id]: messages }))
    }
  }, [])

  const updateSession = useCallback((agentId, sessionId, updates) => {
    setSessions(prev => ({
      ...prev,
      [agentId]: (prev[agentId] || []).map(s =>
        s.id === sessionId ? { ...s, ...updates } : s
      ),
    }))
  }, [])

  const updateSessionMessages = useCallback((sessionId, messages) => {
    setDynamicSessionMessages(prev => ({ ...prev, [sessionId]: messages }))
  }, [])

  const selectActivity = useCallback((event) => {
    setActiveActivityId(event.id)
    setActivityEvents(prev =>
      prev.map(e => (e.id === event.id && e.unread ? { ...e, unread: false } : e))
    )
    setActiveChatId(event.chatId)
    setReadChatIds(prev => (prev.has(event.chatId) ? prev : new Set(prev).add(event.chatId)))
    setNavIntent({
      chatId: event.chatId,
      channelThreadPostId: event.postId || null,
      highlightMessageId: event.messageId || null,
    })
  }, [])

  const activityUnreadCount = activityEvents.reduce((n, e) => n + (e.unread ? 1 : 0), 0)

  // Listen for Power BI expand messages from iframes
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'expandPowerBI') {
        setPowerBIModal({
          isOpen: true,
          reportName: event.data.data.reportName,
          chartData: event.data.data.chartData,
        })
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const closePowerBIModal = useCallback(() => {
    setPowerBIModal({ isOpen: false, reportName: '', chartData: [] })
  }, [])

  return (
    <div className="app">
      <TitleBar />
      <div className="app-body">
        <NavRail
          activeView={activeView}
          onSelectView={setActiveView}
          activityUnreadCount={activityUnreadCount}
        />
        {activeView === 'activity' ? (
          <ActivityList
            events={activityEvents}
            activeEventId={activeActivityId}
            onSelectEvent={selectActivity}
          />
        ) : (
          <ChatList
            activeChatId={activeChatId}
            onSelectChat={selectChat}
            readChatIds={readChatIds}
          />
        )}
        <ChatView
          activeChatId={activeChatId}
          onSelectChat={navigateToChat}
          sessions={sessions}
          addSession={addSession}
          updateSession={updateSession}
          updateSessionMessages={updateSessionMessages}
          dynamicSessionMessages={dynamicSessionMessages}
          navIntent={navIntent}
          clearNavIntent={clearNavIntent}
        />
      </div>
      <PowerBIModal
        isOpen={powerBIModal.isOpen}
        onClose={closePowerBIModal}
        reportName={powerBIModal.reportName}
        chartData={powerBIModal.chartData}
      />
    </div>
  )
}
