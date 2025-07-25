'use client';

import { useState, useEffect } from 'react';
import { loadLinks, deleteLink } from '../utils/storage';

export default function LinksList() {
  const [links, setLinks] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState(null);

  useEffect(() => {
    const updateLinks = () => {
      const savedLinks = loadLinks();
      setLinks(savedLinks);
    };

    updateLinks();

    // Listen to custom events for real-time updates
    const handleLinksUpdate = () => updateLinks();
    window.addEventListener('linksUpdated', handleLinksUpdate);

    return () => {
      window.removeEventListener('linksUpdated', handleLinksUpdate);
    };
  }, []);

  const handleDeleteClick = (linkId) => {
    const link = links.find(l => l.id === linkId);
    setLinkToDelete(link);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (linkToDelete) {
      deleteLink(linkToDelete.id);
      setLinks(links.filter(link => link.id !== linkToDelete.id));
      
      // Dispatch custom event for real-time updates
      window.dispatchEvent(new CustomEvent('linksUpdated'));
    }
    setShowDeleteModal(false);
    setLinkToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setLinkToDelete(null);
  };

  if (links.length === 0) {
    return (
      <div className="text-center mb-8">
        <p className="dark:text-gray-300 text-gray-600 text-base mb-4">
          Nenhum link adicionado ainda. Comece criando seu primeiro link!
        </p>
        <div className="dark:bg-gray-700 bg-white p-8 rounded-xl shadow-md">
          <i className="fas fa-link text-bee-yellow text-4xl mb-4"></i>
          <p className="dark:text-gray-300 text-gray-600 text-sm">
            Seus links aparecerão aqui
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 mb-8">
        {links.map((link) => (
          <div 
            key={link.id}
            className="dark:bg-gray-700 bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group relative"
          >
            <div className="flex items-center justify-between">
              <a 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-3 flex-1"
              >
                <div className="w-10 h-10 bg-bee-yellow rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className={`${link.icon} text-bee-black text-lg`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="dark:text-white text-bee-black font-semibold text-base truncate">
                    {link.title}
                  </h3>
                  <p className="dark:text-gray-300 text-gray-600 text-sm truncate">
                    {link.description}
                  </p>
                </div>
              </a>
              <button 
                onClick={() => handleDeleteClick(link.id)}
                className="opacity-0 group-hover:opacity-100 ml-3 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-300"
                title="Remover link"
              >
                <i className="fas fa-trash text-sm"></i>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="dark:bg-gray-800 bg-white p-6 rounded-xl shadow-xl max-w-md w-full">
            <div className="text-center">
              <i className="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
              <h3 className="dark:text-white text-gray-900 text-lg font-semibold mb-2">
                Confirmar Exclusão
              </h3>
              <p className="dark:text-gray-300 text-gray-600 mb-6">
                Tem certeza que deseja remover o link "{linkToDelete?.title}"? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3 justify-center">
                <button 
                  onClick={cancelDelete}
                  className="px-4 py-2 dark:bg-gray-600 bg-gray-200 dark:text-white text-gray-800 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Remover
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
