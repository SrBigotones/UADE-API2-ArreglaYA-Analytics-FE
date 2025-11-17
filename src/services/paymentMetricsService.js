/* 
 * Servicios para métricas de pagos
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

// Función helper para extraer datos de la respuesta (sin transformar)
const extractResponseData = (response) => {
  // Devolver los datos raw del backend
  return response.data.data || response.data;
};

// Helper para asignar colores según el estado
const getStatusColor = (status) => {
  const colors = {
    APROBADO: '#22c55e',   // Verde
    RECHAZADO: '#ef4444',  // Rojo
    PENDIENTE: '#f59e0b',  // Amarillo
    EXPIRADO: '#6b7280'    // Gris
  };
  return colors[status] || '#0ea5e9'; // Color por defecto
};

// Helper para asignar colores según el método de pago
// Usa la misma paleta de colores que el gráfico de distribución de prestadores por rubro
const getPaymentMethodColor = (method) => {
  // Paleta con contraste asegurado (verdes, azules, naranjas y violetas)
  const methodColorMap = {
    'TARJETA_CREDITO': '#f97316',     // Naranja intenso
    'TARJETA_DEBITO': '#10b981',      // Verde brillante
    'TRANSFERENCIA': '#6366f1',       // Violeta/azul fuerte
    'EFECTIVO': '#eab308',            // Amarillo dorado
    'MERCADO_PAGO': '#0ea5e9',        // Celeste ArreglaYA
    'CREDIT_CARD': '#f97316',
    'DEBIT_CARD': '#10b981',
    'TRANSFER': '#6366f1',
    'CASH': '#eab308',
    'DESCONOCIDO': '#ef4444'
  };

  return methodColorMap[method] || '#8b5cf6';
};

// Función base mejorada para métricas de pagos con manejo de errores detallado
const fetchMetricsWithErrorHandling = async (axiosInstance, endpoint, period, description, { startDate, endDate, filters = {} } = {}) => {
  try {
    const mappedPeriod = mapPeriodToBackend(period);
    
    // Preparar parámetros base
    const params = { period: mappedPeriod };
    
    // Agregar fechas si es período personalizado
    if (mappedPeriod === 'personalizado' && startDate && endDate) {
      // Formatear fechas como strings YYYY-MM-DD
      params.startDate = startDate instanceof Date ? startDate.toISOString().split('T')[0] : startDate;
      params.endDate = endDate instanceof Date ? endDate.toISOString().split('T')[0] : endDate;
    }

    // Agregar filtros si están disponibles
    if (filters.rubro) params.rubro = filters.rubro;
    if (filters.zona) params.zona = filters.zona;
    if (filters.metodo) params.metodo = filters.metodo;
    if (filters.tipoSolicitud) params.tipoSolicitud = filters.tipoSolicitud;
    if (filters.minMonto) params.minMonto = filters.minMonto;
    if (filters.maxMonto) params.maxMonto = filters.maxMonto;

    const response = await axiosInstance.get(endpoint, {
      params
    });

    if (response.status !== 200) {
      throw new Error(`Error del servidor: ${response.status} - ${response.statusText}`);
    }

    if (!response.data) {
      throw new Error('Respuesta sin datos');
    }

    const processedData = extractResponseData(response);

    return {
      success: true,
      data: processedData
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
      error: error.response?.data?.error || error.message,
      status: error.response?.status || 500,
      details: {
        timestamp: new Date().toISOString(),
        endpoint,
        period,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      }
    };
  }
};

// Servicio para tasa de éxito de pagos
export const getPaymentSuccessMetrics = async (axiosInstance, { period, startDate, endDate, filters = {} } = {}) => {
  const result = await fetchMetricsWithErrorHandling(
    axiosInstance, 
    '/api/metrica/pagos/tasa-exito', 
    period, 
    'tasa de éxito de pagos', 
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

// Servicio para tiempo de procesamiento de pagos
export const getPaymentProcessingTimeMetrics = async (axiosInstance, { period, startDate, endDate, filters = {} } = {}) => {
  const result = await fetchMetricsWithErrorHandling(
    axiosInstance, 
    '/api/metrica/pagos/tiempo-procesamiento',
    period, 
    'tiempo de procesamiento', 
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

// Servicio para distribución de eventos de pago
export const getPaymentDistributionMetrics = async (axiosInstance, { period, startDate, endDate, filters = {} } = {}) => {
  const result = await fetchMetricsWithErrorHandling(
    axiosInstance, 
    '/api/metrica/pagos/distribucion-eventos', // ✅ ACTUALIZADO: usar endpoint nuevo
    period, 
    'distribución de pagos', 
    { startDate, endDate, filters }
  );

  if (!result.success) {
    return result;
  }

  // Para distribución, ya viene transformado en extractResponseData
  const raw = result.data;
  
  // Si viene como objeto plano, transformarlo
  if (raw.chartData && Array.isArray(raw.chartData)) {
    const hasData = raw.chartData.some(item => (item?.value || 0) > 0);
    return {
      success: true,
      data: {
        chartData: hasData ? raw.chartData : [],
        total: raw.total || raw.chartData.reduce((sum, item) => sum + (item.value || 0), 0),
        lastUpdated: new Date().toISOString()
      }
    };
  }

  // Si viene como objeto plano del backend (ej: { APROBADO: 100, RECHAZADO: 20 })
  const chartData = Object.entries(raw).filter(([key]) => key !== 'chartData' && key !== 'total').map(([name, value]) => ({
    name,
    value: typeof value === 'number' ? value : 0,
    color: getStatusColor(name)
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  const hasData = chartData.some(item => item.value > 0);

  return {
    success: true,
    data: {
      chartData: hasData ? chartData : [],
      total,
      lastUpdated: new Date().toISOString()
    }
  };
};

// Servicio para distribución de métodos de pago
export const getPaymentMethodDistributionMetrics = async (axiosInstance, { period, startDate, endDate, filters = {} } = {}) => {
  // Este KPI muestra la distribución entre métodos, por lo que ignorar un filtro
  // por método evita que el resultado quede sesgado o vacío.
  // eslint-disable-next-line no-unused-vars
  const { metodo, ...filtersWithoutMethod } = filters || {};

  const result = await fetchMetricsWithErrorHandling(
    axiosInstance, 
    '/api/metrica/pagos/distribucion-metodos',
    period, 
    'distribución métodos de pago', 
    { startDate, endDate, filters: filtersWithoutMethod }
  );

  if (!result.success) {
    return result;
  }

  const raw = result.data;
  
  // Si viene como objeto plano, transformarlo
  if (raw.chartData && Array.isArray(raw.chartData)) {
    return {
      success: true,
      data: {
        chartData: raw.chartData,
        total: raw.total || raw.chartData.reduce((sum, item) => sum + (item.value || 0), 0),
        lastUpdated: new Date().toISOString()
      }
    };
  }

  // Si viene como objeto plano del backend (ej: { TARJETA_CREDITO: 100, TRANSFERENCIA: 20 })
  const chartData = Object.entries(raw).filter(([key]) => key !== 'chartData' && key !== 'total').map(([name, value]) => ({
    name,
    value: typeof value === 'number' ? value : 0,
    color: getPaymentMethodColor(name)
  }));

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

// Servicio para ingreso bruto de pagos
export const getPaymentGrossRevenueMetrics = async (axiosInstance, { period, startDate, endDate, filters = {} } = {}) => {
  const result = await fetchMetricsWithErrorHandling(
    axiosInstance, 
    '/api/metrica/pagos/ingreso-ticket',
    period, 
    'ingreso bruto de pagos', 
    { startDate, endDate, filters }
  );

  if (!result.success) {
    return result;
  }

  const raw = result.data;
  
  // El endpoint devuelve { ingresoBruto: {...}, ticketMedio: {...} }
  if (raw.ingresoBruto) {
    return {
      success: true,
      data: {
        value: raw.ingresoBruto.value ?? 0,
        change: raw.ingresoBruto.change ?? 0,
        changeType: raw.ingresoBruto.changeType || 'absoluto',
        changeStatus: raw.ingresoBruto.changeStatus || 'neutral',
        chartData: raw.ingresoBruto.chartData || [],
        lastUpdated: new Date().toISOString()
      }
    };
  }

  return {
    success: false,
    message: 'Respuesta del backend sin datos de ingreso bruto'
  };
};

// Servicio para ticket medio de pagos
export const getPaymentAverageTicketMetrics = async (axiosInstance, { period, startDate, endDate, filters = {} } = {}) => {
  const result = await fetchMetricsWithErrorHandling(
    axiosInstance, 
    '/api/metrica/pagos/ingreso-ticket',
    period, 
    'ticket medio de pagos', 
    { startDate, endDate, filters }
  );

  if (!result.success) {
    return result;
  }

  const raw = result.data;
  
  // El endpoint devuelve { ingresoBruto: {...}, ticketMedio: {...} }
  if (raw.ticketMedio) {
    return {
      success: true,
      data: {
        value: raw.ticketMedio.value ?? 0,
        change: raw.ticketMedio.change ?? 0,
        changeType: raw.ticketMedio.changeType || 'absoluto',
        changeStatus: raw.ticketMedio.changeStatus || 'neutral',
        chartData: raw.ticketMedio.chartData || [],
        lastUpdated: new Date().toISOString()
      }
    };
  }

  return {
    success: false,
    message: 'Respuesta del backend sin datos de ticket medio'
  };
};
