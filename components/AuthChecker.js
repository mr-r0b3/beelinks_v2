'use client';

import { useState, useEffect } from 'react';
import { authService } from '../lib/supabase';

export default function AuthChecker({ children, fallback = null }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authService.getSession();
        setIsAuthenticated(!!session?.user);
      } catch (error) {
        console.log('Erro ao verificar autenticação:', error.message);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-bee-yellow"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || (
      <div className="text-center p-4">
        <p className="text-gray-600 dark:text-gray-400">
          Faça login para acessar seu perfil
        </p>
      </div>
    );
  }

  return children;
}
