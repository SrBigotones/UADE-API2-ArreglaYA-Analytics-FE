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

// Servicio base para métricas de pagos
const fetchMetrics = async (axiosInstance, endpoint, period, description) => {
  try {
    const mappedPeriod = mapPeriodToBackend(period);
    console.log(`📊 Solicitando ${description}:`, {
      url: endpoint,
      params: { period: mappedPeriod }
    });

    const response = await axiosInstance.get(endpoint, {
      params: { period: mappedPeriod }
    });

    const responseData = extractResponseData(response);
    console.log(`✨ Datos procesados de ${description}:`, responseData);
    
    return responseData;
  } catch (error) {
    console.error(`❌ Error en ${description}:`, error);
    throw error;
  }
};

// Servicio para tasa de éxito de pagos
export const getPaymentSuccessMetrics = (axiosInstance, { period }) => 
  fetchMetrics(axiosInstance, '/api/metrica/pagos/exitosos', period, 'tasa de éxito de pagos');

// Servicio para métricas de distribución de pagos
export const getPaymentDistributionMetrics = (axiosInstance, { period }) => 
  fetchMetrics(axiosInstance, '/api/metrica/pagos/distribucion', period, 'distribución de pagos');

// Servicio para tiempo de procesamiento de pagos
export const getPaymentProcessingTimeMetrics = (axiosInstance, { period }) => 
  fetchMetrics(axiosInstance, '/api/metrica/pagos/tiempoprocesamiento', period, 'tiempo de procesamiento');

// Servicio para tiempo de procesamiento de pagos
export const getPaymentProcessingTimeMetrics = async (axiosInstance, { period }) => {
  try {
    console.log('🚀 Enviando request:', { 
      url: '/api/metrica/pagos/tiempoprocesamiento',
      period,
      mappedPeriod: mapPeriodToBackend(period)
    });

    const response = await axiosInstance.get('/api/metrica/pagos/tiempoprocesamiento', {
      params: { period: mapPeriodToBackend(period) }
    });

    // Log directo de la respuesta cruda
    console.log('📥 Respuesta CRUDA:', {
      status: response?.status,
      statusText: response?.statusText,
      data: response?.data,
      error: response?.data?.error
    });

    if (response.status !== 200) {
      throw new Error(`Error del servidor: ${response.status} ${response.statusText} - ${JSON.stringify(response.data)}`);
    }

    if (response.status !== 200) {
      throw new Error(`Error del servidor: ${response.status} - ${response.statusText}`);
    }

    if (!response.data) {
      throw new Error('Respuesta sin datos');
    }

    return {
      success: true,
      data: {
        value: response.data.value || 0,
        change: response.data.change || 0,
        changeStatus: response.data.changeStatus || 'neutral',
        lastUpdated: response.data.lastUpdated || new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('❌ Error en el servicio:', {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    if (error.name === 'AbortError') {
      return {
        success: false,
        error: 'Solicitud cancelada',
        details: {
          timestamp: new Date().toISOString(),
          type: 'abort'
        }
      };
    }

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

// Servicio para distribución de eventos de pago
export const getPaymentDistributionMetrics = async (axiosInstance, { period }) => {
  try {
    console.log('🚀 Enviando request:', {
      url: '/api/metrica/pagos/distribucion',
      period,
      mappedPeriod: mapPeriodToBackend(period)
    });

    const response = await axiosInstance.get('/api/metrica/pagos/distribucion', {
      params: { period: mapPeriodToBackend(period) }
    });

    // Log directo de la respuesta cruda
    console.log('📥 Respuesta CRUDA:', {
      status: response?.status,
      statusText: response?.statusText,
      data: response?.data,
      error: response?.data?.error
    });

    // Log detallado de la respuesta
    console.log('🔍 Respuesta detallada (distribución eventos):', {
      timestamp: new Date().toISOString(),
      request: {
        url: response.config.url,
        method: response.config.method,
        baseURL: response.config.baseURL,
        params: response.config.params,
        headers: response.config.headers
      },
      response: {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
        size: JSON.stringify(response.data).length
      }
    });

    if (response.status !== 200) {
      throw new Error(`Error del servidor: ${response.status} - ${response.statusText}`);
    }

    if (!response.data) {
      throw new Error('Respuesta sin datos');
    }

    return {
      success: true,
      data: {
        distributions: response.data.distributions || [],
        lastUpdated: response.data.lastUpdated || new Date().toISOString()
      }
    };
  } catch (error) {
    // Log detallado del error
    console.error('❌ Error detallado en distribución de eventos:', {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack
      },
      request: error.config && {
        method: error.config.method,
        url: error.config.url,
        baseURL: error.config.baseURL,
        params: error.config.params,
        headers: error.config.headers,
        timeout: error.config.timeout
      },
      response: error.response && {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
        data: error.response.data
      },
      network: {
        online: navigator.onLine,
        connection: navigator.connection ? {
          type: navigator.connection.effectiveType,
          downlink: navigator.connection.downlink
        } : null
      }
    });

    if (error.name === 'AbortError') {
      return {
        success: false,
        error: 'Solicitud cancelada',
        details: {
          timestamp: new Date().toISOString(),
          type: 'abort'
        }
      };
    }

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