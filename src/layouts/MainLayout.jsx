import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import CoreScreen from '../screens/CoreScreen';
import CatalogScreen from '../screens/CatalogScreen';
import AppScreen from '../screens/AppScreen';
import PaymentsScreen from '../screens/PaymentsScreen';
import UsersScreen from '../screens/UsersScreen';
import MatchingScreen from '../screens/MatchingScreen';
import ReputationScreen from '../screens/ReputationScreen';
import ProfileScreen from '../screens/ProfileScreen';

const MainLayout = () => {
  const [activeCategory, setActiveCategory] = useState('core');
  const [activeScreen, setActiveScreen] = useState('dashboard'); // 'dashboard' o 'profile'
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const categories = [
    { id: 'core', name: 'Core' },
    { id: 'catalog', name: 'Catálogo' },
    { id: 'app', name: 'App' },
    { id: 'payments', name: 'Pagos' },
    { id: 'users', name: 'Usuarios' },
    { id: 'matching', name: 'Matching' },
    { id: 'reputation', name: 'Reputación' }
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
      case 'core':
        return <CoreScreen />;
      case 'catalog':
        return <CatalogScreen />;
      case 'app':
        return <AppScreen />;
      case 'payments':
        return <PaymentsScreen />;
      case 'users':
        return <UsersScreen />;
      case 'matching':
        return <MatchingScreen />;
      case 'reputation':
        return <ReputationScreen />;
      default:
        return <CoreScreen />;
    }
  };

  // Función para renderizar la pantalla activa
  const renderActiveScreen = () => {
    if (activeScreen === 'profile') {
      return <ProfileScreen onBackToDashboard={handleBackToDashboard} />;
    }
    return renderDashboardScreen();
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Topbar */}
      <Navbar 
        isDarkMode={isDarkMode} 
        toggleDarkMode={toggleDarkMode}
        onProfileClick={handleProfileClick}
      />

      <div className="flex">
        {/* Sidebar - solo se muestra en dashboard */}
        {activeScreen === 'dashboard' && (
          <Sidebar 
            activeCategory={activeCategory} 
            setActiveCategory={handleCategoryClick} 
            isDarkMode={isDarkMode} 
            categories={categories} 
          />
        )}

        {/* Main Content */}
        <div className={`p-8 ${activeScreen === 'profile' ? 'w-full' : 'flex-1'}`}>
          {renderActiveScreen()}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
