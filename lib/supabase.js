// ====================================================================
// 🐝 BeeLinks - Configuração e Cliente Supabase
// ====================================================================
// Configuração centralizada para integração com Supabase
// Substitui as operações de localStorage por operações de banco de dados
// ====================================================================

import { createClient } from '@supabase/supabase-js';

// ====================================================================
// 🔧 CONFIGURAÇÃO DO SUPABASE
// ====================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas!');
  console.log('Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// ====================================================================
// 👤 SERVIÇOS DE USUÁRIO
// ====================================================================

export const userService = {
  // Obter usuário atual
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  // Obter perfil completo do usuário
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        user_settings (*),
        themes (*)
      `)
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  // Atualizar perfil
  async updateProfile(userId, profileData) {
    const { data, error } = await supabase
      .from('users')
      .update({
        username: profileData.username,
        bio: profileData.bio,
        avatar_url: profileData.avatar,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Verificar se username está disponível
  async isUsernameAvailable(username, currentUserId = null) {
    let query = supabase
      .from('users')
      .select('id')
      .eq('username', username);

    if (currentUserId) {
      query = query.neq('id', currentUserId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data.length === 0;
  },

  // Buscar usuário por username/slug
  async getUserBySlug(slug) {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        user_settings (*),
        links (*, link_analytics(count)),
        social_links (*),
        themes (*)
      `)
      .or(`username.eq.${slug},custom_slug.eq.${slug}`)
      .eq('is_profile_public', true)
      .single();

    if (error) throw error;
    return data;
  }
};

// ====================================================================
// 🔗 SERVIÇOS DE LINKS
// ====================================================================

