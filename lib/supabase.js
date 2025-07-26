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

// Cliente mock para builds sem variáveis de ambiente
const createMockClient = () => ({
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Supabase não configurado') }),
    signUp: () => Promise.resolve({ data: null, error: new Error('Supabase não configurado') }),
    signOut: () => Promise.resolve({ error: null }),
    resetPasswordForEmail: () => Promise.resolve({ error: null })
  },
  from: (table) => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: null, error: new Error('Supabase não configurado') }),
    update: () => Promise.resolve({ data: null, error: new Error('Supabase não configurado') }),
    delete: () => Promise.resolve({ data: null, error: new Error('Supabase não configurado') }),
    single: () => Promise.resolve({ data: null, error: new Error('Supabase não configurado') }),
    eq: function(column, value) { return this; },
    neq: function(column, value) { return this; },
    order: function(column, options) { return this; },
    limit: function(count) { return this; }
  }),
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: null, error: new Error('Storage não configurado') }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
      listBuckets: () => Promise.resolve({ data: [], error: null }),
      remove: () => Promise.resolve({ data: null, error: null })
    })
  },
  rpc: () => Promise.resolve({ data: null, error: new Error('RPC não configurado') })
});

// Durante o build, criar cliente mock se variáveis não estiverem disponíveis
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase não configurado, usando cliente mock');
    return createMockClient();
  }

  try {
    return createClient(supabaseUrl, supabaseAnonKey, {
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
  } catch (error) {
    console.warn('Erro ao criar cliente Supabase, usando mock:', error.message);
    return createMockClient();
  }
};

export const supabase = createSupabaseClient();

// ====================================================================
// 👤 SERVIÇOS DE USUÁRIO
// ====================================================================

export const userService = {
  // Obter usuário atual
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        // Não mostrar erro para usuários não autenticados
        return null;
      }
      return user;
    } catch (error) {
      // Silenciar erros de autenticação
      return null;
    }
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
    const updateData = {
      updated_at: new Date().toISOString()
    };

    // Apenas adicionar campos que foram fornecidos
    if (profileData.username !== undefined) updateData.username = profileData.username;
    if (profileData.bio !== undefined) updateData.bio = profileData.bio;
    if (profileData.avatar !== undefined) updateData.avatar_url = profileData.avatar;
    if (profileData.full_name !== undefined) updateData.full_name = profileData.full_name;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
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
    try {
      // Primeiro, obter o user_id do link
      const { data: linkData, error: linkError } = await supabase
        .from('links')
        .select('user_id')
        .eq('id', linkId)
        .single();

      if (linkError) {
        console.error('Erro ao buscar dados do link:', linkError);
        return;
      }

      // Inserir analytics com user_id correto
      const { error } = await supabase
        .from('link_analytics')
        .insert([{
          link_id: linkId,
          user_id: linkData.user_id,
          event_type: 'click',
          visitor_ip: visitorData.ip,
          visitor_country: visitorData.country,
          visitor_city: visitorData.city,
          user_agent: navigator?.userAgent || 'Unknown',
          referer: document?.referrer || '',
          device_type: this.detectDeviceType(),
          browser: this.detectBrowser(),
          os: this.detectOS()
        }]);

      if (error) {
        console.error('Erro ao registrar clique:', error);
      }
    } catch (err) {
      console.error('Erro geral ao registrar clique:', err);
    }
  },

  // Registrar visualização de perfil
  async trackProfileView(userId, visitorData = {}) {
    try {
      const { error } = await supabase
        .from('profile_analytics')
        .insert([{
          user_id: userId,
          visitor_ip: visitorData.ip,
          visitor_country: visitorData.country,
          visitor_city: visitorData.city,
          user_agent: navigator?.userAgent || 'Unknown',
          referer: document?.referrer || '',
          device_type: this.detectDeviceType(),
          browser: this.detectBrowser(),
          os: this.detectOS(),
          screen_resolution: typeof screen !== 'undefined' ? `${screen.width}x${screen.height}` : 'Unknown'
        }]);

      if (error) {
        console.error('Erro ao registrar visualização:', error);
      }
    } catch (err) {
      console.error('Erro geral ao registrar visualização:', err);
    }
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
    if (typeof navigator === 'undefined') return 'unknown';
    
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
    if (typeof navigator === 'undefined') return 'unknown';
    
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Other';
  },

  // Detectar sistema operacional
  detectOS() {
    if (typeof navigator === 'undefined') return 'unknown';
    
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
// 📷 SERVIÇOS DE AVATARS
// ====================================================================

export const avatarService = {
  // Listar avatars do usuário
  async getUserAvatars(userId) {
    try {
      // Verificar se usuário está autenticado
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.log('Usuário não autenticado para listar avatars');
        return [];
      }

      const { data, error } = await supabase
        .from('user_avatars')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        // Se a tabela não existir, retornar array vazio
        if (error.message.includes('relation "user_avatars" does not exist')) {
          console.log('Tabela user_avatars não existe ainda');
          return [];
        }
        throw error;
      }

      return data || [];
    } catch (error) {
      console.log('Aviso: erro ao buscar avatars:', error.message);
      return [];
    }
  },

  // Obter avatar ativo do usuário
  async getActiveAvatar(userId) {
    try {
      // Verificar se usuário está autenticado
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.log('Usuário não autenticado para buscar avatar');
        return null;
      }

      const { data, error } = await supabase
        .from('user_avatars')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Nenhum avatar ativo encontrado
          return null;
        }
        // Se a tabela não existir, retornar null silenciosamente
        if (error.message.includes('relation "user_avatars" does not exist')) {
          console.log('Tabela user_avatars não existe ainda');
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.log('Aviso: erro ao buscar avatar ativo:', error.message);
      return null;
    }
  },

  // Upload de nova foto de avatar
  async uploadAvatar(userId, file) {
    try {
      // Validações
      if (!file) throw new Error('Arquivo é obrigatório');
      if (file.size > 5 * 1024 * 1024) throw new Error('Arquivo muito grande (máximo 5MB)');
      
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Tipo de arquivo não suportado. Use JPEG, PNG ou WebP');
      }

      // Verificar se o usuário está autenticado
      const session = await authService.getSession();
      if (!session?.user) {
        throw new Error('Usuário não autenticado');
      }

      if (session.user.id !== userId) {
        throw new Error('Não autorizado a fazer upload para outro usuário');
      }

      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}_${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      console.log('Iniciando upload para:', filePath);

      // Upload para o Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Erro no storage upload:', uploadError);
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      console.log('Upload realizado com sucesso:', uploadData);

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log('URL pública gerada:', publicUrl);

      // Verificar se a tabela user_avatars existe e inserir
      try {
        const { data: avatarData, error: dbError } = await supabase
          .from('user_avatars')
          .insert([{
            user_id: userId,
            file_name: fileName,
            file_size: file.size,
            file_type: file.type,
            storage_path: filePath,
            public_url: publicUrl,
            is_active: false // Será ativado manualmente
          }])
          .select()
          .single();

        if (dbError) {
          console.error('Erro ao inserir no banco:', dbError);
          throw new Error(`Erro no banco de dados: ${dbError.message}`);
        }

        console.log('Avatar salvo no banco:', avatarData);
        return avatarData;
      } catch (tableError) {
        console.error('Erro na tabela user_avatars:', tableError);
        // Se a tabela não existir, retornar dados básicos
        if (tableError.message?.includes('relation "user_avatars" does not exist')) {
          console.log('Tabela user_avatars não existe, usando modo simplificado');
          return {
            id: `temp_${Date.now()}`,
            user_id: userId,
            file_name: fileName,
            file_size: file.size,
            file_type: file.type,
            storage_path: filePath,
            public_url: publicUrl,
            is_active: false,
            created_at: new Date().toISOString()
          };
        }
        throw tableError;
      }
    } catch (error) {
      console.error('Erro no upload do avatar:', {
        message: error.message,
        stack: error.stack,
        details: error
      });
      throw new Error(error.message || 'Erro desconhecido no upload');
    }
  },

  // Ativar um avatar específico
  async setActiveAvatar(userId, avatarId) {
    try {
      // Desativar todos os avatars do usuário
      await supabase
        .from('user_avatars')
        .update({ is_active: false })
        .eq('user_id', userId);

      // Ativar o avatar específico
      const { data, error } = await supabase
        .from('user_avatars')
        .update({ is_active: true })
        .eq('id', avatarId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Erro ao ativar avatar:', error);
      throw error;
    }
  },

  // Deletar avatar
  async deleteAvatar(userId, avatarId) {
    try {
      // Buscar informações do avatar
      const { data: avatar, error: fetchError } = await supabase
        .from('user_avatars')
        .select('storage_path')
        .eq('id', avatarId)
        .eq('user_id', userId)
        .single();

      if (fetchError) throw fetchError;

      // Deletar do storage
      const { error: storageError } = await supabase.storage
        .from('avatars')
        .remove([avatar.storage_path]);

      if (storageError) {
        console.log('Aviso: erro ao deletar do storage:', storageError.message);
      }

      // Deletar do banco
      const { error: dbError } = await supabase
        .from('user_avatars')
        .delete()
        .eq('id', avatarId)
        .eq('user_id', userId);

      if (dbError) throw dbError;

      return true;
    } catch (error) {
      console.error('Erro ao deletar avatar:', error);
      throw error;
    }
  },

  // Criar avatar padrão usando API externa
  async createDefaultAvatar(userId, identifier) {
    try {
      const cleanIdentifier = identifier.replace(/[^a-zA-Z0-9]/g, '') || 'user';
      const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${cleanIdentifier}&backgroundColor=FFD700&textColor=000000`;
      
      // Para avatars padrão, não vamos salvar no banco por enquanto
      // Apenas retornar a URL
      return {
        id: `default_${userId}`,
        user_id: userId,
        file_name: `default_${cleanIdentifier}.svg`,
        public_url: avatarUrl,
        is_active: true,
        created_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao criar avatar padrão:', error);
      throw error;
    }
  }
};

// ====================================================================
// � SERVIÇOS DE AUTENTICAÇÃO
// ====================================================================

export const authService = {
  // Obter sessão atual
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.log('Erro ao obter sessão:', error.message);
        return null;
      }
      return session;
    } catch (error) {
      console.log('Erro ao verificar sessão:', error.message);
      return null;
    }
  },

  // Obter usuário atual
  async getUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.log('Erro ao obter usuário:', error.message);
        return null;
      }
      return user;
    } catch (error) {
      console.log('Erro ao verificar usuário:', error.message);
      return null;
    }
  },

  // Escutar mudanças de autenticação
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Login com email e senha
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  },

  // Registro com email e senha
  async signUp(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
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

  // Reset de senha
  async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }
};

// ====================================================================
// �📤 EXPORTAÇÕES
// ====================================================================

export default {
  supabase,
  userService,
  linksService,
  analyticsService,
  avatarService,
  authService
};
