# Finneas — Software Requirements Specification (SRS)

| | |
|---|---|
| **Version** | 1.0 (draft) |
| **Last updated** | 2026-10-09 |
| **Format** | Modeled on IEEE 29148 (requirements use "shall") |
| **Related** | [PRD](./PRD.md) · [TECH_STACK](./TECH_STACK.md) · [ARCHITECTURE](./ARCHITECTURE.md) · [SYSTEM_DESIGN](./SYSTEM_DESIGN.md) |

Numeric values (limits, TTLs, performance figures) are **proposed defaults/targets** and are marked as such. Performance numbers are targets to be verified by load tests, not measurements.

---

## 1. Introduction

### 1.1 Purpose
This document specifies the functional and non-functional requirements of Finneas V1 so that design, implementation and testing can be traced to requirement IDs.

### 1.2 Scope
Finneas is a web application that lets small groups (2–8 people) study together in a private room with real-time chat, presence, shared resources and a synchronized Pomodoro timer. It runs in modern browsers on phones, tablets and computers. It does not include video/voice, file uploads, push notifications or native apps.

### 1.3 Definitions

| Term | Meaning |
|---|---|
| Room | A private study space with a member list |
| Member / Owner | A user belonging to a room / the member with administrative rights |
| Invitation | A time-limited, use-limited link that grants room membership |
| Presence | Whether a member currently has at least one live connection to a room |
| Timer | The room's shared countdown, with phases `focus` and `break` |
| Study session | A recorded focus interval |
| Snapshot | The state bundle sent when a client joins or reconnects to a room |
| RTT | Round-trip time between client and server |

### 1.4 References
`TECH_STACK.md`, `ARCHITECTURE.md`, `SYSTEM_DESIGN.md` (API and event contracts), OWASP ASVS (security reference), WCAG 2.1 AA.

---

## 2. Overall description

### 2.1 Product perspective
A client-server system: a React single-page application, a NestJS API (REST + Socket.IO), PostgreSQL and Redis. See `ARCHITECTURE.md`.

### 2.2 User classes

| Class | Description |
|---|---|
| Visitor | Not logged in; may register, log in, or open an invite link |
| Member | Authenticated user belonging to a room |
| Owner | Member who created the room; can rename, delete, invite, remove members |

### 2.3 Operating environment
Latest two major versions of Chrome, Edge, Firefox and Safari (macOS), iOS Safari and Chrome on Android; viewport widths 360–1920 px. Server: Linux container running Node.js ≥ 20.

### 2.4 Constraints
- C1. Next.js shall not be used.
- C2. The system shall run on free or low-cost hosting; the API host shall support long-lived connections.
- C3. V1 shall be deliverable by one developer in 8 weeks.
- C4. TypeScript shall be used across web, API and shared packages.

### 2.5 Assumptions and dependencies
- A1. Room size is at most 8 members (proposed default).
- A2. One API instance serves V1 production traffic; the design supports multiple instances.
- A3. Users have a modern browser with JavaScript enabled and a network connection (no offline chat).
- D1. Managed PostgreSQL and Redis are available.

---

## 3. Functional requirements

Priority: **M** = Must, **S** = Should, **C** = Could.

### 3.1 Authentication (F1)

| ID | Requirement | P |
|---|---|---|
| FR-AUTH-01 | The system shall let a visitor register with a unique email, a display name (2–40 chars) and a password (≥ 10 chars). | M |
| FR-AUTH-02 | The system shall hash passwords with Argon2id and shall never store or log plaintext passwords. | M |
| FR-AUTH-03 | On login the system shall issue a short-lived access token (proposed 15 min) and a refresh token (proposed 7 days) in an httpOnly, Secure cookie. | M |
| FR-AUTH-04 | The system shall rotate the refresh token on each use and revoke the token family if a used refresh token is replayed. | S |
| FR-AUTH-05 | Logout shall revoke the refresh token. | M |
| FR-AUTH-06 | Login and registration shall return generic errors that do not reveal whether an email exists. | M |

### 3.2 Rooms and membership (F2)

| ID | Requirement | P |
|---|---|---|
| FR-ROOM-01 | A user shall create a room with a name of 1–60 chars; the creator becomes owner. | M |
| FR-ROOM-02 | A user shall list the rooms they belong to. | M |
| FR-ROOM-03 | Non-members shall be unable to discover or read a room; the API shall respond 404 (not 403) for rooms the user does not belong to. | M |
| FR-ROOM-04 | The owner shall rename or delete the room; deletion removes all room data. | M |
| FR-ROOM-05 | A non-owner member shall be able to leave a room. | M |
| FR-ROOM-06 | The owner shall be able to remove a member; the removed member's live connections shall be closed. | S |
| FR-ROOM-07 | The system shall enforce the maximum room size (A1). | M |

### 3.3 Invitations (F3)

