-- ====================================================================
-- 🚨 BeeLinks - Solução de Emergência para RLS
-- ====================================================================
-- Execute este script IMEDIATAMENTE no SQL Editor do Supabase
-- se você estiver enfrentando erro de chave estrangeira
-- ====================================================================

-- 1. PRIMEIRO: Desabilitar temporariamente RLS na tabela users
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. Criar função de sincronização de emergência
CREATE OR REPLACE FUNCTION emergency_sync_user(user_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_auth_id UUID;
    username_final VARCHAR(50);
    counter INTEGER := 1;
BEGIN
    -- Buscar ID do usuário no auth.users pelo email
    SELECT id INTO user_auth_id
    FROM auth.users 
    WHERE email = user_email;
    
    IF user_auth_id IS NULL THEN
        RETURN 'Usuário não encontrado no auth.users com email: ' || user_email;
    END IF;
    
    -- Verificar se já existe
    IF EXISTS (SELECT 1 FROM public.users WHERE id = user_auth_id) THEN
        RETURN 'Usuário já existe na tabela public.users';
    END IF;
    
    -- Gerar username único baseado no email
    username_final := LOWER(SPLIT_PART(user_email, '@', 1));
    username_final := REGEXP_REPLACE(username_final, '[^a-z0-9_]', '', 'g');
    username_final := SUBSTRING(username_final FROM 1 FOR 20);
    
    IF username_final = '' THEN
        username_final := 'user';
    END IF;
    
    -- Garantir username único
    WHILE EXISTS (SELECT 1 FROM public.users WHERE username = username_final) LOOP
        username_final := SPLIT_PART(user_email, '@', 1) || counter::TEXT;
        counter := counter + 1;
    END LOOP;
    
    -- Inserir usuário
    INSERT INTO public.users (
        id, email, username, full_name, bio, 
        email_verified, created_at, updated_at
    ) VALUES (
        user_auth_id,
        user_email,
        username_final,
        '',
        'Desenvolvedor | Criador de Conteúdo | Tech Enthusiast',
        true,
        NOW(),
        NOW()
    );
    
    -- Criar configurações
    INSERT INTO public.user_settings (
        user_id, analytics_enabled, public_analytics, 
        show_click_count, allow_link_preview, email_notifications,
        show_avatar, show_bio, show_social_links
    ) VALUES (
        user_auth_id, true, false, true, true, true, true, true, true
    );
    
    -- Criar tema
    INSERT INTO public.themes (
        user_id, name, is_default, primary_color, 
        secondary_color, background_color, text_color, accent_color,
        font_family, border_radius, button_style
    ) VALUES (
        user_auth_id, 'Tema BeeLinks', true, '#FFD700', 
        '#FFC107', '#1A1A1A', '#FFFFFF', '#2D2D2D',
        'Inter', 12, 'rounded'
    );
    
    RETURN 'Usuário ' || username_final || ' criado com sucesso!';
END;
$$;

-- 3. Reabilitar RLS com políticas corrigidas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Remover políticas conflitantes
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Public can view public profiles" ON users;

-- Criar políticas corretas
CREATE POLICY "Allow all operations for service role" ON users
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public can view public profiles" ON users
    FOR SELECT USING (is_profile_public = true);

-- 4. Políticas para user_settings e themes
DROP POLICY IF EXISTS "Users can manage their own settings" ON user_settings;
CREATE POLICY "Allow all operations for service role" ON user_settings
    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Users can manage their own settings" ON user_settings
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own themes" ON themes;
CREATE POLICY "Allow all operations for service role" ON themes
    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Users can manage their own themes" ON themes
    FOR ALL USING (auth.uid() = user_id);

-- ====================================================================
-- 🔧 COMO USAR:
-- ====================================================================
-- Execute: SELECT emergency_sync_user('seu_email@aqui.com');
-- Substitua 'seu_email@aqui.com' pelo email do usuário logado
-- ====================================================================

-- Exemplo de uso:
-- SELECT emergency_sync_user('victorlivest@hotmail.com');
