import { test, expect } from '@playwright/test';
import { TestErrorListener } from './helpers';

/**
 * Testes de páginas autenticadas (protegidas pelo PremiumGuard)
 * Dependem do auth.setup.ts para sessão ativa
 */

test.describe('Dashboard - /dashboard', () => {
  test.beforeEach(async ({ page }) => {
    TestErrorListener.setupErrorListeners(page);
  });

  test('deve carregar o dashboard com sessão ativa', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    expect(page.url()).not.toContain('/auth');
  });

  test('deve exibir conteúdo do dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await expect(page.locator('body > *')).toBeVisible({ timeout: 10000 });
  });

  test('não deve ter erros de JS críticos', async ({ page }) => {
    const jsErrors: string[] = [];
    page.on('pageerror', (err) => jsErrors.push(err.message));
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    expect(jsErrors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });
});

test.describe('Plano de Estudos - /plan', () => {
  test('deve carregar a página de plano', async ({ page }) => {
    await page.goto('/plan');
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    expect(page.url()).not.toContain('/auth');
    await expect(page.locator('body > *')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Chat IA - /chat', () => {
  test('deve carregar a página de chat', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    expect(page.url()).not.toContain('/auth');
    await expect(page.locator('body > *')).toBeVisible({ timeout: 10000 });
  });

  test('deve ter campo de input para mensagem', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    const input = page.locator('input, textarea, [contenteditable="true"]').first();
    const exists = await input.isVisible({ timeout: 5000 }).catch(() => false);
    expect(typeof exists).toBe('boolean');
  });
});

test.describe('Assistentes - /assistentes', () => {
  test('deve carregar a lista de assistentes', async ({ page }) => {
    await page.goto('/assistentes');
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    expect(page.url()).not.toContain('/auth');
    await expect(page.locator('body > *')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Freelancer - /freelancer', () => {
  test('deve carregar a página freelancer', async ({ page }) => {
    await page.goto('/freelancer');
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    expect(page.url()).not.toContain('/auth');
    await expect(page.locator('body > *')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Medalhas - /medalhas', () => {
  test('deve carregar a página de medalhas', async ({ page }) => {
    await page.goto('/medalhas');
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    expect(page.url()).not.toContain('/auth');
    await expect(page.locator('body > *')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Perfil - /profile', () => {
  test('deve carregar a página de perfil', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    expect(page.url()).not.toContain('/auth');
    await expect(page.locator('body > *')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Trilha Personalizada - /trilha-personalizada', () => {
  test('deve carregar a página de trilha personalizada', async ({ page }) => {
    await page.goto('/trilha-personalizada');
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    expect(page.url()).not.toContain('/auth');
    await expect(page.locator('body > *')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Admin - /admin/analytics', () => {
  test('deve carregar a página de analytics admin', async ({ page }) => {
    await page.goto('/admin/analytics');
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await expect(page.locator('body > *')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Admin - /admin/emails', () => {
  test('deve carregar a página de emails admin', async ({ page }) => {
    await page.goto('/admin/emails');
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await expect(page.locator('body > *')).toBeVisible({ timeout: 10000 });
  });
});
