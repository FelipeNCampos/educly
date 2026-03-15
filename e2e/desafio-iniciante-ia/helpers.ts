import { Page, expect } from '@playwright/test';

/**
 * Helpers específicos para testes do Desafio Iniciante de IA
 */
export class DesafioInicianteIAHelper {
  static async navigateToChallenge(page: Page) {
    await page.goto('/desafio/chatgpt');
    await expect(page.locator('text=Desafio Iniciante de IA').first()).toBeVisible({ timeout: 10000 });
  }

  static async waitForDayContent(page: Page, dayNumber: number) {
    // tenta esperar a rede estabilizar, mas não falha se demorar
    await page.waitForLoadState('networkidle').catch(() => {});
    // aguarda conteúdo principal do passo aparecer
    await expect(page.locator('[role="article"]')).toBeVisible({ timeout: 10000 });
  }

  static async isOnDay(page: Page, dayNumber: number): Promise<boolean> {
    const url = page.url();
    return url.includes(`/dia/${dayNumber}`);
  }

  static async navigateToDay(page: Page, dayNumber: number) {
    await page.goto(`/desafio/chatgpt/dia/${dayNumber}`);
    await this.waitForDayContent(page, dayNumber);
  }

  static async clickNextButton(page: Page) {
    const nextButton = page.locator('button:has-text("Próximo"), button:has-text("→"), [aria-label="Next"]').last();
    await expect(nextButton).toBeVisible({ timeout: 5000 });
    await expect(nextButton).toBeEnabled();
    await nextButton.click();
    await page.waitForTimeout(500);
  }

  static async clickContinueButton(page: Page) {
    const continueButton = page.locator('button:has-text("Continuar"), button:has-text("Continue")').last();
    await expect(continueButton).toBeVisible({ timeout: 5000 });
    await continueButton.click();
    await page.waitForTimeout(500);
  }

  static async getProgress(page: Page): Promise<{ currentStep: number; totalSteps: number }> {
    // Tenta obter elemento de progresso por data-testid primeiro
    const locator = page.locator('[data-testid="lesson-progress"], text=/\\d+\\/\\d+/');
    const text = await locator.first().textContent();

    if (!text) throw new Error('Elemento de progresso não encontrado');

    const match = text.match(/(\d+)\s*\/\s*(\d+)/);
    if (!match) throw new Error(`Progresso inválido: ${text}`);

    const current = Number(match[1]);
    const total = Number(match[2]);

    return { currentStep: current, totalSteps: total };
  }

  static async interactWithMatchWords(page: Page, pairIndex: number) {
    const leftItems = page.locator('[data-testid="match-left-item"]');
    const rightItems = page.locator('[data-testid="match-right-item"]');

    await expect(leftItems.nth(pairIndex)).toBeVisible({ timeout: 5000 });
    await leftItems.nth(pairIndex).click();
    await expect(rightItems.nth(pairIndex)).toBeVisible({ timeout: 5000 });
    await rightItems.nth(pairIndex).click();
    await page.waitForTimeout(300);
  }

  static async completeMatchWords(page: Page) {
    const pairs = await page.locator('[data-testid="match-left-item"]').count();
    for (let i = 0; i < pairs; i++) {
      await this.interactWithMatchWords(page, i);
    }
    await expect(page.locator('text=Correto!, text=Parabéns!')).toBeVisible({ timeout: 5000 }).catch(() => {});
  }

  static async interactWithFillBlanks(page: Page, answers: string[]) {
    const inputs = page.locator('input[data-testid="fill-blank-input"], input[placeholder*="blank"]');
    const count = Math.min(answers.length, await inputs.count());
    for (let i = 0; i < count; i++) {
      await inputs.nth(i).fill(answers[i]);
    }
    const verifyBtn = page.locator('button:has-text("Verificar"), button:has-text("Check")').first();
    if (await verifyBtn.isVisible().catch(() => false)) {
      await verifyBtn.click();
    }
    await expect(page.locator('text=Correto!, text=Parabéns!')).toBeVisible({ timeout: 5000 }).catch(() => {});
  }

  static async interactWithPromptTrainer(page: Page, prompt: string) {
    const promptInput = page.locator('textarea[placeholder*="prompt"], input[placeholder*="prompt"], [contenteditable="true"]').first();
    await expect(promptInput).toBeVisible({ timeout: 5000 });
    await promptInput.fill(prompt);

    const submitButton = page.locator('button:has-text("Enviar"), button:has-text("Submit")').last();
    await expect(submitButton).toBeVisible({ timeout: 5000 });
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    await expect(page.locator('[data-testid="ai-response"], text=PROMPT APROVADO')).toBeVisible({ timeout: 30000 }).catch(() => {});
  }

  static async readTextStep(page: Page) {
    const content = page.locator('[role="article"]');
    await expect(content).toBeVisible({ timeout: 10000 });
    await page.evaluate(() => {
      document.querySelector('[role="article"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    await page.waitForTimeout(1000);
  }

  static async getCurrentStepTitle(page: Page): Promise<string | null> {
    const headings = page.locator('[role="article"] h1, [role="article"] h2, [role="article"] h3, [data-testid="step-title"]');
    if (await headings.count() > 0) {
      return (await headings.first().textContent())?.trim() ?? null;
    }
    const content = page.locator('[role="article"]');
    return (await content.first().textContent())?.trim() ?? null;
  }

  static async hasCompleteButton(page: Page): Promise<boolean> {
    const button = page.locator('button:has-text("Completar"), button:has-text("Finished"), button:has-text("Concluir")').first();
    return await button.isVisible().catch(() => false);
  }

  static async completeDay(page: Page) {
    const completeButton = page.locator('button:has-text("Completar"), button:has-text("Concluir")').last();
    if (await completeButton.isVisible().catch(() => false)) {
      await completeButton.click();
      // espera algum indicador de conclusão aparecer
      await page.locator('[data-testid="lesson-completed"], text=✅, text=Concluído').first().waitFor({ timeout: 10000 }).catch(() => {});
    }
  }

  static async isDayCompleted(page: Page): Promise<boolean> {
    const completedBadge = page.locator('[data-testid="lesson-completed"], text=✅, text=Concluído');
    return await completedBadge.isVisible().catch(() => false);
  }

  static async backToChallenge(page: Page) {
    const backButton = page.locator('button[aria-label="Back"], button:has-text("←"), a:has-text("Voltar")').first();
    if (await backButton.isVisible().catch(() => false)) {
      await backButton.click();
      await page.waitForURL(/\/desafio\//, { timeout: 10000 }).catch(() => {});
    } else {
      const url = page.url();
      if (url.includes('/dia/')) {
        const challengePath = url.replace(/\/dia\/\d+$/, '');
        await page.goto(challengePath);
      }
    }
  }
}
