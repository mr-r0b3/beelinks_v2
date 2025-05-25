// Arquivo principal da aplicação BeeLinks
// Importa todos os módulos necessários

import { 
  renderLinks, 
  renderStats, 
  renderProfile 
} from './modules/ui.js';

import { 
  toggleTheme, 
  initializeTheme, 
  setupAddLinkForm,
  showNotification 
} from './modules/events.js';

import { 
  loadLinks, 
  saveLinks, 
  loadStats, 
  saveStats 
} from './modules/storage.js';

import { 
  createLink, 
  validateLink 
} from './modules/linkManager.js';

import { 
  detectIconFromUrl, 
  isValidURL 
} from './utils/helpers.js';

// Estado da aplicação
let appState = {
  links: [],
  isLoading: false
};

// Função principal de inicialização
const initializeApp = () => {
  console.log('🐝 Inicializando BeeLinks...');
  
  // Carregar dados do localStorage
  appState.links = loadLinks();
  
  // Inicializar tema
  initializeTheme();
  
  // Renderizar componentes
  renderProfile();
  renderStats();
  renderLinks();
  
  // Configurar event listeners
  setupEventListeners();
  
  // Incrementar visualizações
  updatePageViews();
  
  console.log('✅ BeeLinks inicializado com sucesso!');
};

// Configurar todos os event listeners
const setupEventListeners = () => {
  // Toggle de tema
  const themeToggle = document.querySelector('#themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const newTheme = toggleTheme();
      showNotification(`Tema ${newTheme === 'dark' ? 'escuro' : 'claro'} ativado!`);
    });
  }
  
  // Configurar formulário de adicionar link
  setupAddLinkForm();
  setupLinkFormSubmission();
  
  // Preview de URL em tempo real
  setupUrlPreview();
  
  // Configurar event listeners para remoção de links
  setupDeleteLinkListeners();
};

// Configurar submissão do formulário
const setupLinkFormSubmission = () => {
  const linkForm = document.querySelector('#linkForm');
  
  if (linkForm) {
    linkForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleAddLink(e);
    });
  }
};

// Função para adicionar um novo link
const handleAddLink = (e) => {
  const formData = new FormData(e.target);
  const title = formData.get('title');
  const url = formData.get('url');
  const description = formData.get('description');
  const icon = formData.get('icon') || detectIconFromUrl(url);
  
  // Validar dados
  const newLink = createLink(title, url, description, icon);
  const validation = validateLink(newLink);
  
  if (!validation.isValid) {
    showNotification(validation.errors.join(', '), 'error');
    return;
  }
  
  // Adicionar link à lista
  appState.links = [newLink, ...appState.links];
  saveLinks(appState.links);
  
  // Atualizar interface
  renderLinks();
  
  // Fechar modal
  const modal = document.querySelector('#addLinkModal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
  }
  
  // Limpar formulário
  e.target.reset();
  
  // Mostrar notificação
  showNotification('Link adicionado com sucesso!');
};

// Configurar preview de URL
const setupUrlPreview = () => {
  const urlInput = document.querySelector('#urlInput');
  const iconPreview = document.querySelector('#iconPreview');
  
  if (urlInput && iconPreview) {
    urlInput.addEventListener('input', (e) => {
      const url = e.target.value;
      if (isValidURL(url)) {
        const detectedIcon = detectIconFromUrl(url);
        iconPreview.className = detectedIcon + ' text-xl';
        iconPreview.parentElement.classList.remove('hidden');
      } else {
        iconPreview.parentElement.classList.add('hidden');
      }
    });
  }
};

// Atualizar visualizações da página
const updatePageViews = () => {
  const stats = loadStats();
  const updatedStats = {
    ...stats,
    totalViews: stats.totalViews + 1,
    lastVisit: new Date().toISOString()
  };
  
  saveStats(updatedStats);
  renderStats();
};

// Função para popular dados iniciais (apenas para demonstração)
const populateInitialData = () => {
  const currentLinks = loadLinks();
  
  if (currentLinks.length === 0) {
    const initialLinks = [
      createLink(
        'GitHub',
        'https://github.com',
        'Confira meus projetos',
        'fab fa-github'
      ),
      createLink(
        'LinkedIn',
        'https://linkedin.com',
        'Conecte-se comigo',
        'fab fa-linkedin'
      ),
      createLink(
        'Portfólio',
        'https://meuportfolio.com',
        'Veja meu trabalho',
        'fas fa-globe'
      ),
      createLink(
        'YouTube',
        'https://youtube.com',
        'Tutoriais e conteúdo',
        'fab fa-youtube'
      ),
      createLink(
        'Instagram',
        'https://instagram.com',
        'Acompanhe meu dia a dia',
        'fab fa-instagram'
      )
    ];
    
    saveLinks(initialLinks);
    appState.links = initialLinks;
  }
};

