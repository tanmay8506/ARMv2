# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.ts >> Admin Control Centre >> admin services: CRUD operations
- Location: tests\e2e.spec.ts:593:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('h4:has-text(\'E2E Test Package\')').first().locator('xpath=ancestor::div[contains(@class, \'justify-between\')][1]').locator('button[title=\'Deactivate\']').first()

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - alert [ref=e2]
  - navigation:
    - button "Open menu" [ref=e3] [cursor=pointer]:
      - generic [ref=e8]: Menu
    - link "ARM" [ref=e10] [cursor=pointer]:
      - /url: /
    - generic [ref=e11]:
      - img [ref=e12] [cursor=pointer]
      - img [ref=e15] [cursor=pointer]
  - generic [ref=e18]:
    - generic [ref=e19]:
      - generic [ref=e20]:
        - generic [ref=e21]: ARM Artistry
        - paragraph [ref=e22]: An elite bridal henna atelier blending rich cultural heritage with absolute modern visual luxury.
      - generic [ref=e23]: IST • Bengaluru, IN
    - generic [ref=e24]:
      - generic [ref=e25]: Navigation
      - link "01 / Home" [ref=e27] [cursor=pointer]:
        - /url: /
      - link "02 / Services" [ref=e29] [cursor=pointer]:
        - /url: /services
      - link "03 / Portfolio" [ref=e31] [cursor=pointer]:
        - /url: /portfolio
      - link "04 / Book Session" [ref=e33] [cursor=pointer]:
        - /url: /book
      - link "05 / Client Portal" [ref=e35] [cursor=pointer]:
        - /url: /portal
  - generic [ref=e36]:
    - banner [ref=e37]:
      - generic [ref=e38]:
        - img [ref=e39]
        - generic [ref=e44]: ARM Artistry · Admin
      - generic [ref=e45]:
        - generic [ref=e46]: tanmay8506@gmail.com
        - button "Sign Out" [ref=e48] [cursor=pointer]:
          - img [ref=e49]
          - text: Sign Out
    - main [ref=e52]:
      - generic [ref=e53]:
        - generic [ref=e54]:
          - heading "Control Centre" [level=1] [ref=e55]
          - paragraph [ref=e56]: Manage bookings, portfolio assets, and studio operations.
        - generic [ref=e57]:
          - button "Bookings" [ref=e58] [cursor=pointer]:
            - img [ref=e59]
            - generic [ref=e61]: Bookings
          - button "Portfolio" [ref=e62] [cursor=pointer]:
            - img [ref=e63]
            - generic [ref=e67]: Portfolio
          - button "Settings" [ref=e68] [cursor=pointer]:
            - img [ref=e69]
            - generic [ref=e70]: Settings
      - generic [ref=e72]:
        - generic [ref=e73]:
          - heading "Working Hours" [level=3] [ref=e74]
          - generic [ref=e75]:
            - generic [ref=e76]:
              - generic [ref=e77]: Timezone
              - combobox [ref=e78]:
                - option "Asia/Kolkata (IST)" [selected]
                - option "UTC"
            - generic [ref=e79]:
              - generic [ref=e80]:
                - generic [ref=e81]: Start Time
                - textbox "09:00:00" [ref=e82]: 10:00:00
              - generic [ref=e83]:
                - generic [ref=e84]: End Time
                - textbox "18:00:00" [ref=e85]
            - button "Save Settings" [ref=e86] [cursor=pointer]
        - generic [ref=e87]:
          - generic [ref=e88]:
            - heading "Create Service Tier" [level=3] [ref=e89]
            - generic [ref=e90]:
              - generic [ref=e91]:
                - generic [ref=e92]: Tier Title
                - textbox "e.g. Deluxe Arabic Henna" [ref=e93]
              - generic [ref=e94]:
                - generic [ref=e95]: Description
                - textbox "Detail what is included in this session..." [ref=e96]
              - generic [ref=e97]:
                - generic [ref=e98]: Duration (minutes)
                - spinbutton [ref=e99]: "60"
              - generic [ref=e100]:
                - generic [ref=e101]: Price (INR)
                - spinbutton [ref=e102]: "1000"
              - button "Create Package" [ref=e104] [cursor=pointer]:
                - img [ref=e105]
                - text: Create Package
          - generic [ref=e106]:
            - heading "Active Packages" [level=3] [ref=e107]
            - generic [ref=e108]:
              - generic [ref=e110]:
                - generic [ref=e111]:
                  - generic [ref=e112]:
                    - heading "E2E Test Package" [level=4] [ref=e113]
                    - generic [ref=e114]: Inactive
                  - paragraph [ref=e115]: Temporary package created by Playwright
                  - generic [ref=e116]:
                    - generic [ref=e117]: "Duration: 90 mins"
                    - generic [ref=e118]: •
                    - generic [ref=e119]: ₹5,000
                - generic [ref=e120]:
                  - button "Edit" [ref=e121] [cursor=pointer]:
                    - img [ref=e122]
                  - button "Activate" [ref=e126] [cursor=pointer]:
                    - img [ref=e127]
                  - button "Delete" [ref=e129] [cursor=pointer]:
                    - img [ref=e130]
              - generic [ref=e134]:
                - generic [ref=e135]:
                  - generic [ref=e136]:
                    - heading "E2E Test Package" [level=4] [ref=e137]
                    - generic [ref=e138]: Active
                  - paragraph [ref=e139]: Temporary package created by Playwright
                  - generic [ref=e140]:
                    - generic [ref=e141]: "Duration: 90 mins"
                    - generic [ref=e142]: •
                    - generic [ref=e143]: ₹5,000
                - generic [ref=e144]:
                  - button "Edit" [ref=e145] [cursor=pointer]:
                    - img [ref=e146]
                  - button "Deactivate" [ref=e150] [cursor=pointer]:
                    - img [ref=e151]
                  - button "Delete" [ref=e153] [cursor=pointer]:
                    - img [ref=e154]
              - generic [ref=e158]:
                - generic [ref=e159]:
                  - generic [ref=e160]:
                    - heading "E2E Test Package" [level=4] [ref=e161]
                    - generic [ref=e162]: Inactive
                  - paragraph [ref=e163]: Temporary package created by Playwright
                  - generic [ref=e164]:
                    - generic [ref=e165]: "Duration: 90 mins"
                    - generic [ref=e166]: •
                    - generic [ref=e167]: ₹5,000
                - generic [ref=e168]:
                  - button "Edit" [ref=e169] [cursor=pointer]:
                    - img [ref=e170]
                  - button "Activate" [ref=e174] [cursor=pointer]:
                    - img [ref=e175]
                  - button "Delete" [ref=e177] [cursor=pointer]:
                    - img [ref=e178]
              - generic [ref=e182]:
                - generic [ref=e183]:
                  - generic [ref=e184]:
                    - heading "Standard Bridal" [level=4] [ref=e185]
                    - generic [ref=e186]: Inactive
                  - paragraph [ref=e187]: Intricate bridal mehendi for hands up to elbows.
                  - generic [ref=e188]:
                    - generic [ref=e189]: "Duration: 60 mins"
                    - generic [ref=e190]: •
                    - generic [ref=e191]: ₹5,000
                - generic [ref=e192]:
                  - button "Edit" [ref=e193] [cursor=pointer]:
                    - img [ref=e194]
                  - button "Activate" [ref=e198] [cursor=pointer]:
                    - img [ref=e199]
                  - button "Delete" [ref=e201] [cursor=pointer]:
                    - img [ref=e202]
              - generic [ref=e206]:
                - generic [ref=e207]:
                  - generic [ref=e208]:
                    - heading "E2E Test Package" [level=4] [ref=e209]
                    - generic [ref=e210]: Inactive
                  - paragraph [ref=e211]: Temporary package created by Playwright
                  - generic [ref=e212]:
                    - generic [ref=e213]: "Duration: 90 mins"
                    - generic [ref=e214]: •
                    - generic [ref=e215]: ₹5,000
                - generic [ref=e216]:
                  - button "Edit" [ref=e217] [cursor=pointer]:
                    - img [ref=e218]
                  - button "Activate" [ref=e222] [cursor=pointer]:
                    - img [ref=e223]
                  - button "Delete" [ref=e225] [cursor=pointer]:
                    - img [ref=e226]
              - generic [ref=e230]:
                - generic [ref=e231]:
                  - generic [ref=e232]:
                    - heading "E2E Test Package" [level=4] [ref=e233]
                    - generic [ref=e234]: Active
                  - paragraph [ref=e235]: Temporary package created by Playwright
                  - generic [ref=e236]:
                    - generic [ref=e237]: "Duration: 90 mins"
                    - generic [ref=e238]: •
                    - generic [ref=e239]: ₹5,000
                - generic [ref=e240]:
                  - button "Edit" [ref=e241] [cursor=pointer]:
                    - img [ref=e242]
                  - button "Deactivate" [ref=e246] [cursor=pointer]:
                    - img [ref=e247]
                  - button "Delete" [ref=e249] [cursor=pointer]:
                    - img [ref=e250]
              - generic [ref=e254]:
                - generic [ref=e255]:
                  - generic [ref=e256]:
                    - heading "HD Premium" [level=4] [ref=e257]
                    - generic [ref=e258]: Active
                  - paragraph [ref=e259]: High-definition modern patterns with premium organic henna.
                  - generic [ref=e260]:
                    - generic [ref=e261]: "Duration: 90 mins"
                    - generic [ref=e262]: •
                    - generic [ref=e263]: ₹8,000
                - generic [ref=e264]:
                  - button "Edit" [ref=e265] [cursor=pointer]:
                    - img [ref=e266]
                  - button "Deactivate" [ref=e270] [cursor=pointer]:
                    - img [ref=e271]
                  - button "Delete" [ref=e273] [cursor=pointer]:
                    - img [ref=e274]
              - generic [ref=e278]:
                - generic [ref=e279]:
                  - generic [ref=e280]:
                    - heading "Royal Luxury Signature" [level=4] [ref=e281]
                    - generic [ref=e282]: Active
                  - paragraph [ref=e283]: Full bridal mehendi package including legs, custom story-based design, and aftercare kit.
                  - generic [ref=e284]:
                    - generic [ref=e285]: "Duration: 120 mins"
                    - generic [ref=e286]: •
                    - generic [ref=e287]: ₹12,000
                - generic [ref=e288]:
                  - button "Edit" [ref=e289] [cursor=pointer]:
                    - img [ref=e290]
                  - button "Deactivate" [ref=e294] [cursor=pointer]:
                    - img [ref=e295]
                  - button "Delete" [ref=e297] [cursor=pointer]:
                    - img [ref=e298]
  - contentinfo [ref=e301]:
    - heading "ARM Artistry" [level=2] [ref=e302]
    - generic [ref=e303]:
      - generic [ref=e304]:
        - heading "Explore" [level=3] [ref=e305]
        - list [ref=e306]:
          - listitem [ref=e307]:
            - link "Portfolio" [ref=e308] [cursor=pointer]:
              - /url: /portfolio
          - listitem [ref=e309]:
            - link "Services" [ref=e310] [cursor=pointer]:
              - /url: /services
          - listitem [ref=e311]:
            - link "About" [ref=e312] [cursor=pointer]:
              - /url: /
      - generic [ref=e313]:
        - heading "Legal" [level=3] [ref=e314]
        - list [ref=e315]:
          - listitem [ref=e316]:
            - link "Privacy Policy" [ref=e317] [cursor=pointer]:
              - /url: "#"
          - listitem [ref=e318]:
            - link "Terms of Service" [ref=e319] [cursor=pointer]:
              - /url: "#"
      - generic [ref=e320]:
        - heading "Connect" [level=3] [ref=e321]
        - list [ref=e322]:
          - listitem [ref=e323]:
            - link "Instagram" [ref=e324] [cursor=pointer]:
              - /url: https://instagram.com
          - listitem [ref=e325]:
            - link "Contact & Booking" [ref=e326] [cursor=pointer]:
              - /url: /book
    - generic [ref=e327]: © 2026 ARM Artistry. All Rights Reserved.
