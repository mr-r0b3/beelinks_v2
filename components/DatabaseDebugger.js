'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function DatabaseDebugger() {
  const [results, setResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const executeQuery = async (queryName, query) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql: query });
      
      if (error) {
        console.error(`Erro em ${queryName}:`, error);
        setResults(prev => ({
          ...prev,
          [queryName]: { error: error.message }
        }));
      } else {
        setResults(prev => ({
          ...prev,
          [queryName]: { data }
        }));
      }
    } catch (err) {
      console.error(`Erro ao executar ${queryName}:`, err);
      setResults(prev => ({
        ...prev,
        [queryName]: { error: err.message }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const checkCurrentUser = async () => {
    setIsLoading(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        setResults(prev => ({
          ...prev,
          currentUser: { error: authError.message }
        }));
        return;
      }

      if (!user) {
        setResults(prev => ({
          ...prev,
          currentUser: { error: 'Nenhum usuário logado' }
        }));
        return;
      }

      // Verificar se usuário existe na tabela public.users
      const { data: publicUser, error: publicError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      setResults(prev => ({
        ...prev,
        currentUser: {
          authUser: {
            id: user.id,
            email: user.email,
            created_at: user.created_at,
            email_confirmed_at: user.email_confirmed_at
          },
          publicUser: publicError ? null : publicUser,
          publicError: publicError?.message
        }
      }));

    } catch (err) {
      setResults(prev => ({
        ...prev,
        currentUser: { error: err.message }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const syncCurrentUser = async () => {
    setIsLoading(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        setResults(prev => ({
          ...prev,
          syncUser: { error: 'Usuário não encontrado' }
        }));
        return;
      }

      // Tentar usar a função SQL corrigida primeiro
      try {
        const { data: syncResult, error: funcError } = await supabase
          .rpc('sync_user_manual', { user_auth_id: user.id });

        if (funcError) {
          console.log('Função SQL falhou, tentando método alternativo:', funcError);
          // Se a função não existir, usar método alternativo
          await syncUserAlternative(user);
          return;
        }

        if (syncResult.success) {
          setResults(prev => ({
            ...prev,
            syncUser: { 
              success: true,
              message: syncResult.message || `Usuário ${syncResult.username} sincronizado com sucesso!`
            }
          }));
        } else {
          setResults(prev => ({
            ...prev,
            syncUser: { error: syncResult.error }
          }));
        }
      } catch (err) {
        console.log('Erro na função SQL, tentando método alternativo:', err);
        await syncUserAlternative(user);
      }

    } catch (err) {
      setResults(prev => ({
        ...prev,
        syncUser: { error: err.message }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const syncUserAlternative = async (user) => {
    try {
      // Verificar se já existe
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (existingUser) {
        setResults(prev => ({
          ...prev,
          syncUser: { message: 'Usuário já existe na tabela public.users' }
        }));
        return;
      }

      // Gerar username único
      const emailBase = user.email.split('@')[0];
      const usernameBase = emailBase.toLowerCase().replace(/[^a-z0-9_]/g, '').substring(0, 20) || 'user';
      
      let username = usernameBase;
      let counter = 1;
      
      while (true) {
        const { data: existingUsername } = await supabase
          .from('users')
          .select('id')
          .eq('username', username)
          .single();
        
        if (!existingUsername) break;
        username = usernameBase + counter;
        counter++;
      }

      // Usar o service role key se disponível
      const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
      let supabaseClient = supabase;
      
      if (serviceRoleKey) {
        const { createClient } = await import('@supabase/supabase-js');
        supabaseClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          serviceRoleKey
        );
      }

      // Criar usuário na tabela public.users
      const { data: newUser, error: insertError } = await supabaseClient
        .from('users')
        .insert([{
          id: user.id,
          email: user.email,
          username: username,
          full_name: user.user_metadata?.full_name || '',
          bio: 'Desenvolvedor | Criador de Conteúdo | Tech Enthusiast',
          email_verified: !!user.email_confirmed_at,
          created_at: user.created_at,
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (insertError) {
        setResults(prev => ({
          ...prev,
          syncUser: { 
            error: `Erro ao inserir usuário: ${insertError.message}. Certifique-se de executar o script fix-rls-policies.sql no Supabase.`
          }
        }));
        return;
      }

      // Criar configurações padrão
      await supabaseClient.from('user_settings').insert([{
        user_id: user.id,
        analytics_enabled: true,
        public_analytics: false,
        show_click_count: true,
        allow_link_preview: true,
        email_notifications: true,
        show_avatar: true,
        show_bio: true,
        show_social_links: true
      }]);

      // Criar tema padrão
      await supabaseClient.from('themes').insert([{
        user_id: user.id,
        name: 'Tema BeeLinks',
        is_default: true,
        primary_color: '#FFD700',
        secondary_color: '#FFC107',
        background_color: '#1A1A1A',
        text_color: '#FFFFFF',
        accent_color: '#2D2D2D',
        font_family: 'Inter',
        border_radius: 12,
        button_style: 'rounded'
      }]);

      setResults(prev => ({
        ...prev,
        syncUser: { 
          success: true,
          user: newUser,
          message: `Usuário ${username} criado com sucesso!`
        }
      }));

    } catch (err) {
      setResults(prev => ({
        ...prev,
        syncUser: { 
          error: `Erro no método alternativo: ${err.message}. Execute o script fix-rls-policies.sql no Supabase primeiro.`
        }
      }));
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          🔧 Database Debugger
        </h2>
        
        <div className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={checkCurrentUser}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? 'Carregando...' : 'Verificar Usuário Atual'}
            </button>
            
            <button
              onClick={syncCurrentUser}
              disabled={isLoading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {isLoading ? 'Carregando...' : 'Sincronizar Usuário Atual'}
            </button>
          </div>

          {Object.entries(results).map(([key, result]) => (
            <div key={key} className="border rounded-lg p-4 dark:border-gray-600">
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                {key}
              </h3>
              
              {result.error && (
                <div className="text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded">
                  <strong>Erro:</strong> {result.error}
                </div>
              )}
              
              {result.success && (
                <div className="text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded">
                  <strong>Sucesso:</strong> {result.message}
                </div>
              )}
              
              {result.message && !result.success && (
                <div className="text-blue-600 bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                  <strong>Info:</strong> {result.message}
                </div>
              )}
              
              {result.data && (
                <div className="mt-2">
                  <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-3 rounded overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )}
              
              {result.authUser && (
                <div className="mt-2 space-y-2">
                  <div className="text-sm">
                    <strong>Auth User:</strong>
                    <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded mt-1">
                      {JSON.stringify(result.authUser, null, 2)}
                    </pre>
                  </div>
                  
                  <div className="text-sm">
                    <strong>Public User:</strong>
                    {result.publicUser ? (
                      <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded mt-1">
                        {JSON.stringify(result.publicUser, null, 2)}
                      </pre>
                    ) : (
                      <div className="text-red-600 mt-1">
                        Usuário não encontrado na tabela public.users
                        {result.publicError && (
                          <div className="text-xs mt-1">Erro: {result.publicError}</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
          <h4 className="font-semibold mb-2">📋 Instruções para Corrigir o Erro:</h4>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
            <h5 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              🚨 Erro de RLS (Row Level Security) detectado
            </h5>
            <p className="text-yellow-700 dark:text-yellow-300 mb-3">
              O erro "new row violates row-level security policy" indica que as políticas de segurança 
              do Supabase estão impedindo a criação do usuário.
            </p>
            <div className="space-y-2">
              <p><strong>1.</strong> Execute o script <code>fix-rls-policies.sql</code> no SQL Editor do Supabase</p>
              <p><strong>2.</strong> Clique em "Verificar Usuário Atual" para diagnosticar</p>
              <p><strong>3.</strong> Clique em "Sincronizar Usuário Atual" para corrigir</p>
              <p><strong>4.</strong> Tente adicionar o link novamente</p>
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h5 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              📝 Scripts SQL necessários:
            </h5>
            <ol className="list-decimal list-inside space-y-1 text-blue-700 dark:text-blue-300">
              <li><code>database/supabase-auth-triggers.sql</code> - Triggers automáticos</li>
              <li><code>database/fix-rls-policies.sql</code> - Correção das políticas RLS</li>
            </ol>
            <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
              Execute estes scripts no SQL Editor do Supabase (Settings → SQL Editor)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
