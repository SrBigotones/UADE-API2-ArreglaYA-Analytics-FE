// Registro centralizado de todas las métricas disponibles
// Cada métrica tiene toda la información necesaria para renderizarse

export const METRICS_REGISTRY = {
  // === CORE / DASHBOARD ===
  'core-processing-time': {
    id: 'core-processing-time',
    module: 'core',
    type: 'card',
    title: 'Tiempo promedio de procesamiento',
    value: '2.3s',
    change: '+5%',
    changeStatus: 'positive',
    description: 'Tiempo promedio de procesamiento de mensajes',
    endpoint: '/api/metrics/core/processing-time',
    category: 'performance'
  },
  'core-retry-success': {
    id: 'core-retry-success',
    module: 'core',
    type: 'card',
    title: 'Tasa de reintentos exitosos',
    value: '94.2%',
    change: '+2.1%',
    changeStatus: 'positive',
    description: 'Tasa de reintentos exitosos',
    endpoint: '/api/metrics/core/retry-success-rate',
    category: 'reliability'
  },
  'core-messages-flow': {
    id: 'core-messages-flow',
    module: 'core',
    type: 'area',
    title: 'Mensajes por minuto',
    value: '1,247',
    change: '+12%',
    changeStatus: 'positive',
    description: 'Evolución de mensajes enviados por minuto',
    chartData: [
      { time: '00:00', value: 1200 },
      { time: '04:00', value: 800 },
      { time: '08:00', value: 1500 },
      { time: '12:00', value: 1800 },
      { time: '16:00', value: 1600 },
      { time: '20:00', value: 1400 },
    ],
    endpoint: '/api/metrics/core/messages-per-minute',
    category: 'traffic'
  },

  // === CATÁLOGO ===
  'catalog-new-providers': {
    id: 'catalog-new-providers',
    module: 'catalog',
    type: 'card',
    title: 'Nuevos prestadores registrados',
    value: '47',
    change: '+23%',
    changeStatus: 'positive',
    description: 'Nuevos prestadores registrados',
    endpoint: '/api/metrics/catalog/new-providers',
    category: 'growth'
  },
  'catalog-service-distribution': {
    id: 'catalog-service-distribution',
    module: 'catalog',
    type: 'pie',
    title: 'Distribución de servicios',
    value: '2,847',
    change: '+12%',
    changeStatus: 'positive',
    description: 'Distribución por categoría de servicios',
    chartData: [
      { name: 'Plomería', value: 850, color: '#8884d8' },
      { name: 'Electricidad', value: 720, color: '#82ca9d' },
      { name: 'Limpieza', value: 650, color: '#ffc658' },
      { name: 'Jardinería', value: 627, color: '#ff7300' },
    ],
    endpoint: '/api/metrics/catalog/service-distribution',
    category: 'distribution'
  },

  // === APP ===
  'app-requests-created': {
    id: 'app-requests-created',
    module: 'app',
    type: 'card',
    title: 'Solicitudes creadas',
    value: '892',
    change: '+31%',
    changeStatus: 'positive',
    description: 'Número de solicitudes de servicio creadas',
    endpoint: '/api/metrics/app/requests-created',
    category: 'usage'
  },
  'app-conversion-rate': {
    id: 'app-conversion-rate',
    module: 'app',
    type: 'card',
    title: 'Conversión búsqueda → solicitud',
    value: '67.4%',
    change: '+5.2%',
    changeStatus: 'positive',
    description: 'Tasa de conversión de búsqueda a solicitud',
    endpoint: '/api/metrics/app/conversion-rate',
    category: 'conversion'
  },
  'app-cancellation-rate': {
    id: 'app-cancellation-rate',
    module: 'app',
    type: 'card',
    title: 'Tasa de cancelación',
    value: '12.3%',
    change: '-2.1%',
    changeStatus: 'positive',
    description: 'Tasa/porcentaje de cancelación de solicitudes',
    endpoint: '/api/metrics/app/cancellation-rate',
    category: 'retention'
  },

  // === PAGOS ===
  'payments-success-rate': {
    id: 'payments-success-rate',
    module: 'payments',
    type: 'card',
    title: 'Tasa de éxito de pagos',
    value: '98.7%',
    change: '+0.8%',
    changeStatus: 'positive',
    description: 'Porcentaje de pagos exitosos sobre el total de los mismos.',
    endpoint: '/api/metrica/pagos/exitosos',
    category: 'performance',
    // Configuración para integración con servicio real
    hasRealService: true,
    serviceConfig: {
      serviceName: 'getPaymentSuccessMetrics',
      serviceModule: 'paymentMetricsService',
      valueFormatter: (data) => `${data.value}%`,
      changeFormatter: (data) => {
        const sign = data.changeStatus === 'positivo' ? '+' : data.changeStatus === 'negativo' ? '-' : '';
        const value = Math.abs(data.change || 0);
        return data.changeType === 'porcentaje' ? `${sign}${value}%` : `${sign}${value}`;
      },
      statusMapper: (status) => ({
        'positivo': 'positive',
        'negativo': 'negative'
      }[status] || 'positive')
    }
  },
  'payments-processing-time': {
    id: 'payments-processing-time',
    module: 'payments',
    type: 'card',
    title: 'Tiempo de procesamiento de pagos',
    value: '3 s',
    change: '+0,2 s',
    changeStatus: 'negative',
    description: 'Tiempo promedio de procesamiento de pagos en minutos.',
    endpoint: '/metrics/payments/processing-time',
    category: 'performance',
    // Configuración para integración con servicio real
    hasRealService: true,
    serviceConfig: {
      serviceName: 'getPaymentProcessingTimeMetrics',
      serviceModule: 'paymentMetricsService',
      valueFormatter: (data) => `${data.value} min`,
      changeFormatter: (data) => {
        const sign = data.changeStatus === 'positivo' ? '+' : data.changeStatus === 'negativo' ? '-' : '';
        const value = Math.abs(data.change || 0);
        return data.changeType === 'porcentaje' ? `${sign}${value}%` : `${sign}${value}`;
      },
      statusMapper: (status) => ({
        'positivo': 'positive',
        'negativo': 'negative'
      }[status] || 'positive')
    }
  },
  'payments-refunds-completed': {
    id: 'payments-refunds-completed',
    module: 'payments',
    type: 'card',
    title: 'Reembolsos completados',
    value: '6',
    change: '+20%',
    changeStatus: 'negative',
    description: 'Tiempo promedio de procesamiento de pagos en segundos.',
    endpoint: '/api/metrics/payments/refunds-completed',
    category: 'refunds'
  },
  'payments-event-distribution': {
    id: 'payments-event-distribution',
    module: 'payments',
    type: 'pie',
    title: 'Distribución eventos de pago',
    value: '1,247',
    change: '-2%',
    changeStatus: 'negative',
    description: 'Distribución por estado de pago',
    chartData: [
      { name: 'Aprobado', value: 62, color: '#22c55e' },
      { name: 'Rechazado', value: 18, color: '#ef4444' },
      { name: 'Expirado', value: 9, color: '#f59e0b' },
      { name: 'Pendiente', value: 11, color: '#0ea5e9' }
    ],
    endpoint: '/metrics/payments/distribution',
    category: 'distribution',
    // Configuración para integración con servicio real
    hasRealService: true,
    serviceConfig: {
      serviceName: 'getPaymentDistributionMetrics',
      serviceModule: 'paymentMetricsService',
      chartDataFormatter: (data) => data.chartData,
      valueFormatter: (data) => data.total?.toString() || '0',
      changeFormatter: () => '', // Los gráficos de torta no usan change
      statusMapper: () => 'neutral'
    }
  },

  // === USUARIOS ===
  'users-new-registrations': {
    id: 'users-new-registrations',
    module: 'users',
    type: 'card',
    title: 'Nuevos usuarios registrados',
    value: '234',
    change: '+28%',
    changeStatus: 'positive',
    description: 'Nuevos usuarios registrados',
    endpoint: '/api/metrica/usuarios/creados',
    category: 'growth',
    // Configuración para integración con servicio real
    hasRealService: true,
    serviceConfig: {
      serviceName: 'getUserNewRegistrations',
      serviceModule: 'userMetricsService',
      valueFormatter: (data) => data.value?.toString() || '0',
      changeFormatter: (data) => {
        const value = Math.abs(data.change || 0);
        if (value === 0) return '0';
        const sign = data.changeStatus === 'positivo' ? '+' : data.changeStatus === 'negativo' ? '-' : '';
        return data.changeType === 'porcentaje' ? `${sign}${value}%` : `${sign}${value}`;
      },
      statusMapper: (status) => ({
        'positivo': 'positive',
        'negativo': 'negative'
      }[status] || 'positive')
    }
  },
  'users-role-assignment': {
    id: 'users-role-assignment',
    module: 'users',
    type: 'card',
    title: 'Tasa de roles asignados',
    value: '94.1%',
    change: '+3.2%',
    changeStatus: 'positive',
    description: 'Tasa de roles asignados',
    endpoint: '/api/metrics/users/role-assignment',
    category: 'management'
  },

  // === MATCHING ===
  'matching-pending-quotes': {
    id: 'matching-pending-quotes',
    module: 'matching',
    type: 'card',
    title: 'Cotizaciones pendientes',
    value: '56',
    change: '+12%',
    changeStatus: 'negative',
    description: 'Número de cotizaciones pendientes',
    endpoint: '/api/metrics/matching/pending-quotes',
    category: 'workflow'
  }
};

// Configuraciones predefinidas por módulo
export const MODULE_METRICS = {
  core: ['core-processing-time', 'core-retry-success', 'core-messages-flow'],
  catalog: ['catalog-new-providers', 'catalog-service-distribution'],
  app: ['app-requests-created', 'app-conversion-rate', 'app-cancellation-rate'],
  payments: ['payments-success-rate', 'payments-processing-time', 'payments-refunds-completed', 'payments-event-distribution'],
  users: ['users-new-registrations', 'users-role-assignment'],
  matching: ['matching-pending-quotes']
};

// Configuración por defecto del dashboard
export const DEFAULT_DASHBOARD_METRICS = [
  'core-processing-time',
  'catalog-new-providers',
  'app-requests-created',
  'payments-success-rate'
];

// Helper: métricas por módulo
export const getMetricsByModule = (module) =>
  MODULE_METRICS[module]?.map(id => METRICS_REGISTRY[id]).filter(Boolean) || [];

// Helper: obtener una métrica
export const getMetric = (id) => METRICS_REGISTRY[id];

// Helper: obtener múltiples métricas
export const getMetrics = (ids) => ids.map(id => METRICS_REGISTRY[id]).filter(Boolean);
