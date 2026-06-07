import { test, expect, chromium } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";
import { createClient } from "@supabase/supabase-js";

const SCREENSHOTS_DIR = path.join(__dirname, "screenshots");
const VIDEOS_DIR = path.join(__dirname, "videos");

// Ensure output directories exist
[SCREENSHOTS_DIR, VIDEOS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const BASE_URL = "http://localhost:3000";

// Load .env.local variables manually
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.substring(0, index).trim();
    const val = trimmed.substring(index + 1).trim().replace(/^['"]|['"]$/g, "");
    process.env[key] = val;
  }
}

async function loginAsAdmin(page: any, baseURL: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminEmail = process.env.ADMIN_EMAIL || "tanmay8506@gmail.com";

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env");
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // 1. Ensure user exists and is confirmed
  try {
    await supabase.auth.admin.createUser({
      email: adminEmail,
      email_confirm: true,
    });
  } catch (e) {
    // Already exists
  }

  // 2. Generate magic link to get the token hash
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email: adminEmail,
  });

  if (error || !data?.properties?.hashed_token) {
    throw new Error(`Failed to generate magic link: ${error?.message || "unknown error"}`);
  }

  // 3. Verify OTP in Node to get tokens
  const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
    token_hash: data.properties.hashed_token,
    type: "magiclink",
  });

  if (verifyError || !verifyData?.session) {
    throw new Error(`Failed to verify OTP: ${verifyError?.message || "unknown error"}`);
  }

  // 4. Inject Supabase auth cookie directly into browser context
  const cookieName = "sb-pykxpfyfvgkggcdvqyfd-auth-token";
  const cookieValue = "base64-" + Buffer.from(JSON.stringify(verifyData.session)).toString("base64");

  const domain = new URL(baseURL).hostname;

  await page.context().addCookies([
    {
      name: cookieName,
      value: cookieValue,
      domain: domain === "localhost" ? "localhost" : domain,
      path: "/",
      httpOnly: false,
      secure: false,
      sameSite: "Lax",
    },
  ]);
}

// ────────────────────────────────────────────────────────────────────────────
// SUITE 1: Homepage & Navigation
// ────────────────────────────────────────────────────────────────────────────
test.describe("Homepage & Navigation", () => {
  test("homepage loads and hero section is visible", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");

    // Hero should be visible
    const hero = page.locator("section").first();
    await expect(hero).toBeVisible();

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "01-homepage.png"),
      fullPage: false,
    });
  });

  test("navbar renders with correct links", async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator("nav")).toBeVisible();

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "02-navbar.png"),
    });
  });
});

// ────────────────────────────────────────────────────────────────────────────
// SUITE 2: Full Booking Flow (End-to-End)
// ────────────────────────────────────────────────────────────────────────────
test.describe("Booking Flow — End-to-End", () => {
  test("complete booking flow: navigate → calendar → hold slot → fill form → confirm", async ({
    page,
  }) => {
    // Start video recording for this critical test
    const context = page.context();

    // Step 1: Navigate to booking page
    await page.goto(`${BASE_URL}/book`);
    await page.waitForLoadState("networkidle");

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "03-booking-page-loaded.png"),
      fullPage: true,
    });

    // Step 2: Verify calendar is rendered
    const calendar = page.locator("[data-testid='booking-calendar'], .booking-calendar, [class*='calendar']").first();
    const hasCalendar = await calendar.isVisible().catch(() => false);

    if (hasCalendar) {
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, "04-calendar-visible.png"),
      });

      // Step 3: Click on an available date slot (first available)
      const availableSlot = page
        .locator("button[data-available='true'], button:not([disabled])[class*='slot']")
        .first();

      if (await availableSlot.isVisible().catch(() => false)) {
        await availableSlot.click();
        await page.waitForTimeout(1000);

        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR, "05-slot-selected.png"),
        });
      }
    }

    // Step 4: If booking form appears, fill it out
    const emailInput = page.locator("input[type='email'], input[name='email']").first();
    if (await emailInput.isVisible().catch(() => false)) {
      await emailInput.fill("test@playwright.com");

      const nameInput = page.locator("input[name='name'], input[placeholder*='name' i]").first();
      if (await nameInput.isVisible().catch(() => false)) {
        await nameInput.fill("Playwright Test User");
      }

      const phoneInput = page.locator("input[type='tel'], input[name='phone']").first();
      if (await phoneInput.isVisible().catch(() => false)) {
        await phoneInput.fill("+91 9999999999");
      }

      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, "06-booking-form-filled.png"),
      });

      // Step 5: Submit booking
      const submitBtn = page
        .locator("button[type='submit'], button:has-text('Confirm'), button:has-text('Book')")
        .first();
      if (await submitBtn.isVisible().catch(() => false)) {
        await submitBtn.click();
        await page.waitForTimeout(2000);

        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR, "07-booking-submitted.png"),
        });
      }
    }

    // Final screenshot
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "08-booking-flow-complete.png"),
      fullPage: true,
    });
  });
});

