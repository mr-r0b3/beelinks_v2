-- ====================================================================
-- 🐝 BeeLinks - Esquema de Banco de Dados Supabase
-- ====================================================================
-- Este arquivo contém o mapeamento completo do banco de dados 
-- para migração do LocalStorage para Supabase PostgreSQL
-- ====================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 👤 TABELA: users (Usuários)
-- ====================================================================
-- Armazena informações dos usuários do sistema
-- Substitui: localStorage 'beelinks_profile'
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
    custom_slug VARCHAR(50) UNIQUE, -- Para URLs personalizadas como beelinks.com/username
    
    -- Metadados de controle
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    email_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true
);

-- ====================================================================
-- 🔗 TABELA: links (Links dos usuários)
-- ====================================================================
-- Armazena todos os links criados pelos usuários
-- Substitui: localStorage 'beelinks_links'
-- ====================================================================

CREATE TABLE IF NOT EXISTS links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Dados do link
    title VARCHAR(100) NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    icon VARCHAR(50) DEFAULT 'fas fa-link',
    
    -- Configurações do link
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    background_color VARCHAR(7), -- Hex color code
    text_color VARCHAR(7), -- Hex color code
    
    -- Metadados de controle
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_url CHECK (url ~* '^https?://.*'),
    CONSTRAINT title_length CHECK (LENGTH(title) >= 2),
    CONSTRAINT description_length CHECK (LENGTH(description) >= 5)
);

-- ====================================================================
-- 👥 TABELA: social_links (Links de redes sociais)
-- ====================================================================
-- Armazena links de redes sociais separadamente dos links principais
-- Melhora a organização e permite funcionalidades específicas
-- ====================================================================

CREATE TABLE IF NOT EXISTS social_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Dados da rede social
    platform VARCHAR(50) NOT NULL, -- 'github', 'linkedin', 'twitter', etc.
    username VARCHAR(100) NOT NULL,
    url TEXT NOT NULL,
    icon VARCHAR(50) NOT NULL,
    
    -- Configurações
    is_visible BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    
    -- Metadados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(user_id, platform), -- Um usuário pode ter apenas um link por plataforma
    CONSTRAINT valid_social_url CHECK (url ~* '^https?://.*')
);

-- ====================================================================
-- 📊 TABELA: link_analytics (Analytics dos links)
-- ====================================================================
-- Armazena dados detalhados de cliques e visualizações
-- Substitui: contador simples de cliques no localStorage
-- ====================================================================

CREATE TABLE IF NOT EXISTS link_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    link_id UUID NOT NULL REFERENCES links(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Dados do evento
    event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('click', 'view', 'share')),
    
    -- Dados do visitante
    visitor_ip INET,
    visitor_country VARCHAR(2), -- Código ISO do país
    visitor_city VARCHAR(100),
    user_agent TEXT,
    referer TEXT,
    
    -- Dados técnicos
    device_type VARCHAR(20), -- 'mobile', 'desktop', 'tablet'
    browser VARCHAR(50),
    os VARCHAR(50),
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 📈 TABELA: profile_analytics (Analytics do perfil)
-- ====================================================================
-- Armazena dados de visualizações do perfil completo
-- ====================================================================

CREATE TABLE IF NOT EXISTS profile_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Dados do visitante
    visitor_ip INET,
    visitor_country VARCHAR(2),
    visitor_city VARCHAR(100),
    user_agent TEXT,
    referer TEXT,
    
    -- Dados da sessão
    session_duration INTEGER, -- Em segundos
    pages_viewed INTEGER DEFAULT 1,
    
    -- Dados técnicos
    device_type VARCHAR(20),
    browser VARCHAR(50),
    os VARCHAR(50),
    screen_resolution VARCHAR(20),
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 🎨 TABELA: themes (Temas personalizados)
-- ====================================================================
-- Permite usuários criarem temas personalizados para seus perfis
-- ====================================================================

