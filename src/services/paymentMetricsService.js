/* 
 * Servicios para métricas de pagos
 * Cada servicio utiliza la función base fetchMetrics para consistencia
 */

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
    });

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

    return {
      success: true,
      data: processedData
    };
  } catch (error) {
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
      }
    };
  }
};

// Servicio para tasa de éxito de pagos
export const getPaymentSuccessMetrics = (axiosInstance, { period, startDate, endDate }) => 
  fetchMetricsWithErrorHandling(axiosInstance, '/api/metrica/pagos/exitosos', period, 'tasa de éxito de pagos', { startDate, endDate });

// Servicio para tiempo de procesamiento de pagos
export const getPaymentProcessingTimeMetrics = (axiosInstance, { period, startDate, endDate }) =>
  fetchMetricsWithErrorHandling(axiosInstance, '/api/metrica/pagos/tiempoprocesamiento', period, 'tiempo de procesamiento', { startDate, endDate });

// Servicio para distribución de eventos de pago
export const getPaymentDistributionMetrics = (axiosInstance, { period, startDate, endDate }) =>
  fetchMetricsWithErrorHandling(axiosInstance, '/api/metrica/pagos/distribucion', period, 'distribución de pagos', { startDate, endDate });
