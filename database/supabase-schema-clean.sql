-- ====================================================================
-- 🐝 BeeLinks - Schema Base (Sem dados iniciais)
-- ====================================================================
-- Execute este arquivo primeiro no SQL Editor do Supabase
-- ====================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 👤 TABELA: users (Usuários)
-- ====================================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    bio TEXT DEFAULT 'Desenvolvedor | Criador de Conteúdo | Tech Enthusiast',
    avatar_url TEXT,
    theme_preference VARCHAR(10) DEFAULT 'dark' CHECK (theme_preference IN ('light', 'dark')),
    is_profile_public BOOLEAN DEFAULT true,
    custom_slug VARCHAR(50) UNIQUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    email_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true
);

-- ====================================================================
-- 🔗 TABELA: links (Links dos usuários)
-- ====================================================================

CREATE TABLE IF NOT EXISTS links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    title VARCHAR(100) NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    icon VARCHAR(50) DEFAULT 'fas fa-link',
    
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    background_color VARCHAR(7),
    text_color VARCHAR(7),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_url CHECK (url ~* '^https?://.*'),
    CONSTRAINT title_length CHECK (LENGTH(title) >= 2)
);

-- ====================================================================
-- 👥 TABELA: social_links (Links de redes sociais)
-- ====================================================================

CREATE TABLE IF NOT EXISTS social_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    platform VARCHAR(50) NOT NULL,
    username VARCHAR(100) NOT NULL,
    url TEXT NOT NULL,
    icon VARCHAR(50) NOT NULL,
    
    is_visible BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, platform),
    CONSTRAINT valid_social_url CHECK (url ~* '^https?://.*')
);

-- ====================================================================
-- 📊 TABELA: link_analytics (Analytics dos links)
-- ====================================================================

CREATE TABLE IF NOT EXISTS link_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    link_id UUID NOT NULL REFERENCES links(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('click', 'view', 'share')),
    
    visitor_ip INET,
    visitor_country VARCHAR(2),
    visitor_city VARCHAR(100),
    user_agent TEXT,
    referer TEXT,
    
    device_type VARCHAR(20),
    browser VARCHAR(50),
    os VARCHAR(50),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 📈 TABELA: profile_analytics (Analytics do perfil)
-- ====================================================================

CREATE TABLE IF NOT EXISTS profile_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    visitor_ip INET,
    visitor_country VARCHAR(2),
    visitor_city VARCHAR(100),
    user_agent TEXT,
    referer TEXT,
    
    session_duration INTEGER,
    pages_viewed INTEGER DEFAULT 1,
    
    device_type VARCHAR(20),
    browser VARCHAR(50),
    os VARCHAR(50),
    screen_resolution VARCHAR(20),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 🎨 TABELA: themes (Temas personalizados)
-- ====================================================================

CREATE TABLE IF NOT EXISTS themes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    name VARCHAR(50) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    
    primary_color VARCHAR(7) DEFAULT '#FFD700',
    secondary_color VARCHAR(7) DEFAULT '#FFC107',
    background_color VARCHAR(7) DEFAULT '#1A1A1A',
    text_color VARCHAR(7) DEFAULT '#FFFFFF',
    accent_color VARCHAR(7) DEFAULT '#2D2D2D',
    
    font_family VARCHAR(50) DEFAULT 'Inter',
    border_radius INTEGER DEFAULT 12,
    button_style VARCHAR(20) DEFAULT 'rounded',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, name)
);

-- ====================================================================
-- 🔐 TABELA: user_settings (Configurações do usuário)
-- ====================================================================

CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    analytics_enabled BOOLEAN DEFAULT true,
    public_analytics BOOLEAN DEFAULT false,
    show_click_count BOOLEAN DEFAULT true,
    allow_link_preview BOOLEAN DEFAULT true,
    
    email_notifications BOOLEAN DEFAULT true,
    weekly_analytics_email BOOLEAN DEFAULT false,
    new_follower_notification BOOLEAN DEFAULT true,
    
    current_theme_id UUID REFERENCES themes(id),
    show_avatar BOOLEAN DEFAULT true,
    show_bio BOOLEAN DEFAULT true,
    show_social_links BOOLEAN DEFAULT true,
    
    custom_css TEXT,
    custom_head_code TEXT,
    seo_title VARCHAR(60),
    seo_description VARCHAR(160),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- ====================================================================
-- 🏷️ TABELA: link_tags (Tags para organização de links)
-- ====================================================================

CREATE TABLE IF NOT EXISTS link_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    name VARCHAR(30) NOT NULL,
    color VARCHAR(7) DEFAULT '#FFD700',
    description TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, name)
);

-- ====================================================================
-- 🔗 TABELA: link_tag_assignments (Relação links-tags)
-- ====================================================================

CREATE TABLE IF NOT EXISTS link_tag_assignments (
    link_id UUID NOT NULL REFERENCES links(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES link_tags(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    PRIMARY KEY (link_id, tag_id)
);

-- ====================================================================
-- 📱 TABELA: qr_codes (QR Codes dos perfis)
-- ====================================================================

CREATE TABLE IF NOT EXISTS qr_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    code_data TEXT NOT NULL,
    image_url TEXT,
    style VARCHAR(20) DEFAULT 'default',
    
    foreground_color VARCHAR(7) DEFAULT '#000000',
    background_color VARCHAR(7) DEFAULT '#FFFFFF',
    logo_enabled BOOLEAN DEFAULT false,
    
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    download_count INTEGER DEFAULT 0,
    
    UNIQUE(user_id)
);

-- ====================================================================
-- 🔄 TRIGGERS - Automatizações
-- ====================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_links_updated_at BEFORE UPDATE ON links
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_links_updated_at BEFORE UPDATE ON social_links
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_themes_updated_at BEFORE UPDATE ON themes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- 📊 ÍNDICES - Para otimização de performance
-- ====================================================================

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_custom_slug ON users(custom_slug);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE INDEX IF NOT EXISTS idx_links_user_id ON links(user_id);
CREATE INDEX IF NOT EXISTS idx_links_created_at ON links(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_links_is_active ON links(is_active);
CREATE INDEX IF NOT EXISTS idx_links_sort_order ON links(sort_order);

CREATE INDEX IF NOT EXISTS idx_link_analytics_link_id ON link_analytics(link_id);
CREATE INDEX IF NOT EXISTS idx_link_analytics_created_at ON link_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_link_analytics_event_type ON link_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_profile_analytics_user_id ON profile_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_analytics_created_at ON profile_analytics(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_link_tags_user_id ON link_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_link_tag_assignments_link_id ON link_tag_assignments(link_id);
CREATE INDEX IF NOT EXISTS idx_link_tag_assignments_tag_id ON link_tag_assignments(tag_id);

-- ====================================================================
-- ✅ ESTRUTURA BÁSICA CRIADA
-- ====================================================================
-- Próximo passo: Execute o arquivo "supabase-rls-policies.sql"
-- para configurar as políticas de segurança
-- ====================================================================
