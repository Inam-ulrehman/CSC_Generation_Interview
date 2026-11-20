# Claude Development Rules

## Quick Reference

```bash
npm run setup      # Check API key, then start Claude Code
npm start          # Run src/index.ts
npm run dev        # Run and restart on changes
npm test           # Run tests (vitest)
npm run typecheck  # Type check (tsc)
npm run check      # Typecheck + tests - run before saying a task is done
```

---

## Subagents & Skills

| Name | Type | Use when |
|------|------|----------|
| `api-tester` | subagent | An API endpoint/service was created or changed |
| `ui-tester` | subagent | A page/component was created or changed (uses the browser) |
| `code-reviewer` | subagent | Before saying any code task is done (read-only) |
| `/new-feature` | skill | Starting a new feature (Phase 1: PRD + TASKS) |
| `/api-endpoint` | skill | Adding or changing an API endpoint |
| `/verify` | skill | Finishing a feature - runs check + testers in parallel + review |

---

## File Editing

**Use the Edit tool (Write for new files) for all edits.** Read the file first, then Edit.

- No `sed` / shell heredocs on code - they mangle template literals, `${}` and apostrophes.
- A Node script only for one identical change across many files (normalise `\r\n` first).
- "File has not been read yet" is not a bug: do a full `Read` of the file, then Edit.

---

## Project Planning Structure (CRITICAL)

### Always maintain these folders in the root directory:

```
project/
├── _plan/                       # Feature planning
│   └── feature-name/
│       ├── PRD.md               # Product Requirements Document
│       ├── TASKS.md             # Task list with checkboxes
│       └── docs/                # Feature-specific documentation
│
├── _test/                       # Tests by feature
│   └── feature-name/
│       ├── feature-name.test.ts
│       └── fixtures/            # Test data/mocks
│
├── _docs/                       # Global documentation
│   ├── INDEX.md                 # Entry point - links to everything
│   ├── CONVENTIONS.md           # Code standards
│   ├── features/                # Links to feature docs
│   └── guides/                  # How-to guides
│
└── .claude/                     # Claude settings + skills
```

### Before Starting a New Feature

1. Create folder: `_plan/{feature-name}/`
2. Write PRD: `_plan/{feature-name}/PRD.md`
3. Create task list: `_plan/{feature-name}/TASKS.md`
4. Create docs folder: `_plan/{feature-name}/docs/`
5. **Get approval before implementation**

### Two-Phase Planning Workflow (IMPORTANT)

| Phase | Purpose | Use Plan Mode? |
|-------|---------|----------------|
| **Phase 1: Requirements** | Create PRD & TASKS | **NO** - just create the docs |
| **Phase 2: Implementation** | Design how to build it | **YES** - enter plan mode |

```
User: "Add dark mode feature"
        ↓
PHASE 1: Requirements (NO plan mode)
  1. Create _plan/dark-mode/PRD.md
  2. Create _plan/dark-mode/TASKS.md
  3. Show user for approval
        ↓
User: "Looks good, proceed"
        ↓
PHASE 2: Implementation (USE plan mode)
  1. Enter plan mode
  2. Explore codebase
  3. Design technical approach
  4. Write plan to file
  5. Exit plan mode for approval
        ↓
User: "Approved"
        ↓
PHASE 3: Coding
  1. Implement according to plan
  2. Update TASKS.md as you go
  3. Create tests in _test/
  4. Run `npm run check` before reporting done
  5. UI features: verify in the browser (see UI Testing)
```

- **PRD/TASKS** = "What should we build?" (requirements)
- **Plan Mode** = "How will we build it?" (technical design)

### PRD.md Template

```markdown
# Feature Name - Product Requirements Document

## Overview
Brief description of the feature.

## Goals & Objectives
1. Goal 1

## User Stories
1. As a user, I can...

## Technical Requirements
- Requirement 1

## Success Metrics
- [ ] Metric 1

## Out of Scope
- What this feature does NOT include

## Dependencies
- Existing systems this depends on
```

### TASKS.md Template

