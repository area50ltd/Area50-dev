import { test, expect } from '@playwright/test'

test.describe('Auth — Login Page', () => {
  test('renders login page', async ({ page }) => {
    await page.goto('/login')
    // Clerk renders the sign-in component
    await expect(page.locator('body')).toBeVisible()
  })

  test('redirects unauthenticated users from /dashboard to /login', async ({ page }) => {
    await page.goto('/dashboard')
    // Should redirect to Clerk login
    await expect(page).toHaveURL(/login|sign-in/)
  })

  test('widget page is publicly accessible', async ({ page }) => {
    await page.goto('/widget?company_id=11111111-1111-1111-1111-111111111111')
    // Should not redirect to login
    await expect(page).not.toHaveURL(/login/)
  })
})
