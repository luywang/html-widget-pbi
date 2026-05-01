# Teams Shell

A high-fidelity static shell of the Microsoft Teams Chat UI, meant as a starting point for prototyping new Teams features. Fork this repo, drop in your idea, and you'll have a realistic-looking Teams surface from day one — so the prototyping work goes into the feature, not the chrome.

## What's inside

- **Teams chat UI** — title bar, nav rail, chat list, chat view, compose, sessions rail, agents rail, channel-post threads
- **Realistic mock data** — contacts, conversations, agents, sessions, channels and channel posts — populated so the shell looks lived-in out of the box
- **Reactions, @mentions, reply threads, Adaptive Cards** — the message-level patterns partners expect from Teams, ready to wire up
- **Persona-anchored copy** — seeded content reads like a real person's Teams. See [`PERSONA.md`](PERSONA.md) for the character sheet driving message content
- **Component-scoped styling** — each `.jsx` has a sibling `.css`, no Tailwind or CSS-in-JS
- **Design guide** — color tokens, spacing, typography, card patterns, and layout decisions in [`DESIGN_GUIDE.md`](DESIGN_GUIDE.md)
- **Reference assets** — [`images/avatars/`](images/avatars/) holds agent logo/avatar sources used to build the UI (Copilot, Designer, Jira, Claude)

Nothing is wired to a backend. The shell is static on purpose — prototypes stay small, fast, and easy to hand off.

## Quick start

Requires Node 20.19+ (Vite 8 requirement).

```bash
npm install
npm run dev
```

Opens at http://localhost:5173.

### Commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |

## Project layout

```
teams-shell/
├── CLAUDE.md             Guidance for AI coding assistants working in this repo
├── DESIGN_GUIDE.md       Color tokens, spacing, icons, typography, card patterns
├── PERSONA.md            The fictional user persona driving all seeded copy
├── README.md
├── images/               Reference assets
│   └── avatars/          Agent logo/avatar sources (Copilot, Designer, Jira, Claude)
├── public/avatars/       Static avatar images
└── src/
    ├── App.jsx           Four-panel layout root
    ├── data.js           Barrel re-export of everything in data/
    ├── components/       TitleBar, NavRail, ChatList, ChatView (ChatHeader, Compose),
    │   │                  MessageRow, MessageActions, PromptSuggestions,
    │   │                  SessionsRail, AgentsRail, ChannelThreadRail
    │   └── common/       Shared primitives (Avatar, LinkCard, Icon, IconButton, ...)
    └── data/             Mock contacts, messages, agents, sessions, channel posts,
                          prompt suggestions
```

## Prototyping a feature

1. **Set up the scenario** — edit the mock data in `src/data/` to add a chat, channel post, agent, message thread, or session that fits your feature. All files are re-exported from `src/data.js` — import from there.
2. **Make the current user yours** — update `currentUser` in `src/data/contacts.js` (name, initials, avatar). The default avatar is a generic placeholder at `public/avatars/user.jpg`.
3. **Match the voice** — when adding messages, read [`PERSONA.md`](PERSONA.md) and reuse the listed collaborators, projects, and communication style instead of inventing new ones.
4. **Build or extend a component** in `src/components/` — every component has a scoped `.css` sibling. Reach for primitives in `components/common/` (Avatar, IconButton, Icon library, LinkCard, PrivateDisclaimer) before rolling your own.
5. **Match the visual language** — reference [`DESIGN_GUIDE.md`](DESIGN_GUIDE.md) for colors, spacing, typography, and the Adaptive Cards pattern for agent-sent rich content.
6. **Ship it** — `npm run build` produces a static bundle you can host anywhere.

## Stack

React 19, Vite 8. No routing, no state management library, no backend — deliberately small so the code stays easy to read and modify.
