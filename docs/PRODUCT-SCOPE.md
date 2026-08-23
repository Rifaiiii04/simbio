# Simbioly — Product Scope

## 1. Product Definition

Simbioly helps people grow through two connected experiences:

1. personal learning;
2. skill exchange between users.

The product must work even when the user has no partner yet.

This is important for cold-start.

## 2. MVP Features

### Pre-launch Waitlist

- capture user interest;
- store name, profession, and email;
- admin dashboard to view interested users.

### Authentication

- register;
- login;
- logout;
- password handling;
- authenticated session.

### User Profile

- name;
- profile image;
- bio;
- skills;
- teaching skills;
- learning skills;
- skill level;
- learning goal.

### Onboarding

Flow:

```text
Create Account
→ Can Teach
→ Want To Learn
→ Skill Level
→ Learning Goal
→ Generate Roadmap
→ Review Roadmap
→ Dashboard
```

### Roadmap

A roadmap contains:

- goal;
- milestones;
- milestone order;
- milestone status;
- optional descriptions;
- completion state.

AI creates the initial roadmap draft.

The user owns the final roadmap and can edit it.

### Weekly Commitment

Users can create a weekly set of learning tasks based on their roadmap.

The system tracks completion.

### Check-in

Users can report:

- completed;
- partially completed;
- stuck;
- skipped.

Users may add a short note.

Do not claim that check-in proves the user actually practiced.

### Progress

Progress is deterministic.

Example:

```text
completed milestones / total milestones
```

The exact progress formula must be centralized in the backend domain logic.

### Focus Session

MVP focus feature:

- Pomodoro timer;
- optional shared timer concept reserved for partnership phase.

Do not add audio/video calling in MVP.

### Discovery

Users can discover people by:

- skill;
- level;
- location/distance;
- other deterministic filters.

### Matching

Matching is algorithmic.

Potential factors:

- skills the current user wants to learn;
- skills the candidate can teach;
- skills the candidate wants to learn;
- skills the current user can teach;
- compatible skill levels;
- distance;
- optional availability.

Do not use AI for the core matching score.

### Skill Map

Users can discover nearby skill availability.

Free and premium radius limits may exist later.

For MVP, implement only the agreed radius behavior.

### Partnership

A partnership is created after users connect.

Partnership can contain:

- shared goals;
- shared roadmap references;
- tasks;
- progress;
- chat.

### Collaboration

Partners can create a small project/task collaboration.

Projects can later be displayed on profiles with contributors.

### Reputation

Reputation may include:

- consistency;
- communication;
- knowledge sharing;
- collaboration.

The score must be deterministic.

## 3. AI Features

Only these AI features are MVP candidates:

1. Goal → roadmap generation.
2. Roadmap adjustment.
3. Learning reflection.
4. On-demand Simbi assistant.

AI-powered matching is out of scope.

AI-powered search is out of scope.

AI-powered progress calculation is out of scope.

## 4. Non-MVP Features

Explicitly excluded:

- offline meetup;
- video calling;
- audio calling;
- meeting summarization;
- advanced gamification;
- group learning communities;
- mentor marketplace;
- paid coaching;
- AI matching;
- AI search;
- automatic skill verification.

## 5. Product Principle

The application should not feel like a generic AI chatbot.

The primary identity is:

**skill exchange + personal growth.**

AI supports that identity.

AI must not replace the human-to-human exchange model.
