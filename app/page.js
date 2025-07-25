'use client';

import { useState } from 'react';
import Header from '../components/Header';
import ProtectedRoute from '../components/ProtectedRoute';
import Profile from '../components/Profile';
import Stats from '../components/Stats';
import SocialLinks from '../components/SocialLinks';
import AddLinkButton from '../components/AddLinkButton';
import AddLinkModal from '../components/AddLinkModal';
import LinksList from '../components/LinksList';
import Footer from '../components/Footer';

export default function Home() {
  const [showModal, setShowModal] = useState(false);

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
            <Profile />
            <Stats />
            <SocialLinks />
            <AddLinkButton onClick={handleAddLinkClick} />
            <LinksList />
          </main>

          <Footer />
          
          <AddLinkModal 
            id="add-link-modal"
            isOpen={showModal} 
            onClose={handleCloseModal} 
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
