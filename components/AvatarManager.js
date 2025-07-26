'use client';

import { useState, useEffect, useRef } from 'react';
import { avatarService, userService } from '../lib/supabase';

export default function AvatarManager({ currentAvatar, onAvatarUpdate }) {
  const [avatars, setAvatars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadUserAvatars();
  }, []);

  const loadUserAvatars = async () => {
    try {
      const user = await userService.getCurrentUser();
      if (user) {
        const userAvatars = await avatarService.getUserAvatars(user.id);
        setAvatars(userAvatars);
      }
    } catch (err) {
      console.error('Erro ao carregar avatars:', err);
      setError('Erro ao carregar avatars');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      uploadAvatar(file);
    }
  };

  const uploadAvatar = async (file) => {
    setIsUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      const user = await userService.getCurrentUser();
      if (!user) throw new Error('Usuário não autenticado');

      console.log('Iniciando upload para usuário:', user.id);
      console.log('Arquivo:', { name: file.name, size: file.size, type: file.type });

      // Simular progresso de upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const newAvatar = await avatarService.uploadAvatar(user.id, file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log('Upload concluído:', newAvatar);

      // Atualizar lista de avatars
      setAvatars(prev => [newAvatar, ...prev]);

      // Ativar automaticamente o novo avatar
      await setActiveAvatar(newAvatar.id);

      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (err) {
      console.error('Erro no upload:', {
        message: err.message,
        stack: err.stack,
        error: err
      });
      
      // Mostrar mensagem de erro mais específica
      let errorMessage = 'Erro ao fazer upload da imagem';
      if (err.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const setActiveAvatar = async (avatarId) => {
    try {
      const user = await userService.getCurrentUser();
      if (!user) throw new Error('Usuário não autenticado');

      await avatarService.setActiveAvatar(user.id, avatarId);
      
      // Atualizar estado local
      setAvatars(prev => prev.map(avatar => ({
        ...avatar,
        is_active: avatar.id === avatarId
      })));

      // Notificar componente pai
      const activeAvatar = avatars.find(a => a.id === avatarId);
      if (activeAvatar && onAvatarUpdate) {
        onAvatarUpdate(activeAvatar.public_url);
      }

    } catch (err) {
      console.error('Erro ao ativar avatar:', err);
      setError('Erro ao ativar avatar');
    }
  };

  const deleteAvatar = async (avatarId) => {
    if (!confirm('Tem certeza que deseja deletar esta foto?')) return;

    try {
      const user = await userService.getCurrentUser();
      if (!user) throw new Error('Usuário não autenticado');

      await avatarService.deleteAvatar(user.id, avatarId);
      
      // Remover da lista
      setAvatars(prev => prev.filter(avatar => avatar.id !== avatarId));

      // Se era o avatar ativo, notificar mudança
      const deletedAvatar = avatars.find(a => a.id === avatarId);
      if (deletedAvatar?.is_active) {
        const newActiveAvatar = avatars.find(a => a.id !== avatarId);
        if (newActiveAvatar && onAvatarUpdate) {
          onAvatarUpdate(newActiveAvatar.public_url);
        }
      }

    } catch (err) {
      console.error('Erro ao deletar avatar:', err);
      setError(err.message || 'Erro ao deletar avatar');
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-bee-yellow mx-auto mb-2"></div>
        <p className="text-sm text-gray-600 dark:text-gray-400">Carregando fotos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Upload de Nova Foto */}
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
        
        {isUploading ? (
          <div className="space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-bee-yellow mx-auto"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Fazendo upload... {uploadProgress}%
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-bee-yellow h-2 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <i className="fas fa-cloud-upload-alt text-3xl text-gray-400"></i>
            <div>
              <button
                onClick={triggerFileSelect}
                className="text-bee-yellow hover:text-bee-dark-yellow font-medium"
              >
                Escolher nova foto
              </button>
              <p className="text-xs text-gray-500 mt-1">
                JPEG, PNG ou WebP até 5MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Erro */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Lista de Avatars */}
      {avatars.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 dark:text-white">
            Suas fotos ({avatars.length})
          </h4>
          
          <div className="grid grid-cols-3 gap-3">
            {avatars.map((avatar) => (
              <div 
                key={avatar.id} 
                className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                  avatar.is_active 
                    ? 'border-bee-yellow shadow-lg' 
                    : 'border-gray-200 dark:border-gray-600 hover:border-bee-yellow/50'
                }`}
              >
                <img 
                  src={avatar.public_url} 
                  alt="Avatar"
                  className="w-full h-20 object-cover"
                />
                
                {/* Overlay com ações */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                    {!avatar.is_active && (
                      <button
                        onClick={() => setActiveAvatar(avatar.id)}
                        className="bg-bee-yellow text-bee-black rounded-full p-1.5 hover:bg-bee-dark-yellow transition-colors"
                        title="Ativar esta foto"
                      >
                        <i className="fas fa-check text-xs"></i>
                      </button>
                    )}
                    
                    <button
                      onClick={() => deleteAvatar(avatar.id)}
                      className="bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                      title="Deletar foto"
                    >
                      <i className="fas fa-trash text-xs"></i>
                    </button>
                  </div>
                </div>

                {/* Indicador de ativo */}
                {avatar.is_active && (
                  <div className="absolute top-1 right-1 bg-bee-yellow text-bee-black rounded-full p-1">
                    <i className="fas fa-star text-xs"></i>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dicas */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <h5 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
          💡 Dicas para uma boa foto de perfil:
        </h5>
        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Use uma foto clara e bem iluminada</li>
          <li>• Prefira fotos onde seu rosto está visível</li>
          <li>• Evite fotos muito escuras ou borradas</li>
          <li>• Formato quadrado funciona melhor</li>
        </ul>
      </div>
    </div>
  );
}
