const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://btrjvjnsu4.execute-api.us-east-1.amazonaws.com/';

export const config = {
    API_BASE_URL,
};

console.log('Config API:', { API_BASE_URL });

export default config;