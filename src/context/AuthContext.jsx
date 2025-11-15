import { useState, useEffect } from 'react';
import { getToken, saveToken, removeToken } from '../utils/tokenStorage';
import { AuthContext } from './authContextCore';

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const init = async () => {
      const token = await getToken();
      setIsAuthenticated(!!token);
      try {
        const storedUser = localStorage.getItem('arreglaya-user');
        setUser(storedUser ? JSON.parse(storedUser) : null);
      } catch {
        setUser(null);
      }
    };
    init();
  }, []);

  const login = async ({ token, user: nextUser }) => {
    await saveToken(token);
    setIsAuthenticated(true);
    if (nextUser) {
      try {
        localStorage.setItem('arreglaya-user', JSON.stringify(nextUser));
      } catch (error) {
        console.error('❌ AuthContext - Error al guardar usuario en localStorage:', error);
      }
      setUser(nextUser);
    }
  };

  const logout = async () => {
    console.log('🔴 Ejecutando logout en AuthContext');
    await removeToken();
    setIsAuthenticated(false);
    setUser(null);
    try {
      localStorage.removeItem('arreglaya-user');
    } catch {
      // ignore storage errors
    }
    
    // Forzar redirección a login
    console.log('🔴 Redirigiendo a /login', isAuthenticated);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};