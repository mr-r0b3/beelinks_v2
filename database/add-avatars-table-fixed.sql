-- ====================================================================
-- 🖼️ BeeLinks - Adição da Tabela de Avatars/Fotos de Perfil (CORRIGIDO)
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 🔄 TRIGGERS para user_avatars
-- ====================================================================

-- Primeiro, criar a função update_updated_at_column se não existir
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_avatars_updated_at 
    BEFORE UPDATE ON user_avatars
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- 📊 ÍNDICES para user_avatars
-- ====================================================================

CREATE INDEX IF NOT EXISTS idx_user_avatars_user_id ON user_avatars(user_id);
CREATE INDEX IF NOT EXISTS idx_user_avatars_is_active ON user_avatars(is_active);
CREATE INDEX IF NOT EXISTS idx_user_avatars_uploaded_at ON user_avatars(uploaded_at DESC);

-- Índice parcial para garantir apenas um avatar ativo por usuário
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_avatars_active_unique 
    ON user_avatars(user_id) 
    WHERE is_active = true;

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

-- Avatars ativos são visíveis para todos (para perfis públicos)
CREATE POLICY "Public can view active avatars" ON user_avatars
    FOR SELECT USING (is_active = true);

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
    
    -- Atualizar avatar_url na tabela users se a coluna existir
    UPDATE users 
    SET updated_at = NOW()
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
-- ✅ VERIFICAÇÕES FINAIS
-- ====================================================================

-- Verificar se a tabela foi criada
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_avatars') THEN
        RAISE NOTICE 'Tabela user_avatars criada com sucesso!';
    ELSE
        RAISE EXCEPTION 'Erro: Tabela user_avatars não foi criada';
    END IF;
END
$$;

-- ====================================================================
-- 📦 PRÓXIMOS PASSOS
-- ====================================================================

/*
CONFIGURAR STORAGE BUCKET:

1. Vá para Storage no Dashboard do Supabase
2. Crie um bucket chamado 'avatars'
3. Configure as políticas no SQL Editor:

INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true);

-- Política para upload de avatars
CREATE POLICY "Users can upload avatars" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Política para visualização
CREATE POLICY "Anyone can view avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

-- Política para atualização
CREATE POLICY "Users can update own avatars" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Política para exclusão
CREATE POLICY "Users can delete own avatars" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

OPCIONAL: Execute para migrar avatars existentes:
SELECT migrate_existing_avatars();
*/

-- ====================================================================
-- ✅ SCRIPT CONCLUÍDO
-- ====================================================================
