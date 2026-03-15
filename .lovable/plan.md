

## Painel de Liberacao Manual de Acesso - Admin Analytics

### O que sera construido

Um formulario completo dentro do Admin Analytics que permite:
1. Buscar usuario por email
2. Selecionar quais produtos liberar (Base, Freelancer, AI Hub - individual ou combinados)
3. Definir duracao do acesso (7 dias, 30 dias, 90 dias, 1 ano, ilimitado)
4. Opcionalmente disparar email de boas-vindas
5. Executar a liberacao com um clique

### Fluxo do administrador

1. Abre o painel Admin Analytics
2. Na nova secao "Liberacao Manual", digita o email
3. O sistema verifica se o usuario ja tem conta e mostra o status atual
4. Seleciona os produtos (checkboxes): Base, Freelancer, AI Hub
5. Seleciona a duracao do acesso
6. Seleciona o idioma do email de boas-vindas (es, pt, en, fr)
7. Marca se quer enviar email de boas-vindas
8. Clica em "Liberar Acesso"
9. O sistema:
   - Insere/atualiza `user_product_access` com os produtos selecionados
   - Insere/atualiza `user_premium_access` com `is_premium = true`
   - Se marcado, agenda o email de boas-vindas via `pending_thank_you_emails`
   - Mostra confirmacao com toast

### Detalhes tecnicos

**1. Nova Edge Function: `admin-grant-access`**

Arquivo: `supabase/functions/admin-grant-access/index.ts`

- Recebe: `{ email, products: string[], duration_days: number | null, send_welcome_email: boolean, language: string }`
- Valida JWT do admin via `is_admin()` RPC
- Busca o `user_id` no `auth.users` pelo email
- Para cada produto selecionado:
  - Calcula `expires_at` baseado em `duration_days` (null = sem expiracao)
  - Insere em `user_product_access` com `ON CONFLICT` para atualizar se ja existir
- Atualiza `user_premium_access` com `is_premium = true`
- Se `send_welcome_email = true`, insere em `pending_thank_you_emails` para cada produto (o cron `send-pending-thanks` cuida do envio com delay de 5min)
- Retorna resultado com detalhes do que foi liberado

Configuracao em `supabase/config.toml`:
```text
[functions.admin-grant-access]
verify_jwt = false
```
(Validacao de admin sera feita no codigo via JWT + `is_admin()`)

**2. Novo componente: `ManualAccessGrant.tsx`**

Arquivo: `src/components/admin/ManualAccessGrant.tsx`

Interface com:
- Input de email com botao de verificacao (reutiliza a RPC `admin_lookup_email`)
- Status do usuario (conta existente/nao, plano atual)
- Checkboxes de produtos: Base, Freelancer, AI Hub
- Select de duracao: 7 dias, 30 dias, 90 dias, 1 ano, Ilimitado
- Select de idioma: Espanhol, Portugues, Ingles, Frances
- Toggle para enviar email de boas-vindas
- Botao "Liberar Acesso" com confirmacao
- Feedback visual do resultado

**3. Integracao no AdminAnalytics.tsx**

- Importar e adicionar `ManualAccessGrant` como nova aba "Liberar Acesso" no TabsList existente (grid de 4 para 5 colunas)
- Query key: `admin-manual-access`

### Seguranca

- Edge function valida que o chamador e admin via JWT + `is_admin()` RPC
- Usa `SUPABASE_SERVICE_ROLE_KEY` para operacoes de escrita no banco
- Nenhum dado sensivel exposto no frontend
- Audit trail: cada liberacao cria registros rastreaveeis em `user_product_access` com `product_id` prefixado como `manual_admin_grant_` + timestamp

### Arquivos criados/modificados

| Arquivo | Acao |
|---|---|
| `supabase/functions/admin-grant-access/index.ts` | Criar |
| `src/components/admin/ManualAccessGrant.tsx` | Criar |
| `src/pages/AdminAnalytics.tsx` | Modificar (adicionar aba) |

Nenhuma outra funcionalidade ou interface existente sera alterada.

