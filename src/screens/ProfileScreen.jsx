import React, { useState } from 'react';

const ProfileScreen = ({ onBackToDashboard, isDarkMode }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  // Datos del usuario (en el futuro vendrían del contexto de autenticación)
  const [userData, setUserData] = useState({
    name: 'Administrador',
    email: 'admin@arreglaya.com',
    role: 'Super Admin',
    department: 'Tecnología',
    phone: '+54 11 1234-5678',
    location: 'Buenos Aires, Argentina',
    joinDate: 'Enero 2024',
    lastLogin: 'Hace 2 horas'
  });

  const [formData, setFormData] = useState({ ...userData });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    setUserData(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(userData);
    setIsEditing(false);
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
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Gestiona tu información personal y configuración</p>
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
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Editar
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Nombre Completo
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                  />
                ) : (
                  <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>{userData.name}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                  />
                ) : (
                  <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>{userData.email}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Rol
                </label>
                <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>{userData.role}</p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Departamento
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                  />
                ) : (
                  <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>{userData.department}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Teléfono
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                  />
                ) : (
                  <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>{userData.phone}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Ubicación
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                  />
                ) : (
                  <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>{userData.location}</p>
                )}
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
                {userData.name.charAt(0)}
              </div>
              <h4 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{userData.name}</h4>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{userData.role}</p>
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
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Miembro desde:</span>
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{userData.joinDate}</span>
              </div>
              <div className="flex justify-between">
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Último acceso:</span>
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{userData.lastLogin}</span>
              </div>
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className={`rounded-lg shadow-sm border p-6 ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Acciones Rápidas</h4>
            <div className="space-y-2">
              <button className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                isDarkMode 
                  ? 'text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}>
                Cambiar contraseña
              </button>
              <button className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                isDarkMode 
                  ? 'text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}>
                Configuración de notificaciones
              </button>
              <button className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                isDarkMode 
                  ? 'text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}>
                Preferencias de idioma
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileScreen;
