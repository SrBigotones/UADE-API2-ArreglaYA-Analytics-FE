// Servicio para métricas de pagos
export const getPaymentsByDateRange = async (axiosInstance, { startDate, endDate }) => {
  try {
    const response = await axiosInstance.get('/api/payments/metrics', {
      params: { startDate, endDate }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching payment metrics:', error);
    throw error;
  }
};

export const getPaymentMethodDistribution = async (axiosInstance, { startDate, endDate }) => {
  try {
    const response = await axiosInstance.get('/api/payments/methods/distribution', {
      params: { startDate, endDate }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching payment methods distribution:', error);
    throw error;
  }
};

export const getPaymentTrends = async (axiosInstance, { startDate, endDate }) => {
  try {
    const response = await axiosInstance.get('/api/payments/trends', {
      params: { startDate, endDate }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching payment trends:', error);
    throw error;
  }
};