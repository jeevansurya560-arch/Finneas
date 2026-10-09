# Finneas — Technology Stack & Decisions

| | |
|---|---|
| **Version** | 1.0 (proposed) |
| **Last updated** | 2026-10-09 |
| **Status** | Draft for implementation |
| **Related** | [PRD](./PRD.md) · [SRS](./SRS.md) · [ARCHITECTURE](./ARCHITECTURE.md) · [SYSTEM_DESIGN](./SYSTEM_DESIGN.md) |

---

## 1. Decision summary

| Layer | Choice | Not chosen (and why, in short) |
|---|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS (SPA) | **Next.js** — excluded by project constraint; also unnecessary (see §6) |
| Frontend data | TanStack Query (REST/server state) + Zustand (socket/ephemeral state) + React Router | Redux — more boilerplate than a small app needs |
| Backend language/runtime | **Node.js ≥ 20 + TypeScript** | Python/FastAPI — viable, but weaker realtime ecosystem (see §2) |
| Backend framework | NestJS (modular monolith) | Express alone — no structure; microservices — unjustified |
| Realtime | Socket.IO (server + client) | Raw WebSocket, SSE, WebRTC (see §3) |
| Database | PostgreSQL + Prisma ORM | MongoDB — data is relational |
| Cache / presence / pub-sub | Redis (`ioredis`, `@socket.io/redis-adapter`) | In-memory only — breaks with >1 instance |
| Auth | Argon2id passwords, JWT access token + rotating refresh token (httpOnly cookie) | Sessions in DB only — workable, but JWT matches socket handshake |
| Validation | `class-validator` / `class-transformer` (API), shared TS types (`packages/shared`) | — |
| Testing | Vitest (web, shared), Jest *or* Vitest + `unplugin-swc` (API), Playwright (E2E), k6 or Artillery (load) | — |
| Infra | Docker + docker-compose (dev), GitHub Actions (CI) | Kubernetes — overkill |
| Observability | `nestjs-pino` structured logs, `/health` + `/ready` | Full APM stack — post-V1 |

---

## 2. Backend language decision: Node.js vs Python

**Decision: Node.js + NestJS (TypeScript).**

| Criterion | Node.js + NestJS | Python + FastAPI |
|---|---|---|
| Realtime ecosystem | Socket.IO is native to Node: rooms, acks, automatic reconnection, transport fallback, Redis adapter | `python-socketio` works but is a smaller ecosystem; raw Starlette WebSockets means hand-building rooms, acks and reconnect semantics |
| Concurrency model | Event loop; excellent for many idle connections. CPU-heavy work blocks it | `asyncio`; same hazard, and **any** blocking call (sync DB driver, CPU work) stalls every socket |
| Types shared with the browser | One language. Event names and payload types live in `packages/shared` and are imported by both apps | Types duplicated or generated from OpenAPI; WebSocket event contracts are not covered by OpenAPI |
| Existing repo | README, architecture doc and module plan already assume NestJS | Scaffolding would be redone |
| Learning curve | Steeper (TypeScript, NestJS DI/decorators) | Lower if Python/FastAPI is already known |
| Data/ML later | Needs a separate service | Native |
| Portfolio signal | Shows full-stack TypeScript breadth | Duplicates a Python skill set |

**Reasoning.** The hard part of Finneas is the realtime layer (presence, ordering, reconnection, synchronized timer). That is where Node's tooling is strongest. Python's main advantage is data/ML work, which V1 does not need.

**If Python is chosen instead** the equivalent stack is FastAPI + `python-socketio` (ASGI) + SQLAlchemy 2 (async) + Alembic + `redis-py` (asyncio) + Pydantic, served by Uvicorn. Consequences: no shared types package (generate TS types from OpenAPI and hand-maintain event types), and strict discipline to keep every I/O call async.

**Revisit trigger.** If ML/NLP features are added later (e.g., AI study summaries), add a **separate Python service** behind the API over internal HTTP. Do not rewrite the core.

---

## 3. Realtime transport decision

| Option | Verdict | Reason |
|---|---|---|
| **Socket.IO** | **Chosen** | Reconnection with backoff, rooms, acknowledgements, heartbeat, Redis adapter, WebSocket with HTTP long-polling fallback for restrictive networks |
| Raw WebSocket | Rejected | Would re-implement reconnection, rooms and acks |
| Server-Sent Events | Rejected | One-directional; client→server still needs REST; weaker fit for presence/timer commands |
| WebRTC data channels | Rejected for V1 | Needs signaling plus STUN/TURN infrastructure; unnecessary for text, links and a timer |
| Polling only | Rejected | Wasteful and laggy; kept only as Socket.IO's fallback |

**Transport policy.**
- Production (single API instance): allow `['websocket', 'polling']` so users on networks that block WebSockets still connect.
- Multiple instances: either enable sticky sessions at the load balancer, **or** restrict to `['websocket']`. Polling without stickiness breaks across instances.

