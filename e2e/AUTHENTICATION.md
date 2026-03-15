# 🔐 Documentação de Autenticação nos Testes Playwright

## Visão Geral da Estratégia

O projeto utiliza a abordagem de **Conta Compartilhada com Setup Global**. Isso significa:

1. **Uma autenticação por sessão de teste** - Login é feito uma única vez no setup
2. **Estado persistido** - O estado autenticado é salvo em `playwright/.auth/user.json`
3. **Reutilização** - Todos os testes usam o mesmo estado de autenticação
4. **Eficiência** - Testar n recursos leva muito menos tempo

## Como Funciona

```
┌─────────────────────────────────────────────┐
│         Início da Execução de Testes        │
└─────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────┐
│    Projeto 'setup' executa (uma única vez)  │
│  - auth.setup.ts faz login via UI            │
│  - Salva estado em playwright/.auth/user.json│
└─────────────────────────────────────────────┘
                      ↓
        ┌─────────────────────────┐
        │   Setup Completo?       │
        │   Continuar?            │
        └─────────────────────────┘
         /        |        \
        /         |         \
       ↓          ↓          ↓
  ┌────────┐ ┌────────┐ ┌────────┐
  │Project │ │Project │ │Project │
  │Chromium│ │Firefox │ │Webkit  │
  │(paralelo) (paralelo) (paralelo)
  └────────┘ └────────┘ └────────┘
       ↓          ↓          ↓
  Carrega     Carrega     Carrega
  Storage     Storage     Storage
  State       State       State
     ↓          ↓          ↓
  ┌──────────────────────────────┐
  │  Todos os testes passam com  │
  │  contexto autenticado        │
  └──────────────────────────────┘
```

## Arquivos Chave

### 1. `e2e/auth.setup.ts`
```typescript
setup('autenticar usuário de teste', async ({ page, context }) => {
  // Vai para login
  await page.goto('/auth?tab=login');

  // Preenche credenciais
  await page.locator('input[type="email"]').fill(process.env.TEST_EMAIL);
  await page.locator('input[type="password"]').fill(process.env.TEST_PASSWORD);

  // Clica login
  await page.locator('button:has-text("Login")').click();

  // Aguarda dashboard (confirmação de sucesso)
  await page.waitForURL('/dashboard');

  // ⭐ CRUCIAL: Salva o estado autenticado
  await context.storageState({ path: 'playwright/.auth/user.json' });
});
```

**O que é `storageState`?**
Salva:
- 🍪 Cookies (incluindo auth tokens)
- 💾 LocalStorage
- 💾 SessionStorage

### 2. `playwright.config.ts` - Configuração de Projects
```typescript
projects: [
  // Setup - roda primeiro
  {
    name: 'setup',
    testMatch: /.*\.setup\.ts/,
    use: { ...devices['Desktop Chrome'] },
  },

  // Testes que usam a autenticação
  {
    name: 'chromium',
    use: { 
      ...devices['Desktop Chrome'],
      storageState: 'playwright/.auth/user.json'  // ⭐ Carrega estado
    },
    dependencies: ['setup'],  // ⭐ Depende do setup
  },
  // ... firefox, webkit similar
];
```

**O que `dependencies: ['setup']` faz?**
- Garante que `setup` roda antes de qualquer teste
- Só roda uma vez por sessão
- Todos os others projects esperão ele completar

### 3. `playwright/.auth/user.json` (Gerado automaticamente)
```json
{
  "cookies": [
    {
      "name": "sb-auth-token",
      "value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "domain": "localhost",
      "path": "/",
      "expires": 1704067200,
      "httpOnly": true,
      "secure": false,
      "sameSite": "Lax"
    }
  ],
  "origins": [
    {
      "origin": "http://localhost:5173",
      "localStorage": [
        {
          "name": "supabase.auth.token",
          "value": "{...}"
        }
      ]
    }
  ]
}
```

## Fluxo de Um Teste

```
Test começa
    ↓
Context recebe storageState de user.json
    ↓
Cookies, localStorage, etc são restaurados
    ↓
Quando página abre, já está autenticada ✅
    ↓
JWT token é válido
    ↓
Requests para API incluem autorização
    ↓
Teste pode acessar recursos protegidos
```

## Casos de Uso Ideais

