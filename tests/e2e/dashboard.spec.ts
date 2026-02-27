import { test, expect } from '@playwright/test'

// Dashboard e2e tests require authentication.
// In CI, set CLERK_TEST_USER_TOKEN or use a test account.
// These tests use storage state set up by auth.setup.ts.

test.describe('Dashboard — authenticated', () => {
  // Skip in CI unless auth state is available
  test.skip(!!process.env.CI && !process.env.E2E_AUTH_TOKEN, 'Requires auth token in CI')

  test('dashboard home shows stats cards', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByText(/Total Tickets/i)).toBeVisible({ timeout: 15000 })
  })

  test('sidebar navigation is visible', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByText(/Tickets/i).first()).toBeVisible()
    await expect(page.getByText(/Knowledge/i)).toBeVisible()
    await expect(page.getByText(/Agents/i)).toBeVisible()
  })
})
