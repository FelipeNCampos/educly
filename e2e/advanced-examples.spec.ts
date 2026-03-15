import { test, expect, Page } from '@playwright/test';
import { AuthHelper, TestErrorListener } from './helpers';

/**
 * Exemplos Avançados de Testes Playwright
 * Para aprender padrões mais complexos
 */

test.describe('Exemplos Avançados', () => {
  test.beforeEach(async ({ page }) => {
    // Setup para cada teste
    TestErrorListener.setupErrorListeners(page);
  });

  test('exemplo: verificar múltiplos elementos', async ({ page }) => {
    await page.goto('/dashboard');

    // Verificar vários elementos como um conjunto
    const requiredElements = [
      'text=Dashboard',
      '[data-testid="user-profile"]',
      '[data-testid="sidebar"]',
    ];

    for (const selector of requiredElements) {
      await expect(page.locator(selector)).toBeVisible({ timeout: 5000 });
    }
  });

  test('exemplo: interceptar requisições', async ({ page }) => {
    // Aguardar resposta específica
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/user') && response.status() === 200
    );

    await page.goto('/dashboard');
    const response = await responsePromise;

    expect(response.status()).toBe(200);

    // Verificar dados da resposta
    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('email');
  });

  test('exemplo: testar form com validação', async ({ page }) => {
    await page.goto('/profile');

    const form = page.locator('form');
    const input = form.locator('input[data-testid="email-input"]');
    const submitButton = form.locator('button[type="submit"]');

    // Preencher valor inválido
    await input.fill('email-invalido');
    await submitButton.click();

    // Deve mostrar erro de validação
    await expect(form.locator('[role="alert"]')).toContainText(/email|inválido/i);

    // Corrigir com valor válido
    await input.fill('valid@example.com');
    await submitButton.click();

    // Deve sumir com o erro
    await expect(form.locator('[role="alert"]')).not.toBeVisible();
  });

  test('exemplo: trabalhar com dropdowns', async ({ page }) => {
    await page.goto('/settings');

    // Abrir dropdown
    const dropdown = page.locator('[data-testid="language-select"]');
    await dropdown.click();

    // Selecionar opção
    await page.locator('text=Português').click();

    // Verificar seleção
    await expect(dropdown).toContainText('Português');
  });

  test('exemplo: verificar elemento dentro de tabela', async ({ page }) => {
    await page.goto('/lessons');

    // Encontrar linha específica
    const lessonRow = page
      .locator('table tbody tr')
      .filter({ hasText: 'Lesson Title' })
      .first();

    // Verificar conteúdo
    await expect(lessonRow.locator('td').nth(0)).toContainText('Lesson Title');
    await expect(lessonRow.locator('td').nth(1)).toContainText('In Progress');

    // Clicar botão dentro da linha
    await lessonRow.locator('button[data-testid="start-lesson"]').click();

    // Verificar redirecionamento
    await expect(page).toHaveURL(/\/lessons\/\d+/);
  });

  test('exemplo: testar modal/dialog', async ({ page }) => {
    await page.goto('/dashboard');

    // Abrir modal
    await page.locator('button[data-testid="delete-btn"]').click();

    // Aguardar modal ficar visível
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Verificar conteúdo do modal
    await expect(modal.locator('h2')).toContainText(/confirmar|confirmação/i);

    // Cancelar modal
    await modal.locator('button:has-text("Cancelar")').click();

    // Modal deve desaparecer
    await expect(modal).not.toBeVisible();
  });

  test('exemplo: testar paginação', async ({ page }) => {
    await page.goto('/courses');

    // Verificar página 1
    await expect(page.locator('[data-testid="page-indicator"]')).toContainText('1');

    // Ir para próxima página
    await page.locator('button[aria-label="Next page"]').click();

    // Aguardar mudança de conteúdo
    await page.waitForURL((url) => url.searchParams.get('page') === '2');

    // Verificar página 2
    await expect(page.locator('[data-testid="page-indicator"]')).toContainText('2');
  });

  test('exemplo: testar animações/transições', async ({ page }) => {
    await page.goto('/dashboard');

    // Esperar elemento aparecer com animação
    const element = page.locator('[data-testid="welcome-card"]');

    // Esperar estar visível e ter opacity final
    await expect(element).toBeVisible();

    // Verificar estilo final
    const opacity = await element.evaluate((el) => {
      return window.getComputedStyle(el).opacity;
    });
    expect(parseFloat(opacity)).toBe(1);
  });

  test('exemplo: testar responsividade', async ({ page }) => {
    // Teste em viewport mobile
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/dashboard');

    // Menu deve estar em ícone hamburger em mobile
    const hamburger = page.locator('[data-testid="mobile-menu-toggle"]');
    await expect(hamburger).toBeVisible();

    // Sidebar completa não deve estar visível
    const sidebar = page.locator('[data-testid="sidebar"]');
    await expect(sidebar).not.toBeVisible();

    // Abrir menu
    await hamburger.click();
    await expect(sidebar).toBeVisible();
  });

  test('exemplo: testar upload de arquivo', async ({ page }) => {
    await page.goto('/profile/upload-avatar');

    // Fazer upload de arquivo
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./test-assets/avatar.png');

    // Verificar preview
    const preview = page.locator('[data-testid="avatar-preview"]');
    await expect(preview).toBeVisible();

    // Submeter
    await page.locator('button[type="submit"]').click();

    // Verificar sucesso
    await expect(page.locator('text=Avatar atualizado')).toBeVisible();
  });

  test('exemplo: testar com dados dinâmicos', async ({ page }) => {
    // Gerar dados aleatórios
    const randomId = Math.floor(Math.random() * 1000);
    const testData = {
      name: `Test User ${randomId}`,
      email: `test${randomId}@example.com`,
    };

    await page.goto('/create-lesson');

    // Preencher com dados dinâmicos
    await page.locator('input[data-testid="name"]').fill(testData.name);
    await page.locator('input[data-testid="email"]').fill(testData.email);

    // Enviar
    await page.locator('button[type="submit"]').click();

    // Verificar que foi criado com os dados corretos
    await expect(page.locator(`text=${testData.name}`)).toBeVisible();
  });

  test('exemplo: testar notificaciones/toasts', async ({ page }) => {
    await page.goto('/dashboard');

    // Disparar ação que mostra toast
    await page.locator('button[data-testid="delete-item"]').click();

    // Buscar toast (normalmente fica em um container fixo)
    const toast = page.locator('[role="status"], [role="alert"]').filter({ hasText: /sucesso|sucesso|deletado/i });

    // Aguardar aparecer
    await expect(toast).toBeVisible();

    // Aguardar desaparecer (se tem auto-close)
    await expect(toast).not.toBeVisible({ timeout: 5000 });
  });

  test('exemplo: testar localStorage/sessionStorage', async ({ page }) => {
    await page.goto('/dashboard');

    // Verificar dados armazenados
    const userPrefs = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('userPreferences') || '{}');
    });

    expect(userPrefs).toHaveProperty('theme');

    // Modificar dados
    await page.evaluate(() => {
      localStorage.setItem('userPreferences', JSON.stringify({ theme: 'dark' }));
    });

    // Recarregar e verificar persistência
    await page.reload();

    const updatedPrefs = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('userPreferences') || '{}');
    });

    expect(updatedPrefs.theme).toBe('dark');
  });

  test('exemplo: testar scroll e infinite scroll', async ({ page }) => {
    await page.goto('/feed');

    // Scroll até fim
    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight);
    });

    // Aguardar novo conteúdo carregar
    const newItem = page.locator('[data-testid="feed-item"]').last();
    await expect(newItem).toBeVisible({ timeout: 5000 });

    // Verificar que tem mais itens que antes
    const itemCount = await page.locator('[data-testid="feed-item"]').count();
    expect(itemCount).toBeGreaterThan(10);
  });

  test('exemplo: testar keyboard navigation', async ({ page }) => {
    await page.goto('/search');

    // Focar input
    const searchInput = page.locator('input[data-testid="search"]');
    await searchInput.focus();

    // Digitar com Enter
    await searchInput.type('javascript');
    await page.keyboard.press('Enter');

    // Verificar resultados
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();

    // Navegar com Tab
    const firstResult = page.locator('[data-testid="search-result"]').first();
    await firstResult.focus();

    // Pressionar Enter para selecionar
    await page.keyboard.press('Enter');

    // Deve abrir resultado
    await expect(page).toHaveURL(/\/course\/\d+/);
  });
});

test.describe('Custom Page Fixture', () => {
  // Exemplo de como criar fixtures customizadas
  test('usando custom fixture', async ({ page }) => {
    // Setup customizado
    const logPageEvents = async (page: Page) => {
      page.on('console', (msg) => console.log(`LOG: ${msg.text()}`));
      page.on('request', (req) => console.log(`>> ${req.method()} ${req.url()}`));
      page.on('response', (res) => console.log(`<< ${res.status()} ${res.url()}`));
    };

    await logPageEvents(page);
    await page.goto('/dashboard');

    // Seu teste com logs detalhados
  });
});
