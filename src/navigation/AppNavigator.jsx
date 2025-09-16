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
  // ! Por ahora se puede acceder al home estando o no autenticado
  return (
    <Routes>
      {isAuthenticated ? (
        <>
          <Route path="/" element={<MainLayout />} />
          <Route path="/home" element={<MainLayout />} />
        </>
      ) : (
        <>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/home" element={<Navigate to="/login" replace />} />
        </>
      )}

      <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />} />
    </Routes>
  );
};

export default AppNavigator;
