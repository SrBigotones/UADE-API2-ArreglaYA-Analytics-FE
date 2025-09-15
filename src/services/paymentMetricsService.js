// Mapeo de períodos del frontend al backend
const mapPeriodToBackend = (frontendPeriod) => {
  const periodMap = {
    'today': 'hoy',
    'last7': 'ultimos_7_dias',
    'last30': 'ultimos_30_dias',
    'lastYear': 'ultimo_ano',
    'custom': 'personalizado'
  };
  return periodMap[frontendPeriod] || 'personalizado';
};

// Servicio para métricas de pagos
export const getPaymentsByDateRange = async (axiosInstance, { startDate, endDate, period }) => {
  try {
    const mappedPeriod = mapPeriodToBackend(period);
    console.log('📊 Solicitando métricas de pagos:', {
      url: '/api/payments/metrics',
      params: { startDate, endDate, period: mappedPeriod },
      baseURL: axiosInstance.defaults.baseURL
    });

    const response = await axiosInstance.get('/api/payments/metrics', {
      params: { startDate, endDate, period: mappedPeriod }
    });

    console.log('✅ Respuesta recibida:', {
      status: response.status,
      headers: response.headers,
      data: response.data
    });

    return response.data;
  } catch (error) {
    console.error('❌ Error en métricas de pagos:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        headers: error.config?.headers,
        params: error.config?.params
      }
    });
    throw error;
  }
};

export const getPaymentSuccessMetrics = async (axiosInstance, { startDate, endDate, period }) => {
  try {
    const mappedPeriod = mapPeriodToBackend(period);
    console.log('📊 Solicitando tasa de éxito de pagos:', {
      url: '/api/metrica/pagos/exitosos',
      params: { startDate, endDate, period: mappedPeriod },
      baseURL: axiosInstance.defaults.baseURL
    });

    const response = await axiosInstance.get('/api/metrica/pagos/exitosos', {
      params: { startDate, endDate, period: mappedPeriod }
    });

    console.log('✅ Respuesta de tasa de éxito:', {
      status: response.status,
      headers: response.headers,
      data: response.data
    });

    return {
      success: true,
      data: {
        value: response.data.successRate || 0,
        change: response.data.changePercentage || 0,
        changeStatus: response.data.trend || 'neutral',
        lastUpdated: response.data.lastUpdated || new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('❌ Error en tasa de éxito de pagos:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        headers: error.config?.headers,
        params: error.config?.params
      }
    });
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