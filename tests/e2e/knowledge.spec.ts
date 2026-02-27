import { test, expect } from '@playwright/test'

test.describe('Knowledge Base Page — authenticated', () => {
  test.skip(!!process.env.CI && !process.env.E2E_AUTH_TOKEN, 'Requires auth token in CI')

  test('knowledge page renders upload area', async ({ page }) => {
    await page.goto('/dashboard/knowledge')
    await expect(page.getByText(/Upload|Drop/i).first()).toBeVisible({ timeout: 15000 })
  })

  test('shows accepted file types', async ({ page }) => {
    await page.goto('/dashboard/knowledge')
    await expect(page.getByText(/\.pdf/i)).toBeVisible()
  })

  test('document list table is rendered', async ({ page }) => {
    await page.goto('/dashboard/knowledge')
    await expect(page.getByRole('table')).toBeVisible({ timeout: 15000 })
  })
})
