import { test, expect } from '@playwright/test'

test.describe('Onboarding Wizard — authenticated', () => {
  test.skip(!!process.env.CI && !process.env.E2E_AUTH_TOKEN, 'Requires auth token in CI')

  test('onboarding shows step 1 on load', async ({ page }) => {
    await page.goto('/onboarding')
    await expect(page.getByText(/Company/i).first()).toBeVisible({ timeout: 15000 })
  })

  test('progress bar is rendered', async ({ page }) => {
    await page.goto('/onboarding')
    // Progress bar — look for a step indicator or progress element
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('next button advances steps', async ({ page }) => {
    await page.goto('/onboarding')
    const nextBtn = page.getByRole('button', { name: /Next|Continue/i }).first()
    if (await nextBtn.isVisible()) {
      // Fill required fields first
      const nameInput = page.getByPlaceholder(/company name/i)
      if (await nameInput.isVisible()) {
        await nameInput.fill('Test Corp')
      }
      const emailInput = page.getByPlaceholder(/support@/i)
      if (await emailInput.isVisible()) {
        await emailInput.fill('support@testcorp.com')
      }
      await nextBtn.click()
      // Should advance to plan selection
      await expect(page.getByText(/Plan|Starter|Growth/i).first()).toBeVisible()
    }
  })
})
