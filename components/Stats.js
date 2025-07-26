'use client';

import { useState, useEffect } from 'react';
import { userService, analyticsService, linksService } from '../lib/supabase';

export default function Stats() {
  const [stats, setStats] = useState({
    linkCount: 0,
    totalViews: 0,
    totalClicks: 0,
    profileViews: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      const user = await userService.getCurrentUser();
      if (user) {
        // Carregar links do usuário
        const userLinks = await linksService.getUserLinks(user.id);
        
        // Calcular estatísticas dos links
        const totalClicks = userLinks.reduce((sum, link) => sum + (link.clicks || 0), 0);
        const totalViews = userLinks.reduce((sum, link) => sum + (link.views || 0), 0);
        
        // Carregar estatísticas gerais do usuário (incluindo visualizações do perfil)
        const userStats = await analyticsService.getUserStats(user.id, '30d');
        const profileViews = userStats.reduce((sum, stat) => sum + (stat.profile_views || 0), 0);

        setStats({
          linkCount: userLinks.length,
          totalViews: totalViews,
          totalClicks: totalClicks,
          profileViews: profileViews
        });
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      // Manter valores zerados em caso de erro
      setStats({
        linkCount: 0,
        totalViews: 0,
        totalClicks: 0,
        profileViews: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((index) => (
          <div key={index} className="text-center">
            <div className="dark:bg-gray-700 bg-white p-4 rounded-xl shadow-md">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded mx-auto mb-2 animate-pulse"></div>
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      <div className="text-center">
        <div className="dark:bg-gray-700 bg-white p-4 rounded-xl shadow-md">
          <i className="fas fa-link text-bee-yellow text-2xl mb-2"></i>
          <div className="dark:text-white text-bee-black text-lg font-semibold">
            {stats.linkCount}
          </div>
          <div className="dark:text-gray-300 text-gray-600 text-xs">
            {stats.linkCount === 1 ? 'Link' : 'Links'}
          </div>
        </div>
      </div>
      <div className="text-center">
        <div className="dark:bg-gray-700 bg-white p-4 rounded-xl shadow-md">
          <i className="fas fa-mouse-pointer text-bee-yellow text-2xl mb-2"></i>
          <div className="dark:text-white text-bee-black text-lg font-semibold">
            {stats.totalClicks}
          </div>
          <div className="dark:text-gray-300 text-gray-600 text-xs">Cliques</div>
        </div>
      </div>
      <div className="text-center">
        <div className="dark:bg-gray-700 bg-white p-4 rounded-xl shadow-md">
          <i className="fas fa-eye text-bee-yellow text-2xl mb-2"></i>
          <div className="dark:text-white text-bee-black text-lg font-semibold">
            {stats.profileViews + stats.totalViews}
          </div>
          <div className="dark:text-gray-300 text-gray-600 text-xs">Visualizações</div>
        </div>
      </div>
    </div>
  );
}
