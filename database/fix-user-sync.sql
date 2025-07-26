-- ====================================================================
-- 🐝 BeeLinks - Script de Correção de Usuários
-- ====================================================================
-- Execute este script no SQL Editor do Supabase para corrigir
-- o problema de chave estrangeira dos usuários
-- ====================================================================

-- 1. Primeiro, vamos verificar usuários que existem no auth mas não no public
SELECT 
    'Usuários no auth.users mas não em public.users:' as status,
    COUNT(*) as total
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM public.users);

-- 2. Listar esses usuários para debug
SELECT 
    au.id,
    au.email,
    au.created_at,
    au.email_confirmed_at IS NOT NULL as email_verified
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM public.users)
ORDER BY au.created_at DESC;

-- 3. Sincronizar usuários existentes (execute após verificar acima)
-- SELECT public.sync_existing_users();

-- 4. Verificar se há links órfãos (sem usuário válido)
SELECT 
    'Links órfãos (sem usuário válido):' as status,
    COUNT(*) as total
FROM links l
WHERE l.user_id NOT IN (SELECT id FROM users);

-- 5. Listar links órfãos
SELECT 
    l.id,
    l.user_id,
    l.title,
    l.created_at
FROM links l
WHERE l.user_id NOT IN (SELECT id FROM users)
ORDER BY l.created_at DESC;

-- 6. Verificar total de usuários em cada tabela
SELECT 
    'auth.users' as tabela,
    COUNT(*) as total
FROM auth.users
UNION ALL
SELECT 
    'public.users' as tabela,
    COUNT(*) as total
FROM public.users;

-- ====================================================================
-- 📝 INSTRUÇÕES DE USO:
-- ====================================================================
-- 1. Execute as consultas 1-2 para verificar usuários faltando
-- 2. Se houver usuários faltando, execute: SELECT public.sync_existing_users();
-- 3. Execute as consultas 4-5 para verificar links órfãos
-- 4. Execute a consulta 6 para verificar totais
-- ====================================================================
