# ✅ Checklist - Testes do Desafio Iniciante de IA

Checklist para garantir que tudo está funcionando corretamente.

## 🔧 Pré-requisitos

- [ ] Node.js/Bun instalado
- [ ] Projeto Educly clonado
- [ ] `npm install` ou `bun install` executado
- [ ] `.env` configurado com `TEST_EMAIL` e `TEST_PASSWORD`
- [ ] Servidor rodando (`bun run dev`)

## 🚀 Setup Inicial

### 1. Configurar Credenciais de Teste
```bash
# Crie um arquivo .env.local se não tiver
# Adicione:
TEST_EMAIL=seu_email_de_teste@example.com
TEST_PASSWORD=sua_senha_de_teste
```

- [ ] Credenciais de teste adicionadas

### 2. Instalar Playwright
```bash
# Já deve estar em package.json, mas se não:
npm install -D @playwright/test
# ou
bun add -d @playwright/test
```

- [ ] Playwright instalado

### 3. Executar Auth Setup
```bash
# Faz login uma vez e salva sessão
npx playwright test e2e/auth.setup.ts
```

- [ ] `playwright/.auth/user.json` foi criado
- [ ] Arquivo contém credenciais salvas

## 🧪 Testes do Dia 1

### Verificação Inicial

- [ ] Arquivo `e2e/desafio-iniciante-ia/dia-1.spec.ts` existe
- [ ] Arquivo `e2e/desafio-iniciante-ia/helpers.ts` existe
- [ ] Arquivo `e2e/desafio-iniciante-ia/README.md` existe

### Rodar Testes

```bash
# Modo rápido
npx playwright test e2e/desafio-iniciante-ia/dia-1.spec.ts
```

- [ ] Todos os 14 testes do Dia 1 passam

### Validar Cobertura

- [ ] ✅ **Teste 1:** Carregamento
- [ ] ✅ **Teste 2:** Primeira lição
- [ ] ✅ **Teste 3:** Navegação de passos
- [ ] ✅ **Teste 4:** MatchWords
- [ ] ✅ **Teste 5:** FillBlanks
- [ ] ✅ **Teste 6:** Barra de progresso
- [ ] ✅ **Teste 7:** Conteúdo/Tópicos
- [ ] ✅ **Teste 8:** AppPromo
- [ ] ✅ **Teste 9:** Performance
- [ ] ✅ **Teste 10:** Completamento
- [ ] ✅ **Teste 11:** Persistência
- [ ] ✅ **Teste 12:** Responsividade
- [ ] ✅ **Teste 13:** PromptTrainer
- [ ] ✅ **Teste 14:** Resumo

## 🎯 Modo UI (Desenvolvimento)

```bash
npx playwright test e2e/desafio-iniciante-ia/dia-1.spec.ts --ui
```

- [ ] Interface UI abre
- [ ] Testes mostram execução em tempo real
- [ ] Consegue pausar e inspecionar

## 📊 Relatório

```bash
npx playwright show-report
```

- [ ] Relatório HTML abre no navegador
- [ ] Todos os testes marcados como ✓
- [ ] Screenshots/vídeos estão disponíveis

## 🔍 Verificações Técnicas

### Helpers
- [ ] `navigateToChallenge()` funciona
- [ ] `navigateToDay()` funciona
- [ ] `clickNextButton()` funciona
- [ ] `getProgress()` retorna objeto válido
- [ ] `readTextStep()` funciona
- [ ] `getCurrentStepTitle()` retorna string

### Componentes
- [ ] MatchWords é encontrado no passo 4
- [ ] FillBlanks é encontrado no fluxo
- [ ] PromptTrainer é encontrado perto do final
- [ ] AppPromo aparece ao final

### Progresso
- [ ] Progresso inicial é 1/X
- [ ] Progresso avança ao clicar "Próximo"
- [ ] Progresso persiste ao voltar

## 🐛 Troubleshooting

### Se um teste falhar:

1. [ ] Verifique o relatório: `npx playwright show-report`
2. [ ] Rerode com `--debug`: `npx playwright test dia-1.spec.ts --debug`
3. [ ] Verifique se todos os helpers estão presentes em `helpers.ts`
4. [ ] Verifique o `playwright.config.ts` está correto
5. [ ] Limpe cache: `rm -rf playwright/.auth`
6. [ ] Reroe auth setup: `npx playwright test e2e/auth.setup.ts`

### Elementos não encontrados:

- [ ] Verifique se `data-testid` está no HTML
- [ ] Aumente timeout de 10s para 15s ou 20s
- [ ] Use seletores mais genéricos se necessário
- [ ] Verifique console para JS errors

### Testes passam localmente mas falham em CI:

- [ ] Verifique `.env` variables
- [ ] Aumentar timeouts para ambiente remoto
- [ ] Verificar if `TEST_EMAIL`/`TEST_PASSWORD` são válidas

## 📈 CI/CD Integration

### GitHub Actions
- [ ] `.github/workflows/playwright.yml` configurado
- [ ] Testes rodam em push
- [ ] Testes rodam em pull requests

### Configuração Mínima
```yaml
- name: Testes Playwright
  run: npx playwright test
```

- [ ] Configuração adicionada

## 📝 Documentação

- [ ] `README.md` está completo
- [ ] `GUIA-PRATICO.md` está acessível
- [ ] Exemplos de código funcionam como documentado
- [ ] Links estão corretos

## 🚀 Próximos Dias

### Dia 2 Preparação
- [ ] Criar arquivo `e2e/desafio-iniciante-ia/dia-2.spec.ts`
- [ ] Estudar conteúdo do Dia 2 em `pt-lessons.json`
- [ ] Adicionar helpers necessários se faltarem
- [ ] Criar 14+ testes seguindo padrão do Dia 1

### Dias 3-7
- [ ] [ ] Repetir processo para cada dia
- [ ] [ ] Manter consistência de estrutura
- [ ] [ ] Documentar padrões únicos

### Dias 8-14
- [ ] [ ] Testes mais complexos (simuladores, chat com IA)
- [ ] [ ] Validar integrações de API
- [ ] [ ] Testes de performance

### Dias 15-28
- [ ] [ ] Cobertura completa de todos os dias
- [ ] [ ] Testes de end-to-end (início ao fim)
- [ ] [ ] Testes de compatibilidade mobile

## 🎓 Validação Final

```bash
# Rode TUDO
npx playwright test e2e/desafio-iniciante-ia/

# Verifique relatório
npx playwright show-report

# Verifique coverage de helpers
grep -c "static async" e2e/desafio-iniciante-ia/helpers.ts
```

- [ ] Todos os testes passam
- [ ] Relatório é gerado
- [ ] Todos os helpers são estáticos e reutilizáveis

## 📞 Recursos

- 📖 README.md - Documentação principal
- 🎯 GUIA-PRATICO.md - Guia passo-a-passo
- 🔧 helpers.ts - Código dos helpers
- ✅ dia-1.spec.ts - Testes do Dia 1
- 📋 AUTHENTICATION.md - Como auth funciona
- 🎬 Modo --ui para entender visualmente

## ✨ Sucesso!

Quando tudo estiver marcado com ✅, você tem:
- ✅ Testes bem estruturados
- ✅ Cobertura completa do Dia 1
- ✅ Documentação clara
- ✅ Pronto para expandir para novos dias

---

**Data de Conclusão:** ___________
**Responsável:** ___________
**Status:** 🔄 In Progress | ✅ Completo

