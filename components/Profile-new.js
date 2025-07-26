'use client';

import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { userService, avatarService, supabase } from '../lib/supabase';
import EditProfileModal from './EditProfileModal';
import AvatarManager from './AvatarManager';

const Profile = forwardRef((props, ref) => {
  const [profile, setProfile] = useState({
    username: '',
    bio: '',
    avatar: '',
    full_name: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAvatarManager, setShowAvatarManager] = useState(false);

  useImperativeHandle(ref, () => ({
    refreshProfile: () => {
      loadUserProfile();
    }
  }));

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const user = await userService.getCurrentUser();
      if (!user) {
        // Usuário não autenticado - não mostrar erro
        setProfile({
          username: 'visitante',
          bio: 'Faça login para personalizar seu perfil',
          avatar: getDefaultAvatar('visitante'),
          full_name: ''
        });
        setIsLoading(false);
        return;
      }

      try {
        const userProfile = await userService.getUserProfile(user.id);
        
        // Carregar avatar ativo do banco ou criar um padrão
        let avatarUrl = userProfile.avatar_url;
        try {
          const activeAvatar = await avatarService.getActiveAvatar(user.id);
          if (activeAvatar) {
            avatarUrl = activeAvatar.public_url;
          } else if (!avatarUrl) {
            // Criar avatar padrão se não existir
            const defaultAvatar = await avatarService.createDefaultAvatar(user.id, userProfile.username || user.email);
            avatarUrl = defaultAvatar.public_url;
          }
        } catch (avatarError) {
          // Silenciar erro de avatar para usuários não autenticados
          avatarUrl = avatarUrl || getDefaultAvatar(userProfile.username || user.email);
        }

        setProfile({
          username: userProfile.username || '',
          bio: userProfile.bio || 'Desenvolvedor | Criador de Conteúdo | Tech Enthusiast',
          avatar: avatarUrl,
          full_name: userProfile.full_name || ''
        });
      } catch (profileError) {
        // Se o usuário não existe na tabela public.users, tentar criar
        if (profileError.message?.includes('No rows returned')) {
          console.log('Usuário não encontrado na tabela public.users, criando...');
          await createUserProfile(user);
          // Tentar carregar novamente após criar
          const userProfile = await userService.getUserProfile(user.id);
          
          // Criar avatar padrão para novo usuário
          let avatarUrl = userProfile.avatar_url;
          try {
            const defaultAvatar = await avatarService.createDefaultAvatar(user.id, userProfile.username || user.email);
            avatarUrl = defaultAvatar.public_url;
          } catch (avatarError) {
            console.log('Erro ao criar avatar padrão:', avatarError);
            avatarUrl = getDefaultAvatar(userProfile.username || user.email);
          }

          setProfile({
            username: userProfile.username || '',
            bio: userProfile.bio || 'Desenvolvedor | Criador de Conteúdo | Tech Enthusiast',
            avatar: avatarUrl,
            full_name: userProfile.full_name || ''
          });
        } else {
          throw profileError;
        }
      }
    } catch (error) {
      // Log apenas para erros reais, não para usuários não autenticados
      if (error.message && !error.message.includes('Invalid login credentials') && !error.message.includes('AuthSessionMissingError')) {
        console.log('Erro ao carregar perfil:', error.message);
      }
      // Fallback para dados padrão
      setProfile({
        username: 'usuario',
        bio: 'Desenvolvedor | Criador de Conteúdo | Tech Enthusiast',
        avatar: getDefaultAvatar('usuario'),
        full_name: ''
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultAvatar = (username) => {
    // Gerar avatar baseado no username usando uma API de avatars
    const cleanUsername = username.replace(/[^a-zA-Z0-9]/g, '') || 'user';
    return `https://api.dicebear.com/7.x/initials/svg?seed=${cleanUsername}&backgroundColor=FFD700&textColor=000000`;
  };

  const handleProfileUpdate = (updatedProfile) => {
    setProfile(prev => ({
      ...prev,
      ...updatedProfile
    }));
  };

  const handleAvatarUpdate = (newAvatarUrl) => {
    setProfile(prev => ({
      ...prev,
      avatar: newAvatarUrl
    }));
    setShowAvatarManager(false);
  };

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  const handleManageAvatar = () => {
    setShowAvatarManager(true);
  };

  const handleCloseAvatarManager = () => {
    setShowAvatarManager(false);
  };

  const createUserProfile = async (authUser) => {
    try {
      // Gerar username único
      const emailBase = authUser.email.split('@')[0];
      const usernameBase = emailBase.toLowerCase().replace(/[^a-z0-9_]/g, '').substring(0, 20) || 'user';
      
      let username = usernameBase;
      let counter = 1;
      
      // Verificar se username já existe
      while (!(await userService.isUsernameAvailable(username))) {
        username = usernameBase + counter;
        counter++;
      }

      // Criar usuário na tabela public.users via supabase
      const { data, error } = await supabase
        .from('users')
        .insert([{
          id: authUser.id,
          email: authUser.email,
          username: username,
          full_name: authUser.user_metadata?.full_name || '',
          bio: 'Desenvolvedor | Criador de Conteúdo | Tech Enthusiast',
          email_verified: !!authUser.email_confirmed_at,
          created_at: authUser.created_at,
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Criar configurações padrão
      await supabase.from('user_settings').insert([{
        user_id: authUser.id,
        analytics_enabled: true,
        public_analytics: false,
        show_click_count: true,
        allow_link_preview: true,
        email_notifications: true,
        show_avatar: true,
        show_bio: true,
        show_social_links: true
      }]);

      // Criar tema padrão
      await supabase.from('themes').insert([{
        user_id: authUser.id,
        name: 'Tema BeeLinks',
        is_default: true,
        primary_color: '#FFD700',
        secondary_color: '#FFC107',
        background_color: '#1A1A1A',
        text_color: '#FFFFFF',
        accent_color: '#2D2D2D',
        font_family: 'Inter',
        border_radius: 12,
        button_style: 'rounded'
      }]);

      console.log(`Usuário ${username} criado com sucesso!`);
      return data;
    } catch (error) {
      console.error('Erro ao criar perfil do usuário:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div id="profile-section" className="text-center mb-8">
        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4 animate-pulse"></div>
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-32 mx-auto mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-48 mx-auto animate-pulse"></div>
      </div>
    );
  }

  return (
    <div id="profile-section" className="text-center mb-8">
      <div id="profile-image-container" className="relative inline-block mb-4">
        <img 
          id="profile-avatar"
          src={profile.avatar} 
          alt="Profile Picture" 
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-bee-yellow shadow-lg mx-auto object-cover"
        />
        <button 
          id="edit-profile-btn"
          onClick={handleEditProfile}
          className="absolute -top-2 -right-2 bg-bee-yellow hover:bg-bee-dark-yellow text-bee-black rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110" 
          title="Editar perfil"
        >
          <i className="fas fa-edit text-sm"></i>
        </button>
        <button 
          id="manage-avatar-btn"
          onClick={handleManageAvatar}
          className="absolute -bottom-2 -right-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110" 
          title="Gerenciar avatar"
        >
          <i className="fas fa-camera text-sm"></i>
        </button>
      </div>
      <h2 id="profile-username" className="dark:text-white text-bee-black text-xl sm:text-2xl font-semibold mb-2">
        @{profile.username}
      </h2>
      {profile.full_name && (
        <p id="profile-fullname" className="dark:text-gray-400 text-gray-500 text-sm mb-1">
          {profile.full_name}
        </p>
      )}
      <p id="profile-bio" className="dark:text-gray-300 text-gray-600 text-sm sm:text-base mb-4">
        {profile.bio}
      </p>

      {/* Modal de Edição */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        currentProfile={profile}
        onProfileUpdate={handleProfileUpdate}
      />

      {/* Modal de Gerenciamento de Avatar */}
      {showAvatarManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-11/12 max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold dark:text-white">Gerenciar Avatar</h3>
              <button
                onClick={handleCloseAvatarManager}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <AvatarManager onAvatarUpdate={handleAvatarUpdate} />
          </div>
        </div>
      )}
    </div>
  );
});

Profile.displayName = 'Profile';

export default Profile;