// Inicializar aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  // Popular dados iniciais apenas na primeira execução
  populateInitialData();
  
  // Inicializar aplicação
  initializeApp();
});

// Exportar funções para uso global (se necessário)
window.BeeLinks = {
  addLink: handleAddLink,
  toggleTheme,
  renderLinks,
  showNotification
};

// Configurar event listeners para remoção de links (delegação de eventos)
const setupDeleteLinkListeners = () => {
  // Usar delegação de eventos no container principal
  const linksContainer = document.querySelector('#linksContainer');
  
  if (linksContainer) {
    linksContainer.addEventListener('click', (e) => {
      // Verificar se o clique foi em um botão de deletar
      const deleteBtn = e.target.closest('[data-delete-id]');
      
      if (deleteBtn) {
        e.preventDefault();
        e.stopPropagation();
        
        const linkId = deleteBtn.dataset.deleteId;
        handleDeleteLink(linkId);
      }
    });
  }
};

// Função para lidar com a remoção de link
const handleDeleteLink = (linkId) => {
  const links = loadLinks();
  const linkToDelete = links.find(link => link.id === linkId);
  
  if (!linkToDelete) {
    showNotification('Link não encontrado!', 'error');
    return;
  }
  
  // Criar modal de confirmação
  showConfirmDeleteModal(linkId, linkToDelete);
};

// Função para mostrar modal de confirmação de exclusão
const showConfirmDeleteModal = (linkId, linkData) => {
  const confirmModal = document.createElement('div');
  confirmModal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in';
  confirmModal.innerHTML = `
    <div class="bg-white dark:bg-bee-gray rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl transform transition-all duration-300 scale-95 animate-scale-in">
      <div class="text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
          <i class="fas fa-trash text-red-600 dark:text-red-400 text-xl"></i>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Confirmar exclusão</h3>
        <p class="text-gray-600 dark:text-gray-300 mb-2">
          Tem certeza que deseja remover o link:
        </p>
        <p class="font-semibold text-bee-yellow mb-4">"${linkData.title}"</p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Esta ação não pode ser desfeita.</p>
        
        <div class="flex justify-center space-x-3">
          <button id="cancelDelete" 
                  class="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors duration-200">
            <i class="fas fa-times mr-2"></i>Cancelar
          </button>
          <button id="confirmDelete" 
                  class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200">
            <i class="fas fa-trash mr-2"></i>Remover
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(confirmModal);
  document.body.style.overflow = 'hidden';
  
  // Event listeners do modal
  const cancelBtn = confirmModal.querySelector('#cancelDelete');
  const confirmBtn = confirmModal.querySelector('#confirmDelete');
  
  const closeModal = () => {
    document.body.removeChild(confirmModal);
    document.body.style.overflow = 'auto';
  };
  
  cancelBtn.addEventListener('click', closeModal);
  
  confirmBtn.addEventListener('click', () => {
    confirmDeleteLink(linkId, linkData.title);
    closeModal();
  });
  
  // Fechar ao clicar fora
  confirmModal.addEventListener('click', (e) => {
    if (e.target === confirmModal) closeModal();
  });
  
  // Fechar com tecla ESC
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  
  document.addEventListener('keydown', handleEscape);
};

// Função para confirmar e executar a exclusão
const confirmDeleteLink = (linkId, linkTitle) => {
  const links = loadLinks();
  const updatedLinks = links.filter(link => link.id !== linkId);
  
  // Salvar links atualizados
  saveLinks(updatedLinks);
  
  // Atualizar estado da aplicação
  appState.links = updatedLinks;
  
  // Re-renderizar a lista de links
  renderLinks();
  
  // Atualizar estatísticas
  updatePageViews();
  
  // Mostrar notificação de sucesso
  showNotification(`✅ Link "${linkTitle}" removido com sucesso!`, 'success');
  
  console.log(`🗑️ Link "${linkTitle}" removido com sucesso!`);
};
