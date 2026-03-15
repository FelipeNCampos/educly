# 🎯 Guia Prático - Testes Dia 1

Instruções passo-a-passo para rodar e entender os testes do Dia 1.

## 🚀 Quick Start

### 1. Antes de Rodarem os Testes

```bash
# Instale as dependências (se não tiver feito)
bun install
# ou
npm install

# Inicie o servidor de desenvolvimento
bun run dev
# ou
npm run dev

# EM OUTRO TERMINAL: Rode os testes do Dia 1
npx playwright test e2e/desafio-iniciante-ia/dia-1.spec.ts
```

## 📋 O Que os Testes Validam

### Estes são os 14 testes do Dia 1:

| # | Nome | O que testa |
|---|------|-----------|
| 1 | Carregamento | O Dia 1 carrega sem erros |
| 2 | Primeira Lição | Conteúdo correto sobre ChatGPT |
| 3 | Navegação | Consegue avançar entre passos |
| 4 | MatchWords | Exercício de conectar conceitos funciona |
| 5 | FillBlanks | Exercício de preencher espaços funciona |
| 6 | Barra Progresso | Indicador de progresso é mostrado |
| 7 | Conteúdo | Tópicos principais estão cobertos |
| 8 | AppPromo | Promoção do app aparece |
| 9 | Performance | Transições são rápidas |
| 10 | Completamento | Pode-se marcar o dia como completo |
| 11 | Persistência | Progresso é salvo ao voltar |
| 12 | Responsividade | Interface funciona bem |
| 13 | PromptTrainer | Exercício prático funciona |
| 14 | Resumo | Resumo do dia está presente |

## 🎮 Modos de Execução

### Modo 1: Testes Rápidos (Recomendado para CI/CD)
```bash
npx playwright test e2e/desafio-iniciante-ia/dia-1.spec.ts --reporter=short
```
- Rápido
- Sem UI gráfica
- Apenas resultado final (passou/falhou)
- Perfeito para integração contínua

### Modo 2: Interface Interativa (Recomendado para Desenvolvimento)
```bash
npx playwright test e2e/desafio-iniciante-ia/dia-1.spec.ts --ui
```
- Vê os testes rodando em tempo real
- Pode pausar e inspecionar
- Mostra screenshots/vídeos de falhas
- **MELHOR PARA DESENVOLVIMENTO**

### Modo 3: Debug Completo (Para Troubleshooting)
```bash
npx playwright test e2e/desafio-iniciante-ia/dia-1.spec.ts --debug
```
- Para a cada passo
- Abre o Playwright Inspector
- Permite inspecionar elementos
- Para investigar problemas complexos

### Modo 4: Um Teste Específico
```bash
# Roda apenas o teste "deve carregar o Dia 1"
npx playwright test e2e/desafio-iniciante-ia/dia-1.spec.ts -g "deve carregar"
```

## 📊 Entender os Resultados

### ✅ Teste Passou
```
✓ deve carregar o Dia 1 do Desafio Iniciante de IA
```
Significa que aquela funcionalidade está funcionando corretamente.

### ❌ Teste Falhou
```
✗ deve carregar o Dia 1 do Desafio Iniciante de IA
  → Timeout 10000ms
```
Significa que algo não funcionou como esperado. Veja os próximos passos.

### ⏭️ Teste Skipped
```
⊘ deve carregar o Dia 1 do Desafio Iniciante de IA
```
Teste foi pulado (talvez não tenha executado).

## 🔧 Depois de Rodar os Testes

### Relatório HTML
Depois de rodar os testes, abra:
```bash
npx playwright show-report
```
Mostra relatório bonito com screenshots e vídeos de falhas.

## 🛠️ Como Adicionar Novo Teste ao Dia 1

1. Abra `e2e/desafio-iniciante-ia/dia-1.spec.ts`
2. Procure `test.describe('Dia 1` ao final do arquivo
3. Adicione um novo teste:

```typescript
test('meu novo teste aqui', async ({ page }) => {
  // Setup
  await DesafioInicianteIAHelper.navigateToDay(page, 1);

  // Ação
  const title = await DesafioInicianteIAHelper.getCurrentStepTitle(page);

  // Verificação
  expect(title).toContain('algo que você quer verificar');
});
```

