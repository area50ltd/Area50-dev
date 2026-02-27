import { test, expect } from '@playwright/test'

test.describe('Billing Page — authenticated', () => {
  test.skip(!!process.env.CI && !process.env.E2E_AUTH_TOKEN, 'Requires auth token in CI')

  test('billing page renders plan cards', async ({ page }) => {
    await page.goto('/dashboard/billing')
    await expect(page.getByText(/Starter/i).first()).toBeVisible({ timeout: 15000 })
    await expect(page.getByText(/Growth/i).first()).toBeVisible()
    await expect(page.getByText(/Business/i).first()).toBeVisible()
  })

  test('credit top-up section is visible', async ({ page }) => {
    await page.goto('/dashboard/billing')
    await expect(page.getByText(/Credit|credits/i).first()).toBeVisible({ timeout: 15000 })
  })

  test('payment history table renders', async ({ page }) => {
    await page.goto('/dashboard/billing')
    await expect(page.getByRole('table')).toBeVisible({ timeout: 15000 })
  })
})
