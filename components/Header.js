'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService, userService } from '../lib/supabase';

export default function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Forçar logout localmente mesmo com erro
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    const initializeTheme = async () => {
      try {
        // Tentar carregar tema do usuário no Supabase
        const user = await userService.getCurrentUser();
        if (user) {
          const userProfile = await userService.getUserProfile(user.id);
          const savedTheme = userProfile?.theme_preference;
          
          if (savedTheme) {
            const isDark = savedTheme === 'dark';
            setIsDarkMode(isDark);
            
            if (isDark) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
            return;
          }
        }
      } catch (error) {
        console.error('Erro ao carregar tema do usuário:', error);
      }

      // Fallback para tema do sistema/localStorage
      const localTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = localTheme === 'dark' || (!localTheme && prefersDark);
      
      setIsDarkMode(isDark);
      
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    initializeTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    const themeValue = newTheme ? 'dark' : 'light';
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Salvar localmente para resposta imediata
    localStorage.setItem('theme', themeValue);

    try {
      // Salvar no Supabase
      const user = await userService.getCurrentUser();
      if (user) {
        await userService.updateProfile(user.id, {
          theme_preference: themeValue
        });
      }
    } catch (error) {
      console.error('Erro ao salvar tema no Supabase:', error);
      // Tema já foi aplicado localmente, então não é crítico
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
          disabled={isLoggingOut}
          className="flex items-center space-x-2 bg-bee-yellow hover:bg-bee-dark-yellow text-black px-4 py-2 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Sair da conta"
        >
          <i id="logout-icon" className={`fas ${isLoggingOut ? 'fa-spinner fa-spin' : 'fa-sign-out-alt'}`}></i>
          <span id="logout-text" className="font-medium">
            {isLoggingOut ? 'Saindo...' : 'Sair'}
          </span>
        </button>
      </div>
    </header>
  );
}
