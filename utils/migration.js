// ====================================================================
// 🐝 BeeLinks - Script de Migração LocalStorage → Supabase
// ====================================================================
// Este script migra dados existentes do LocalStorage para o Supabase
// Preserva toda funcionalidade existente e adiciona novas capacidades
// ====================================================================

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase (substituir pelas suas credenciais)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

// ====================================================================
// 🔄 CLASSE PRINCIPAL DE MIGRAÇÃO
// ====================================================================

class BeeLinksDataMigration {
  constructor() {
    this.migrationLog = [];
    this.errors = [];
  }

  // ====================================================================
  // 📊 MÉTODO PRINCIPAL - Executar Migração Completa
  // ====================================================================
  
  async executeMigration(userId = null) {
    console.log('🐝 Iniciando migração BeeLinks...');
    
    try {
      // 1. Verificar se há dados no LocalStorage
      const localStorageData = this.extractLocalStorageData();
      
      if (!localStorageData.hasData) {
        console.log('ℹ️ Nenhum dado encontrado no LocalStorage');
        return { success: true, message: 'Nenhuma migração necessária' };
      }

      // 2. Autenticar usuário ou criar conta
      const user = userId ? await this.getUser(userId) : await this.createOrGetUser(localStorageData.profile);
      
      if (!user) {
        throw new Error('Falha na autenticação do usuário');
      }

      // 3. Migrar dados sequencialmente
      await this.migrateProfile(user.id, localStorageData.profile);
      await this.migrateThemeSettings(user.id, localStorageData.theme);
      await this.migrateLinks(user.id, localStorageData.links);
      await this.createDefaultTags(user.id);
      await this.generateQRCode(user.id);
      await this.createUserSettings(user.id);

      // 4. Gerar relatório final
      const report = this.generateMigrationReport();
      
      console.log('✅ Migração concluída com sucesso!');
      return { success: true, report, user };

    } catch (error) {
      console.error('❌ Erro durante migração:', error);
      this.errors.push(error.message);
      return { success: false, errors: this.errors };
    }
  }

  // ====================================================================
  // 📥 EXTRAÇÃO DE DADOS DO LOCALSTORAGE
  // ====================================================================
  
  extractLocalStorageData() {
    const data = {
      hasData: false,
      profile: null,
      links: [],
      theme: 'dark'
    };

    try {
      // Extrair perfil
      const profileData = localStorage.getItem('beelinks_profile');
      if (profileData) {
        data.profile = JSON.parse(profileData);
        data.hasData = true;
        this.log('✅ Perfil extraído do LocalStorage');
      }

      // Extrair links
      const linksData = localStorage.getItem('beelinks_links');
      if (linksData) {
        data.links = JSON.parse(linksData);
        data.hasData = true;
        this.log(`✅ ${data.links.length} links extraídos do LocalStorage`);
      }

      // Extrair tema
      const themeData = localStorage.getItem('beelinks_theme');
      if (themeData) {
        data.theme = themeData;
        this.log('✅ Configuração de tema extraída');
      }

    } catch (error) {
      console.error('Erro ao extrair dados do LocalStorage:', error);
      this.errors.push(`Erro na extração: ${error.message}`);
    }

    return data;
  }

  // ====================================================================
  // 👤 AUTENTICAÇÃO E CRIAÇÃO DE USUÁRIO
  // ====================================================================
  
