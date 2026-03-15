# 📋 Checklist de Configuração Inicial

Marque os itens conforme completar:

## ✅ Setup do Projeto

- [ ] Clonar repositório
- [ ] Instalar dependências: `npm install`
- [ ] Verificar Playwright instalado: `npm list @playwright/test`

## ✅ Variáveis de Ambiente

- [ ] Criar arquivo `.env.local` na raiz
- [ ] Adicionar `TEST_EMAIL=seu-email@example.com`
- [ ] Adicionar `TEST_PASSWORD=sua-senha`
- [ ] Verificar credenciais são válidas
- [ ] **NÃO commitar** `.env.local` (já no `.gitignore`)

## ✅ Servidor de Desenvolvimento

- [ ] Terminal 1: `npm run dev`
- [ ] Verificar servidor rodando em `http://localhost:5173`
- [ ] Testar acesso manual

## ✅ Geração de Estado de Autenticação

```bash
# Terminal 2 - rodexecute apenas o setup
npx playwright test e2e/auth.setup.ts
```

- [ ] Setup passou com sucesso
- [ ] Arquivo `playwright/.auth/user.json` foi criado
- [ ] Arquivo tem mais de 1KB (não vácio)

## ✅ Rodando Testes de Login

```bash
npx playwright test e2e/auth.login.spec.ts
```

- [ ] Todos os testes passaram
- [ ] Nenhum timeout
- [ ] Navegadores rodaram ok

## ✅ Rodando Todos os Testes

```bash
npx playwright test
```

- [ ] Setup rodou automaticamente
- [ ] Testes de login passaram
- [ ] Testes do dashboard passaram
- [ ] Relatório HTML gerado

## ✅ Visualizar Relatório

```bash
npx playwright show-report
```

- [ ] Abriu navegador com relatório
- [ ] Todos os testes mostram como passed
- [ ] Screenshots de falha visíveis (se houver)

## ✅ Configurar no Editor

### VS Code

- [ ] Instalar extensão **Playwright Test for VSCode** (ms-playwright.playwright)
- [ ] Extension pode rodar testes diretamente do editor
- [ ] Botão "play" aparece ao lado dos testes

### Shortcuts úteis

- [ ] `Ctrl+Shift+P` → "Playwright: Run All Tests"
- [ ] `Ctrl+Shift+P` → "Playwright: Debug Test"
- [ ] `Ctrl+Shift+P` → "Playwright: Show Report"

## ✅ Git Setup

- [ ] Verificar `.gitignore` tem `playwright/.auth/`
- [ ] Não há `user.json` em staged files
- [ ] Commitar outros arquivos de teste

```bash
# Verificar
git status

# Deve mostrar:
# - playwright/ não listado
# - e2e/*.ts, e2e/*.md listados
```

## ✅ CI/CD (se usar GitHub Actions/similar)

- [ ] Criar `.github/workflows/playwright.yml`
- [ ] Adicionar `TEST_EMAIL` e `TEST_PASSWORD` como secrets
- [ ] Testar rodando workflow

```yaml
# Exemplo básico
- name: Run Playwright tests
  env:
    TEST_EMAIL: ${{ secrets.TEST_EMAIL }}
    TEST_PASSWORD: ${{ secrets.TEST_PASSWORD }}
  run: npx playwright test
```

## ✅ Desenvolvimento Local

- [ ] Abrir `e2e/README.md` e ler
- [ ] Entender estrutura de testes
- [ ] Criar seu primeiro teste

Exemplo básico:
```typescript
import { test, expect } from '@playwright/test';

test('novo teste', async ({ page }) => {
  await page.goto('/sua-url');
  await expect(page.locator('text=algo')).toBeVisible();
});
```

## ✅ Troubleshooting

Se algo não funcionar:

1. **Setup falha com erro de autenticação**
   ```bash
   # Verificar credenciais
   echo $env:TEST_EMAIL
   echo $env:TEST_PASSWORD
   
   # Rodar com debug
   npx playwright test e2e/auth.setup.ts --debug
   ```

2. **Testes timeoutam**
   ```bash
   # Aumentar timeout temporariamente
   TIMEOUT=60000 npx playwright test
   
   # Ou no arquivo de teste
   test.setTimeout(60000);
   ```

3. **Arquivo user.json não criado**
   ```bash
   # Verificar permissões de pasta
   ls -la playwright/
   
   # Limpar cache Playwright
   npx playwright install --with-deps
   
   # Tentar novamente
   npx playwright test e2e/auth.setup.ts
   ```

4. **Vejo "Session token invalid"**
   - Token expirou após setup
   - Rodar setup novamente: `npx playwright test e2e/auth.setup.ts`
   - Ou limpar: `rm playwright/.auth/user.json && npx playwright test`

## 📚 Recursos Próximos

Uma vez que tudo estiver funcionando:

- [ ] Ler [advanced-examples.spec.ts](advanced-examples.spec.ts)
- [ ] Ler [AUTHENTICATION.md](AUTHENTICATION.md)
- [ ] Ler [helpers.ts](helpers.ts)
- [ ] Criar testes para sua primeira feature
- [ ] Configurar CI/CD se necessário

## 🎯 Testes Recomendados para Adicionar

Próximas tarefas (após básico funcionar):

- [ ] Testes de signup
- [ ] Testes de password reset
- [ ] Testes de features autenticadas
- [ ] Testes de responsive design
- [ ] Testes de performance
- [ ] Testes de acessibilidade

---

## ⏱️ Tempo Estimado

- Setup inicial: ~15 minutos
- Troubleshooting (se necessário): +10 minutos
- Primeiro teste custom: ~20 minutos

**Total esperado**: 30-45 minutos de setup ✅
