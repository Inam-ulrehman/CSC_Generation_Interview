---
name: new-feature
description: Start a new feature (Phase 1 - requirements). Creates _plan/{feature}/ with PRD.md, TASKS.md and docs/ from the CLAUDE.md templates, then stops for approval. Use when the user asks to build or add a new feature.
---

# New Feature - Phase 1: Requirements

Do NOT use plan mode and do NOT write any code in this phase.

## Steps

1. Pick a short kebab-case feature name (e.g. `user-login`). If the request
   is unclear, ask up to 3 focused questions first (who uses it, what data,
   what "done" looks like).
2. Create:
   - `_plan/{feature}/PRD.md` - use the PRD template in CLAUDE.md
   - `_plan/{feature}/TASKS.md` - use the TASKS template in CLAUDE.md
   - `_plan/{feature}/docs/` - empty folder
3. In the PRD, be specific:
   - User stories for both UI and API sides if it's full stack
   - Technical requirements: endpoints (method + path + request/response
     shape), UI screens and states (loading, empty, error)
   - Success metrics that can be checked by a test or in the browser
   - A clear "Out of Scope" list
4. In TASKS.md, split work into Setup / Implementation / Testing. Include
   tasks for `api-tester`, `ui-tester` and `code-reviewer` checks.
5. Add a link to the feature in `_docs/INDEX.md`.
6. Show the user a short summary of the PRD and the task list, and ask for
   approval. **Stop here.** Phase 2 (plan mode) starts only after approval.
