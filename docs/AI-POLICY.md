# Simbioly — AI / OpenRouter Engineering Policy

## 1. Purpose

OpenRouter is an LLM gateway for Simbioly.

During MVP/development, the project uses free models only.

AI must remain isolated from core business logic.

## 2. API Key

The OpenRouter API key is server-only.

Never:

- place it in Next.js client code;
- place it in Vue client code;
- place it in Git;
- expose it through an API response;
- print it to logs;
- create a public environment variable containing it.

Required conceptual flow:

```text
Simbio / Dashboard
→ Express Backend
→ AI Service
→ OpenRouter
```

Never:

```text
Simbio
→ OpenRouter
```

## 3. Free Model Policy

Default:

```text
OPENROUTER_MODEL=openrouter/free
```

Do not assume a specific free model will always exist.

If a specific model is pinned, verify that it is still free before deployment.

Never silently switch to a paid model.

## 4. Credit Safety

Development API keys must use a credit limit of:

```text
$0.00
```

Credit limit and free-tier request quota are separate concepts.

The application must still implement its own request limits.

## 5. AI Use Cases

Allowed MVP AI use cases:

```text
Goal → Roadmap
Roadmap Adjustment
Learning Reflection
On-demand Simbi Assistant
```

Do not use AI for:

```text
Partner Search
Partner Matching
Distance Calculation
Progress Calculation
Reputation Calculation
Ordinary CRUD
Database Queries
```

## 6. Provider Abstraction

Required architecture:

```text
AI Use Case
→ LLMProvider
→ OpenRouterProvider
→ OpenRouter API
```

Business logic must request operations such as:

```text
generateRoadmap()
```

It must not directly request:

```text
openrouter/free
```

## 7. Configuration

Use environment variables:

```text
OPENROUTER_API_KEY=
OPENROUTER_MODEL=openrouter/free
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_TIMEOUT_MS=30000
OPENROUTER_MAX_RETRIES=2
```

Do not hard-code configuration.

## 8. Input Validation

Before sending user data to an LLM:

```text
User Input
→ Validation
→ Normalization
→ Prompt Builder
→ LLM
```

Apply:

- field validation;
- length limits;
- payload limits;
- allowed values;
- context limits.

## 9. Prompt Separation

Separate:

```text
Prompt Builder
LLM Service
OpenRouter Client
Response Parser
```

Do not place all four responsibilities in one controller.

## 10. Structured Output

AI-generated application data must be structured.

Conceptual roadmap:

```text
{
  title,
  description,
  milestones: [
    {
      title,
      description,
      order
    }
  ]
}
```

Treat all LLM output as untrusted input.

Required pipeline:

```text
LLM Response
→ Parse
→ Schema Validation
→ Business Validation
→ Application Result
→ Database
```

Never directly insert raw model output into the database.

## 11. Prompt Injection

Treat these as untrusted content:

- user text;
- database text;
- retrieved content;
- external API content.

Keep application instructions separate from user content.

Do not allow retrieved/user content to redefine application rules.

## 12. Privacy

Send only the minimum required user data to the model.

If a roadmap only needs:

```text
learning goal
skill level
```

do not send unrelated:

```text
private profile data
full history
private conversations
```

unless explicitly required.

## 13. Retry

Maximum retries:

```text
2
```

Use bounded retry and exponential backoff.

Retry only appropriate temporary failures.

Do not retry indefinitely.

Do not retry:

- invalid API key;
- invalid request;
- unsupported model;
- schema errors;
- credit-limit errors.

## 14. Rate Limiting

Application-level AI rate limiting is required.

Example policy:

```text
per-user AI request limit
```

The exact number should be configurable.

Never rely only on OpenRouter's quota.

If a request receives a quota/rate-limit failure:

```text
Stop retry
→ Map to AI_RATE_LIMITED
→ Return controlled error
```

## 15. Timeout

Every AI request must have a timeout.

Default development value:

```text
30000 ms
```

A timeout must become a controlled application error.

## 16. Error Categories

Use categories such as:

```text
AI_VALIDATION_ERROR
AI_RATE_LIMITED
AI_AUTHENTICATION_ERROR
AI_MODEL_UNAVAILABLE
AI_PROVIDER_ERROR
AI_TIMEOUT
AI_INVALID_RESPONSE
AI_UNKNOWN_ERROR
```

Frontend must never receive raw OpenRouter error payloads.

## 17. Logging

Safe metadata may include:

```text
requestId
feature
provider
model
latency
status
usage
errorCategory
```

Never log:

```text
API key
Authorization header
sensitive user data
```

## 18. Usage Monitoring

Monitor:

- request count;
- error rate;
- rate-limit events;
- latency;
- token usage where available;
- actual model used;
- quota.

When using a dynamic free router, do not assume every request uses the same model.

## 19. Testing

Unit tests must not consume OpenRouter quota.

Create:

```text
MockLLMProvider
```

Test:

- valid response;
- malformed response;
- empty response;
- timeout;
- rate limit;
- provider error;
- schema failure.

Business logic must be testable without a real LLM.

## 20. Cost Safety Principle

Use layered protection:

```text
$0 API credit limit
→ Free-model policy
→ Application rate limit
→ OpenRouter quota
→ Monitoring
```

If there is uncertainty about whether a request could create paid usage:

```text
DO NOT SEND
```

## 21. Source of Truth

Changing facts such as:

- free model availability;
- pricing;
- request limits;
- model capabilities;
- provider policies;

must be verified against current OpenRouter documentation before deployment.

This document is an engineering policy, not a guarantee that OpenRouter's free-tier terms remain unchanged.
