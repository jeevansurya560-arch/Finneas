# Finneas

> A private real-time collaborative study room for small groups.

**Status:** V1 — In Development

---

## What is Finneas?

Finneas is a focused digital study space for people who study seriously together.

Not a social network. Not a classroom. Not a Discord server.  
A private room — for you and your group — where you can be present, focused, and productive.

The closest physical analogy: **a reserved table at a quiet library, shared with your closest study partners.**

---

## V1 Features

| Feature | Description |
|---|---|
| **Authentication** | Email/password login with JWT sessions |
| **Private Study Rooms** | Create named, private rooms invisible to non-members |
| **Room Invitations** | Invite friends via a time-limited link |
| **Real-Time Chat** | Text chat synced instantly across all room members |
| **Online Presence** | See who's currently in the room |
| **Resource Sharing** | Post links with titles and notes for the group |
| **Study Sessions** | Track when the group is actively studying |
| **Synchronized Timer** | Shared Pomodoro-style timer controlled by any member |
| **Session History** | Basic log of past sessions with date and duration |

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS |
| **Backend** | Node.js + NestJS + TypeScript |
| **Database** | PostgreSQL + Prisma ORM |
| **Cache / Pub-Sub** | Redis |
| **Real-Time** | Socket.IO |
| **Unit Testing** | Vitest |
| **E2E Testing** | Playwright |
| **Infrastructure** | Docker + docker-compose |

---

## Architecture

```
┌──────────────────────────────┐
│     Browser (React / Vite)   │
└────────────┬─────────────────┘
             │ REST + WebSocket (Socket.IO)
             ▼
┌──────────────────────────────┐
│    API Server (NestJS)       │
└──────┬───────────────────────┘
       │               │
       ▼               ▼
┌──────────┐    ┌──────────────┐
│PostgreSQL│    │    Redis     │
└──────────┘    └──────────────┘
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for full detail.

---

## Project Structure

```
finneas/
├── apps/
│   ├── web/          ← React + Vite frontend
│   └── api/          ← NestJS backend
├── packages/
│   └── shared/       ← Shared TypeScript types and utilities
├── docs/
│   ├── PRD.md        ← Product requirements document
│   └── ARCHITECTURE.md
├── tests/            ← End-to-end tests (Playwright)
├── docker/           ← Docker configuration
├── .env.example      ← Environment variable template
├── package.json      ← npm workspaces root
└── README.md
```

---

## Getting Started

> Setup instructions will be added as the project is built.

Prerequisites (coming soon):
- Node.js ≥ 20
- PostgreSQL
- Redis
- Docker (optional)

---

## Documentation

- [`docs/PRD.md`](docs/PRD.md) — Product vision, scope, and design principles
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — Technical architecture and design decisions

---

## Design Philosophy

Finneas is built to feel **minimal, premium, human, technical, and calm.**

It takes quality references from products like Linear, Notion, Vercel, and Figma — not as templates to copy, but as evidence that software can be both functional and beautiful.

---

## License

MIT — see [`LICENSE`](LICENSE)
