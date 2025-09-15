import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/authContextCore';
import MainLayout from '../layouts/MainLayout';

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
  // ! Por ahora se puede acceder al home estando o no autenticado
  return (
    <Routes>
      {isAuthenticated ? (
        // Pantallas protegidas - usan MainLayout
        <>
          <Route path="/" element={<MainLayout />} />
          <Route path="/home" element={<MainLayout />} />
          {/* Aquí puedes agregar más rutas protegidas que usen MainLayout */}
        </>
      ) : (
        // Si no está autenticado, redirige a login (o muestra una pantalla de acceso denegado)
        <>
          <Route path="/" element={<MainLayout />} />               // ! CAMBIAR LA REDIRECCION POR LA PANTALLA DE LOGIN
          <Route path="/home" element={<MainLayout />} />
        </>
      )}
      
      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppNavigator;
