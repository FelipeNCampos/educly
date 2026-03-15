
## Plano: Adicionar traduções do componente MatchWords

### Problema Identificado
O componente `MatchWords.tsx` (usado em exercícios interativos do Freelancer) possui três textos que estão aparecendo em português mesmo quando o idioma está configurado para inglês ou outro idioma:

1. **"Conecte cada item da esquerda com seu par correto à direita!"** - Instruções
2. **"0 / 4 pares conectados"** - Contador de progresso
3. **"Recomeçar"** - Botão de reset

Isso acontece porque as chaves de tradução `lesson.matchWords.*` **não existem** em nenhum dos 15 arquivos de localização. O componente usa fallbacks em português.

---

### Solução Proposta
Adicionar a seção `matchWords` dentro do objeto `lesson` em cada arquivo de tradução (15 idiomas).

### Arquivos a Modificar

| Arquivo | Idioma | Status |
|---------|--------|--------|
| `src/i18n/locales/pt.json` | Português | Adicionar seção |
| `src/i18n/locales/en.json` | Inglês | Adicionar seção |
| `src/i18n/locales/es.json` | Espanhol | Adicionar seção |
| `src/i18n/locales/fr.json` | Francês | Adicionar seção |
| `src/i18n/locales/de.json` | Alemão | Adicionar seção |
| `src/i18n/locales/it.json` | Italiano | Adicionar seção |
| `src/i18n/locales/ru.json` | Russo | Adicionar seção |
| `src/i18n/locales/zh.json` | Chinês | Adicionar seção |
| `src/i18n/locales/ja.json` | Japonês | Adicionar seção |
| `src/i18n/locales/ko.json` | Coreano | Adicionar seção |
| `src/i18n/locales/ar.json` | Árabe | Adicionar seção |
| `src/i18n/locales/hi.json` | Hindi | Adicionar seção |
| `src/i18n/locales/tr.json` | Turco | Adicionar seção |
| `src/i18n/locales/pl.json` | Polonês | Adicionar seção |
| `src/i18n/locales/nl.json` | Holandês | Adicionar seção |

---

### Traduções a Adicionar

```text
+--------------------------------+--------------------------------------------+
| Chave                          | Descrição                                  |
+--------------------------------+--------------------------------------------+
| lesson.matchWords.instructions | Instrução para conectar os pares           |
| lesson.matchWords.matched      | Texto "pares conectados" no contador       |
| lesson.matchWords.reset        | Texto do botão "Recomeçar"                 |
+--------------------------------+--------------------------------------------+
```

**Exemplo da estrutura JSON a adicionar:**

```json
{
  "lesson": {
    "matchWords": {
      "instructions": "Connect each item on the left with its correct match on the right!",
      "matched": "pairs connected",
      "reset": "Restart"
    }
  }
}
```

---

### Detalhes Técnicos

1. **Localização no JSON**: A seção `matchWords` será adicionada dentro de `lesson`, próxima às outras seções como `quiz`, `practical`, `findError`, etc.

2. **Padrão existente**: O projeto já possui estrutura semelhante com `lesson.findError`, `lesson.selectIncorrect`, etc.

3. **Componente afetado**: `src/components/lesson/MatchWords.tsx` (linhas 170, 287, 308)

4. **Nenhuma alteração no componente**: O código já usa `useTranslation()` corretamente com fallbacks.

---

### Estimativa de Trabalho
- 15 arquivos JSON a modificar
- Aproximadamente 3 linhas por arquivo
- Baixa complexidade - apenas adição de traduções
