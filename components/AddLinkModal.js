'use client';

import { useState } from 'react';
import { linksService, userService, supabase } from '../lib/supabase';
import { detectPlatform } from '../utils/helpers';

export default function AddLinkModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    icon: 'fas fa-link'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const syncUserAutomatically = async (authUser) => {
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

      // Criar usuário na tabela public.users
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

      console.log(`Usuário ${username} sincronizado automaticamente!`);
      return data;
    } catch (error) {
      console.error('Erro na sincronização automática:', error);
      throw error;
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    } else if (formData.title.trim().length < 2) {
      newErrors.title = 'Título deve ter pelo menos 2 caracteres';
    }

    if (!formData.url.trim()) {
      newErrors.url = 'URL é obrigatória';
    } else {
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlPattern.test(formData.url)) {
        newErrors.url = 'Por favor, insira uma URL válida';
      }
    }

    if (formData.description.trim() && formData.description.trim().length < 5) {
      newErrors.description = 'Descrição deve ter pelo menos 5 caracteres';
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

    // Auto-detect platform and set icon when URL changes
    if (name === 'url' && value) {
      const detectedIcon = detectPlatform(value);
      setFormData(prev => ({
        ...prev,
        icon: detectedIcon
      }));
    }

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
      // Ensure URL has protocol
      let url = formData.url.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      const user = await userService.getCurrentUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const linkData = {
        title: formData.title.trim(),
        description: formData.description.trim() || 'Clique para visitar',
        url: url,
        icon: formData.icon,
        sort_order: 0 // Novo link vai para o topo
      };

      await linksService.createLink(user.id, linkData);
      
      // Dispatch custom event for real-time updates
      window.dispatchEvent(new CustomEvent('linksUpdated'));

      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        url: '',
        icon: 'fas fa-link'
      });
      setErrors({});
      onClose();

    } catch (error) {
      console.error('Erro ao criar link:', error);
      
      // Se for erro de chave estrangeira, tentar sincronização automática
      if (error.message?.includes('foreign key constraint') || error.message?.includes('user_id_fkey')) {
        console.log('Erro de chave estrangeira detectado, tentando sincronização automática...');
        
        try {
          const user = await userService.getCurrentUser();
          if (user) {
            // Tentar sincronização automática
            await syncUserAutomatically(user);
            
            // Tentar criar o link novamente
            console.log('Tentando criar link novamente após sincronização...');
            const linkData = {
              title: formData.title.trim(),
              description: formData.description.trim() || 'Clique para visitar',
              url: url,
              icon: formData.icon,
              sort_order: 0
            };

            await linksService.createLink(user.id, linkData);
            
            // Sucesso após sincronização
            window.dispatchEvent(new CustomEvent('linksUpdated'));
            setFormData({
              title: '',
              description: '',
              url: '',
              icon: 'fas fa-link'
            });
            setErrors({});
            onClose();
            return; // Sair da função se deu certo
          }
        } catch (syncError) {
          console.error('Erro na sincronização automática:', syncError);
        }
      }
      
      let errorMessage = 'Erro ao criar link. Tente novamente.';
      
      if (error.message?.includes('foreign key constraint')) {
        errorMessage = 'Erro de sincronização de usuário. Recarregue a página ou acesse /debug para corrigir este problema.';
      } else if (error.message?.includes('user_id_fkey')) {
        errorMessage = 'Usuário não encontrado no sistema. Recarregue a página ou acesse /debug para sincronizar seu perfil.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({
        submit: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      description: '',
      url: '',
      icon: 'fas fa-link'
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="dark:bg-gray-800 bg-white p-6 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="dark:text-white text-gray-900 text-xl font-semibold">
            Adicionar Novo Link
          </h3>
          <button 
            onClick={handleCancel}
            disabled={isSubmitting}
            className="dark:text-gray-400 text-gray-600 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {errors.submit && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block dark:text-white text-gray-700 text-sm font-medium mb-2">
              Título *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Ex: Meu Portfolio"
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-bee-yellow focus:border-transparent disabled:opacity-50 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block dark:text-white text-gray-700 text-sm font-medium mb-2">
              Descrição
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Ex: Confira meus projetos e habilidades"
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-bee-yellow focus:border-transparent disabled:opacity-50 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          <div>
            <label className="block dark:text-white text-gray-700 text-sm font-medium mb-2">
              URL *
            </label>
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleInputChange}
              placeholder="Ex: https://meuportfolio.com"
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-bee-yellow focus:border-transparent disabled:opacity-50 ${
                errors.url ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.url && (
              <p className="text-red-500 text-xs mt-1">{errors.url}</p>
            )}
          </div>

          <div>
            <label className="block dark:text-white text-gray-700 text-sm font-medium mb-2">
              Ícone
            </label>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-bee-yellow rounded-lg flex items-center justify-center">
                <i className={`${formData.icon} text-bee-black`}></i>
              </div>
              <input
                type="text"
                name="icon"
                value={formData.icon}
                onChange={handleInputChange}
                placeholder="Ex: fab fa-github"
                disabled={isSubmitting}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-bee-yellow focus:border-transparent disabled:opacity-50"
              />
            </div>
            <p className="text-xs dark:text-gray-400 text-gray-500 mt-1">
              Use classes do Font Awesome (ex: fab fa-github, fas fa-link)
            </p>
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
                  Adicionando...
                </>
              ) : (
                'Adicionar Link'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
