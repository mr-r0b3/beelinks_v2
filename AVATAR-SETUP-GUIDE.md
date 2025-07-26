# 🐝 BeeLinks - Guia de Configuração do Sistema de Avatars

## 📋 Status Atual

✅ **Completo:**
- Componente AvatarManager criado
- EditProfileModal atualizado com abas
- Profile.js atualizado para usar avatars do banco
- avatarService implementado no supabase.js
- Sistema de fallback para avatar padrão

⚠️ **Pendente (configuração manual):**
- Criação da tabela user_avatars no Supabase
- Criação do bucket de storage "avatars"

## 🛠️ Instruções para Finalizar

### 1. Configurar Storage no Supabase Dashboard

1. Acesse: https://supabase.com/dashboard
2. Vá em **Storage** > **Buckets**
3. Clique em **Create bucket**
4. Configure:
   - **Name:** `avatars`
   - **Public:** ✅ Enabled
   - **File size limit:** `5MB`
   - **Allowed MIME types:** `image/jpeg,image/png,image/webp`

### 2. Criar Tabela user_avatars

1. Vá em **SQL Editor**
2. Execute o seguinte código:

```sql
-- Criar tabela user_avatars
CREATE TABLE user_avatars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE user_avatars ENABLE ROW LEVEL SECURITY;

-- Policies de segurança
CREATE POLICY "Users can view their own avatars" ON user_avatars
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own avatars" ON user_avatars
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own avatars" ON user_avatars
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own avatars" ON user_avatars
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_user_avatars_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_avatars_updated_at_trigger
  BEFORE UPDATE ON user_avatars
  FOR EACH ROW
  EXECUTE FUNCTION update_user_avatars_updated_at();
```

### 3. Configurar Storage Policies (se necessário)

Se houver problemas de permissão no storage, execute:

```sql
-- Policy para storage bucket "avatars"
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policies para o bucket avatars
CREATE POLICY "Users can upload their own avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can update their own avatars" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatars" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

## 🧪 Como Testar

1. **Faça login na aplicação**
2. **Vá ao perfil** e clique em "Editar Perfil"
3. **Clique na aba "Foto de Perfil"**
4. **Teste o upload** de uma imagem (JPEG, PNG ou WebP até 5MB)
5. **Verifique se aparece** na lista de fotos
6. **Teste ativar** diferentes fotos
7. **Teste deletar** uma foto

## 🔧 Funcionalidades Implementadas

### AvatarManager Component
- ✅ Upload de arquivos com validação
- ✅ Preview das imagens
- ✅ Ativação/desativação de avatars
- ✅ Exclusão de avatars
- ✅ Indicador visual do avatar ativo
- ✅ Barra de progresso no upload
- ✅ Mensagens de erro e sucesso

### EditProfileModal
- ✅ Sistema de abas (Informações / Foto de Perfil)
- ✅ Integração com AvatarManager
- ✅ Atualização em tempo real do avatar no perfil

### Profile Component
- ✅ Carregamento de avatar do banco de dados
- ✅ Fallback para avatar padrão
- ✅ Auto-criação de perfil para novos usuários
- ✅ Sincronização automática

### avatarService
- ✅ Upload para Supabase Storage
- ✅ Gerenciamento de avatars ativos
- ✅ CRUD completo (Create, Read, Update, Delete)
- ✅ Validações de tipo e tamanho
- ✅ Geração de URLs públicas
- ✅ Tratamento de erros robusto

## 📝 Observações

- O sistema funciona mesmo **sem a tabela** user_avatars (usa modo simplificado)
- **Avatars padrão** são gerados usando API externa (DiceBear)
- **Validações** impedem uploads de arquivos muito grandes ou tipos incorretos
- **RLS policies** garantem que usuários só vejam/modifiquem seus próprios avatars
- **Storage público** permite acesso direto às imagens via URL

## 🚨 Troubleshooting

### Erro: "bucket avatars does not exist"
- Crie o bucket manualmente no Supabase Dashboard

### Erro: "relation user_avatars does not exist"
- Execute o SQL de criação da tabela no SQL Editor

### Erro: "new row violates row-level security policy"
- Verifique se as RLS policies foram criadas corretamente

### Upload não funciona
- Verifique se o bucket está público
- Verifique as policies do storage

## 🎉 Resultado Final

Após completar essas etapas, os usuários poderão:

1. **Fazer upload** de suas próprias fotos de perfil
2. **Gerenciar múltiplos avatars** 
3. **Alternar** entre diferentes fotos
4. **Ver preview** das imagens antes de ativar
5. **Excluir** fotos que não desejam mais

O sistema é **robusto** e **escalável**, preparado para centenas de usuários!
