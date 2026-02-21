import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');

    await expect(page.locator('h1, h2').first()).toContainText(/sign in|welcome/i);
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should display registration page', async ({ page }) => {
    await page.goto('/register');

    await expect(page.locator('h1, h2').first()).toContainText(/sign up|create|register/i);
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('input[name="name"], input[placeholder*="name" i]')).toBeVisible();
  });

  test('should show error for non-METU email on registration', async ({ page }) => {
    await page.goto('/register');

    await page.fill('input[name="name"], input[placeholder*="name" i]', 'Test User');
    await page.fill('input[type="email"], input[name="email"]', 'test@gmail.com');
    await page.fill('input[type="password"]', 'password123');

    // Try to submit
    await page.click('button[type="submit"]');

    // Should show error
    await expect(page.locator('text=/metu.edu.tr/i')).toBeVisible({ timeout: 5000 });
  });

  test('should have link to registration from login', async ({ page }) => {
    await page.goto('/login');

    const registerLink = page.locator('a[href="/register"]');
    await expect(registerLink).toBeVisible();
  });

  test('should have link to login from registration', async ({ page }) => {
    await page.goto('/register');

    const loginLink = page.locator('a[href="/login"]');
    await expect(loginLink).toBeVisible();
  });

  test('should display forgot password link', async ({ page }) => {
    await page.goto('/login');

    const forgotLink = page.locator('a[href="/forgot-password"]');
    await expect(forgotLink).toBeVisible();
  });
});
