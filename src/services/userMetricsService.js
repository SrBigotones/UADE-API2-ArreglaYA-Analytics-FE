// Servicio para métricas de usuarios

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
export const getUsersByDateRange = async (axiosInstance, { startDate, endDate }) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await axiosInstance.get('/api/users/metrics', {
      params
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user metrics:', error);
    throw error;
  }
};

export const getUserActivityDistribution = async (axiosInstance, { startDate, endDate }) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await axiosInstance.get('/api/users/activity/distribution', {
      params
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user activity distribution:', error);
    throw error;
  }
};

export const getUserGrowthTrends = async (axiosInstance, { startDate, endDate }) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await axiosInstance.get('/api/users/growth', {
      params
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user growth trends:', error);
    throw error;
  }
};

export const getUsersCreatedMetrics = async (axiosInstance, { startDate, endDate, period }) => {
  try {
    const mappedPeriod = mapPeriodToBackend(period);
    
    // Construir parámetros solo con los valores definidos
    const params = { period: mappedPeriod };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    console.log('📊 Solicitando nuevos usuarios registrados:', {
      url: '/api/metrica/usuarios/creados',
      params,
      baseURL: axiosInstance.defaults.baseURL
    });

    const response = await axiosInstance.get('/api/metrica/usuarios/creados', {
      params
    });

    console.log('✅ Respuesta de usuarios creados:', {
      status: response.status,
      headers: response.headers,
      data: response.data
    });

    return {
      success: true,
      data: {
        value: response.data.value || 0,
        change: response.data.change || 0,
        changeStatus: response.data.changeStatus || 'positivo',
        changeType: response.data.changeType || 'absoluto',
        lastUpdated: response.data.lastUpdated || new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('❌ Error DETALLADO en usuarios creados:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        fullURL: `${error.config?.baseURL}${error.config?.url}`,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        headers: error.config?.headers,
        params: error.config?.params
      },
      request: {
        readyState: error.request?.readyState,
        status: error.request?.status,
        responseURL: error.request?.responseURL
      }
    });
    
    // En lugar de hacer throw, devolvemos un error controlado
    return {
      success: false,
      error: {
        message: error.response?.data?.message || error.message || 'Servicio no disponible',
        status: error.response?.status,
        timestamp: new Date().toISOString()
      }
    };
  }
};