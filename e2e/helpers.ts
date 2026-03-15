import { Page, expect } from '@playwright/test';

/**
 * Utilitários e helpers para testes de autenticação
 */

export class AuthHelper {
  /**
   * Faz login com email e senha fornecidos
   */
  static async login(page: Page, email: string, password: string) {
    await page.goto('/auth?tab=login');
    await expect(page.locator('text=Login')).toBeVisible({ timeout: 5000 });

    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const loginButton = page.locator('button:has-text("Login")').first();

    await emailInput.fill(email);
    await passwordInput.fill(password);
    await loginButton.click();

    // Aguarda redirecionamento para dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 });
  }

  /**
   * Faz logout do sistema
   */
  static async logout(page: Page) {
    // Clica no menu/avatar do usuário (pode variar conforme design)
    const profileMenu = page.locator('[aria-label="Profile"], [aria-label="User menu"], button:has-text("Profile")').first();

    if (await profileMenu.isVisible()) {
      await profileMenu.click();

      // Clica na opção logout
      const logoutOption = page.locator('text=Logout, text=Sair, [role="menuitem"]:has-text("Logout")').first();
      await logoutOption.click();

      // Aguarda redirecionamento para página de login ou inicial
      await page.waitForURL(/\/(auth|login|$)/, { timeout: 10000 });
    }
  }

  /**
   * Verifica se o usuário está autenticado verificando se está no dashboard
   */
  static async isAuthenticated(page: Page): Promise<boolean> {
    try {
      await page.goto('/dashboard', { waitUntil: 'networkidle' });
      return !page.url().includes('/auth');
    } catch {
      return false;
    }
  }

  /**
   * Verifica se há sessão ativa via localStorage
   */
  static async hasActiveSession(page: Page): Promise<boolean> {
    const session = await page.evaluate(() => {
      return localStorage.getItem('sb-auth-token') || localStorage.getItem('supabase.auth.token');
    });

    return !!session;
  }

  /**
   * Tenta acessar endpoint protegido para verificar autenticação
   */
  static async verifyAuthViaAPI(page: Page, apiEndpoint: string = '/api/user'): Promise<boolean> {
    try {
      const response = await page.request.get(apiEndpoint);
      return response.status() === 200;
    } catch {
      return false;
    }
  }
}

/**
 * Fixture customizada para testes autenticados
 */
export const authenticatedTest = {
  beforeEach: async (page: Page) => {
    // Vai para dashboard (pressupõe que já está autenticado via setup)
    await page.goto('/dashboard');
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 5000 });
  },
};

/**
 * Listeners para monitorar erros durante testes
 */
export class TestErrorListener {
  static setupErrorListeners(page: Page) {
    // Log de erros no console da página
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error('Erro na página:', msg.text());
      }
    });

    // Log de requisições falhadas
    page.on('requestfailed', (request) => {
      console.warn(`Requisição falhou: ${request.url()}`);
    });

    // Log de respostas de erro
    page.on('response', (response) => {
      if (!response.ok() && response.status() >= 400) {
        console.warn(`Resposta com erro: ${response.status()} ${response.url()}`);
      }
    });

    // Log de crashes
    page.on('close', () => {
      console.log('Página foi fechada durante o teste');
    });
  }
}
