import { useState, useEffect, useMemo } from 'react';
import { METRICS_REGISTRY } from '../data/metricsRegistry';
import { useAxios } from './useAxios';

// Importar servicios dinámicamente
const importService = async (serviceModule, serviceName) => {
  try {
    let module;
    if (serviceModule === 'paymentMetricsService') {
      module = await import('../services/paymentMetricsService');
    } else if (serviceModule === 'userMetricsService') {
      module = await import('../services/userMetricsService');
    }
    return module?.[serviceName];
  } catch (error) {
    console.error(`Error importing service ${serviceName} from ${serviceModule}:`, error);
    return null;
  }
};

// Hook personalizado para manejar métricas desde el backend
export const useMetrics = (metricIds, { startDate, endDate, presetId }) => {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosInstance = useAxios();

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!axiosInstance) return; // Esperar a que axios esté listo
      
      setLoading(true);
      setError(null);

      try {
        // Obtener las definiciones base del registro
        const baseMetrics = metricIds
          .map(id => METRICS_REGISTRY[id])
          .filter(Boolean);


        // Procesar métricas en paralelo
        const metricsWithData = await Promise.all(
          baseMetrics.map(async (metric) => {
            if (metric.hasRealService && metric.serviceConfig) {
              
              try {
                // Importar y ejecutar el servicio real
                const serviceFunction = await importService(
                  metric.serviceConfig.serviceModule,
                  metric.serviceConfig.serviceName
                );
                
                if (serviceFunction) {
                  const response = await serviceFunction(axiosInstance, { startDate, endDate, period: presetId });
                  
                  if (response.success) {
                    const { serviceConfig } = metric;
                    
                    // Formatear datos según la configuración
                    const formattedMetric = {
                      ...metric,
                      value: serviceConfig.valueFormatter ? serviceConfig.valueFormatter(response.data) : response.data.value,
                      change: serviceConfig.changeFormatter ? serviceConfig.changeFormatter(response.data) : response.data.change,
                      changeStatus: serviceConfig.statusMapper ? serviceConfig.statusMapper(response.data.changeStatus) : response.data.changeStatus,
                      loading: false,
                      error: null,
                      // Para gráficos de torta, agregar los datos del gráfico
                      ...(serviceConfig.chartDataFormatter && {
                        chartData: serviceConfig.chartDataFormatter(response.data)
                      }),
                      // Marcar como datos reales
                      isRealData: true,
                      lastUpdated: response.data.lastUpdated
                    };
                    
                    return formattedMetric;
                  } else {
                    // Manejar errores controlados del servicio
                    const errorMessage = response.error?.message || 'Servicio no disponible';
                    console.warn(`⚠️ SERVICIO REAL: Error controlado en ${metric.id}:`, response.error);
                    
                    return {
                      ...metric,
                      loading: false,
                      error: errorMessage,
                      isRealData: false,
                      value: 'Servicio no disponible',
                      change: '',
                      changeStatus: 'neutral',
                      _debug: {
                        timestamp: new Date().toISOString(),
                        serviceError: response.error,
                        serviceResponse: response
                      }
                    };
                  }
                } else {
                  throw new Error('Servicio no disponible');
                }
              } catch (serviceError) {
                // Log detallado del error
                console.error(`❌ SERVICIO REAL: Error en ${metric.id}:`, {
                  error: serviceError,
                  message: serviceError.message,
                  stack: serviceError.stack,
                  response: serviceError.response?.data,
                  status: serviceError.response?.status,
                  config: {
                    url: serviceError.config?.url,
                    method: serviceError.config?.method,
                    baseURL: serviceError.config?.baseURL,
                    headers: serviceError.config?.headers
                  }
                });
                
                // Determinar mensaje de error más específico
                let errorMessage = 'Error desconocido';
                if (serviceError.response) {
                  errorMessage = `Error ${serviceError.response.status}: ${serviceError.response.data?.message || 'Error del servidor'}`;
                } else if (serviceError.request) {
                  errorMessage = 'No se pudo conectar con el servidor';
                } else if (serviceError.message) {
                  errorMessage = serviceError.message;
                }

                return {
                  ...metric,
                  loading: false,
                  error: errorMessage,
                  isRealData: false,
                  // NO mostrar datos genéricos cuando falla el servicio real
                  value: 'Error',
                  change: '',
                  changeStatus: 'neutral',
                  // Información adicional para debugging
                  _debug: {
                    timestamp: new Date().toISOString(),
                    requestConfig: serviceError.config,
                    responseStatus: serviceError.response?.status,
                    responseData: serviceError.response?.data
                  }
                };
              }
            }
            
            // Usar datos estáticos para métricas sin servicio real
            return {
              ...metric,
              loading: false,
              error: null,
              isRealData: false
            };
          })
        );

        setMetrics(metricsWithData);
      } catch (globalError) {
        console.error('❌ SISTEMA HÍBRIDO: Error global:', globalError);
        setError('Error cargando métricas');
      } finally {
        setLoading(false);
      }
    };

    if (metricIds.length > 0) {
      fetchMetrics();
    } else {
      setMetrics([]);
      setLoading(false);
    }
  }, [metricIds, startDate, endDate, presetId, axiosInstance]);

  const refetch = async () => {
    if (!axiosInstance) return;
    
    setLoading(true);
    setError(null);

    try {
      const baseMetrics = metricIds
        .map(id => METRICS_REGISTRY[id])
        .filter(Boolean);


      const metricsWithData = await Promise.all(
        baseMetrics.map(async (metric) => {
          if (metric.hasRealService && metric.serviceConfig) {
            try {
              const serviceFunction = await importService(
                metric.serviceConfig.serviceModule,
                metric.serviceConfig.serviceName
              );
              
              if (serviceFunction) {
                const response = await serviceFunction(axiosInstance, { startDate, endDate, presetId });
                
                if (response.success) {
                  const { serviceConfig } = metric;
                  
                  return {
                    ...metric,
                    value: serviceConfig.valueFormatter ? serviceConfig.valueFormatter(response.data) : response.data.value,
                    change: serviceConfig.changeFormatter ? serviceConfig.changeFormatter(response.data) : response.data.change,
                    changeStatus: serviceConfig.statusMapper ? serviceConfig.statusMapper(response.data.changeStatus) : response.data.changeStatus,
                    loading: false,
                    error: null,
                    ...(serviceConfig.chartDataFormatter && {
                      chartData: serviceConfig.chartDataFormatter(response.data)
                    }),
                    isRealData: true,
                    lastUpdated: response.data.lastUpdated
                  };
                } else {
                  // Manejar errores controlados del servicio en refetch
                  const errorMessage = response.error?.message || 'Servicio no disponible';
                  console.warn(`⚠️ REFETCH: Error controlado en ${metric.id}:`, response.error);
                  
                  return {
                    ...metric,
                    loading: false,
                    error: errorMessage,
                    isRealData: false,
                    value: 'Servicio no disponible',
                    change: '',
                    changeStatus: 'neutral'
                  };
                }
              } else {
                throw new Error('Servicio no disponible');
              }
            } catch (serviceError) {
              return {
                ...metric,
                loading: false,
                error: `Error de conexión: ${serviceError.message}`,
                isRealData: false,
                // NO mostrar datos genéricos cuando falla el servicio real
                value: 'Error',
                change: '',
                changeStatus: 'neutral'
              };
            }
          }
          
          return {
            ...metric,
            loading: false,
            error: null,
            isRealData: false
          };
        })
      );

      setMetrics(metricsWithData);
    } catch (globalError) {
      console.error('❌ REFETCH: Error global:', globalError);
      setError('Error cargando métricas');
    } finally {
      setLoading(false);
    }
  };

  return { metrics, loading, error, refetch };
};

