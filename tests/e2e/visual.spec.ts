import { test, expect } from "@playwright/test"

test.describe("Regressão Visual - Telas Principais", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await page.evaluate(() => {
      localStorage.clear()
      if ((window as any).__mockDb) {
        (window as any).__mockDb.resetToKnownState()
      }
    })
    await page.reload()
    await page.waitForLoadState("networkidle")
  })

  test("Snapshot Visual: Início / Catálogo", async ({ page }) => {
    await page.goto("/")
    await page.waitForSelector("main")
    // Captura screenshot da página inicial estável
    await expect(page).toHaveScreenshot("home-page.png", {
      maxDiffPixelRatio: 0.1,
      animations: "disabled",
    })
  })

  test("Snapshot Visual: Detalhe do NFT", async ({ page }) => {
    await page.goto("/nft/nft-1")
    await page.waitForSelector("h1")
    await expect(page).toHaveScreenshot("nft-detail.png", {
      maxDiffPixelRatio: 0.1,
      animations: "disabled",
    })
  })

  test("Snapshot Visual: Carrinho de Compras", async ({ page }) => {
    await page.goto("/nft/nft-1")
    await page.getByRole("button", { name: /Adicionar ao Carrinho/i }).click()
    await page.goto("/cart")
    await page.waitForSelector("h1")
    await expect(page).toHaveScreenshot("cart-page.png", {
      maxDiffPixelRatio: 0.1,
      animations: "disabled",
    })
  })

  test("Snapshot Visual: Tela de Pagamento / Checkout", async ({ page }) => {
    // Login
    await page.goto("/")
    await page.evaluate(() => {
      (window as any).__mockDb.logout()
    })
    await page.reload()
    await page.getByRole("button", { name: "Conectar" }).first().click()
    await page.locator("#login-email").fill("contato@email.com")
    await page.locator("#login-password").fill("123456")
    await page.getByRole("button", { name: "Entrar", exact: true }).click()

    await page.goto("/nft/nft-1")
    await page.getByRole("button", { name: /Adicionar ao Carrinho/i }).click()
    await page.goto("/checkout")
    await page.waitForSelector("h1")
    await expect(page).toHaveScreenshot("checkout-page.png", {
      maxDiffPixelRatio: 0.1,
      animations: "disabled",
    })
  })
})
