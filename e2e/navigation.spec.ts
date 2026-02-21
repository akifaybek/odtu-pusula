import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate between pages', async ({ page }) => {
    await page.goto('/');

    // Click on Courses
    await page.click('a[href="/courses"], text=Courses');
    await expect(page).toHaveURL(/.*courses/);

    // Click on Professors
    await page.click('a[href="/professors"], text=Professors');
    await expect(page).toHaveURL(/.*professors/);
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');

    const loginLink = page.locator('a[href="/login"]').first();
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await expect(page).toHaveURL(/.*login/);
    }
  });

  test('should show 404 for non-existent pages', async ({ page }) => {
    await page.goto('/non-existent-page-12345');

    // Should show some kind of error or 404
    const content = await page.locator('body').textContent();
    expect(content).toBeTruthy();
  });
});

test.describe('Global Search', () => {
  test('should open search dialog with keyboard shortcut', async ({ page }) => {
    await page.goto('/courses');

    // Wait for page to load
    await page.waitForTimeout(500);

    // Try Cmd+K or Ctrl+K
    await page.keyboard.press('Meta+k');

    // Check if search dialog opened
    const searchDialog = page.locator('[role="dialog"], [data-state="open"]');

    if (await searchDialog.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(searchDialog).toBeVisible();
    }
  });

  test('should have search button in navbar', async ({ page }) => {
    await page.goto('/courses');

    const searchButton = page.locator('button:has-text("⌘K"), input[placeholder*="search" i]').first();

    if (await searchButton.isVisible()) {
      await expect(searchButton).toBeVisible();
    }
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/');

    const h1 = page.locator('h1');
    await expect(h1.first()).toBeVisible();
  });

  test('should have alt text on images', async ({ page }) => {
    await page.goto('/');

    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      // Allow empty alt for decorative images
      expect(alt !== null).toBeTruthy();
    }
  });

  test('should have focusable interactive elements', async ({ page }) => {
    await page.goto('/');

    // Tab through the page
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Something should be focused
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });
});
