'use client';

import { useState, useEffect } from 'react';
import { userService } from '../lib/supabase';
import AvatarManager from './AvatarManager';

export default function EditProfileModal({ isOpen, onClose, currentProfile, onProfileUpdate }) {
  const [formData, setFormData] = useState({
    bio: '',
    full_name: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' ou 'avatar'
  const [currentAvatar, setCurrentAvatar] = useState('');

  useEffect(() => {
    if (isOpen && currentProfile) {
      setFormData({
        bio: currentProfile.bio || '',
        full_name: currentProfile.full_name || ''
      });
      setCurrentAvatar(currentProfile.avatar_url || '');
      setErrors({});
      setActiveTab('profile'); // Reset to profile tab
    }
  }, [isOpen, currentProfile]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.bio.trim()) {
      newErrors.bio = 'Bio é obrigatória';
    } else if (formData.bio.trim().length < 10) {
      newErrors.bio = 'Bio deve ter pelo menos 10 caracteres';
    } else if (formData.bio.trim().length > 200) {
      newErrors.bio = 'Bio não pode ter mais de 200 caracteres';
    }

    if (formData.full_name.trim() && formData.full_name.trim().length < 2) {
      newErrors.full_name = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (formData.full_name.trim() && formData.full_name.trim().length > 100) {
      newErrors.full_name = 'Nome não pode ter mais de 100 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const user = await userService.getCurrentUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const updateData = {
        bio: formData.bio.trim(),
        full_name: formData.full_name.trim()
      };

      await userService.updateProfile(user.id, updateData);
      
      // Notificar componente pai sobre a atualização
      if (onProfileUpdate) {
        onProfileUpdate({
          ...currentProfile,
          ...updateData
        });
      }

      onClose();

    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setErrors({
        submit: error.message || 'Erro ao atualizar perfil. Tente novamente.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      bio: currentProfile?.bio || '',
      full_name: currentProfile?.full_name || ''
    });
    setErrors({});
    setActiveTab('profile');
    onClose();
  };

  const handleAvatarUpdate = (newAvatarUrl) => {
    setCurrentAvatar(newAvatarUrl);
    // Atualizar perfil com novo avatar
    if (onProfileUpdate) {
      onProfileUpdate({
        ...currentProfile,
        avatar_url: newAvatarUrl
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="dark:bg-gray-800 bg-white p-6 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="dark:text-white text-gray-900 text-xl font-semibold">
            Editar Perfil
          </h3>
          <button 
            onClick={handleCancel}
            disabled={isSubmitting}
            className="dark:text-gray-400 text-gray-600 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Abas */}
        <div className="flex mb-6 border-b border-gray-200 dark:border-gray-600">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-bee-yellow text-bee-yellow'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <i className="fas fa-user mr-2"></i>
            Informações
          </button>
          <button
            onClick={() => setActiveTab('avatar')}
            className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'avatar'
                ? 'border-bee-yellow text-bee-yellow'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <i className="fas fa-camera mr-2"></i>
            Foto de Perfil
          </button>
        </div>

        {errors.submit && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.submit}
          </div>
        )}

        {/* Conteúdo das Abas */}
        {activeTab === 'profile' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block dark:text-white text-gray-700 text-sm font-medium mb-2">
                Nome Completo
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="Ex: João Silva"
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-bee-yellow focus:border-transparent disabled:opacity-50 ${
                  errors.full_name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.full_name && (
                <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>
              )}
            </div>

            <div>
              <label className="block dark:text-white text-gray-700 text-sm font-medium mb-2">
                Bio *
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Ex: Desenvolvedor | Criador de Conteúdo | Tech Enthusiast"
                disabled={isSubmitting}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-bee-yellow focus:border-transparent disabled:opacity-50 resize-none ${
                  errors.bio ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.bio ? (
                  <p className="text-red-500 text-xs">{errors.bio}</p>
                ) : (
                  <p className="text-gray-500 text-xs">Descreva-se em poucas palavras</p>
                )}
                <span className={`text-xs ${
                  formData.bio.length > 200 ? 'text-red-500' : 'text-gray-400'
                }`}>
                  {formData.bio.length}/200
                </span>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
                💡 Dicas para uma boa bio:
              </h4>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Use | para separar diferentes aspectos</li>
                <li>• Mencione sua profissão ou área de interesse</li>
                <li>• Seja conciso e interessante</li>
                <li>• Exemplos: "Designer | Fotógrafo | Coffee Lover"</li>
              </ul>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 dark:bg-gray-600 bg-gray-200 dark:text-white text-gray-800 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-bee-yellow text-bee-black rounded-lg hover:bg-bee-dark-yellow transition-colors font-medium disabled:opacity-50 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-bee-black mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <AvatarManager 
              currentAvatar={currentAvatar}
              onAvatarUpdate={handleAvatarUpdate}
            />
            
            <div className="flex justify-end pt-4">
              <button
                onClick={handleCancel}
                className="px-4 py-2 dark:bg-gray-600 bg-gray-200 dark:text-white text-gray-800 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
