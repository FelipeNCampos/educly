
# Plano: Correção de Normalização de Email no Sistema de Billing

## Problema Identificado

A usuária `zudica@hotmail.com` comprou:
1. **Plano Base** (starting_trial + settled)
2. **Freelancer Upsell** (product_01KF4029KCA1QPQXXCMGN69DV9 - $19)

Porém o FunnelFox enviou o email como `zudica@hotmail.com.` (com ponto extra no final), causando falha na reconciliação.

---

## Plano de Ação

### PARTE 1: Correção Imediata - Liberar acesso da usuária

Executar SQL para:
1. Corrigir os emails nos `billing_event_logs` removendo o ponto extra
2. Marcar eventos como prontos para reprocessamento
3. Inserir manualmente os acessos da usuária

### PARTE 2: Correção Preventiva - Edge Function

Modificar `primer-webhook/index.ts` para normalizar emails removendo:
- Espaços (já faz com `trim()`)
- Pontos no final do email
- Caracteres invisíveis

Código a alterar (linha 834):
```typescript
// ANTES:
email = email.toLowerCase().trim();

// DEPOIS:
email = email.toLowerCase().trim().replace(/\.+$/, '');
```

### PARTE 3: Correção Preventiva - Função SQL

Modificar `process_pending_billing_events` para também normalizar emails:
```sql
-- Normalizar email removendo pontos finais
WHERE LOWER(RTRIM(email, '.')) = LOWER(RTRIM(p_email, '.'))
```

---

## Detalhes Técnicos

### Arquivos a modificar:

| Arquivo | Alteração |
|---------|-----------|
| `supabase/functions/primer-webhook/index.ts` | Adicionar `.replace(/\.+$/, '')` na normalização do email |
| Nova migration SQL | Atualizar função `process_pending_billing_events` |

### SQL para correção imediata da usuária:

```sql
-- 1. Corrigir emails nos billing_event_logs
UPDATE billing_event_logs 
SET email = 'zudica@hotmail.com'
WHERE email = 'zudica@hotmail.com.';

-- 2. Inserir acesso premium
INSERT INTO user_premium_access (user_id, is_premium, plan_type, purchased_at, expires_at)
VALUES (
  'e9824e9b-4a49-4b67-9906-77ddc18eba8c',
  true,
  'premium',
  NOW(),
  NOW() + INTERVAL '35 days'
)
ON CONFLICT (user_id) DO UPDATE SET 
  is_premium = true,
  expires_at = NOW() + INTERVAL '35 days';

-- 3. Inserir acesso BASE
INSERT INTO user_product_access (user_id, product_id, product_type, is_active, expires_at)
VALUES (
  'e9824e9b-4a49-4b67-9906-77ddc18eba8c',
  '01KF3ZG2F9N10HA5FQDQ0FDXSB',
  'base',
  true,
  NOW() + INTERVAL '35 days'
)
ON CONFLICT (user_id, product_id) DO UPDATE SET 
  is_active = true,
  expires_at = NOW() + INTERVAL '35 days';

-- 4. Inserir acesso FREELANCER
INSERT INTO user_product_access (user_id, product_id, product_type, is_active, expires_at)
VALUES (
  'e9824e9b-4a49-4b67-9906-77ddc18eba8c',
  '01KF4029KCA1QPQXXCMGN69DV9',
  'freelancer',
  true,
  NOW() + INTERVAL '35 days'
)
ON CONFLICT (user_id, product_id) DO UPDATE SET 
  is_active = true,
  expires_at = NOW() + INTERVAL '35 days';

-- 5. Marcar eventos como processados
UPDATE billing_event_logs 
SET processed = true, 
    status = 'success',
    processed_at = NOW(),
    user_id = 'e9824e9b-4a49-4b67-9906-77ddc18eba8c'
WHERE email = 'zudica@hotmail.com';
```

---

## Resultado Esperado

Após implementação:
- ✅ Usuária `zudica@hotmail.com` terá acesso Base + Freelancer imediatamente
- ✅ Futuros webhooks com pontos extras serão normalizados automaticamente
- ✅ Reconciliação no signup também tratará emails com pontos

---

## Observação: package-lock.json

O arquivo `package-lock.json` ainda está com JSON inválido. Para corrigir:
1. Use "View History" para restaurar versão anterior
2. Ou delete e execute `npm install` localmente
