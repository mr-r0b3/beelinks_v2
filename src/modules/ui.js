// Módulo para manipulação da interface

import { 
  loadLinks, 
  saveLinks, 
  loadProfile, 
  loadStats, 
  saveStats 
} from './storage.js';

import { 
  updateLinkClicks, 
  sortLinksByDate,
  createLink,
  validateLink 
} from './linkManager.js';

// Função pura para gerar HTML de um link
export const generateLinkHTML = (link) => `
  <a href="${link.url}" 
     target="_blank" 
     data-link-id="${link.id}"
     class="link-item block dark:bg-bee-gray bg-bee-white hover:bg-bee-yellow hover:text-bee-black transition-all duration-300 rounded-xl p-4 border-2 border-transparent hover:border-bee-yellow group shadow-md">
    <div class="flex items-center space-x-4">
      <div class="bg-bee-yellow text-bee-black p-3 rounded-lg group-hover:bg-bee-black group-hover:text-bee-yellow transition-colors duration-300">
        <i class="${link.icon} text-xl"></i>
      </div>
      <div class="flex-1">
        <h3 class="dark:text-white text-bee-black group-hover:text-bee-black font-semibold text-lg">${link.title}</h3>
        <p class="dark:text-gray-400 text-gray-500 group-hover:text-bee-gray text-sm">${link.description}</p>
        ${link.clicks > 0 ? `<small class="text-xs text-gray-500">${link.clicks} cliques</small>` : ''}
      </div>
      <i class="fas fa-external-link-alt dark:text-gray-400 text-gray-500 group-hover:text-bee-black"></i>
    </div>
  </a>
`;

// Função para renderizar lista de links
export const renderLinks = () => {
  const linksContainer = document.querySelector('#linksContainer');
  if (!linksContainer) return;

  const links = loadLinks();
  const sortedLinks = sortLinksByDate(links);

  if (sortedLinks.length === 0) {
    linksContainer.innerHTML = `
      <div class="text-center py-8">
        <i class="fas fa-link text-4xl text-gray-400 mb-4"></i>
        <p class="dark:text-gray-400 text-gray-500">Nenhum link adicionado ainda</p>
        <p class="dark:text-gray-500 text-gray-600 text-sm">Clique em "Adicionar Link" para começar</p>
      </div>
    `;
    return;
  }

  linksContainer.innerHTML = sortedLinks.map(generateLinkHTML).join('');
  
  // Adicionar event listeners para tracking de cliques
  addClickTracking();
};

// Função para adicionar tracking de cliques
const addClickTracking = () => {
  const linkElements = document.querySelectorAll('[data-link-id]');
  
  linkElements.forEach(element => {
    element.addEventListener('click', (e) => {
      const linkId = element.dataset.linkId;
      trackLinkClick(linkId);
    });
  });
};

// Função para rastrear cliques em links
const trackLinkClick = (linkId) => {
  const links = loadLinks();
  const updatedLinks = links.map(link => 
    link.id === linkId ? updateLinkClicks(link) : link
  );
  
  saveLinks(updatedLinks);
  updateStats();
};

// Função para atualizar estatísticas
const updateStats = () => {
  const stats = loadStats();
  const links = loadLinks();
  const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0);
  
  const updatedStats = {
    ...stats,
    totalClicks,
    linksCreated: links.length,
    lastVisit: new Date().toISOString()
  };
  
  saveStats(updatedStats);
  renderStats();
};

// Função para renderizar estatísticas
export const renderStats = () => {
  const stats = loadStats();
  const statsElement = document.querySelector('#statsContainer');
  
  if (statsElement) {
    statsElement.innerHTML = `
      <span><i class="fas fa-eye mr-1"></i>${stats.totalViews.toLocaleString()} visualizações</span>
      <span><i class="fas fa-mouse-pointer mr-1"></i>${stats.totalClicks} cliques</span>
    `;
  }
};

// Função para renderizar perfil
export const renderProfile = () => {
  const profile = loadProfile();
  const profileElement = document.querySelector('#profileContainer');
    if (profileElement) {
    profileElement.innerHTML = `
      <div class="relative inline-block mb-4">
        <img src="${profile.avatar}" 
             alt="Profile Picture" 
             class="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-bee-yellow shadow-lg mx-auto object-cover">
      </div>
      <h2 class="dark:text-white text-bee-black text-xl sm:text-2xl font-semibold mb-2">@${profile.username}</h2>
      <p class="dark:text-gray-300 text-gray-600 text-sm sm:text-base mb-4">${profile.bio}</p>
    `;
  }
};
