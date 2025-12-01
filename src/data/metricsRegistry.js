// Registro centralizado de todas las métricas disponibles
// Cada métrica tiene toda la información necesaria para renderizarse

// Helper function para formatear cambios en métricas de porcentaje
const formatPercentageChange = (data) => {
  const sign = data.changeStatus === 'positivo' ? '+' : data.changeStatus === 'negativo' ? '-' : '';
  const value = Math.abs(data.change || 0);
  
  if (data.changeType === 'porcentaje') {
    return `${sign}${value}%`;
  } else {
    // Cambio absoluto en puntos porcentuales
    return `${sign}${value}% (abs)`;
  }
};

export const METRICS_REGISTRY = {
  // === RUBROS ===
  'rubros-ingresos-top5': {
    id: 'rubros-ingresos-top5',
    module: 'catalog',
    type: 'table',
    title: 'Top 5 Rubros por Ingresos',
    value: '',
    change: '',
    changeStatus: 'neutral',
    description: 'Tabla de los 5 rubros con mayor ingreso en el período seleccionado.',
    infoExtra: 'Muestra los rubros con mayor facturación. Al hacer click en un rubro, se muestra la tendencia histórica de ingresos para ese rubro.',
    endpoint: '/api/metrica/rubros/ingresos-por-categoria',
    category: 'revenue',
    allowToggleToChart: true,
    toggleChartKind: 'line',
    hasRealService: true,
    acceptsFilters: ['rubro', 'zona'],
    serviceConfig: {
      serviceName: 'getRubrosIngresosTotales',
      serviceModule: 'catalogService',
      tableDataFormatter: (data) => {
        if (!data?.categorias) return [];
        return [...data.categorias]
          .sort((a, b) => b.ingresos_actuales - a.ingresos_actuales)
          .slice(0, 5)
          .map(cat => ({
            id: cat.id_rubro,
            nombre: cat.nombre_rubro,
            ingresos: cat.ingresos_actuales,
            cambio: cat.cambio,
            cambioEstado: cat.cambio_estado,
            datosHistoricos: cat.datos_historicos
          }));
      },
      // Columnas que la tabla debe mostrar (keys del row)
      tableColumns: ['nombre', 'ingresos', 'cambio', 'cambioEstado'],
      // Etiquetas legibles para los encabezados
      tableColumnHeaders: {
        nombre: 'Categoría',
        ingresos: 'Ingresos',
        cambio: 'Cambio',
        cambioEstado: 'Tendencia'
      },
      // Formateador de celdas: recibe key y row
      tableCellRenderer: (col, row) => {
        if (col === 'nombre') return row.nombre || '-';
        if (col === 'ingresos') return row.ingresos != null ? `$${Number(row.ingresos).toLocaleString('es-AR')}` : '-';
        if (col === 'cambio') return row.cambio != null ? `$${Number(row.cambio).toLocaleString('es-AR')}` : '-';
        if (col === 'cambioEstado') {
          if (row.cambioEstado === 'positivo') return '↑';
          if (row.cambioEstado === 'negativo') return '↓';
          return '→';
        }
        return row[col] ?? '-';
      },
      valueFormatter: () => '',
      changeFormatter: () => '',
      statusMapper: () => 'neutral',
      chartDataFormatter: (data, selectedRow) => {
        // Si el usuario hace click en una fila, mostrar la tendencia de ese rubro
        if (!selectedRow?.datosHistoricos) return [];
        return selectedRow.datosHistoricos.map(d => ({
          date: d.date,
          value: d.value
        }));
      }
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
    infoExtra: 'Usuarios registrados con rol "cliente" en el período seleccionado. Son los usuarios que consumen servicios (solicitan trabajos). Permite medir el crecimiento del lado de la demanda de la plataforma.',
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
    infoExtra: 'Usuarios registrados con rol "prestador" en el período seleccionado. Son los profesionales/empresas que ofrecen servicios en la plataforma. Métrica crucial para medir el crecimiento del lado de la oferta y la capacidad de atender demanda.',
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
  'users-new-unsubscribes': {
    id: 'users-new-unsubscribes',
    module: 'users',
    type: 'card',
    title: 'Nuevas bajas',
    value: '0',
    change: '0%',
    changeStatus: 'neutral',
    description: 'Usuarios que se dieron de baja en el período seleccionado',
    infoExtra: 'Usuarios que completaron el proceso de baja (desactivación de cuenta) en el período. Incluye todos los roles. Métrica importante para medir churn y detectar problemas de retención.',
    endpoint: '/api/metrica/usuarios/nuevas-bajas',
    category: 'retention',
    allowToggleToChart: true,
    toggleChartKind: 'line',
    hasRealService: true,
    serviceConfig: {
      serviceName: 'getUserNewUnsubscribes',
      serviceModule: 'userMetricsService',
      valueFormatter: (data) => data.value?.toString() || '0',
      changeFormatter: (data) => {
        const sign = data.changeStatus === 'positivo' ? '+' : data.changeStatus === 'negativo' ? '-' : '';
        const value = Math.abs(data.change || 0);
        return data.changeType === 'porcentaje' ? `${sign}${value}%` : `${sign}${value}`;
      },
      statusMapper: (status) => ({
        'positivo': 'negative',  // Invertido: más bajas es malo
        'negativo': 'positive',  // Invertido: menos bajas es bueno
        'neutro': 'neutral'
      }[status] || 'neutral'),
      chartDataFormatter: (data) => data.chartData || []
    }
  },
  // === CATÁLOGO ===
  'catalog-service-distribution': {
    id: 'catalog-service-distribution',
    module: 'catalog',
    type: 'pie',
    title: 'Distribución de prestadores por habilidad',
    value: '0',
    change: '',
    changeStatus: 'neutral',
    description: 'Cantidad de prestadores que ofrecen cada tipo de servicio',
    infoExtra: 'Muestra la cantidad de prestadores activos agrupados por cada habilidad/servicio específico que ofrecen (ej: Plomería, Electricidad, Carpintería). Un prestador puede aparecer en múltiples categorías si ofrece varios servicios. Los datos se pueden filtrar por zona geográfica y rubro.',
    endpoint: '/api/metrica/prestadores/servicios/distribucion',
    category: 'distribution',
    hasRealService: true,
    acceptsFilters: ['zona', 'rubro'],
    serviceConfig: {
      serviceName: 'getCatalogServiceDistribution',
      serviceModule: 'catalogService',
      chartDataFormatter: (data) => data.chartData,
      valueFormatter: (data) => data.total?.toString() || '0',
      changeFormatter: () => '', // Los gráficos de torta no usan change
      statusMapper: () => 'neutral'
    }
  },
  'catalog-service-distribution-by-category': {
    id: 'catalog-service-distribution-by-category',
    module: 'catalog',
    type: 'pie',
    title: 'Distribución de prestadores por rubro',
    value: '0',
    change: '',
    changeStatus: 'neutral',
    description: 'Cantidad de prestadores especializados en cada categoría de rubro',
    infoExtra: 'Agrupa prestadores por rubro principal (categorías generales como "Construcción", "Tecnología", "Servicios del Hogar"). Un prestador se cuenta en cada rubro donde tiene al menos una habilidad activa. Permite ver la distribución de la oferta de servicios por grandes áreas. Filtrable por zona geográfica.',
    endpoint: '/api/metrica/prestadores/servicios/distribucion-por-rubro',
    category: 'distribution',
    hasRealService: true,
    acceptsFilters: ['zona'], // NO acepta filtro de rubro (es la distribución POR rubros)
    serviceConfig: {
      serviceName: 'getCatalogServiceDistributionByCategory',
      serviceModule: 'catalogService',
      chartDataFormatter: (data) => data.chartData,
      valueFormatter: (data) => data.total?.toString() || '0',
      changeFormatter: () => '',
      statusMapper: () => 'neutral'
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
    infoExtra: 'Calcula la proporción de pagos con estado "aprobado" o "completado" sobre el total de intentos de pago procesados en el período. Incluye todos los métodos de pago (tarjeta, transferencia, efectivo, etc.). Excluye pagos en estado "pendiente" o "en_proceso". Una tasa alta indica un buen funcionamiento del sistema de pagos.',
    endpoint: '/api/metrica/pagos/exitosos',
    category: 'performance',
    allowToggleToChart: true,
    toggleChartKind: 'line',
    // Configuración para integración con servicio real
    hasRealService: true,
    acceptsFilters: ['rubro', 'zona'],
    serviceConfig: {
      serviceName: 'getPaymentSuccessMetrics',
      serviceModule: 'paymentMetricsService',
      valueFormatter: (data) => `${data.value}%`,
      changeFormatter: formatPercentageChange,
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
    infoExtra: 'Mide el tiempo promedio transcurrido desde que se inicia un pago hasta que se completa exitosamente. Solo considera pagos aprobados. El tiempo se calcula en minutos. Valores más bajos indican mejor performance del sistema de pagos.',
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
        'positivo': 'negative',
        'negativo': 'positive',
        'neutro': 'neutral'
      }[status] || 'neutral')
    }
  },
  'payments-event-distribution': {
    id: 'payments-event-distribution',
    module: 'payments',
    type: 'pie',
    title: 'Distribución eventos de pago',
    description: 'Distribución por estado de pago',
    infoExtra: 'Muestra la cantidad de pagos agrupados por su estado: Aprobado (transacción exitosa), Rechazado (denegado por el procesador), Pendiente (en proceso de verificación). Permite identificar la salud del flujo de pagos y detectar problemas recurrentes en el procesamiento.',
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
    infoExtra: 'Agrupa los pagos exitosos según el método utilizado: tarjeta de crédito, tarjeta de débito, transferencia bancaria, efectivo, billeteras digitales, etc. Permite entender las preferencias de pago de los usuarios y optimizar la oferta de métodos de pago. Solo cuenta pagos aprobados.',
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
    infoExtra: 'Suma total del monto de todos los pagos con estado "aprobado" en el período seleccionado, expresado en pesos argentinos (ARS). Representa el volumen bruto de transacciones exitosas antes de comisiones o descuentos. Útil para medir el volumen de negocio y la evolución de ingresos.',
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
    infoExtra: 'Promedio del monto de los pagos aprobados en el período (ingreso bruto / cantidad de pagos). Refleja el valor promedio de cada transacción exitosa. Un ticket medio alto puede indicar servicios de mayor valor, mientras que uno bajo puede sugerir servicios más accesibles o múltiples pagos pequeños.',
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
    infoExtra: 'Cuenta todos los nuevos usuarios que completaron el registro en el período, independientemente de su rol (clientes, prestadores, administradores). Métrica clave para medir el crecimiento de la plataforma y la efectividad de campañas de adquisición.',
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
  'users-role-distribution': {
    id: 'users-role-distribution',
    module: 'users',
    type: 'pie',
    title: 'Distribución por rol',
    value: '0',
    change: '',
    changeStatus: 'neutral',
    description: 'Distribución histórica total de usuarios por rol',
    infoExtra: 'Muestra la cantidad total de usuarios activos agrupados por su rol principal (cliente, prestador, administrador). No considera el período seleccionado, es un snapshot del estado actual de la plataforma. Usuarios dados de baja no se cuentan. Útil para entender la composición de la base de usuarios.',
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
    infoExtra: 'Cuenta todos los usuarios registrados históricamente, independiente del período seleccionado. Excluye usuarios dados de baja. Incluye todos los roles. Representa el tamaño total de la base de usuarios activos de la plataforma en el momento actual.',
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
  // === SOLICITUDES Y MATCHING (métricas específicas para la sección combinada) ===
  'requests-solicitudes-creadas': {
    id: 'requests-solicitudes-creadas',
    module: 'requests',
    type: 'card',
    title: 'Solicitudes creadas',
    value: '0',
    change: '0%',
    changeStatus: 'neutral',
    description: 'Número de solicitudes de servicio creadas en el periodo seleccionado',
    infoExtra: 'Cuenta todas las solicitudes de servicio creadas por clientes en el período. Incluye solicitudes abiertas (sin prestador específico) y dirigidas (a un prestador en particular). Métrica fundamental para medir la actividad y demanda en la plataforma.',
    endpoint: '/api/metrica/solicitudes/volumen',
    category: 'usage',
    allowToggleToChart: true,
    toggleChartKind: 'line',
    hasRealService: true,
    acceptsFilters: ['rubro', 'tipoSolicitud'], // Zona removida - no confiable en solicitudes
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
  'requests-mapa-calor': {
    id: 'requests-mapa-calor',
    module: 'requests',
    type: 'map',
    title: 'Mapa de calor de solicitudes',
    description: 'Distribución geográfica de solicitudes',
    infoExtra: 'Visualización geográfica de la concentración de solicitudes por zona. Muestra la ubicación y cantidad de solicitudes generadas en cada zona durante el período. Las zonas con más solicitudes aparecen con mayor intensidad. Permite identificar áreas de alta demanda y optimizar la distribución de prestadores.',
    endpoint: '/api/metrica/solicitudes/mapa-calor',
    category: 'distribution',
    hasRealService: true,
    acceptsFilters: ['rubro', 'tipoSolicitud'], // Zona removida - mapa usa geocodificación de direcciones
    serviceConfig: {
      serviceName: 'getCatalogOrdersHeatmap',
      serviceModule: 'catalogService',
      valueFormatter: () => '',
      changeFormatter: () => '',
      statusMapper: () => 'neutral',
      pointsFormatter: (data) => data.points || []
    }
  },
  'requests-tasa-aceptacion': {
    id: 'requests-tasa-aceptacion',
    module: 'requests',
    type: 'card',
    title: 'Tasa de solicitudes aceptadas',
    value: '0%',
    change: '0%',
    changeStatus: 'neutral',
    description: 'Porcentaje de solicitudes aceptadas sobre solicitudes resueltas',
    infoExtra: 'Calcula el porcentaje de solicitudes aceptadas sobre el total de solicitudes con resultado definitivo (aceptadas + canceladas), excluyendo las que aún están pendientes. Una solicitud se considera "aceptada" cuando el cliente confirma una cotización presentada por un prestador, y "cancelada" cuando el cliente o el sistema cancela la solicitud. Métrica clave de conversión del funnel de matching que refleja la efectividad de los matches realizados.',
    endpoint: '/api/metrica/matching/cotizaciones/conversion-aceptada',
    category: 'conversion',
    allowToggleToChart: true,
    toggleChartKind: 'line',
    hasRealService: true,
    acceptsFilters: ['rubro', 'tipoSolicitud'], // Zona removida - no confiable en solicitudes
    serviceConfig: {
      serviceName: 'getMatchingConversionRate',
      serviceModule: 'matchingMetricsService',
      valueFormatter: (data) => `${data.value}%`,
      changeFormatter: formatPercentageChange,
      statusMapper: (status) => ({
        'positivo': 'positive',
        'negativo': 'negative',
        'neutro': 'neutral'
      }[status] || 'neutral'),
      chartDataFormatter: (data) => data.chartData || []
    }
  },
  // ⚠️ DEPRECATED - Backend endpoint removed (tabla cotizaciones eliminada)
  /*
  'requests-tiempo-primera-cotizacion': {
    id: 'requests-tiempo-primera-cotizacion',
    module: 'requests',
    type: 'card',
    title: 'Tiempo a primera cotización',
    value: '0m',
    change: '0%',
    changeStatus: 'neutral',
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
        'positivo': 'negative',
        'negativo': 'positive',
        'neutro': 'neutral'
      }[status] || 'neutral'),
      chartDataFormatter: (data) => data.chartData || []
    }
  },
  */
  'requests-solicitudes-pendientes': {
    id: 'requests-cotizaciones-pendientes',
    module: 'requests',
    type: 'card',
    title: 'Solicitudes pendientes',
    value: '0',
    change: '0%',
    changeStatus: 'neutral',
    description: 'Número de solicitudes que aún no han sido aceptadas ni rechazadas',
    infoExtra: 'Cuenta solicitudes creadas en el período que aún están en proceso: sin aceptación confirmada, sin prestador asignado, y que no hayan sido canceladas ni rechazadas. Representa solicitudes activas esperando respuesta o acción. Un valor alto puede indicar cuellos de botella en el matching.',
    endpoint: '/api/metrica/matching/solicitudes/pendientes',
    category: 'workflow',
    allowToggleToChart: true,
    toggleChartKind: 'line',
    hasRealService: true,
    acceptsFilters: ['rubro', 'tipoSolicitud'], // Zona removida - no confiable en solicitudes
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
        'positivo': 'negative',
        'negativo': 'positive',
        'neutro': 'neutral'
      }[status] || 'neutral')
    }
  },
  'requests-tiempo-matching': {
    id: 'requests-tiempo-matching',
    module: 'requests',
    type: 'card',
    title: 'Tiempo promedio de matching',
    value: '0m',
    change: '0%',
    changeStatus: 'neutral',
    description: 'Tiempo promedio desde que se crea la solicitud hasta que se acepta la cotización',
    infoExtra: 'Calcula el tiempo promedio (en minutos) desde que se crea una solicitud hasta que el cliente acepta una cotización. Solo considera solicitudes aceptadas. Métrica crítica de velocidad del proceso de matching. Tiempos más bajos indican mejor eficiencia en conectar oferta y demanda.',
    endpoint: '/api/metrica/matching/tiempo-promedio',
    category: 'performance',
    allowToggleToChart: true,
    toggleChartKind: 'line',
    hasRealService: true,
    acceptsFilters: ['rubro', 'tipoSolicitud'], // Zona removida - no confiable en solicitudes
    valueFormatter: (value) => {
      // Formatter para el tooltip del gráfico (recibe valor numérico simple)
      const minutes = typeof value === 'number' ? value : (value?.value || 0);
      if (minutes < 60) {
        return minutes === 0 ? '0m' : `${minutes.toFixed(2)}m`;
      }
      const hours = Math.floor(minutes / 60);
      const mins = (minutes % 60).toFixed(2);
      return `${hours}h ${mins}m`;
    },
    serviceConfig: {
      serviceName: 'getMatchingAverageTimeMetrics',
      serviceModule: 'matchingMetricsService',
      valueFormatter: (data) => {
        const minutes = data.value || 0;
        if (minutes < 60) {
          return minutes === 0 ? '0m' : `${minutes.toFixed(2)}m`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = (minutes % 60).toFixed(2);
        return `${hours}h ${mins}m`;
      },
      changeFormatter: (data) => {
        const sign = data.changeStatus === 'positivo' ? '+' : data.changeStatus === 'negativo' ? '-' : '';
        const value = Math.abs(data.change || 0);
        return data.changeType === 'porcentaje' ? `${sign}${value}%` : `${sign}${value.toFixed(2)}m`;
      },
      statusMapper: (status) => ({
        'positivo': 'negative',
        'negativo': 'positive',
        'neutro': 'neutral'
      }[status] || 'neutral')
    }
  },
  'requests-tasa-cancelacion': {
    id: 'requests-tasa-cancelacion',
    module: 'requests',
    type: 'card',
    title: 'Tasa de cancelación',
    value: '0%',
    change: '0%',
    changeStatus: 'neutral',
    description: 'Porcentaje de solicitudes canceladas sobre el total de las solicitudes',
    infoExtra: 'Calcula el porcentaje de solicitudes con estado "cancelada" sobre el total de solicitudes creadas en el período. Una solicitud se cancela cuando el cliente decide no continuar con el pedido. Tasa alta puede indicar problemas de experiencia, precio, disponibilidad o tiempos de respuesta. Métrica importante de satisfacción y abandono del proceso.',
    endpoint: '/api/metrica/solicitudes/tasa-cancelacion',
    category: 'retention',
    allowToggleToChart: true,
    toggleChartKind: 'line',
    hasRealService: true,
    acceptsFilters: ['rubro', 'tipoSolicitud'], // Zona removida - no confiable en solicitudes
    serviceConfig: {
      serviceName: 'getAppCancellationRate',
      serviceModule: 'appSearchsAndRequests',
      valueFormatter: (data) => `${data.value}%`,
      changeFormatter: formatPercentageChange,
      statusMapper: (status) => ({
        'positivo': 'negative',
        'negativo': 'positive',
        'neutro': 'neutral'
      }[status] || 'neutral'),
      chartDataFormatter: (data) => data.chartData || []
    }
  }
};

// Configuraciones predefinidas por módulo
export const MODULE_METRICS = {
  core: ['core-processing-time', 'core-retry-success', 'core-messages-flow'],
  catalog: ['catalog-service-distribution', 'catalog-service-distribution-by-category', 'catalog-orders-heatmap'],
  payments: ['payments-success-rate', 'payments-processing-time', 'payments-event-distribution', 'payments-method-distribution', 'payments-gross-revenue', 'payments-average-ticket'],
  users: ['users-new-registrations', 'users-new-customers', 'users-new-providers', 'users-new-unsubscribes', 'users-role-distribution', 'users-total'],
  requests: ['requests-solicitudes-creadas', 'requests-mapa-calor', 'requests-tasa-aceptacion', 'requests-solicitudes-pendientes', 'requests-tiempo-matching', 'requests-tasa-cancelacion']
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
