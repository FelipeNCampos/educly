# Como fazer Deploy da Função generate-certificate

## 📋 Pré-requisitos

1. Ter Node.js instalado
2. Ter acesso ao projeto Supabase
3. Ter um token de acesso ou fazer login no Supabase CLI

## 🔑 Opção 1: Login no Supabase CLI (Recomendado)

```powershell
# Fazer login no Supabase
npx supabase login

# Depois de fazer login, fazer o deploy
npx supabase functions deploy generate-certificate
```

O comando `npx supabase login` abrirá seu navegador para fazer login no Supabase.

## 🔑 Opção 2: Usando Token de Acesso

Se preferir usar um token de acesso:

1. Acesse https://app.supabase.com/account/tokens
2. Gere um novo Access Token
3. Configure a variável de ambiente:

```powershell
# Windows PowerShell
$env:SUPABASE_ACCESS_TOKEN = "seu-token-aqui"
npx supabase functions deploy generate-certificate
```

## 🔑 Opção 3: Deploy via Dashboard (Alternativa)

Se o CLI não funcionar, você pode fazer o deploy manualmente:

1. Acesse: https://app.supabase.com/project/pltumueyrflantxnqovl/functions
2. Clique em "Deploy new function"
3. Nome: `generate-certificate`
4. Cole o conteúdo de `index.ts`
5. Crie um arquivo `certificate-template.ts` com o conteúdo do template
6. Configure `Verify JWT: true`

## 📤 Após o Deploy

Depois de fazer o deploy, você precisa configurar:

### 1. Criar o bucket de storage

Execute no SQL Editor do Supabase:

```sql
-- Criar bucket para certificados
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;
```

### 2. Rodar a migration

```powershell
# Fazer push da migration para o banco
npx supabase db push
```

Ou execute manualmente o conteúdo de:
`supabase/migrations/20260216160000_create_certificates_table.sql`

### 3. Atualizar a URL da imagem

No arquivo `index.ts`, linha ~79, atualize a URL da imagem de fundo:

```typescript
const backgroundImage = await loadImage('https://pltumueyrflantxnqovl.supabase.co/storage/v1/object/public/public/FundoCertificadoModulo.png');
```

Substitua pelo URL correto do seu projeto.

## 🧪 Testar a Função

Após o deploy, teste via código:

```typescript
import { supabase } from '@/integrations/supabase/client';

const { data, error } = await supabase.functions.invoke('generate-certificate', {
  body: {
    nome: "Teste Silva",
    formacao: "IA",
    nivel: "júnior",
    horas: 20,
    cidade: "São Paulo",
    data: "16/02/2026"
  }
});

console.log('Resultado:', data);
```

## ❌ Problemas Comuns

### "Access token not provided"
- Execute `npx supabase login` primeiro
- Ou configure a variável `SUPABASE_ACCESS_TOKEN`

### "Cannot find module canvas"
- O Deno Edge Runtime suporta canvas via URL imports
- Verifique se a versão do Deno Runtime está atualizada

### "Bucket not found"
- Execute a migration para criar o bucket
- Ou crie manualmente no Dashboard > Storage

### "Permission denied"
- Verifique as políticas RLS
- Certifique-se de estar autenticado

## 📚 Links Úteis

- Dashboard: https://app.supabase.com/project/pltumueyrflantxnqovl
- Functions: https://app.supabase.com/project/pltumueyrflantxnqovl/functions
- Storage: https://app.supabase.com/project/pltumueyrflantxnqovl/storage/buckets
- SQL Editor: https://app.supabase.com/project/pltumueyrflantxnqovl/sql

## 🔄 Atualizar Função

Para atualizar após mudanças:

```powershell
npx supabase functions deploy generate-certificate
```

Não precisa fazer login novamente se já estiver logado.
