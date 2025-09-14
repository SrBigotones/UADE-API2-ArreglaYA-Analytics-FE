import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/logo.png';

const Navbar = ({ isDarkMode, toggleDarkMode, onProfileClick, onToggleSidebar }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useContext(AuthContext);

  // Exponer la función de cerrar menú para que MainLayout pueda usarla
  useEffect(() => {
    window.closeUserMenu = () => setShowUserMenu(false);
    return () => {
      delete window.closeUserMenu;
    };
  }, []);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-sm border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between px-6 py-2">
        <div className="flex items-center">
          {/* Hamburguesa (solo móvil) */}
          <button
            onClick={onToggleSidebar}
            className={`mr-3 p-2 rounded-md md:hidden ${
              isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            aria-label="Abrir menú"
          >
            <span className="block w-5 h-0.5 bg-current mb-1"></span>
            <span className="block w-5 h-0.5 bg-current mb-1"></span>
            <span className="block w-5 h-0.5 bg-current"></span>
          </button>
          {/* Logo real */}
          <img src={logo} alt="Arregla Ya Logo" className="w-12 h-12 mr-3" />
          <h1 className={`hidden md:block text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Arregla Ya Analytics
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Botón de cambio de tema */}
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {/* Iconos: sol (modo oscuro activo -> botón muestra sol para pasar a claro), luna (modo claro activo) */}
            {isDarkMode ? (
              // Sun icon (fa-sun style)
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-5 h-5" fill="currentColor" aria-hidden="true">
                <path d="M256 144c-61.9 0-112 50.1-112 112s50.1 112 112 112 112-50.1 112-112S317.9 144 256 144zm0-144c13.3 0 24 10.7 24 24v48c0 13.3-10.7 24-24 24s-24-10.7-24-24V24c0-13.3 10.7-24 24-24zm0 416c13.3 0 24 10.7 24 24v48c0 13.3-10.7 24-24 24s-24-10.7-24-24v-48c0-13.3 10.7-24 24-24zM0 280c0-13.3 10.7-24 24-24h48c13.3 0 24 10.7 24 24s-10.7 24-24 24H24c-13.3 0-24-10.7-24-24zm416 0c0-13.3 10.7-24 24-24h48c13.3 0 24 10.7 24 24s-10.7 24-24 24h-48c-13.3 0-24-10.7-24-24zM68.7 68.7c9.4-9.4 24.6-9.4 33.9 0l33.9 33.9c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0L68.7 102.6c-9.4-9.4-9.4-24.6 0-33.9zm276.8 276.8c9.4-9.4 24.6-9.4 33.9 0l33.9 33.9c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-33.9-33.9c-9.4-9.4-9.4-24.6 0-33.9zM68.7 411.3c-9.4-9.4-9.4-24.6 0-33.9l33.9-33.9c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-33.9 33.9c-9.4 9.4-24.6 9.4-33.9 0zm276.8-276.8l33.9-33.9c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-33.9 33.9c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9z"/>
              </svg>
            ) : (
              // Moon icon (fa-moon style)
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-5 h-5" fill="currentColor" aria-hidden="true">
                <path d="M279.135 512c78.49 0 146.88-40.53 186.61-102.02 6.73-10.3-3.45-23.08-15.26-19.45-15.51 4.79-31.98 7.47-49.12 7.47-97.2 0-176-78.8-176-176 0-58.72 29.25-110.66 73.83-142.26 10.05-7.2 5.86-23.17-6.51-24.66-9.74-1.18-19.67-1.81-29.7-1.81-141.16 0-256 114.84-256 256S137.975 512 279.135 512z"/>
              </svg>
            )}
            <span className="sr-only">Cambiar tema</span>
          </button>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                {user?.name || 'Admin'}
              </span>
              <svg
                className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div
                className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border py-2 z-50 ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                <div className={`px-4 py-2 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {user?.name || 'Administrador'}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {user?.email || 'admin@arreglaya.com'}
                  </p>
                </div>
                <button
                  onClick={onProfileClick}
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Ver Perfil
                </button>
                <a
                  href="#"
                  className={`block px-4 py-2 text-sm ${
                    isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Configuración
                </a>
                <button
                  onClick={handleLogout}
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
