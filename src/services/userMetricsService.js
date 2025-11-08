// Servicio para métricas de usuarios
export const getUserMetrics = async (axiosInstance, { startDate, endDate, period, signal }) => {
  if (!axiosInstance) {
    throw new Error('Cliente HTTP no inicializado');
  }

  try {
    const response = await axiosInstance.get('/api/metrica/usuarios/creados', {
      params: { startDate, endDate, period },
      signal,
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

export const getUserActivityDistribution = async (axiosInstance, { startDate, endDate, signal }) => {
  if (!axiosInstance) {
    throw new Error('Cliente HTTP no inicializado');
  }

  try {
    const response = await axiosInstance.get('/api/metrica/usuarios/distribucion', {
      params: { startDate, endDate },
      signal,
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

export const getUserGrowthTrends = async (axiosInstance, { startDate, endDate, signal }) => {
  if (!axiosInstance) {
    throw new Error('Cliente HTTP no inicializado');
  }

  try {
    const response = await axiosInstance.get('/api/metrica/usuarios/crecimiento', {
      params: { startDate, endDate },
      signal,
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

export const getUserNewRegistrations = async (axiosInstance, { startDate, endDate, period, signal } = {}) => {
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
export const getUserNewCustomers = async (axiosInstance, { startDate, endDate, period, signal } = {}) => {
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
export const getUserNewProviders = async (axiosInstance, { startDate, endDate, period, signal } = {}) => {
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
export const getUserNewAdmins = async (axiosInstance, { startDate, endDate, period, signal } = {}) => {
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
export const getUserActiveRolesRate = async (axiosInstance, { startDate, endDate, period, signal } = {}) => {
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

// Servicio para asignación de roles de usuarios
export const getUserRoleAssignments = async (axiosInstance, { startDate, endDate, period, signal }) => {
  if (!axiosInstance) {
    throw new Error('Cliente HTTP no inicializado');
  }

  try {

    const response = await axiosInstance.get('/api/metrics/users/roles', {
      params: { startDate, endDate, period },
      signal,
      validateStatus: status => status < 500
    });

    if (response.status !== 200) {
      throw new Error(`Error del servidor: ${response.status}`);
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
    if (error.name === 'AbortError') {
      return {
        success: false,
        error: 'Solicitud cancelada'
      };
    }

    console.error('Error en métricas de roles:', error);
    return {
      success: false,
      error: error.message || 'Error desconocido'
    };
  }
};
