'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '../../lib/supabase';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const { user } = await authService.signIn(formData.email, formData.password);
      
      if (user) {
        router.push('/');
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setError(error.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="login-page" className="min-h-screen flex items-center justify-center bg-bee-light-gray dark:bg-bee-black">
      <div id="login-container" className="bg-bee-white dark:bg-bee-gray p-8 rounded-lg shadow-lg w-full max-w-md">
        <div id="login-header" className="text-center mb-8">
          <div id="login-logo" className="flex items-center justify-center space-x-2 mb-4">
            <i id="login-logo-icon" className="fas fa-link text-bee-yellow text-3xl"></i>
            <h1 id="login-logo-text" className="text-bee-yellow text-3xl font-bold">BeeLinks</h1>
          </div>
          <h2 id="login-title" className="text-xl font-semibold dark:text-white">Entrar na sua conta</h2>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form id="login-form" onSubmit={handleSubmit} className="space-y-6">
          <div id="email-field-container">
            <label id="email-label" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Email
            </label>
            <input
              id="email-input"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bee-yellow dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={isLoading}
              required
            />
          </div>

          <div id="password-field-container">
            <label id="password-label" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Senha
            </label>
            <input
              id="password-input"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bee-yellow dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={isLoading}
              required
            />
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full bg-bee-yellow hover:bg-bee-dark-yellow text-black font-semibold py-2 px-4 rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black mr-2"></div>
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        <div id="signup-prompt" className="mt-6 text-center">
          <p id="signup-text" className="text-gray-600 dark:text-gray-300">
            Ainda não tem uma conta?{' '}
            <Link id="signup-link" href="/signup" className="text-bee-yellow hover:text-bee-dark-yellow font-semibold">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
