import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

/**
 * Global setup para autenticação via UI
 * Faz login uma vez e salva o estado da sessão para todos os outros testes
 */
setup('autenticar usuário de teste', async ({ page, context }) => {
  // Vai para a página de login
  await page.goto('/auth?tab=login');

  // Verifica se está na página de login
  await expect(page.getByRole('tab', { name: 'Login' })).toBeVisible({ timeout: 10000 });

  // Preenche o formulário de login
  const emailInput = page.getByPlaceholder('your@email.com');
  const passwordInput = page.getByPlaceholder('Your password');
  const loginButton = page.getByRole('button', { name: /^Login$/ }).last();

  await emailInput.fill(process.env.TEST_EMAIL || 'felipe@gmail.com');
  await passwordInput.fill(process.env.TEST_PASSWORD || 'coto1423');

  // Clica no botão de login
  await loginButton.click();

  // Aguarda a navegação para o dashboard (indica login bem-sucedido)
  await page.waitForURL('/dashboard', { timeout: 10000 });

  // Aguarda o dashboard carregar completamente - aguarda conteúdo significativo
  // Tenta aguardar networkidle, mas continua mesmo se timeout (dados podem ser em tempo real)
  try {
    await page.waitForLoadState('networkidle', { timeout: 5000 });
  } catch {
    // Timeout é aceitável para aplicações com dados em tempo real
    console.log('⚠️ Network idle timeout - continuando mesmo assim');
  }

  // Aguarda um elemento do DOM estar pronto (qualquer conteúdo)
  await page.waitForSelector('body > *', { timeout: 10000 }).catch(() => {
    // Element pode estar carregado, continua
  });

  // Salva o estado da sessão (cookies, localStorage, sessionStorage, etc.)
  await context.storageState({ path: authFile });

  console.log(`✅ Autenticação concluída e estado salvo em ${authFile}`);
});