```

# Test source

```ts
  526 | 
  527 |       // Step 5: Navigate to portal (should redirect to login)
  528 |       await page.goto(`${BASE_URL}/portal`);
  529 |       await page.waitForLoadState("networkidle");
  530 |       await page.waitForTimeout(1500);
  531 | 
  532 |       // Final screenshot
  533 |       await page.screenshot({
  534 |         path: path.join(SCREENSHOTS_DIR, "21-video-session-final.png"),
  535 |       });
  536 |     } finally {
  537 |       // Stop recording — video is saved automatically
  538 |       await context.close();
  539 | 
  540 |       // Rename the video file for clarity
  541 |       const videos = fs.readdirSync(VIDEOS_DIR).filter((f) => f.endsWith(".webm"));
  542 |       if (videos.length > 0) {
  543 |         const latest = videos.sort().pop()!;
  544 |         const newName = path.join(VIDEOS_DIR, "booking-flow-session.webm");
  545 |         if (!fs.existsSync(newName)) {
  546 |           fs.renameSync(path.join(VIDEOS_DIR, latest), newName);
  547 |         }
  548 |         console.log(`[Video] Session recorded: ${newName}`);
  549 |       }
  550 |     }
  551 |   });
  552 | });
  553 | 
  554 | // ────────────────────────────────────────────────────────────────────────────
  555 | // SUITE 8: Admin Control Centre Operations
  556 | // ────────────────────────────────────────────────────────────────────────────
  557 | test.describe("Admin Control Centre", () => {
  558 |   test.beforeEach(async ({ page, baseURL }) => {
  559 |     // Authenticate as admin before each test
  560 |     await loginAsAdmin(page, baseURL || "http://localhost:3000");
  561 |     // Go to admin page
  562 |     await page.goto(`${baseURL || "http://localhost:3000"}/admin`);
  563 |     await page.waitForLoadState("networkidle");
  564 |   });
  565 | 
  566 |   test("admin settings: update working hours", async ({ page }) => {
  567 |     // Navigate to Settings tab
  568 |     const settingsTab = page.locator("button:has-text('Settings')");
  569 |     await settingsTab.click();
  570 |     await page.waitForTimeout(500);
  571 | 
  572 |     // Verify settings fields are visible
  573 |     const startInput = page.locator("input[placeholder='09:00:00']").first();
  574 |     const endInput = page.locator("input[placeholder='18:00:00']").first();
  575 |     await expect(startInput).toBeVisible();
  576 |     await expect(endInput).toBeVisible();
  577 | 
  578 |     // Fill in values
  579 |     await startInput.fill("10:00:00");
  580 |     await endInput.fill("18:00:00");
  581 | 
  582 |     // Submit settings form
  583 |     const saveSettingsBtn = page.locator("button:has-text('Save Settings')");
  584 |     await saveSettingsBtn.click();
  585 |     await page.waitForTimeout(1000);
  586 | 
  587 |     // Take screenshot of saved settings
  588 |     await page.screenshot({
  589 |       path: path.join(SCREENSHOTS_DIR, "22-admin-settings-saved.png"),
  590 |     });
  591 |   });
  592 | 
  593 |   test("admin services: CRUD operations", async ({ page }) => {
  594 |     // Navigate to Settings tab
  595 |     const settingsTab = page.locator("button:has-text('Settings')");
  596 |     await settingsTab.click();
  597 |     await page.waitForTimeout(500);
  598 | 
  599 |     // 1. Create a service
  600 |     const titleInput = page.locator("input[placeholder*='Deluxe Arabic' i]").first();
  601 |     const descInput = page.locator("textarea[placeholder*='what is included' i]").first();
  602 |     const durationInput = page.locator("input[type='number']").first(); // Duration is first number input
  603 |     const priceInput = page.locator("input[type='number']").nth(1); // Price is second number input
  604 | 
  605 |     await titleInput.fill("E2E Test Package");
  606 |     await descInput.fill("Temporary package created by Playwright");
  607 |     await durationInput.fill("90");
  608 |     await priceInput.fill("5000");
  609 | 
  610 |     const addBtn = page.locator("button:has-text('Create Package')");
  611 |     await addBtn.click();
  612 |     await page.waitForTimeout(1500);
  613 | 
  614 |     // Verify service appears in list
  615 |     const serviceRow = page.locator("h4:has-text('E2E Test Package')").first();
  616 |     await expect(serviceRow).toBeVisible();
  617 | 
  618 |     await page.screenshot({
  619 |       path: path.join(SCREENSHOTS_DIR, "23-admin-service-created.png"),
  620 |     });
  621 | 
  622 |     // 2. Toggle active/inactive
  623 |     const h4BeforeToggle = page.locator("h4:has-text('E2E Test Package')").first();
  624 |     const toggleRow = h4BeforeToggle.locator("xpath=ancestor::div[contains(@class, 'justify-between')][1]");
  625 |     const activeStatusBtn = toggleRow.locator("button[title='Deactivate']").first();
> 626 |     await activeStatusBtn.click();
      |                           ^ Error: locator.click: Test timeout of 30000ms exceeded.
  627 |     await page.waitForTimeout(1000);
  628 | 
  629 |     // 3. Edit service
  630 |     // Click edit/save button for our test package
  631 |     const h4 = page.locator("h4:has-text('E2E Test Package')").first();
  632 |     const cardRow = h4.locator("xpath=ancestor::div[contains(@class, 'justify-between')][1]");
  633 |     const editBtn = cardRow.locator("button[title='Edit']").first();
  634 |     await editBtn.click();
  635 |     await page.waitForTimeout(500);
  636 | 
  637 |     const cancelBtn = page.locator("button:has-text('Cancel')").first();
  638 |     const editCard = cancelBtn.locator("xpath=ancestor::div[contains(@class, 'border')][1]");
  639 |     const editTitleInput = editCard.locator("input[type='text']").first();
  640 |     await editTitleInput.fill("E2E Test Package (Edited)");
  641 |     
  642 |     const saveBtn = editCard.locator("button:has-text('Save')").first();
  643 |     await saveBtn.click();
  644 |     await page.waitForTimeout(1000);
  645 | 
  646 |     // Verify title updated
  647 |     const editedRow = page.locator("h4:has-text('E2E Test Package (Edited)')").first();
  648 |     await expect(editedRow).toBeVisible();
  649 | 
  650 |     await page.screenshot({
  651 |       path: path.join(SCREENSHOTS_DIR, "24-admin-service-edited.png"),
  652 |     });
  653 | 
  654 |     // 4. Delete service
  655 |     // Accept confirm dialog automatically
  656 |     page.once("dialog", (dialog) => dialog.accept());
  657 |     const h4Edited = page.locator("h4:has-text('E2E Test Package (Edited)')").first();
  658 |     const deleteRow = h4Edited.locator("xpath=ancestor::div[contains(@class, 'justify-between')][1]");
  659 |     const deleteBtn = deleteRow.locator("button[title='Delete']").first();
  660 |     await deleteBtn.click();
  661 |     await page.waitForTimeout(1500);
  662 | 
  663 |     // Verify deleted
  664 |     await expect(page.locator("h4:has-text('E2E Test Package (Edited)')")).not.toBeVisible();
  665 | 
  666 |     await page.screenshot({
  667 |       path: path.join(SCREENSHOTS_DIR, "25-admin-service-deleted.png"),
  668 |     });
  669 |   });
  670 | 
  671 |   test("admin portfolio: update details & active status", async ({ page }) => {
  672 |     // Navigate to Portfolio tab
  673 |     const portfolioTab = page.locator("button:has-text('Portfolio')");
  674 |     await portfolioTab.click();
  675 |     await page.waitForTimeout(500);
  676 | 
  677 |     // Verify portfolio manager is visible
  678 |     const existingHeader = page.locator("h3:has-text('Existing Artwork Gallery')").first();
  679 |     await expect(existingHeader).toBeVisible();
  680 | 
  681 |     // Check if we have at least one asset to test
  682 |     const firstAssetCard = page.locator("div:has(h4)").first();
  683 |     const hasAssets = await firstAssetCard.isVisible().catch(() => false);
  684 | 
  685 |     if (hasAssets) {
  686 |       // 1. Edit asset details
  687 |       const firstAssetTitle = await page.locator("h4").first().textContent();
  688 |       const editBtn = page.locator("button:has-text('Edit')").first();
  689 |       await editBtn.click();
  690 |       await page.waitForTimeout(500);
  691 | 
  692 |       // Locate editing inputs
  693 |       const editTitleInput = page.locator("input[placeholder='Title']").first();
  694 |       await editTitleInput.fill("E2E Test Artwork Name");
  695 |       
  696 |       const saveBtn = page.locator("button:has-text('Save')").first();
  697 |       await saveBtn.click();
  698 |       await page.waitForTimeout(1000);
  699 | 
  700 |       // Verify edited title
  701 |       await expect(page.locator("h4:has-text('E2E Test Artwork Name')")).toBeVisible();
  702 | 
  703 |       // Restore it back to original title or edit again
  704 |       await page.locator("button:has-text('Edit')").first().click();
  705 |       await page.waitForTimeout(500);
  706 |       await page.locator("input[placeholder='Title']").first().fill(firstAssetTitle || "Artwork");
  707 |       await page.locator("button:has-text('Save')").first().click();
  708 |       await page.waitForTimeout(1000);
  709 | 
  710 |       await page.screenshot({
  711 |         path: path.join(SCREENSHOTS_DIR, "26-admin-portfolio-edited.png"),
  712 |       });
  713 |     }
  714 |   });
  715 | });
  716 | 
```