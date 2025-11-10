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
    category: 'performance',
    allowToggleToChart: true,
    toggleChartKind: 'line'
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
    category: 'reliability',
    allowToggleToChart: false
  },

  // === CATÁLOGO ===
  'catalog-win-rate': {
    id: 'catalog-win-rate',
    module: 'catalog',
    type: 'card',
    title: 'Win Rate',
    value: '0%',
    change: '',
    changeStatus: 'neutral',
    description: 'Porcentaje de cotizaciones aceptadas sobre emitidas',
    endpoint: '/api/metrica/prestadores/win-rate-rubro',
    category: 'conversion',
    allowToggleToChart: true,
    toggleChartKind: 'line',
    hasRealService: true,
    serviceConfig: {
      serviceName: 'getCatalogWinRateByCategory',
      serviceModule: 'catalogService',
      valueFormatter: (data) => `${data.value}%`,
      changeFormatter: (data) => {
        const sign = data.changeStatus === 'positivo' ? '+' : data.changeStatus === 'negativo' ? '-' : '';
        const value = Math.abs(data.change || 0);
        return data.changeType === 'porcentaje' ? `${sign}${value}%` : `${sign}${value}`;
      },
      statusMapper: (status) => ({
        'positivo': 'positive',
        'negativo': 'negative',
        'neutro': 'neutral'
      }[status] || 'neutral'),
      chartDataFormatter: (data) => data.chartData || []
    }
  },
  'catalog-orders-heatmap': {
    id: 'catalog-orders-heatmap',
    module: 'catalog',
    type: 'map',
    title: 'Mapa de calor de pedidos',
    description: 'Distribución geográfica de pedidos',
    endpoint: '/api/metrica/solicitudes/mapa-calor',
    category: 'distribution',
    hasRealService: true,
    serviceConfig: {
      serviceName: 'getCatalogOrdersHeatmap',
      serviceModule: 'catalogService',
      valueFormatter: () => '', // no aplica para mapa
      changeFormatter: () => '',
      statusMapper: () => 'neutral',
      pointsFormatter: (data) => data.points || []
    }
  },
  'catalog-service-distribution': {
    id: 'catalog-service-distribution',
    module: 'catalog',
    type: 'pie',
    title: 'Distribución de servicios',
    value: '0',
    change: '',
    changeStatus: 'neutral',
    description: 'Distribución por categoría de servicios',
    endpoint: '/api/metrica/prestadores/servicios/distribucion',
    category: 'distribution',
    hasRealService: true,
    serviceConfig: {
      serviceName: 'getCatalogServiceDistribution',
      serviceModule: 'catalogService',
      chartDataFormatter: (data) => data.chartData,
      valueFormatter: (data) => data.total?.toString() || '0',
      changeFormatter: () => '', // Los gráficos de torta no usan change
      statusMapper: () => 'neutral'
    }
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
    description: 'Número de solicitudes de servicio creadas en el periodo seleccionado',
    endpoint: '/api/metrica/solicitudes/volumen',
    category: 'usage',
    allowToggleToChart: true,
    toggleChartKind: 'line',
    hasRealService: true,
    acceptsFilters: ['rubro', 'zona', 'tipoSolicitud'],
    serviceConfig: {
      serviceName: 'getAppRequestsCreated',
      serviceModule: 'appSearchsAndRequests',
      valueFormatter: (data) => data.value?.toString() || '0',
      changeFormatter: (data) => {
        const sign = data.changeStatus === 'positivo' ? '+' : data.changeStatus === 'negativo' ? '-' : '';
        const value = Math.abs(data.change || 0);
        return data.changeType === 'porcentaje' ? `${sign}${value}%` : `${sign}${value}`;
      },
      statusMapper: (status) => ({
        'positivo': 'positive',
        'negativo': 'negative',
        'neutro': 'neutral'
      }[status] || 'neutral'),
      chartDataFormatter: (data) => data.chartData || []
    }
  },
  'app-cancellation-rate': {
    id: 'app-cancellation-rate',
    module: 'app',
    type: 'card',
    title: 'Tasa de cancelación',
    value: '12.3%',
    change: '-2.1%',
    changeStatus: 'positive',
    description: 'Porcentaje de solicitudes canceladas sobre el total de las solicitudes',
    endpoint: '/api/metrica/solicitudes/tasa-cancelacion',
    category: 'retention',
    allowToggleToChart: true,
    toggleChartKind: 'line',
    hasRealService: true,
    acceptsFilters: ['rubro', 'zona', 'tipoSolicitud'],
    serviceConfig: {
      serviceName: 'getAppCancellationRate',
      serviceModule: 'appSearchsAndRequests',
      valueFormatter: (data) => `${data.value}%`,
      changeFormatter: (data) => {
        const sign = data.changeStatus === 'positivo' ? '+' : data.changeStatus === 'negativo' ? '-' : '';
        const value = Math.abs(data.change || 0);
        return data.changeType === 'porcentaje' ? `${sign}${value}%` : `${sign}${value}`;
      },
      statusMapper: (status) => ({
        'positivo': 'positive',
        'negativo': 'negative',
        'neutro': 'neutral'
      }[status] || 'neutral'),
      chartDataFormatter: (data) => data.chartData || []
    }
  },
  'app-time-to-first-quote': {
    id: 'app-time-to-first-quote',
    module: 'app',
    type: 'card',
    title: 'Tiempo a primera cotización',
    value: '2.1h',
    change: '-0.3h',
    changeStatus: 'positive',
    description: 'Tiempo promedio desde solicitud creada hasta primera cotización',
    endpoint: '/api/metrica/solicitudes/tiempo-primera-cotizacion',
    category: 'performance',
    allowToggleToChart: true,
    toggleChartKind: 'line',
    hasRealService: true,
    acceptsFilters: ['rubro', 'zona', 'tipoSolicitud'],
    serviceConfig: {
      serviceName: 'getAppTimeToFirstQuote',
      serviceModule: 'appSearchsAndRequests',
      valueFormatter: (data) => `${data.value}h`,
      changeFormatter: (data) => {
        const sign = data.changeStatus === 'positivo' ? '+' : data.changeStatus === 'negativo' ? '-' : '';
        const value = Math.abs(data.change || 0);
        return `${sign}${value}h`;
      },
      statusMapper: (status) => ({
        'positivo': 'positive',
        'negativo': 'negative',
        'neutro': 'neutral'
      }[status] || 'neutral'),
      chartDataFormatter: (data) => data.chartData || []
    }
  },
  'app-quote-conversion-rate': {
    id: 'app-quote-conversion-rate',
    module: 'app',
    type: 'card',
    title: 'Conversión a cotización aceptada',
    value: '68.5%',
    change: '+12.3%',
    changeStatus: 'positive',
    description: 'Porcentaje de cotizaciones emitidas que fueron aceptadas',
    endpoint: '/api/metrica/matching/cotizaciones/conversion-aceptada',
    category: 'conversion',
    allowToggleToChart: true,
    toggleChartKind: 'line',
    hasRealService: true,
    acceptsFilters: ['rubro', 'zona', 'tipoSolicitud'],
    serviceConfig: {
      serviceName: 'getAppQuoteConversionRate',
      serviceModule: 'appSearchsAndRequests',
      valueFormatter: (data) => `${data.value}%`,
      changeFormatter: (data) => {
        const sign = data.changeStatus === 'positivo' ? '+' : data.changeStatus === 'negativo' ? '-' : '';
        const value = Math.abs(data.change || 0);
        return data.changeType === 'porcentaje' ? `${sign}${value}%` : `${sign}${value}`;
      },
      statusMapper: (status) => ({
        'positivo': 'positive',
        'negativo': 'negative',
        'neutro': 'neutral'
      }[status] || 'neutral'),
      chartDataFormatter: (data) => data.chartData || []
    }
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
    allowToggleToChart: true,
    toggleChartKind: 'line',
    // Configuración para integración con servicio real
    hasRealService: true,
    acceptsFilters: ['rubro', 'zona', 'metodo'],
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
        'negativo': 'negative',
        'neutro': 'neutral'
      }[status] || 'neutral')
    }
  },
  'payments-processing-time': {
    id: 'payments-processing-time',
    module: 'payments',
    type: 'card',
    title: 'Tiempo de procesamiento',
    value: '2.3s',
    change: '-12%',
    changeStatus: 'positive',
    description: 'Tiempo promedio de procesamiento de pagos en minutos.',
    endpoint: '/api/metrica/pagos/tiempo-procesamiento',
    category: 'performance',
    allowToggleToChart: true,
    toggleChartKind: 'line',
    // Configuración para integración con servicio real
    hasRealService: true,
    acceptsFilters: ['rubro', 'zona', 'metodo'],
    serviceConfig: {
      serviceName: 'getPaymentProcessingTimeMetrics',
      serviceModule: 'paymentMetricsService',
      valueFormatter: (data) => `${data.value.toFixed(1)}m`,
      changeFormatter: (data) => {
        const sign = data.changeStatus === 'positivo' ? '+' : data.changeStatus === 'negativo' ? '-' : '';
        const value = Math.abs(data.change || 0);
        return data.changeType === 'porcentaje' ? `${sign}${value}%` : `${sign}${value.toFixed(1)}m`;
      },
      statusMapper: (status) => ({
        'positivo': 'positive',
        'negativo': 'negative',
        'neutro': 'neutral'
      }[status] || 'neutral')
    }
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
    endpoint: '/api/metrica/pagos/distribucion-eventos',
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
  'payments-method-distribution': {
    id: 'payments-method-distribution',
    module: 'payments',
    type: 'pie',
    title: 'Distribución métodos de pago',
    value: '0',
    change: '0%',
    changeStatus: 'neutral',
    description: 'Distribución de pagos por método de pago',
    endpoint: '/api/metrica/pagos/distribucion-metodos',
    category: 'distribution',
    hasRealService: true,
    acceptsFilters: ['rubro', 'zona', 'metodo'],
    serviceConfig: {
      serviceName: 'getPaymentMethodDistributionMetrics',
      serviceModule: 'paymentMetricsService',
      chartDataFormatter: (data) => data.chartData,
      valueFormatter: (data) => data.total?.toString() || '0',
      changeFormatter: () => '',
      statusMapper: () => 'neutral'
    }
  },
  'payments-gross-revenue': {
    id: 'payments-gross-revenue',
    module: 'payments',
    type: 'card',
    title: 'Ingreso bruto',
    value: '$0',
    change: '0%',
    changeStatus: 'neutral',
    description: 'Ingreso bruto total de pagos aprobados en ARS',
    endpoint: '/api/metrica/pagos/ingreso-ticket',
    category: 'revenue',
    allowToggleToChart: true,
    toggleChartKind: 'line',
    hasRealService: true,
    acceptsFilters: ['rubro', 'zona', 'metodo'],
    serviceConfig: {
      serviceName: 'getPaymentGrossRevenueMetrics',
      serviceModule: 'paymentMetricsService',
      valueFormatter: (data) => `$${new Intl.NumberFormat('es-AR').format(Math.round(data.value))}`,
      changeFormatter: (data) => {
        const sign = data.changeStatus === 'positivo' ? '+' : data.changeStatus === 'negativo' ? '-' : '';
        const value = Math.abs(data.change || 0);
        return data.changeType === 'porcentaje' ? `${sign}${value}%` : `${sign}$${new Intl.NumberFormat('es-AR').format(Math.round(value))}`;
      },
      statusMapper: (status) => ({
        'positivo': 'positive',
        'negativo': 'negative',
        'neutro': 'neutral'
      }[status] || 'neutral')
    }
  },
  'payments-average-ticket': {
    id: 'payments-average-ticket',
    module: 'payments',
    type: 'card',
    title: 'Ticket medio',
    value: '$0',
    change: '0%',
    changeStatus: 'neutral',
    description: 'Ticket medio de pagos aprobados en ARS',
    endpoint: '/api/metrica/pagos/ingreso-ticket',
    category: 'revenue',
    allowToggleToChart: true,
    toggleChartKind: 'line',
    hasRealService: true,
    acceptsFilters: ['rubro', 'zona', 'metodo'],
    serviceConfig: {
      serviceName: 'getPaymentAverageTicketMetrics',
      serviceModule: 'paymentMetricsService',
      valueFormatter: (data) => `$${new Intl.NumberFormat('es-AR').format(Math.round(data.value))}`,
      changeFormatter: (data) => {
        const sign = data.changeStatus === 'positivo' ? '+' : data.changeStatus === 'negativo' ? '-' : '';
        const value = Math.abs(data.change || 0);
        return data.changeType === 'porcentaje' ? `${sign}${value}%` : `${sign}$${new Intl.NumberFormat('es-AR').format(Math.round(value))}`;
      },
      statusMapper: (status) => ({
        'positivo': 'positive',
        'negativo': 'negative',
        'neutro': 'neutral'
      }[status] || 'neutral')
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
    description: 'Nuevos usuarios registrados (todos los roles)',
    endpoint: '/api/metrica/usuarios/nuevos-clientes',
    category: 'growth',
    allowToggleToChart: true,
    toggleChartKind: 'line',
    hasRealService: true,
    serviceConfig: {
      serviceName: 'getUserNewRegistrations',
      serviceModule: 'userMetricsService',
      valueFormatter: (data) => data.value?.toString() || '0',
      changeFormatter: (data) => {
        const sign = data.changeStatus === 'positivo' ? '+' : data.changeStatus === 'negativo' ? '-' : '';
        const value = Math.abs(data.change || 0);
        return data.changeType === 'porcentaje' ? `${sign}${value}%` : `${sign}${value}`;
      },
      statusMapper: (status) => ({
        'positivo': 'positive',
        'negativo': 'negative',
        'neutro': 'neutral'
      }[status] || 'neutral')
    }
  },
  'users-new-customers': {
    id: 'users-new-customers',
    module: 'users',
    type: 'card',
    title: 'Nuevos clientes',
    value: '0',
    change: '0%',
    changeStatus: 'neutral',
    description: 'Nuevos clientes registrados',
    endpoint: '/api/metrica/usuarios/nuevos-clientes',
    category: 'growth',
    allowToggleToChart: true,
    toggleChartKind: 'line',
    hasRealService: true,
    serviceConfig: {
      serviceName: 'getUserNewCustomers',
      serviceModule: 'userMetricsService',
      valueFormatter: (data) => data.value?.toString() || '0',
      changeFormatter: (data) => {
        const sign = data.changeStatus === 'positivo' ? '+' : data.changeStatus === 'negativo' ? '-' : '';
        const value = Math.abs(data.change || 0);
        return data.changeType === 'porcentaje' ? `${sign}${value}%` : `${sign}${value}`;
      },
      statusMapper: (status) => ({
        'positivo': 'positive',
        'negativo': 'negative',
        'neutro': 'neutral'
      }[status] || 'neutral')
    }
  },
  'users-new-providers': {
    id: 'users-new-providers',
    module: 'users',
    type: 'card',
    title: 'Nuevos prestadores',
    value: '0',
    change: '0%',
    changeStatus: 'neutral',
    description: 'Nuevos prestadores registrados como usuarios',
    endpoint: '/api/metrica/usuarios/nuevos-prestadores',
    category: 'growth',
    allowToggleToChart: true,
    toggleChartKind: 'line',
    hasRealService: true,
    serviceConfig: {
      serviceName: 'getUserNewProviders',
      serviceModule: 'userMetricsService',
      valueFormatter: (data) => data.value?.toString() || '0',
      changeFormatter: (data) => {
        const sign = data.changeStatus === 'positivo' ? '+' : data.changeStatus === 'negativo' ? '-' : '';
        const value = Math.abs(data.change || 0);
        return data.changeType === 'porcentaje' ? `${sign}${value}%` : `${sign}${value}`;
      },
      statusMapper: (status) => ({
        'positivo': 'positive',
        'negativo': 'negative',
        'neutro': 'neutral'
      }[status] || 'neutral')
    }
  },
  'users-inactive-rate': {
    id: 'users-inactive-rate',
    module: 'users',
    type: 'card',
    title: 'Usuarios inactivos',
    value: '0%',
    change: '0%',
    changeStatus: 'neutral',
    description: 'Porcentaje de usuarios inactivos en el sistema',
    endpoint: '/api/metrica/usuarios/tasa-roles-activos',
    category: 'management',
    allowToggleToChart: false,
    hasRealService: true,
    serviceConfig: {
      serviceName: 'getUserInactiveRate',
      serviceModule: 'userMetricsService',
      // Necesitamos extraer el changeStatus de data.tasaInactivos para que useMetrics lo use
      changeStatusExtractor: (data) => data.tasaInactivos?.changeStatus || 'neutral',
      valueFormatter: (data) => `${data.tasaInactivos?.value || 0}%`,
      changeFormatter: (data) => {
        const change = data.tasaInactivos?.change || 0;
        const sign = data.tasaInactivos?.changeStatus === 'positivo' ? '+' : data.tasaInactivos?.changeStatus === 'negativo' ? '-' : '';
        return `${sign}${Math.abs(change)}%`;
      },
      statusMapper: (status) => ({
        'positivo': 'positive',
        'negativo': 'negative',
        'neutro': 'neutral'
      }[status] || 'neutral'),
      chartDataFormatter: (data) => data.tasaInactivos?.chartData || []
    }
  },
  'users-role-distribution': {
    id: 'users-role-distribution',
    module: 'users',
    type: 'pie',
    title: 'Distribución por rol',
    value: '0',
    change: '',
    changeStatus: 'neutral',
    description: 'Distribución histórica total de usuarios por rol',
    endpoint: '/api/metrica/usuarios/distribucion-por-rol',
    category: 'distribution',
    allowToggleToChart: false,
    hasRealService: true,
    serviceConfig: {
      serviceName: 'getUserRoleDistribution',
      serviceModule: 'userMetricsService',
      chartDataFormatter: (data) => {
        // Helper para colores por rol
        const getRoleColor = (rol) => {
          const colors = {
            'cliente': '#3b82f6',      // Azul
            'prestador': '#10b981',    // Verde
            'admin': '#f59e0b',        // Amarillo/Naranja
            'administrador': '#f59e0b', // Amarillo/Naranja (alias)
            'customer': '#3b82f6',     // Azul (alias inglés)
            'provider': '#10b981'      // Verde (alias inglés)
          };
          return colors[rol?.toLowerCase()] || '#6b7280'; // Gris por defecto
        };
        
        // Convertir objeto a array para el gráfico pie con colores
        return Object.entries(data).map(([role, count]) => ({
          name: role.charAt(0).toUpperCase() + role.slice(1), // Capitalizar primera letra
          value: typeof count === 'number' ? count : 0,
          color: getRoleColor(role)
        }));
      },
      valueFormatter: (data) => {
        const total = Object.values(data).reduce((sum, count) => sum + count, 0);
        return total.toString();
      },
      changeFormatter: () => '',
      statusMapper: () => 'neutral'
    }
  },
  'users-total': {
    id: 'users-total',
    module: 'users',
    type: 'card',
    title: 'Total de usuarios',
    value: '0',
    change: '',
    changeStatus: 'neutral',
    description: 'Cantidad total de usuarios registrados en la plataforma',
    endpoint: '/api/metrica/usuarios/totales',
    category: 'overview',
    allowToggleToChart: false,
    hasRealService: true,
    hideChangeIndicator: true, // Ocultar completamente el indicador de cambio
    customPeriodLabel: 'Registrados en la plataforma', // Label personalizado para esta métrica
    serviceConfig: {
      serviceName: 'getUserTotal',
      serviceModule: 'userMetricsService',
      valueFormatter: (data) => data.value?.toString() || '0',
      changeFormatter: () => '',
      statusMapper: () => 'neutral'
    }
  },
  

  // === MATCHING ===
  'matching-average-time': {
    id: 'matching-average-time',
    module: 'matching',
    type: 'card',
    title: 'Tiempo promedio de matching',
    value: '0',
    change: '0%',
    changeStatus: 'neutral',
    description: 'Tiempo promedio que toma realizar el matching',
    endpoint: '/api/metrica/matching/tiempo-promedio',
    category: 'performance',
    allowToggleToChart: true,
    toggleChartKind: 'line',
    hasRealService: true,
    acceptsFilters: ['rubro', 'zona', 'tipoSolicitud'],
    serviceConfig: {
      serviceName: 'getMatchingAverageTimeMetrics',
      serviceModule: 'matchingMetricsService',
      valueFormatter: (data) => {
        // El backend devuelve tiempo en minutos, convertirlo a formato legible
        const minutes = data.value || 0;
        if (minutes < 60) {
          return `${Math.round(minutes)}m`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return `${hours}h ${mins}m`;
      },
      changeFormatter: (data) => {
        const sign = data.changeStatus === 'positivo' ? '+' : data.changeStatus === 'negativo' ? '-' : '';
        const value = Math.abs(data.change || 0);
        return data.changeType === 'porcentaje' ? `${sign}${value}%` : `${sign}${value.toFixed(1)}m`;
      },
      statusMapper: (status) => ({
        'positivo': 'negative', // Menos tiempo es mejor
        'negativo': 'positive',
        'neutro': 'neutral'
      }[status] || 'neutral')
    }
  },
  'matching-pending-quotes': {
    id: 'matching-pending-quotes',
    module: 'matching',
    type: 'card',
    title: 'Cotizaciones pendientes',
    value: '0',
    change: '0%',
    changeStatus: 'neutral',
    description: 'Número de cotizaciones pendientes',
    endpoint: '/api/metrica/matching/cotizaciones/pendientes',
    category: 'workflow',
    allowToggleToChart: true,
    toggleChartKind: 'line',
    hasRealService: true,
    acceptsFilters: ['rubro', 'zona', 'tipoSolicitud'],
    serviceConfig: {
      serviceName: 'getMatchingPendingQuotesMetrics',
      serviceModule: 'matchingMetricsService',
      valueFormatter: (data) => data.value?.toString() || '0',
      changeFormatter: (data) => {
        const sign = data.changeStatus === 'positivo' ? '+' : data.changeStatus === 'negativo' ? '-' : '';
        const value = Math.abs(data.change || 0);
        return data.changeType === 'porcentaje' ? `${sign}${value}%` : `${sign}${value}`;
      },
      statusMapper: (status) => ({
        'positivo': 'negative', // Más pendientes es peor
        'negativo': 'positive',
        'neutro': 'neutral'
      }[status] || 'neutral')
    }
  },
  'matching-provider-response-time': {
    id: 'matching-provider-response-time',
    module: 'matching',
    type: 'card',
    title: 'Tiempo de respuesta del prestador',
    value: '0',
    change: '0%',
    changeStatus: 'neutral',
    description: 'Tiempo promedio que toma un prestador en responder',
    endpoint: '/api/metrica/matching/prestadores/tiempo-respuesta',
    category: 'performance',
    allowToggleToChart: true,
    toggleChartKind: 'line',
    hasRealService: true,
    acceptsFilters: ['rubro', 'zona', 'tipoSolicitud'],
    serviceConfig: {
      serviceName: 'getMatchingProviderResponseTimeMetrics',
      serviceModule: 'matchingMetricsService',
      valueFormatter: (data) => {
        const minutes = data.value || 0;
        if (minutes < 60) {
          return `${Math.round(minutes)}m`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return `${hours}h ${mins}m`;
      },
      changeFormatter: (data) => {
        const sign = data.changeStatus === 'positivo' ? '+' : data.changeStatus === 'negativo' ? '-' : '';
        const value = Math.abs(data.change || 0);
        return data.changeType === 'porcentaje' ? `${sign}${value}%` : `${sign}${value.toFixed(1)}m`;
      },
      statusMapper: (status) => ({
        'positivo': 'negative', // Menos tiempo es mejor
        'negativo': 'positive',
        'neutro': 'neutral'
      }[status] || 'neutral')
    }
  },
  'matching-expiration-rate': {
    id: 'matching-expiration-rate',
    module: 'matching',
    type: 'card',
    title: 'Tasa de cotizaciones expiradas',
    value: '0%',
    change: '0%',
    changeStatus: 'neutral',
    description: 'Porcentaje de cotizaciones que expiran sin respuesta',
    endpoint: '/api/metrica/matching/cotizaciones/tasa-expiracion',
    category: 'quality',
    allowToggleToChart: true,
    toggleChartKind: 'line',
    hasRealService: true,
    acceptsFilters: ['rubro', 'zona', 'tipoSolicitud'],
    serviceConfig: {
      serviceName: 'getMatchingExpirationRateMetrics',
      serviceModule: 'matchingMetricsService',
      valueFormatter: (data) => `${data.value}%`,
      changeFormatter: (data) => {
        const sign = data.changeStatus === 'positivo' ? '+' : data.changeStatus === 'negativo' ? '-' : '';
        const value = Math.abs(data.change || 0);
        return data.changeType === 'porcentaje' ? `${sign}${value}%` : `${sign}${value}`;
      },
      statusMapper: (status) => ({
        'positivo': 'negative', // Más expiraciones es peor
        'negativo': 'positive',
        'neutro': 'neutral'
      }[status] || 'neutral')
    }
  }
};

// Configuraciones predefinidas por módulo
export const MODULE_METRICS = {
  core: ['core-processing-time', 'core-retry-success', 'core-messages-flow'],
  catalog: ['catalog-win-rate', 'catalog-service-distribution', 'catalog-orders-heatmap'],
  app: ['app-requests-created', 'app-cancellation-rate', 'app-time-to-first-quote', 'app-quote-conversion-rate'],
  payments: ['payments-success-rate', 'payments-processing-time', 'payments-event-distribution', 'payments-method-distribution', 'payments-gross-revenue', 'payments-average-ticket'],
  users: ['users-new-registrations', 'users-new-customers', 'users-new-providers', 'users-inactive-rate', 'users-role-distribution', 'users-total'],
  matching: ['matching-average-time', 'matching-pending-quotes', 'matching-provider-response-time', 'matching-expiration-rate']
};

// Configuración por defecto del dashboard
export const DEFAULT_DASHBOARD_METRICS = [
  'core-processing-time',
  'catalog-win-rate', 
  'app-requests-created',
  'payments-success-rate'
];

// Función helper para obtener métricas por módulo
export const getMetricsByModule = (module) => {
  return MODULE_METRICS[module]?.map(id => METRICS_REGISTRY[id]).filter(Boolean) || [];
};

// Función helper para obtener una métrica específica
export const getMetric = (id) => {
  return METRICS_REGISTRY[id];
};

// Función helper para obtener múltiples métricas
export const getMetrics = (ids) => {
  return ids.map(id => METRICS_REGISTRY[id]).filter(Boolean);
};
