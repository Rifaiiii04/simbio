# Simbioly Database Specification

> Status: Approved MVP Database Blueprint

This document is the source of truth for the initial Simbioly database domain model. It defines the intended structure; it does not authorize migration by itself.

## 1. Database

- MariaDB/MySQL-compatible database
- Prisma ORM 7.x
- Prisma MariaDB adapter: `@prisma/adapter-mariadb`
- Database: `simbioly`
- Host: `localhost`
- Port: `3306`

Frontend applications must never connect directly to MariaDB.

```text
Simbio (Next.js) ──REST──> Backend (Express) ──> Prisma ──> MariaDB
Dashboard (Vue)  ──REST──> Backend (Express)
```

## 2. Authentication

MVP authentication is **email + password only**.

Excluded for now:
- Google
- GitHub
- Apple
- OTP
- Phone authentication
- Magic links

Passwords use `bcryptjs` and are never stored as plaintext.

## 3. Approved MVP Models

Exactly these 19 models are approved:

1. `WaitlistEntry`
2. `User`
2. `SkillCategory`
3. `Skill`
4. `UserSkill`
5. `LearningGoal`
6. `Roadmap`
7. `Milestone`
8. `WeeklyCommitment`
9. `CheckIn`
10. `FocusSession`
11. `Partnership`
12. `Project`
13. `ProjectContributor`
14. `PartnershipReview`
15. `PartnershipAudioSession`
17. `UserReport`
18. `PartnershipTopic`
19. `PartnershipMessage`

Do not add speculative models.

## 4. User

```text
User
├── id
├── email
├── passwordHash
├── name
├── username
├── bio
├── avatarUrl
├── latitude
├── longitude
├── locationEnabled
├── role
├── country
├── isBanned
├── bannedAt
├── createdAt
└── updatedAt
```

Rules:
- `email` is unique.
- `username` is unique when present.
- `passwordHash` contains only a bcryptjs hash.
- Location is used for discovery/map functionality.
- Exact coordinates must not be unnecessarily exposed through public APIs.

## 5. SkillCategory

```text
SkillCategory
├── id
├── name
├── slug
└── createdAt
```

Examples: Technology, Music, Business, Design, Science, Language, Sports, Arts.

Categories organize skills; they do not restrict the skill domain.

## 6. Skill

```text
Skill
├── id
├── categoryId
├── name
├── slug
├── description
└── createdAt
```

Examples: React, Guitar, Digital Marketing, Mathematics, Photography, Physics, UI/UX Design.

Simbioly is not programming-only.

## 7. UserSkill

Many-to-many relationship between users and skills.

```text
UserSkill
├── id
├── userId
├── skillId
├── type
├── level
└── createdAt
```

`type`: `TEACH`, `LEARN`

`level`: `BEGINNER`, `INTERMEDIATE`, `ADVANCED`, `EXPERT`

## 8. LearningGoal

```text
LearningGoal
├── id
├── userId
├── skillId
├── title
├── description
├── targetOutcome
├── status
├── createdAt
└── updatedAt
```

`status`: `ACTIVE`, `COMPLETED`, `PAUSED`, `ARCHIVED`

## 9. Roadmap

A roadmap belongs to a learning goal.

```text
Roadmap
├── id
├── goalId
├── title
├── description
├── status
├── createdAt
└── updatedAt
```

AI may generate the initial draft. The user reviews and edits it; the user owns the final roadmap. AI must not silently overwrite it.

## 10. Milestone

```text
Milestone
├── id
├── roadmapId
├── title
├── description
├── order
├── status
├── createdAt
└── updatedAt
```

`status`: `TODO`, `IN_PROGRESS`, `COMPLETED`

Official progress is deterministic, e.g. completed milestones / total milestones. AI does not calculate official progress.

## 11. WeeklyCommitment

```text
WeeklyCommitment
├── id
├── userId
├── milestoneId
├── title
├── weekStart
├── weekEnd
├── status
├── createdAt
└── updatedAt
```

`status`: `PENDING`, `COMPLETED`, `SKIPPED`

