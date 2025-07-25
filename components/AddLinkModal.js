'use client';

import { useState } from 'react';
import { saveLink } from '../utils/storage';
import { detectPlatform } from '../utils/helpers';

export default function AddLinkModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    icon: 'fas fa-link'
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (!formData.url.trim()) {
      newErrors.url = 'URL é obrigatória';
    } else {
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlPattern.test(formData.url)) {
        newErrors.url = 'Por favor, insira uma URL válida';
      }
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Ensure URL has protocol
    let url = formData.url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const linkData = {
      id: Date.now().toString(),
      title: formData.title.trim(),
      description: formData.description.trim() || 'Clique para visitar',
      url: url,
      icon: formData.icon,
      createdAt: new Date().toISOString()
    };

    saveLink(linkData);
    
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
            className="dark:text-gray-400 text-gray-600 hover:text-gray-800 dark:hover:text-gray-200"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

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
              className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-bee-yellow focus:border-transparent ${
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-bee-yellow focus:border-transparent"
            />
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
              className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-bee-yellow focus:border-transparent ${
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
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-bee-yellow focus:border-transparent"
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
              className="flex-1 px-4 py-2 dark:bg-gray-600 bg-gray-200 dark:text-white text-gray-800 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-bee-yellow text-bee-black rounded-lg hover:bg-bee-dark-yellow transition-colors font-medium"
            >
              Adicionar Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
