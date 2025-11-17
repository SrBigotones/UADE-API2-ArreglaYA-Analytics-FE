import React, { useContext } from 'react';
import { AuthContext } from '../context/authContextCore';

const ProfileScreen = ({ onBackToDashboard, isDarkMode }) => {
  const { user } = useContext(AuthContext);
  
  // Datos del usuario desde el contexto de autenticación
  const userData = {
    firstName: user?.firstName || 'Usuario',
    lastName: user?.lastName || '',
    fullName: `${user?.firstName || 'Usuario'} ${user?.lastName || ''}`.trim(),
    email: user?.email || 'No disponible',
    role: user?.role || 'No asignado',
    active: user?.active || false,
    id: user?.id || 'N/A'
  };

  return (
    <>
      <div className="flex flex-col items-center gap-6">
        <div className="w-full max-w-2xl flex items-center justify-between">
          <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Perfil de Usuario
          </h2>
          <button
            onClick={onBackToDashboard}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              isDarkMode 
                ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Dashboard
          </button>
        </div>
        <div className={`w-full max-w-2xl rounded-lg shadow-sm border p-6 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="text-center">
            <div className="w-24 h-24 bg-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-2xl mx-auto mb-4">
              {userData.firstName.charAt(0)}
            </div>
            <h4 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{userData.fullName}</h4>
            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{userData.role}</p>
            <div className="flex items-center justify-center">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                userData.active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {userData.active ? 'Cuenta Activa' : 'Cuenta Inactiva'}
              </span>
            </div>
          </div>
        </div>

        <div className={`w-full max-w-2xl rounded-lg shadow-sm border p-6 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Información de Cuenta</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>ID de Usuario:</span>
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{userData.id}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Email:</span>
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{userData.email}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Rol:</span>
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{userData.role}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileScreen;
