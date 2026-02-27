import { test, expect } from '@playwright/test'

test.describe('Agent Queue — authenticated agent', () => {
  test.skip(!!process.env.CI && !process.env.E2E_AUTH_TOKEN, 'Requires auth token in CI')

  test('queue page renders status toggle', async ({ page }) => {
    await page.goto('/agent/queue')
    await expect(page.getByText(/Online|Away|Offline/i).first()).toBeVisible({ timeout: 15000 })
  })

  test('queue stats bar is visible', async ({ page }) => {
    await page.goto('/agent/queue')
    await expect(page.getByText(/Active Chats|Queue/i).first()).toBeVisible({ timeout: 15000 })
  })
})
