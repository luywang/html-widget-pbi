// Messages for each agent session — keyed by session ID
// s2-1 and s4-1 map to the default messagesByContact[2] and [4] respectively
export const sessionMessages = {
  // ── Claude sessions ──
  's2-2': [
    { id: 1, senderId: 'me', text: 'I need to design a resilient error handling strategy for our microservices. What patterns should I consider?', time: '3:45 PM' },
    { id: 2, senderId: 2, text: 'For microservices, I\'d recommend layering a few complementary patterns:\n\n1. Retry with exponential backoff — for transient failures (network blips, 503s)\n2. Circuit breaker — prevent cascading failures when a downstream service is unhealthy\n3. Bulkhead isolation — limit concurrency per dependency so one slow service doesn\'t exhaust your thread pool\n4. Dead letter queues — for async operations that fail after all retries', time: '3:46 PM' },
    { id: 3, senderId: 'me', text: 'We\'re seeing a lot of timeout issues with the notification delivery service. The retry storms are making it worse.', time: '3:50 PM' },
    { id: 4, senderId: 2, text: 'That\'s a classic retry storm scenario. Here\'s what I\'d suggest:\n\nAdd jitter to your retry delays — instead of fixed exponential backoff (1s, 2s, 4s), add a random component (1s ± 500ms, 2s ± 1s, etc.). This decorrelates retry spikes across instances.\n\nAlso, implement a circuit breaker with a half-open state: after tripping, allow a single probe request through every 30 seconds. If it succeeds, close the circuit. If not, stay open.', time: '3:51 PM' },
    { id: 5, senderId: 'me', text: 'Good call on the jitter. What about idempotency? Some of our handlers aren\'t safe to retry.', time: '3:55 PM' },
    { id: 6, senderId: 2, text: 'Critical point. For non-idempotent operations, you have a few options:\n\n• Idempotency keys — the caller generates a unique key per request; the server deduplicates on that key within a TTL window\n• Outbox pattern — write the event to a local "outbox" table in the same DB transaction as the business logic, then publish from the outbox asynchronously\n\nThe outbox pattern is particularly useful for your notification service since it guarantees exactly-once processing without requiring the downstream to be idempotent.', time: '3:56 PM' },
  ],
  's2-3': [
    { id: 1, senderId: 'me', text: 'We need to migrate from Postgres 14 to 16. Can you help me think through the plan?', time: '11:20 AM' },
    { id: 2, senderId: 2, text: 'Sure! Here are the key considerations for a Postgres 14 → 16 migration:\n\n1. Check extension compatibility (especially pg_stat_statements, PostGIS if used)\n2. Run pg_upgrade in --check mode first to validate\n3. Plan for logical replication if you need zero-downtime\n4. Test query performance — PG16 has improved query planning that can change execution plans', time: '11:21 AM' },
    { id: 3, senderId: 'me', text: 'We\'re using pgvector and pg_cron. Any known issues?', time: '11:25 AM' },
    { id: 4, senderId: 2, text: 'pgvector should be fine — just make sure you rebuild the extension after the upgrade. pg_cron needs a version bump to match PG16. I\'d recommend:\n\n1. Upgrade read replicas first\n2. Run your test suite against the upgraded replica\n3. Perform a dry run of pg_upgrade on a staging clone\n4. Schedule the primary cutover during your lowest-traffic window\n\nFor rollback, keep the old data directory intact for 48 hours post-migration.', time: '11:26 AM' },
  ],
  's2-4': [
    { id: 1, senderId: 'me', text: 'The settings page component is 1200 lines. I want to break it up but I\'m not sure where to start.', time: '2:00 PM' },
    { id: 2, senderId: 2, text: 'Let\'s think about this systematically. What are the main sections of the settings page?', time: '2:01 PM' },
    { id: 3, senderId: 'me', text: 'Profile settings, notification preferences, security (2FA, sessions), connected apps, and a danger zone (delete account).', time: '2:03 PM' },
    { id: 4, senderId: 2, text: 'Natural component boundaries right there. I\'d suggest:\n\n• SettingsPage — thin shell with tab navigation, handles routing between sections\n• ProfileSection — avatar upload, display name, email\n• NotificationPreferences — the channel × category matrix\n• SecuritySection — 2FA toggle, active sessions list, password change\n• ConnectedApps — OAuth integrations list with revoke buttons\n• DangerZone — account deletion with confirmation flow\n\nEach section owns its own form state and API calls. The parent just handles tab switching.', time: '2:04 PM' },
    { id: 5, senderId: 'me', text: 'Should I use a shared form library or keep each section independent?', time: '2:10 PM' },
    { id: 6, senderId: 2, text: 'Keep them independent. Shared form state across sections creates coupling — if someone edits their profile and then switches to notifications, you\'d need to handle unsaved changes warnings cross-section. Each section having its own save button and state is simpler and matches user expectations.', time: '2:11 PM' },
  ],
  's2-5': [
    { id: 1, senderId: 'me', text: 'Help me draft release notes for v2.4. The big features are agent handoff and plugin sandboxing.', time: '10:30 AM' },
    { id: 2, senderId: 2, text: 'Here\'s a draft:\n\n**v2.4 Release Notes**\n\n🔄 Agent Handoff\nAgents can now seamlessly transfer conversations to other agents while preserving full context. Users see a smooth transition with no repeated information.\n\n🔒 Plugin Sandboxing\nThird-party plugins now run in isolated environments with scoped file system and network access. This improves security without impacting developer experience.\n\nWant me to add a "Bug Fixes" or "Breaking Changes" section?', time: '10:32 AM' },
    { id: 3, senderId: 'me', text: 'Yes, add bug fixes. We fixed the webhook retry storm issue and the flaky integration tests.', time: '10:35 AM' },
    { id: 4, senderId: 2, text: 'Updated:\n\n**Bug Fixes**\n• Fixed retry storm in webhook delivery by adding jitter to exponential backoff\n• Resolved intermittent integration test failures caused by race conditions in the event bus mock\n• Fixed session token refresh during agent handoff that caused brief session drops\n\nShould I also add any deprecation notices or migration notes?', time: '10:36 AM' },
  ],
  's2-6': [
    { id: 1, senderId: 'me', text: 'I need help writing the copy for our new user onboarding wizard. There are 4 steps: welcome, workspace setup, invite teammates, and explore features.', time: '4:15 PM' },
    { id: 2, senderId: 2, text: 'Here\'s a draft for each step:\n\n**Step 1 — Welcome**\n"Welcome to the team! Let\'s get your workspace set up in under 2 minutes."\n\n**Step 2 — Workspace Setup**\n"Name your workspace and pick a theme. You can always change these later in Settings."\n\n**Step 3 — Invite Teammates**\n"Work is better together. Add teammates by email or share an invite link."\n\n**Step 4 — Explore Features**\n"You\'re all set! Here are a few things to try first."', time: '4:17 PM' },
    { id: 3, senderId: 'me', text: 'Can you make the tone a bit more professional? This is an enterprise product.', time: '4:20 PM' },
    { id: 4, senderId: 2, text: 'Good point. Here\'s the revised version:\n\n**Step 1 — Welcome**\n"Welcome. Let\'s configure your workspace — this should take about 2 minutes."\n\n**Step 2 — Workspace Setup**\n"Set your workspace name and appearance. These can be updated anytime in Settings."\n\n**Step 3 — Invite Teammates**\n"Add team members by email address or generate a shareable invite link."\n\n**Step 4 — Explore Features**\n"Your workspace is ready. Here are some key features to get started with."', time: '4:21 PM' },
  ],
  's2-7': [
    { id: 1, senderId: 'me', text: 'I need to write a test strategy for the webhook delivery system. What should I cover?', time: '9:00 AM' },
    { id: 2, senderId: 2, text: 'For a webhook delivery system, I\'d organize tests into three tiers:\n\n**Unit tests** — test the retry logic, backoff calculations, payload serialization, and signature generation in isolation.\n\n**Integration tests** — spin up a real HTTP server as the webhook target. Test successful delivery, 4xx/5xx responses, timeouts, and TLS certificate validation.\n\n**End-to-end tests** — simulate the full flow from event trigger to webhook delivery to dead letter queue. Verify the entire pipeline works with realistic latency and failure scenarios.', time: '9:02 AM' },
    { id: 3, senderId: 'me', text: 'How should we handle the flaky network scenarios in CI?', time: '9:08 AM' },
    { id: 4, senderId: 2, text: 'Use a chaos proxy like toxiproxy between your test harness and the mock webhook endpoint. You can programmatically inject:\n\n• Latency (slow responses)\n• Connection resets (mid-transfer failures)\n• Bandwidth limits (timeouts on large payloads)\n\nThis gives you deterministic failure injection without actual flakiness. Run these as a separate test suite that doesn\'t block CI by default — trigger them on PRs that touch the delivery pipeline.', time: '9:09 AM' },
  ],
  's2-8': [
    { id: 1, senderId: 'me', text: 'I\'m writing an ADR for adopting event sourcing in our notification service. Can you help me structure it?', time: '1:30 PM' },
    { id: 2, senderId: 2, text: 'Sure. Here\'s a standard ADR structure adapted for this decision:\n\n**Title:** Adopt Event Sourcing for Notification Service\n\n**Status:** Proposed\n\n**Context:** The current state-based model makes it hard to audit notification delivery history, debug failed deliveries, and replay events after outages.\n\n**Decision:** Use event sourcing for the notification pipeline. Store immutable events (NotificationRequested, DeliveryAttempted, DeliverySucceeded, DeliveryFailed) and derive current state from the event log.\n\n**Consequences:**\n• Pro: Full audit trail, easy replay, natural fit for async pipelines\n• Con: Higher storage cost, eventual consistency, steeper learning curve\n\nWant me to expand any section?', time: '1:32 PM' },
    { id: 3, senderId: 'me', text: 'Expand on the "Alternatives Considered" section. We also looked at CDC with Debezium and a simple audit log table.', time: '1:38 PM' },
    { id: 4, senderId: 2, text: '**Alternatives Considered:**\n\n1. **CDC with Debezium** — captures row-level changes from Postgres WAL. Lower implementation effort but couples us to the DB schema. Schema changes require careful migration of CDC consumers. Also doesn\'t capture intent — only "what changed," not "why."\n\n2. **Audit log table** — append-only table with before/after snapshots. Simpler than event sourcing but lacks the ability to rebuild state from events. Also grows large quickly without the benefits of event replay.\n\nEvent sourcing was chosen because the notification pipeline is naturally event-driven and we need both auditability and replay capability for incident recovery.', time: '1:40 PM' },
  ],
  // ── Jira sessions ──
  's4-2': [
    { id: 1, senderId: 'me', text: 'Show me all blockers for the April 25 milestone', time: '11:00 AM' },
    { id: 2, senderId: 4, text: 'Found 2 open blockers for the April 25 milestone:\n\n• JIRA-4555 — Auth token refresh during agent handoff (High, assigned to Kevin Park)\n• JIRA-4562 — Plugin sandbox file system isolation (High, assigned to Alex Morgan)\n\nBoth are In Progress. Would you like more details on either?', time: '11:00 AM' },
    { id: 3, senderId: 'me', text: 'What\'s the status on JIRA-4555? Any recent updates?', time: '11:05 AM' },
    { id: 4, senderId: 4, text: 'JIRA-4555 — Last updated 2 hours ago by Kevin Park:\n\n"Found the root cause. The refresh token is being invalidated during the handoff context switch. Working on a fix that preserves the token across agent boundaries. ETA: end of day tomorrow."\n\nThere are 5 comments and 1 linked PR (draft).', time: '11:05 AM' },
  ],
  's4-3': [
    { id: 1, senderId: 4, text: 'JIRA-4521 has been assigned to you: "Implement notification preference API endpoints"', time: '2:15 PM' },
    { id: 2, senderId: 'me', text: 'What\'s the full description and acceptance criteria?', time: '2:18 PM' },
    { id: 3, senderId: 4, text: 'JIRA-4521 — Implement notification preference API endpoints\n\nDescription: Build REST endpoints for managing user notification preferences across push, email, and in-app channels.\n\nAcceptance Criteria:\n• GET /preferences returns the full preference matrix\n• PUT /preferences updates individual channel × category toggles\n• POST /preferences/reset restores defaults\n• All endpoints require authentication\n• Changes emit a PreferenceUpdated event', time: '2:18 PM' },
    { id: 4, senderId: 'me', text: 'Who are the linked issues?', time: '2:22 PM' },
    { id: 5, senderId: 4, text: 'JIRA-4521 has 2 linked issues:\n\n• Blocks: JIRA-4530 — "Build notification preferences UI" (assigned to Sarah Chen, Not Started)\n• Related to: JIRA-4498 — "Fix rate limiting on webhook delivery" (assigned to you, In Progress)', time: '2:22 PM' },
  ],
  's4-4': [
    { id: 1, senderId: 'me', text: 'Give me a Sprint 13 retrospective summary', time: '5:00 PM' },
    { id: 2, senderId: 4, text: 'Sprint 13 Summary:\n\n• Velocity: 34 story points (target was 38)\n• Completed: 12 of 15 tickets\n• Carried over: 3 tickets (JIRA-4480, JIRA-4492, JIRA-4501)\n\nBy team member:\n• Alex Morgan: 10 pts completed, 0 carried over\n• Kevin Park: 8 pts completed, 1 carried over\n• Sarah Chen: 8 pts completed, 1 carried over\n• Olivia Martinez: 8 pts completed, 1 carried over', time: '5:01 PM' },
    { id: 3, senderId: 'me', text: 'What were the carryover tickets about?', time: '5:05 PM' },
    { id: 4, senderId: 4, text: '• JIRA-4480 — "Implement rate limiting dashboard" (Kevin, 5 pts) — blocked by backend API dependency\n• JIRA-4492 — "Accessibility audit for settings page" (Sarah, 3 pts) — needed additional screen reader testing\n• JIRA-4501 — "Webhook retry metrics" (Olivia, 3 pts) — deprioritized mid-sprint for a production incident', time: '5:06 PM' },
  ],
  's4-5': [
    { id: 1, senderId: 'me', text: 'Show me all P1 bugs in the webhook delivery module', time: '3:20 PM' },
    { id: 2, senderId: 4, text: 'Found 3 open P1 bugs in the webhook delivery module:\n\n• JIRA-4570 — "Webhooks silently failing for payloads over 1MB" (Unassigned)\n• JIRA-4573 — "Retry count not resetting after successful delivery" (Assigned to Olivia Martinez)\n• JIRA-4578 — "TLS handshake timeout not respecting configured value" (Assigned to you)', time: '3:20 PM' },
    { id: 3, senderId: 'me', text: 'Assign JIRA-4570 to me', time: '3:25 PM' },
    { id: 4, senderId: 4, text: 'Done. JIRA-4570 has been assigned to Alex Morgan. I\'ve also updated the status to In Progress. You now have 5 open tickets in Sprint 14.', time: '3:25 PM' },
  ],
  's4-6': [
    { id: 1, senderId: 'me', text: 'Are we ready to ship v2.3? Show me the release checklist status.', time: '10:00 AM' },
    { id: 2, senderId: 4, text: 'v2.3 Release Readiness:\n\n✅ All feature tickets: Done (8/8)\n✅ Bug fixes: Done (5/5)\n✅ QA sign-off: Approved\n⚠️ Documentation: 2 of 3 articles updated\n✅ Staging deployment: Verified\n✅ Load test: Passed (p99 < 200ms)\n\nOne documentation ticket is still In Review: JIRA-4510 — "Update API migration guide for v2.3"', time: '10:01 AM' },
    { id: 3, senderId: 'me', text: 'Who\'s working on that doc ticket?', time: '10:05 AM' },
    { id: 4, senderId: 4, text: 'JIRA-4510 is assigned to David Nguyen. Last updated 3 hours ago with comment: "PR is up, waiting for tech writer review." The PR has 1 approval, needs 1 more.', time: '10:05 AM' },
  ],
  's4-7': [
    { id: 1, senderId: 'me', text: 'What tickets are blocked by the auth token refresh work?', time: '2:45 PM' },
    { id: 2, senderId: 4, text: 'Found 4 tickets blocked by JIRA-4555 (Auth token refresh during agent handoff):\n\n• JIRA-4560 — "End-to-end agent handoff testing" (QA, assigned to Rachel Thompson)\n• JIRA-4563 — "Agent handoff analytics events" (Dev, assigned to James Kim)\n• JIRA-4567 — "Handoff UX polish and loading states" (Design, assigned to Sarah Chen)\n• JIRA-4571 — "Agent handoff documentation" (Docs, assigned to David Nguyen)', time: '2:46 PM' },
    { id: 3, senderId: 'me', text: 'When is the ETA for the auth fix?', time: '2:50 PM' },
    { id: 4, senderId: 4, text: 'Based on Kevin Park\'s latest update on JIRA-4555: "ETA is end of day April 18." If that holds, the blocked tickets can resume on April 19, giving 6 working days before the April 25 milestone.', time: '2:50 PM' },
  ],
}
