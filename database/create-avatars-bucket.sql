-- ====================================================================
-- 📦 CRIAÇÃO DO BUCKET AVATARS NO SUPABASE STORAGE
-- ====================================================================
-- Execute este script no SQL Editor do Supabase Dashboard
-- ====================================================================

-- Criar bucket 'avatars' para armazenar fotos de perfil
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Verificar se o bucket foi criado
SELECT id, name, public, created_at 
FROM storage.buckets 
WHERE name = 'avatars';

-- ====================================================================
-- 🔐 POLÍTICAS DE SEGURANÇA PARA O BUCKET AVATARS
-- ====================================================================

-- Política para upload de avatars (usuários podem enviar seus próprios arquivos)
CREATE POLICY "Users can upload their own avatars" ON storage.objects
    FOR INSERT 
    WITH CHECK (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Política para visualização de avatars (todos podem ver)
CREATE POLICY "Anyone can view avatars" ON storage.objects
    FOR SELECT 
    USING (bucket_id = 'avatars');

-- Política para atualização de avatars (usuários podem atualizar seus próprios)
CREATE POLICY "Users can update their own avatars" ON storage.objects
    FOR UPDATE 
    USING (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Política para exclusão de avatars (usuários podem deletar seus próprios)
CREATE POLICY "Users can delete their own avatars" ON storage.objects
    FOR DELETE 
    USING (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- ====================================================================
-- ✅ VERIFICAÇÃO FINAL
-- ====================================================================

-- Verificar políticas criadas
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects' 
AND policyname LIKE '%avatar%';

-- ====================================================================
-- 📝 INSTRUÇÕES
-- ====================================================================

/*
1. Execute este script no SQL Editor do Supabase Dashboard
2. Verifique se o bucket 'avatars' foi criado com sucesso
3. Teste o upload de avatar na aplicação
4. Se houver problemas, verifique as políticas RLS

ESTRUTURA DE PASTAS NO BUCKET:
avatars/
├── {user_id}/
│   ├── {user_id}_{timestamp}.jpg
│   ├── {user_id}_{timestamp}.png
│   └── ...

EXEMPLO:
avatars/
├── 123e4567-e89b-12d3-a456-426614174000/
│   ├── 123e4567-e89b-12d3-a456-426614174000_1642784461234.jpg
│   └── 123e4567-e89b-12d3-a456-426614174000_1642784523456.png
*/