```markdown
# Feature Name - Task List

## Phase 1: Setup
- [ ] Task 1
- [x] Completed task

## Phase 2: Implementation
- [ ] Task 2

## Phase 3: Testing
- [ ] Write tests
- [ ] Manual testing

---

| Component | Status | Notes |
|-----------|--------|-------|
| Backend   | In Progress | ... |
| Frontend  | Not Started | ... |
```

### Testing Rules

1. **NEVER** put tests outside `_test/` folder
2. **ALWAYS** create feature folder before adding tests
3. **ALWAYS** name test files to match: `{feature}.test.ts`
4. **Group related tests** in the same feature folder
5. **Use fixtures/** for mock data
6. **ALWAYS** run `npm run check` (typecheck + tests) before saying a task is done

### UI Testing (Browser)

Passing tests is not enough for UI work. After `npm run check` passes, use the
browser (Claude in Chrome) to check the feature in the running app:

1. **Looks right** - open the page, take a screenshot, check layout, text and states
   (loading, empty, error).
2. **Works** - click through the feature like a user would.
3. **Data flows correctly** - check the network requests: right endpoint, right
   request body, expected status code and response data.
4. **No errors** - check the browser console for errors and warnings.

Report what was checked. If something can't be verified in the browser, say so.

### Documentation Relationship

| Folder | Scope | Purpose |
|--------|-------|---------|
| `_docs/` | **Global** | Big picture, system-wide docs |
| `_plan/{feature}/docs/` | **Feature** | Feature-specific implementation details |

**Rule**: Link from global docs to feature docs. Don't duplicate content.

---

## Code Guidelines

- **TypeScript strict mode** - no `any` unless there is a comment explaining why.
- **Document all patches**: When adding a fix, ALWAYS include a comment with:
  - Date of the fix (e.g., `FIX (2026-11-20):`)
  - What problem it solves
  - Why the previous code didn't work
  - Why the new code works

  ```typescript
  // FIX (2026-11-20): Changed from 60px to 100px bands
  // Problem: Name and preview are siblings with index="0" and index="1"
  // With 60px bands they land on different rows (bug)
  // With 100px bands they land on the same row (correct)
  ```

---

## Modular Code Structure (CRITICAL)

Small, focused modules are easier to read, modify, debug and test.

### File Size Limits

| File Type | Max Lines | When to Split |
|-----------|-----------|---------------|
| Route / handler files | **200** | Split by domain |
| Services | **300** | Split by responsibility |
| React Components | **250** | Extract sub-components |
| Utilities | **100** | One purpose per file |
| Data access | **200** | One table/entity per file |

### When to Split a File

- File exceeds the max lines for its type
- File handles more than one "thing" (e.g., auth AND chat)
- The file name needs "and" to describe it (e.g., `authAndChat.ts`)

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Routes / handlers | lowercase, noun | `matches.ts`, `chat.ts` |
| Services | camelCase + Service | `profileService.ts` |
| Components | PascalCase | `ChatMessage.tsx` |
| Utilities | camelCase | `dateUtils.ts` |
| Index files | Always `index.ts` | Re-exports only |

### Index File Pattern

```typescript
// src/services/ai/index.ts
export { generateReply } from "./client.js";
export { buildPrompt } from "./prompts.js";

// Usage elsewhere:
import { generateReply, buildPrompt } from "./services/ai/index.js";
```

### Signs You Need to Refactor

| Symptom | Solution |
|---------|----------|
| File > max lines | Split by responsibility |
| Long import list at top | Extract to sub-modules |
| Multiple "sections" with comments | Each section = new file |
| Copy-pasting between files | Extract to shared utility |
| Hard to name the file | It does too much - split it |

### New Feature Module Template

```
src/services/{feature}/
├── index.ts          # Exports public API
├── {feature}.ts      # Main logic
├── helpers.ts        # Internal helpers (if needed)
└── constants.ts      # Feature constants (if needed)

src/components/{Feature}/
├── {Feature}.tsx     # Main component
└── sub-components/   # If needed
```