| ID | Requirement | P |
|---|---|---|
| FR-INV-01 | The owner shall generate an invite link with an expiry (1 h, 24 h or 7 d; default 24 h) and a maximum use count (default 10). | M |
| FR-INV-02 | Invite tokens shall contain ≥ 128 bits of randomness and be stored only as a hash. | M |
| FR-INV-03 | An authenticated user opening a valid invite shall become a member; a logged-out user shall be redirected to login/register and then returned to the invite. | M |
| FR-INV-04 | Expired, revoked, exhausted or invalid invites shall produce a clear error without leaking room details. | M |
| FR-INV-05 | The owner shall revoke an invite. | M |
| FR-INV-06 | Accepting an invite when already a member shall succeed without consuming a use. | S |

### 3.4 Chat (F4)

| ID | Requirement | P |
|---|---|---|
| FR-CHAT-01 | A member shall send a plain-text message of 1–2000 chars; all online members shall receive it in real time. | M |
| FR-CHAT-02 | Messages shall be persisted before being broadcast. | M |
| FR-CHAT-03 | On joining a room the client shall receive the latest 50 messages and be able to page older messages. | M |
| FR-CHAT-04 | All members shall observe messages in the same order. | M |
| FR-CHAT-05 | The sender shall see a pending state and a failure/retry state; retrying shall not create duplicates (idempotency via `clientMsgId`). | M |
| FR-CHAT-06 | Message bodies shall be treated as untrusted text: escaped on render, with links opened with `rel="noopener noreferrer"`. | M |
| FR-CHAT-07 | The system shall rate-limit message sending per user (proposed 20 messages / 10 s). | M |

### 3.5 Presence (F5)

| ID | Requirement | P |
|---|---|---|
| FR-PRES-01 | The room shall display which members are currently online. | M |
| FR-PRES-02 | A member with multiple tabs/devices shall be shown online until all of their connections have ended. | M |
| FR-PRES-03 | A member whose connection drops abruptly shall be shown offline within 45 s (proposed). | M |
| FR-PRES-04 | Presence shall be included in the join/reconnect snapshot. | M |

### 3.6 Resources (F8)

| ID | Requirement | P |
|---|---|---|
| FR-RES-01 | A member shall post a link with a title (≤ 120 chars) and optional note (≤ 500 chars); only `http` and `https` URLs shall be accepted. | S |
| FR-RES-02 | Resources shall be listed newest first and new ones pushed to online members in real time. | S |
| FR-RES-03 | The author or the owner shall delete a resource. | S |
| FR-RES-04 | The server shall not fetch posted URLs (no link previews in V1). | S |

### 3.7 Timer and sessions (F6, F7)

| ID | Requirement | P |
|---|---|---|
| FR-TMR-01 | Any member shall start a timer with a phase (`focus`/`break`) and duration of 1–120 min (default 25 focus / 5 break). | M |
| FR-TMR-02 | Any member shall pause, resume or stop the running timer. | M |
| FR-TMR-03 | All members' displayed remaining time shall agree within about 1 s regardless of RTT or device clock error (target). | M |
| FR-TMR-04 | A member joining or reconnecting shall receive the current timer state. | M |
| FR-TMR-05 | When the timer ends, all online members shall be notified with a visual cue; an audio cue shall be optional and only after user interaction. | M |
| FR-TMR-06 | Simultaneous control commands shall be resolved deterministically; stale commands shall be rejected. | M |
| FR-SES-01 | A study session record shall be created when a focus timer starts and closed when it completes or is stopped. | M |
| FR-SES-02 | Session duration shall exclude paused time. | M |
| FR-SES-03 | The room shall list past sessions with date, duration and participants. | M |
| FR-SES-04 | Orphaned sessions (e.g., after a server failure) shall be closed by a recovery job. | S |

### 3.8 Insights (F9)

| ID | Requirement | P |
|---|---|---|
| FR-INS-01 | The room shall show focus minutes per day for the last 30 days. | S |
| FR-INS-02 | The room shall show the current and longest group study streak (consecutive days with ≥ 1 session). | S |
| FR-INS-03 | The room shall show each member's share of total focus time. | S |

### 3.9 Account

| ID | Requirement | P |
|---|---|---|
| FR-USR-01 | A user shall view and update their display name. | S |
| FR-USR-02 | A user shall delete their account (their messages are anonymized). | C |

---

## 4. External interface requirements

- **User interface:** responsive SPA; keyboard-accessible; accessible names and `aria-live` regions for chat and timer updates.
- **HTTP/REST API and WebSocket events:** defined in `SYSTEM_DESIGN.md` §3–§4.
- **Database/cache:** PostgreSQL via Prisma; Redis via `ioredis` (`SYSTEM_DESIGN.md` §5).
- **Communication:** HTTPS and WSS only in production.

---

## 5. Non-functional requirements

### 5.1 Performance (targets, verify by load test)

