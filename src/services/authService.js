import axios from 'axios';
import config from '../config/api.js';

// Simple auth service for login
export const loginRequest = async ({ email, password }) => {
  const url = `${config.API_BASE_URL}api/auth/login`;
  const response = await axios.post(url, {
    email,
    password,
  }, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
  });
  return response.data; // expected to contain token/JWT
};

export default { loginRequest };


