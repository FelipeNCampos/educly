import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers';

/**
 * Exemplo de teste que usa helpers de autenticação
 * Presume que a autenticação foi feita no setup global
 */

test.describe('Dashboard - Funcionalidades autenticadas', () => {
  // Cada teste herda a sessão autenticada do setup global
  
  test('deve exibir dashboard do usuário autenticado', async ({ page }) => {
    await page.goto('/dashboard');

    // Dashboard deve estar visible
    await expect(page.locator('text=Dashboard')).toBeVisible();
    
    // Verifica se há informações do usuário
    const userInfo = page.locator('[data-testid="user-info"]');
    await expect(userInfo).toBeVisible();
  });

  test('deve ter informações do usuário no header', async ({ page }) => {
    await page.goto('/dashboard');

    // Procura por elementos que indicam autenticação
    const profileElement = page.locator('[aria-label="Profile"], [aria-label="User menu"]').first();
    
    // Deve estar visível indicando que está autenticado
    await expect(profileElement).toBeVisible();
  });
});

test.describe('Logout', () => {
  test('deve fazer logout com sucesso', async ({ page }) => {
    // Começa no dashboard (autenticado)
    await page.goto('/dashboard');
    await expect(page.locator('text=Dashboard')).toBeVisible();

    // Faz logout usando o helper
    await AuthHelper.logout(page);

    // Deve ser redirecionado para login
    expect(page.url()).toContain('/auth') || expect(page.url()).toContain('/login');
  });
});
