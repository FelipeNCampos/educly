# 🧪 Testes E2E - Desafio Iniciante de IA

Bem-vindo à suíte de testes end-to-end para o **Desafio Iniciante de IA** do Educly!

Este diretório contém todos os testes automatizados para validar a experiência do usuário em cada dia do desafio.

## 📁 Estrutura de Arquivos

```
e2e/desafio-iniciante-ia/
├── helpers.ts           # Funções auxiliares reutilizáveis
├── dia-1.spec.ts        # Testes do Dia 1
├── dia-2.spec.ts        # Testes do Dia 2 (em desenvolvimento)
├── README.md            # Este arquivo
└── ...
```

## 🏗️ Helpers (Funções Auxiliares)

O arquivo `helpers.ts` contém a classe `DesafioInicianteIAHelper` com métodos reutilizáveis:

### Navegação
```typescript
// Navega para o desafio
await DesafioInicianteIAHelper.navigateToChallenge(page);

// Vai para um dia específico
await DesafioInicianteIAHelper.navigateToDay(page, 1);

// Volta para o desafio
await DesafioInicianteIAHelper.backToChallenge(page);
```

### Controle de Passos
```typescript
// Avança para o próximo passo
await DesafioInicianteIAHelper.clickNextButton(page);

// Obtém o progresso atual
const progress = await DesafioInicianteIAHelper.getProgress(page);
// { currentStep: 3, totalSteps: 24 }
```

### Componentes Interativos
```typescript
// Completa exercício MatchWords (conectar conceitos)
await DesafioInicianteIAHelper.completeMatchWords(page);

// Completa exercício FillBlanks (preencher espaços)
await DesafioInicianteIAHelper.interactWithFillBlanks(page, ['resposta1', 'resposta2']);

// Interage com PromptTrainer
await DesafioInicianteIAHelper.interactWithPromptTrainer(page, 'seu prompt aqui');
```

### Verificações
```typescript
// Lê um passo de texto simples
await DesafioInicianteIAHelper.readTextStep(page);

// Obtém o título do passo atual
const title = await DesafioInicianteIAHelper.getCurrentStepTitle(page);

// Verifica se o dia foi completado
const completed = await DesafioInicianteIAHelper.isDayCompleted(page);
```

## 📝 Estrutura de um Teste

### Padrão Implementado

```typescript
test.describe('Dia X - Tema Principal', () => {
  test('deve testar algo específico', async ({ page }) => {
    // 1. Setup - Navegar para o dia
    await DesafioInicianteIAHelper.navigateToDay(page, X);

    // 2. Ação - Interagir com o conteúdo
    await DesafioInicianteIAHelper.clickNextButton(page);

    // 3. Verificação - Assertivas
    const progress = await DesafioInicianteIAHelper.getProgress(page);
    expect(progress.currentStep).toBe(2);
  });
});
```

## 🧪 Testes Criados para Dia 1

### ✅ Testes Implementados:

1. **Carregamento Correto** - Verifica se o Dia 1 carrega
2. **Primeira Lição** - Valida o conteúdo inicial sobre ChatGPT
3. **Navegação de Passos** - Testa avançar entre passos
4. **MatchWords** - Testa componente de conectar conceitos
5. **FillBlanks** - Testa preenchimento de espaços em branco
6. **Barra de Progresso** - Valida elemento de progresso
7. **Tópicos Principais** - Verifica cobertura de tópicos
8. **AppPromo** - Testa promoção do app ao final
9. **Performance** - Valida responsiveness
10. **Completamento** - Testa conclusão do dia
11. **Persistência de Progresso** - Volta e retorna mantém progresso
12. **Responsividade** - Interface funciona em diferentes resoluções
13. **PromptTrainer** - Testa exercício prático de prompts
14. **Resumo** - Valida resumo do dia

## 🚀 Como Rodar os Testes

### Rodar todos os testes do Desafio Iniciante de IA
```bash
npx playwright test e2e/desafio-iniciante-ia/
```

### Rodar apenas Dia 1
```bash
npx playwright test e2e/desafio-iniciante-ia/dia-1.spec.ts
```

### Rodar teste específico
```bash
npx playwright test e2e/desafio-iniciante-ia/dia-1.spec.ts -g "deve carregar o Dia 1"
```

### Modo debug (interativo)
```bash
npx playwright test e2e/desafio-iniciante-ia/dia-1.spec.ts --debug
```

### Modo UI (visualizar execução)
```bash
npx playwright test e2e/desafio-iniciante-ia/dia-1.spec.ts --ui
```

### Rodar em headless (sem interface gráfica)
```bash
npx playwright test e2e/desafio-iniciante-ia/ --headed=false
```

## 📅 Como Criar Testes para Novos Dias

