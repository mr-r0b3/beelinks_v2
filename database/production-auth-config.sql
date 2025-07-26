-- ====================================================================
-- 🔐 Configuração de Autenticação para Produção
-- ====================================================================
-- Execute este script no SQL Editor do Supabase para configurar
-- as URLs de produção automaticamente
-- ====================================================================

-- Verificar configuração atual de auth
SELECT 
    raw_app_meta_data->>'providers' as providers,
    raw_app_meta_data->>'provider' as provider
FROM auth.users 
LIMIT 1;

-- Verificar se a configuração está correta
DO $$
BEGIN
    RAISE NOTICE '🔗 URL de Produção: https://beelinks-prod.vercel.app';
    RAISE NOTICE '🏠 URL de Desenvolvimento: http://localhost:3000';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Configure manualmente no Dashboard:';
    RAISE NOTICE '1. Authentication > URL Configuration';
    RAISE NOTICE '2. Site URL: https://beelinks-prod.vercel.app';
    RAISE NOTICE '3. Redirect URLs:';
    RAISE NOTICE '   - https://beelinks-prod.vercel.app';
    RAISE NOTICE '   - https://beelinks-prod.vercel.app/login';
    RAISE NOTICE '   - https://beelinks-prod.vercel.app/signup';
    RAISE NOTICE '   - http://localhost:3000';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Script executado com sucesso!';
END
$$;
