# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.ts >> Cron Endpoint — Authorization >> cron endpoint accepts correct CRON_SECRET
- Location: tests\e2e.spec.ts:312:7

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected value: 404
Received array: [200, 500]
```

# Test source

```ts
  220 |     // Must be redirected to /login, not stuck in a loop
  221 |     const finalUrl = page.url();
  222 |     expect(finalUrl).toContain("/login");
  223 |     expect(finalUrl).not.toContain("/portal");
  224 | 
  225 |     await page.screenshot({
  226 |       path: path.join(SCREENSHOTS_DIR, "12-portal-redirect-to-login.png"),
  227 |     });
  228 |   });
  229 | 
  230 |   test("/login does not redirect back to /portal without a session (no loop)", async ({
  231 |     page,
  232 |   }) => {
  233 |     await page.goto(`${BASE_URL}/login`);
  234 |     await page.waitForLoadState("networkidle");
  235 | 
  236 |     // Should stay on /login, not redirect to /portal
  237 |     const finalUrl = page.url();
  238 |     expect(finalUrl).toContain("/login");
  239 | 
  240 |     await page.screenshot({
  241 |       path: path.join(SCREENSHOTS_DIR, "13-login-page-no-loop.png"),
  242 |     });
  243 |   });
  244 | 
  245 |   test("/admin redirects to / when accessed without admin session", async ({
  246 |     page,
  247 |   }) => {
  248 |     await page.goto(`${BASE_URL}/admin`);
  249 |     await page.waitForLoadState("networkidle");
  250 | 
  251 |     // Should be redirected away from admin
  252 |     const finalUrl = page.url();
  253 |     expect(finalUrl).not.toContain("/admin");
  254 | 
  255 |     await page.screenshot({
  256 |       path: path.join(SCREENSHOTS_DIR, "14-admin-auth-protection.png"),
  257 |     });
  258 |   });
  259 | 
  260 |   test("API /api/admin/* is protected (returns 302 or 401)", async ({
  261 |     page,
  262 |   }) => {
  263 |     // Attempt to hit admin API without auth
  264 |     const response = await page.request.post(`${BASE_URL}/api/admin/bookings/action`, {
  265 |       data: { booking_id: "fake-id", action: "confirm" },
  266 |       headers: { "Content-Type": "application/json" },
  267 |     });
  268 | 
  269 |     // Should be blocked — either 302 redirect or 401/403
  270 |     const isBlocked =
  271 |       response.status() === 302 ||
  272 |       response.status() === 401 ||
  273 |       response.status() === 403 ||
  274 |       // If middleware redirects, the page URL changes (not 200 with admin data)
  275 |       response.url().includes("/login") ||
  276 |       response.url() === `${BASE_URL}/`;
  277 | 
  278 |     console.log(
  279 |       `[Auth Test] /api/admin/bookings/action status: ${response.status()}, URL: ${response.url()}`
  280 |     );
  281 | 
  282 |     // The key thing: a non-admin CANNOT get a successful 200 response
  283 |     expect(response.status()).not.toBe(200);
  284 | 
  285 |     await page.screenshot({
  286 |       path: path.join(SCREENSHOTS_DIR, "15-api-admin-protected.png"),
  287 |     });
  288 |   });
  289 | });
  290 | 
  291 | // ────────────────────────────────────────────────────────────────────────────
  292 | // SUITE 5: Cron Endpoint Security
  293 | // ────────────────────────────────────────────────────────────────────────────
  294 | test.describe("Cron Endpoint — Authorization", () => {
  295 |   test("cron endpoint rejects requests without CRON_SECRET", async ({ page }) => {
  296 |     // No auth header → should get 401
  297 |     const response = await page.request.get(`${BASE_URL}/api/cron/reminders`);
  298 |     expect(response.status()).toBe(401);
  299 | 
  300 |     await page.screenshot({
  301 |       path: path.join(SCREENSHOTS_DIR, "16-cron-no-auth-rejected.png"),
  302 |     });
  303 |   });
  304 | 
  305 |   test("cron endpoint rejects wrong secret", async ({ page }) => {
  306 |     const response = await page.request.get(`${BASE_URL}/api/cron/reminders`, {
  307 |       headers: { Authorization: "Bearer wrong_secret" },
  308 |     });
  309 |     expect(response.status()).toBe(401);
  310 |   });
  311 | 
  312 |   test("cron endpoint accepts correct CRON_SECRET", async ({ page }) => {
  313 |     // Uses the test secret from .env.local
  314 |     const response = await page.request.get(`${BASE_URL}/api/cron/reminders`, {
  315 |       headers: {
  316 |         Authorization: `Bearer ${process.env.CRON_SECRET || "super_secret_cron_key_123"}`,
  317 |       },
  318 |     });
  319 |     // Should be 200 (even if no bookings to process)
> 320 |     expect([200, 500]).toContain(response.status()); // 500 only if DB not connected
      |                        ^ Error: expect(received).toContain(expected) // indexOf
  321 | 
  322 |     await page.screenshot({
  323 |       path: path.join(SCREENSHOTS_DIR, "17-cron-auth-accepted.png"),
  324 |     });
  325 |   });
  326 | });
  327 | 
  328 | // ────────────────────────────────────────────────────────────────────────────
  329 | // SUITE 6: Mobile Viewport (375px)
  330 | // ────────────────────────────────────────────────────────────────────────────
  331 | test.describe("Mobile Viewport — 375px", () => {
  332 |   test.use({ viewport: { width: 375, height: 667 } });
  333 | 
  334 |   test("homepage renders correctly at 375px", async ({ page }) => {
  335 |     await page.goto(BASE_URL);
  336 |     await page.waitForLoadState("networkidle");
  337 |     await page.waitForTimeout(1000);
  338 | 
  339 |     // Check for horizontal overflow
  340 |     const hasHorizontalOverflow = await page.evaluate(() => {
  341 |       return document.body.scrollWidth > window.innerWidth;
  342 |     });
  343 |     expect(hasHorizontalOverflow).toBe(false);
  344 | 
  345 |     await page.screenshot({
  346 |       path: path.join(SCREENSHOTS_DIR, "18-mobile-homepage-375.png"),
  347 |       fullPage: true,
  348 |     });
  349 |   });
  350 | 
  351 |   test("booking page renders correctly at 375px", async ({ page }) => {
  352 |     await page.goto(`${BASE_URL}/book`);
  353 |     await page.waitForLoadState("networkidle");
  354 |     await page.waitForTimeout(1000);
  355 | 
  356 |     const hasHorizontalOverflow = await page.evaluate(() => {
  357 |       return document.body.scrollWidth > window.innerWidth;
  358 |     });
  359 |     expect(hasHorizontalOverflow).toBe(false);
  360 | 
  361 |     await page.screenshot({
  362 |       path: path.join(SCREENSHOTS_DIR, "19-mobile-booking-375.png"),
  363 |       fullPage: true,
  364 |     });
  365 |   });
  366 | 
  367 |   test("login page renders correctly at 375px", async ({ page }) => {
  368 |     await page.goto(`${BASE_URL}/login`);
  369 |     await page.waitForLoadState("networkidle");
  370 | 
  371 |     await page.screenshot({
  372 |       path: path.join(SCREENSHOTS_DIR, "20-mobile-login-375.png"),
  373 |       fullPage: true,
  374 |     });
  375 |   });
  376 | });
  377 | 
  378 | // ────────────────────────────────────────────────────────────────────────────
  379 | // SUITE 7: Full Session Video Recording
  380 | // ────────────────────────────────────────────────────────────────────────────
  381 | test.describe("Session Video — Complete Booking Flow", () => {
  382 |   test("record full booking flow session as video proof", async ({ browser }) => {
  383 |     // Create context with video recording enabled
  384 |     const context = await browser.newContext({
  385 |       recordVideo: {
  386 |         dir: VIDEOS_DIR,
  387 |         size: { width: 1280, height: 720 },
  388 |       },
  389 |       viewport: { width: 1280, height: 720 },
  390 |     });
  391 | 
  392 |     const page = await context.newPage();
  393 | 
  394 |     try {
  395 |       // Step 1: Homepage
  396 |       await page.goto(BASE_URL);
  397 |       await page.waitForLoadState("networkidle");
  398 |       await page.waitForTimeout(2000);
  399 | 
  400 |       // Step 2: Navigate to booking
  401 |       const bookingLink = page
  402 |         .locator("a[href*='book'], a:has-text('Book'), a:has-text('Appointment')")
  403 |         .first();
  404 |       if (await bookingLink.isVisible().catch(() => false)) {
  405 |         await bookingLink.click();
  406 |         await page.waitForLoadState("networkidle");
  407 |         await page.waitForTimeout(1500);
  408 |       } else {
  409 |         await page.goto(`${BASE_URL}/book`);
  410 |         await page.waitForLoadState("networkidle");
  411 |         await page.waitForTimeout(1500);
  412 |       }
  413 | 
  414 |       // Step 3: Interact with calendar if present
  415 |       const slot = page
  416 |         .locator("button[data-available='true'], [class*='slot']:not([disabled])")
  417 |         .first();
  418 |       if (await slot.isVisible().catch(() => false)) {
  419 |         await slot.click();
  420 |         await page.waitForTimeout(1000);
```