  async createOrGetUser(profileData) {
    try {
      // Verificar se o usuário já está autenticado
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        this.log('✅ Usuário já autenticado encontrado');
        return user;
      }

      // Se não estiver autenticado, criar conta
      const email = prompt('Digite seu email para criar/acessar sua conta BeeLinks:');
      const password = prompt('Digite uma senha (mínimo 6 caracteres):');

      if (!email || !password || password.length < 6) {
        throw new Error('Email e senha válidos são obrigatórios');
      }

      // Tentar fazer login primeiro
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (loginData.user) {
        this.log('✅ Login realizado com sucesso');
        return loginData.user;
      }

      // Se login falhou, criar nova conta
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email,
        password
      });

      if (signupError) {
        throw new Error(`Erro no cadastro: ${signupError.message}`);
      }

      this.log('✅ Nova conta criada com sucesso');
      return signupData.user;

    } catch (error) {
      console.error('Erro na autenticação:', error);
      throw error;
    }
  }

  async getUser(userId) {
    const { data: user, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  // ====================================================================
  // 📝 MIGRAÇÃO DO PERFIL
  // ====================================================================
  
  async migrateProfile(userId, profileData) {
    if (!profileData) {
      this.log('⚠️ Nenhum dado de perfil para migrar');
      return;
    }

    try {
      // Verificar se perfil já existe
      const { data: existingProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      const profilePayload = {
        id: userId,
        username: profileData.username || 'user' + Date.now(),
        bio: profileData.bio || 'Desenvolvedor | Criador de Conteúdo | Tech Enthusiast',
        avatar_url: profileData.avatar,
        is_profile_public: true,
        custom_slug: profileData.username || null,
        updated_at: new Date().toISOString()
      };

      if (existingProfile) {
        // Atualizar perfil existente
        const { error } = await supabase
          .from('users')
          .update(profilePayload)
          .eq('id', userId);

        if (error) throw error;
        this.log('✅ Perfil atualizado no Supabase');
      } else {
        // Criar novo perfil
        const { error } = await supabase
          .from('users')
          .insert([profilePayload]);

        if (error) throw error;
        this.log('✅ Perfil criado no Supabase');
      }

    } catch (error) {
      console.error('Erro ao migrar perfil:', error);
      this.errors.push(`Erro no perfil: ${error.message}`);
    }
  }

  // ====================================================================
  // 🔗 MIGRAÇÃO DOS LINKS
  // ====================================================================
  
  async migrateLinks(userId, linksData) {
    if (!linksData || linksData.length === 0) {
      this.log('⚠️ Nenhum link para migrar');
      return;
    }

    try {
      // Limpar links existentes do usuário (se houver)
      await supabase
        .from('links')
        .delete()
        .eq('user_id', userId);

      // Preparar dados dos links para inserção
      const linksToInsert = linksData.map((link, index) => ({
        user_id: userId,
        title: link.title,
        description: link.description || 'Clique para visitar',
        url: this.normalizeUrl(link.url),
        icon: link.icon || 'fas fa-link',
        is_active: true,
        is_featured: false,
        sort_order: index,
        created_at: link.createdAt || new Date().toISOString()
      }));

      // Inserir links em lotes
      const batchSize = 10;
      for (let i = 0; i < linksToInsert.length; i += batchSize) {
        const batch = linksToInsert.slice(i, i + batchSize);
        
        const { error } = await supabase
          .from('links')
          .insert(batch);

        if (error) throw error;
      }

      this.log(`✅ ${linksToInsert.length} links migrados com sucesso`);

      // Migrar dados de cliques (se existirem)
      await this.migrateClickAnalytics(userId, linksData);

    } catch (error) {
      console.error('Erro ao migrar links:', error);
      this.errors.push(`Erro nos links: ${error.message}`);
    }
  }

  // ====================================================================
  // 📊 MIGRAÇÃO DE ANALYTICS (CLIQUES)
  // ====================================================================
  
  async migrateClickAnalytics(userId, linksData) {
    const linksWithClicks = linksData.filter(link => link.clicks && link.clicks > 0);
    
    if (linksWithClicks.length === 0) return;

    try {
      // Buscar os IDs dos links recém-criados
      const { data: newLinks } = await supabase
        .from('links')
        .select('id, title, url')
        .eq('user_id', userId);

      const analyticsToInsert = [];

      for (const oldLink of linksWithClicks) {
        const newLink = newLinks.find(nl => 
          nl.title === oldLink.title && nl.url === this.normalizeUrl(oldLink.url)
        );

        if (newLink && oldLink.clicks > 0) {
          // Criar registros de analytics simulados para preservar contagem
          for (let i = 0; i < oldLink.clicks; i++) {
            analyticsToInsert.push({
              link_id: newLink.id,
              user_id: userId,
              event_type: 'click',
              device_type: 'unknown',
              created_at: new Date(Date.now() - (i * 86400000)).toISOString() // Distribuir ao longo dos últimos dias
            });
          }
        }
      }

      if (analyticsToInsert.length > 0) {
        const { error } = await supabase
          .from('link_analytics')
          .insert(analyticsToInsert);

        if (error) throw error;
        this.log(`✅ ${analyticsToInsert.length} registros de analytics migrados`);
      }

    } catch (error) {
      console.error('Erro ao migrar analytics:', error);
      this.errors.push(`Erro no analytics: ${error.message}`);
    }
  }

  // ====================================================================
  // 🎨 MIGRAÇÃO DE CONFIGURAÇÕES DE TEMA
  // ====================================================================
  
  async migrateThemeSettings(userId, themePreference) {
    try {
      // Buscar tema padrão do BeeLinks
      const { data: defaultTheme } = await supabase
        .from('themes')
        .select('id')
        .eq('name', 'BeeLinks Default')
        .single();

      const settingsPayload = {
        user_id: userId,
        analytics_enabled: true,
        public_analytics: false,
        show_click_count: true,
        allow_link_preview: true,
        email_notifications: true,
        current_theme_id: defaultTheme?.id,
        show_avatar: true,
        show_bio: true,
        show_social_links: true
      };

      // Verificar se configurações já existem
      const { data: existingSettings } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existingSettings) {
        const { error } = await supabase
          .from('user_settings')
          .update(settingsPayload)
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_settings')
          .insert([settingsPayload]);

        if (error) throw error;
      }

      this.log(`✅ Configurações de tema migradas (${themePreference})`);

    } catch (error) {
      console.error('Erro ao migrar configurações:', error);
      this.errors.push(`Erro nas configurações: ${error.message}`);
    }
  }

  // ====================================================================
  // 🏷️ CRIAÇÃO DE TAGS PADRÃO
  // ====================================================================
  
  async createDefaultTags(userId) {
    try {
      const defaultTags = [
        { name: 'Trabalho', color: '#3B82F6', description: 'Links relacionados ao trabalho' },
        { name: 'Pessoal', color: '#EF4444', description: 'Links pessoais' },
        { name: 'Social', color: '#10B981', description: 'Redes sociais' },
        { name: 'Projetos', color: '#F59E0B', description: 'Meus projetos' }
      ];

      const tagsToInsert = defaultTags.map(tag => ({
        user_id: userId,
        ...tag
      }));

      const { error } = await supabase
        .from('link_tags')
        .insert(tagsToInsert);

      if (error && !error.message.includes('duplicate')) {
        throw error;
      }

      this.log('✅ Tags padrão criadas');

    } catch (error) {
      console.error('Erro ao criar tags:', error);
      this.errors.push(`Erro nas tags: ${error.message}`);
    }
  }

  // ====================================================================
  // 📱 GERAÇÃO DE QR CODE
  // ====================================================================
  
  async generateQRCode(userId) {
    try {
      // Buscar username do usuário
      const { data: user } = await supabase
        .from('users')
        .select('username, custom_slug')
        .eq('id', userId)
        .single();

      if (!user) return;

      const profileUrl = `${window.location.origin}/${user.custom_slug || user.username}`;
      
      const qrData = {
        user_id: userId,
        code_data: profileUrl,
        style: 'default',
        foreground_color: '#000000',
        background_color: '#FFFFFF',
        logo_enabled: false
      };

      const { error } = await supabase
        .from('qr_codes')
        .insert([qrData]);

      if (error && !error.message.includes('duplicate')) {
        throw error;
      }

      this.log('✅ QR Code gerado');

    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      this.errors.push(`Erro no QR Code: ${error.message}`);
    }
  }

  // ====================================================================
  // ⚙️ MÉTODOS UTILITÁRIOS
  // ====================================================================
  
  normalizeUrl(url) {
    if (!url) return '';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    this.migrationLog.push(logEntry);
    console.log(logEntry);
  }

  generateMigrationReport() {
    return {
      timestamp: new Date().toISOString(),
      logs: this.migrationLog,
      errors: this.errors,
      success: this.errors.length === 0,
      summary: {
        totalOperations: this.migrationLog.length,
        errorsCount: this.errors.length,
        successRate: ((this.migrationLog.length - this.errors.length) / this.migrationLog.length * 100).toFixed(2) + '%'
      }
    };
  }

  // ====================================================================
  // 🔄 BACKUP DO LOCALSTORAGE (SEGURANÇA)
  // ====================================================================
  
  createLocalStorageBackup() {
    const backup = {
      timestamp: new Date().toISOString(),
      data: {
        profile: localStorage.getItem('beelinks_profile'),
        links: localStorage.getItem('beelinks_links'),
        theme: localStorage.getItem('beelinks_theme')
      }
    };

    const backupBlob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(backupBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `beelinks-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.log('✅ Backup do LocalStorage criado');
  }

  // ====================================================================
  // 🧹 LIMPEZA DO LOCALSTORAGE (OPCIONAL)
  // ====================================================================
  
  clearLocalStorageData(createBackup = true) {
    if (createBackup) {
      this.createLocalStorageBackup();
    }

    localStorage.removeItem('beelinks_profile');
    localStorage.removeItem('beelinks_links');
    localStorage.removeItem('beelinks_theme');

    this.log('✅ Dados do LocalStorage limpos');
  }
}

// ====================================================================
// 🚀 EXPORTAR CLASSE E FUNÇÕES AUXILIARES
// ====================================================================

export default BeeLinksDataMigration;

// Função helper para executar migração rapidamente
export async function quickMigration() {
  const migration = new BeeLinksDataMigration();
  const result = await migration.executeMigration();
  
  if (result.success) {
    console.log('🎉 Migração concluída! Seus dados estão agora no Supabase.');
    
    // Perguntar se quer limpar LocalStorage
    const shouldClear = confirm(
      'Migração concluída com sucesso! Deseja limpar os dados do LocalStorage? ' +
      '(Um backup será criado automaticamente)'
    );
    
    if (shouldClear) {
      migration.clearLocalStorageData();
    }
  } else {
    console.error('❌ Migração falhou. Verifique os erros:', result.errors);
  }
  
  return result;
}

// Função para migração automática no carregamento da página
export function autoMigrateOnLoad() {
  // Verificar se deve executar migração automática
  const shouldAutoMigrate = !localStorage.getItem('beelinks_migrated');
  
  if (shouldAutoMigrate) {
    console.log('🔄 Iniciando migração automática...');
    quickMigration().then(() => {
      localStorage.setItem('beelinks_migrated', 'true');
    });
  }
}

// ====================================================================
// 📋 EXEMPLO DE USO
// ====================================================================

/*
// Exemplo 1: Migração manual
import BeeLinksDataMigration from './migration';

const migration = new BeeLinksDataMigration();
const result = await migration.executeMigration();
console.log(result);

// Exemplo 2: Migração rápida
import { quickMigration } from './migration';
await quickMigration();

// Exemplo 3: Migração automática
import { autoMigrateOnLoad } from './migration';
autoMigrateOnLoad(); // Chame no componentDidMount ou useEffect
*/
