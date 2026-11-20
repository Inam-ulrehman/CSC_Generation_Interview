# CSC Generation

Barebones TypeScript project for the CSC interview.

## Setup

```bash
npm install
```

Optional: copy `.env.example` to `.env` and put the provided key in it.

## Commands

| Command             | What it does                                   |
| ------------------- | ---------------------------------------------- |
| `npm run setup`     | Check the API key, then start Claude Code      |
| `npm start`         | Run `src/index.ts`                             |
| `npm run dev`       | Run and restart on changes                     |
| `npm test`          | Run tests                                      |
| `npm run typecheck` | Check types                                    |
| `npm run check`     | Typecheck + tests                              |

## Structure

```
.claude/agents/   subagents: api-tester, ui-tester, code-reviewer
.claude/skills/   skills: /new-feature, /api-endpoint, /verify
_plan/            feature plans (PRD.md, TASKS.md)
_test/            tests, one folder per feature
_docs/            global documentation
scripts/          interview-setup.ts (API key check)
src/              app code
CLAUDE.md         rules for Claude Code
```
# CSC_Generation_Interview