---

## 4. Layer details

### Frontend (`apps/web`)
- **React 18 + TypeScript (strict) + Vite**: fast dev server, static build deployable to any CDN.
- **Tailwind CSS**: consistent design tokens for the "minimal, premium, calm" design goal.
- **TanStack Query**: caching, retries and pagination for REST data (rooms, history, resources).
- **Zustand**: holds socket connection state, presence, live timer state and message stream.
- **PWA (installable) — V1.1 Should-have**: manifest + service worker for home-screen install on phones. Real-time features still require a connection; do not promise offline chat.

### Backend (`apps/api`)
- **NestJS modules** per domain (`auth`, `rooms`, `invitations`, `chat`, `presence`, `resources`, `sessions`, `timer`, `insights`, `common`).
- **Prisma**: type-safe queries and migrations.
- **Passport JWT strategy** for REST; the same JWT verified in the Socket.IO handshake.
- **`@nestjs/throttler`** for rate limiting; **Helmet** for security headers; strict **CORS allowlist**.

### Data
- **PostgreSQL**: users, rooms, memberships, invitations, messages, resources, sessions (durable truth).
- **Redis**: presence (sorted sets), timer state (hashes + a running-timers sorted set), Socket.IO pub/sub adapter. Redis data is **reconstructible**; nothing irreplaceable lives only there.

### Tooling
TypeScript strict mode, ESLint, Prettier, Conventional Commits, GitHub Actions (lint → typecheck → unit → integration → E2E).

> **Known gotcha:** Vitest transpiles with esbuild, which does not emit decorator metadata, so NestJS dependency injection fails in Vitest unless you add `unplugin-swc`. Simplest option: use Jest (Nest default) for `apps/api`, Vitest for `apps/web` and `packages/shared`.

---

## 5. Cross-device and any-distance requirements → technology implications

| Requirement | Technical response |
|---|---|
| Works on phones, tablets, laptops | Responsive SPA (360 px+), touch targets ≥ 44 px, latest-2-versions of Chrome/Edge/Firefox/Safari, iOS Safari, Chrome Android; no native apps in V1 |
| Works near **and** far from the server (high RTT, 150–500 ms) | Optimistic UI + acks; server-authoritative timer using `endsAt` and a measured clock offset (so latency does not desynchronize the timer); no per-second server broadcasts |
| Flaky mobile networks | Automatic reconnect with exponential backoff and jitter; full state snapshot on every (re)join; idempotent message sends (`clientMsgId`) |
| Phones suspend background tabs | On `visibilitychange`/focus, force reconnect-and-resync; timer display is derived from `endsAt`, so it is correct after backgrounding |
| Restrictive college/corporate networks | WSS on port 443; HTTP long-polling fallback enabled |
| Users in many regions | Static assets on a CDN; API in **one** region closest to most users (e.g., an India or Singapore region if the host offers it). Multi-region realtime is out of scope: chat and a timer tolerate hundreds of ms of latency |

---

## 6. Explicitly not used

| Technology | Reason |
|---|---|
| **Next.js** | Project constraint. Also, Finneas is an authenticated app with no SEO need; SSR/RSC adds a second server runtime. A Vite SPA is sufficient, and Socket.IO needs a long-lived API server regardless |
| Microservices / Kafka / Kubernetes | A modular monolith serves small groups; split only when measurements require it |
| GraphQL | REST + socket events cover all V1 needs |
| Third-party chat SaaS | Defeats the purpose of building real-time skills |
| Native mobile apps | Responsive web/PWA covers "every device" for V1 |

---

## 7. Hosting topology (options — verify current limits and pricing before committing)

| Component | Requirement | Example options |
|---|---|---|
| Static web (SPA) | Global CDN | Netlify, Cloudflare Pages, Vercel (static hosting only) |
| API | Long-lived process (**not serverless**), WebSocket support, no aggressive sleeping | Render, Railway, Fly.io |
| PostgreSQL | Managed, backups | Neon, Supabase, host-provided |
| Redis | Managed, TCP, pub/sub support | Upstash, Redis Cloud, host-provided |

**Check before choosing:** free-tier sleep/cold-start behavior (a sleeping API makes realtime feel broken), connection limits, region availability and Redis pub/sub pricing model.

**Cookie note.** If web and API are on different registrable domains (e.g., `*.netlify.app` and `*.onrender.com`), the refresh cookie is cross-site and needs `SameSite=None; Secure` plus an Origin check on `/auth/refresh`. Preferred: a custom domain with `app.` and `api.` subdomains so the cookie is same-site.

---

## 8. When to revisit this document

- Concurrent connections consistently exceed what one instance handles (measured by load test).
- A feature needs ML/NLP (add a Python service).
- Hosting limits force a provider change.
- Any decision above is overturned: record it in the ADR table in `ARCHITECTURE.md`.
