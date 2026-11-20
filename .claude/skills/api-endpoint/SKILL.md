---
name: api-endpoint
description: Steps for adding or changing an API endpoint - typed request/response, input validation, error handling, and tests via the api-tester subagent. Use when building or modifying an API route or handler.
---

# Add / Change an API Endpoint

## 1. Define the contract first

Write down before coding:
- Method + path (e.g. `POST /orders`)
- Request type (body, params, query) as a TypeScript type
- Response type for success, and the error responses (status + shape)

## 2. Structure (see Modular Code Structure in CLAUDE.md)

- Handler/route file: parse input -> call service -> return response. No
  business logic here. Max 200 lines.
- Service file: business logic, no HTTP details. Max 300 lines.
- Shared types in the feature folder, exported from `index.ts`.

## 3. Validate all input

- Never trust request data. Validate type, required fields, and limits
  before use. Return `400` with a clear message for bad input.
- Never put user input directly into queries, shell commands, or file paths.

## 4. Handle errors explicitly

- Use the right status: `400` bad input, `401`/`403` auth, `404` not found,
  `409` conflict, `500` unexpected.
- Never leak stack traces, secrets, or internal details in responses.
- Log the real error server-side.

## 5. Verify

1. Run `npm run check`.
2. Hand testing to the `api-tester` subagent with the endpoint, its contract,
   and the file paths.
3. If a UI uses this endpoint, also run the `ui-tester` subagent (or use
   `/verify` to run everything).
4. Update `_plan/{feature}/TASKS.md`.
