// Servicio del módulo App de Búsqueda y Solicitudes

// Mapeo de períodos del frontend al backend (consistente con catálogo/pagos)
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

// Formatea fechas YYYY-MM-DD si vienen como Date
const formatYmd = (value) => {
  if (!value) return undefined;
  return value instanceof Date ? value.toISOString().split('T')[0] : value;
};

// === Métrica: Solicitudes creadas (Volumen de demanda) ===
export const getAppRequestsCreated = async (axiosInstance, { period, startDate, endDate, filters = {}, signal } = {}) => {
  if (!axiosInstance) throw new Error('Cliente HTTP no inicializado');

    const mappedPeriod = mapPeriodToBackend(period);
    const params = { period: mappedPeriod };
  if (mappedPeriod === 'personalizado') {
    const start = formatYmd(startDate);
    const end = formatYmd(endDate);
    if (start && end) {
      params.startDate = start;
      params.endDate = end;
    }
  }

  // Agregar filtros de segmentación (rubro, zona, tipoSolicitud)
  if (filters.rubro) params.rubro = filters.rubro;
  if (filters.zona) params.zona = filters.zona;
  if (filters.tipoSolicitud) params.tipoSolicitud = filters.tipoSolicitud;

  const endpoint = '/api/metrica/solicitudes/volumen';

    const response = await axiosInstance.get(endpoint, {
    params,
    signal,
    });

    if (response.status !== 200) {
    throw new Error(`Error del servidor: ${response.status} - ${response.statusText || 'Sin statusText'}`);
    }
  if (!response.data || typeof response.data === 'string') {
    throw new Error('Respuesta inválida o sin datos');
    }

  const raw = response.data.data || response.data;
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

// === Métrica: Tasa de cancelación ===
export const getAppCancellationRate = async (axiosInstance, { period, startDate, endDate, filters = {}, signal } = {}) => {
  if (!axiosInstance) throw new Error('Cliente HTTP no inicializado');

  const mappedPeriod = mapPeriodToBackend(period);
  const params = { period: mappedPeriod };
  if (mappedPeriod === 'personalizado') {
    const start = formatYmd(startDate);
    const end = formatYmd(endDate);
    if (start && end) {
      params.startDate = start;
      params.endDate = end;
    }
  }

  // Agregar filtros de segmentación (rubro, zona, tipoSolicitud)
  if (filters.rubro) params.rubro = filters.rubro;
  if (filters.zona) params.zona = filters.zona;
  if (filters.tipoSolicitud) params.tipoSolicitud = filters.tipoSolicitud;

  const endpoint = '/api/metrica/solicitudes/tasa-cancelacion';

  const response = await axiosInstance.get(endpoint, {
    params,
    signal,
  });

  if (response.status !== 200) {
    throw new Error(`Error del servidor: ${response.status} - ${response.statusText || 'Sin statusText'}`);
  }
  if (!response.data || typeof response.data === 'string') {
    throw new Error('Respuesta inválida o sin datos');
  }

  const raw = response.data.data || response.data;
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

// === Métrica: Tiempo a primera cotización ===
// NOTA: El backend devuelve el valor en MINUTOS, pero se muestra en HORAS
export const getAppTimeToFirstQuote = async (axiosInstance, { period, startDate, endDate, filters = {}, signal } = {}) => {
  if (!axiosInstance) throw new Error('Cliente HTTP no inicializado');

  const mappedPeriod = mapPeriodToBackend(period);
  const params = { period: mappedPeriod };
  if (mappedPeriod === 'personalizado') {
    const start = formatYmd(startDate);
    const end = formatYmd(endDate);
    if (start && end) {
      params.startDate = start;
      params.endDate = end;
    }
  }

  // Agregar filtros de segmentación (rubro, zona, tipoSolicitud)
  if (filters.rubro) params.rubro = filters.rubro;
  if (filters.zona) params.zona = filters.zona;
  if (filters.tipoSolicitud) params.tipoSolicitud = filters.tipoSolicitud;

  const endpoint = '/api/metrica/solicitudes/tiempo-primera-cotizacion';

  const response = await axiosInstance.get(endpoint, {
    params,
    signal,
  });

  if (response.status !== 200) {
    throw new Error(`Error del servidor: ${response.status} - ${response.statusText || 'Sin statusText'}`);
  }
  if (!response.data || typeof response.data === 'string') {
    throw new Error('Respuesta inválida o sin datos');
  }

  const raw = response.data.data || response.data;
  
      // Convertir de minutos a horas
  const valueInMinutes = raw.value ?? 0;
  const changeInMinutes = raw.change ?? 0;
      const valueInHours = (valueInMinutes / 60).toFixed(1);
      const changeInHours = (changeInMinutes / 60).toFixed(1);
      
      // Convertir chartData de minutos a horas también
      const chartDataInHours = (raw.chartData || []).map(point => ({
        ...point,
        value: point.value ? parseFloat((point.value / 60).toFixed(1)) : 0
      }));
      
      return {
        success: true,
        data: {
          value: parseFloat(valueInHours),
          change: parseFloat(changeInHours),
      changeType: raw.changeType || 'absoluto',
      changeStatus: raw.changeStatus || 'neutral',
          originalValueMinutes: valueInMinutes,
      originalChangeMinutes: changeInMinutes,
          chartData: chartDataInHours,
      lastUpdated: new Date().toISOString()
    }
  };
};

// === Métrica: Conversión a cotización aceptada ===
export const getAppQuoteConversionRate = async (axiosInstance, { period, startDate, endDate, filters = {}, signal } = {}) => {
  if (!axiosInstance) throw new Error('Cliente HTTP no inicializado');

  const mappedPeriod = mapPeriodToBackend(period);
  const params = { period: mappedPeriod };
  if (mappedPeriod === 'personalizado') {
    const start = formatYmd(startDate);
    const end = formatYmd(endDate);
    if (start && end) {
      params.startDate = start;
      params.endDate = end;
    }
  }

  // Agregar filtros de segmentación (rubro, zona, tipoSolicitud)
  if (filters.rubro) params.rubro = filters.rubro;
  if (filters.zona) params.zona = filters.zona;
  if (filters.tipoSolicitud) params.tipoSolicitud = filters.tipoSolicitud;

  const endpoint = '/api/metrica/matching/cotizaciones/conversion-aceptada';

  const response = await axiosInstance.get(endpoint, {
    params,
    signal,
  });

  if (response.status !== 200) {
    throw new Error(`Error del servidor: ${response.status} - ${response.statusText || 'Sin statusText'}`);
  }
  if (!response.data || typeof response.data === 'string') {
    throw new Error('Respuesta inválida o sin datos');
  }

  const raw = response.data.data || response.data;
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

