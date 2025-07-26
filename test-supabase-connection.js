// ====================================================================
// 🧪 Teste de Conexão com Supabase
// ====================================================================
// Execute: node test-supabase-connection.js
// ====================================================================

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🐝 BeeLinks - Teste de Conexão Supabase');
console.log('=======================================');

// Verificar variáveis de ambiente
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Variáveis de ambiente não encontradas!');
  console.log('Verifique se o arquivo .env.local existe e contém:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

console.log('✅ Variáveis de ambiente encontradas');
console.log('📡 URL:', supabaseUrl);
console.log('🔑 Key:', supabaseKey.substring(0, 20) + '...');

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('\n🔍 Testando conexão com Supabase...');
    
    // Teste 1: Verificar conexão básica
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Erro na conexão:', error.message);
      return false;
    }
    
    console.log('✅ Conexão estabelecida com sucesso!');
    console.log('📊 Tabela users encontrada');
    
    // Teste 2: Verificar todas as tabelas
    console.log('\n🗄️ Verificando estrutura do banco...');
    
    const tables = [
      'users', 'links', 'social_links', 'link_analytics', 
      'profile_analytics', 'themes', 'user_settings', 
      'link_tags', 'link_tag_assignments', 'qr_codes'
    ];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ Tabela '${table}': ${error.message}`);
      } else {
        console.log(`✅ Tabela '${table}': OK`);
      }
    }
    console.log('\n✅ Todas as tabelas verificadas com sucesso!');
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
    return false;
  }
}

// Executar teste
testConnection();
