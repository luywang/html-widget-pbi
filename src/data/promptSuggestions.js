// Keyed by agent contact id. Rendered as a 2x3 grid on the new-session empty
// state inside the chat canvas. `text` is what gets sent when the card is
// clicked; `response` is the canned agent reply that follows after a brief
// typing indicator.
export const promptSuggestions = {
  2: [
    {
      title: 'Explain a codebase',
      description: 'Get a high-level tour of an unfamiliar project.',
      text: 'Give me a high-level tour of this codebase — entry points, main modules, and how data flows.',
      response:
        'Happy to. To give you a useful tour, share the repo (or paste the top-level tree and the main entry file) and tell me what you\'re trying to do with it — onboard, add a feature, or debug. I\'ll walk through the entry points, how modules depend on each other, and the main data-flow paths.',
    },
    {
      title: 'Debug an issue',
      description: 'Walk through symptoms and find the root cause.',
      text: 'Help me debug an issue. I\'ll describe the symptoms — walk me through likely root causes.',
      response:
        'Go ahead — describe what you\'re seeing, what you expected, and any recent changes. If you have a stack trace, error message, or reproduction steps, paste those too. I\'ll suggest likely root causes in priority order and what to check to rule each out.',
    },
    {
      title: 'Design a system',
      description: 'Think through architecture trade-offs.',
      text: 'I need to design a new system. Help me think through the architecture and trade-offs.',
      response:
        'Let\'s start with the problem, not the tech. What is the system for, what are the hard constraints (scale, latency, consistency, cost, team size), and what has to integrate with it? Once I know that, I\'ll sketch a couple of options with the trade-offs called out so you can pick deliberately.',
    },
    {
      title: 'Refactor code',
      description: 'Suggest cleaner patterns for existing logic.',
      text: 'Review this code and suggest a cleaner refactor — I\'ll paste it in next.',
      response:
        'Paste the code whenever you\'re ready. Useful extra context: what this module is responsible for, which parts you feel are messy, and any constraints (public API to preserve, perf targets, test coverage). I\'ll flag the highest-leverage changes first instead of rewriting the whole thing.',
    },
    {
      title: 'Write test cases',
      description: 'Generate unit and integration tests.',
      text: 'Help me write unit and integration tests for a module I\'ll share.',
      response:
        'Sure — share the module and your test framework (Jest, Vitest, pytest, etc.). I\'ll cover the happy path, the edge cases that are easy to miss, and the failure modes. If integration tests need real infra (DB, HTTP), tell me what\'s available so I don\'t mock things you want to hit for real.',
    },
    {
      title: 'Draft release notes',
      description: 'Turn changes into readable release notes.',
      text: 'Draft release notes from a list of changes I\'ll provide.',
      response:
        'Paste the change list (commit messages, merged PRs, or a plain list) and tell me the audience — end users, customers, or engineers. I\'ll group by theme (features, fixes, breaking changes), rewrite for clarity, and keep the tone consistent with your previous releases if you share one.',
    },
  ],
  4: [
    {
      title: 'Show my open tickets',
      description: 'List tickets assigned to you across sprints.',
      text: 'Show me all open tickets assigned to me.',
      response:
        'You have 4 open tickets:\n\n• JIRA-4562 — Plugin sandbox file system isolation (High, In Progress, Sprint 14)\n• JIRA-4578 — TLS handshake timeout not respecting configured value (P1, In Progress, Sprint 14)\n• JIRA-4521 — Implement notification preference API endpoints (Medium, To Do, Sprint 14)\n• JIRA-4498 — Fix rate limiting on webhook delivery (Medium, In Progress, Sprint 13 carryover)\n\nWant me to open any of these, or re-prioritize?',
    },
    {
      title: 'Find blockers',
      description: 'Surface blockers for the current milestone.',
      text: 'What blockers are open for the current milestone?',
      response:
        'Found 2 open blockers for the April 25 milestone:\n\n• JIRA-4555 — Auth token refresh during agent handoff (High, assigned to Kevin Park, In Progress)\n• JIRA-4562 — Plugin sandbox file system isolation (High, assigned to you, In Progress)\n\nJIRA-4555 has 4 dependent tickets waiting on it. Want details on either?',
    },
    {
      title: 'Sprint status',
      description: 'Summarize velocity and completion.',
      text: 'Give me a status summary for the active sprint.',
      response:
        'Sprint 14 status (Day 6 of 10):\n\n• Completed: 18 of 36 story points (50%)\n• In Progress: 12 points across 5 tickets\n• Not Started: 6 points across 2 tickets\n• At risk: JIRA-4562 and JIRA-4578 (both blockers, both slipping)\n\nOn pace for ~32 points this sprint vs. 38 planned. Want a per-person breakdown?',
    },
    {
      title: 'Triage new bugs',
      description: 'Review recently filed issues.',
      text: 'Show me recently filed bugs that still need triage.',
      response:
        '3 bugs filed in the last 48 hours are still untriaged:\n\n• JIRA-4591 — "Agent handoff loses message context on slow connections" (no priority, no assignee)\n• JIRA-4590 — "Settings page scroll position jumps on tab switch" (no priority, no assignee)\n• JIRA-4588 — "Plugin sandbox allows write access to /tmp" (no priority, no assignee) — this one looks security-sensitive\n\nWant me to suggest priorities and owners?',
    },
    {
      title: 'Dependency check',
      description: 'Find tickets blocked by other work.',
      text: 'Which of my tickets are blocked by work in other teams?',
      response:
        '2 of your tickets are blocked by external teams:\n\n• JIRA-4521 (Notification preference API) — blocked by JIRA-4480 "Rate limiting dashboard" (Platform team, Kevin Park)\n• JIRA-4498 (Webhook rate limiting fix) — blocked by JIRA-4505 "Update infra limits config" (SRE team, unassigned)\n\nJIRA-4505 has been open 9 days with no assignee. Want me to escalate?',
    },
    {
      title: 'Release readiness',
      description: 'Check the checklist for the next release.',
      text: 'Run the release readiness checklist for the next version.',
      response:
        'v2.4 release readiness:\n\n✅ Feature tickets: 7 of 7 Done\n⚠️ Bug fixes: 4 of 5 Done (JIRA-4578 still In Progress)\n⚠️ QA sign-off: Pending — blocked on JIRA-4578\n✅ Staging deployment: Verified April 20\n✅ Load test: Passed (p99 = 178ms, target <200ms)\n⚠️ Docs: 1 of 2 articles updated\n\nTwo items in progress — both are feasible for the April 25 target if JIRA-4578 lands by tomorrow. Want me to check in with the owners?',
    },
  ],
}
