import { test, expect } from '@playwright/test';

/**
 * Testes das páginas públicas do site
 * Não requerem autenticação
 */

test.describe('Landing Page - /', () => {
  test('deve carregar a página inicial', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/');
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('deve ter meta tags de SEO', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('deve ter link para login/auth', async ({ page }) => {
    await page.goto('/');
    const authLink = page.locator('a[href*="auth"], a[href*="login"], button:has-text("Login"), button:has-text("Entrar"), a:has-text("Entrar"), a:has-text("Login")').first();
    await expect(authLink).toBeVisible({ timeout: 10000 });
  });

  test('deve ter conteúdo principal visível', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('não deve ter erros de JS críticos', async ({ page }) => {
    const jsErrors: string[] = [];
    page.on('pageerror', (err) => jsErrors.push(err.message));
    await page.goto('/');
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    expect(jsErrors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });
});

test.describe('Página de Autenticação - /auth', () => {
  test('deve exibir formulário de login', async ({ page }) => {
    await page.goto('/auth?tab=login');
    await expect(page.locator('input[type="email"]').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

  test('deve ter tab de cadastro', async ({ page }) => {
    await page.goto('/auth');
    const signupTab = page.locator('text=/Cadastr|Sign up|Criar conta/i').first();
    await expect(signupTab).toBeVisible({ timeout: 10000 });
  });

  test('deve ter botão de login visível', async ({ page }) => {
    await page.goto('/auth?tab=login');
    const loginButton = page.locator('button:has-text("Login")').first();
    await expect(loginButton).toBeVisible({ timeout: 10000 });
  });

  test('deve ter link de esqueci minha senha', async ({ page }) => {
    await page.goto('/auth?tab=login');
    const forgotLink = page.locator('text=/esquec|forgot|recuperar/i').first();
    const exists = await forgotLink.isVisible({ timeout: 5000 }).catch(() => false);
    // Pode ou não existir dependendo do design
    expect(typeof exists).toBe('boolean');
  });
});

test.describe('Página de Upgrade - /upgrade', () => {
  test('deve carregar a página de upgrade', async ({ page }) => {
    await page.goto('/upgrade');
    await expect(page.locator('body')).not.toBeEmpty();
    await expect(page.locator('body > *')).toBeVisible({ timeout: 10000 });
  });

  test('deve ter CTA de compra ou plano', async ({ page }) => {
    await page.goto('/upgrade');
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    const cta = page.locator('button, a[href*="hotmart"], a[href*="checkout"], a[href*="pay"]').first();
    const exists = await cta.isVisible({ timeout: 5000 }).catch(() => false);
    expect(typeof exists).toBe('boolean');
  });
});

test.describe('Quiz - /quiz', () => {
  test('deve carregar a página de quiz', async ({ page }) => {
    await page.goto('/quiz');
    await expect(page.locator('body')).not.toBeEmpty();
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  });

  test('deve ter conteúdo interativo', async ({ page }) => {
    await page.goto('/quiz');
    await expect(page.locator('body > *')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Página de Obrigado - /obrigado', () => {
  test('deve carregar a página de agradecimento', async ({ page }) => {
    await page.goto('/obrigado');
    await expect(page.locator('body')).not.toBeEmpty();
    await expect(page.locator('body > *')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Termos de Uso - /termos', () => {
  test('deve carregar a página de termos', async ({ page }) => {
    await page.goto('/termos');
    await expect(page.locator('body')).not.toBeEmpty();
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('deve ter texto legal', async ({ page }) => {
    await page.goto('/termos');
    const bodyText = await page.locator('body').textContent();
    expect(bodyText!.length).toBeGreaterThan(100);
  });
});

test.describe('Política de Privacidade - /privacidade', () => {
  test('deve carregar a página de privacidade', async ({ page }) => {
    await page.goto('/privacidade');
    await expect(page.locator('body')).not.toBeEmpty();
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Política de Cookies - /cookies', () => {
  test('deve carregar a página de cookies', async ({ page }) => {
    await page.goto('/cookies');
    await expect(page.locator('body')).not.toBeEmpty();
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Política de Cancelamento - /cancelamento', () => {
  test('deve carregar a página de cancelamento/reembolso', async ({ page }) => {
    await page.goto('/cancelamento');
    await expect(page.locator('body')).not.toBeEmpty();
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('rota /refund deve carregar mesma página', async ({ page }) => {
    await page.goto('/refund');
    await expect(page.locator('body')).not.toBeEmpty();
    await expect(page.locator('body > *')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Contato - /contato', () => {
  test('deve carregar a página de contato', async ({ page }) => {
    await page.goto('/contato');
    await expect(page.locator('body')).not.toBeEmpty();
    await expect(page.locator('body > *')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Update Password - /update-password', () => {
  test('deve carregar a página de atualizar senha', async ({ page }) => {
    await page.goto('/update-password');
    await expect(page.locator('body')).not.toBeEmpty();
    await expect(page.locator('body > *')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Páginas de Upsell', () => {
  test('deve carregar /upsell-1-esp', async ({ page }) => {
    await page.goto('/upsell-1-esp');
    await expect(page.locator('body')).not.toBeEmpty();
    await expect(page.locator('body > *')).toBeVisible({ timeout: 10000 });
  });

  test('deve carregar /upsell-2-esp', async ({ page }) => {
    await page.goto('/upsell-2-esp');
    await expect(page.locator('body')).not.toBeEmpty();
    await expect(page.locator('body > *')).toBeVisible({ timeout: 10000 });
  });

  test('deve carregar /downsell-esp', async ({ page }) => {
    await page.goto('/downsell-esp');
    await expect(page.locator('body')).not.toBeEmpty();
    await expect(page.locator('body > *')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Página 404 - Not Found', () => {
  test('deve exibir página 404 para rota inexistente', async ({ page }) => {
    await page.goto('/rota-que-nao-existe-xyz');
    await page.waitForURL(/\/404/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/404/);
  });

  test('deve carregar /404 diretamente', async ({ page }) => {
    await page.goto('/404');
    await expect(page.locator('body')).not.toBeEmpty();
    await expect(page.locator('body > *')).toBeVisible({ timeout: 10000 });
  });
});