✅ **Use conta compartilhada quando:**
- Seus testes não modificam o estado do servidor
- Múltiplos testes podem compartilhar o mesmo usuário
- Quer velocidade (setup uma única vez)
- O isolamento de dados não é crítico

❌ **NÃO use quando:**
- Teste A modifica dados que Teste B vai ler/usar
- Precisa testar múltiplos usuários simultaneamente
- Teste deixa estado inconsistente
- Testes precisam começar limpos

## Alternativas

### Contas Únicas por Worker
```typescript
setup('setup browser context', async ({ browser }) => {
  const context = await browser.newContext();
  // Cada worker (thread) teria sua conta única
  // Mais isolamento mas mais lento
});
```

### Para múltiplos usuários:
```typescript
projects: [
  { 
    name: 'setup-user1',
    testMatch: /.*\.setup\.ts/,
  },
  { 
    name: 'setup-user2',
    testMatch: /.*\.setup\.ts/,
  },
  { 
    name: 'tests-user1',
    dependencies: ['setup-user1'],
  },
  { 
    name: 'tests-user2',
    dependencies: ['setup-user2'],
  },
];
```

## Troubleshooting Autenticação

### Problema: Setup falha
```bash
# Verificar variáveis
echo $env:TEST_EMAIL
echo $env:TEST_PASSWORD

# Executar apenas setup com debug
npx playwright test e2e/auth.setup.ts --debug

# Ver logs detalhados
npx playwright test e2e/auth.setup.ts --reporter=list
```

### Problema: Arquivo `user.json` não criado
```bash
# Verificar se pasta existe
ls -la playwright/.auth/

# Dar permissões
chmod 755 playwright/.auth/

# Limpar cache e tentar novamente
rm -rf playwright/.auth/*
npx playwright test e2e/auth.setup.ts
```

### Problema: Testes falham mas setup passou
- Token JWT pode ter expirado
- Endpoint mudou
- Usar `--update-snapshots` para atualizar state

### Problema: "Sessão inválida"
```typescript
// Adicionar retry ao setup
setup.setTimeout(60000); // timeout maior

// Ou fazer login mais tolerante
test.setTimeout(30000);
test.extend({
  timeout: 'long', // para certos testes
});
```

## Boas Práticas

### 1. Sempre aguarde elementos carregarem
```typescript
❌ ERRADO
await page.click('button'); // pode clicar em botão errado

✅ CERTO
await expect(page.locator('[data-testid="login-btn"]')).toBeVisible();
await page.locator('[data-testid="login-btn"]').click();
```

### 2. Use data-testid para elementos críticos
```tsx
// Em React - adicione ao componente
<button data-testid="login-button">Login</button>

// Em testes
await page.locator('[data-testid="login-button"]').click();
```

### 3. Sempre verifique sucesso do setup
```typescript
// Boa prática
test.skip(async ({ page }, testInfo) => {
  if (!fs.existsSync('playwright/.auth/user.json')) {
    console.error('Auth setup não foi gerado');
  }
});
```

### 4. Limpe estado entre testes se necessário
```typescript
test.beforeEach(async ({ page }) => {
  // Limpar localStorage se necessário
  await page.evaluate(() => {
    localStorage.removeItem('tempData');
  });
});
```

## Migrando para Múltiplos Usuários

Se precisar múltiplos usuários no futuro:

```typescript
// Criar função helper
async function setupUserAuth(email: string, password: string) {
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // fazer login
  await page.goto('/auth?tab=login');
  // ... login logic
  
  // salvar com nome único
  await context.storageState({ path: `playwright/.auth/${email}.json` });
  await context.close();
}

// Usar em projects
{
  name: 'user1-tests',
  use: { storageState: 'playwright/.auth/user1@example.com.json' },
},
{
  name: 'user2-tests',
  use: { storageState: 'playwright/.auth/user2@example.com.json' },
},
```

## Recursos Adicionais

- [Autenticação no Playwright](https://playwright.dev/docs/auth)
- [Storage State](https://playwright.dev/docs/api/class-browsercontext#browser-context-storage-state)
- [Projects & Dependencies](https://playwright.dev/docs/test-projects)
- [Fixtures](https://playwright.dev/docs/extensibility#fixtures)

---

📝 **Resumo**: Sua configuração atual usa setup global com conta compartilhada. É eficiente e mantém os testes rápidos. Quando precisar de múltiplos usuários ou isolamento maior, mude para contas únicas por projeto.
