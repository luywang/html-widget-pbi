// Barrel re-export — all data modules accessible from a single import.
// Prefer this over reaching into ./data/* directly.
export { currentUser, contacts, favorites, projectNorthwind, chatList, teams } from './data/contacts'
export { agentSessions } from './data/sessions'
export { sessionMessages } from './data/sessionMessages'
export { messagesByContact } from './data/messages'
export { channelPostsByContact } from './data/channelPosts'
export { copilotAgent, designerAgent, pollyAgent, breakthuAgent } from './data/agents'
export { promptSuggestions } from './data/promptSuggestions'
export { activityEvents } from './data/activityEvents'
