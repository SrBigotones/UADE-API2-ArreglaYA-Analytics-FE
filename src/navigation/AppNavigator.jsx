import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/authContextCore';
import MainLayout from '../layouts/MainLayout';
import LoginScreen from '../screens/LoginScreen';

const AppNavigator = () => {
  const { isAuthenticated } = useContext(AuthContext);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }
  return (
    <Routes>
      {isAuthenticated ? (
        <>
          {/* Rutas protegidas - requieren autenticación */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<MainLayout />} />
          <Route path="/catalog" element={<MainLayout />} />
          <Route path="/app" element={<MainLayout />} />
          <Route path="/payments" element={<MainLayout />} />
          <Route path="/users" element={<MainLayout />} />
          <Route path="/matching" element={<MainLayout />} />
          <Route path="/profile" element={<MainLayout />} />
          
          {/* Ruta de fallback para usuarios autenticados */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </>
      ) : (
        <>
          {/* Ruta pública - no requiere autenticación */}
          <Route path="/login" element={<LoginScreen />} />
          
          {/* Redirigir todas las demás rutas a login si no está autenticado */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      )}
    </Routes>
  );
};

export default AppNavigator;
