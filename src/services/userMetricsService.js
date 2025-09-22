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

// Helper para obtener rango por preset (replica de DateRangeSelector)
const getPresetRangeForUsers = (presetId) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  switch (presetId) {
    case 'today':
      return { startDate: today, endDate: today };
    case 'last7': {
      const start = new Date(today);
      start.setDate(start.getDate() - 6);
      return { startDate: start, endDate: today };
    }
    case 'last30': {
      const start = new Date(today);
      start.setDate(start.getDate() - 29);
      return { startDate: start, endDate: today };
    }
    case 'lastYear': {
      const start = new Date(today);
      start.setFullYear(start.getFullYear() - 1);
      start.setDate(start.getDate() + 1);
      return { startDate: start, endDate: today };
    }
    default:
      return { startDate: null, endDate: null };
  }
};

export const getUserNewRegistrations = async (axiosInstance, { startDate, endDate, period, signal }) => {
  if (!axiosInstance) {
    throw new Error('Cliente HTTP no inicializado');
  }

  try {
    // Mapear el período al formato esperado por el backend (alineado con pagos)
    const mappedPeriod = mapUserPeriodToBackend(period);

    // Construir params como en pagos: siempre period y fechas solo si es personalizado
    const params = { period: mappedPeriod };
    if (mappedPeriod === 'personalizado') {
      const formattedStart = formatDateYmd(startDate);
      const formattedEnd = formatDateYmd(endDate);
      if (formattedStart && formattedEnd) {
        params.startDate = formattedStart;
        params.endDate = formattedEnd;
      }
    }

    // Console log de la consulta que se envía al backend
    console.log(`📤 ENVIANDO AL BACKEND - nuevos usuarios:`, {
      endpoint: '/api/metrica/usuarios/creados',
      params,
      originalPeriod: period,
      mappedPeriod,
      timestamp: new Date().toISOString()
    });

    const response = await axiosInstance.get('/api/metrica/usuarios/creados', {
      params,
      signal,
      validateStatus: status => status < 500
    });

    // Console log de la respuesta raw del backend
    console.log(`📥 RESPUESTA RAW BACKEND - nuevos usuarios:`, {
      endpoint: '/api/metrica/usuarios/creados',
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

    // Extraer los datos correctamente de la estructura anidada
    const responseData = response.data.data || response.data;
    

    return {
      success: true,
      data: responseData  // Pasar los datos tal cual vienen del servidor
    };
  } catch (error) {

    // Tratar correctamente cancelaciones de fetch y de Axios
    if (error.name === 'AbortError' || error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
      return {
        success: false,
        error: 'Solicitud cancelada',
        details: {
          timestamp: new Date().toISOString(),
          type: 'abort'
        }
      };
    }

    let errorMessage = 'Error desconocido';
    let errorDetails = {
      timestamp: new Date().toISOString(),
      type: 'unknown'
    };

    if (error.response) {
      errorMessage = `Error ${error.response.status}: ${error.response.data?.message || error.response.statusText || 'Error del servidor'}`;
      errorDetails = {
        type: 'response',
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      };
    } else if (error.request) {
      // Error de red/CORS: intentar un retry con fechas explícitas como personalizado
      const retryRange = getPresetRangeForUsers(period);
      if (retryRange.startDate && retryRange.endDate) {
        const retryParams = {
          period: 'personalizado',
          startDate: formatDateYmd(retryRange.startDate),
          endDate: formatDateYmd(retryRange.endDate)
        };

        console.log('🔁 Retry con fechas por error de red/CORS en usuarios:', {
          endpoint: '/api/metrica/usuarios/creados',
          originalPeriod: period,
          retryParams,
          timestamp: new Date().toISOString()
        });

        try {
          const retryResponse = await axiosInstance.get('/api/metrica/usuarios/creados', {
            params: retryParams,
            signal,
            validateStatus: status => status < 500
          });

          console.log('✅ Retry exitoso usuarios:', {
            status: retryResponse.status,
            data: retryResponse.data
          });

          if (retryResponse.status === 200 && retryResponse.data) {
            const retryData = retryResponse.data.data || retryResponse.data;
            return {
              success: true,
              data: retryData
            };
          }
        } catch (retryErr) {
          console.error('❌ Retry fallido usuarios:', {
            name: retryErr.name,
            message: retryErr.message,
            code: retryErr.code
          });
        }
      }

      errorMessage = 'No se pudo conectar con el servidor';
      errorDetails = {
        type: 'request',
        method: error.config?.method,
        url: error.config?.url,
        params: error.config?.params,
        network: {
          online: typeof navigator !== 'undefined' ? navigator.onLine : undefined,
          connection: typeof navigator !== 'undefined' ? navigator.connection?.effectiveType : undefined
        }
      };
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
