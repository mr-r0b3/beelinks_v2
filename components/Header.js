'use client';

import { useState, useEffect } from 'react';
import { loadTheme, saveTheme } from '../utils/storage';

export default function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Load theme from localStorage on mount
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
    <header className="flex justify-between items-center mb-8">
      <div className="flex items-center space-x-2">
        <div className="w-10 h-10 bg-bee-yellow rounded-lg flex items-center justify-center">
          <i className="fas fa-link text-bee-black text-lg"></i>
        </div>
        <h1 className="dark:text-white text-bee-black text-xl font-bold">
          BeeLinks
        </h1>
      </div>
      <button 
        onClick={toggleTheme}
        className="dark:text-gray-300 text-gray-600 hover:text-bee-yellow dark:hover:text-bee-yellow transition-colors duration-300"
        title={isDarkMode ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
      >
        <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'} text-xl`}></i>
      </button>
    </header>
  );
}
