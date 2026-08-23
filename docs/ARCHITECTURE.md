# Simbioly — Architecture

## 1. High-Level Architecture

```text
                         ┌───────────────────┐
                         │      Simbio       │
                         │     Next.js       │
                         └─────────┬─────────┘
                                   │
                                   │ REST
                                   ▼
┌───────────────────┐      ┌───────────────────┐
│     Dashboard     │      │      Backend      │
│       Vue.js      │─────▶│ Express + Node.js │
└───────────────────┘ REST └─────────┬─────────┘
                                     │
                      ┌──────────────┼──────────────┐
                      │              │              │
                      ▼              ▼              ▼
                   MySQL        AI Service      Map/Geo
                                    │
                                    ▼
                               OpenRouter
```

## 2. Backend Responsibilities

Backend is the system of record for application behavior.

It owns:

- authentication;
- authorization;
- users;
- skills;
- goals;
- roadmaps;
- milestones;
- commitments;
- check-ins;
- progress;
- discovery;
- matching;
- partnerships;
- collaboration;
- reputation;
- AI orchestration.

## 3. Recommended Backend Structure

```text
Backend/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   ├── shared/
│   │   ├── errors/
│   │   ├── http/
│   │   ├── utils/
│   │   └── types/
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── skills/
│   │   ├── goals/
│   │   ├── roadmaps/
│   │   ├── commitments/
│   │   ├── checkins/
│   │   ├── discovery/
│   │   ├── partnerships/
│   │   ├── collaborations/
│   │   ├── reputation/
│   │   └── ai/
│   └── infrastructure/
│       ├── database/
│       ├── ai/
│       └── logging/
├── prisma/
└── tests/
```

Each module should own its domain behavior.

## 4. Backend Module Pattern

Use:

```text
module/
├── routes/
├── controller/
├── service/
├── repository/
├── validation/
├── types/
└── algorithms/
```

Not every module must contain every folder.

Create a folder only when the responsibility actually exists.

### Controller

HTTP boundary.

Should:

- read request;
- call validation;
- invoke use case/service;
- return HTTP response.

Controllers must not contain business logic.

### Service / Use Case

Business behavior.

Examples:

- create roadmap;
- complete milestone;
- calculate match score;
- create partnership.

### Repository

Database access.

Business logic should not contain raw Prisma queries everywhere.

### Validation

Validate external input before business logic.

## 5. Frontend Architecture

Both frontends consume REST APIs.

Recommended flow:

```text
Page
→ Feature Component
→ Hook/Composable
→ API Client
→ Express API
```

Do not put large API calls directly inside visual components.

## 6. Next.js Structure

Use App Router.

```text
Simbio/
├── src/
│   ├── app/
│   │   ├── (marketing)/
│   │   ├── (auth)/
│   │   └── (app)/
│   ├── components/
│   │   ├── ui/
│   │   └── shared/
│   ├── features/
│   │   ├── auth/
│   │   ├── onboarding/
│   │   ├── roadmap/
│   │   ├── discovery/
│   │   ├── partnership/
│   │   └── profile/
│   ├── lib/
│   │   ├── api/
│   │   └── utils/
│   ├── hooks/
│   └── types/
└── public/
```

Pages compose features.

Do not put complete feature implementations inside `app/**/page.tsx`.

## 7. Vue Dashboard Structure

```text
Dashboard/
├── src/
│   ├── router/
│   ├── stores/
│   ├── layouts/
│   ├── views/
│   ├── components/
│   │   ├── ui/
│   │   └── shared/
│   ├── features/
│   │   ├── users/
│   │   ├── skills/
│   │   ├── partnerships/
│   │   ├── reports/
│   │   └── ai-usage/
│   ├── composables/
│   ├── services/
│   ├── types/
│   └── utils/
```

Views compose feature components.

## 8. State Management

Server state:

- TanStack Query.

Client/UI state:

- React: local state first; use a dedicated store only when shared state is genuinely needed.
- Vue: Pinia for shared client state.

Do not duplicate server state into global stores without a reason.

## 9. Authentication Boundary

Authentication is a backend responsibility.

Recommended model:

```text
Frontend
→ POST /api/auth/login
→ Backend validates credentials
→ Backend creates session/token
→ Secure HttpOnly cookie
```

The exact session implementation must be finalized before coding authentication.

Do not store long-lived authentication secrets in localStorage unless there is an explicit architectural reason.

## 10. AI Boundary

```text
Feature Use Case
→ AI Application Service
→ LLM Provider Interface
→ OpenRouter Provider
→ OpenRouter
```

Business logic should request an operation such as:

```text
generateLearningRoadmap
```

It should not know:

```text
openrouter/free
```

## 11. Database Boundary

```text
Domain Service
→ Repository
→ Prisma
→ MySQL
```

Do not access Prisma directly from controllers.

## 12. No Premature Architecture

Do not introduce:

- microservices;
- message brokers;
- event buses;
- Kubernetes;
- GraphQL;
- Redis;
- separate AI service;
- separate search service;

unless a concrete requirement appears.

MVP should remain a modular monolith.
