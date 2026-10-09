# Finneas — Product Requirements Document (PRD)

| | |
|---|---|
| **Version** | 1.0 (draft) |
| **Last updated** | 2026-10-09 |
| **Status** | V1 — In Development |
| **Related** | [SRS](./SRS.md) · [TECH_STACK](./TECH_STACK.md) · [ARCHITECTURE](./ARCHITECTURE.md) · [SYSTEM_DESIGN](./SYSTEM_DESIGN.md) |

> If a `docs/PRD.md` already exists in the repo, diff this draft against it and merge rather than overwrite.

---

## 1. Vision

Finneas is a **private, real-time study room for small groups**: a reserved table at a quiet library, shared with the people you study with. It is not a social network, a classroom or a Discord server. It is a calm place to be present and focused together, whether your partners are in the next room or another city.

## 2. Problem

Students who study together remotely stitch together a video call, a chat app, a shared timer and scattered links. The result is context switching, notification noise, and no shared sense of "we are studying right now." Existing tools are either too broad (chat servers, classrooms) or solo-only (timer apps).

## 3. Target users

| Persona | Description | Needs |
|---|---|---|
| **Exam-prep group** | 3–6 college students preparing for the same exams, usually phones + laptops | Private room, quick join, shared timer, a place for resources |
| **Long-distance study partners** | 2–4 friends in different cities/time zones | Reliable real-time sync over mobile data, visible presence, session log |

**Anti-persona (not for V1):** large communities, public study rooms, teachers running classes.

## 4. Goals and non-goals (V1)

**Goals**
1. A group can create a private room, invite others, and study together in under 2 minutes.
2. Chat, presence and the shared timer feel instant and stay in sync on phones and laptops, near or far.
3. The product feels minimal, calm and trustworthy.
4. The codebase demonstrates production-grade engineering (security, testing, real-time design).

**Non-goals (V1)**
Public rooms, video/voice, file uploads, notifications (push/email), shared notes or whiteboard, moderation tooling, native apps, social features (followers, feeds), AI features.

## 5. Principles

1. **Private by default** — rooms are invisible to non-members.
2. **Presence, not performance** — no leaderboards, no streak shaming.
3. **Calm UI** — few elements, no noisy badges, no unsolicited sounds.
4. **Reliability over features** — a missing feature is acceptable; a lost message or desynced timer is not.
5. **Design references:** Linear, Notion, Vercel, Figma — as quality benchmarks, not templates.

## 6. Scope

| ID | Feature | Priority | Description |
|---|---|---|---|
| F1 | Authentication | Must | Email/password; sessions via JWT access + refresh |
| F2 | Private rooms | Must | Named rooms, members only, owner role |
| F3 | Room invitations | Must | Time-limited invite link with a use limit |
| F4 | Real-time chat | Must | Text messages synced instantly, history persisted |
| F5 | Online presence | Must | See who is currently in the room |
| F6 | Synchronized timer | Must | Shared Pomodoro-style timer controlled by any member |
| F7 | Study sessions + history | Must | Session recorded per focus interval; basic history |
| F8 | Resource sharing | Should | Post links with title and note |
| F9 | Study insights | Should | Focus minutes per day, streak, member contribution |
| F10 | PWA install | Could (V1.1) | Home-screen install on phones |
| F11 | Password reset / email verification | Could (V1.1) | Needs an email provider |

## 7. User stories and acceptance criteria

| # | Story | Acceptance criteria |
|---|---|---|
| US1 | As a student, I register and log in so my rooms are mine. | Given valid details, when I register, then I land in my (empty) room list. Wrong credentials show a generic error. |
| US2 | As a user, I create a private room. | Given I am logged in, when I create "Calculus Finals", then I am its owner and it appears only in my list. |
| US3 | As an owner, I invite friends by link. | Given I generate an invite, then the link expires after the chosen time or use count and I can revoke it. |
| US4 | As an invitee, I join via the link. | Given a valid link and an account, when I open it, then I become a member. If logged out, I log in and return to the invite. Expired/revoked/exhausted links show a clear message. |
| US5 | As a member, I chat in real time. | Given two members online, when one sends a message, then the other sees it without refreshing, in the same order for everyone. |
| US6 | As a member, I see who is online. | Presence updates within seconds of join/leave; closing one of several tabs does not mark me offline. |
| US7 | As a member, I start a shared timer. | When any member starts 25 minutes, then every member's countdown matches within about 1 second, including late joiners and phones that were backgrounded. |
| US8 | As a member, I share a resource. | Given a URL, title and optional note, then all members see it immediately and it persists. |
| US9 | As a member, I review past sessions. | The history shows date, duration and participants for completed sessions. |
| US10 | As a user on a flaky network, I keep working. | When my connection drops and returns, then the app reconnects automatically and shows the missed messages and current timer without a manual refresh. |

## 8. Key user flows

1. **Create and invite:** Register → Create room → Generate invite → Share link.
2. **Join:** Open link → (Login/Register) → Room opens with presence, history and timer snapshot.
3. **Study:** Anyone starts the timer → focus phase → timer ends with a visual cue → optional break → session logged.
4. **Return:** Login → Room list → Open room → see latest chat, resources and session history.

## 9. Success metrics (proposed targets; validate with real users)

| Metric | Target for beta |
|---|---|
| Real study groups using Finneas (beta) | ≥ 3 groups, each completing ≥ 3 sessions |
| Rooms with ≥ 2 members within 24 h of creation | ≥ 60 % |
| Chat messages delivered without manual refresh | ≥ 99 % of sent messages in load/E2E tests |
| Timer drift across clients | ≤ 1 s in E2E tests with skewed clocks |
| Reconnect success after a network drop | Automatic, no reload, in 100 % of E2E reconnect tests |

These are targets, not measurements. Replace with observed values after beta.

## 10. Release plan (V1 = 8 weeks)

| Weeks | Milestone |
|---|---|
| 1–2 | Foundation, authentication, first deploy of the skeleton |
| 3 | Rooms, membership, invitations |
| 4 | Real-time chat |
| 5 | Presence and Redis |
| 6 | Timer, sessions, resources, history |
| 7 | Insights, security hardening, E2E and load tests |
| 8 | Final deploy, documentation, demo, bug bash |

**Scope-cut order if behind:** session history → insights → resources → extra E2E tests → refresh-token rotation. Never cut: authorization guards, chat, presence, timer.

**V1.1 backlog (uncommitted):** password reset, email verification, PWA install, Google sign-in, notifications, shared notes, dark/light theme.

## 11. Risks

| Risk | Mitigation |
|---|---|
| Scope exceeds ~80–100 hours | Fixed cut order above; weekly "done when" criteria |
| Free hosting sleeps or blocks WebSockets | Deploy a skeleton in Week 2; check provider limits early |
| Timer desync across devices/regions | Server-authoritative `endsAt` + clock-offset sync, tested with skewed clocks |
| Mobile browsers suspend background tabs | Reconnect and resync on foreground; state snapshot on join |
| Security mistakes in private rooms | Membership check on every REST and socket operation; tests for non-member access |
| New stack (TypeScript/NestJS) slows delivery | Keep modules small; follow the weekly plan |

## 12. Open decisions

1. Who can create invites: owner only (current default) or any member?
2. Maximum room size: 8 members (current default).
3. Can ownership be transferred? (V1: no; the owner must delete the room.)
4. Account deletion in V1 or V1.1?
5. Should message editing/deleting exist in V1? (Default: no.)
