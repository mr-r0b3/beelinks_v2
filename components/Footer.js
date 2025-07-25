'use client';

export default function Footer() {
  return (
    <footer className="text-center mt-12 pt-8 border-t dark:border-gray-700 border-gray-200">
      <p className="dark:text-gray-400 text-gray-600 text-sm">
        Criado com <i className="fas fa-heart text-red-500"></i> usando{' '}
        <a 
          href="https://nextjs.org" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-bee-yellow hover:text-bee-dark-yellow transition-colors"
        >
          Next.js
        </a>
        {' '}e{' '}
        <a 
          href="https://tailwindcss.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-bee-yellow hover:text-bee-dark-yellow transition-colors"
        >
          Tailwind CSS
        </a>
      </p>
      <p className="dark:text-gray-500 text-gray-500 text-xs mt-2">
        BeeLinks © 2024 - Conecte todos os seus links em um só lugar
      </p>
    </footer>
  );
}