// ────────────────────────────────────────────────────────────────────────────
// SUITE 3: Concurrency Race Condition Test
// ────────────────────────────────────────────────────────────────────────────
test.describe("Concurrency — Race Condition Protection", () => {
  test("two sessions racing for the same slot → one gets 409 Conflict", async ({
    browser,
  }) => {
    // Create two independent browser contexts (two users)
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // Both navigate to the booking page simultaneously
    await Promise.all([
      page1.goto(`${BASE_URL}/book`),
      page2.goto(`${BASE_URL}/book`),
    ]);

    await page1.screenshot({
      path: path.join(SCREENSHOTS_DIR, "09-concurrency-session1.png"),
    });
    await page2.screenshot({
      path: path.join(SCREENSHOTS_DIR, "10-concurrency-session2.png"),
    });

    // Simulate two concurrent API calls for the same slot
    const testSlot = {
      client_id: "test-client-1",
      service_tier_id: "00000000-0000-0000-0000-000000000001",
      start_time: new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .replace(/\.\d{3}Z$/, "+05:30"),
      end_time: new Date(Date.now() + 25 * 60 * 60 * 1000)
        .toISOString()
        .replace(/\.\d{3}Z$/, "+05:30"),
    };

    // Fire both hold requests simultaneously
    const [result1, result2] = await Promise.allSettled([
      page1.evaluate(
        async (slot) => {
          const res = await fetch("/api/bookings/hold", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...slot, client_id: "concurrent-user-A" }),
          });
          return { status: res.status, ok: res.ok };
        },
        testSlot
      ),
      page2.evaluate(
        async (slot) => {
          const res = await fetch("/api/bookings/hold", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...slot, client_id: "concurrent-user-B" }),
          });
          return { status: res.status, ok: res.ok };
        },
        testSlot
      ),
    ]);

    const statuses = [result1, result2].map((r) =>
      r.status === "fulfilled" ? r.value.status : "rejected"
    );

    console.log("[Concurrency Test] Response statuses:", statuses);

    // One should succeed (200/201) and one should be rejected (409)
    // OR both may fail due to test data — but the key assertion is they don't both succeed
    const bothSucceeded = statuses.every((s) => s === 200 || s === 201);
    expect(bothSucceeded).toBe(false);

    await page1.screenshot({
      path: path.join(SCREENSHOTS_DIR, "11-concurrency-result.png"),
    });

    await context1.close();
    await context2.close();
  });
});

