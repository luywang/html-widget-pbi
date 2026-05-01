# Design Guide

## Color Palette

### Layout Surfaces

| Element | Hex | Usage |
|---------|-----|-------|
| Title Bar | `#EBEBEB` | Top header bar containing search and navigation |
| App Bar (Nav Rail) | `#EBEBEB` | Far-left vertical icon navigation |
| Search Bar | `#FAFAFA` | Search input in the title bar |
| Chat List | `#F5F5F5` | Chat list panel (right of the app bar) |
| Chat Canvas | `#FFFFFF` | Main area where chat messages are displayed |
| Agents Rail | `#FAFAFA` | Right-side rail for per-conversation agents |
| Channel Thread Rail | `#FFFFFF` | Right-side rail for a channel post's replies |

The title bar, app bar, and chat list form a cool neutral palette that matches current Microsoft Teams. The chat list is slightly lighter than the chrome so its surface reads as a container nested inside it. The search bar is the lightest surface in the header, floating on top of the title bar.

### Message Bubbles

| Element | Hex | Alignment |
|---------|-----|-----------|
| Other User | `#F5F5F5` | Left-aligned |
| Current User | `#E8EBFA` | Right-aligned |

### Chat List

| Element | Hex | Notes |
|---------|-----|-------|
| Chat item hover + selected | `#FCFBFA` | Same fill for both states — a chat doesn't get a separate "selected" treatment. Subtle off-white above the `#F5F5F5` panel. |
| Active tab text | `#242424` | Bold, no background fill |
| Inactive tab text | `#616161` | Regular weight, no background fill |

**Shape:** hover/selected fills render as a rounded rectangle with side insets (`margin: 0 8px`, `border-radius: 4px`, content `padding` reduced by the same amount) — the highlight does **not** stretch full-width of the panel. Applies uniformly to chat items, pinned items (Copilot / Quick views), team rows, and channel rows.

## Typography

Sourced from live Teams (dev-tools inspection).

### Font Stack

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui,
             'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Web', sans-serif;
```

Set globally on `body` in `src/index.css`. All components should inherit — avoid overriding `font-family` in component CSS.

### Base Body Text

- **Size:** `14px` (Teams expresses this as `1.4rem` on a `10px` root; we use px directly)
- **Line height:** `1.4286` (unitless, inherited; produces 20px for 14px text)

### Chat List Item Names

- Size: 14px
- Weight: `400` regular, `600` when the chat is bold/unread

### Chat Header Name

- Size: 18px
- Weight: `700`
- Line height: inherits the body `1.4286` (≈25.7px at 18px)

### Chat Header Tabs

- Size: 14px
- Weight: `400` inactive, `600` active
- Color: `#424242` inactive, `#242424` active
- Spacing: `6px` gap between tabs
- Truncation: `max-width: 150px` with `text-overflow: ellipsis` and `white-space: nowrap` — keeps long chat names from breaking the header layout
- Active tab marker: 3px underline in Teams purple (`#6264A7`), `2px` border-radius, spans the tab label width only (not the full button click area — rendered via `::after` on the content box)

## Avatar Sizing

Pass `size` to the common `Avatar` component. Established sizes:

| Surface | Size |
|---|---|
| Chat list item | `20` |
| Title bar (current user) | `28` |
| Chat view header | `28` |
| Message row | `32` |
| Agents rail list + detail header | `24` |
| Prompt-suggestions empty state | `72` |

The status dot scales automatically (~28% of avatar size, min 6px) — no need to tune it per surface. Matches real Teams: 20px avatar → 6px dot, 28px → 8px, 32px → 9px, 36px → 10px.

### Avatar Shape

- **People, groups, agents:** circle (`border-radius: 50%`).
- **Channels** (`contact.isChannel`): rounded square. Radius is ~18% of size (min 3px) so it scales with the surface — matches the way Teams visually distinguishes channels from chats in the unified chat list.

## Dividers

Standard divider used throughout the app (chat list header rows, chat view tab bar, section separators):

- **Style:** `1px solid #E8E8E8`
- Use consistently anywhere a subtle horizontal rule is needed between sections.

## Iconography

