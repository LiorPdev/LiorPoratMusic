# Project Guidelines & Rules

## Testing Policy
- **STRICT RULE**: NEVER run automated tests, browser test subagents (`browser_subagent`), headless browser checks, or automated verification servers/scripts unless the user explicitly asks to run them.
- Do NOT launch local servers (e.g., `http.server`) or automated browser sessions to test pages.
- Deliver code changes directly without automated testing rounds.
