export const saveToken = async (token) => {
  try {
    localStorage.setItem('jwt', token);
  } catch (error) {
    console.error('Error al guardar el token:', error);
  }
};

export const getToken = async () => {
  try {
    return localStorage.getItem('jwt');
  } catch (error) {
    console.error('Error al obtener el token:', error);
    return null;
  }
};

export const removeToken = async () => {
  try {
    localStorage.removeItem('jwt');
  } catch (error) {
    console.error('Error al eliminar el token:', error);
  }
};