export const createLink = (title, url, description, icon = 'fas fa-link') => ({
  id: crypto.randomUUID(),
  title: title.trim(),
  url: url.trim(),
  description: description.trim(),
  icon,
  createdAt: new Date().toISOString(),
  clicks: 0
});

export const updateLinkClicks = (link) => ({
  ...link,
  clicks: link.clicks + 1
});

export const validateLink = (link) => {
  const errors = [];
  
  if (!link.title || link.title.length < 2) {
    errors.push('Título deve ter pelo menos 2 caracteres');
  }
  
  if (!link.url || !isValidUrl(link.url)) {
    errors.push('URL deve ser válida');
  }
  
  if (!link.description || link.description.length < 5) {
    errors.push('Descrição deve ter pelo menos 5 caracteres');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const isValidUrl = (string) => {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

export const sortLinksByDate = (links) => 
  [...links].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

export const sortLinksByClicks = (links) => 
  [...links].sort((a, b) => b.clicks - a.clicks);

export const filterLinksBySearch = (links, searchTerm) => 
  links.filter(link => 
    link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

export const getLinkById = (links, id) => 
  links.find(link => link.id === id);

export const removeLinkById = (links, id) => 
  links.filter(link => link.id !== id);

export const updateLinkById = (links, id, updates) => 
  links.map(link => 
    link.id === id ? { ...link, ...updates } : link
  );
