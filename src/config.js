// Configurações do BeeLinks
export const CONFIG = {
  // Configurações de fotos
  photos: {
    // Tipos de foto disponíveis
    types: ['unsplash', 'picsum', 'avatar'],
    
    // Preferências por tipo (0-1, onde 1 = sempre usar)
    preferences: {
      unsplash: 0.5,  // 50% chance
      picsum: 0.3,    // 30% chance  
      avatar: 0.2     // 20% chance
    },
    
    // Categorias do Unsplash para fotos de perfil
    unsplashCategories: [
      'person', 'portrait', 'face', 'people', 
      'business', 'professional', 'headshot'
    ],
    
    // Cores para avatars
    avatarColors: {
      backgrounds: [
        'FFD700', 'FFC107', 'FF9800', 'F44336', 
        '9C27B0', '3F51B5', '2196F3', '00BCD4', 
        '009688', '4CAF50', '8BC34A', 'CDDC39'
      ],
      text: ['1A1A1A', 'FFFFFF', '000000', '333333']
    }
  },
  
  // Configurações da aplicação
  app: {
    name: 'BeeLinks',
    version: '1.0.0',
    description: 'Seus Links em um Só Lugar',
    
    // Configurações de notificação
    notifications: {
      duration: 3000, // 3 segundos
      position: 'top-right'
    },
    
    // Configurações de animação
    animations: {
      duration: 300,
      easing: 'ease-out',
      stagger: 100 // delay entre animações
    }
  },
  
  // Configurações padrão do perfil
  defaultProfile: {
    username: 'seuusuario',
    bio: 'Desenvolvedor | Criador de Conteúdo | Tech Enthusiast',
    socialLinks: [
      { name: 'Twitter', icon: 'fab fa-twitter', url: '#' },
      { name: 'Discord', icon: 'fab fa-discord', url: '#' },
      { name: 'Telegram', icon: 'fab fa-telegram', url: '#' },
      { name: 'Email', icon: 'fas fa-envelope', url: '#' }
    ]
  },
  
  // URLs e APIs externas
}
