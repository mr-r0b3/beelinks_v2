-- ====================================================================
-- 🐝 BeeLinks - Triggers de Autenticação
-- ====================================================================
-- Triggers para sincronizar usuários entre auth.users e public.users
-- Execute este arquivo no SQL Editor do Supabase após o schema principal
-- ====================================================================

-- ====================================================================
-- 🔄 FUNÇÃO: Criar usuário na tabela users quando cadastrar no auth
-- ====================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    username_base VARCHAR(50);
    username_final VARCHAR(50);
    counter INTEGER := 1;
BEGIN
    -- Gerar username base a partir do email
    username_base := LOWER(SPLIT_PART(NEW.email, '@', 1));
    
    -- Limpar caracteres especiais e limitar tamanho
    username_base := REGEXP_REPLACE(username_base, '[^a-z0-9_]', '', 'g');
    username_base := SUBSTRING(username_base FROM 1 FOR 20);
    
    -- Se username estiver vazio, usar 'user'
    IF username_base = '' THEN
        username_base := 'user';
    END IF;
    
    username_final := username_base;
    
    -- Verificar se username já existe e criar variação única
    WHILE EXISTS (SELECT 1 FROM users WHERE username = username_final) LOOP
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
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        username_final,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        'Desenvolvedor | Criador de Conteúdo | Tech Enthusiast',
        NEW.email_confirmed_at IS NOT NULL,
        NOW(),
        NOW()
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
        NEW.id,
        true,
        false,
        true,
        true,
        true,
        true,
        true,
        true,
        NOW(),
        NOW()
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
        NEW.id,
        'Tema BeeLinks',
        true,
        '#FFD700',
        '#FFC107',
        '#1A1A1A',
        '#FFFFFF',
        '#2D2D2D',
        'Inter',
        12,
        'rounded',
        NOW(),
        NOW()
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log do erro mas não falha o cadastro
        RAISE LOG 'Erro ao criar usuário: %', SQLERRM;
        RETURN NEW;
END;
$$;

-- ====================================================================
-- 🔄 FUNÇÃO: Atualizar dados do usuário quando alterado no auth
-- ====================================================================

CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Atualizar email e verificação
    UPDATE public.users 
    SET 
        email = NEW.email,
        email_verified = NEW.email_confirmed_at IS NOT NULL,
        last_login = CASE 
            WHEN NEW.last_sign_in_at > OLD.last_sign_in_at THEN NEW.last_sign_in_at
            ELSE last_login
        END,
        updated_at = NOW()
    WHERE id = NEW.id;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Erro ao atualizar usuário: %', SQLERRM;
        RETURN NEW;
END;
$$;

-- ====================================================================
-- 🔄 FUNÇÃO: Remover usuário quando deletado do auth
-- ====================================================================

CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Deletar usuário da tabela public.users (CASCADE irá deletar relacionados)
    DELETE FROM public.users WHERE id = OLD.id;
    
    RETURN OLD;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Erro ao deletar usuário: %', SQLERRM;
        RETURN OLD;
END;
$$;

-- ====================================================================
-- 🎯 TRIGGERS: Conectar funções aos eventos do auth.users
-- ====================================================================

-- Trigger para quando um novo usuário se cadastra
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Trigger para quando dados do usuário são atualizados
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_user_update();

-- Trigger para quando usuário é deletado
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
    AFTER DELETE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_user_delete();

-- ====================================================================
-- 🔧 FUNÇÃO UTILITÁRIA: Sincronizar usuários existentes
-- ====================================================================

CREATE OR REPLACE FUNCTION public.sync_existing_users()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    sync_count INTEGER := 0;
    auth_user RECORD;
    username_base VARCHAR(50);
    username_final VARCHAR(50);
    counter INTEGER;
BEGIN
    -- Sincronizar usuários que existem no auth mas não no public
    FOR auth_user IN 
        SELECT * FROM auth.users 
        WHERE id NOT IN (SELECT id FROM public.users)
    LOOP
        -- Gerar username único
        username_base := LOWER(SPLIT_PART(auth_user.email, '@', 1));
        username_base := REGEXP_REPLACE(username_base, '[^a-z0-9_]', '', 'g');
        username_base := SUBSTRING(username_base FROM 1 FOR 20);
        
        IF username_base = '' THEN
            username_base := 'user';
        END IF;
        
        username_final := username_base;
        counter := 1;
        
        WHILE EXISTS (SELECT 1 FROM users WHERE username = username_final) LOOP
            username_final := username_base || counter::TEXT;
            counter := counter + 1;
        END LOOP;
        
        -- Inserir usuário
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
            auth_user.id,
            auth_user.email,
            username_final,
            COALESCE(auth_user.raw_user_meta_data->>'full_name', ''),
            'Desenvolvedor | Criador de Conteúdo | Tech Enthusiast',
            auth_user.email_confirmed_at IS NOT NULL,
            COALESCE(auth_user.created_at, NOW()),
            NOW(),
            auth_user.last_sign_in_at
        );
        
        -- Criar configurações padrão
        INSERT INTO public.user_settings (
            user_id,
            analytics_enabled,
            public_analytics,
            show_click_count,
            allow_link_preview,
            email_notifications,
            show_avatar,
            show_bio,
            show_social_links
        ) VALUES (
            auth_user.id,
            true, false, true, true, true, true, true, true
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
            button_style
        ) VALUES (
            auth_user.id,
            'Tema BeeLinks',
            true,
            '#FFD700', '#FFC107', '#1A1A1A', '#FFFFFF', '#2D2D2D',
            'Inter', 12, 'rounded'
        );
        
        sync_count := sync_count + 1;
    END LOOP;
    
    RETURN sync_count;
END;
$$;

-- ====================================================================
-- 🔒 PERMISSÕES: Garantir acesso adequado
-- ====================================================================

-- Permitir que os triggers acessem as tabelas necessárias
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ====================================================================
-- ✅ TRIGGERS DE AUTENTICAÇÃO CONFIGURADOS
-- ====================================================================
-- Execute: SELECT public.sync_existing_users(); 
-- Para sincronizar usuários que já existem no sistema
-- ====================================================================
