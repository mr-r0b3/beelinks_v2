'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    fullName: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validações
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    try {
      // Import serviços dinamicamente para evitar problemas de build
      const { authService, userService } = await import('../../lib/supabase');
      
      // Verificar se username está disponível
      const isAvailable = await userService.isUsernameAvailable(formData.username);
      if (!isAvailable) {
        setError('Nome de usuário já está em uso');
        setIsLoading(false);
        return;
      }

      // Criar usuário
      const { user, error: signUpError } = await authService.signUp(
        formData.email,
        formData.password,
        {
          username: formData.username,
          full_name: formData.fullName
        }
      );

      if (signUpError) throw signUpError;

      if (user) {
        // Usuário criado com sucesso
        alert('Conta criada com sucesso! Verifique seu email para confirmar a conta.');
        router.push('/login');
      }
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      setError(error.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bee-light-gray dark:bg-bee-black py-8">
      <div className="bg-bee-white dark:bg-bee-gray p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <i className="fas fa-link text-bee-yellow text-3xl"></i>
            <h1 className="text-bee-yellow text-3xl font-bold">BeeLinks</h1>
          </div>
          <h2 className="text-xl font-semibold dark:text-white">Criar nova conta</h2>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bee-yellow dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Nome de Usuário
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bee-yellow dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={isLoading}
              placeholder="seu_usuario"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Apenas letras minúsculas, números e underscore</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bee-yellow dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Senha
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bee-yellow dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={isLoading}
              minLength="6"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Confirmar Senha
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bee-yellow dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={isLoading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-bee-yellow hover:bg-bee-dark-yellow text-black font-semibold py-2 px-4 rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black mr-2"></div>
                Criando conta...
              </>
            ) : (
              'Criar Conta'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-bee-yellow hover:text-bee-dark-yellow font-semibold">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
