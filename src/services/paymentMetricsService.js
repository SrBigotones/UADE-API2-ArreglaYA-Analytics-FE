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
    
    const params = { period: mappedPeriod };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    console.log('📊 Solicitando métricas de pagos:', {
      url: '/api/payments/metrics',
      params,
      baseURL: axiosInstance.defaults.baseURL
    });

    const response = await axiosInstance.get('/api/payments/metrics', {
      params
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
    
    const params = { period: mappedPeriod };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    console.log('📊 Solicitando tasa de éxito de pagos:', {
      url: '/api/metrica/pagos/exitosos',
      params,
      baseURL: axiosInstance.defaults.baseURL
    });

    const response = await axiosInstance.get('/api/metrica/pagos/exitosos', {
      params
    });

    console.log('✅ Respuesta de tasa de éxito:', {
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
        changeType: response.data.changeType || 'porcentaje',
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

export const getPaymentMethodDistribution = async (axiosInstance, { startDate, endDate }) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await axiosInstance.get('/api/payments/methods/distribution', {
      params
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching payment methods distribution:', error);
    throw error;
  }
};

export const getPaymentTrends = async (axiosInstance, { startDate, endDate }) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await axiosInstance.get('/api/payments/trends', {
      params
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching payment trends:', error);
    throw error;
  }
};

export const getPaymentProcessingTimeMetrics = async (axiosInstance, { startDate, endDate, period }) => {
  try {
    const mappedPeriod = mapPeriodToBackend(period);
    
    const params = { period: mappedPeriod };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    console.log('📊 Solicitando tiempo de procesamiento de pagos:', {
      url: '/api/metrica/pagos/tiempoProcesamiento',
      params,
      baseURL: axiosInstance.defaults.baseURL
    });

    const response = await axiosInstance.get('/api/metrica/pagos/tiempoProcesamiento', {
      params
    });

    console.log('✅ Respuesta de tiempo de procesamiento:', {
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
    console.error('❌ Error en tiempo de procesamiento de pagos:', {
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

export const getPaymentDistributionMetrics = async (axiosInstance, { startDate, endDate, period }) => {
  try {
    const mappedPeriod = mapPeriodToBackend(period);
    
    const params = { period: mappedPeriod };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    console.log('📊 Solicitando distribución de eventos de pago:', {
      url: '/api/metrica/pagos/distribucion',
      params,
      baseURL: axiosInstance.defaults.baseURL
    });

    const response = await axiosInstance.get('/api/metrica/pagos/distribucion', {
      params
    });

    console.log('✅ Respuesta de distribución de eventos:', {
      status: response.status,
      headers: response.headers,
      data: response.data
    });

    // Convertir el nuevo formato a chartData
    const chartData = Object.entries(response.data).map(([name, value], index) => ({
      name: name.charAt(0) + name.slice(1).toLowerCase(), // Capitalizar
      value: Number(value),
      color: ['#22c55e', '#ef4444', '#f59e0b', '#0ea5e9'][index] || '#6b7280'
    }));

    const total = Object.values(response.data).reduce((sum, val) => sum + Number(val), 0);

    return {
      success: true,
      data: {
        chartData,
        total,
        value: total.toString(),
        change: 0, // El endpoint no devuelve cambio para gráficos
        changeStatus: 'positivo',
        lastUpdated: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('❌ Error en distribución de eventos de pago:', {
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