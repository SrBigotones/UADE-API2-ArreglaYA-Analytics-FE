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

// Función helper para extraer datos de la respuesta
const extractResponseData = (response) => {
  return response.data.data || response.data;
};

// Función base mejorada para métricas de pagos con manejo de errores detallado
const fetchMetricsWithErrorHandling = async (axiosInstance, endpoint, period, description) => {
  try {
    const mappedPeriod = mapPeriodToBackend(period);
    console.log(`� Solicitando ${description}:`, {
      url: endpoint,
      period,
      mappedPeriod
    });

    const response = await axiosInstance.get(endpoint, {
      params: { period: mappedPeriod }
    });

    console.log('📥 Respuesta CRUDA:', {
      status: response?.status,
      statusText: response?.statusText,
      data: response?.data,
      error: response?.data?.error
    });

    if (response.status !== 200) {
      throw new Error(`Error del servidor: ${response.status} - ${response.statusText}`);
    }

    if (!response.data) {
      throw new Error('Respuesta sin datos');
    }

    const processedData = extractResponseData(response);
    console.log(`✨ Datos procesados de ${description}:`, processedData);

    return {
      success: true,
      data: processedData
    };
  } catch (error) {
    console.error(`❌ Error en ${description}:`, {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    return {
      success: false,
      error: error.message || 'Error desconocido',
      details: {
        timestamp: new Date().toISOString(),
        type: error.response ? 'response' : error.request ? 'request' : 'unknown',
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        network: {
          online: navigator.onLine,
          connection: navigator.connection?.effectiveType
        }
      }
    };
  }
};

// Servicio para tasa de éxito de pagos
export const getPaymentSuccessMetrics = (axiosInstance, { period }) => 
  fetchMetricsWithErrorHandling(axiosInstance, '/api/metrica/pagos/exitosos', period, 'tasa de éxito de pagos');

// Servicio para tiempo de procesamiento de pagos
export const getPaymentProcessingTimeMetrics = (axiosInstance, { period }) =>
  fetchMetricsWithErrorHandling(axiosInstance, '/api/metrica/pagos/tiempoprocesamiento', period, 'tiempo de procesamiento');

// Servicio para distribución de eventos de pago
export const getPaymentDistributionMetrics = (axiosInstance, { period }) =>
  fetchMetricsWithErrorHandling(axiosInstance, '/api/metrica/pagos/distribucion', period, 'distribución de pagos');