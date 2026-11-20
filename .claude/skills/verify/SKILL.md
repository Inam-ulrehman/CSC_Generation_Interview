---
name: verify
description: Final quality gate before saying work is done. Runs npm run check, then the api-tester and ui-tester subagents in parallel, then code-reviewer, and gives one combined pass/fail summary. Use when a feature or fix is finished, or when the user asks to verify, check, or test everything.
---

# Verify

## 1. Find what changed

List the files changed in this task and sort them into:
- **API** - routes, handlers, services, data access
- **UI** - pages, components, styles
- **Other** - config, scripts, docs

## 2. Fast check

Run `npm run check`. If it fails, fix the failures first and re-run.
Do not start the subagents until it passes.

## 3. Test in parallel

In a single message, launch the relevant subagents so they run at the same
time:
- `api-tester` - if any API files changed. Give it the endpoints and files.
- `ui-tester` - if any UI files changed. Give it the URL, the feature, and
  what the user should see.

Skip a tester only if nothing in its area changed, and say that you skipped it.

## 4. Review

After the testers finish, run `code-reviewer` on the changed files.

## 5. Summary

Report one table:

| Check | Result | Notes |
|-------|--------|-------|
| Typecheck + tests | pass/fail | counts |
| API tests | pass/fail/skipped | bugs found |
| UI check | pass/fail/skipped | bugs found |
| Code review | n critical / n major / n minor | top issues |

Then list anything that must be fixed before the work is done. Do not call
the work done while a critical or major issue is open, unless the user agrees.
