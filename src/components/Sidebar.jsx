import React from 'react';

const Sidebar = ({ activeCategory, setActiveCategory, isDarkMode, categories, isOpen, onClose }) => {
  return (
    <div className={`w-64 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm min-h-screen fixed md:static inset-y-0 left-0 transform transition-transform z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      <nav className="mt-8">
        {/* Botón cerrar en móvil */}
        <div className="md:hidden flex justify-end px-4">
          <button onClick={onClose} className={`p-2 rounded ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}>✕</button>
        </div>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
              activeCategory === category.id
                ? `${isDarkMode ? 'bg-teal-900 border-teal-400 text-teal-300' : 'bg-teal-50 border-teal-600 text-teal-700'} border-r-2`
                : isDarkMode 
                  ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span className="font-medium">{category.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
