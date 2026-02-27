import { test, expect } from '@playwright/test'

const WIDGET_URL = '/widget?company_id=11111111-1111-1111-1111-111111111111'

test.describe('Customer Widget', () => {
  test('widget launcher is visible on load', async ({ page }) => {
    await page.goto(WIDGET_URL)
    // The launcher button should be visible
    const launcher = page.locator('[data-testid="widget-launcher"], button').first()
    await expect(launcher).toBeVisible({ timeout: 10000 })
  })

  test('widget page loads without redirecting to login', async ({ page }) => {
    await page.goto(WIDGET_URL)
    await expect(page).not.toHaveURL(/login/)
    await expect(page).toHaveURL(new RegExp(WIDGET_URL.replace('?', '\\?')))
  })

  test('page has no JS errors on load', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))
    await page.goto(WIDGET_URL)
    await page.waitForTimeout(2000)
    expect(errors).toHaveLength(0)
  })
})
