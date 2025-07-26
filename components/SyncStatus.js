'use client';

import { useState, useEffect } from 'react';
import { userService, supabase } from '../lib/supabase';

export default function SyncStatus() {
  const [status, setStatus] = useState('checking');
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    checkSyncStatus();
  }, []);

  const checkSyncStatus = async () => {
    try {
      const user = await userService.getCurrentUser();
      
      if (!user) {
        setStatus('no_user');
        return;
      }

      // Verificar se existe na tabela public.users
      const { data: publicUser, error } = await supabase
        .from('users')
        .select('id, username, email')
        .eq('id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        setStatus('needs_sync');
        setUserInfo({ email: user.email });
      } else if (error) {
        setStatus('error');
        setUserInfo({ error: error.message });
      } else {
        setStatus('synced');
        setUserInfo(publicUser);
      }
    } catch (err) {
      setStatus('error');
      setUserInfo({ error: err.message });
    }
  };

  const getStatusDisplay = () => {
    switch (status) {
      case 'checking':
        return (
          <div className="flex items-center gap-2 text-yellow-600">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-yellow-600"></div>
            Verificando sincronização...
          </div>
        );
      
      case 'synced':
        return (
          <div className="flex items-center gap-2 text-green-600">
            <i className="fas fa-check-circle"></i>
            Usuário sincronizado: @{userInfo?.username}
          </div>
        );
      
      case 'needs_sync':
        return (
          <div className="flex items-center gap-2 text-orange-600">
            <i className="fas fa-exclamation-triangle"></i>
            Sincronização automática será executada quando necessário
          </div>
        );
      
      case 'no_user':
        return (
          <div className="flex items-center gap-2 text-gray-600">
            <i className="fas fa-user-slash"></i>
            Nenhum usuário logado
          </div>
        );
      
      case 'error':
        return (
          <div className="flex items-center gap-2 text-red-600">
            <i className="fas fa-times-circle"></i>
            Erro: {userInfo?.error || 'Erro desconhecido'}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3 shadow-lg text-sm max-w-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-gray-900 dark:text-white">Status de Sincronização</span>
        <button 
          onClick={checkSyncStatus}
          className="text-blue-500 hover:text-blue-700 transition-colors"
          title="Verificar novamente"
        >
          <i className="fas fa-refresh text-xs"></i>
        </button>
      </div>
      {getStatusDisplay()}
      
      {status === 'synced' && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          ✅ Sistema funcionando normalmente
        </div>
      )}
      
      {status === 'needs_sync' && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          ℹ️ Sincronização será feita automaticamente
        </div>
      )}
    </div>
  );
}
