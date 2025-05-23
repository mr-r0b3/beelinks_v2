// Módulo para gerenciar dados no LocalStorage

const STORAGE_KEYS = {
  LINKS: 'beelinks_links',
  PROFILE: 'beelinks_profile',
  THEME: 'beelinks_theme',
  STATS: 'beelinks_stats'
};

// Funções puras para LocalStorage
export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const loadFromStorage = (key, defaultValue = null) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Erro ao carregar ${key}:`, error);
    return defaultValue;
  }
};

export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Funções específicas para o BeeLinks
export const saveLinks = (links) => 
  saveToStorage(STORAGE_KEYS.LINKS, links);

export const loadLinks = () => 
  loadFromStorage(STORAGE_KEYS.LINKS, []);

export const saveProfile = (profile) => 
  saveToStorage(STORAGE_KEYS.PROFILE, profile);

export const loadProfile = () => 
  loadFromStorage(STORAGE_KEYS.PROFILE, {
    username: 'seuusuario',
    bio: 'Desenvolvedor | Criador de Conteúdo | Tech Enthusiast',
    avatar: 'https://ui-avatars.com/api/?name=Bee+Links&background=FFD700&color=1A1A1A&bold=true&size=200',
    views: 0,
    totalClicks: 0
  });

export const saveTheme = (theme) => 
  saveToStorage(STORAGE_KEYS.THEME, theme);

export const loadTheme = () => 
  loadFromStorage(STORAGE_KEYS.THEME, 'dark');

export const saveStats = (stats) => 
  saveToStorage(STORAGE_KEYS.STATS, stats);

export const loadStats = () => 
  loadFromStorage(STORAGE_KEYS.STATS, {
    totalViews: 1200,
    totalClicks: 234,
    linksCreated: 0,
    lastVisit: new Date().toISOString()
  });
