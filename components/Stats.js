'use client';

import { useState, useEffect } from 'react';
import { loadLinks } from '../utils/storage';

export default function Stats() {
  const [linkCount, setLinkCount] = useState(0);

  useEffect(() => {
    const updateLinkCount = () => {
      const links = loadLinks();
      setLinkCount(links.length);
    };

    updateLinkCount();

    // Listen to custom events for real-time updates
    const handleLinksUpdate = () => updateLinkCount();
    window.addEventListener('linksUpdated', handleLinksUpdate);

    return () => {
      window.removeEventListener('linksUpdated', handleLinksUpdate);
    };
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      <div className="text-center">
        <div className="dark:bg-gray-700 bg-white p-4 rounded-xl shadow-md">
          <i className="fas fa-link text-bee-yellow text-2xl mb-2"></i>
          <div className="dark:text-white text-bee-black text-lg font-semibold">
            {linkCount}
          </div>
          <div className="dark:text-gray-300 text-gray-600 text-xs">
            {linkCount === 1 ? 'Link' : 'Links'}
          </div>
        </div>
      </div>
      <div className="text-center">
        <div className="dark:bg-gray-700 bg-white p-4 rounded-xl shadow-md">
          <i className="fas fa-eye text-bee-yellow text-2xl mb-2"></i>
          <div className="dark:text-white text-bee-black text-lg font-semibold">
            {linkCount * 12 + 4}
          </div>
          <div className="dark:text-gray-300 text-gray-600 text-xs">Visualizações</div>
        </div>
      </div>
      <div className="text-center">
        <div className="dark:bg-gray-700 bg-white p-4 rounded-xl shadow-md">
          <i className="fas fa-heart text-bee-yellow text-2xl mb-2"></i>
          <div className="dark:text-white text-bee-black text-lg font-semibold">
            {Math.floor(linkCount * 3.7) + 8}
          </div>
          <div className="dark:text-gray-300 text-gray-600 text-xs">Curtidas</div>
        </div>
      </div>
    </div>
  );
}
