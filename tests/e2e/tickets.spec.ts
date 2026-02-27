import { test, expect } from '@playwright/test'

test.describe('Tickets Page — authenticated', () => {
  test.skip(!!process.env.CI && !process.env.E2E_AUTH_TOKEN, 'Requires auth token in CI')

  test('tickets page renders filter tabs', async ({ page }) => {
    await page.goto('/dashboard/tickets')
    await expect(page.getByText(/All/i).first()).toBeVisible({ timeout: 15000 })
    await expect(page.getByText(/Open/i).first()).toBeVisible()
    await expect(page.getByText(/Resolved/i)).toBeVisible()
  })

  test('tickets table is visible', async ({ page }) => {
    await page.goto('/dashboard/tickets')
    await expect(page.getByRole('table')).toBeVisible({ timeout: 15000 })
  })

  test('search input is interactive', async ({ page }) => {
    await page.goto('/dashboard/tickets')
    const search = page.getByPlaceholder(/search/i)
    await expect(search).toBeVisible()
    await search.fill('billing')
    // Table should update (or stay same if no matches)
    await expect(page.locator('table')).toBeVisible()
  })
})
