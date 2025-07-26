// Script para testar a conectividade com o Supabase Storage
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStorage() {
  console.log('🧪 Testando conectividade com Supabase Storage...');
  
  try {
    // Listar buckets
    console.log('\n📦 Verificando buckets existentes...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Erro ao listar buckets:', bucketsError);
      return;
    }
    
    console.log('✅ Buckets encontrados:', buckets.map(b => b.name));
    
    // Verificar se o bucket 'avatars' existe
    const avatarsBucket = buckets.find(b => b.name === 'avatars');
    if (!avatarsBucket) {
      console.log('\n⚠️  Bucket "avatars" não encontrado!');
      console.log('📝 Crie o bucket executando no SQL Editor do Supabase:');
      console.log('INSERT INTO storage.buckets (id, name, public) VALUES (\'avatars\', \'avatars\', true);');
      return;
    }
    
    console.log('✅ Bucket "avatars" encontrado:', avatarsBucket);
    
    // Testar upload de um arquivo fictício
    console.log('\n🔄 Testando upload...');
    const testFile = new Blob(['test content'], { type: 'text/plain' });
    const testPath = `test/test-${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(testPath, testFile);
      
    if (uploadError) {
      console.error('❌ Erro no upload de teste:', uploadError);
      return;
    }
    
    console.log('✅ Upload de teste realizado:', uploadData);
    
    // Testar URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(testPath);
      
    console.log('✅ URL pública gerada:', publicUrl);
    
    // Limpar arquivo de teste
    const { error: deleteError } = await supabase.storage
      .from('avatars')
      .remove([testPath]);
      
    if (deleteError) {
      console.log('⚠️  Erro ao deletar arquivo de teste:', deleteError);
    } else {
      console.log('✅ Arquivo de teste removido');
    }
    
    console.log('\n🎉 Teste de storage concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
}

testStorage();
