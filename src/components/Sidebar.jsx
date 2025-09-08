import React from 'react';

const Sidebar = ({ activeCategory, setActiveCategory, isDarkMode, categories }) => {
  return (
    <div className={`w-64 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm min-h-screen`}>
      <nav className="mt-8">
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