4. Salve e rode:
```bash
npx playwright test e2e/desafio-iniciante-ia/dia-1.spec.ts -g "meu novo"
```

## 📚 Entender o Código do Teste

### Exemplo simples:

```typescript
test('deve carregar o Dia 1', async ({ page }) => {
  // 1️⃣ SETUP - Preparar o estado inicial
  await DesafioInicianteIAHelper.navigateToDay(page, 1);

  // 2️⃣ AÇÃO - Fazer algo
  const title = await DesafioInicianteIAHelper.getCurrentStepTitle(page);

  // 3️⃣ ASSERT - Verificar o resultado
  expect(title).toBeTruthy();
});
```

### Helpers Disponíveis (use esses!):

```typescript
// Navegação
await DesafioInicianteIAHelper.navigateToDay(page, 1);
await DesafioInicianteIAHelper.backToChallenge(page);

// Interação
await DesafioInicianteIAHelper.clickNextButton(page);
await DesafioInicianteIAHelper.readTextStep(page);

// Verificação
const progress = await DesafioInicianteIAHelper.getProgress(page);
const title = await DesafioInicianteIAHelper.getCurrentStepTitle(page);
const completed = await DesafioInicianteIAHelper.isDayCompleted(page);
```

Veja `helpers.ts` para a lista completa!

## ❌ Se um Teste Falhar

### Passo 1: Veja a Mensagem de Erro
```
✗ deve navegar através de todos os passos
  → Timeout waiting for expectation
```
Aqui diz que esperou um elemento que não apareceu.

### Passo 2: Verifique o relatório visual
```bash
npx playwright show-report
```
Procure pelo teste que falhou. Haverá:
- 📸 Screenshot do momento da falha
- 🎥 Vídeo da execução completa
- 📝 Logs de erro

### Passo 3: Debug específico
```bash
# Rode só o teste que falhou com debug
npx playwright test dia-1.spec.ts -g "nome do teste que falhou" --debug
```

### Passo 4: Comum
- Elemento não está presente → aumentar timeout
- URL errada → verificar navegação
- Elemento visível mas não clicável → verificar z-index/overlay

## 🔄 Loop de Desenvolvimento

```
1. Faço mudança no código
   ↓
2. Rodo teste com --ui para ver funcionando
   ↓
3. Se passar → commito mudança
   ↓
4. Se falhar → rodo com --debug
   ↓
5. Corrijo o código ou teste
   ↓
6. Volta ao passo 2
```

## 💡 Dicas Importantes

### ✅ SIM - Faça assim:
```typescript
// Aguarde explicitamente
await expect(elemento).toBeVisible({ timeout: 10000 });

// Use helpers do arquivo
await DesafioInicianteIAHelper.clickNextButton(page);

// Teste uma coisa por vez
test('deve avançar para próximo passo', ...)
test('deve mostrar progresso', ...)
```

### ❌ NÃO - Evite:
```typescript
// Timeouts fixos (frágeis)
await page.waitForTimeout(3000);

// Seletores muito específicos
page.locator('button.btn-primary.mt-2.rounded-lg')

// Vários testes em um
test('deve avançar, completar, e voltar', ...)
```

## 🎬 Video Tutorial Rápido

Se preferir ver na prática, execute:
```bash
npx playwright test e2e/desafio-iniciante-ia/dia-1.spec.ts --ui
```

Isso abre uma interface visual onde você:
- Vê os testes rodando em tempo real
- Clica para pausar/prosseguir
- Inspeciona elementos na página
- Vê o progresso lado-a-lado com o navegador

## 📞 Precisa de Ajuda?

1. **Elemento não encontrado?**
   - Use `--debug` para inspecionar
   - Verifique o `data-testid` no HTML

2. **Teste falha em CI mas passa localmente?**
   - Aumente timeouts
   - Verifique as credenciais de teste

3. **Entender como os helpers funcionam?**
   - Abra `helpers.ts` e leia os comentários
   - Teste um helper por vez

## 🚀 Próximas Etapas

Depois de dominar o Dia 1:
1. Crie testes para Dia 2
2. Adicione novos helpers conforme necessário
3. Expanda a cobertura de testes

---

**Boa sorte! 🎉 Os testes estão aqui para *ajudar*, não para assustar!**
