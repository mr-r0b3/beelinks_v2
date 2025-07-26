-- ====================================================================
-- 🌐 CONFIGURAÇÃO DE CORS PARA PRODUÇÃO
-- ====================================================================

-- Verificar configurações atuais de CORS
SELECT * FROM pg_settings WHERE name LIKE '%cors%';

-- Se necessário, configurar CORS para sua URL do Vercel
-- (Normalmente não é necessário, mas caso tenha problemas)

-- Exemplo de configuração (execute apenas se necessário):
/*
ALTER SYSTEM SET cors_allowed_origins = 'https://seu-projeto.vercel.app,http://localhost:3000';
SELECT pg_reload_conf();
*/

-- ====================================================================
-- 📧 CONFIGURAÇÃO DE EMAIL (Opcional)
-- ====================================================================

-- Para configurar templates de email personalizados:
-- 1. Vá para Authentication > Email Templates no dashboard
-- 2. Personalize os templates conforme necessário
-- 3. Configure SMTP customizado se desejar (Settings > Auth)

-- ====================================================================
-- 🔐 CONFIGURAÇÕES DE SEGURANÇA RECOMENDADAS
-- ====================================================================

-- 1. Rate limiting (já configurado por padrão)
-- 2. Password policy (verificar em Auth settings)
-- 3. Session timeout (configurar conforme necessário)

-- Verificar configurações de autenticação
SELECT 
    setting,
    value,
    description
FROM auth.config
WHERE setting IN (
    'SITE_URL',
    'JWT_EXPIRY',
    'REFRESH_TOKEN_ROTATION_ENABLED',
    'SECURITY_UPDATE_PASSWORD_REQUIRE_REAUTHENTICATION'
);
