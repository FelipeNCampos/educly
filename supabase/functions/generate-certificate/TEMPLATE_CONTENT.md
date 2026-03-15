# Template de Conteúdo - Certificado de Conclusão

Este arquivo contém o template de texto utilizado para geração de certificados na plataforma Educly.

---

## 📜 Estrutura do Certificado

### Cabeçalho Principal
```
Certificado de Conclusão
```

### Nome do Aluno
```
{nome_completo}
```
*Exemplo: Matheus Felipe Sousa Santos*

---

### Texto de Conclusão
```
Concluiu com sucesso o curso de
```

### Título da Especialização
```
Especialização em {area_formacao}
```
*Exemplo: Especialização em Inteligência Artificial*

---

### Badge de Nível
```
Nível {nivel}
```
*Valores: júnior | pleno | sênior*

---

### Descrição Completa
```
Formação em {area_formacao} com carga horária total de {total_horas} horas, 
demonstrando conhecimentos práticos e compreensão dos fundamentos essenciais 
da {area_formacao} aplicados {contribuicao_opcional}
```

**Variáveis:**
- `{area_formacao}`: Nome da área/curso (ex: "Inteligência Artificial")
- `{total_horas}`: Carga horária total em horas (ex: "40")
- `{contribuicao_opcional}`: Texto complementar opcional

---

### Informações de Localização e Data

```
Cidade: {cidade}                    Data de conclusão: {data_conclusao}
```

**Formato da data:** DD/MM/AAAA ou "info.data" para preenchimento dinâmico

---

### Assinatura e Responsável

```
{assinatura_manuscrita}

{nome_responsavel}
Nome do responsável/instrutor
Educly - Educação digital
```

**Campos:**
- `{assinatura_manuscrita}`: Texto em fonte manuscrita (opcional)
- `{nome_responsavel}`: Nome completo do instrutor/responsável (opcional)

---

## 🎨 Elementos Visuais

### Logo Educly
- Posição: Topo esquerdo
- Formato: Logo "educly" com smile laranja

### Badge IA
- Posição: Topo direito
- Formato: Medalha dourada com "IA NÍVEL JÚNIOR"

### Mascote Educly
- Posição: Inferior direito
- Formato: Personagem robô com óculos e formatura

### Badge de Nível (cor laranja)
- Posição: Abaixo do título da especialização
- Cores: Gradiente laranja (#ff8833)
- Texto: Branco em negrito

---

## 📝 Variáveis do Sistema

### Variáveis Obrigatórias:
- `info.nome` → Nome completo do aluno
- `info.formacao` → Área da especialização
- `info.nivel` → Nível do curso (júnior/pleno/sênior)
- `info.horas` → Carga horária total
- `info.data` → Data de conclusão
- `info.cidade` → Cidade

### Variáveis Opcionais:
- `info.contri` → Contribuição/descrição adicional
- `info.responsavel` → Nome do instrutor

---

## 🔄 Exemplos de Preenchimento

### Exemplo 1: Certificado Completo
```
Certificado de Conclusão

Matheus Felipe Sousa Santos

Concluiu com sucesso o curso de
Especialização em Inteligência Artificial

[Badge: Nível júnior]

Formação em Inteligência Artificial com carga horária total de 40 horas, 
demonstrando conhecimentos práticos e compreensão dos fundamentos essenciais 
da Inteligência Artificial aplicados em projetos reais

Cidade: Granada                    Data de conclusão: 15/02/2026

Prof. João Silva
Nome do responsável/instrutor
Educly - Educação digital
```

### Exemplo 2: Certificado Mínimo
```
Certificado de Conclusão

Maria Silva

Concluiu com sucesso o curso de
Especialização em ChatGPT Avançado

[Badge: Nível pleno]

Formação em ChatGPT Avançado com carga horária total de 20 horas, 
demonstrando conhecimentos práticos e compreensão dos fundamentos essenciais 
da ChatGPT Avançado aplicados

Cidade: São Paulo                    Data de conclusão: 16/02/2026

Nome do responsável/instrutor
Educly - Educação digital
```

---

## 🎯 Regras de Formatação

### Títulos e Nomes
- **Certificado de Conclusão**: Arial Bold, 32px, cor #1e3a5f
- **Nome do Aluno**: Arial Regular, 28px, cor #1e3a5f
- **Especialização**: Arial Bold, 26px, cor #1e3a5f

### Textos Corridos
- **Corpo do texto**: Arial Regular, 12-16px, cor #1e3a5f
- **Descrição**: Arial Regular, 12px, cor #1e3a5f, largura máxima 700px

### Elementos Especiais
- **Badge de Nível**: Fundo gradiente laranja, texto branco bold 14px
- **Assinatura**: Fonte manuscrita (Brush Script), 20px, itálico
- **Rodapé**: Arial Regular, 10px

### Cores do Tema
- **Primária**: #1e3a5f (azul escuro)
- **Secundária**: #f59e0b (laranja)
- **Destaque**: #ff8833 (laranja badge)
- **Texto**: #1e3a5f (azul escuro)
- **Fundo**: #ffffff (branco)

---

## 📐 Dimensões Canvas

- **Largura**: 1270px (baseado na imagem FundoCertificadoModulo.png)
- **Altura**: 763px (baseado na imagem FundoCertificadoModulo.png)
- **Formato**: PNG de alta qualidade
- **Resolução**: 96 DPI

---

## 🔧 Instruções de Personalização

1. **Modificar textos fixos**: Edite o arquivo `certificate-template.ts`
2. **Ajustar posições**: Modifique o objeto `layout` no template
3. **Alterar cores**: Edite o objeto `colors` no template
4. **Mudar fontes**: Atualize o objeto `fonts` no template
5. **Adicionar novos campos**: Estenda a interface `CertificateData`

---

## 📋 Checklist de Qualidade

Antes de gerar um certificado, verifique:

- [ ] Todos os campos obrigatórios estão preenchidos
- [ ] O nome do aluno está escrito corretamente
- [ ] A data está no formato DD/MM/AAAA
- [ ] O nível está correto (júnior/pleno/sênior)
- [ ] A carga horária é precisa
- [ ] A cidade está correta
- [ ] O texto da descrição faz sentido
- [ ] Não há erros ortográficos

---

## 🌐 Tradução / i18n

Para adicionar suporte multilíngue, edite:
- `certificate-template.ts` - adicionar traduções
- Criar arquivo `certificate-template-en.ts` para inglês
- Criar arquivo `certificate-template-es.ts` para espanhol

---

**Versão**: 1.0
**Última atualização**: 16/02/2026
**Responsável**: Educly - Educação digital