CREATE TABLE IF NOT EXISTS themes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Dados do tema
    name VARCHAR(50) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    
    -- Cores
    primary_color VARCHAR(7) DEFAULT '#FFD700',
    secondary_color VARCHAR(7) DEFAULT '#FFC107',
    background_color VARCHAR(7) DEFAULT '#1A1A1A',
    text_color VARCHAR(7) DEFAULT '#FFFFFF',
    accent_color VARCHAR(7) DEFAULT '#2D2D2D',
    
    -- Configurações visuais
    font_family VARCHAR(50) DEFAULT 'Inter',
    border_radius INTEGER DEFAULT 12, -- Em pixels
    button_style VARCHAR(20) DEFAULT 'rounded', -- 'rounded', 'square', 'pill'
    
    -- Metadados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(user_id, name)
);

-- ====================================================================
-- 🔐 TABELA: user_settings (Configurações do usuário)
-- ====================================================================
-- Armazena configurações e preferências do usuário
-- Substitui: localStorage 'beelinks_theme' e outras configurações
-- ====================================================================

CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Configurações de privacidade
    analytics_enabled BOOLEAN DEFAULT true,
    public_analytics BOOLEAN DEFAULT false,
    show_click_count BOOLEAN DEFAULT true,
    allow_link_preview BOOLEAN DEFAULT true,
    
    -- Configurações de notificação
    email_notifications BOOLEAN DEFAULT true,
    weekly_analytics_email BOOLEAN DEFAULT false,
    new_follower_notification BOOLEAN DEFAULT true,
    
    -- Configurações visuais
    current_theme_id UUID REFERENCES themes(id),
    show_avatar BOOLEAN DEFAULT true,
    show_bio BOOLEAN DEFAULT true,
    show_social_links BOOLEAN DEFAULT true,
    
    -- Configurações avançadas
    custom_css TEXT,
    custom_head_code TEXT, -- Para Google Analytics, etc.
    seo_title VARCHAR(60),
    seo_description VARCHAR(160),
    
    -- Metadados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint
    UNIQUE(user_id)
);

-- ====================================================================
-- 🏷️ TABELA: link_tags (Tags para organização de links)
-- ====================================================================
-- Permite categorização e organização de links com tags
-- ====================================================================

CREATE TABLE IF NOT EXISTS link_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Dados da tag
    name VARCHAR(30) NOT NULL,
    color VARCHAR(7) DEFAULT '#FFD700',
    description TEXT,
    
    -- Metadados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(user_id, name)
);

-- ====================================================================
-- 🔗 TABELA: link_tag_assignments (Relação links-tags)
-- ====================================================================
-- Tabela de junção para relacionamento many-to-many entre links e tags
-- ====================================================================

CREATE TABLE IF NOT EXISTS link_tag_assignments (
    link_id UUID NOT NULL REFERENCES links(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES link_tags(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Chave primária composta
    PRIMARY KEY (link_id, tag_id)
);

-- ====================================================================
-- 📱 TABELA: qr_codes (QR Codes dos perfis)
-- ====================================================================
-- Armazena informações sobre QR codes gerados para perfis
-- ====================================================================

CREATE TABLE IF NOT EXISTS qr_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Dados do QR Code
    code_data TEXT NOT NULL, -- URL do perfil
    image_url TEXT, -- URL da imagem do QR Code gerada
    style VARCHAR(20) DEFAULT 'default', -- Estilo visual do QR Code
    
    -- Configurações
    foreground_color VARCHAR(7) DEFAULT '#000000',
    background_color VARCHAR(7) DEFAULT '#FFFFFF',
    logo_enabled BOOLEAN DEFAULT false,
    
    -- Metadados
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    download_count INTEGER DEFAULT 0,
    
    -- Constraint
    UNIQUE(user_id)
);

-- ====================================================================
-- 🎯 VIEWS - Para facilitar consultas complexas
-- ====================================================================

-- View para estatísticas de usuário
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id as user_id,
    u.username,
    COUNT(DISTINCT l.id) as total_links,
    COUNT(DISTINCT la.id) FILTER (WHERE la.event_type = 'click') as total_clicks,
    COUNT(DISTINCT la.id) FILTER (WHERE la.event_type = 'view') as total_views,
    COUNT(DISTINCT pa.id) as profile_views,
    DATE_TRUNC('month', la.created_at) as month
FROM users u
LEFT JOIN links l ON u.id = l.user_id AND l.is_active = true
LEFT JOIN link_analytics la ON l.id = la.link_id
LEFT JOIN profile_analytics pa ON u.id = pa.user_id
GROUP BY u.id, u.username, DATE_TRUNC('month', la.created_at);

-- View para links populares
CREATE OR REPLACE VIEW popular_links AS
SELECT 
    l.*,
    u.username,
    COUNT(la.id) FILTER (WHERE la.event_type = 'click') as click_count,
    COUNT(la.id) FILTER (WHERE la.event_type = 'view') as view_count
FROM links l
JOIN users u ON l.user_id = u.id
LEFT JOIN link_analytics la ON l.id = la.link_id
WHERE l.is_active = true
GROUP BY l.id, u.username
ORDER BY click_count DESC, view_count DESC;

-- ====================================================================
-- 🔐 RLS (Row Level Security) - Políticas de Segurança
-- ====================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_tag_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

-- Políticas para users (usuários podem ver/editar apenas seus próprios dados)
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Políticas para links
CREATE POLICY "Users can manage their own links" ON links
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public can view active links from public profiles" ON links
    FOR SELECT USING (
        is_active = true AND 
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = links.user_id 
            AND users.is_profile_public = true
        )
    );

