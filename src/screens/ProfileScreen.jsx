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
      <div className="mb-4">
        {/* Header con título y botón de retorno */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Perfil de Usuario
            </h2>
          </div>
          
          {/* Botón de retorno al dashboard */}
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Información del Perfil */}
        <div className="lg:col-span-2">
          <div className={`rounded-lg shadow-sm border p-6 ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Información Personal</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Nombre
                </label>
                <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>{userData.firstName}</p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Apellido
                </label>
                <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>{userData.lastName}</p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email
                </label>
                <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>{userData.email}</p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Rol
                </label>
                <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>{userData.role}</p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  ID de Usuario
                </label>
                <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>{userData.id}</p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Estado de la Cuenta
                </label>
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    userData.active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {userData.active ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar con información adicional */}
        <div className="space-y-6">
          {/* Avatar y estadísticas */}
          <div className={`rounded-lg shadow-sm border p-6 ${
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

          {/* Información de cuenta */}
          <div className={`rounded-lg shadow-sm border p-6 ${
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
      </div>
    </>
  );
};

export default ProfileScreen;