When you need a new icon, start your search at [fluenticons.co](https://fluenticons.co/) — it's the Fluent UI icon set that matches Teams' visual language.

Before adding an icon inline, check `src/components/common/Icon.jsx` — the shared library already covers common cases (`Close`, `Plus`, `ChevronDown`, `ChevronLeft`, `Send`, `Clock`, `Search`, `Dots`, `EmojiAdd`, `Edit`, `Lock`). Add new reusable icons there rather than inlining SVG in feature components.

### App Bar (Nav Rail) Icons

- **Size:** 24×24 SVG inside a 28×28 wrap (larger than Teams' typical 20px — the icons read more clearly at this size and the prototype skews the detail up slightly)
- **Inactive state:** Outlined icons, `#666666`
- **Active state:** Filled icons, Teams purple (`#5B5FC7`); same color drives a 3px left-edge active indicator spanning the **full height of the nav-item row** (flush top to bottom, not capped) and an 8% tinted background fill (`rgba(91, 95, 199, 0.08)`)
- **Clickable surfaces:** `chat` and `activity` toggle the left pane (ChatList ↔ ActivityList). Others are decorative for now.

## Message Patterns

### Bubble / compose alignment

Bubble edges line up with the edges of the compose field in all chat canvases (1:1, group, and channel) so the conversation reads as a single vertical column anchored to the same left/right rails as input:

- Others' bubble **left** edge aligns with compose left edge
- Mine bubble **right** edge aligns with compose right edge
- Avatars extend **past** those rails (to the left for others, to the right for mine in group chats)

Implemented by setting `.messages-container` side padding to `24px` (matching `.chat-compose`), then pulling the message row horizontally with `margin-left: -40px` (others) / `margin-right: -40px` (mine + avatar) so the 32px avatar + 8px gap lands outside the compose rail. In 1:1 chats my own messages have no avatar, so the mine row sits flush with no negative margin.

### Reactions

Reaction pills render under the bubble (left-aligned for others' messages, right-aligned for mine). Pills are oval (`border-radius: 12px`, `height: 24px`), white background with a `1px solid #E0E0E0` border. A reaction the current user has added flips the border to Teams purple (`#6264A7`) so "mine" vs "theirs" is visually clear.

- **Hover toolbar** (`MessageActions`) appears above the bubble on hover: four quick-reaction emojis (`👍 ❤️ 😂 😮`), a full emoji-picker trigger, a divider, then `Edit` and `More options`. Quick reactions toggle the current-user flag on that emoji when clicked.

### Thread reply indicator

Under a bubble that has replies (channel posts with `replies`, private agent threads with a `threadReply` badge), a small pill shows:
- Up to 3 participant avatars (18px, overlapping `-6px` with a 1.5px white ring)
- `1 reply` / `N replies` label in 12px/600 Teams purple (`#6264A7`)
- Hover fills with `#F0F0F0`

Click behavior depends on surface:
- **Channel post:** opens `ChannelThreadRail` with root + replies + compose
- **Private agent thread (Jira demo flow):** toggles the `AgentsRail` open/closed on the agent who owns the thread

### Private (only-you) bubble

Used for the anchor message of an agent thread that's visible only to the user and the agent:
- A `PrivateDisclaimer` strip at the top: lock icon + `Only you can see this conversation` in 11px `#616161`
- A thin `1px solid #BDBDBD` border around the whole bubble
- Background stays the standard mine color (`#E8EBFA`)

### Channel posts

Channel chats render a "Threads" layout. Each post has a `subject` (15px/600) rendered inside the bubble above the body. Posts live in `src/data/channelPosts.js` keyed by channel contact id. Replies are shown in `ChannelThreadRail`, not in the main canvas — the main canvas only shows the root posts.

Channel post bubbles get a slightly wider max-width (`80%` vs the default `65%`) because they tend to be announcement-style and run longer.

### Prompt suggestions

New-session empty state for an agent chat: centered 72px avatar + agent name + short description + a 2×3 grid of suggestion cards. Defined in `src/data/promptSuggestions.js` keyed by agent contact id; each card has a `title`, `description`, the `text` to send, and a canned `response`.

## Adaptive Cards

**Agents send rich, interactive content via the [Adaptive Cards framework](https://adaptivecards.microsoft.com/)** — the format the Teams team recommends for agent-authored content. When the user asks you to have an agent send content (status summaries, ticket details, action prompts, etc.), reach for an adaptive card rather than freeform text when the content is structured.

In the prototype's message model, adaptive cards attach to a message via `message.cards` — an array of card objects. The minimal shape rendered today:

```js
{
  accentColor: '#CA5010',            // left border color
  title: 'Keep users logged in when switching between agents',
  facts: [
    { label: 'Status', value: 'In Progress' },
    { label: 'Priority', value: 'High' },
    { label: 'Due', value: 'April 22' },
  ],
  actions: ['View in Jira'],         // rendered as inline link-style buttons
}
```

Real Adaptive Cards support richer elements (images, input fields, action sets, containers). Extend the renderer in `MessageRow.jsx` and the CSS in `ChatView.css` (`.adaptive-card` and `.card-*`) as the prototype needs them — match the [official Adaptive Cards samples](https://adaptivecards.microsoft.com/) for visual fidelity.

## Teams and channels

Channels appear in the chat list grouped under their parent team:
- Teams are defined in `contacts.js` via the `teams` export (id, name, initials, color, `channels: [{ id, bold? }]`).
- Team icons use the rounded-square treatment (same as channel avatars), indent-aligned with their channel rows.
- Clicking a channel selects it; channel chats use the "Conversation" / "Shared" tabs (vs "Chat" / "Shared" / "Recap" / "Storyline" for regular chats).

## Demo Hint Arrows

Red pulsing arrows (`#E8173A`) cue the viewer to the next click target during a prototype walkthrough. Use the reusable **`DemoArrow`** component in `components/common/` — do not inline a new SVG arrow.

**Visual spec:**
- Color: `#E8173A`
- Animation: ~1.5s opacity (`1` → `0.4`) + `translate` nudge (3px) toward the target
- Directions: `'left' | 'right' | 'up' | 'down'`
- Size: 24px default, caller-tunable

**Usage rules:**
- **Positioning is the caller's job.** Typically `position: absolute` anchored near the target, inside a wrapper with `pointer-events: none` so clicks pass through to the target underneath. Wrap `DemoArrow` in a positioning `<span>` / `<div>` rather than relying on the arrow's own layout.
- **Arrows are ephemeral.** Track a `show/hide` state wherever the target's click handler lives and unmount the arrow once the target is clicked so it doesn't linger after the action is taken. Clearing persistently (rather than toggling) matches demo/tutorial conventions.
- One arrow per target at a time — don't stack hints.

The disabled scripted Jira flow in `ChatView.jsx` retains pre-`DemoArrow` inline arrow styles (`.main-compose-hint-arrow`, `.demo-hint-arrow-send` in `Compose.css`; `.agent-chat-hint-arrow` in `AgentsRail.css`) as a reference pattern only. Any new walkthrough should use `DemoArrow` instead.
