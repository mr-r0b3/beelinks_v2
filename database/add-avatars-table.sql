-- ====================================================================
-- 🖼️ BeeLinks - Adição da Tabela de Avatars/Fotos de Perfil
-- ====================================================================
-- Execute este script no SQL Editor do Supabase para adicionar
-- o sistema de armazenamento de fotos de perfil
-- ====================================================================

-- ====================================================================
-- 📷 TABELA: user_avatars (Fotos de perfil dos usuários)
-- ====================================================================

CREATE TABLE IF NOT EXISTS user_avatars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Informações do arquivo
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL, -- em bytes
    file_type VARCHAR(50) NOT NULL, -- 'image/jpeg', 'image/png', etc.
    
    -- URLs de armazenamento
    storage_path TEXT NOT NULL, -- caminho no Supabase Storage
    public_url TEXT NOT NULL, -- URL pública para acesso
    
    -- Versões da imagem (thumbnails)
    thumbnail_url TEXT, -- versão pequena (64x64)
    medium_url TEXT,    -- versão média (128x128)
    
    -- Metadados
    width INTEGER,
    height INTEGER,
    is_active BOOLEAN DEFAULT true,
    
    -- Controle
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Apenas um avatar ativo por usuário
    UNIQUE(user_id, is_active) WHERE is_active = true
);

-- ====================================================================
-- 🔄 TRIGGERS para user_avatars
-- ====================================================================

CREATE TRIGGER update_user_avatars_updated_at BEFORE UPDATE ON user_avatars
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- 📊 ÍNDICES para user_avatars
-- ====================================================================

CREATE INDEX IF NOT EXISTS idx_user_avatars_user_id ON user_avatars(user_id);
CREATE INDEX IF NOT EXISTS idx_user_avatars_is_active ON user_avatars(is_active);
CREATE INDEX IF NOT EXISTS idx_user_avatars_uploaded_at ON user_avatars(uploaded_at DESC);

-- ====================================================================
-- 🔐 POLÍTICAS RLS para user_avatars
-- ====================================================================

ALTER TABLE user_avatars ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver seus próprios avatars
CREATE POLICY "Users can view their own avatars" ON user_avatars
    FOR SELECT USING (auth.uid() = user_id);

-- Usuários podem inserir seus próprios avatars
CREATE POLICY "Users can insert their own avatars" ON user_avatars
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar seus próprios avatars
CREATE POLICY "Users can update their own avatars" ON user_avatars
    FOR UPDATE USING (auth.uid() = user_id);

-- Usuários podem deletar seus próprios avatars
CREATE POLICY "Users can delete their own avatars" ON user_avatars
    FOR DELETE USING (auth.uid() = user_id);

-- Avatars ativos de perfis públicos são visíveis para todos
CREATE POLICY "Public can view active avatars from public profiles" ON user_avatars
    FOR SELECT USING (
        is_active = true AND 
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = user_avatars.user_id 
            AND users.is_profile_public = true
        )
    );

-- ====================================================================
-- 🛠️ FUNÇÕES AUXILIARES
-- ====================================================================

-- Função para ativar um avatar e desativar os outros
CREATE OR REPLACE FUNCTION set_active_avatar(p_user_id UUID, p_avatar_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar se o avatar pertence ao usuário
    IF NOT EXISTS (
        SELECT 1 FROM user_avatars 
        WHERE id = p_avatar_id AND user_id = p_user_id
    ) THEN
        RAISE EXCEPTION 'Avatar não encontrado ou não pertence ao usuário';
    END IF;
    
    -- Desativar todos os avatars do usuário
    UPDATE user_avatars 
    SET is_active = false, updated_at = NOW()
    WHERE user_id = p_user_id AND is_active = true;
    
    -- Ativar o avatar especificado
    UPDATE user_avatars 
    SET is_active = true, updated_at = NOW()
    WHERE id = p_avatar_id;
    
    -- Atualizar avatar_url na tabela users
    UPDATE users 
    SET avatar_url = (
        SELECT public_url FROM user_avatars 
        WHERE id = p_avatar_id
    ),
    updated_at = NOW()
    WHERE id = p_user_id;
    
    RETURN true;
END;
$$;

-- Função para obter avatar ativo do usuário
CREATE OR REPLACE FUNCTION get_active_avatar(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    file_name VARCHAR(255),
    public_url TEXT,
    thumbnail_url TEXT,
    medium_url TEXT,
    width INTEGER,
    height INTEGER,
    uploaded_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ua.id,
        ua.file_name,
        ua.public_url,
        ua.thumbnail_url,
        ua.medium_url,
        ua.width,
        ua.height,
        ua.uploaded_at
    FROM user_avatars ua
    WHERE ua.user_id = p_user_id 
    AND ua.is_active = true;
END;
$$;

-- ====================================================================
-- 📦 CONFIGURAR STORAGE BUCKET (Execute no Dashboard do Supabase)
-- ====================================================================

/*
1. Vá para Storage no Dashboard do Supabase
2. Crie um bucket chamado 'avatars'
3. Configure as políticas:

-- Política para inserção de avatars
CREATE POLICY "Users can upload their own avatars" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Política para visualização de avatars
CREATE POLICY "Public can view avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

-- Política para atualização de avatars
CREATE POLICY "Users can update their own avatars" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Política para exclusão de avatars
CREATE POLICY "Users can delete their own avatars" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );
*/

-- ====================================================================
-- 🔄 MIGRAR AVATARS EXISTENTES (Opcional)
-- ====================================================================

-- Função para migrar avatars existentes da coluna avatar_url
CREATE OR REPLACE FUNCTION migrate_existing_avatars()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    user_record RECORD;
    migrated_count INTEGER := 0;
BEGIN
    FOR user_record IN 
        SELECT id, avatar_url 
        FROM users 
        WHERE avatar_url IS NOT NULL 
        AND avatar_url != ''
        AND NOT EXISTS (
            SELECT 1 FROM user_avatars 
            WHERE user_id = users.id AND is_active = true
        )
    LOOP
        -- Inserir avatar como referência externa
        INSERT INTO user_avatars (
            user_id,
            file_name,
            file_size,
            file_type,
            storage_path,
            public_url,
            thumbnail_url,
            medium_url,
            is_active
        ) VALUES (
            user_record.id,
            'external_avatar.jpg',
            0, -- tamanho desconhecido
            'image/jpeg',
            'external',
            user_record.avatar_url,
            user_record.avatar_url,
            user_record.avatar_url,
            true
        );
        
        migrated_count := migrated_count + 1;
    END LOOP;
    
    RETURN migrated_count;
END;
$$;

-- ====================================================================
-- ✅ TABELA DE AVATARS CRIADA
-- ====================================================================
-- Execute: SELECT migrate_existing_avatars(); 
-- Para migrar avatars existentes (opcional)
-- ====================================================================
