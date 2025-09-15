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

<<<<<<< Updated upstream
// Servicio para métricas de pagos
export const getPaymentsByDateRange = async (axiosInstance, { startDate, endDate, period }) => {
  try {
    const mappedPeriod = mapPeriodToBackend(period);
    
    const params = { period: mappedPeriod };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await axiosInstance.get('/api/payments/metrics', {
      params
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
=======
// Función helper para extraer y transformar datos de la respuesta
const extractResponseData = (response, endpoint) => {
  const rawData = response.data.data || response.data;
  
  // Si es la métrica de distribución, transformar a formato para gráfico de torta
  if (endpoint.includes('/distribucion')) {
    const chartData = Object.entries(rawData).map(([name, value]) => ({
      name,
      value,
      color: getStatusColor(name)
    }));

    // Calcular el total para la métrica
    const total = chartData.reduce((sum, item) => sum + item.value, 0);

    return {
      chartData,
      total,
      success: true
    };
  }
  
  return rawData;
};

// Helper para asignar colores según el estado
const getStatusColor = (status) => {
  const colors = {
    APROBADO: '#22c55e',   // Verde
    RECHAZADO: '#ef4444',  // Rojo
    PENDIENTE: '#f59e0b',  // Amarillo
    EXPIRADO: '#6b7280'    // Gris
  };
  return colors[status] || '#0ea5e9'; // Color por defecto
};

// Función base mejorada para métricas de pagos con manejo de errores detallado
const fetchMetricsWithErrorHandling = async (axiosInstance, endpoint, period, description, { startDate, endDate } = {}) => {
  try {
    const mappedPeriod = mapPeriodToBackend(period);
    
    // Preparar parámetros base
    const params = { period: mappedPeriod };
    
    // Agregar fechas si es período personalizado
    if (mappedPeriod === 'personalizado' && startDate && endDate) {
      // Formatear fechas como strings YYYY-MM-DD
      params.startDate = startDate instanceof Date ? startDate.toISOString().split('T')[0] : startDate;
      params.endDate = endDate instanceof Date ? endDate.toISOString().split('T')[0] : endDate;
    }

    // Console log de la consulta que se envía al backend
    console.log(`📤 ENVIANDO AL BACKEND - ${description}:`, {
      endpoint,
      params,
      originalPeriod: period,
      mappedPeriod,
      timestamp: new Date().toISOString()
    });

    const response = await axiosInstance.get(endpoint, {
      params
>>>>>>> Stashed changes
    });
    throw error;
  }
};

<<<<<<< Updated upstream
export const getPaymentSuccessMetrics = async (axiosInstance, { startDate, endDate, period }) => {
  try {
    const mappedPeriod = mapPeriodToBackend(period);
    
    const params = { period: mappedPeriod };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await axiosInstance.get('/api/metrica/pagos/exitosos', {
      params
    });

=======
    // Console log de la respuesta raw del backend
    console.log(`📥 RESPUESTA RAW BACKEND - ${description}:`, {
      endpoint,
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers,
      timestamp: new Date().toISOString()
    });

    if (response.status !== 200) {
      throw new Error(`Error del servidor: ${response.status} - ${response.statusText}`);
    }

    if (!response.data) {
      throw new Error('Respuesta sin datos');
    }

    const processedData = extractResponseData(response, endpoint);

>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
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
=======
    return {
      success: false,
      message: error.response?.data?.message || error.message,
      error: error.response?.data?.error || error.message,
      status: error.response?.status || 500,
      details: {
        timestamp: new Date().toISOString(),
        endpoint,
        period,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
>>>>>>> Stashed changes
      }
    };
  }
};

<<<<<<< Updated upstream
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
    
    const response = await axiosInstance.get('/api/metrica/pagos/tiempoProcesamiento', {
      params
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
    
    const response = await axiosInstance.get('/api/metrica/pagos/distribucion', {
      params
    });

    // Convertir el nuevo formato a chartData
    const distributionData = response.data.data; // Acceder a response.data.data
    // Asignar colores específicos por categoría
    const colorMap = {
      'APROBADO': '#22c55e',   // Verde - exitoso
      'RECHAZADO': '#ef4444',  // Rojo - error
      'EXPIRADO': '#f59e0b',   // Amarillo - advertencia  
      'PENDIENTE': '#0ea5e9'   // Azul - en proceso
    };

    let chartData = Object.entries(distributionData).map(([name, value]) => ({
      name: name.charAt(0) + name.slice(1).toLowerCase(), // "APROBADO" → "Aprobado"
      value: Number(value),
      color: colorMap[name] || '#6b7280' // Color por defecto si no se encuentra
    }));

    const total = Object.values(distributionData).reduce((sum, val) => sum + Number(val), 0);
    
    // Si todos los valores son 0, mostrar un mensaje especial o datos por defecto
    if (total === 0) {
      chartData = [
        { name: 'Sin datos', value: 1, color: '#e5e7eb' } // Gris claro para indicar "sin datos"
      ];
    }

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
=======
// Servicio para tasa de éxito de pagos
export const getPaymentSuccessMetrics = (axiosInstance, { period, startDate, endDate }) => 
  fetchMetricsWithErrorHandling(axiosInstance, '/api/metrica/pagos/exitosos', period, 'tasa de éxito de pagos', { startDate, endDate });

// Servicio para tiempo de procesamiento de pagos
export const getPaymentProcessingTimeMetrics = (axiosInstance, { period, startDate, endDate }) =>
  fetchMetricsWithErrorHandling(axiosInstance, '/api/metrica/pagos/tiempoprocesamiento', period, 'tiempo de procesamiento', { startDate, endDate });

// Servicio para distribución de eventos de pago
export const getPaymentDistributionMetrics = (axiosInstance, { period, startDate, endDate }) =>
  fetchMetricsWithErrorHandling(axiosInstance, '/api/metrica/pagos/distribucion', period, 'distribución de pagos', { startDate, endDate });
>>>>>>> Stashed changes
