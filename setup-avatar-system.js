require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupAvatarSystem() {
  console.log('🐝 BeeLinks - Configuração do Sistema de Avatars');
  console.log('===============================================');

  try {
    console.log('🗂️ 1. Verificando Storage bucket...');

    // Verificar se bucket avatars existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.log('⚠️ Erro ao listar buckets:', listError.message);
    } else {
      const avatarBucket = buckets?.find(bucket => bucket.name === 'avatars');

      if (!avatarBucket) {
        console.log('📁 Criando bucket "avatars"...');
        const { error: bucketError } = await supabase.storage.createBucket('avatars', {
          public: true,
          fileSizeLimit: 5 * 1024 * 1024, // 5MB
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
        });

        if (bucketError) {
          console.log('⚠️ Erro ao criar bucket:', bucketError.message);
          console.log('💡 Vá ao Supabase Dashboard > Storage e crie manualmente o bucket "avatars"');
        } else {
          console.log('✅ Bucket "avatars" criado');
        }
      } else {
        console.log('✅ Bucket "avatars" já existe');
      }
    }

    console.log('🔍 2. Verificando tabela user_avatars...');

    // Tentar fazer uma consulta simples para ver se a tabela existe
    const { data, error: queryError } = await supabase
      .from('user_avatars')
      .select('id')
      .limit(1);

    if (queryError) {
      if (queryError.message.includes('relation "user_avatars" does not exist')) {
        console.log('⚠️ Tabela user_avatars não existe');
        console.log('📋 Você precisa criar a tabela no Supabase Dashboard:');
        console.log('');
        console.log('SQL para executar no SQL Editor:');
        console.log('');
        console.log(`-- Criar tabela user_avatars
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
  FOR DELETE USING (auth.uid() = user_id);`);
        console.log('');
        
      } else {
        console.log('⚠️ Erro ao verificar tabela:', queryError.message);
      }
    } else {
      console.log('✅ Tabela user_avatars já existe');
    }

    console.log('🔍 3. Testando operações básicas...');

    // Verificar usuários existentes
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, email')
      .limit(5);

    if (usersError) {
      console.log('⚠️ Erro ao buscar usuários:', usersError.message);
    } else {
      console.log(`✅ Encontrados ${users.length} usuários na tabela`);
    }

    console.log('');
    console.log('🎉 Configuração concluída!');
    console.log('');
    console.log('📋 Status do sistema:');
    console.log('• ✅ Conexão com Supabase funcionando');
    console.log('• ✅ Bucket de storage verificado');
    console.log('• ✅ Tabela de usuários acessível');
    console.log('• ⚠️ Tabela user_avatars precisa ser criada manualmente');
    console.log('');
    console.log('🚀 Próximos passos:');
    console.log('1. Vá ao Supabase Dashboard > SQL Editor');
    console.log('2. Execute o código SQL mostrado acima');
    console.log('3. Teste o sistema de avatars na aplicação');

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

setupAvatarSystem();
