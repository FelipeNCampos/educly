# Testes com Playwright - Educly

Este diretório contém os testes E2E (end-to-end) do projeto Educly usando Playwright.

## 🔐 Estrutura de Autenticação

A abordagem utiliza **Conta Compartilhada** com setup global:

- **`e2e/auth.setup.ts`**: Realiza login uma única vez e salva o estado da sessão
- **`playwright/.auth/user.json`**: Arquivo gerado com o estado autenticado (adicionado ao .gitignore)
- **`playwright.config.ts`**: Configurado com `dependencies: ['setup']` para reutilizar autenticação

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Email e senha para testes de autenticação
TEST_EMAIL=seu-email@example.com
TEST_PASSWORD=sua-senha-segura
```

### 2. Instalação de Dependências

```bash
npm install
# ou
yarn install
# ou
bun install
```

### 3. Iniciar o Servidor de Desenvolvimento

Em um terminal separado, inicie o servidor:

```bash
npm run dev
# ou
yarn dev
# ou
bun run dev
```

## 🚀 Rodando os Testes

### Executar todos os testes
```bash
npx playwright test
```

### Executar testes em um navegador específico
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Executar um arquivo de teste específico
```bash
npx playwright test e2e/auth.login.spec.ts
```

### Executar testes em uma linha específica
```bash
npx playwright test e2e/auth.login.spec.ts:42
```

### Modo Watch (re-executa ao alterações)
```bash
npx playwright test --watch
```

### Modo Debug
```bash
npx playwright test --debug
```

### Modo UI (interface visual)
```bash
npx playwright test --ui
```

## 📊 Visualizando Resultados

### Abrir relatório HTML
```bash
npx playwright show-report
```

## 📁 Estrutura de Arquivos

```
e2e/
├── auth.setup.ts           # Setup global - faz login uma vez
├── auth.login.spec.ts      # Testes de login e autenticação
├── dashboard.spec.ts       # Exemplo de testes autenticados
├── helpers.ts             # Funções utilitárias para testes
└── **/*.spec.ts           # Adicionar mais testes aqui

playwright/
└── .auth/
    └── user.json          # Estado autenticado (gitignored)

playwright.config.ts       # Configuração do Playwright
```

## 📝 Escrevendo Novos Testes

### Exemplo Basic (sem setup)
```typescript
import { test, expect } from '@playwright/test';

test('título do teste', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page).toHaveTitle('Esperado');
});
```

### Exemplo com Autenticação (usa setup automaticamente)
```typescript
import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers';

test('função autenticada', async ({ page }) => {
  // Já começa autenticado por causa do setup
  await page.goto('/dashboard');
  
  // Seu teste aqui
  await expect(page.locator('text=Dashboard')).toBeVisible();
});
```

### Usando Helpers
```typescript
import { AuthHelper } from './helpers';

// Fazer login manualmente
await AuthHelper.login(page, 'email@test.com', 'password123');

// Fazer logout
await AuthHelper.logout(page);

// Verificar se está autenticado
const isAuth = await AuthHelper.isAuthenticated(page);

// Verificar sessão via localStorage
const hasSession = await AuthHelper.hasActiveSession(page);
```

## 🔧 Troubleshooting

### "Não consegue autenticar no setup"
- Verifique se as variáveis `TEST_EMAIL` e `TEST_PASSWORD` estão corretas em `.env.local`
- Verifique se a URL `http://localhost:5173` está acessível
- Verifique se o servidor dev está rodando

### "playwright/.auth/user.json não foi criado"
- Rode só o setup: `npx playwright test e2e/auth.setup.ts`
- Verifique se há permissões de escrita na pasta `playwright/`
- Veja os logs para erro de autenticação específico

### "Testes falham de forma intermitente"
- Aumente timeouts na config: `timeout: 60000`
- Use `--workers=1` para testes sequenciais
- Verifique se é problema de rede ou de performance

### "Testes passam localmente mas falham no CI"
- Certifique-se que `reuseExistingServer: false` no CI
- Aumente timeouts para CI
- Verifique se `TEST_EMAIL` e `TEST_PASSWORD` são válidos no ambiente de CI

## 📚 Recursos

- [Documentação Playwright](https://playwright.dev)
- [Guia de Autenticação Playwright](https://playwright.dev/docs/auth)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Seletores](https://playwright.dev/docs/selectors)

## 💡 Boas Práticas

1. **Use IDs de teste**: Adicione `data-testid` aos elementos críticos
   ```tsx
   <button data-testid="login-button">Login</button>
   ```

2. **Espere elementos se tornarem visíveis/interativos**:
   ```typescript
   await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
   ```

3. **Use fixtures customizadas** para reutilizar padrões:
   ```typescript
   const test = baseTest.extend({
     authenticatedPage: async ({ page }, use) => {
       await AuthHelper.login(page, email, password);
       await use(page);
     },
   });
   ```

4. **Organize testes por feature** com `describe`
5. **Use o modo UI** para debugar interativamente
6. **Capture traces** de falhas (já configurado com `trace: 'on-first-retry'`)

## 🎯 Próximos Passos

- [ ] Adicionar testes para signup
- [ ] Adicionar testes para mudança de senha
- [ ] Adicionar testes de features autenticadas
- [ ] Configurar CI/CD para rodar testes
- [ ] Setup de contas único por worker (se precisar de isolamento de dados)
- [ ] Adicionar testes de performance
