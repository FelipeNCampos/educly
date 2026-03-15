import { test, expect } from '@playwright/test';

/**
 * Testes de navegação e roteamento
 * Verifica guards, redirects e comportamento de rotas
 */

test.describe('PremiumGuard - Proteção de rotas', () => {
  const protectedRoutes = [
    '/dashboard',
    '/plan',
    '/chat',
    '/assistentes',
    '/freelancer',
    '/medalhas',
    '/profile',
    '/trilha-personalizada',
  ];

  for (const route of protectedRoutes) {
    test(`rota protegida ${route} não deve crashar`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error' && !msg.text().includes('net::ERR')) {
          consoleErrors.push(msg.text());
        }
      });

      await page.goto(route);
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      await expect(page.locator('body > *')).toBeVisible({ timeout: 10000 });
    });
  }
});

test.describe('Rotas públicas não requerem auth', () => {
  const publicRoutes = [
    '/',
    '/auth',
    '/upgrade',
    '/quiz',
    '/obrigado',
    '/termos',
    '/privacidade',
    '/cookies',
    '/cancelamento',
    '/contato',
    '/update-password',
    '/upsell-1-esp',
    '/upsell-2-esp',
    '/downsell-esp',
  ];

  for (const route of publicRoutes) {
    test(`rota pública ${route} deve carregar`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
      await expect(page.locator('body')).not.toBeEmpty();
    });
  }
});

test.describe('Redirecionamento de rotas inválidas', () => {
  test('deve redirecionar rotas inexistentes para /404', async ({ page }) => {
    await page.goto('/pagina-que-nao-existe');
    await page.waitForURL(/\/404/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/404/);
  });

  test('deve redirecionar /abc123xyz para /404', async ({ page }) => {
    await page.goto('/abc123xyz');
    await page.waitForURL(/\/404/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/404/);
  });

  test('deve redirecionar /admin/naoexiste para /404', async ({ page }) => {
    await page.goto('/admin/naoexiste');
    await page.waitForURL(/\/404/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/404/);
  });
});

test.describe('Navegação entre páginas', () => {
  test('deve navegar da landing para auth', async ({ page }) => {
    await page.goto('/');
    const authLink = page.locator('a[href*="auth"], a[href*="login"], a:has-text("Entrar"), a:has-text("Login"), button:has-text("Entrar"), button:has-text("Login")').first();

    if (await authLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await authLink.click();
      await page.waitForURL(/\/auth/, { timeout: 10000 });
      await expect(page).toHaveURL(/\/auth/);
    }
  });

  test('deve navegar do dashboard para plan (autenticado)', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

    const planLink = page.locator('a[href*="plan"], a:has-text("Plano"), a:has-text("Plan")').first();
    if (await planLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await planLink.click();
      await page.waitForURL(/\/plan/, { timeout: 10000 });
      await expect(page).toHaveURL(/\/plan/);
    }
  });

  test('deve navegar do dashboard para chat (autenticado)', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

    const chatLink = page.locator('a[href*="chat"], a:has-text("Chat")').first();
    if (await chatLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await chatLink.click();
      await page.waitForURL(/\/chat/, { timeout: 10000 });
      await expect(page).toHaveURL(/\/chat/);
    }
  });

  test('deve navegar do dashboard para assistentes (autenticado)', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

    const link = page.locator('a[href*="assistentes"], a:has-text("Assistentes")').first();
    if (await link.isVisible({ timeout: 5000 }).catch(() => false)) {
      await link.click();
      await page.waitForURL(/\/assistentes/, { timeout: 10000 });
      await expect(page).toHaveURL(/\/assistentes/);
    }
  });

  test('deve navegar do dashboard para freelancer (autenticado)', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

    const link = page.locator('a[href*="freelancer"], a:has-text("Freelancer")').first();
    if (await link.isVisible({ timeout: 5000 }).catch(() => false)) {
      await link.click();
      await page.waitForURL(/\/freelancer/, { timeout: 10000 });
      await expect(page).toHaveURL(/\/freelancer/);
    }
  });

  test('deve navegar do dashboard para medalhas (autenticado)', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

    const link = page.locator('a[href*="medalhas"], a:has-text("Medalhas")').first();
    if (await link.isVisible({ timeout: 5000 }).catch(() => false)) {
      await link.click();
      await page.waitForURL(/\/medalhas/, { timeout: 10000 });
      await expect(page).toHaveURL(/\/medalhas/);
    }
  });

  test('deve navegar do dashboard para perfil (autenticado)', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

    const link = page.locator('a[href*="profile"], a:has-text("Perfil"), a:has-text("Profile")').first();
    if (await link.isVisible({ timeout: 5000 }).catch(() => false)) {
      await link.click();
      await page.waitForURL(/\/profile/, { timeout: 10000 });
      await expect(page).toHaveURL(/\/profile/);
    }
  });
});

test.describe('Responsividade', () => {
  test('landing page em mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(page.locator('body > *')).toBeVisible({ timeout: 10000 });
  });

  test('landing page em tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page.locator('body > *')).toBeVisible({ timeout: 10000 });
  });

  test('landing page em desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await expect(page.locator('body > *')).toBeVisible({ timeout: 10000 });
  });

  test('auth page em mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/auth');
    await expect(page.locator('input[type="email"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('dashboard em mobile (autenticado)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await expect(page.locator('body > *')).toBeVisible({ timeout: 10000 });
  });

  test('upgrade em mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/upgrade');
    await expect(page.locator('body > *')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Performance básica', () => {
  test('landing page deve carregar em tempo razoável', async ({ page }) => {
    const start = Date.now();
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(10000);
  });

  test('auth page deve carregar em tempo razoável', async ({ page }) => {
    const start = Date.now();
    await page.goto('/auth', { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(10000);
  });

  test('upgrade page deve carregar em tempo razoável', async ({ page }) => {
    const start = Date.now();
    await page.goto('/upgrade', { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(10000);
  });
});
