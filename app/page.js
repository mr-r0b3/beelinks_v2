'use client';

import { useState, useEffect } from 'react';
import { analyticsService, userService } from '../lib/supabase';
import Header from '../components/Header';
import ProtectedRoute from '../components/ProtectedRoute';
import Profile from '../components/Profile';
import Stats from '../components/Stats';
import SocialLinks from '../components/SocialLinks';
import AddLinkButton from '../components/AddLinkButton';
import AddLinkModal from '../components/AddLinkModal';
import LinksList from '../components/LinksList';
import Footer from '../components/Footer';
import SyncStatus from '../components/SyncStatus';

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Registrar visualização do perfil
    const trackProfileView = async () => {
      try {
        const user = await userService.getCurrentUser();
        if (user) {
          await analyticsService.trackProfileView(user.id);
        }
      } catch (error) {
        console.error('Erro ao registrar visualização do perfil:', error);
      }
    };

    trackProfileView();

    // Listener para atualizar componentes quando links mudarem
    const handleLinksUpdate = () => {
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('linksUpdated', handleLinksUpdate);

    return () => {
      window.removeEventListener('linksUpdated', handleLinksUpdate);
    };
  }, []);

  const handleAddLinkClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <ProtectedRoute>
      <div id="home-page" className="min-h-screen bg-bee-light-gray dark:bg-bee-black">
        <div id="home-container" className="max-w-md mx-auto">
          <Header />
          
          <main id="home-main">
            <Profile key={`profile-${refreshKey}`} />
            <Stats key={`stats-${refreshKey}`} />
            <SocialLinks />
            <AddLinkButton onClick={handleAddLinkClick} />
            <LinksList key={`links-${refreshKey}`} />
          </main>

          <Footer />
          
          <AddLinkModal 
            id="add-link-modal"
            isOpen={showModal} 
            onClose={handleCloseModal} 
          />
          
          {/* Status de Sincronização */}
          <SyncStatus />
        </div>
      </div>
    </ProtectedRoute>
  );
}
