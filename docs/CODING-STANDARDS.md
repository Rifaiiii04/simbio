# Simbioly — Coding Standards

## 1. Language

Use TypeScript across:

- Express;
- Next.js;
- Vue.js.

Do not introduce JavaScript files for application logic unless a framework configuration requires it.

Strict TypeScript is required.

Avoid `any`.

If a third-party boundary is untyped, create a narrow type or validation boundary.

## 2. Naming

Use:

- `PascalCase` for React/Vue components;
- `camelCase` for functions and variables;
- `UPPER_SNAKE_CASE` only for true constants;
- descriptive filenames.

Prefer:

```text
RoadmapCard.tsx
useRoadmap.ts
roadmap-api.ts
roadmap.service.ts
```

Avoid:

```text
Stuff.tsx
Helper.ts
Common.ts
Utils2.ts
```

## 3. File Size

Hard maximum:

**500 lines per source file.**

Recommended split threshold:

**400 lines.**

This applies to:

- `.ts`;
- `.tsx`;
- `.vue`;
- `.css`;
- `.scss`.

Configuration files are exempt only when the file is generated or framework-controlled.

Do not artificially split a 100-line component into ten files.

The goal is cohesive modules, not tiny files.

## 4. React Components

A component should primarily render UI and coordinate local behavior.

Avoid putting:

- complex API logic;
- business algorithms;
- large data transformations;
- authentication logic;

inside JSX.

Prefer:

```text
Component
→ Hook
→ API Client
```

For complex features:

```text
Page
→ Feature Component
→ Presentational Components
```

## 5. Vue Components

Use:

```vue
<script setup lang="ts">
```

Prefer Composition API.

Keep views thin.

Move reusable behavior to composables.

Move shared server-state fetching to TanStack Vue Query.

## 6. API Clients

Create a centralized API client.

Do not scatter:

```text
fetch("http://localhost:...")
```

through components.

The API base URL must come from environment configuration.

## 7. Validation

Validate external data at boundaries.

Validate:

- HTTP request body;
- query parameters;
- route parameters;
- environment variables;
- AI output.

Zod is the recommended schema-validation library.

## 8. Error Handling

Use typed application errors.

Do not throw arbitrary strings.

Map internal errors to HTTP responses centrally.

Never expose:

- stack traces;
- SQL errors;
- provider raw errors;
- API keys;
- internal file paths.

## 9. Database Access

Repositories/services own Prisma access.

Controllers should not contain Prisma queries.

Do not load more columns/data than necessary.

Use pagination for potentially large lists.

## 10. Async Code

Use `async/await`.

Handle expected failures explicitly.

Do not create unbounded background loops.

## 11. Comments

Comments should explain why.

Bad:

```text
// increment i
```

Good:

```text
// Candidate filtering happens before scoring to avoid scoring users
// who cannot satisfy the required skill constraints.
```

Do not write comments that merely repeat the code.

## 12. UI Components

Build reusable primitives:

- Button;
- Input;
- Select;
- Modal;
- Dialog;
- Card;
- Badge;
- Avatar;
- Progress;
- EmptyState;
- LoadingState;
- ErrorState.

Then build domain components:

- SkillCard;
- RoadmapCard;
- PartnerCard;
- CommitmentCard;
- SimbiMessage.

Do not copy/paste identical UI between pages.

## 13. State

Use local state when state is local.

Use server-state libraries for server data.

Do not place every API response into a global store.

## 14. Accessibility

Interactive elements must be keyboard accessible.

Inputs need labels.

Buttons must have meaningful text or accessible labels.

Images require appropriate alternative text.

Do not rely solely on color to communicate state.

## 15. Loading and Error States

Every API-driven feature should consider:

```text
Loading
Success
Empty
Error
```

Do not assume data always exists.

## 16. Environment Variables

Never commit secrets.

Use:

```text
.env
.env.local
.env.development
.env.production
```

according to application needs.

Provide:

```text
.env.example
```

with placeholders only.

## 17. Git

Commit messages should describe the change.

Examples:

```text
feat(auth): add login API
feat(roadmap): add roadmap generation
fix(match): correct skill compatibility score
refactor(profile): split profile components
```

## 18. Dependencies

Before adding a package:

1. confirm it solves a real problem;
2. check whether an existing dependency already solves it;
3. prefer maintained, focused libraries;
4. avoid adding multiple libraries for the same responsibility.

## 19. Performance

Do not optimize blindly.

First avoid obvious problems:

- unnecessary API requests;
- unnecessary AI requests;
- N+1 database queries;
- large client bundles;
- duplicate state;
- unnecessary re-renders.

## 20. Architecture Discipline

A clean architecture is not:

```text
100 folders
```

A clean architecture is:

```text
clear responsibility
+
clear boundaries
+
predictable data flow
+
small cohesive files
```
