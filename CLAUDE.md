# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A high-fidelity static shell of the Microsoft Teams Chat UI, intended as a **forkable starting point for prototyping new Teams features**. The shell already looks like Teams out of the box, so prototype work can focus on the new feature rather than rebuilding chrome. There is no backend; all data is mocked.

Users will ask you to build, modify, or extend prototype features on top of this shell. **Stay within the boundaries of the Microsoft Teams framework and design language** — match real Teams chrome, interaction patterns, and visual style unless the user explicitly asks you to deviate. The goal is that a prototype feels indistinguishable from real Teams except for the new feature under test.

## REQUIRED READING — Before Any Change

**At the start of every task that touches the experience (UI, copy, data, flows, styling), read these two files first:**

1. **`PERSONA.md`** — the user's role, active projects, collaborators, and communication style. Any new messages, chat names, session titles, agent replies, or draft text must sound like it came from this person's Teams. Reuse existing names, tickets, and surface references instead of inventing generic placeholders.
2. **`DESIGN_GUIDE.md`** — color tokens, spacing, typography, icon style, card patterns, and surface decisions. Any visual change (colors, layout, new component, card anatomy) must conform to what's documented here.

These are not optional references — they are the guardrails that keep prototypes on-brand and on-voice. If the user provides new persona details or design guidance during a task, **update the corresponding file** in the same change so future work stays in sync.

## Repo Layout

```
teams-shell/            ← repo root
├── CLAUDE.md
├── DESIGN_GUIDE.md
├── PERSONA.md
├── README.md
├── images/avatars/     Agent logo/avatar sources (Copilot, Designer, Jira, Claude)
├── public/             Static assets (avatars, favicon, icons)
└── src/                App code
```

## Commands

Run from the repo root:

```bash
npm run dev      # Vite dev server with HMR (http://localhost:5173)
npm run build    # Production build to dist/
npm run lint     # ESLint
npm run preview  # Serve the production build locally
```

No test runner is configured.

## Architecture

Single-page React 19 app built with Vite 8. No routing, no state management library. All paths below are relative to the repo root.

### Layout

`src/App.jsx` owns the top-level state and renders:

```
┌──────────────────────── TitleBar ─────────────────────────────────────┐
│ NavRail │ ChatList │ ChatView (+ optional right rails)                │
│         │   or     │                                                  │
│         │ ActivityList (when the bell icon is selected)               │
└─────────┴──────────┴──────────────────────────────────────────────────┘
```

