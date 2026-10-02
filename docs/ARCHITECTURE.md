# Architecture — Finneas

> **Status:** Intended design — not yet implemented  
> **Last updated:** October 2026

---

## Overview

Finneas uses a straightforward client-server architecture. The stack is chosen for correctness, developer ergonomics, and long-term maintainability — not trend-chasing.

```
┌─────────────────────────────┐
│         Browser             │
│   React + TypeScript + Vite │
│        Tailwind CSS         │
└────────────┬────────────────┘
             │  REST API (HTTP)
             │  WebSocket (Socket.IO)
             ▼
┌─────────────────────────────┐
│        API Server           │
│    Node.js + NestJS         │
│    REST endpoints           │
│    WebSocket gateway        │
│    Auth (JWT)               │
└──────┬──────────────────────┘
       │              │
       ▼              ▼
┌──────────┐   ┌──────────────┐
│PostgreSQL│   │    Redis     │
│ Primary  │   │Session cache │
│ database │   │Pub/Sub for   │
│          │   │WS events     │
└──────────┘   └──────────────┘
```

---

## Layer Responsibilities

### Frontend — `apps/web`

**Technology:** React 18 + TypeScript + Vite + Tailwind CSS

**Responsibilities:**
- Render the user interface
- Manage client-side routing (React Router)
- Communicate with the API over REST for data fetching and mutations
- Maintain a WebSocket connection (Socket.IO client) for real-time updates
- Manage local UI state (React state / context / zustand — TBD)

**Key principle:** The frontend has no business logic. It renders data, collects user intent, and sends it to the API. All decisions happen server-side.

---

### API Server — `apps/api`

**Technology:** Node.js + NestJS + TypeScript

**Responsibilities:**
- Serve REST endpoints for all CRUD operations
- Handle authentication and authorization (JWT strategy via Passport.js)
- Expose a WebSocket gateway (Socket.IO) for real-time room events
- Validate all incoming data (class-validator + class-transformer)
- Orchestrate business logic (rooms, invitations, sessions, timers)
- Interface with PostgreSQL via Prisma ORM
- Interface with Redis for session caching and WebSocket pub/sub

**NestJS module structure (planned):**
```
src/
├── auth/          # Login, register, JWT strategy
├── users/         # User profiles
├── rooms/         # Room CRUD, membership
├── invitations/   # Invite link generation and validation
├── chat/          # Message persistence
├── presence/      # Online status tracking
├── resources/     # Shared links
├── sessions/      # Study session lifecycle
├── timer/         # Synchronized Pomodoro timer
└── common/        # Guards, decorators, interceptors
```

---

### Database — PostgreSQL

**Technology:** PostgreSQL + Prisma ORM

**Responsibilities:**
- Persist all durable application data
- Users, rooms, memberships, messages, resources, sessions

**Why PostgreSQL:**  
Relational data (users → rooms → memberships → messages) is a natural fit for a relational database. PostgreSQL is battle-tested, has excellent JSON support for future flexibility, and Prisma provides a type-safe query interface.

---

### Cache & Pub/Sub — Redis

**Technology:** Redis (via `ioredis`)

**Responsibilities:**
- Cache frequently accessed data (e.g., room member lists, online presence)
- Power WebSocket pub/sub: when a user sends a chat message, the API publishes it to Redis; all connected API instances consume it and broadcast to the correct Socket.IO room

**Why Redis:**  
Real-time presence and synchronized timers require low-latency shared state that does not belong in PostgreSQL. Redis provides this with sub-millisecond reads.

---

### Real-Time Communication

**Technology:** Socket.IO (server) + Socket.IO client (browser)

**Event model (planned):**

| Event | Direction | Purpose |
|---|---|---|
| `room:join` | client → server | User opens a study room |
| `room:leave` | client → server | User closes a study room |
| `presence:update` | server → clients | Member online/offline state changed |
| `chat:message` | client → server | User sends a chat message |
| `chat:message` | server → clients | New message broadcast to room |
| `timer:start` | client → server | Member starts the shared timer |
| `timer:tick` | server → clients | Timer state sync to all room members |
| `timer:stop` | client → server | Member stops the shared timer |

---

## Data Flow Examples

### Sending a Chat Message

```
User types message → Frontend
Frontend emits chat:message via Socket.IO
API WebSocket gateway receives event
API validates message, saves to PostgreSQL
API publishes event to Redis pub/sub
All connected API instances consume from Redis
Each API instance broadcasts to relevant Socket.IO room
All room members receive chat:message event in real time
```

### Starting the Study Timer

```
User clicks "Start Timer" → Frontend
Frontend emits timer:start via Socket.IO
API WebSocket gateway receives event
API sets timer state in Redis (start time, duration)
API begins broadcasting timer:tick every second
All room members receive synchronized timer state
```

---

## Monorepo Structure

```
finneas/
├── apps/
│   ├── web/          ← React + Vite frontend
│   └── api/          ← NestJS backend
│
├── packages/
│   └── shared/       ← Shared TypeScript types and utilities
│                       (consumed by both web and api)
│
├── docs/
│   ├── PRD.md        ← Product requirements
│   └── ARCHITECTURE.md ← This file
│
├── tests/            ← End-to-end tests (Playwright)
├── docker/           ← Docker and docker-compose configs
│
├── .env.example      ← Environment variable template
├── .gitignore
├── package.json      ← npm workspaces root
├── README.md
└── LICENSE
```

---

## Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Monorepo tool | npm workspaces | Simple, no extra tooling required |
| API framework | NestJS | Opinionated structure, DI, TypeScript-first |
| ORM | Prisma | Type-safe, excellent migrations |
| Real-time | Socket.IO | Mature, reliable, handles reconnection |
| Styling | Tailwind CSS | Utility-first, consistent design system |
| Testing (unit) | Vitest | Fast, Vite-native, excellent TypeScript support |
| Testing (e2e) | Playwright | Industry standard, cross-browser |

---

*This document describes the intended architecture. Implementation follows in subsequent development days.*