### Passo 1: Criar arquivo de teste
```bash
touch e2e/desafio-iniciante-ia/dia-2.spec.ts
```

### Passo 2: Importar helpers
```typescript
import { test, expect } from '@playwright/test';
import { DesafioInicianteIAHelper } from './helpers';
```

### Passo 3: Estruturar testes
```typescript
test.describe('Dia 2 - Novo Tema', () => {
  test('deve testar funcionalidade X', async ({ page }) => {
    await DesafioInicianteIAHelper.navigateToDay(page, 2);
    
    // Seus testes aqui
    
    expect(true).toBeTruthy();
  });
});
```

### Passo 4: Se precisar de helpers novos
Adicione métodos à classe `DesafioInicianteIAHelper` em `helpers.ts`:

```typescript
static async minhaFuncaoCustomizada(page: Page) {
  // Implementação
}
```

## 🔍 Localizadores Úteis

Para encontrar elementos na página, use estes padrões:

```typescript
// Por texto
page.locator('text=Próximo')

// Por atributo data-testid (RECOMENDADO)
page.locator('[data-testid="lesson-progress"]')

// Por role ARIA
page.locator('[role="progressbar"]')

// Por placeholder
page.locator('input[placeholder*="prompt"]')

// Combinado
page.locator('button:has-text("Avançar")')
```

**🎯 Dica:** Use `data-testid` no HTML para tornar os testes mais robustos!

## 🤝 Boas Práticas

### 1. Use os Helpers (não crie código duplicado)
```typescript
// ❌ Evite
await page.goto('/desafio/chatgpt/dia/1');
await page.locator('button:has-text("Próximo")').click();

// ✅ Use
await DesafioInicianteIAHelper.navigateToDay(page, 1);
await DesafioInicianteIAHelper.clickNextButton(page);
```

### 2. Aguarde Explicitamente
```typescript
// ✅ Bom
await expect(page.locator('[role="article"]')).toBeVisible({ timeout: 10000 });

// ❌ Evite
await page.waitForTimeout(3000); // Timeouts fixos são frágeis
```

### 3. Nomeie testes Descritivamente
```typescript
// ✅ Bom
test('deve completar exercício MatchWords e mostrar mensagem de sucesso')

// ❌ Evite
test('testa MatchWords')
```

### 4. Uma Coisa por Teste
```typescript
// ✅ Bom - Um teste para uma coisa
test('deve carregar Dia 1', async ({ page }) => { ... });
test('deve avançar entre passos', async ({ page }) => { ... });

// ❌ Evite - Múltiplas coisas num teste
test('deve carregar, avançar e completar', async ({ page }) => { ... });
```

## 📊 Cobertura de Testes

### Dia 1 Atual
- ✅ Navegação e Carregamento
- ✅ Conteúdo Específico
- ✅ Componentes de Interação (MatchWords, FillBlanks)
- ✅ Componentes de Prática (PromptTrainer)
- ✅ Rastreamento de Progresso
- ✅ Performance e Responsividade
- ✅ Persistência de Estado

### Próximos Passos
- [ ] Testes para Dia 2
- [ ] Testes para Dia 3
- [ ] Testes de Chat com IA (EDI)
- [ ] Testes de Conclusão e Certificados
- [ ] Testes de Compatibilidade Multiplataforma (Mobile, Tablet)

## 🐛 Troubleshooting

### Teste falha dizendo "elemento não encontrado"
```typescript
// Adicione logs para debug
console.log('Página:', page.url());
await page.screenshot({ path: 'debug.png' });

// Tente aumentar o timeout
await expect(elemento).toBeVisible({ timeout: 30000 });
```

### Testes passam localmente mas falham em CI
- Adicione `waitForLoadState('networkidle')`
- Use timeouts maiores para CI
- Verifique se as credenciais de teste estão corretas

### Componente desaparece após interação
```typescript
// Aguarde a transição
await page.waitForTimeout(500);
// ou
await page.waitForLoadState('networkidle');
```

## 📚 Recursos Adicionais

- [Documentação Playwright](https://playwright.dev)
- [Playwright Selectors](https://playwright.dev/docs/selectors)
- [Playwright Test API](https://playwright.dev/docs/api/class-test)
- [e2e/AUTHENTICATION.md](../AUTHENTICATION.md) - Como autenticação funciona

## 👤 Autor

Testes criados como parte da suíte automática do Educly.

## 📝 Notas Importantes

1. **Autenticação:** Todos os testes herdam a sessão autenticada do `auth.setup.ts`
2. **Paralelização:** Testes rodamem paralelo por padrão
3. **Base URL:** Configurada em `playwright.config.ts`
4. **Screenshots/Vídeos:** Capturados automaticamente em caso de falha

---

**🚀 Pronto para criar testes? Comece pela [estrutura do helpers.ts](./helpers.ts)!**
