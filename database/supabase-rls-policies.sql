-- ====================================================================
-- 🔐 BeeLinks - Políticas de Segurança RLS (Row Level Security)
-- ====================================================================
-- Execute este arquivo APÓS executar o supabase-schema-clean.sql
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

-- ====================================================================
-- 👤 POLÍTICAS PARA USERS
-- ====================================================================

-- Usuários podem ver seus próprios dados
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Usuários podem atualizar seus próprios dados
CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Perfis públicos são visíveis para todos
CREATE POLICY "Public can view public profiles" ON users
    FOR SELECT USING (is_profile_public = true);

-- ====================================================================
-- 🔗 POLÍTICAS PARA LINKS
-- ====================================================================

-- Usuários podem gerenciar seus próprios links
CREATE POLICY "Users can manage their own links" ON links
    FOR ALL USING (auth.uid() = user_id);

-- Público pode ver links ativos de perfis públicos
CREATE POLICY "Public can view active links from public profiles" ON links
    FOR SELECT USING (
        is_active = true AND 
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = links.user_id 
            AND users.is_profile_public = true
        )
    );

-- ====================================================================
-- 👥 POLÍTICAS PARA SOCIAL LINKS
-- ====================================================================

-- Usuários podem gerenciar seus próprios links sociais
CREATE POLICY "Users can manage their own social links" ON social_links
    FOR ALL USING (auth.uid() = user_id);

-- Público pode ver links sociais visíveis de perfis públicos
CREATE POLICY "Public can view visible social links from public profiles" ON social_links
    FOR SELECT USING (
        is_visible = true AND 
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = social_links.user_id 
            AND users.is_profile_public = true
        )
    );

-- ====================================================================
-- 📊 POLÍTICAS PARA ANALYTICS
-- ====================================================================

-- Usuários podem ver suas próprias analytics
CREATE POLICY "Users can view their own link analytics" ON link_analytics
    FOR SELECT USING (auth.uid() = user_id);

-- Analytics podem ser inseridas para qualquer link (para visitantes anônimos)
CREATE POLICY "Analytics can be inserted for any link" ON link_analytics
    FOR INSERT WITH CHECK (true);

-- Política similar para profile analytics
CREATE POLICY "Users can view their own profile analytics" ON profile_analytics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Profile analytics can be inserted" ON profile_analytics
    FOR INSERT WITH CHECK (true);

-- ====================================================================
-- 🎨 POLÍTICAS PARA THEMES
-- ====================================================================

-- Usuários podem gerenciar seus próprios temas
CREATE POLICY "Users can manage their own themes" ON themes
    FOR ALL USING (auth.uid() = user_id);

-- ====================================================================
-- ⚙️ POLÍTICAS PARA USER SETTINGS
-- ====================================================================

-- Usuários podem gerenciar suas próprias configurações
CREATE POLICY "Users can manage their own settings" ON user_settings
    FOR ALL USING (auth.uid() = user_id);

-- ====================================================================
-- 🏷️ POLÍTICAS PARA TAGS
-- ====================================================================

-- Usuários podem gerenciar suas próprias tags
CREATE POLICY "Users can manage their own tags" ON link_tags
    FOR ALL USING (auth.uid() = user_id);

-- Usuários podem gerenciar atribuições de tags dos seus links
CREATE POLICY "Users can manage their own tag assignments" ON link_tag_assignments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM links 
            WHERE links.id = link_tag_assignments.link_id 
            AND links.user_id = auth.uid()
        )
    );

-- ====================================================================
-- 📱 POLÍTICAS PARA QR CODES
-- ====================================================================

-- Usuários podem gerenciar seus próprios QR codes
CREATE POLICY "Users can manage their own qr codes" ON qr_codes
    FOR ALL USING (auth.uid() = user_id);

-- ====================================================================
-- ✅ POLÍTICAS RLS CONFIGURADAS
-- ====================================================================
-- Agora seu banco está seguro com Row Level Security ativo!
-- ====================================================================
