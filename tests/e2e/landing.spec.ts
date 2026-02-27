import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('renders the hero headline', async ({ page }) => {
    await expect(page.getByText(/AI That Handles Support/i)).toBeVisible()
  })

  test('has two CTA buttons in hero', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Start Free Trial/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Book Demo/i })).toBeVisible()
  })

  test('navbar has Login button', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Login/i }).first()).toBeVisible()
  })

  test('navbar has Get Started CTA', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Get Started/i })).toBeVisible()
  })

  test('pricing section shows three plans', async ({ page }) => {
    await page.getByText(/Pricing/i).first().scrollIntoViewIfNeeded()
    await expect(page.getByText(/Starter/i).first()).toBeVisible()
    await expect(page.getByText(/Growth/i).first()).toBeVisible()
    await expect(page.getByText(/Business/i).first()).toBeVisible()
  })

  test('footer renders', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(page.getByText(/Area50/i).last()).toBeVisible()
  })

  test('page title is set', async ({ page }) => {
    await expect(page).toHaveTitle(/Area50/i)
  })
})
