'use client';

export default function SocialLinks() {
  const socialLinks = [
    { 
      platform: 'GitHub', 
      url: 'https://github.com/seuusuario', 
      icon: 'fab fa-github',
      color: 'hover:text-gray-900 dark:hover:text-gray-100'
    },
    { 
      platform: 'Twitter', 
      url: 'https://twitter.com/seuusuario', 
      icon: 'fab fa-twitter',
      color: 'hover:text-blue-500'
    },
    { 
      platform: 'LinkedIn', 
      url: 'https://linkedin.com/in/seuusuario', 
      icon: 'fab fa-linkedin',
      color: 'hover:text-blue-600'
    },
    { 
      platform: 'Instagram', 
      url: 'https://instagram.com/seuusuario', 
      icon: 'fab fa-instagram',
      color: 'hover:text-pink-500'
    },
  ];

  return (
    <div className="flex justify-center space-x-6 mb-8">
      {socialLinks.map((social) => (
        <a 
          key={social.platform}
          href={social.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className={`dark:text-gray-400 text-gray-600 ${social.color} transition-all duration-300 hover:scale-110`}
          title={social.platform}
        >
          <i className={`${social.icon} text-2xl`}></i>
        </a>
      ))}
    </div>
  );
}
