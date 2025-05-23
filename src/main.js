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
