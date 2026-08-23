# Simbioly — Active API Contract

> **Status:** Up to date with backend router implementation.

This document serves as the exact reference for APIs that are **currently implemented and actively used** in the Express.js backend. 

All endpoints share the following base path:
```text
/api/v1
```

---

## 1. Authentication (`/auth`)
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout` (Requires Auth)
- `GET  /auth/me` (Requires Auth)

## 2. Users (`/users`)
- `GET   /users/check-username`
- `GET   /users/admin/analytics`
- `GET   /users/admin/ai-analytics`
- `GET   /users/admin/list`
- `GET   /users/me` (Requires Auth)
- `PATCH /users/me` (Requires Auth)
- `POST  /users/me/avatar` (Requires Auth)
- `PUT   /users/me/location` (Requires Auth)
- `GET   /users/:id` (Requires Auth)

## 3. Skills (`/skills`)
### Categories
- `GET    /skills/categories`
- `POST   /skills/categories` (Requires Auth)
- `PATCH  /skills/categories/:id` (Requires Auth)
- `DELETE /skills/categories/:id` (Requires Auth)

### Global Skills
- `GET    /skills`
- `POST   /skills` (Requires Auth)
- `GET    /skills/:id`
- `PATCH  /skills/:id` (Requires Auth)
- `DELETE /skills/:id` (Requires Auth)

### User Skills (My Skills)
- `GET    /skills/me/skills` (Requires Auth)
- `POST   /skills/me/skills` (Requires Auth)
- `PATCH  /skills/me/skills/:id` (Requires Auth)
- `DELETE /skills/me/skills/:id` (Requires Auth)

## 4. Discovery & Map (`/discovery`)
*(All require Auth)*
- `GET /discovery/people`
- `GET /discovery/matches`
- `GET /discovery/map`

## 5. Partnerships & Collaboration (`/partnerships`)
*(All require Auth)*
### Core
- `GET   /partnerships`
- `POST  /partnerships`
- `GET   /partnerships/notifications/summary`
- `GET   /partnerships/:id`
- `POST  /partnerships/:id/accept`
- `POST  /partnerships/:id/reject`
- `POST  /partnerships/:id/leave`
- `POST  /partnerships/:id/read`

### Messages
- `GET   /partnerships/:id/messages`
- `POST  /partnerships/:id/messages`

### Audio Sessions (Live Calling)
- `POST  /partnerships/:id/audio-sessions`
- `GET   /partnerships/:id/audio-sessions/current`
- `POST  /partnerships/audio-sessions/:sessionId/accept`
- `POST  /partnerships/audio-sessions/:sessionId/skip-prep`
- `POST  /partnerships/audio-sessions/:sessionId/reject`
- `POST  /partnerships/audio-sessions/:sessionId/leave`

### Topics (Mutual Roadmap)
- `GET    /partnerships/:id/topics`
- `POST   /partnerships/:id/topics`
- `POST   /partnerships/:id/topics/generate-ai`
- `POST   /partnerships/:id/topics/generate-proposal`
- `PUT    /partnerships/:id/topics/proposals/:messageId`
- `POST   /partnerships/:id/topics/proposals/:messageId/approve`
- `PATCH  /partnerships/topics/:topicId/toggle`
- `DELETE /partnerships/topics/:topicId`

## 6. Personal Roadmaps (`/roadmaps`)
*(All require Auth)*
- `GET    /roadmaps`
- `POST   /roadmaps`
- `GET    /roadmaps/:id`
- `PATCH  /roadmaps/:id`
- `DELETE /roadmaps/:id`

## 7. Milestones (`/milestones`)
*(All require Auth)*
- `GET    /milestones`
- `GET    /milestones/progress`
- `POST   /milestones`
- `GET    /milestones/:id`
- `PATCH  /milestones/:id`
- `POST   /milestones/:id/complete`
- `POST   /milestones/:id/uncomplete`
- `DELETE /milestones/:id`

## 8. Focus Sessions (Pomodoro) (`/focus-sessions`)
*(All require Auth)*
- `GET  /focus-sessions`
- `POST /focus-sessions`
- `POST /focus-sessions/:id/complete`
- `POST /focus-sessions/:id/abort`

## 9. Weekly Commitments (`/commitments`)
*(All require Auth)*
- `GET   /commitments`
- `GET   /commitments/current`
- `POST  /commitments`
- `PATCH /commitments/:id`

## 10. Check-ins (`/check-ins`)
*(All require Auth)*
- `GET  /check-ins`
- `POST /check-ins`

## 11. Learning Goals (`/learning-goals`)
*(All require Auth)*
- `GET    /learning-goals`
- `POST   /learning-goals`
- `GET    /learning-goals/:id`
- `PATCH  /learning-goals/:id`
- `DELETE /learning-goals/:id`

## 12. Projects (`/projects`)
*(All require Auth)*
- `GET   /projects`
- `POST  /projects`
- `GET   /projects/:id`
- `PATCH /projects/:id`
- `POST  /projects/:id/contributors`

## 13. Reviews & Reputation (`/reviews`)
*(All require Auth)*
- `POST /reviews`
- `GET  /reviews/reputation/me`
- `GET  /reviews/reputation/:userId`

## 14. Reports & Moderation (`/reports`)
*(All require Auth)*
- `POST   /reports`
- `GET    /reports/admin/list`
- `POST   /reports/admin/:id/resolve`
- `POST   /reports/admin/users/:userId/ban`
- `DELETE /reports/admin/users/:userId`

## 15. Waitlist (`/waitlist`)
- `GET  /waitlist`
- `POST /waitlist`

## 16. Health (`/health`)
- `GET /health`
