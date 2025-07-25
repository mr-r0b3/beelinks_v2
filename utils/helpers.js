// Helper utilities for URL detection and other common functions

export function detectPlatform(url) {
  const platforms = {
    'github.com': 'fab fa-github',
    'twitter.com': 'fab fa-twitter',
    'x.com': 'fab fa-x-twitter',
    'instagram.com': 'fab fa-instagram',
    'linkedin.com': 'fab fa-linkedin',
    'facebook.com': 'fab fa-facebook',
    'youtube.com': 'fab fa-youtube',
    'twitch.tv': 'fab fa-twitch',
    'discord.gg': 'fab fa-discord',
    'discord.com': 'fab fa-discord',
    'tiktok.com': 'fab fa-tiktok',
    'spotify.com': 'fab fa-spotify',
    'soundcloud.com': 'fab fa-soundcloud',
    'medium.com': 'fab fa-medium',
    'dev.to': 'fab fa-dev',
    'stackoverflow.com': 'fab fa-stack-overflow',
    'reddit.com': 'fab fa-reddit',
    'pinterest.com': 'fab fa-pinterest',
    'dribbble.com': 'fab fa-dribbble',
    'behance.net': 'fab fa-behance',
    'figma.com': 'fas fa-pen-nib',
    'codepen.io': 'fab fa-codepen',
    'notion.so': 'fas fa-sticky-note',
    'whatsapp.com': 'fab fa-whatsapp',
    'telegram.org': 'fab fa-telegram',
    'telegram.me': 'fab fa-telegram'
  };

  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    const domain = urlObj.hostname.toLowerCase().replace('www.', '');
    
    return platforms[domain] || 'fas fa-link';
  } catch (error) {
    return 'fas fa-link';
  }
}

export function generateRandomProfilePhoto() {
  const photoIds = [
    'photo-1472099645785-5658abf4ff4e', // man with beard
    'photo-1507003211169-0a1dd7228f2d', // man in suit
    'photo-1494790108755-2616c9c32db5', // woman smiling
    'photo-1438761681033-6461ffad8d80', // woman portrait
    'photo-1500648767791-00dcc994a43e', // man casual
    'photo-1534528741775-53994a69daeb', // woman professional
    'photo-1506794778202-cad84cf45f1d', // man outdoor
    'photo-1544005313-94ddf0286df2', // woman blonde
    'photo-1547425260-76bcadfb4f2c', // man glasses
    'photo-1487412720507-e7ab37603c6f'  // woman brunette
  ];
  
  const randomId = photoIds[Math.floor(Math.random() * photoIds.length)];
  return `https://images.unsplash.com/${randomId}?w=150&h=150&fit=crop&crop=face`;
}

export function validateUrl(url) {
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`);
    return true;
  } catch (error) {
    return false;
  }
}

export function formatUrl(url) {
  if (!url) return '';
  
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  
  return url;
}

export function truncateText(text, maxLength = 50) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function getTimeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = now - date;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return 'Agora mesmo';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} min atrás`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h atrás`;
  } else if (diffInDays < 30) {
    return `${diffInDays}d atrás`;
  } else {
    return date.toLocaleDateString('pt-BR');
  }
}
