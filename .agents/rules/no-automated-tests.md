---
trigger: always_on
---

# No Automated Testing Rule

- **STRICT PROHIBITION**: NEVER run automated tests, browser testing subagents (`browser_subagent`), headless browser checks, test runners, or test servers unless the user explicitly asks to run them.
- Do not start background web servers or test suites on behalf of the user.
- Focus purely on implementing code changes, modifications, and answering user requests directly.
