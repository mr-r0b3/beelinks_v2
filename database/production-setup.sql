-- ====================================================================
-- 🚀 CONFIGURAÇÃO FINAL PARA PRODUÇÃO - SUPABASE
-- ====================================================================
-- Execute este script após deploy no Vercel
-- ====================================================================

-- 1. Verificar se todas as tabelas existem
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'users', 'links', 'social_links', 'link_analytics', 
    'profile_analytics', 'themes', 'user_settings', 
    'link_tags', 'link_tag_assignments', 'qr_codes', 'user_avatars'
)
ORDER BY table_name;

-- 2. Verificar se o bucket avatars existe
SELECT id, name, public, created_at 
FROM storage.buckets 
WHERE name = 'avatars';

-- 3. Se o bucket não existir, criar:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Verificar políticas RLS ativas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 5. Verificar se há usuários na tabela auth.users que não estão em public.users
SELECT 
    COUNT(*) as auth_users_count,
    (SELECT COUNT(*) FROM public.users) as public_users_count
FROM auth.users;

-- 6. Se necessário, sincronizar usuários existentes
-- (Execute apenas se public_users_count < auth_users_count)
-- SELECT public.sync_existing_users();

-- ====================================================================
-- ✅ VERIFICAÇÃO FINAL
-- ====================================================================

-- Verificar se tudo está funcionando
DO $$
BEGIN
    -- Verificar tabelas essenciais
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        RAISE EXCEPTION 'Tabela users não encontrada! Execute supabase-schema.sql primeiro.';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_avatars') THEN
        RAISE NOTICE 'Tabela user_avatars não encontrada. Execute add-avatars-table-fixed.sql.';
    END IF;
    
    -- Verificar bucket
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'avatars') THEN
        RAISE NOTICE 'Bucket avatars não encontrado. Execute create-avatars-bucket.sql.';
    END IF;
    
    RAISE NOTICE 'Verificação concluída! ✅';
END
$$;
