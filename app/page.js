'use client';

import { useState } from 'react';
import Header from '../components/Header';
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
    <div className="min-h-screen dark:bg-gray-900 bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <Header />
        
        <main>
          <Profile />
          <Stats />
          <SocialLinks />
          <AddLinkButton onClick={handleAddLinkClick} />
          <LinksList />
        </main>

        <Footer />
        
        <AddLinkModal 
          isOpen={showModal} 
          onClose={handleCloseModal} 
        />
      </div>
    </div>
  );
}
