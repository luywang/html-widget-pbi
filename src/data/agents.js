const base = import.meta.env.BASE_URL

export const copilotAgent = {
  id: 'copilot',
  name: 'Copilot',
  avatar: `${base}avatars/copilot.png`,
  description: 'AI assistant for Microsoft 365',
}

export const designerAgent = {
  id: 'designer',
  name: 'Designer',
  avatar: `${base}avatars/designer.jpg`,
  description: 'Design and image generation',
}

export const pollyAgent = {
  id: 'polly',
  name: 'Polly',
  color: '#B4009E',
  initials: 'PO',
  description: 'Polls and surveys',
}

export const breakthuAgent = {
  id: 'breakthu',
  name: 'Breakthu',
  color: '#038387',
  initials: 'BR',
  description: 'Schedule icebreakers and team building',
}
