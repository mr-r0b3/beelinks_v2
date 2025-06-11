// Módulo para gerenciar dados no LocalStorage

import { generateRandomProfilePhoto } from '../utils/helpers.js';

const STORAGE_KEYS = {
  LINKS: 'beelinks_links',
  PROFILE: 'beelinks_profile',
  THEME: 'beelinks_theme',
  STATS: 'beelinks_stats'
};

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

export const saveLinks = (links) => 
  saveToStorage(STORAGE_KEYS.LINKS, links);

export const loadLinks = () => 
  loadFromStorage(STORAGE_KEYS.LINKS, []);

export const saveProfile = (profile) => 
  saveToStorage(STORAGE_KEYS.PROFILE, profile);

export const loadProfile = () => {
  const defaultProfile = {
    username: 'seuusuario',
    bio: 'Desenvolvedor | Criador de Conteúdo | Tech Enthusiast',
    avatar: generateRandomProfilePhoto(),
    views: 0,
    totalClicks: 0
  };
  
  const savedProfile = loadFromStorage(STORAGE_KEYS.PROFILE, defaultProfile);
  savedProfile.avatar = generateRandomProfilePhoto();
  saveProfile(savedProfile);
  
  return savedProfile;
};

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