| ID | Requirement |
|---|---|
| NFR-PERF-01 | For clients in the same region as the API and ≤ 200 concurrent connections, p95 time from server receipt of a message to delivery on the server side shall be ≤ 300 ms. |
| NFR-PERF-02 | REST read endpoints shall have p95 ≤ 300 ms under the same load. |
| NFR-PERF-03 | The initial route JavaScript shall be ≤ 250 KB gzipped. |
| NFR-PERF-04 | The server shall not run per-room per-second timers; timer traffic shall be proportional to state changes, not elapsed time. |

### 5.2 Reliability and resilience

| ID | Requirement |
|---|---|
| NFR-REL-01 | Clients shall reconnect automatically with exponential backoff and jitter (initial 1 s, cap 30 s). |
| NFR-REL-02 | No message acknowledged to the sender shall be lost. |
| NFR-REL-03 | After a server restart or network drop, clients shall recover without a manual reload and receive a snapshot. |
| NFR-REL-04 | Redis loss shall not corrupt durable data; timer/presence state shall be reconstructible and `/ready` shall report "degraded". |
| NFR-REL-05 | No formal availability SLA applies to V1 (free-tier hosting). |

### 5.3 Security

| ID | Requirement |
|---|---|
| NFR-SEC-01 | All traffic shall use TLS; HSTS shall be enabled in production. |
| NFR-SEC-02 | Every REST endpoint and socket event shall authenticate the caller and authorize room membership server-side; client-supplied `roomId` shall never be trusted. |
| NFR-SEC-03 | Inputs shall be validated by length, type and allow-list; queries shall be parameterized (Prisma). |
| NFR-SEC-04 | Authentication endpoints shall be rate-limited (proposed 10 requests/min/IP). |
| NFR-SEC-05 | CORS shall use an explicit origin allowlist; security headers shall be set (Helmet). |
| NFR-SEC-06 | Secrets shall come from environment variables and never be committed; CI shall run a dependency audit. |
| NFR-SEC-07 | Logs shall not contain passwords, tokens, or full message bodies. |

### 5.4 Compatibility ("every device, near or far")

| ID | Requirement |
|---|---|
| NFR-COMP-01 | The application shall function on the browsers and devices listed in §2.3. |
| NFR-COMP-02 | The application shall remain usable at RTT up to 500 ms and tolerate connection loss of up to 60 s with automatic resynchronization. |
| NFR-COMP-03 | On returning to the foreground after backgrounding, the client shall reconnect and resync within 3 s (target) when the network is available. |
| NFR-COMP-04 | The application shall connect on networks that block WebSockets by falling back to HTTP long-polling. |
| NFR-COMP-05 | Layouts shall support 360–1920 px widths with touch targets ≥ 44 px. |

### 5.5 Usability and accessibility
NFR-USE-01: Target WCAG 2.1 AA (contrast, focus order, labels). NFR-USE-02: A new user shall reach a working shared room in under 2 minutes (usability test with ≥ 3 people).

### 5.6 Maintainability and operability
- NFR-MNT-01: TypeScript strict mode; lint and typecheck in CI.
- NFR-MNT-02: Critical-path services shall have automated tests (target ≥ 70 % line coverage on server services).
- NFR-OPS-01: Structured JSON logs with request/connection IDs; `/health` (liveness) and `/ready` (DB + Redis) endpoints.
- NFR-OPS-02: Docker-based reproducible local setup via one command.
- NFR-OPS-03: Configuration via environment variables (twelve-factor).

### 5.7 Privacy and data
- NFR-PRV-01: Collected data is limited to email, display name, hashed password and user-generated content.
- NFR-PRV-02: No third-party analytics or trackers in V1.
- NFR-PRV-03: Deleting a room deletes its messages, resources and sessions.

---

## 6. Traceability

| Requirement group | Planned week | Primary verification |
|---|---|---|
| FR-AUTH, NFR-SEC-04/05 | 2 | Unit + integration tests |
| FR-ROOM, FR-INV | 3 | Integration tests (incl. non-member access → 404) |
| FR-CHAT | 4 | Integration + Playwright (two browser contexts) |
| FR-PRES, NFR-REL | 5 | Multi-instance manual test + Playwright reconnect test |
| FR-TMR, FR-SES, FR-RES | 6 | Playwright with skewed client clock; unit tests on state machine |
| FR-INS, NFR-PERF, NFR-SEC | 7 | SQL tests; k6/Artillery load test; security checklist |
| NFR-COMP, NFR-USE, NFR-OPS | 7–8 | Device checks (iOS Safari, Android Chrome), Lighthouse, README run-through |

## 7. Acceptance and definition of done (V1)

1. All **M** requirements implemented and verified by an automated test or a documented manual test.
2. A non-member cannot read or write any room resource (tests prove it for REST and sockets).
3. Two clients on different devices see synchronized chat, presence and timer, including after a forced disconnect.
4. A load test report with measured numbers is committed.
5. A stranger can clone the repo and run it from the README.
