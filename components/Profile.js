'use client';

import { useState, useEffect } from 'react';
import { loadProfile, saveProfile } from '../utils/storage';
import { generateRandomProfilePhoto } from '../utils/helpers';

export default function Profile() {
  const [profile, setProfile] = useState({
    username: 'seuusuario',
    bio: 'Desenvolvedor | Criador de Conteúdo | Tech Enthusiast',
    avatar: ''
  });

  useEffect(() => {
    const savedProfile = loadProfile();
    setProfile(savedProfile);
  }, []);

  const refreshPhoto = () => {
    const newAvatar = generateRandomProfilePhoto();
    const updatedProfile = { ...profile, avatar: newAvatar };
    setProfile(updatedProfile);
    saveProfile(updatedProfile);
  };

  return (
    <div className="text-center mb-8">
      <div className="relative inline-block mb-4">
        <img 
          src={profile.avatar} 
          alt="Profile Picture" 
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-bee-yellow shadow-lg mx-auto object-cover"
        />
        <button 
          onClick={refreshPhoto}
          className="absolute -top-2 -right-2 bg-bee-yellow hover:bg-bee-dark-yellow text-bee-black rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110" 
          title="Gerar nova foto aleatória"
        >
          <i className="fas fa-sync-alt text-sm"></i>
        </button>
      </div>
      <h2 className="dark:text-white text-bee-black text-xl sm:text-2xl font-semibold mb-2">
        @{profile.username}
      </h2>
      <p className="dark:text-gray-300 text-gray-600 text-sm sm:text-base mb-4">
        {profile.bio}
      </p>
    </div>
  );
}
