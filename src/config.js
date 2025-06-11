export const CONFIG = {
  photos: {
    types: ['unsplash', 'picsum', 'avatar'],
    preferences: {
      unsplash: 0.5,
      picsum: 0.3,   
      avatar: 0.2    
    },
    unsplashCategories: [
      'person', 'portrait', 'face', 'people', 
      'business', 'professional', 'headshot'
    ],
    avatarColors: {
      backgrounds: [
        'FFD700', 'FFC107', 'FF9800', 'F44336', 
        '9C27B0', '3F51B5', '2196F3', '00BCD4', 
        '009688', '4CAF50', '8BC34A', 'CDDC39'
      ],
      text: ['1A1A1A', 'FFFFFF', '000000', '333333']
    }
  },
  
  app: {
    name: 'BeeLinks',
    version: '1.0.0',
    description: 'Seus Links em um Só Lugar',
    notifications: {
      duration: 3000,
      position: 'top-right'
    },
    animations: {
      duration: 300,
      easing: 'ease-out',
      stagger: 100
    }
  },
  
  defaultProfile: {
    username: 'seuusuario',
    bio: 'Desenvolvedor | Criador de Conteúdo | Tech Enthusiast',
    socialLinks: [
      { name: 'Twitter', icon: 'fab fa-twitter', url: '#' },
      { name: 'Discord', icon: 'fab fa-discord', url: '#' },
      { name: 'Telegram', icon: 'fab fa-telegram', url: '#' },
      { name: 'Email', icon: 'fas fa-envelope', url: '#' }
    ]
  }
}
