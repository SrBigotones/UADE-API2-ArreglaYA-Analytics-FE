import axios from 'axios';
import config from '../config/api.js';

// Auth service for login using our metrics backend
export const loginRequest = async ({ usernameOrEmail, password }) => {
  const url = `${config.API_BASE_URL}api/auth/login`;
  
  const response = await axios.post(url, {
    email: usernameOrEmail, // El backend espera 'email' no 'usernameOrEmail'
    password,
  }, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
  });
  
  return response.data; // expected to contain token/JWT and user info
};

// Mock login to use while backend is not ready
export const loginRequestMock = async ({ usernameOrEmail }) => {
  // Simulate latency
  await new Promise((r) => setTimeout(r, 700));
  // Return a fake token and basic user info
  return {
    token: 'mock-jwt-token-123',
    user: {
      id: 'u_001',
      name: usernameOrEmail?.split('@')[0] || 'Usuario',
      email: usernameOrEmail?.includes('@') ? usernameOrEmail : `${usernameOrEmail}@arreglaya.com`,
      role: 'admin',
    }
  };
};

export default { loginRequest };


