// === Métrica: Ingresos totales por rubro ===
// GET /api/metrica/rubros/ingresos-por-categoria
export const getRubrosIngresosTotales = async (axiosInstance, { period, startDate, endDate, filters = {}, signal } = {}) => {
  if (!axiosInstance) throw new Error('Cliente HTTP no inicializado');

  // Usar el mismo mapeo de periodos y formato de fechas que el resto
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
  const formatYmd = (value) => {
    if (!value) return undefined;
    return value instanceof Date ? value.toISOString().split('T')[0] : value;
  };

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
  if (filters.rubro) params.rubro = filters.rubro;
  if (filters.zona) params.zona = filters.zona;

  const endpoint = '/api/metrica/rubros/ingresos-por-categoria';
  const response = await axiosInstance.get(endpoint, { params, signal });

  if (response.status !== 200) {
    throw new Error(`Error del servidor: ${response.status} - ${response.statusText || 'Sin statusText'}`);
  }
  if (!response.data || typeof response.data === 'string') {
    throw new Error('Respuesta inválida o sin datos');
  }

  // El backend retorna el objeto completo con total y categorias
  return response.data.data;
};
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

// === Catálogos ===

/**
 * GET /api/catalogo/rubros
 * Obtiene la lista completa de rubros/categorías
 */
export const getCatalogoRubros = async (axiosInstance, { signal } = {}) => {
  if (!axiosInstance) throw new Error('Cliente HTTP no inicializado');

  const endpoint = '/api/catalogo/rubros';

  const response = await axiosInstance.get(endpoint, { signal });

  if (response.status !== 200) {
    throw new Error(`Error del servidor: ${response.status} - ${response.statusText || 'Sin statusText'}`);
  }
  if (!response.data || typeof response.data === 'string') {
    throw new Error('Respuesta inválida o sin datos');
  }

  return {
    success: true,
    data: response.data.data || [],
    total: response.data.total || 0
  };
};

/**
 * GET /api/catalogo/zonas
 * Obtiene la lista completa de zonas (tabla prestador-zona)
 */
export const getCatalogoZonas = async (axiosInstance, { signal } = {}) => {
  if (!axiosInstance) throw new Error('Cliente HTTP no inicializado');

  const endpoint = '/api/catalogo/zonas';

  const response = await axiosInstance.get(endpoint, { signal });

  if (response.status !== 200) {
    throw new Error(`Error del servidor: ${response.status} - ${response.statusText || 'Sin statusText'}`);
  }
  if (!response.data || typeof response.data === 'string') {
    throw new Error('Respuesta inválida o sin datos');
  }

  return {
    success: true,
    data: response.data.data || [],
    total: response.data.total || 0
  };
};

/**
 * GET /api/catalogo/zonas-solicitudes
 * Obtiene las zonas REALES usadas en la tabla solicitudes (valores DISTINCT de solicitud.zona)
 * Retorna array de strings: ["Quilmes", "caba", ...]
 */
export const getCatalogoZonasSolicitudes = async (axiosInstance, { signal } = {}) => {
  if (!axiosInstance) throw new Error('Cliente HTTP no inicializado');

  const endpoint = '/api/catalogo/zonas-solicitudes';

  const response = await axiosInstance.get(endpoint, { signal });

  if (response.status !== 200) {
    throw new Error(`Error del servidor: ${response.status} - ${response.statusText || 'Sin statusText'}`);
  }
  if (!response.data || typeof response.data === 'string') {
    throw new Error('Respuesta inválida o sin datos');
  }

  // El backend retorna array de strings directamente
  const zonas = response.data.data || response.data || [];
  
  // Convertir a formato { id, nombre } para consistencia con otros filtros
  // Usamos el nombre como id ya que no tenemos un ID real
  const zonasFormateadas = zonas.map((zona, index) => ({
    id: index + 1,
    nombre: zona
  }));

  return {
    success: true,
    data: zonasFormateadas,
    total: zonasFormateadas.length
  };
};

// === Heatmap de pedidos ===
export const getCatalogOrdersHeatmap = async (axiosInstance, { period, startDate, endDate, filters = {}, signal } = {}) => {
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

  const endpoint = '/api/metrica/solicitudes/mapa-calor';

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

  const endpoint = '/api/metrica/prestadores/nuevos-registrados';

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

// === Métrica: Total de prestadores activos ===
export const getCatalogTotalActiveProviders = async (axiosInstance, { period, startDate, endDate, signal } = {}) => {
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

  const endpoint = '/api/metrica/prestadores/total-activos';

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

// === Métrica: Win Rate ===
// NOTA: Win Rate NO acepta filtros de segmentación (es una métrica general)
export const getCatalogWinRateByCategory = async (axiosInstance, { period, startDate, endDate, signal } = {}) => {
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

  // Win Rate NO acepta filtros según la documentación

  const endpoint = '/api/metrica/prestadores/win-rate-rubro';

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

// === Métrica: Distribución de servicios ===
export const getCatalogServiceDistribution = async (axiosInstance, { period, startDate, endDate, filters = {}, signal } = {}) => {
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

  const endpoint = '/api/metrica/prestadores/servicios/distribucion';

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
  
  // Convertir el objeto de distribución a formato de gráfico de torta
  const chartData = [];
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0ea5e9', '#ef4444'];
  let colorIndex = 0;
  
  for (const [name, value] of Object.entries(raw)) {
    if (name !== 'total' && typeof value === 'number') {
      chartData.push({
        name,
        value,
        color: colors[colorIndex % colors.length]
      });
      colorIndex++;
    }
  }

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return {
    success: true,
    data: {
      chartData,
      total,
      lastUpdated: new Date().toISOString()
    }
  };
};

// === Métrica: Distribución de prestadores por rubro ===
export const getCatalogServiceDistributionByCategory = async (axiosInstance, { period, startDate, endDate, filters = {}, signal } = {}) => {
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

  // Agregar filtro de zona (NO rubro, porque esta métrica ES la distribución por rubros)
  if (filters.zona) params.zona = filters.zona;

  const endpoint = '/api/metrica/prestadores/servicios/distribucion-por-rubro';

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
  
  // Convertir el objeto de distribución a formato de gráfico de torta
  const chartData = [];
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0ea5e9', '#ef4444', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];
  let colorIndex = 0;
  
  for (const [name, value] of Object.entries(raw)) {
    if (name !== 'total' && typeof value === 'number') {
      chartData.push({
        name,
        value,
        color: colors[colorIndex % colors.length]
      });
      colorIndex++;
    }
  }

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return {
    success: true,
    data: {
      chartData,
      total,
      lastUpdated: new Date().toISOString()
    }
  };
};