`NavRail` is a controlled component driving `activeView` (`'chat' | 'activity'`). When `activity` is active, `ChatList` is swapped for `ActivityList` and `ChatView` renders the chat the selected activity event points at (with that event's source message highlighted).

`ChatView` can render up to two right-hand rails alongside the main canvas:
- **SessionsRail** — list of past agent sessions for the active agent chat (agent chats only)
- **AgentsRail** — agents in the current conversation + per-agent private chat thread
- **ChannelThreadRail** — a channel post's replies thread (channel chats only; opens when a reply indicator is clicked, or when an Activity event points at a channel reply)

### State lives in `App.jsx`

Hoisted so rails and the canvas stay in sync:

- `activeView` — `'chat' | 'activity'`, driven by NavRail
- `activeChatId` — which chat is open
- `readChatIds` (`Set`) — chats the user has visited; dismisses `bold` + unread-dot in `ChatList`
- `sessions` — per-agent list of past sessions (starts from `data/sessions.js`, augmented at runtime)
- `dynamicSessionMessages` — messages for sessions created during the prototype session
- `activityEvents` / `activeActivityId` — notification feed state backing the Activity view
- `navIntent` — one-shot signal used when cross-navigating between chats. Shape: `{ chatId, sessionId?, channelThreadPostId?, highlightMessageId? }`. ChatView consumes it on the next render to open the sessions rail, auto-open a channel thread, or scroll + flash a specific message

`ChatView` owns local state for compose input, which rail is open, per-chat ephemeral flags, scripted/demo flow progress, etc. When `activeChatId` changes, the chat-level state is reset via the render-phase state-adjustment pattern (not a `useEffect`).

### Data layer

All mocks live in `src/data/` and are re-exported by `src/data.js` (the barrel). Components should import from the barrel — don't reach into `./data/<module>` directly.

- `contacts.js` — `currentUser`, `contacts` (people + agents + groups + channels), `favorites`, `projectNorthwind`, `chatList`, `teams`
- `messages.js` — `messagesByContact` (default 1:1/group message history keyed by contact id)
- `channelPosts.js` — `channelPostsByContact` (thread-style posts for channel contacts, keyed by channel contact id)
- `agents.js` — extra agent definitions (`copilotAgent`, `designerAgent`, `pollyAgent`, `breakthuAgent`) used in the agents rail but not part of the main contacts list
- `sessions.js` — `agentSessions`, the initial per-agent session lists
- `sessionMessages.js` — message history keyed by session id
- `promptSuggestions.js` — the 2×3 grid of prompt cards shown in the empty state for a new agent session, keyed by agent contact id
- `activityEvents.js` — `activityEvents`, the chronological notification feed (reactions, replies, mentions) referenced by contact/message/post ids

### Contact types

Everything is in the `contacts` array. The flags on a contact decide how it's rendered:

| Flag          | Rendering                                                              |
|---------------|-----------------------------------------------------------------------|
| `isAgent`     | Circular avatar, agent logo or avatar image, no status dot            |
| `isGroup`     | Circular avatar, initials, no status dot, optional `memberCount`      |
| `isChannel`   | Rounded-square avatar, chat renders as "Threads" layout (channel posts) |
| *(none)*      | Circular avatar with status dot (regular person)                      |

Channels are additionally grouped into teams via the `teams` export. Each team has an `id`, `name`, `initials`, `color`, and a `channels` array of `{ id, bold? }` entries referencing contact ids.

### Component layers

- `src/components/common/` — shared primitives meant for reuse across surfaces. See the **Available Components** catalog below for the full list. Add a new reusable primitive here; don't inline SVGs or hand-roll a button when a common one fits.
- `src/components/` — feature components for the current surface:
  - `TitleBar`, `NavRail`, `ChatList` — chrome
  - `ActivityList` — left pane when the bell icon is selected; chronological feed of reactions/replies/mentions that target the current user. Clicking an event routes `ChatView` to the source chat (and opens a channel thread or flashes an anchor message when relevant)
  - `ChatView` — the main canvas router; delegates to `ChatHeader`, `Compose`, and the rails
  - `ChatHeader`, `Compose` — split out from `ChatView` to keep it focused on state + routing
  - `MessageRow` — one message bubble (reactions, thread reply badge, link cards, Adaptive Cards)
  - `MessageActions` — hover toolbar above a message (quick reactions, emoji picker, edit, more)
  - `PromptSuggestions` — empty-state 2×3 grid of suggestion cards for a new agent session
  - `SessionsRail`, `AgentsRail`, `ChannelThreadRail` — the right-side rails

### Styling

Component-scoped CSS: each `Foo.jsx` has a sibling `Foo.css`. No CSS-in-JS, no Tailwind. Color tokens, spacing, and surface decisions are documented in `DESIGN_GUIDE.md` — always consult it before changing colors or layout surfaces, and update it when the user provides new design guidance.

## Available Components

Running catalog of the reusable primitives in `src/components/common/`. **Always check this list before building a new component** — if something here fits (even loosely), reuse it rather than rolling your own. Import from the barrel: `import { Avatar, TypingIndicator, ... } from '../common'` (or `./common` depending on depth).

A component appearing here doesn't mean it's actively used in the default repo — some are provided for prototyping surfaces that aren't wired up out of the box. **When you add a new reusable primitive to `components/common/`, add a row to this table in the same change.**

| Component | What it is | Props | Notes |
|-----------|------------|-------|-------|
| `Avatar` | Person / agent / group / channel avatar. Circle for people/agents/groups, rounded-square for channels. Renders an image if `contact.avatar` is set, else an agent logo (via `shared/agentLogos.jsx`) for agents, else `contact.initials` over `contact.color`. | `contact`, `size = 36` | Status dot auto-draws when `contact.status` is set and auto-scales (~28% of avatar). See `DESIGN_GUIDE.md` for established sizes per surface. |
| `LinkCard` | Rich external-link card used inside message bubbles — icon tile + title/subtitle. Today supports Jira and GitHub icon treatments. | `link: { source, title, subtitle, url }` | `source: 'jira' \| 'github'`. Extend the icon set inside the component when a new source is needed. |
| `IconButton` | Accessible icon-only button: consistent reset, hover state, required `aria-label`. | `label`, `active?`, `className?`, `children`, plus any native `<button>` props | Use this instead of hand-rolling a `<button>` with an SVG — callers still add their own className for size/color. |
| `PrivateDisclaimer` | Lock icon + "Only you can see this conversation" strip. | `text?` (override the default copy) | Used inside private message bubbles and above the agents-rail chat thread. |
| `TypingIndicator` | Canonical "X is typing" UI — avatar + 3 bouncing dots. **Whenever a task says "typing indicator", it means this.** | `contact`, `avatarSize = 32`, `dotSize = 5`, `className?` | Component owns only the avatar + dots visual; positioning is the caller's job. Main canvas: floats above `Compose` with the avatar's bottom ~10% tucked behind the compose box top edge (see `.chat-compose-area` / `.chat-compose-typing` in `ChatView.css`). Agents rail: in-flow above the rail compose. Add new surface-specific CSS rather than forking the component. |
| `DemoArrow` | Red pulsing arrow that cues the viewer to the next click target during a prototype walkthrough. **Whenever a task says "red arrow" / "demo arrow" / "hint arrow" to guide the viewer, it means this.** | `direction: 'left' \| 'right' \| 'up' \| 'down'`, `size = 24`, `className?` | Owns only the visual + pulse animation (uses the `translate` CSS property so caller `transform` doesn't collide). Caller handles absolute positioning near the target and should set `pointer-events: none` on the wrapper so clicks still land on the target. **Ephemeral**: track show/hide state wherever the target's click handler lives and unmount once the target is clicked. See `DESIGN_GUIDE.md` → "Demo Hint Arrows". |
| `Icon` library | Shared SVG icons exported from `components/common/Icon.jsx`: `Close`, `Plus`, `ChevronDown`, `ChevronLeft`, `Send`, `Clock`, `Search`, `Dots`, `EmojiAdd`, `Edit`, `Lock`. | Each takes `size`; stroked icons (`Clock`, `EmojiAdd`, `Edit`) also take `stroke`. | When adding a new icon, start at [fluenticons.co](https://fluenticons.co/) (Fluent UI — matches Teams). Add it here instead of inlining SVG in a feature component. |

## Key Conventions

- Messages from the current user are right-aligned; other users are left-aligned with avatar on the left.
- In 1:1 chats the current user's avatar is **not** rendered on their own messages. In group chats it is.
- My own messages don't show a sender-name label — only a timestamp. Sender names elsewhere are regular weight, not bold.
- Agents vs people vs groups vs channels are all in `contacts` — distinguished by `isAgent` / `isGroup` / `isChannel` flags. An agent has either an `avatar` URL or a `logo` key that resolves via `shared/agentLogos.jsx`.
- Channel chats render as "Threads" — each post is a top-level message with a `subject`, body, and optional replies. Replies live in `ChannelThreadRail`, opened via the reply indicator on the post.
- Agents send rich content via **Adaptive Cards** (`message.cards`) — the framework recommended by the Teams team. See `DESIGN_GUIDE.md` for the card anatomy and links.
- The prototype should look indistinguishable from real Microsoft Teams. When in doubt, reference the design tokens in `DESIGN_GUIDE.md`.
- `currentUser` is a generic placeholder by design — don't hardcode a specific name/photo into it.
- There is a disabled scripted demo flow in `ChatView.jsx` (the `jiraScript` array + `isJiraInvocation` branch, gated by `JIRA_FLOW_ENABLED`). Leave it alone unless a task specifically asks about scripted/demo flows — it's kept as a reference pattern.

## When Adding Features

- Set up the scenario in `src/data/` first (new contact, message, agent, session, channel post)
- Any time you author new copy — messages, chat names, session titles, agent responses, draft text — consult `PERSONA.md` and match the user's voice, active projects, and collaborators. Reuse existing names/tickets/surface references instead of inventing new ones.
- Reach for `components/common/` primitives before rolling a new button, icon, avatar, or typing indicator — see the **Available Components** catalog above. Import from the barrel (`./common` / `../common`), including icons from the `Icon` library.
- Import data from `src/data.js` (the barrel), not from individual `src/data/*` files.
- If the user provides design guidance (colors, spacing, icon styles, typography, card patterns), update `DESIGN_GUIDE.md` in addition to implementing the change
