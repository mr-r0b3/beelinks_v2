'use client';

export default function AddLinkButton({ onClick }) {
  return (
    <button 
      onClick={onClick}
      className="w-full dark:bg-bee-yellow bg-bee-yellow hover:bg-bee-dark-yellow text-bee-black font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 mb-8"
    >
      <i className="fas fa-plus mr-2"></i>
      Adicionar Novo Link
    </button>
  );
}
