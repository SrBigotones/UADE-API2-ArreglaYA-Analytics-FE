// Servicio para métricas de usuarios
export const getUserMetrics = async (axiosInstance, { startDate, endDate, period, signal }) => {
  if (!axiosInstance) {
    throw new Error('Cliente HTTP no inicializado');
  }

  try {
    console.log('📊 Solicitando métricas de usuarios:', {
      url: '/api/metrica/usuarios/creados',
      params: { startDate, endDate, period },
      baseURL: axiosInstance.defaults.baseURL
    });

    const response = await axiosInstance.get('/api/metrica/usuarios/creados', {
      params: { startDate, endDate, period },
      signal,
      validateStatus: status => status < 500
    });

    // Log detallado de la respuesta
    console.log('🔍 Respuesta del servidor (usuarios):', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers,
      config: {
        url: response.config?.url,
        baseURL: response.config?.baseURL,
        method: response.config?.method,
        params: response.config?.params
      }
    });

    // Validar la respuesta
    if (response.status !== 200) {
      throw new Error(`Error del servidor: ${response.status} - ${response.statusText}`);
    }

    if (!response.data) {
      throw new Error('Respuesta sin datos');
    }

    console.log('✅ Respuesta recibida:', {
      status: response.status,
      data: response.data
    });

    // Asegurar el formato correcto de la respuesta
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
    // Ignorar errores de cancelación
    if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
      console.log('📊 Solicitud de métricas cancelada');
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
      console.log('📊 Solicitud de distribución cancelada');
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
      console.log('📊 Solicitud de tendencias cancelada');
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
export const getUserNewRegistrations = async (axiosInstance, { startDate, endDate, period, signal }) => {
  if (!axiosInstance) {
    throw new Error('Cliente HTTP no inicializado');
  }

  try {
    // Mapeo de períodos al formato del backend
    const periodMappings = {
      'last7': 'ultimos_7_dias',
      'last30': 'ultimos_30_dias',
      'last90': 'ultimos_90_dias',
      'last365': 'ultimo_anio'
    };

    // Mapear el período al formato esperado por el backend
    const mappedPeriod = periodMappings[period] || period;

    // Log detallado de la solicitud
    const requestConfig = {
      method: 'GET',
      url: '/api/metrica/usuarios/creados',
      params: { startDate, endDate, period: mappedPeriod },
      baseURL: axiosInstance.defaults.baseURL,
      headers: axiosInstance.defaults.headers,
      timeout: axiosInstance.defaults.timeout
    };

    console.log('📊 Iniciando solicitud de nuevos registros:', {
      request: {
        ...requestConfig,
        originalPeriod: period,
        mappedPeriod,
        fullUrl: `${axiosInstance.defaults.baseURL}${requestConfig.url}?period=${mappedPeriod}`,
      },
      timestamp: new Date().toISOString(),
      requestId: Math.random().toString(36).substring(7)
    });

    const response = await axiosInstance.request({
      ...requestConfig,
      signal,
      validateStatus: status => status < 500
    });

    // Log detallado de la respuesta
    console.log('🔍 Respuesta detallada (nuevos registros):', {
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

    // Log de éxito
    console.log('✅ Datos de nuevos registros procesados:', {
      timestamp: new Date().toISOString(),
      metrics: {
        value: response.data.value,
        change: response.data.change,
        period
      }
    });

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
    // Log detallado del error
    console.error('❌ Error detallado en nuevos registros:', {
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
      console.log('📊 Solicitud de nuevos registros cancelada');
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
      errorMessage = 'No se pudo conectar con el servidor';
      errorDetails = {
        type: 'request',
        method: error.config.method,
        url: error.config.url,
        params: error.config.params,
        network: {
          online: navigator.onLine,
          connection: navigator.connection?.effectiveType
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
    console.log('📊 Solicitando métricas de asignación de roles:', {
      url: '/api/metrica/usuarios/roles',
      params: { startDate, endDate, period }
    });

    const response = await axiosInstance.get('/api/metrica/usuarios/roles', {
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
      console.log('📊 Solicitud de roles cancelada');
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