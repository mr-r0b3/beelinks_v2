'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadTheme, saveTheme } from '../utils/storage';

export default function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  useEffect(() => {

    const savedTheme = loadTheme();
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDarkMode(isDark);
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      saveTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      saveTheme('light');
    }
  };

  return (
    <header id="main-header" className="flex justify-between items-center mb-8 p-4">
      <div id="header-logo-container" className="flex items-center space-x-2">
        <div id="header-logo-box" className="w-10 h-10 bg-bee-yellow rounded-lg flex items-center justify-center">
          <i id="header-logo-icon" className="fas fa-link text-bee-black text-lg"></i>
        </div>
        <h1 id="header-title" className="dark:text-white text-bee-black text-xl font-bold">
          BeeLinks
        </h1>
      </div>
      <div id="header-actions" className="flex items-center space-x-4">
        <button 
          id="theme-toggle-btn"
          onClick={toggleTheme}
          className="dark:text-gray-300 text-gray-600 hover:text-bee-yellow dark:hover:text-bee-yellow transition-colors duration-300"
          title={isDarkMode ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
        >
          <i id="theme-toggle-icon" className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'} text-xl`}></i>
        </button>
        <button
          id="logout-btn"
          onClick={handleLogout}
          className="flex items-center space-x-2 bg-bee-yellow hover:bg-bee-dark-yellow text-black px-4 py-2 rounded-lg transition-colors duration-300"
          title="Sair da conta"
        >
          <i id="logout-icon" className="fas fa-sign-out-alt"></i>
          <span id="logout-text" className="font-medium">Sair</span>
        </button>
      </div>
    </header>
  );
}
