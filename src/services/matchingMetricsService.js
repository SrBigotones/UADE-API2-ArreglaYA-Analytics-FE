/* 
 * Servicios para métricas de matching y agenda
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

// Helper para formatear fecha a YYYY-MM-DD
const formatDateYmd = (date) => {
  if (!date) return undefined;
  if (date instanceof Date) return date.toISOString().split('T')[0];
  return date;
};

// Función base para servicios de matching
const fetchMatchingMetricsWithErrorHandling = async (axiosInstance, endpoint, period, description, { startDate, endDate, filters = {} } = {}) => {
  try {
    const mappedPeriod = mapPeriodToBackend(period);
    
    const params = { period: mappedPeriod };
    if (mappedPeriod === 'personalizado' && startDate && endDate) {
      params.startDate = formatDateYmd(startDate);
      params.endDate = formatDateYmd(endDate);
    }

    // Agregar filtros de segmentación (rubro, zona, tipoSolicitud)
    if (filters.rubro) params.rubro = filters.rubro;
    if (filters.zona) params.zona = filters.zona;
    if (filters.tipoSolicitud) params.tipoSolicitud = filters.tipoSolicitud;

    const response = await axiosInstance.get(endpoint, {
      params,
    });

    if (response.status !== 200) {
      throw new Error(`Error del servidor: ${response.status} - ${response.statusText}`);
    }

    if (!response.data) {
      throw new Error('Respuesta sin datos');
    }

    const rawData = response.data.data || response.data;

    return {
      success: true,
      data: rawData
    };
  } catch (error) {
    if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
      return {
        success: false,
        error: 'Solicitud cancelada'
      };
    }

    return {
      success: false,
      message: error.response?.data?.message || error.message,
      error: error.response?.data?.error || error.message,
      status: error.response?.status || 500
    };
  }
};

// Servicio para tiempo promedio de matching
export const getMatchingAverageTimeMetrics = async (axiosInstance, { startDate, endDate, period, filters = {} } = {}) => {
  const result = await fetchMatchingMetricsWithErrorHandling(
    axiosInstance,
    '/api/metrica/matching/tiempo-promedio',
    period,
    'tiempo promedio de matching',
    { startDate, endDate, filters }
  );

  if (!result.success) {
    return result;
  }

  const raw = result.data;
  return {
    success: true,
    data: {
      value: raw.value ?? 0,
      change: raw.change ?? 0,
      changeType: raw.changeType || 'absoluto',
      changeStatus: raw.changeStatus || 'neutral',
      chartData: raw.chartData || [],
      lastUpdated: new Date().toISOString()
    }
  };
};

// Servicio para cotizaciones pendientes
export const getMatchingPendingQuotesMetrics = async (axiosInstance, { startDate, endDate, period, filters = {} } = {}) => {
  const result = await fetchMatchingMetricsWithErrorHandling(
    axiosInstance,
    '/api/metrica/matching/cotizaciones/pendientes',
    period,
    'cotizaciones pendientes',
    { startDate, endDate, filters }
  );

  if (!result.success) {
    return result;
  }

  const raw = result.data;
  return {
    success: true,
    data: {
      value: raw.value ?? 0,
      change: raw.change ?? 0,
      changeType: raw.changeType || 'porcentaje',
      changeStatus: raw.changeStatus || 'neutral',
      chartData: raw.chartData || [],
      lastUpdated: new Date().toISOString()
    }
  };
};

// Servicio para tiempo de respuesta del prestador
export const getMatchingProviderResponseTimeMetrics = async (axiosInstance, { startDate, endDate, period, filters = {} } = {}) => {
  const result = await fetchMatchingMetricsWithErrorHandling(
    axiosInstance,
    '/api/metrica/matching/prestadores/tiempo-respuesta',
    period,
    'tiempo de respuesta del prestador',
    { startDate, endDate, filters }
  );

  if (!result.success) {
    return result;
  }

  const raw = result.data;
  return {
    success: true,
    data: {
      value: raw.value ?? 0,
      change: raw.change ?? 0,
      changeType: raw.changeType || 'absoluto',
      changeStatus: raw.changeStatus || 'neutral',
      chartData: raw.chartData || [],
      lastUpdated: new Date().toISOString()
    }
  };
};

