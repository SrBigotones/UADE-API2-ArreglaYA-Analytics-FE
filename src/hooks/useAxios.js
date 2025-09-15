import axios from 'axios';
import { useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/authContextCore';
import { getToken } from '../utils/tokenStorage';
import config from '../config/api.js';

export const useAxios = () => {
  const { logout } = useContext(AuthContext);
  const axiosInstance = useRef(axios.create({ 
    baseURL: config.API_BASE_URL,
    timeout: 10000, // Aumenté el timeout para web
    headers: {
      'Content-Type': 'application/json',
    }
  }));

  useEffect(() => {
    const instance = axiosInstance.current;

    // Interceptor de request para agregar el token
    instance.interceptors.request.use(async (config) => {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Interceptor de response para manejar errores
    instance.interceptors.response.use(
      (res) => res,
      async (err) => {
        // Errores de conexión
        if (err.message === 'Network Error' || err.code === 'ECONNABORTED') {
          return Promise.reject({
            response: {
              status: 500,
              data: { message: 'Error de conexión. Por favor, verifica tu conexión a internet.' }
            }
          });
        }
        
        // Error de timeout
        if (err.code === 'ECONNABORTED') {
          return Promise.reject({
            response: {
              status: 408,
              data: { message: 'La petición tardó demasiado. Por favor, inténtalo de nuevo.' }
            }
          });
        }
        // !! Verificar manejo con logueo del modulo de usuarios
        // ** Hacia donde sera la redireccion en caso de falta de token/token vencido o invalido

        // Error de autenticación (401)
        if (err.response?.status === 401 && !err.config.url.includes('/login')) {
          await logout();
          // En web, podrías redirigir a la página de login
          // window.location.href = '/login';
        }
        
        return Promise.reject(err);
      }
    );
  }, [logout]); // Solo dependencia de logout

  return axiosInstance.current;
};