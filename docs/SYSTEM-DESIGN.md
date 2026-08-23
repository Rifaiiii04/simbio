# Simbioly — System Design

## 1. Core Design Philosophy

Simbioly is a modular monolith.

The system is separated by domain, not by infrastructure complexity.

The main rule is:

> Keep deterministic product behavior in code and use AI only for generative/ambiguous tasks.

## 2. Core Domains

### Auth

Responsibilities:

- register;
- login;
- logout;
- session;
- password verification;
- authorization.

### Waitlist

Responsibilities:

- capture interested user emails;
- store basic user info (name, profession);
- prevent duplicates;
- dashboard list API.

### User

Responsibilities:

- profile;
- location;
- preferences;
- profile visibility.

### Skill

Responsibilities:

- skill records;
- skill categories;
- user skill relationships;
- teaching/learning status;
- level.

### Goal

Responsibilities:

- learning goal;
- target outcome;
- goal status.

### Roadmap

Responsibilities:

- roadmap;
- milestones;
- ordering;
- completion.

### Commitment

Responsibilities:

- weekly commitment;
- tasks;
- completion.

### Check-in

Responsibilities:

- progress report;
- status;
- note.

### Discovery

Responsibilities:

- skill search;
- people search;
- filters;
- distance.

### Matching

Responsibilities:

- deterministic compatibility score.

### Partnership

Responsibilities:

- connection;
- partnership status;
- shared learning context.

### Collaboration

Responsibilities:

- project/task;
- contributors;
- collaboration status.

### Reputation

Responsibilities:

- partner reviews;
- category scores;
- aggregate reputation.

### AI

Responsibilities:

- prompt construction;
- provider calls;
- response parsing;
- schema validation;
- AI-specific error mapping;
- usage metadata.

## 3. Matching Algorithm

Matching must not call an LLM.

Conceptual scoring:

```text
score =
  teachMatchWeight
+ learnMatchWeight
+ levelCompatibilityWeight
+ distanceWeight
+ availabilityWeight
```

The exact weights must be decided and tested separately.

Do not hard-code the weights inside controllers.

Create a dedicated matching algorithm module.

Example conceptual flow:

```text
Current User
→ Load teaching skills
→ Load learning skills
→ Candidate filtering
→ Candidate scoring
→ Sort by score
→ Return candidates
```

Candidate filtering should happen before scoring to avoid unnecessary database work.

## 4. Distance

Distance is deterministic.

Store location only when the product requires it and the user has provided permission/consent.

Do not use AI to calculate distance.

The map/discovery layer may use geospatial database queries or application-level distance calculations depending on the final database design.

## 5. Progress

Progress must be derived from stored application state.

Example:

```text
completed milestones
/
total milestones
```

The formula must be a pure domain function.

This makes it:

- predictable;
- testable;
- cheap;
- explainable.

## 6. Reputation

Reputation is calculated from structured partner feedback.

Example categories:

```text
consistency
communication
knowledgeSharing
collaboration
```

Do not let an LLM decide the numerical reputation score.

AI may later summarize feedback as an optional feature, but that is outside the core MVP.

## 7. Roadmap Generation

Roadmap generation is an AI use case.

Input should be minimal:

```text
learning goal
skill level
optional preferences
```

Output should be structured.

Conceptual contract:

```text
Roadmap
├── title
├── description
└── milestones[]
    ├── title
    ├── description
    └── order
```

The response must pass schema validation before being stored.

## 8. Roadmap Editing

After generation:

```text
AI Draft
→ Parse
→ Validate
→ Store
→ User Review
→ User Edit
→ Final Roadmap
```

The user owns the final roadmap.

## 9. AI Adjustment

AI is called only when explicitly requested or when a product rule says it is necessary.

Example:

```text
User:
"I am stuck on typography."

Backend:
Load only relevant roadmap context.

AI:
Suggest adjustment.

Backend:
Validate response.

User:
Accepts/rejects suggestion.
```

Do not regenerate the entire roadmap automatically after every progress event.

## 10. Check-in

Check-in is not proof of real-world behavior.

The system should store:

- declared status;
- declared note;
- timestamp;
- related milestone/task.

Do not claim:

```text
User definitely practiced for 45 minutes.
```

Instead:

```text
User reported completing the task.
```

## 11. Focus Session

MVP:

```text
Focus Session
→ Timer
→ Session completion
→ Optional related milestone
```

Do not create audio/video infrastructure for the first version.

## 12. Partnership Flow

```text
Discovery
→ View Profile
→ Connect
→ Pending
→ Accepted
→ Partnership
```

Partnership data must be independent from discovery results.

## 13. Collaboration Flow

```text
Partnership
→ Create Project
→ Add Tasks
→ Add Contributors
→ Track Status
→ Complete
```

Project contribution data can later become part of a user's public profile.

## 14. API Principle

REST endpoints represent resources and actions clearly.

Prefer:

```text
GET    /api/v1/roadmaps
POST   /api/v1/roadmaps
GET    /api/v1/roadmaps/:id
PATCH  /api/v1/roadmaps/:id
DELETE /api/v1/roadmaps/:id
```

For domain actions:

```text
POST /api/v1/milestones/:id/complete
POST /api/v1/partnerships/:id/accept
POST /api/v1/roadmaps/:id/generate-adjustment
```

Do not create vague endpoints such as:

```text
POST /api/doEverything
```

## 15. API Versioning

Use:

```text
/api/v1
```

from the beginning.

Do not add versioning per frontend.

Both Next.js and Vue consume the same API version.

## 16. Response Shape

Use a consistent response envelope.

Success:

```text
{
  "success": true,
  "data": ...
}
```

Error:

```text
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message"
  }
}
```

Exact implementation should be centralized.

## 17. Database

Use Prisma ORM with MySQL.

Do not create a database model for every UI component.

Database entities should represent domain concepts.

Avoid premature denormalization.

Use migrations for schema evolution.

## 18. Testing Strategy

Prioritize:

1. domain algorithms;
2. validation;
3. authentication;
4. authorization;
5. AI response parsing;
6. important API use cases.

AI calls should be mocked in unit tests.

Never spend free OpenRouter quota to run ordinary unit tests.
