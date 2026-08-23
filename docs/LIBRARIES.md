# Simbioly — Recommended Libraries

## 1. General Principle

Use libraries to remove repetitive infrastructure work, not to hide core business logic.

Prefer a small, predictable dependency set.

## 2. Shared Technology

### TypeScript

Use TypeScript in all three applications.

Reason:

- consistent types;
- better IDE support;
- safer refactoring;
- shared API contracts can be represented clearly.

### Zod

Use Zod for runtime validation at boundaries.

Good locations:

- Express request validation;
- environment validation;
- AI response validation;
- selected frontend form validation.

Do not use Zod as a replacement for business rules.

## 3. Next.js — Simbio

### Next.js

Use App Router.

Reason:

- current Next.js routing model;
- layouts;
- Server Components;
- modern project structure.

### Tailwind CSS

Use Tailwind for the primary styling system.

Keep custom CSS for cases where utility classes are insufficient.

### shadcn/ui

Recommended for reusable UI primitives if the design system remains compatible with the Simbioly Figma design.

Do not blindly use every component.

### TanStack Query

Use for server state:

- fetching;
- caching;
- mutations;
- invalidation.

Do not put all API data into a global state store.

### React Hook Form

Recommended for complex forms such as:

- registration;
- onboarding;
- goal setup;
- roadmap editing.

Use Zod for validation where useful.

### Lucide React

Recommended for consistent interface icons.

Do not use emoji as functional UI icons.

## 4. Vue — Dashboard

### Vue 3 + TypeScript

Use Composition API and `<script setup lang="ts">`.

### Vite

Use the official Vue/Vite setup.

### Vue Router

Use official Vue Router for dashboard routes.

### Pinia

Use Pinia only for shared client state.

Do not use Pinia as a replacement for server-state caching.

### TanStack Vue Query

Use for API/server state:

- queries;
- mutations;
- cache invalidation.

### Tailwind CSS

Use for dashboard styling if the visual system is custom.

### shadcn-vue

Optional.

Use it only if its component style fits the Simbioly dashboard.

Avoid mixing multiple UI component libraries.

### Lucide Vue Next

Recommended for icons if Lucide is used consistently.

## 5. Express — Backend

### Express

Use Express 5.

Use routers and middleware to separate concerns.

### Prisma ORM

Recommended for MySQL access.

Use repositories/services around Prisma.

Do not expose Prisma types directly as public API contracts.

### Zod

Use for:

- request validation;
- environment validation;
- AI output validation.

### Pino

Recommended for structured server logging.

Do not log secrets.

### Helmet

Recommended for HTTP security headers.

### CORS

Configure CORS explicitly for:

- Simbio origin;
- Dashboard origin.

Do not use unrestricted production CORS.

### bcryptjs

Recommended for password hashing (pure JS, cross-platform compatible).

Do not store plaintext passwords.

### Jose

Recommended if implementing JWT-based signing/encryption.

The final authentication/session design must be decided before implementation.

## 6. Libraries We Are NOT Adding Initially

Do not add without a concrete requirement:

- Redux;
- Zustand;
- GraphQL;
- Socket.IO;
- Redis;
- Elasticsearch;
- Kafka;
- RabbitMQ;
- NestJS;
- another ORM;
- another CSS framework;
- multiple UI component systems.

## 7. Library Selection Rule

Before adding a dependency:

1. identify the exact problem;
2. check whether the current stack already solves it;
3. check maintenance/activity;
4. check TypeScript support;
5. check bundle/server cost;
6. confirm that the dependency does not violate architecture.

## 8. Recommended Baseline

### Simbio

```text
Next.js
TypeScript
Tailwind CSS
shadcn/ui
TanStack Query
React Hook Form
Zod
Lucide
```

### Dashboard

```text
Vue
TypeScript
Vite
Vue Router
Pinia
TanStack Vue Query
Tailwind CSS
Zod
Lucide
```

### Backend

```text
Node.js
Express
TypeScript
Prisma
MySQL
Zod
Pino
Helmet
CORS
bcryptjs
Jose
```

Some libraries are optional until the feature that needs them is implemented.
