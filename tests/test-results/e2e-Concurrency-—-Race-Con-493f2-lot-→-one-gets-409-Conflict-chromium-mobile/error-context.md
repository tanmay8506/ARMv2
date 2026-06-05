# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.ts >> Concurrency — Race Condition Protection >> two sessions racing for the same slot → one gets 409 Conflict
- Location: tests\e2e.spec.ts:131:7

# Error details

```
Error: browserType.launch: Executable doesn't exist at C:\Users\lenovo\AppData\Local\ms-playwright\webkit-2287\Playwright.exe
╔════════════════════════════════════════════════════════════╗
║ Looks like Playwright was just installed or updated.       ║
║ Please run the following command to download new browsers: ║
║                                                            ║
║     npx playwright install                                 ║
║                                                            ║
║ <3 Playwright Team                                         ║
╚════════════════════════════════════════════════════════════╝
```