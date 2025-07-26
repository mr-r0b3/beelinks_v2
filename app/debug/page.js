'use client';

import { useState, useEffect } from 'react';
import DatabaseDebugger from '../../components/DatabaseDebugger';
import { authService } from '../../lib/supabase';

export default function DebugPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const session = await authService.getSession();
      setIsAuthenticated(!!session);
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-bee-yellow mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Acesso Restrito
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Você precisa estar logado para acessar esta página.
          </p>
          <a 
            href="/login"
            className="px-6 py-3 bg-bee-yellow text-bee-black rounded-lg hover:bg-bee-dark-yellow transition-colors font-medium"
          >
            Fazer Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Database Debugger
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Ferramenta para diagnosticar e corrigir problemas de sincronização de usuários
          </p>
          <div className="mt-4">
            <a 
              href="/"
              className="text-bee-yellow hover:text-bee-dark-yellow transition-colors"
            >
              ← Voltar para o Dashboard
            </a>
          </div>
        </div>
        
        <DatabaseDebugger />
      </div>
    </div>
  );
}
