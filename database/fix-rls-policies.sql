-- ====================================================================
-- 🔐 BeeLinks - Políticas RLS Corrigidas
-- ====================================================================
-- Execute este arquivo para corrigir problemas de sincronização de usuários
-- ====================================================================

-- ====================================================================
-- 👤 POLÍTICAS CORRIGIDAS PARA USERS
-- ====================================================================

-- Remover políticas existentes conflitantes
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Public can view public profiles" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable update for users based on email" ON users;

-- Política para permitir inserção de usuários via triggers (service_role)
CREATE POLICY "Allow service role to insert users" ON users
    FOR INSERT WITH CHECK (true);

-- Usuários podem ver seus próprios dados
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Usuários podem atualizar seus próprios dados
CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Perfis públicos são visíveis para todos (incluindo anônimos)
CREATE POLICY "Public can view public profiles" ON users
    FOR SELECT USING (is_profile_public = true);

-- ====================================================================
-- ⚙️ POLÍTICAS CORRIGIDAS PARA USER_SETTINGS
-- ====================================================================

-- Remover políticas existentes conflitantes
DROP POLICY IF EXISTS "Users can manage their own settings" ON user_settings;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON user_settings;

-- Permitir inserção via service_role (triggers)
CREATE POLICY "Allow service role to insert user settings" ON user_settings
    FOR INSERT WITH CHECK (true);

-- Usuários podem gerenciar suas próprias configurações
CREATE POLICY "Users can manage their own settings" ON user_settings
    FOR ALL USING (auth.uid() = user_id);

-- ====================================================================
-- 🎨 POLÍTICAS CORRIGIDAS PARA THEMES
-- ====================================================================

-- Remover políticas existentes conflitantes
DROP POLICY IF EXISTS "Users can manage their own themes" ON themes;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON themes;

-- Permitir inserção via service_role (triggers)
CREATE POLICY "Allow service role to insert themes" ON themes
    FOR INSERT WITH CHECK (true);

-- Usuários podem gerenciar seus próprios temas
CREATE POLICY "Users can manage their own themes" ON themes
    FOR ALL USING (auth.uid() = user_id);

-- ====================================================================
-- 🔧 FUNÇÃO CORRIGIDA PARA SYNC DE USUÁRIOS
-- ====================================================================

-- Atualizar função para usar privilégios de service_role
CREATE OR REPLACE FUNCTION public.sync_user_manual(user_auth_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER -- Executa com privilégios de service_role
AS $$
DECLARE
    auth_user_data RECORD;
    username_base VARCHAR(50);
    username_final VARCHAR(50);
    counter INTEGER := 1;
    result JSON;
BEGIN
    -- Buscar dados do usuário no auth.users
    SELECT * INTO auth_user_data
    FROM auth.users 
    WHERE id = user_auth_id;
    
    -- Verificar se usuário existe no auth
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Usuário não encontrado no auth.users'
        );
    END IF;
    
    -- Verificar se já existe no public.users
    IF EXISTS (SELECT 1 FROM public.users WHERE id = user_auth_id) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Usuário já existe na tabela public.users'
        );
    END IF;
    
    -- Gerar username único
    username_base := LOWER(SPLIT_PART(auth_user_data.email, '@', 1));
    username_base := REGEXP_REPLACE(username_base, '[^a-z0-9_]', '', 'g');
    username_base := SUBSTRING(username_base FROM 1 FOR 20);
    
    IF username_base = '' OR username_base IS NULL THEN
        username_base := 'user';
    END IF;
    
    username_final := username_base;
    
    -- Verificar se username já existe e criar variação única
    WHILE EXISTS (SELECT 1 FROM public.users WHERE username = username_final) LOOP
        username_final := username_base || counter::TEXT;
        counter := counter + 1;
    END LOOP;
    
    -- Inserir usuário na tabela public.users
    INSERT INTO public.users (
        id,
        email,
        username,
        full_name,
        bio,
        email_verified,
        created_at,
        updated_at,
        last_login
    ) VALUES (
        auth_user_data.id,
        auth_user_data.email,
        username_final,
        COALESCE(auth_user_data.raw_user_meta_data->>'full_name', ''),
        'Desenvolvedor | Criador de Conteúdo | Tech Enthusiast',
        auth_user_data.email_confirmed_at IS NOT NULL,
        COALESCE(auth_user_data.created_at, NOW()),
        NOW(),
        auth_user_data.last_sign_in_at
    );
    
    -- Criar configurações padrão do usuário
    INSERT INTO public.user_settings (
        user_id,
        analytics_enabled,
        public_analytics,
        show_click_count,
        allow_link_preview,
        email_notifications,
        show_avatar,
        show_bio,
        show_social_links,
        created_at,
        updated_at
    ) VALUES (
        auth_user_data.id,
        true, false, true, true, true, true, true, true,
        NOW(), NOW()
    );
    
    -- Criar tema padrão
    INSERT INTO public.themes (
        user_id,
        name,
        is_default,
        primary_color,
        secondary_color,
        background_color,
        text_color,
        accent_color,
        font_family,
        border_radius,
        button_style,
        created_at,
        updated_at
    ) VALUES (
        auth_user_data.id,
        'Tema BeeLinks',
        true,
        '#FFD700', '#FFC107', '#1A1A1A', '#FFFFFF', '#2D2D2D',
        'Inter', 12, 'rounded',
        NOW(), NOW()
    );
    
    -- Retornar sucesso
    RETURN json_build_object(
        'success', true,
        'username', username_final,
        'message', 'Usuário sincronizado com sucesso!'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log do erro e retornar
        RAISE LOG 'Erro ao sincronizar usuário %: %', user_auth_id, SQLERRM;
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- ====================================================================
-- 🔧 GRANTS NECESSÁRIOS
-- ====================================================================

-- Permitir que a função seja executada por usuários autenticados
GRANT EXECUTE ON FUNCTION public.sync_user_manual(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_user_manual(UUID) TO anon;

-- Garantir que service_role tem acesso total
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ====================================================================
-- ✅ POLÍTICAS RLS CORRIGIDAS
-- ====================================================================
-- Execute também: SELECT public.sync_user_manual(auth.uid());
-- Para sincronizar o usuário atual
-- ====================================================================