export const linksService = {
  // Obter todos os links do usuário
  async getUserLinks(userId, includeInactive = false) {
    let query = supabase
      .from('links')
      .select(`
        *,
        link_analytics (
          id,
          event_type,
          created_at
        ),
        link_tag_assignments (
          link_tags (*)
        )
      `)
      .eq('user_id', userId)
      .order('sort_order', { ascending: true });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Processar dados para incluir contadores
    return data.map(link => ({
      ...link,
      clicks: link.link_analytics?.filter(a => a.event_type === 'click').length || 0,
      views: link.link_analytics?.filter(a => a.event_type === 'view').length || 0,
      tags: link.link_tag_assignments?.map(lta => lta.link_tags) || []
    }));
  },

  // Criar novo link
  async createLink(userId, linkData) {
    const { data, error } = await supabase
      .from('links')
      .insert([{
        user_id: userId,
        title: linkData.title.trim(),
        description: linkData.description?.trim() || '',
        url: this.normalizeUrl(linkData.url),
        icon: linkData.icon || 'fas fa-link',
        is_active: true,
        sort_order: linkData.sort_order || 0
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Atualizar link existente
  async updateLink(linkId, userId, updateData) {
    const { data, error } = await supabase
      .from('links')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', linkId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Deletar link
  async deleteLink(linkId, userId) {
    const { error } = await supabase
      .from('links')
      .delete()
      .eq('id', linkId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  },

  // Reordenar links
  async reorderLinks(userId, linkIds) {
    const updates = linkIds.map((linkId, index) => ({
      id: linkId,
      sort_order: index
    }));

    const { error } = await supabase
      .from('links')
      .upsert(updates.map(update => ({
        id: update.id,
        user_id: userId,
        sort_order: update.sort_order,
        updated_at: new Date().toISOString()
      })));

    if (error) throw error;
    return true;
  },

  // Normalizar URL
  normalizeUrl(url) {
    if (!url) return '';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  }
};

// ====================================================================
// 📊 SERVIÇOS DE ANALYTICS
// ====================================================================

export const analyticsService = {
  // Registrar clique em link
  async trackLinkClick(linkId, visitorData = {}) {
    const { error } = await supabase
      .from('link_analytics')
      .insert([{
        link_id: linkId,
        event_type: 'click',
        visitor_ip: visitorData.ip,
        visitor_country: visitorData.country,
        visitor_city: visitorData.city,
        user_agent: navigator.userAgent,
        referer: document.referrer,
        device_type: this.detectDeviceType(),
        browser: this.detectBrowser(),
        os: this.detectOS()
      }]);

    if (error) console.error('Erro ao registrar clique:', error);
  },

  // Registrar visualização de perfil
  async trackProfileView(userId, visitorData = {}) {
    const { error } = await supabase
      .from('profile_analytics')
      .insert([{
        user_id: userId,
        visitor_ip: visitorData.ip,
        visitor_country: visitorData.country,
        visitor_city: visitorData.city,
        user_agent: navigator.userAgent,
        referer: document.referrer,
        device_type: this.detectDeviceType(),
        browser: this.detectBrowser(),
        os: this.detectOS(),
        screen_resolution: `${screen.width}x${screen.height}`
      }]);

    if (error) console.error('Erro ao registrar visualização:', error);
  },

  // Obter estatísticas do usuário
  async getUserStats(userId, timeframe = '30d') {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (timeframe === '7d' ? 7 : 30));

    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .gte('month', startDate.toISOString())
      .order('month', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Obter analytics detalhados de um link
  async getLinkAnalytics(linkId, timeframe = '30d') {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (timeframe === '7d' ? 7 : 30));

    const { data, error } = await supabase
      .from('link_analytics')
      .select('*')
      .eq('link_id', linkId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Detectar tipo de dispositivo
  detectDeviceType() {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet';
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  },

  // Detectar navegador
  detectBrowser() {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Other';
  },

  // Detectar sistema operacional
  detectOS() {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Other';
  }
};

// ====================================================================
// 🎨 SERVIÇOS DE TEMAS
// ====================================================================

export const themesService = {
  // Obter todos os temas do usuário
  async getUserThemes(userId) {
    const { data, error } = await supabase
      .from('themes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Criar novo tema
  async createTheme(userId, themeData) {
    const { data, error } = await supabase
      .from('themes')
      .insert([{
        user_id: userId,
        name: themeData.name,
        primary_color: themeData.primary_color || '#FFD700',
        secondary_color: themeData.secondary_color || '#FFC107',
        background_color: themeData.background_color || '#1A1A1A',
        text_color: themeData.text_color || '#FFFFFF',
        accent_color: themeData.accent_color || '#2D2D2D',
        font_family: themeData.font_family || 'Inter',
        border_radius: themeData.border_radius || 12,
        button_style: themeData.button_style || 'rounded'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Definir tema ativo
  async setActiveTheme(userId, themeId) {
    const { data, error } = await supabase
      .from('user_settings')
      .update({ current_theme_id: themeId })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// ====================================================================
// 🏷️ SERVIÇOS DE TAGS
// ====================================================================

export const tagsService = {
  // Obter tags do usuário
  async getUserTags(userId) {
    const { data, error } = await supabase
      .from('link_tags')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Criar nova tag
  async createTag(userId, tagData) {
    const { data, error } = await supabase
      .from('link_tags')
      .insert([{
        user_id: userId,
        name: tagData.name,
        color: tagData.color || '#FFD700',
        description: tagData.description
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Atribuir tag a link
  async assignTagToLink(linkId, tagId) {
    const { error } = await supabase
      .from('link_tag_assignments')
      .insert([{ link_id: linkId, tag_id: tagId }]);

    if (error && !error.message.includes('duplicate')) {
      throw error;
    }
    return true;
  },

  // Remover tag de link
  async removeTagFromLink(linkId, tagId) {
    const { error } = await supabase
      .from('link_tag_assignments')
      .delete()
      .eq('link_id', linkId)
      .eq('tag_id', tagId);

    if (error) throw error;
    return true;
  }
};

// ====================================================================
// 📱 SERVIÇOS DE QR CODE
// ====================================================================

export const qrService = {
  // Obter QR code do usuário
  async getUserQRCode(userId) {
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Gerar/atualizar QR code
  async generateQRCode(userId, qrData) {
    const { data, error } = await supabase
      .from('qr_codes')
      .upsert([{
        user_id: userId,
        code_data: qrData.url,
        style: qrData.style || 'default',
        foreground_color: qrData.foreground_color || '#000000',
        background_color: qrData.background_color || '#FFFFFF',
        logo_enabled: qrData.logo_enabled || false
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// ====================================================================
// 🔄 REALTIME SUBSCRIPTIONS
// ====================================================================

export const subscriptions = {
  // Subscrever mudanças nos links do usuário
  subscribeToUserLinks(userId, callback) {
    return supabase
      .channel(`user-links-${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'links',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe();
  },

  // Subscrever analytics de um link
  subscribeToLinkAnalytics(linkId, callback) {
    return supabase
      .channel(`link-analytics-${linkId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'link_analytics',
        filter: `link_id=eq.${linkId}`
      }, callback)
      .subscribe();
  },

  // Cancelar subscrição
  unsubscribe(subscription) {
    supabase.removeChannel(subscription);
  }
};

// ====================================================================
// 🔐 SERVIÇOS DE AUTENTICAÇÃO
// ====================================================================

export const authService = {
  // Fazer login
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  },

  // Cadastrar
  async signUp(email, password, userData = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    if (error) throw error;
    return data;
  },

  // Logout
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Redefinir senha
  async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },

  // Verificar sessão
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  // Subscrever mudanças de autenticação
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// ====================================================================
// 🛠️ UTILITÁRIOS
// ====================================================================

export const utils = {
  // Verificar se Supabase está configurado
  isConfigured() {
    return !!(supabaseUrl && supabaseAnonKey);
  },

  // Verificar conexão com Supabase
  async checkConnection() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      return !error;
    } catch {
      return false;
    }
  },

  // Upload de arquivo (avatar, etc.)
  async uploadFile(bucket, file, filePath) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) throw error;
    return data;
  },

  // Obter URL pública de arquivo
  getPublicUrl(bucket, filePath) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    return data.publicUrl;
  }
};

// ====================================================================
// 📤 EXPORTAÇÕES PADRÃO
// ====================================================================

export default {
  supabase,
  userService,
  linksService,
  analyticsService,
  themesService,
  tagsService,
  qrService,
  subscriptions,
  authService,
  utils
};
