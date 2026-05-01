const base = import.meta.env.BASE_URL

// Placeholder persona for the prototype. See PERSONA.md for the full
// character sheet. Keep this fictional — the repo is published publicly.
export const currentUser = {
  name: 'Alex Morgan',
  initials: 'AM',
  email: 'alex@morgancollective.co',
  color: '#6264A7',
  avatar: `${base}avatars/alex-rivera.jpg`,
  status: 'available',
}

export const contacts = [
  { id: 1, name: 'Sarah Chen', initials: 'SC', color: '#6264A7', status: 'available', avatar: `${base}avatars/sarah-chen.jpg` },
  { id: 2, name: 'Claude', initials: null, color: '#D97757', status: null, isAgent: true, logo: 'claude', avatar: `${base}avatars/claude.png`, description: 'AI assistant by Anthropic' },
  { id: 3, name: 'Emma Larsen', initials: 'EL', color: '#E74856', status: 'away', avatar: `${base}avatars/emma-larsen.jpg` },
  { id: 4, name: 'Jira', initials: null, color: '#0052CC', status: null, isAgent: true, logo: 'jira', avatar: `${base}avatars/jira.png`, description: 'Issue tracking and project management' },
  { id: 5, name: 'Emily Watson', initials: 'EW', color: '#00B294', status: 'available', avatar: `${base}avatars/emily-watson.jpg` },
  { id: 6, name: 'Design Sprint Team', initials: 'DS', color: '#8764B8', status: null, isGroup: true },
  { id: 7, name: 'James Kim', initials: 'JK', color: '#CA5010', status: 'available', avatar: `${base}avatars/james-kim.jpg` },
  { id: 8, name: 'Frontend Guild', initials: 'FG', color: '#498205', status: null, isGroup: true },
  { id: 9, name: 'Olivia Martinez', initials: 'OM', color: '#DA3B01', status: 'busy', avatar: `${base}avatars/olivia-martinez.jpg` },
  { id: 10, name: 'David Nguyen', initials: 'DN', color: '#005B70', status: 'available', avatar: `${base}avatars/david-nguyen.jpg` },
  { id: 11, name: 'Conversational AI Team', initials: 'CA', color: '#6264A7', status: null, isGroup: true, memberCount: 12 },
  { id: 12, name: 'Rachel Thompson', initials: 'RT', color: '#7160E8', status: 'available', avatar: `${base}avatars/rachel-thompson.jpg` },
  { id: 13, name: 'Sync on slash commands', initials: 'SS', color: '#B4009E', status: null, isGroup: true },
  { id: 14, name: 'Agent Extensibility', initials: 'AE', color: '#0078D4', status: null, isGroup: true },
  { id: 15, name: 'Kevin Park', initials: 'KP', color: '#038387', status: 'away', avatar: `${base}avatars/kevin-park.jpg` },
  { id: 16, name: 'Agents Platform v2 team', initials: 'AP', color: '#CA5010', status: null, isGroup: true },
  { id: 17, name: 'Natalie Brooks', initials: 'NB', color: '#E74856', status: 'available', avatar: `${base}avatars/natalie-brooks.jpg` },
  { id: 18, name: 'Data Warehouse Support', initials: 'DW', color: '#498205', status: null, isGroup: true },
  { id: 19, name: 'Targeted Messages', initials: 'TM', color: '#DA3B01', status: null, isGroup: true },
  { id: 20, name: 'ACF', initials: 'AC', color: '#005B70', status: null, isGroup: true },
  { id: 21, name: 'Northwind Core', initials: 'NC', color: '#0078D4', status: null, isGroup: true, memberCount: 9 },
  { id: 22, name: 'Design crit', initials: 'DC', color: '#8764B8', status: null, isGroup: true, memberCount: 6 },
  { id: 23, name: 'Northwind launch', initials: 'NL', color: '#CA5010', status: null, isGroup: true, memberCount: 7 },
  { id: 24, name: 'Dogfood feedback', initials: 'DF', color: '#498205', status: null, isGroup: true, memberCount: 11 },
  // ── Channels (rounded-square avatars; threaded/posts layouts) ──
  // Northwind Traders (client — Alex is a guest).
  { id: 25, name: 'General', initials: 'NT', color: '#0078D4', status: null, isChannel: true, memberCount: 86 },
  { id: 26, name: 'Announcements', initials: 'NT', color: '#0078D4', status: null, isChannel: true, memberCount: 124 },
  { id: 27, name: 'Launch readiness', initials: 'NT', color: '#0078D4', status: null, isChannel: true, memberCount: 14 },
  // Morgan Collective (Alex's own consultancy).
  { id: 28, name: 'General', initials: 'MC', color: '#6264A7', status: null, isChannel: true, memberCount: 6 },
  { id: 29, name: 'Client engagements', initials: 'MC', color: '#6264A7', status: null, isChannel: true, memberCount: 4 },
  // Morgan Collective partner (used in channel replies).
  { id: 30, name: 'Taylor Reed', initials: 'TR', color: '#038387', status: 'available' },
]

// Teams the user belongs to. Each team has a list of channels (by contact id,
// with optional `bold: true` to indicate unread content). Team icons use the
// same rounded-square treatment as channels.
//
// Per PERSONA.md:
//  • Northwind Traders is Alex's lead client engagement (guest access).
//  • Morgan Collective is Alex's own boutique consultancy.
export const teams = [
  {
    id: 't-northwind',
    name: 'Northwind Traders',
    initials: 'NT',
    color: '#0078D4',
    avatar: `${base}avatars/northwind-traders.svg`,
    channels: [
      { id: 25, bold: true },
      { id: 26, bold: true },
      { id: 27 },
    ],
  },
  {
    id: 't-morgan',
    name: 'Morgan Collective',
    initials: 'MC',
    color: '#6264A7',
    avatar: `${base}avatars/morgan-collective.svg`,
    channels: [
      { id: 28, bold: true },
      { id: 29 },
    ],
  },
]

export const favorites = [
  { contactId: 1 },
  { contactId: 12 },
  { contactId: 15 },
  { contactId: 2 },
  { contactId: 11, bold: true },
  { contactId: 26, bold: true },
]

export const projectNorthwind = [
  { contactId: 21, bold: true },
  { contactId: 25, bold: true },
  { contactId: 22 },
  { contactId: 23 },
  { contactId: 24 },
]

export const chatList = [
  // Jira demo flow disabled — restore `draft: '/Jira Are there any blockers assigned to me?'` to re-enable.
  { contactId: 3 },
  { contactId: 4 },
  { contactId: 6 },
  { contactId: 13 },
  { contactId: 14 },
  { contactId: 7, bold: true },
  { contactId: 8, bold: true },
  { contactId: 16 },
  { contactId: 5 },
  { contactId: 17 },
  { contactId: 9, bold: true },
  { contactId: 18 },
  { contactId: 10 },
  { contactId: 19 },
  { contactId: 20 },
]

// Channels inherit their parent team's avatar — a channel in the chat list
// should visually read as "part of Team X", not get its own generic tile.
// Backfills any channel contact that doesn't already specify its own avatar.
for (const team of teams) {
  if (!team.avatar) continue
  for (const entry of team.channels) {
    const channel = contacts.find((c) => c.id === entry.id)
    if (channel && channel.isChannel && !channel.avatar) {
      channel.avatar = team.avatar
    }
  }
}
