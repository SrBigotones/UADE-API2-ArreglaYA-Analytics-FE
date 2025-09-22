// Servicio del módulo Catálogo: mapas de calor y métricas de prestadores

// Mapeo de períodos del frontend al backend (consistente con pagos/usuarios)
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

// === Heatmap de pedidos ===
export const getCatalogOrdersHeatmap = async (axiosInstance, { period, startDate, endDate, signal } = {}) => {
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

  const endpoint = '/api/metrica/pedidos/mapa-calor';

  console.log('📤 ENVIANDO AL BACKEND - catálogo: mapa de calor de pedidos', {
    endpoint,
    params,
    originalPeriod: period,
    mappedPeriod,
    timestamp: new Date().toISOString()
  });

  const response = await axiosInstance.get(endpoint, {
    params,
    signal,
    validateStatus: status => status < 500
  });

  console.log('📥 RESPUESTA RAW BACKEND - catálogo: mapa de calor de pedidos', {
    status: response.status,
    statusText: response.statusText,
    data: response.data,
    timestamp: new Date().toISOString()
  });

  if (response.status !== 200) {
    throw new Error(`Error del servidor: ${response.status} - ${response.statusText || 'Sin statusText'}`);
  }
  if (!response.data || typeof response.data === 'string') {
    throw new Error('Respuesta inválida o sin datos');
  }

  const raw = response.data.data || response.data;
  const points = (raw.data || []).map((p) => ({ lat: p.lat, lng: p.lon, intensity: p.intensity }));

  return {
    success: true,
    data: {
      points,
      totalPoints: raw.totalPoints ?? points.length,
      period: raw.period
    }
  };
};

// === Métrica: Prestadores registrados ===
export const getCatalogProvidersRegistered = async (axiosInstance, { period, startDate, endDate, signal } = {}) => {
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

  const endpoint = '/api/metrica/prestadores/registrados';

  console.log('📤 ENVIANDO AL BACKEND - catálogo: prestadores registrados', {
    endpoint,
    params,
    originalPeriod: period,
    mappedPeriod,
    timestamp: new Date().toISOString()
  });

  const response = await axiosInstance.get(endpoint, {
    params,
    signal,
    validateStatus: status => status < 500
  });

  console.log('📥 RESPUESTA RAW BACKEND - catálogo: prestadores registrados', {
    status: response.status,
    statusText: response.statusText,
    data: response.data,
    timestamp: new Date().toISOString()
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
      lastUpdated: new Date().toISOString()
    }
  };
};


