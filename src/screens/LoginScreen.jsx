import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/authContextCore';
import { loginRequest } from '../services/authService';
// Logo se removió en Login para esta pantalla
import Navbar from '../components/Navbar';

const LoginScreen = () => {
  const { login } = useContext(AuthContext);
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('arreglaya-dark-mode');
      setIsDarkMode(savedTheme ? JSON.parse(savedTheme) : false);
    } catch {
      setIsDarkMode(false);
    }
  }, []);

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    try {
      localStorage.setItem('arreglaya-dark-mode', JSON.stringify(next));
    } catch {
      // ignore storage errors
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!usernameOrEmail.trim() || !password.trim()) {
      setErrorMessage('Por favor, completa todos los campos.');
      return;
    }

    try {
      setIsSubmitting(true);
      // Use real backend authentication
      const data = await loginRequest({ usernameOrEmail, password });
      const token = data?.token || data?.jwt || data?.accessToken;
      if (!token) {
        setErrorMessage('Respuesta inválida del servidor.');
        return;
      }
      await login({ token, user: data?.user });
    } catch (err) {
      const apiMessage = err?.response?.data?.message || err?.response?.data?.error || 'Credenciales inválidas o error de conexión.';
      setErrorMessage(apiMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Navbar 
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        onProfileClick={() => {}}
        onToggleSidebar={() => {}}
        hideUserSection
      />
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-10">
        <div className={`w-full max-w-lg shadow rounded-lg p-8 md:p-10 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="mb-8 text-center">
            <h1 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Bienvenido a ArreglaYa Analytics</h1>
            <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Iniciá sesión para acceder a métricas, dashboards y gestión de tu plataforma.
            </p>
          </div>

        {errorMessage && (
          <div className={`mb-4 rounded px-3 py-2 text-sm border ${
            isDarkMode ? 'border-red-500 bg-red-900/30 text-red-200' : 'border-red-200 bg-red-50 text-red-700'
          }`}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Usuario o Email</label>
            <input
              type="text"
              className={`block w-full rounded-md px-3 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 border ${
                isDarkMode ? 'bg-gray-900 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="tu.usuario o email@dominio.com"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Contraseña</label>
            <input
              type="password"
              className={`block w-full rounded-md px-3 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 border ${
                isDarkMode ? 'bg-gray-900 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full inline-flex items-center justify-center rounded-md px-4 py-2 font-medium text-white transition ${
              isSubmitting ? 'bg-teal-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'
            }`}
          >
            {isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;


