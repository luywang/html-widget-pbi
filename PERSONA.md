# Persona: Alex Morgan

Reference this file whenever generating new content for the prototype (messages, session titles, chat names, canned agent responses, seeded data). The goal is for every piece of text to read like it came from a real person's Teams — not generic placeholder copy.

This persona is fictional. Don't tie messages to any real person, employer, or internal codename.

## Role

- Principal product consultant, operating independently under **Morgan Collective** (a boutique consultancy).
- Works with 2–3 B2B / enterprise clients at a time. Roughly a 60/40 split between hands-on product work (PRDs, specs, launch readiness) and strategic advisory (roadmap reviews, org coaching, due-diligence support).
- Specialty: product strategy for AI-native and agent-based platforms. Partners closely with client engineering, design, and content teams.
- Based in the US Pacific time zone. Mostly remote; occasional on-site visits with clients.

## Current engagements

- **Northwind Traders** — lead engagement, multi-quarter. Helping Northwind stand up an internal agent platform (their codename: "Agents Platform v2") so their ops and partner teams can delegate work to AI agents. Currently in launch-planning for an April 25 milestone.
- **Conversational AI working group** — smaller recurring advisory engagement with a separate client, focused on how their agents should handle handoffs, context preservation, and slash-command invocations.
- Secondary advisory work comes and goes; keep it vague in messages unless specifically seeded.

## Close collaborators

Reuse these names rather than invent new ones when seeding messages or @mentions:

- **Northwind engineering:** Kevin Park (auth / token refresh), James Kim (analytics + agent handoff), Olivia Martinez (webhook delivery), David Nguyen (docs + migration guides)
- **Northwind design & QA:** Sarah Chen (handoff UX + settings), Emma Larsen (QA, staging smoke tests)
- **Northwind PM & stakeholders:** Rachel Thompson (tech-lead PM on the agent platform — also Alex's primary working peer), Emily Watson (PM on a parallel workstream), Natalie Brooks (newer PM, recently onboarded)
- **Frequent agents Alex delegates work to:** Jira (ticketing, sprint status, blocker lookups), Claude (architecture rubber-ducking, drafting, code review)

## Communication style

- Direct and concise. Short messages, bullet lists over paragraphs. Rarely writes more than 3–4 sentences in chat.
- Casual lowercase in 1:1s and small groups; slightly more formal in cross-team channels and to client leadership.
- Comfortable with shorthand: `PR`, `LGTM`, `WIP`, `ICYMI`, `FYI`, `EOD`, `ETA`, `PRD`, `ADR`, `P1`, `p99`.
- Technical vocabulary welcome: retries, jitter, backoff, circuit breakers, idempotency, webhooks, feature flags, dogfood, WAL, CDC, outbox, eventual consistency.
- Asks clarifying questions before committing; pushes back on vague scope. Offers options with trade-offs rather than a single confident answer.

## Influences on generated content

- **Time zone:** US Pacific. "Today" / "Yesterday" / business-hours timestamps should resolve to PT.
- **Tools referenced naturally:** Teams, Jira, Figma, GitHub, Notion, Azure / AWS, Grafana, Snowflake, feature-flag systems. Stay tool-agnostic where possible — don't bind Alex to a specific vendor ecosystem.
- **Project artifacts:** realistic ticket prefixes (`JIRA-45xx`), realistic repo names (`northwind/agent-handoff`), release tags (`v2.3`, `v2.4`).
- **Do not reference:** the repo author, any specific real company, or Microsoft-internal codenames. Clients and coworkers are all fictional. "Northwind Traders" is a well-known generic fictional enterprise and is safe to use.
- **Avoid placeholder writing:** no `Lorem ipsum`, `Hello world`, `Test user`, `John Smith`, or generic email addresses. If a realistic detail isn't obvious, reuse an existing one from the data rather than invent something new.
- **Agent voice:**
  - **Jira** replies are terse and structured — quotes ticket ids, statuses, assignees, dates. No fluff.
  - **Claude** replies are thoughtful, push back when scope is unclear, offer 2–3 options with trade-offs, avoid over-confident single answers.
- **Tone safety:** messages should never be edgy, snarky, or vent about colleagues. This is a public prototype — every message should be demo-safe.
