# Edge Function: insert-mk-leads

Esta edge function insere/atualiza leads na tabela `leads_mkt` e envia webhook quando um novo lead é criado.

## Segurança

A função aceita requisições **apenas** dos seguintes domínios:
- `http://localhost:3000` (desenvolvimento)
- `https://zonic.com.br` (produção)

Requisições de outros domínios serão rejeitadas com erro 403 Forbidden.

## Configuração no Supabase Dashboard

**IMPORTANTE**: Esta função precisa estar configurada para aceitar requisições **anônimas** (sem autenticação JWT).

### Como configurar:

1. Acesse o Supabase Dashboard
2. Vá em **Edge Functions** > **insert-mk-leads**
3. Na aba **Settings** ou **Configuration**
4. Configure para aceitar requisições com `anon key` (não exigir JWT de usuário autenticado)

Ou via SQL (se disponível):
```sql
-- Verificar configuração atual
SELECT * FROM supabase_functions.functions WHERE name = 'insert-mk-leads';

-- A função deve aceitar requisições com anon key
```

## Variáveis de Ambiente Necessárias

A função usa as seguintes variáveis de ambiente (configuradas automaticamente pelo Supabase):
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Webhook

A função envia automaticamente um webhook para:
- URL: `https://ramp-flows.yaneq.com/webhook-test/leads-typebot-zonic`
- Payload: `{ leads_mkt: { id }, name, phone }`
- Apenas quando um novo lead é criado (não em updates)

## Deploy

```bash
supabase functions deploy insert-mk-leads
```

## Troubleshooting

### Erro 401 Unauthorized

Se você receber erro 401, significa que a função está configurada para exigir autenticação JWT. Você precisa:
1. Configurar a função para aceitar requisições anônimas no Supabase Dashboard
2. Ou verificar se a `anon key` está sendo enviada corretamente no header `Authorization`

### Verificar Logs

Os logs da função mostram:
- Payload recebido
- Erros de validação
- Erros de banco de dados
- Status do webhook