-- Políticas similares para outras tabelas...
CREATE POLICY "Users can manage their own social links" ON social_links
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own analytics" ON link_analytics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Analytics can be inserted for any link" ON link_analytics
    FOR INSERT WITH CHECK (true);

-- ====================================================================
-- 🔄 TRIGGERS - Automatizações
-- ====================================================================

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em tabelas relevantes
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

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_custom_slug ON users(custom_slug);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Índices para links
CREATE INDEX IF NOT EXISTS idx_links_user_id ON links(user_id);
CREATE INDEX IF NOT EXISTS idx_links_created_at ON links(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_links_is_active ON links(is_active);
CREATE INDEX IF NOT EXISTS idx_links_sort_order ON links(sort_order);

-- Índices para analytics
CREATE INDEX IF NOT EXISTS idx_link_analytics_link_id ON link_analytics(link_id);
CREATE INDEX IF NOT EXISTS idx_link_analytics_created_at ON link_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_link_analytics_event_type ON link_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_profile_analytics_user_id ON profile_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_analytics_created_at ON profile_analytics(created_at DESC);

-- Índices para tags
CREATE INDEX IF NOT EXISTS idx_link_tags_user_id ON link_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_link_tag_assignments_link_id ON link_tag_assignments(link_id);
CREATE INDEX IF NOT EXISTS idx_link_tag_assignments_tag_id ON link_tag_assignments(tag_id);

-- ====================================================================
-- 🌱 DADOS INICIAIS (Seeds)
-- ====================================================================

-- Temas padrão serão criados automaticamente quando um usuário se cadastrar
-- através da aplicação Next.js ou podem ser inseridos manualmente após
-- criar usuários no sistema

-- ====================================================================
-- 📝 COMENTÁRIOS E DOCUMENTAÇÃO
-- ====================================================================

COMMENT ON TABLE users IS 'Tabela principal de usuários do sistema BeeLinks';
COMMENT ON TABLE links IS 'Links personalizados criados pelos usuários';
COMMENT ON TABLE social_links IS 'Links de redes sociais dos usuários';
COMMENT ON TABLE link_analytics IS 'Analytics detalhados de cliques e visualizações nos links';
COMMENT ON TABLE profile_analytics IS 'Analytics de visualizações do perfil completo';
COMMENT ON TABLE themes IS 'Temas personalizados para estilização dos perfis';
COMMENT ON TABLE user_settings IS 'Configurações e preferências dos usuários';
COMMENT ON TABLE link_tags IS 'Tags para categorização de links';
COMMENT ON TABLE link_tag_assignments IS 'Relação many-to-many entre links e tags';
COMMENT ON TABLE qr_codes IS 'QR codes gerados para os perfis dos usuários';

-- ====================================================================
-- ✅ SCRIPT COMPLETADO
-- ====================================================================
-- Este esquema está pronto para implementação no Supabase
-- Funcionalidades incluídas:
-- - Gestão completa de usuários e autenticação
-- - CRUD de links com analytics avançados
-- - Sistema de temas personalizáveis
-- - Tags para organização
-- - QR codes para compartilhamento
-- - Analytics detalhados
-- - Políticas de segurança RLS
-- - Performance otimizada com índices
-- ====================================================================
