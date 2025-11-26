import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import CoreScreen from '../screens/DashboardScreen';
import CatalogScreen from '../screens/CatalogScreen';
import RequestsScreen from '../screens/RequestsScreen';
import PaymentsScreen from '../screens/PaymentsScreen';
import UsersScreen from '../screens/UsersScreen';
import ProfileScreen from '../screens/ProfileScreen';

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Cargar el tema guardado del localStorage al inicializar
    const savedTheme = localStorage.getItem('arreglaya-dark-mode');
    return savedTheme ? JSON.parse(savedTheme) : false;
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Obtener la pantalla actual desde la URL
  const getCurrentScreen = () => {
    const path = location.pathname;
    if (path === '/profile') return 'profile';
    return 'dashboard';
  };

  // Obtener la categoría actual desde la URL
  const getCurrentCategory = () => {
    const path = location.pathname;
    switch (path) {
      case '/dashboard': return 'dashboard';
      case '/catalog': return 'catalog';
      case '/requests': return 'requests';
      case '/payments': return 'payments';
      case '/users': return 'users';
      default: return 'dashboard';
    }
  };

  const activeScreen = getCurrentScreen();
  const activeCategory = getCurrentCategory();

  // Guardar el tema en localStorage cada vez que cambie
  useEffect(() => {
    localStorage.setItem('arreglaya-dark-mode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const categories = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'users', name: 'Usuarios y roles' },
    { id: 'catalog', name: 'Servicios y prestadores' },
    { id: 'requests', name: 'Solicitudes y Matching' },
    { id: 'payments', name: 'Pagos y facturacion' },
  ];

  // Función para manejar el clic en Perfil desde la navbar
  const handleProfileClick = () => {
    navigate('/profile');
    // Cerrar el menú desplegable del usuario
    if (window.closeUserMenu) {
      window.closeUserMenu();
    }
  };

  // Función para manejar el clic en categorías del sidebar
  const handleCategoryClick = (categoryId) => {
    navigate(`/${categoryId}`);
  };

  // Función para volver al dashboard
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  // Función para renderizar la pantalla según la categoría activa
  const renderDashboardScreen = () => {
    switch (activeCategory) {
      case 'dashboard':
        return <CoreScreen isDarkMode={isDarkMode} />;
      case 'catalog':
        return <CatalogScreen isDarkMode={isDarkMode} />;
      case 'requests':
        return <RequestsScreen isDarkMode={isDarkMode} />;
      case 'payments':
        return <PaymentsScreen isDarkMode={isDarkMode} />;
      case 'users':
        return <UsersScreen isDarkMode={isDarkMode} />;
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

      <div className="flex" style={{ paddingTop: 56 }}>
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
        <div className={`p-2 sm:p-4 w-full ${activeScreen === 'dashboard' ? 'md:ml-64' : ''} ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          {renderActiveScreen()}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
