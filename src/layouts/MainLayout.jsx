import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import CoreScreen from '../screens/DashboardScreen';
import CatalogScreen from '../screens/CatalogScreen';
import AppScreen from '../screens/AppScreen';
import PaymentsScreen from '../screens/PaymentsScreen';
import UsersScreen from '../screens/UsersScreen';
import MatchingScreen from '../screens/MatchingScreen';
import ProfileScreen from '../screens/ProfileScreen';

const MainLayout = () => {
  const [activeCategory, setActiveCategory] = useState('dashboard');
  const [activeScreen, setActiveScreen] = useState('dashboard'); // 'dashboard' o 'profile'
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const categories = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'catalog', name: 'Catalogo de servicios y prestadores' },
    { id: 'app', name: 'App de busqueda y solicitudes' },
    { id: 'payments', name: 'Pagos y facturacion' },
    { id: 'users', name: 'Usuarios y roles' },
    { id: 'matching', name: 'Matching y agenda' }
  ];

  // Función para manejar el clic en Perfil desde la navbar
  const handleProfileClick = () => {
    setActiveScreen('profile');
    // Cerrar el menú desplegable del usuario
    if (window.closeUserMenu) {
      window.closeUserMenu();
    }
  };

  // Función para manejar el clic en categorías del sidebar
  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId);
    setActiveScreen('dashboard');
  };

  // Función para volver al dashboard
  const handleBackToDashboard = () => {
    setActiveScreen('dashboard');
  };

  // Función para renderizar la pantalla según la categoría activa
  const renderDashboardScreen = () => {
    switch (activeCategory) {
      case 'dashboard':
        return <CoreScreen isDarkMode={isDarkMode} />;
      case 'catalog':
        return <CatalogScreen isDarkMode={isDarkMode} />;
      case 'app':
        return <AppScreen isDarkMode={isDarkMode} />;
      case 'payments':
        return <PaymentsScreen isDarkMode={isDarkMode} />;
      case 'users':
        return <UsersScreen isDarkMode={isDarkMode} />;
      case 'matching':
        return <MatchingScreen isDarkMode={isDarkMode} />;
      default:
        return <CoreScreen isDarkMode={isDarkMode} />;
    }
  };

  // Función para renderizar la pantalla activa
  const renderActiveScreen = () => {
    if (activeScreen === 'profile') {
      return <ProfileScreen onBackToDashboard={handleBackToDashboard} isDarkMode={isDarkMode} />;
    }
    return renderDashboardScreen();
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Topbar */}
      <Navbar 
        isDarkMode={isDarkMode} 
        toggleDarkMode={toggleDarkMode}
        onProfileClick={handleProfileClick}
        onToggleSidebar={toggleSidebar}
      />

      <div className="flex">
        {/* Sidebar - solo se muestra en dashboard */}
        {activeScreen === 'dashboard' && (
          <>
            {/* Overlay móvil */}
            {isSidebarOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden" onClick={closeSidebar}></div>
            )}
            <Sidebar 
              activeCategory={activeCategory} 
              setActiveCategory={(id) => { handleCategoryClick(id); closeSidebar(); }} 
              isDarkMode={isDarkMode} 
              categories={categories} 
              isOpen={isSidebarOpen}
              onClose={closeSidebar}
            />
          </>
        )}

        {/* Main Content */}
        <div className={`p-8 ${activeScreen === 'profile' ? 'w-full' : 'flex-1'} ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          {renderActiveScreen()}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
