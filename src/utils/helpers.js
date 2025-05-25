// Utilitários diversos para a aplicação

import { CONFIG } from '../config.js';

// Função para gerar IDs únicos (caso crypto.randomUUID não esteja disponível)
export const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'id-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
};

// Função para formatar datas
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'ontem';
  if (diffDays < 7) return `${diffDays} dias atrás`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} semanas atrás`;
  if (diffDays < 365) return `${Math.ceil(diffDays / 30)} meses atrás`;
  
  return date.toLocaleDateString('pt-BR');
};

// Função para truncar texto
export const truncateText = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

// Função para sanitizar HTML
export const sanitizeHTML = (str) => {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
};

// Função para validar URL
export const isValidURL = (string) => {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

// Função para detectar tipo de ícone baseado na URL
export const detectIconFromUrl = (url) => {
  const domain = url.toLowerCase();
  
  const iconMap = {
    'github.com': 'fab fa-github',
    'linkedin.com': 'fab fa-linkedin',
    'twitter.com': 'fab fa-twitter',
    'instagram.com': 'fab fa-instagram',
    'youtube.com': 'fab fa-youtube',
    'facebook.com': 'fab fa-facebook',
    'tiktok.com': 'fab fa-tiktok',
    'discord.com': 'fab fa-discord',
    'telegram.org': 'fab fa-telegram',
    'whatsapp.com': 'fab fa-whatsapp',
    'behance.net': 'fab fa-behance',
    'dribbble.com': 'fab fa-dribbble',
    'pinterest.com': 'fab fa-pinterest',
    'medium.com': 'fab fa-medium',
    'dev.to': 'fab fa-dev',
    'stackoverflow.com': 'fab fa-stack-overflow',
    'codepen.io': 'fab fa-codepen',
    'twitch.tv': 'fab fa-twitch'
  };
  
  for (const [domain_key, icon] of Object.entries(iconMap)) {
    if (domain.includes(domain_key)) {
      return icon;
    }
  }
  
  // Ícones genéricos baseados em palavras-chave
  if (domain.includes('blog') || domain.includes('medium')) return 'fas fa-blog';
  if (domain.includes('shop') || domain.includes('store')) return 'fas fa-shopping-cart';
  if (domain.includes('music') || domain.includes('spotify')) return 'fas fa-music';
  if (domain.includes('video') || domain.includes('vimeo')) return 'fas fa-video';
  if (domain.includes('photo') || domain.includes('image')) return 'fas fa-camera';
  if (domain.includes('mail') || domain.includes('email')) return 'fas fa-envelope';
  if (domain.includes('phone') || domain.includes('contact')) return 'fas fa-phone';
  
  return 'fas fa-link'; // Ícone padrão
};

// Função para copiar texto para clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return { success: true };
  } catch (err) {
    // Fallback para navegadores mais antigos
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return { success: true };
    } catch (fallbackErr) {
      document.body.removeChild(textArea);
      return { success: false, error: fallbackErr };
    }
  }
};

// Função para animar elementos
export const animateElement = (element, animation = 'fadeInUp') => {
  element.style.animation = `${animation} 0.6s ease-out`;
  
  element.addEventListener('animationend', () => {
    element.style.animation = '';
  }, { once: true });
};

// Lista de serviços de imagens aleatórias
const PHOTO_SERVICES = [
  {
    name: 'Unsplash',
    baseUrl: 'https://source.unsplash.com',
    sizes: ['200x200', '300x300', '400x400'],
    categories: ['person', 'portrait', 'face', 'people', 'business', 'professional']
  },
  {
    name: 'Picsum',
    baseUrl: 'https://picsum.photos',
    sizes: ['200', '300', '400'],
    categories: ['seed'] // Picsum usa seeds para variedade
  },
  {
    name: 'UI Avatars',
    baseUrl: 'https://ui-avatars.com/api',
    sizes: ['200', '300', '400'],
    categories: ['initials'] // Para avatars baseados em iniciais
  }
];

// Função para gerar uma foto aleatória do Unsplash
const generateUnsplashPhoto = () => {
  const service = PHOTO_SERVICES[0]; // Unsplash
  const size = service.sizes[Math.floor(Math.random() * service.sizes.length)];
  const category = service.categories[Math.floor(Math.random() * service.categories.length)];
  const randomId = Math.floor(Math.random() * 10000) + Date.now();
  
  return `${service.baseUrl}/${size}/?${category}&sig=${randomId}`;
};

// Função para gerar uma foto aleatória do Picsum
const generatePicsumPhoto = () => {
  const service = PHOTO_SERVICES[1]; // Picsum
  const size = service.sizes[Math.floor(Math.random() * service.sizes.length)];
  const randomSeed = Math.floor(Math.random() * 10000) + Date.now();
  
  return `${service.baseUrl}/${size}?random=${randomSeed}`;
};

// Função para gerar avatar com iniciais aleatórias
const generateUIAvatar = () => {
  const names = [
    'Alex+Johnson', 'Maria+Silva', 'John+Doe', 'Ana+Costa', 'Mike+Brown',
    'Sofia+Santos', 'David+Wilson', 'Lucia+Oliveira', 'Chris+Davis', 'Julia+Lima',
    'Ryan+Miller', 'Camila+Ferreira', 'Kevin+Garcia', 'Beatriz+Alves', 'Tyler+Jones',
    'Carla+Rocha', 'Jason+Martinez', 'Fernanda+Gomes', 'Brandon+Taylor', 'Mariana+Souza'
  ];
  
  const backgrounds = ['FFD700', 'FFC107', 'FF9800', 'F44336', '9C27B0', '3F51B5', '2196F3', '00BCD4', '009688', '4CAF50'];
  const colors = ['1A1A1A', 'FFFFFF', '000000', '333333'];
  
  const name = names[Math.floor(Math.random() * names.length)];
  const bg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const size = 200 + Math.floor(Math.random() * 200); // Entre 200-400px
  const randomSeed = Math.floor(Math.random() * 10000) + Date.now();
  
  return `https://ui-avatars.com/api/?name=${name}&background=${bg}&color=${color}&bold=true&size=${size}&v=${randomSeed}`;
};

// Função principal para gerar foto aleatória
export const generateRandomPhoto = () => {
  const services = [generateUnsplashPhoto, generatePicsumPhoto, generateUIAvatar];
  const randomService = services[Math.floor(Math.random() * services.length)];
  
  return randomService();
};

// Função para gerar uma nova foto para o perfil
export const generateRandomProfilePhoto = () => {
  // Preferir Unsplash para fotos de perfil mais realistas
  const useUnsplash = Math.random() > 0.3; // 70% chance de usar Unsplash
  
  if (useUnsplash) {
    return generateUnsplashPhoto();
  } else {
    return generateUIAvatar();
  }
};
