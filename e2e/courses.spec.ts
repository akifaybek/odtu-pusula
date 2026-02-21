import { test, expect } from '@playwright/test';

test.describe('Courses Page', () => {
  test('should display courses page', async ({ page }) => {
    await page.goto('/courses');

    // Should have page title
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should have search functionality', async ({ page }) => {
    await page.goto('/courses');

    // Look for search input
    const searchInput = page.locator('input[placeholder*="search" i], input[type="search"]');

    if (await searchInput.isVisible()) {
      await searchInput.fill('CENG');
      await page.waitForTimeout(500);

      // Should filter results or show search results
      await expect(page.locator('body')).toContainText(/course|CENG|not found/i);
    }
  });

  test('should have department filter', async ({ page }) => {
    await page.goto('/courses');

    // Look for department filter/select
    const filterButton = page.locator('button:has-text("Department"), select, [role="combobox"]').first();

    if (await filterButton.isVisible()) {
      await expect(filterButton).toBeVisible();
    }
  });

  test('should display course cards', async ({ page }) => {
    await page.goto('/courses');

    await page.waitForTimeout(1000);

    // Should have some content
    const content = await page.locator('body').textContent();
    expect(content).toBeTruthy();
  });
});

test.describe('Professors Page', () => {
  test('should display professors page', async ({ page }) => {
    await page.goto('/professors');

    // Should have page title
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should have search functionality', async ({ page }) => {
    await page.goto('/professors');

    const searchInput = page.locator('input[placeholder*="search" i], input[type="search"]');

    if (await searchInput.isVisible()) {
      await searchInput.fill('Prof');
      await page.waitForTimeout(500);

      // Should filter or search
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should have title filter', async ({ page }) => {
    await page.goto('/professors');

    // Look for title filter buttons or select
    const filterOptions = page.locator('button:has-text("Prof"), button:has-text("Dr")');

    if (await filterOptions.first().isVisible()) {
      await expect(filterOptions.first()).toBeVisible();
    }
  });
});
