import { test, expect } from '@playwright/test'

test.describe('Agent Chat — authenticated agent', () => {
  test.skip(!!process.env.CI && !process.env.E2E_AUTH_TOKEN, 'Requires auth token in CI')

  test('chat page renders split layout', async ({ page }) => {
    // Use a known ticket ID from your test DB
    await page.goto('/agent/chat/33333333-3333-3333-3333-333333333333')
    // Should render the chat input area
    await expect(page.getByPlaceholder(/Type a message|message/i)).toBeVisible({ timeout: 15000 })
  })

  test('suggestion panel is visible', async ({ page }) => {
    await page.goto('/agent/chat/33333333-3333-3333-3333-333333333333')
    await expect(page.getByText(/Suggestion|AI Suggest/i).first()).toBeVisible({ timeout: 15000 })
  })
})
