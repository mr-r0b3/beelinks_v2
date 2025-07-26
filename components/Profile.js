'use client';

import { useState, useEffect } from 'react';
import { userService } from '../lib/supabase';
import { generateRandomProfilePhoto } from '../utils/helpers';

export default function Profile() {
  const [profile, setProfile] = useState({
    username: '',
    bio: '',
    avatar: '',
    full_name: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const user = await userService.getCurrentUser();
      if (user) {
        const userProfile = await userService.getUserProfile(user.id);
        setProfile({
          username: userProfile.username || '',
          bio: userProfile.bio || 'Desenvolvedor | Criador de Conteúdo | Tech Enthusiast',
          avatar: userProfile.avatar_url || generateRandomProfilePhoto(),
          full_name: userProfile.full_name || ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      // Fallback para dados padrão
      setProfile({
        username: 'usuario',
        bio: 'Desenvolvedor | Criador de Conteúdo | Tech Enthusiast',
        avatar: generateRandomProfilePhoto(),
        full_name: ''
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshPhoto = async () => {
    setIsUpdating(true);
    try {
      const newAvatar = generateRandomProfilePhoto();
      const user = await userService.getCurrentUser();
      
      if (user) {
        await userService.updateProfile(user.id, {
          ...profile,
          avatar: newAvatar
        });
        
        setProfile(prev => ({ ...prev, avatar: newAvatar }));
      }
    } catch (error) {
      console.error('Erro ao atualizar foto:', error);
      // Atualizar localmente mesmo com erro
      const newAvatar = generateRandomProfilePhoto();
      setProfile(prev => ({ ...prev, avatar: newAvatar }));
    } finally {
      setIsUpdating(false);
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
          id="refresh-photo-btn"
          onClick={refreshPhoto}
          disabled={isUpdating}
          className="absolute -top-2 -right-2 bg-bee-yellow hover:bg-bee-dark-yellow text-bee-black rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed" 
          title="Gerar nova foto aleatória"
        >
          <i id="refresh-photo-icon" className={`fas ${isUpdating ? 'fa-spinner fa-spin' : 'fa-sync-alt'} text-sm`}></i>
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
    </div>
  );
}
