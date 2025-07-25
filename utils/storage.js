// Storage utilities for localStorage operations

export function loadProfile() {
  try {
    const profile = localStorage.getItem('beelinks_profile');
    return profile ? JSON.parse(profile) : {
      username: 'seuusuario',
      bio: 'Desenvolvedor | Criador de Conteúdo | Tech Enthusiast',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    };
  } catch (error) {
    console.error('Erro ao carregar perfil:', error);
    return {
      username: 'seuusuario',
      bio: 'Desenvolvedor | Criador de Conteúdo | Tech Enthusiast',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    };
  }
}

export function saveProfile(profile) {
  try {
    localStorage.setItem('beelinks_profile', JSON.stringify(profile));
  } catch (error) {
    console.error('Erro ao salvar perfil:', error);
  }
}

export function loadLinks() {
  try {
    const links = localStorage.getItem('beelinks_links');
    return links ? JSON.parse(links) : [];
  } catch (error) {
    console.error('Erro ao carregar links:', error);
    return [];
  }
}

export function saveLinks(links) {
  try {
    localStorage.setItem('beelinks_links', JSON.stringify(links));
  } catch (error) {
    console.error('Erro ao salvar links:', error);
  }
}

export function saveLink(link) {
  try {
    const links = loadLinks();
    links.push(link);
    saveLinks(links);
  } catch (error) {
    console.error('Erro ao salvar link:', error);
  }
}

export function deleteLink(linkId) {
  try {
    const links = loadLinks();
    const updatedLinks = links.filter(link => link.id !== linkId);
    saveLinks(updatedLinks);
  } catch (error) {
    console.error('Erro ao deletar link:', error);
  }
}

export function loadTheme() {
  try {
    const theme = localStorage.getItem('beelinks_theme');
    return theme || 'light';
  } catch (error) {
    console.error('Erro ao carregar tema:', error);
    return 'light';
  }
}

export function saveTheme(theme) {
  try {
    localStorage.setItem('beelinks_theme', theme);
  } catch (error) {
    console.error('Erro ao salvar tema:', error);
  }
}
