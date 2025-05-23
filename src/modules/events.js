// Módulo para gerenciar eventos da aplicação

import { loadTheme, saveTheme } from './storage.js';

// Função para alternar tema
export const toggleTheme = () => {
  const html = document.documentElement;
  const currentTheme = loadTheme();
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  // Aplicar novo tema
  if (newTheme === 'dark') {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
  
  // Atualizar ícone
  const themeIcon = document.querySelector('#themeIcon');
  if (themeIcon) {
    themeIcon.className = newTheme === 'dark' ? 'fas fa-moon text-lg' : 'fas fa-sun text-lg';
  }
  
  // Salvar preferência
  saveTheme(newTheme);
  
  return newTheme;
};

// Função para inicializar tema
export const initializeTheme = () => {
  const theme = loadTheme();
  const html = document.documentElement;
  const themeIcon = document.querySelector('#themeIcon');
  
  if (theme === 'dark') {
    html.classList.add('dark');
    if (themeIcon) themeIcon.className = 'fas fa-moon text-lg';
  } else {
    html.classList.remove('dark');
    if (themeIcon) themeIcon.className = 'fas fa-sun text-lg';
  }
};

// Event listeners para formulário de adicionar link
export const setupAddLinkForm = () => {
  const addLinkBtn = document.querySelector('#addLinkBtn');
  const modal = document.querySelector('#addLinkModal');
  const closeModal = document.querySelector('#closeModal');
  const cancelBtn = document.querySelector('#cancelBtn');
  const linkForm = document.querySelector('#linkForm');
  
  if (addLinkBtn && modal) {
    addLinkBtn.addEventListener('click', () => {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    });
  }
  
  const closeModalHandler = () => {
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = 'auto';
      if (linkForm) linkForm.reset();
    }
  };
  
  if (closeModal) closeModal.addEventListener('click', closeModalHandler);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModalHandler);
  
  // Fechar modal ao clicar fora
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModalHandler();
    });
  }
};

// Função para debounce (programação funcional)
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Função para mostrar notificações
export const showNotification = (message, type = 'success') => {
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full ${
    type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
  }`;
  notification.innerHTML = `
    <div class="flex items-center space-x-2">
      <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Animar entrada
  setTimeout(() => {
    notification.classList.remove('translate-x-full');
  }, 100);
  
  // Remover após 3 segundos
  setTimeout(() => {
    notification.classList.add('translate-x-full');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
};
