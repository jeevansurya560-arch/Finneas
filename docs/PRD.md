# Product Requirements Document — Finneas

> **Status:** V1 — In Development  
> **Last updated:** October 2026

---

## 1. Vision

Finneas is a private, real-time collaborative study platform built for small groups of people who study seriously together.

It is not a generic LMS, a Discord replacement, or an educational SaaS template.  
It is a focused tool: a digital study room where a small group of friends can gather, stay present, share resources, and study together — privately.

The quality target is a real consumer technology product. Every decision — design, engineering, UX — should reflect that.

---

## 2. Problem

Studying alone is easy to set up but hard to sustain.  
Studying together remotely is poorly solved.

Existing options:
- **Video calls** (Zoom, Google Meet): high overhead, camera fatigue, no built-in study structure
- **Chat apps** (Discord, Slack): built for communities, not intimate study groups
- **LMS tools** (Canvas, Moodle): institutional, not personal
- **Notion / Obsidian**: great for notes, not for real-time group study presence

There is no lightweight, private, real-time study room that feels like sitting at a library table with close friends.

Finneas fills that gap.

---

## 3. Target Users

**Primary:** University students in tight study groups (2–6 people) who already trust each other and want a shared digital space to study, not socialize.

**Characteristics:**
- Study seriously and intentionally
- Value focus and low distraction
- Already comfortable with modern software (GitHub, Figma, Notion)
- Do not want to manage a "community" or a "server" — just a private room

---

## 4. Core User Flow

```
User creates account
  → Creates a private study room
    → Invites specific friends via link or email
      → Friends join the room
        → Group studies together in real time
          → Members chat, share resources, run timers
            → Session ends, basic history is saved
```

---

## 5. V1 Features

These are the only features in scope for V1.

### 5.1 Authentication
- Email/password registration and login
- JWT-based session management
- Secure password hashing (bcrypt)

### 5.2 Private Study Rooms
- Users can create named private rooms
- Rooms are invisible to non-members
- Room owner manages membership

### 5.3 Room Invitations
- Owner generates an invitation link
- Invite link is time-limited and single-use
- Invited user must have an account to join

### 5.4 Real-Time Chat
- Text-based chat within a room
- Messages appear in real time via WebSocket
- Basic message history persisted in database

### 5.5 Online Presence
- Members can see who is currently in the room
- Simple online/offline status indicator

### 5.6 Resource Sharing
- Members can post links with an optional title and note
- Links are stored and visible to all room members

### 5.7 Study Sessions
- A room can have one active study session at a time
- Sessions have a start time and end time

### 5.8 Synchronized Study Timer
- Any member can start a shared Pomodoro-style timer
- Timer state is synced to all room members in real time
- Timer supports: start, pause, reset

### 5.9 Basic Session History
- Past sessions are listed with date, duration, and participant count
- No detailed per-message analytics

---

## 6. V1 Non-Goals

The following are explicitly out of scope for V1:

| Category | Excluded |
|---|---|
| AI / ML | AI tutoring, RAG, smart suggestions |
| Communication | Voice calls, video calls |
| Storage | File uploads, image sharing |
| Analytics | Productivity tracking, study streaks, detailed metrics |
| Infrastructure | Kubernetes, Kafka, Elasticsearch, microservices |
| API | GraphQL |
| Features | Public rooms, community features, discovery |

These may be revisited in a future version. They will not influence V1 architecture decisions.

---

## 7. Design Principles

These principles apply to every design and engineering decision in Finneas.

**Minimal.** Every element must earn its place. If it doesn't serve the user's ability to study, it does not ship.

**Premium.** Finneas should feel like a carefully made tool, not a side project. Typography, spacing, motion, and interaction quality matter.

**Human.** The interface should feel warm and personal, not corporate or sterile. Small groups studying together is an intimate thing.

**Technical.** The engineering should be clean, typed, tested, and structured — reflecting the quality of the people using it.

**Calm.** Finneas should reduce friction, not add it. Notifications, alerts, and interruptions should be minimal and intentional.

---

## 8. Future Possibilities

These are directions Finneas could explore beyond V1. They are documented here for awareness, not commitment.

- AI study assistance (not LLM chatbot — context-aware session summaries, smart resource tagging)
- Collaborative notes within a room
- Voice presence (optional, lightweight — not a video call)
- Study streaks and personal habit tracking
- Mobile application
- Spaced repetition integration

---

*This document is a living specification. It will evolve as V1 is built and validated.*
