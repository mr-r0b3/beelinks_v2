'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../lib/supabase';

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authService.getSession();
        
        if (!session?.user) {
          router.push('/login');
          return;
        }
        
        setIsAuthenticated(true);
      } catch (error) {
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = authService.onAuthStateChange((event, session) => {      
      if (event === 'SIGNED_OUT' || !session) {
        setIsAuthenticated(false);
        router.push('/login');
      } else if (event === 'SIGNED_IN') {
        setIsAuthenticated(true);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bee-light-gray dark:bg-bee-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-bee-yellow mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Router.push já foi chamado
  }

  return children;
}
