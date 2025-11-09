// Servicio para métricas de usuarios
export const getUserMetrics = async (axiosInstance, { startDate, endDate, period }) => {
  if (!axiosInstance) {
    throw new Error('Cliente HTTP no inicializado');
  }

  try {
    const response = await axiosInstance.get('/api/metrica/usuarios/creados', {
      params: { startDate, endDate, period },
      validateStatus: status => status < 500
    });

    // Validar la respuesta
    if (response.status !== 200) {
      throw new Error(`Error del servidor: ${response.status} - ${response.statusText}`);
    }

    if (!response.data) {
      throw new Error('Respuesta sin datos');
    }


    // Asegurar el formato correcto de la respuesta y manejar la estructura anidada
    const responseData = response.data.data || response.data;
    return {
      success: true,
      data: {
        value: responseData.value || 0,
        change: responseData.change || 0,
        changeType: responseData.changeType || 'valor',
        changeStatus: responseData.changeStatus || 'neutral',
        lastUpdated: responseData.lastUpdated || new Date().toISOString()
      }
    };
  } catch (error) {
    // Ignorar errores de cancelación
    if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
      return {
        success: false,
        error: 'Solicitud cancelada'
      };
    }

    // Log detallado del error
    console.error('❌ Error en métricas de usuarios:', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      response: error.response && {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      },
      request: error.request && {
        method: error.request._currentRequest?.method,
        path: error.request._currentRequest?.path,
        host: error.request._currentRequest?.host,
        protocol: error.request._currentRequest?.protocol
      },
      config: error.config && {
        url: error.config.url,
        method: error.config.method,
        baseURL: error.config.baseURL,
        headers: error.config.headers,
        params: error.config.params,
        timeout: error.config.timeout
      }
    });

    // Determinar mensaje de error específico
    let errorMessage = 'Error desconocido';
    let errorDetails = {};
    
    if (error.response) {
      errorMessage = `Error ${error.response.status}: ${error.response.data?.message || error.response.statusText || 'Error del servidor'}`;
      errorDetails = {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      };
    } else if (error.request) {
      errorMessage = 'No se pudo conectar con el servidor';
      errorDetails = {
        method: error.request._currentRequest?.method,
        url: error.request._currentRequest?.path,
        host: error.request._currentRequest?.host
      };
    } else if (error.message) {
      errorMessage = error.message;
      errorDetails = { stack: error.stack };
    }

    return {
      success: false,
      error: errorMessage,
      details: errorDetails,
      originalError: {
        name: error.name,
        message: error.message,
        code: error.code
      }
    };
  }
};

export const getUserActivityDistribution = async (axiosInstance, { startDate, endDate }) => {
  if (!axiosInstance) {
    throw new Error('Cliente HTTP no inicializado');
  }

  try {
    const response = await axiosInstance.get('/api/metrica/usuarios/distribucion', {
      params: { startDate, endDate },
      validateStatus: status => status < 500
    });

    if (response.status !== 200) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        success: false,
        error: 'Solicitud cancelada'
      };
    }

    console.error('Error en distribución de actividad:', error);
    return {
      success: false,
      error: error.message || 'Error desconocido'
    };
  }
};

export const getUserGrowthTrends = async (axiosInstance, { startDate, endDate }) => {
  if (!axiosInstance) {
    throw new Error('Cliente HTTP no inicializado');
  }

  try {
    const response = await axiosInstance.get('/api/metrica/usuarios/crecimiento', {
      params: { startDate, endDate },
      validateStatus: status => status < 500
    });

    if (response.status !== 200) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        success: false,
        error: 'Solicitud cancelada'
      };
    }

    console.error('Error en tendencias de crecimiento:', error);
    return {
      success: false,
      error: error.message || 'Error desconocido'
    };
  }
};

// Servicio para nuevos usuarios registrados
// Helper para mapear periodos del frontend al backend (mismo criterio que pagos)
const mapUserPeriodToBackend = (frontendPeriod) => {
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
  // Si viene como string o similar, devolver tal cual
  return date;
};

