// Servicio para métricas de usuarios
// (rama: feature/avances)

// Mapeo de períodos del frontend al backend
export const mapPeriodToBackend = (frontendPeriod) => {
  const periodMap = {
    today: 'hoy',
    last7: 'ultimos_7_dias',
    last30: 'ultimos_30_dias',
    lastYear: 'ultimo_ano',
    custom: 'personalizado',
  };
  return periodMap[frontendPeriod] || 'personalizado';
};

// Listado/consulta por rango de fechas (genérico)
export const getUsersByDateRange = async (axiosInstance, { startDate, endDate }) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await axiosInstance.get('/api/users/metrics', { params });

    if (response.status !== 200) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Error desconocido',
    };
  }
};

// Distribución de actividad de usuarios (por ejemplo para torta)
export const getUserActivityDistribution = async (axiosInstance, { startDate, endDate, signal }) => {
  if (!axiosInstance) {
    throw new Error('Cliente HTTP no inicializado');
  }

  try {
    const response = await axiosInstance.get('/api/metrica/usuarios/distribucion', {
      params: { startDate, endDate },
      signal,
    });

    if (response.status !== 200) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    return { success: true, data: response.data };
  } catch (error) {
    if (error.name === 'AbortError') {
      return { success: false, error: 'Solicitud cancelada' };
    }
    return { success: false, error: error.message || 'Error desconocido' };
  }
};

// Tendencias/crecimiento de usuarios
export const getUserGrowthTrends = async (axiosInstance, { startDate, endDate, signal }) => {
  if (!axiosInstance) {
    throw new Error('Cliente HTTP no inicializado');
  }

  try {
    const response = await axiosInstance.get('/api/metrica/usuarios/crecimiento', {
      params: { startDate, endDate },
      signal,
    });

    if (response.status !== 200) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    return { success: true, data: response.data };
  } catch (error) {
    if (error.name === 'AbortError') {
      return { success: false, error: 'Solicitud cancelada' };
    }
    return { success: false, error: error.message || 'Error desconocido' };
  }
};

// Métrica: usuarios creados (tarjeta principal)
export const getUsersCreatedMetrics = async (axiosInstance, { startDate, endDate, period }) => {
  try {
    const mappedPeriod = mapPeriodToBackend(period);

    const params = { period: mappedPeriod };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await axiosInstance.get('/api/metrica/usuarios/creados', { params });

    if (response.status !== 200) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const responseData = response.data?.data || response.data;

    return {
      success: true,
      data: {
        value: responseData.value || 0,
        change: responseData.change || 0,
        changeType: responseData.changeType || 'valor',
        changeStatus: responseData.changeStatus || 'neutral',
        lastUpdated: responseData.lastUpdated || new Date().toISOString(),
      },
    };
  } catch (error) {
    if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
      return { success: false, error: 'Solicitud cancelada' };
    }
    return {
      success: false,
      error: error.message || 'Error desconocido',
    };
  }
};

// Asignación de roles de usuarios
export const getUserRoleAssignments = async (axiosInstance, { startDate, endDate, period, signal }) => {
  if (!axiosInstance) {
    throw new Error('Cliente HTTP no inicializado');
  }

  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (period) params.period = period;

    const response = await axiosInstance.get('/api/users/growth', {
      params,
      signal,
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
        lastUpdated: response.data.lastUpdated || new Date().toISOString(),
      },
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      return { success: false, error: 'Solicitud cancelada' };
    }
    return { success: false, error: error.message || 'Error desconocido' };
  }
};
