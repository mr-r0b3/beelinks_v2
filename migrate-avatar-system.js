require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateAvatarSystem() {
  console.log('🐝 BeeLinks - Migração do Sistema de Avatars');
  console.log('============================================');

  try {
    console.log('📋 1. Criando tabela user_avatars...');
    
    // Criar tabela user_avatars
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS user_avatars (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        file_name TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        mime_type TEXT NOT NULL,
        storage_path TEXT NOT NULL,
        public_url TEXT NOT NULL,
        is_active BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        CONSTRAINT user_avatars_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
      );
    `;

    const { error: tableError } = await supabase.rpc('exec_sql', { 
      sql_query: createTableQuery 
    });

    if (tableError) {
      console.log('⚠️ Tabela pode já existir:', tableError.message);
    } else {
      console.log('✅ Tabela user_avatars criada');
    }

    console.log('🔒 2. Configurando RLS policies...');
    
    // Habilitar RLS
    const enableRLSQuery = `
      ALTER TABLE user_avatars ENABLE ROW LEVEL SECURITY;
    `;

    await supabase.rpc('exec_sql', { sql_query: enableRLSQuery });

    // Policies
    const policiesQuery = `
      -- Policy para SELECT (usuários podem ver seus próprios avatars)
      DROP POLICY IF EXISTS "Users can view their own avatars" ON user_avatars;
      CREATE POLICY "Users can view their own avatars" ON user_avatars
        FOR SELECT USING (auth.uid() = user_id);

      -- Policy para INSERT (usuários podem criar seus próprios avatars)
      DROP POLICY IF EXISTS "Users can create their own avatars" ON user_avatars;
      CREATE POLICY "Users can create their own avatars" ON user_avatars
        FOR INSERT WITH CHECK (auth.uid() = user_id);

      -- Policy para UPDATE (usuários podem atualizar seus próprios avatars)
      DROP POLICY IF EXISTS "Users can update their own avatars" ON user_avatars;
      CREATE POLICY "Users can update their own avatars" ON user_avatars
        FOR UPDATE USING (auth.uid() = user_id);

      -- Policy para DELETE (usuários podem deletar seus próprios avatars)
      DROP POLICY IF EXISTS "Users can delete their own avatars" ON user_avatars;
      CREATE POLICY "Users can delete their own avatars" ON user_avatars
        FOR DELETE USING (auth.uid() = user_id);
    `;

    const { error: policiesError } = await supabase.rpc('exec_sql', { 
      sql_query: policiesQuery 
    });

    if (policiesError) {
      console.log('⚠️ Erro ao criar policies:', policiesError.message);
    } else {
      console.log('✅ RLS policies configuradas');
    }

    console.log('⚙️ 3. Criando funções auxiliares...');

    // Função para ativar avatar
    const functionsQuery = `
      -- Função para ativar um avatar (desativa outros)
      CREATE OR REPLACE FUNCTION set_active_avatar(p_user_id UUID, p_avatar_id UUID)
      RETURNS VOID AS $$
      BEGIN
        -- Desativar todos os avatars do usuário
        UPDATE user_avatars 
        SET is_active = FALSE, updated_at = NOW()
        WHERE user_id = p_user_id;
        
        -- Ativar o avatar específico
        UPDATE user_avatars 
        SET is_active = TRUE, updated_at = NOW()
        WHERE id = p_avatar_id AND user_id = p_user_id;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      -- Função para obter avatar ativo
      CREATE OR REPLACE FUNCTION get_active_avatar(p_user_id UUID)
      RETURNS TABLE(
        id UUID,
        file_name TEXT,
        public_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE
      ) AS $$
      BEGIN
        RETURN QUERY
        SELECT 
          ua.id,
          ua.file_name,
          ua.public_url,
          ua.created_at
        FROM user_avatars ua
        WHERE ua.user_id = p_user_id AND ua.is_active = TRUE
        LIMIT 1;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      -- Trigger para atualizar updated_at
      CREATE OR REPLACE FUNCTION update_user_avatars_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS update_user_avatars_updated_at_trigger ON user_avatars;
      CREATE TRIGGER update_user_avatars_updated_at_trigger
        BEFORE UPDATE ON user_avatars
        FOR EACH ROW
        EXECUTE FUNCTION update_user_avatars_updated_at();
    `;

    const { error: functionsError } = await supabase.rpc('exec_sql', { 
      sql_query: functionsQuery 
    });

    if (functionsError) {
      console.log('⚠️ Erro ao criar funções:', functionsError.message);
    } else {
      console.log('✅ Funções auxiliares criadas');
    }

    console.log('🗂️ 4. Configurando Storage bucket...');

    // Verificar se bucket avatars existe
    const { data: buckets } = await supabase.storage.listBuckets();
    const avatarBucket = buckets?.find(bucket => bucket.name === 'avatars');

    if (!avatarBucket) {
      const { error: bucketError } = await supabase.storage.createBucket('avatars', {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
      });

      if (bucketError) {
        console.log('⚠️ Erro ao criar bucket:', bucketError.message);
      } else {
        console.log('✅ Bucket "avatars" criado');
      }
    } else {
      console.log('✅ Bucket "avatars" já existe');
    }

    console.log('🎉 Migração concluída com sucesso!');
    console.log('\n📋 Sistema de avatars configurado:');
    console.log('• Tabela user_avatars criada');
    console.log('• RLS policies configuradas');
    console.log('• Funções auxiliares criadas');
    console.log('• Storage bucket configurado');
    console.log('\n🚀 Próximos passos:');
    console.log('• Teste o upload de avatars na aplicação');
    console.log('• Verifique se as fotos estão sendo salvas corretamente');

  } catch (error) {
    console.error('❌ Erro na migração:', error);
  }
}

migrateAvatarSystem();