// Función base para servicios de usuarios
const fetchUserMetricsWithErrorHandling = async (axiosInstance, endpoint, period, description, { startDate, endDate } = {}) => {
  try {
    const mappedPeriod = mapUserPeriodToBackend(period);
    
    const params = { period: mappedPeriod };
    if (mappedPeriod === 'personalizado' && startDate && endDate) {
      params.startDate = formatDateYmd(startDate);
      params.endDate = formatDateYmd(endDate);
    }

    console.log(`📤 ENVIANDO AL BACKEND - ${description}:`, {
      endpoint,
      params,
      originalPeriod: period,
      mappedPeriod,
      timestamp: new Date().toISOString()
    });

    const response = await axiosInstance.get(endpoint, {
      params,
      validateStatus: status => status < 500
    });

    console.log(`📥 RESPUESTA RAW BACKEND - ${description}:`, {
      endpoint,
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      timestamp: new Date().toISOString()
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

export const getUserNewRegistrations = async (axiosInstance, { startDate, endDate, period } = {}) => {
  const result = await fetchUserMetricsWithErrorHandling(
    axiosInstance,
    '/api/metrica/usuarios/nuevos-clientes', // ✅ ACTUALIZADO: usar endpoint nuevo
    period,
    'nuevos usuarios registrados',
    { startDate, endDate }
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

// Servicio para nuevos clientes registrados
export const getUserNewCustomers = async (axiosInstance, { startDate, endDate, period } = {}) => {
  const result = await fetchUserMetricsWithErrorHandling(
    axiosInstance,
    '/api/metrica/usuarios/nuevos-clientes',
    period,
    'nuevos clientes',
    { startDate, endDate }
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

// Servicio para nuevos prestadores usuarios registrados
export const getUserNewProviders = async (axiosInstance, { startDate, endDate, period } = {}) => {
  const result = await fetchUserMetricsWithErrorHandling(
    axiosInstance,
    '/api/metrica/usuarios/nuevos-prestadores',
    period,
    'nuevos prestadores usuarios',
    { startDate, endDate }
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

// Servicio para nuevos administradores registrados
export const getUserNewAdmins = async (axiosInstance, { startDate, endDate, period } = {}) => {
  const result = await fetchUserMetricsWithErrorHandling(
    axiosInstance,
    '/api/metrica/usuarios/nuevos-administradores',
    period,
    'nuevos administradores',
    { startDate, endDate }
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

// Servicio para tasa de roles activos
export const getUserActiveRolesRate = async (axiosInstance, { startDate, endDate, period } = {}) => {
  const result = await fetchUserMetricsWithErrorHandling(
    axiosInstance,
    '/api/metrica/usuarios/tasa-roles-activos',
    period,
    'tasa de roles activos',
    { startDate, endDate }
  );

  if (!result.success) {
    return result;
  }

  const raw = result.data;
  
  // El endpoint devuelve { tasaActivos: {...}, distribucionPorRol: {...} }
  if (raw.tasaActivos) {
    // Helper para colores por rol
    const getRoleColor = (rol) => {
      const colors = {
        'customer': '#3b82f6',    // Azul
        'prestador': '#10b981',   // Verde
        'admin': '#f59e0b'        // Amarillo
      };
      return colors[rol?.toLowerCase()] || '#6b7280';
    };

    // Transformar distribución por rol a formato de gráfico para pie chart
    let chartData = [];
    if (raw.distribucionPorRol && typeof raw.distribucionPorRol === 'object') {
      chartData = Object.entries(raw.distribucionPorRol).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: typeof value === 'number' ? value : 0,
        color: getRoleColor(name)
      }));
    }

    return {
      success: true,
      data: {
        value: raw.tasaActivos.value ?? 0,
        change: raw.tasaActivos.change ?? 0,
        changeType: raw.tasaActivos.changeType || 'absoluto',
        changeStatus: raw.tasaActivos.changeStatus || 'neutral',
        // chartData vacío porque el backend no provee datos históricos para la tasa
        // La distribución por rol va en chartData para que pueda ser usada por el pie chart
        chartData: chartData, // Para pie chart (distribución), vacío para line chart (tasa histórica)
        distribucionPorRol: raw.distribucionPorRol || {},
        lastUpdated: new Date().toISOString()
      }
    };
  }

  return {
    success: false,
    message: 'Respuesta del backend sin datos de tasa de roles activos'
  };
};

// Servicio para tasa de usuarios inactivos
export const getUserInactiveRate = async (axiosInstance, { startDate, endDate, period } = {}) => {
  try {
    const mappedPeriod = mapUserPeriodToBackend(period);
    
    const params = { period: mappedPeriod };
    if (mappedPeriod === 'personalizado' && startDate && endDate) {
      params.startDate = formatDateYmd(startDate);
      params.endDate = formatDateYmd(endDate);
    }

    const endpoint = '/api/metrica/usuarios/tasa-roles-activos';

    console.log('📤 ENVIANDO AL BACKEND - tasa de usuarios inactivos:', {
      endpoint,
      params,
      originalPeriod: period,
      mappedPeriod,
      timestamp: new Date().toISOString()
    });

    const response = await axiosInstance.get(endpoint, {
      params,
      validateStatus: status => status < 500
    });

    console.log('📥 RESPUESTA RAW BACKEND - tasa de usuarios inactivos:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      timestamp: new Date().toISOString()
    });

    if (response.status !== 200) {
      throw new Error(`Error del servidor: ${response.status} - ${response.statusText}`);
    }

    if (!response.data || !response.data.data) {
      throw new Error('Respuesta sin datos');
    }

    // La respuesta del backend tiene esta estructura:
    // { success: true, data: { tasaInactivos: {...}, distribucionPorRol: {...} } }
    const raw = response.data.data;
    
    // Validar que raw existe y tiene tasaInactivos
    if (!raw || !raw.tasaInactivos) {
      return {
        success: false,
        message: 'Respuesta del backend sin datos de tasa de usuarios inactivos'
      };
    }
    
    // Retornar los datos en el formato esperado
    return {
      success: true,
      data: {
        tasaInactivos: {
          value: raw.tasaInactivos.value ?? 0,
          change: raw.tasaInactivos.change ?? 0,
          changeType: raw.tasaInactivos.changeType || 'absoluto',
          changeStatus: raw.tasaInactivos.changeStatus || 'neutral',
          chartData: raw.tasaInactivos.chartData || []
        },
        distribucionPorRol: raw.distribucionPorRol || {},
        lastUpdated: new Date().toISOString()
      }
    };
  } catch (error) {
    if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
      return {
        success: false,
        error: 'Solicitud cancelada'
      };
    }

    console.error('❌ Error en tasa de usuarios inactivos:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message,
      error: error.response?.data?.error || error.message,
      status: error.response?.status || 500
    };
  }
};

// Servicio para distribución por rol (histórico, sin periodo)
export const getUserRoleDistribution = async (axiosInstance) => {
  if (!axiosInstance) {
    throw new Error('Cliente HTTP no inicializado');
  }

  try {
    console.log('📤 ENVIANDO AL BACKEND - distribución por rol:', {
      endpoint: '/api/metrica/usuarios/distribucion-por-rol',
      timestamp: new Date().toISOString()
    });

    const response = await axiosInstance.get('/api/metrica/usuarios/distribucion-por-rol', {
      validateStatus: status => status < 500
    });

    console.log('📥 RESPUESTA RAW BACKEND - distribución por rol:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      timestamp: new Date().toISOString()
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

    console.error('❌ Error en distribución por rol:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message,
      error: error.response?.data?.error || error.message,
      status: error.response?.status || 500
    };
  }
};

// Servicio para total de usuarios (histórico, sin periodo)
export const getUserTotal = async (axiosInstance) => {
  if (!axiosInstance) {
    throw new Error('Cliente HTTP no inicializado');
  }

  try {
    console.log('📤 ENVIANDO AL BACKEND - total de usuarios:', {
      endpoint: '/api/metrica/usuarios/totales',
      timestamp: new Date().toISOString()
    });

    const response = await axiosInstance.get('/api/metrica/usuarios/totales', {
      validateStatus: status => status < 500
    });

    console.log('📥 RESPUESTA RAW BACKEND - total de usuarios:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      timestamp: new Date().toISOString()
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
      data: {
        value: rawData.value ?? 0,
        change: rawData.change ?? 0,
        changeType: rawData.changeType || 'absoluto',
        changeStatus: rawData.changeStatus || 'neutro',
        lastUpdated: new Date().toISOString()
      }
    };
  } catch (error) {
    if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
      return {
        success: false,
        error: 'Solicitud cancelada'
      };
    }

    console.error('❌ Error en total de usuarios:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message,
      error: error.response?.data?.error || error.message,
      status: error.response?.status || 500
    };
  }
};

// Servicio para nuevos prestadores (desde el endpoint de prestadores, con filtros)
export const getProviderNewRegistrations = async (axiosInstance, { startDate, endDate, period, filters = {} } = {}) => {
  try {
    const mappedPeriod = mapUserPeriodToBackend(period);
    
    const params = { period: mappedPeriod };
    if (mappedPeriod === 'personalizado' && startDate && endDate) {
      params.startDate = formatDateYmd(startDate);
      params.endDate = formatDateYmd(endDate);
    }

    // Agregar filtros de segmentación (rubro, zona)
    if (filters.rubro) params.rubro = filters.rubro;
    if (filters.zona) params.zona = filters.zona;

    const endpoint = '/api/metrica/prestadores/nuevos-registrados';

    console.log('📤 ENVIANDO AL BACKEND - nuevos prestadores:', {
      endpoint,
      params,
      originalPeriod: period,
      mappedPeriod,
      filters,
      timestamp: new Date().toISOString()
    });

    const response = await axiosInstance.get(endpoint, {
      params,
      validateStatus: status => status < 500
    });

    console.log('📥 RESPUESTA RAW BACKEND - nuevos prestadores:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      timestamp: new Date().toISOString()
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
      data: {
        value: rawData.value ?? 0,
        change: rawData.change ?? 0,
        changeType: rawData.changeType || 'porcentaje',
        changeStatus: rawData.changeStatus || 'neutral',
        chartData: rawData.chartData || [],
        lastUpdated: new Date().toISOString()
      }
    };
  } catch (error) {
    if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
      return {
        success: false,
        error: 'Solicitud cancelada'
      };
    }

    console.error('❌ Error en nuevos prestadores:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message,
      error: error.response?.data?.error || error.message,
      status: error.response?.status || 500
    };
  }
};