## 12. CheckIn

```text
CheckIn
├── id
├── userId
├── milestoneId
├── commitmentId
├── status
├── note
└── createdAt
```

`status`: `COMPLETED`, `PARTIAL`, `STUCK`, `SKIPPED`

A check-in is reported progress, not verified real-world behavior.

## 13. FocusSession

```text
FocusSession
├── id
├── userId
├── milestoneId
├── startedAt
├── completedAt
├── duration
└── status
```

MVP is timer/focus-session only. No audio/video calls or meeting summaries.

A completed session is not proof that the user actually studied.

## 14. Partnership

Represents a skill-exchange relationship between two users.

```text
Partnership
├── id
├── requesterId
├── recipientId
├── status
├── createdAt
├── acceptedAt
└── updatedAt
```

`status`: `PENDING`, `ACCEPTED`, `REJECTED`, `ENDED`

A partnership connects exactly two users.

## 15. Project

Created within a partnership.

```text
Project
├── id
├── partnershipId
├── title
├── description
├── status
├── createdAt
└── updatedAt
```

`status`: `PLANNING`, `IN_PROGRESS`, `COMPLETED`, `ARCHIVED`

## 16. ProjectContributor

```text
ProjectContributor
├── id
├── projectId
├── userId
├── role
└── createdAt
```

Do not store contributors as comma-separated text or JSON.

## 17. PartnershipReview

```text
PartnershipReview
├── id
├── partnershipId
├── reviewerId
├── revieweeId
├── consistency
├── communication
├── knowledgeSharing
├── collaboration
├── comment
└── createdAt
```

Ratings are 1–5.

Official reputation is deterministic.

## 18. Reputation

There is intentionally no separate `Reputation` model in the initial MVP.

Reputation is derived from `PartnershipReview`.

Do not denormalize it into a separate table unless a concrete performance/scaling requirement appears.

## 19. Explicitly Excluded Models

Do not create these unless scope is explicitly changed:

```text
ChatMessage
AudioCall
VideoCall
OfflineMeetup
AIConversationHistory
Notification
Payment
Subscription
Gamification
Achievement
Community
Mentor
Booking
```

## 20. Relationship Overview

```text
User
├── UserSkill ──> Skill ──> SkillCategory
├── LearningGoal ──> Roadmap ──> Milestone
├── WeeklyCommitment
├── CheckIn
├── FocusSession
└── Partnership <──> User
      ├── Project ──> ProjectContributor <── User
      └── PartnershipReview
            ├── reviewer User
            └── reviewee User
```

## 21. Domain Order

### Phase 1
`User`, `SkillCategory`, `Skill`, `UserSkill`

### Phase 2
`LearningGoal`, `Roadmap`, `Milestone`, `WeeklyCommitment`, `CheckIn`, `FocusSession`

### Phase 3
`Partnership`

### Phase 4
`Project`, `ProjectContributor`

### Phase 5
`PartnershipReview`

## 22. Prisma Rules

Prisma is the source of truth for application database structure.

Do not manually create application tables in phpMyAdmin.

Required workflow:

```text
Requirement
→ Domain model
→ Relationships/constraints
→ schema.prisma
→ prisma validate
→ prisma generate
→ prisma migrate dev
→ MariaDB
```

phpMyAdmin is for inspection/debugging, not the source of truth.

Never run `prisma migrate reset`, `prisma db push`, DROP commands, or a migration without explicit approval.

## 23. AI Boundary

AI is used for:
- goal → roadmap;
- roadmap adjustment;
- learning reflection;
- on-demand Simbi assistant.

AI is not used for:
- partner matching;
- search;
- distance;
- progress;
- reputation;
- CRUD;
- database schema decisions.

## 24. Future Schema Changes

Before adding a new model:
1. confirm the feature is in product scope;
2. document why it is required;
3. update this document;
4. design relationships;
5. update `schema.prisma`;
6. review constraints/indexes;
7. create a Prisma migration.

The current initial model boundary is exactly the 14 models listed above.
