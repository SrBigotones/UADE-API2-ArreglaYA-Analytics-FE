/*
 * Servicios para métricas de pagos
 * (rama: feature/avances)
 * Cada servicio usa una función base con manejo de errores y mapeo de períodos/fechas.
 */

// Mapeo de períodos del frontend al backend
const mapPeriodToBackend = (frontendPeriod) => {
  const periodMap = {
    today: 'hoy',
    last7: 'ultimos_7_dias',
    last30: 'ultimos_30_dias',
    lastYear: 'ultimo_ano',
    custom: 'personalizado',
  };
  return periodMap[frontendPeriod] || 'personalizado';
};

// Helper: color por estado de pago
const getStatusColor = (status) => {
  const colors = {
    APROBADO: '#22c55e',   // Verde
    RECHAZADO: '#ef4444',  // Rojo
    PENDIENTE: '#f59e0b',  // Amarillo
    EXPIRADO: '#6b7280',   // Gris
  };
  return colors[status] || '#0ea5e9'; // Por defecto: azul
};

// Helper: extraer/transformar datos según endpoint
const extractResponseData = (response, endpoint) => {
  const rawData = response.data?.data || response.data;

  // Para distribución (torta)
  if (endpoint.includes('/distribucion')) {
    const chartData = Object.entries(rawData).map(([name, value]) => ({
      name,
      value: Number(value),
      color: getStatusColor(name),
    }));

    const total = chartData.reduce((sum, item) => sum + item.value, 0);

    return {
      chartData,
      total,
      success: true,
    };
  }

  // Para métricas "simples" (valor/cambio/estado)
  return rawData;
};

// Base: request con mapeo de período y fechas + manejo de errores
const fetchMetricsWithErrorHandling = async (
  axiosInstance,
  endpoint,
  period,
  description,
  { startDate, endDate } = {}
) => {
  try {
    const mappedPeriod = mapPeriodToBackend(period);

    // Params base
    const params = { period: mappedPeriod };

    // Si es personalizado y hay fechas, formatear YYYY-MM-DD
    if (mappedPeriod === 'personalizado' && startDate && endDate) {
      params.startDate =
        startDate instanceof Date ? startDate.toISOString().split('T')[0] : startDate;
      params.endDate =
        endDate instanceof Date ? endDate.toISOString().split('T')[0] : endDate;
    }

    // Log de salida
    console.log(`📤 ENVIANDO AL BACKEND - ${description}:`, {
      endpoint,
      params,
      originalPeriod: period,
      mappedPeriod,
      timestamp: new Date().toISOString(),
    });

    const response = await axiosInstance.get(endpoint, { params });

    // Log de entrada
    console.log(`📥 RESPUESTA RAW BACKEND - ${description}:`, {
      endpoint,
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers,
      timestamp: new Date().toISOString(),
    });

    if (response.status !== 200) {
      throw new Error(`Error del servidor: ${response.status} - ${response.statusText}`);
    }
    if (!response.data) {
      throw new Error('Respuesta sin datos');
    }

    const processedData = extractResponseData(response, endpoint);

    console.log(`✨ Datos procesados de ${description}:`, processedData);

    return {
      success: true,
      data: processedData,
    };
  } catch (error) {
    console.error(`❌ Error en ${description}:`, {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    // Abort/cancelación
    if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
      return {
        success: false,
        error: 'Solicitud cancelada',
        details: { timestamp: new Date().toISOString(), type: 'abort' },
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
          online: typeof navigator !== 'undefined' ? navigator.onLine : undefined,
          connection:
            typeof navigator !== 'undefined' ? navigator.connection?.effectiveType : undefined,
        },
      },
    };
  }
};

/* ===========================
 * Servicios expuestos (avances)
 * ===========================
 */

// Agregado genérico por rango para listados/agrupados
export const getPaymentsByDateRange = async (axiosInstance, { startDate, endDate, period }) => {
  try {
    const mappedPeriod = mapPeriodToBackend(period);
    const params = { period: mappedPeriod };

    if (mappedPeriod === 'personalizado') {
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
    }

    const response = await axiosInstance.get('/api/payments/metrics', { params });

    if (response.status !== 200) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error('❌ Error en métricas de pagos:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    return { success: false, error: error.message || 'Error desconocido' };
  }
};

// Tasa de éxito de pagos (card)
export const getPaymentSuccessMetrics = (axiosInstance, { period, startDate, endDate }) =>
  fetchMetricsWithErrorHandling(
    axiosInstance,
    '/api/metrica/pagos/exitosos',
    period,
    'tasa de éxito de pagos',
    { startDate, endDate }
  );

// Tiempo de procesamiento de pagos (card)
export const getPaymentProcessingTimeMetrics = (axiosInstance, { period, startDate, endDate }) =>
  fetchMetricsWithErrorHandling(
    axiosInstance,
    '/api/metrica/pagos/tiempoProcesamiento',
    period,
    'tiempo de procesamiento',
    { startDate, endDate }
  );

// Distribución de eventos de pago (pie)
export const getPaymentDistributionMetrics = (axiosInstance, { period, startDate, endDate }) =>
  fetchMetricsWithErrorHandling(
    axiosInstance,
    '/api/metrica/pagos/distribucion',
    period,
    'distribución de pagos',
    { startDate, endDate }
  );
