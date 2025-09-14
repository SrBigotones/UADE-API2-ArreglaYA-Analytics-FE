// Servicio para métricas de usuarios
export const getUsersByDateRange = async (axiosInstance, { startDate, endDate }) => {
  try {
    const response = await axiosInstance.get('/api/users/metrics', {
      params: { startDate, endDate }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user metrics:', error);
    throw error;
  }
};

export const getUserActivityDistribution = async (axiosInstance, { startDate, endDate }) => {
  try {
    const response = await axiosInstance.get('/api/users/activity/distribution', {
      params: { startDate, endDate }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user activity distribution:', error);
    throw error;
  }
};

export const getUserGrowthTrends = async (axiosInstance, { startDate, endDate }) => {
  try {
    const response = await axiosInstance.get('/api/users/growth', {
      params: { startDate, endDate }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user growth trends:', error);
    throw error;
  }
};