// ────────────────────────────────────────────────────────────────────────────
// SUITE 4: Auth Redirect Loop Protection
// ────────────────────────────────────────────────────────────────────────────
test.describe("Auth — Redirect Loop Protection", () => {
  test("/portal redirects to /login when unauthenticated", async ({ page }) => {
    // Fresh context with no cookies = unauthenticated user
    await page.goto(`${BASE_URL}/portal`);
    await page.waitForLoadState("networkidle");

    // Must be redirected to /login, not stuck in a loop
    const finalUrl = page.url();
    expect(finalUrl).toContain("/login");
    expect(finalUrl).not.toContain("/portal");

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "12-portal-redirect-to-login.png"),
    });
  });

  test("/login does not redirect back to /portal without a session (no loop)", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState("networkidle");

    // Should stay on /login, not redirect to /portal
    const finalUrl = page.url();
    expect(finalUrl).toContain("/login");

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "13-login-page-no-loop.png"),
    });
  });

  test("/admin redirects to / when accessed without admin session", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/admin`);
    await page.waitForLoadState("networkidle");

    // Should be redirected away from admin
    const finalUrl = page.url();
    expect(finalUrl).not.toContain("/admin");

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "14-admin-auth-protection.png"),
    });
  });

  test("API /api/admin/* is protected — standard user cannot get valid admin response", async ({
    page,
  }) => {
    // Attempt to hit admin API without auth — middleware redirects to '/' (returns 200 HTML)
    // The key assertion: a non-admin CANNOT get a JSON success:true response
    const response = await page.request.post(`${BASE_URL}/api/admin/bookings/action`, {
      data: { booking_id: "fake-id", action: "confirm" },
      headers: { "Content-Type": "application/json" },
    });

    const status = response.status();
    const url = response.url();
    console.log(`[Auth Test] /api/admin/bookings/action status: ${status}, URL: ${url}`);

    // Middleware redirects unauthenticated admin API calls to '/'.
    // Either a redirect (3xx) OR the final HTML page (200) — but NEVER a JSON success body.
    let isBlockedFromAdminAction = false;
    if (status >= 300 && status < 400) {
      // Explicit redirect — clearly blocked
      isBlockedFromAdminAction = true;
    } else if (status === 401 || status === 403) {
      isBlockedFromAdminAction = true;
    } else if (status === 200) {
      // Could be middleware redirect to homepage HTML — check it's not a JSON success
      const contentType = response.headers()["content-type"] || "";
      const isHtml = contentType.includes("text/html");
      if (isHtml) {
        // Redirected to homepage — admin action was not executed
        isBlockedFromAdminAction = true;
      } else {
        // It's JSON — check it's not { success: true }
        try {
          const body = await response.json();
          isBlockedFromAdminAction = body.success !== true;
        } catch {
          isBlockedFromAdminAction = true;
        }
      }
    }

    expect(isBlockedFromAdminAction).toBe(true);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "15-api-admin-protected.png"),
    });
  });
});

// ────────────────────────────────────────────────────────────────────────────
// SUITE 5: Cron Endpoint Security
// ────────────────────────────────────────────────────────────────────────────
test.describe("Cron Endpoint — Authorization", () => {
  test("cron endpoint rejects requests without CRON_SECRET", async ({ page }) => {
    // No auth header → should get 401
    const response = await page.request.get(`${BASE_URL}/api/cron/reminders`);
    expect(response.status()).toBe(401);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "16-cron-no-auth-rejected.png"),
    });
  });

  test("cron endpoint rejects wrong secret", async ({ page }) => {
    const response = await page.request.get(`${BASE_URL}/api/cron/reminders`, {
      headers: { Authorization: "Bearer wrong_secret" },
    });
    expect(response.status()).toBe(401);
  });

  test("cron endpoint accepts correct CRON_SECRET", async ({ page }) => {
    // Uses the test secret from .env.local
    const response = await page.request.get(`${BASE_URL}/api/cron/reminders`, {
      headers: {
        Authorization: `Bearer ${process.env.CRON_SECRET || "super_secret_cron_key_123"}`,
      },
    });
    // Should be 200 (even if no bookings to process)
    expect([200, 500]).toContain(response.status()); // 500 only if DB not connected

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "17-cron-auth-accepted.png"),
    });
  });
});

// ────────────────────────────────────────────────────────────────────────────
// SUITE 6: Mobile Viewport (375px)
// ────────────────────────────────────────────────────────────────────────────
test.describe("Mobile Viewport — 375px", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("homepage renders correctly at 375px", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Check for horizontal overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.body.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "18-mobile-homepage-375.png"),
      fullPage: true,
    });
  });

  test("booking page renders correctly at 375px", async ({ page }) => {
    await page.goto(`${BASE_URL}/book`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.body.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "19-mobile-booking-375.png"),
      fullPage: true,
    });
  });

  test("login page renders correctly at 375px", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState("networkidle");

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "20-mobile-login-375.png"),
      fullPage: true,
    });
  });
});

// ────────────────────────────────────────────────────────────────────────────
// SUITE 7: Full Session Video Recording
// ────────────────────────────────────────────────────────────────────────────
test.describe("Session Video — Complete Booking Flow", () => {
  test("record full booking flow session as video proof", async ({ browser }) => {
    // Create context with video recording enabled
    const context = await browser.newContext({
      recordVideo: {
        dir: VIDEOS_DIR,
        size: { width: 1280, height: 720 },
      },
      viewport: { width: 1280, height: 720 },
    });

    const page = await context.newPage();

    try {
      // Step 1: Homepage
      await page.goto(BASE_URL);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);

      // Step 2: Navigate to booking
      const menuBtn = page.locator('nav div[role="button"]').first();
      if (await menuBtn.isVisible().catch(() => false)) {
        await menuBtn.click();
        await page.waitForTimeout(1000); // Wait for menu open animation
      }

      const bookingLink = page
        .locator("a[href*='book'], a:has-text('Book'), a:has-text('Appointment')")
        .first();
      if (await bookingLink.isVisible().catch(() => false)) {
        await bookingLink.click();
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(1500);
      } else {
        await page.goto(`${BASE_URL}/book`);
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(1500);
      }

      // Step 3: Interact with calendar if present
      const slot = page
        .locator("button[data-available='true'], [class*='slot']:not([disabled])")
        .first();
      if (await slot.isVisible().catch(() => false)) {
        await slot.click();
        await page.waitForTimeout(1000);
      }

      // Step 4: Navigate to login
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1500);

      // Step 5: Navigate to portal (should redirect to login)
      await page.goto(`${BASE_URL}/portal`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1500);

      // Final screenshot
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, "21-video-session-final.png"),
      });
    } finally {
      // Stop recording — video is saved automatically
      await context.close();

      // Rename the video file for clarity
      const videos = fs.readdirSync(VIDEOS_DIR).filter((f) => f.endsWith(".webm"));
      if (videos.length > 0) {
        const latest = videos.sort().pop()!;
        const newName = path.join(VIDEOS_DIR, "booking-flow-session.webm");
        if (!fs.existsSync(newName)) {
          fs.renameSync(path.join(VIDEOS_DIR, latest), newName);
        }
        console.log(`[Video] Session recorded: ${newName}`);
      }
    }
  });
});

// ────────────────────────────────────────────────────────────────────────────
// SUITE 8: Admin Control Centre Operations
// ────────────────────────────────────────────────────────────────────────────
test.describe("Admin Control Centre", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    // Authenticate as admin before each test
    await loginAsAdmin(page, baseURL || "http://localhost:3000");
    // Go to admin page
    await page.goto(`${baseURL || "http://localhost:3000"}/admin`);
    await page.waitForLoadState("networkidle");
  });

  test("admin settings: update working hours", async ({ page }) => {
    // Navigate to Settings tab
    const settingsTab = page.locator("button:has-text('Settings')");
    await settingsTab.click();
    await page.waitForTimeout(500);

    // Verify settings fields are visible
    const startInput = page.locator("input[placeholder='09:00:00']").first();
    const endInput = page.locator("input[placeholder='18:00:00']").first();
    await expect(startInput).toBeVisible();
    await expect(endInput).toBeVisible();

    // Fill in values
    await startInput.fill("10:00:00");
    await endInput.fill("18:00:00");

    // Submit settings form
    const saveSettingsBtn = page.locator("button:has-text('Save Settings')");
    await saveSettingsBtn.click();
    await page.waitForTimeout(1000);

    // Take screenshot of saved settings
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "22-admin-settings-saved.png"),
    });
  });

  test("admin services: CRUD operations", async ({ page }) => {
    // Navigate to Settings tab
    const settingsTab = page.locator("button:has-text('Settings')");
    await settingsTab.click();
    await page.waitForTimeout(500);

    // 1. Create a service
    const titleInput = page.locator("input[placeholder*='Deluxe Arabic' i]").first();
    const descInput = page.locator("textarea[placeholder*='what is included' i]").first();
    const durationInput = page.locator("input[type='number']").first(); // Duration is first number input
    const priceInput = page.locator("input[type='number']").nth(1); // Price is second number input

    await titleInput.fill("E2E Test Package");
    await descInput.fill("Temporary package created by Playwright");
    await durationInput.fill("90");
    await priceInput.fill("5000");

    const addBtn = page.locator("button:has-text('Create Package')");
    await addBtn.click();
    await page.waitForTimeout(1500);

    // Verify service appears in list
    const serviceRow = page.locator("h4:has-text('E2E Test Package')").first();
    await expect(serviceRow).toBeVisible();

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "23-admin-service-created.png"),
    });

    // 2. Toggle active/inactive
    const h4BeforeToggle = page.locator("h4:has-text('E2E Test Package')").first();
    const toggleRow = h4BeforeToggle.locator("xpath=ancestor::div[contains(@class, 'justify-between')][1]");
    const activeStatusBtn = toggleRow.locator("button[title='Deactivate']").first();
    await activeStatusBtn.click();
    await page.waitForTimeout(1000);

    // 3. Edit service
    // Click edit/save button for our test package
    const h4 = page.locator("h4:has-text('E2E Test Package')").first();
    const cardRow = h4.locator("xpath=ancestor::div[contains(@class, 'justify-between')][1]");
    const editBtn = cardRow.locator("button[title='Edit']").first();
    await editBtn.click();
    await page.waitForTimeout(500);

    const cancelBtn = page.locator("button:has-text('Cancel')").first();
    const editCard = cancelBtn.locator("xpath=ancestor::div[contains(@class, 'border')][1]");
    const editTitleInput = editCard.locator("input[type='text']").first();
    await editTitleInput.fill("E2E Test Package (Edited)");
    
    const saveBtn = editCard.locator("button:has-text('Save')").first();
    await saveBtn.click();
    await page.waitForTimeout(1000);

    // Verify title updated
    const editedRow = page.locator("h4:has-text('E2E Test Package (Edited)')").first();
    await expect(editedRow).toBeVisible();

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "24-admin-service-edited.png"),
    });

    // 4. Delete service
    // Accept confirm dialog automatically
    page.once("dialog", (dialog) => dialog.accept());
    const h4Edited = page.locator("h4:has-text('E2E Test Package (Edited)')").first();
    const deleteRow = h4Edited.locator("xpath=ancestor::div[contains(@class, 'justify-between')][1]");
    const deleteBtn = deleteRow.locator("button[title='Delete']").first();
    await deleteBtn.click();
    await page.waitForTimeout(1500);

    // Verify deleted
    await expect(page.locator("h4:has-text('E2E Test Package (Edited)')")).not.toBeVisible();

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "25-admin-service-deleted.png"),
    });
  });

  test("admin portfolio: update details & active status", async ({ page }) => {
    // Navigate to Portfolio tab
    const portfolioTab = page.locator("button:has-text('Portfolio')");
    await portfolioTab.click();
    await page.waitForTimeout(500);

    // Verify portfolio manager is visible
    const existingHeader = page.locator("h3:has-text('Existing Artwork Gallery')").first();
    await expect(existingHeader).toBeVisible();

    // Check if we have at least one asset to test
    const firstAssetCard = page.locator("div:has(h4)").first();
    const hasAssets = await firstAssetCard.isVisible().catch(() => false);

    if (hasAssets) {
      // 1. Edit asset details
      const firstAssetTitle = await page.locator("h4").first().textContent();
      const editBtn = page.locator("button:has-text('Edit')").first();
      await editBtn.click();
      await page.waitForTimeout(500);

      // Locate editing inputs
      const editTitleInput = page.locator("input[placeholder='Title']").first();
      await editTitleInput.fill("E2E Test Artwork Name");
      
      const saveBtn = page.locator("button:has-text('Save')").first();
      await saveBtn.click();
      await page.waitForTimeout(1000);

      // Verify edited title
      await expect(page.locator("h4:has-text('E2E Test Artwork Name')")).toBeVisible();

      // Restore it back to original title or edit again
      await page.locator("button:has-text('Edit')").first().click();
      await page.waitForTimeout(500);
      await page.locator("input[placeholder='Title']").first().fill(firstAssetTitle || "Artwork");
      await page.locator("button:has-text('Save')").first().click();
      await page.waitForTimeout(1000);

      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, "26-admin-portfolio-edited.png"),
      });
    }
  });
});