// Hook para métricas de un módulo específico
export const useModuleMetrics = (module, dateRange) => {
  const moduleMetricIds = useMemo(() => {
    return Object.values(METRICS_REGISTRY)
      .filter(metric => metric.module === module)
      .map(metric => metric.id);
  }, [module]);
  
  // Estabilizar los parámetros de fecha para evitar bucles
  const dateParams = useMemo(() => ({
    startDate: dateRange?.startDate,
    endDate: dateRange?.endDate,
    presetId: dateRange?.preset
  }), [dateRange?.startDate, dateRange?.endDate, dateRange?.preset]);
  
  return useMetrics(moduleMetricIds, dateParams);
};

// Hook para métricas personalizadas del dashboard
export const useDashboardMetrics = (dateRange) => {
  const [selectedMetricIds, setSelectedMetricIds] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('dashboard-metrics');
    if (saved) {
      setSelectedMetricIds(JSON.parse(saved));
    } else {
      setSelectedMetricIds(['core-processing-time', 'catalog-new-providers', 'app-requests-created', 'payments-success-rate']);
    }
  }, []);

  const { metrics, loading, error, refetch } = useMetrics(selectedMetricIds, { 
    startDate: dateRange.startDate, 
    endDate: dateRange.endDate, 
    presetId: dateRange.preset 
  });

  const updateSelectedMetrics = (newMetricIds) => {
    setSelectedMetricIds(newMetricIds);
    localStorage.setItem('dashboard-metrics', JSON.stringify(newMetricIds));
  };

  return { 
    metrics, 
    loading, 
    error, 
    refetch, 
    selectedMetricIds,
    updateSelectedMetrics 
  };
};
