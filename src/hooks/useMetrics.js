import { useState, useEffect, useMemo, useCallback } from 'react';
import { METRICS_REGISTRY } from '../data/metricsRegistry';
import { useAxios } from './useAxios';
import { debounce } from '../utils/debounce';

// Importar servicios dinámicamente con caché
const importService = async (serviceModule, serviceName, serviceCache) => {
  const cacheKey = `${serviceModule}.${serviceName}`;
  
  // Verificar si ya está en caché
  if (serviceCache[cacheKey]) {
    return serviceCache[cacheKey];
  }
  
  try {
    let module;
    if (serviceModule === 'paymentMetricsService') {
      module = await import('../services/paymentMetricsService');
    } else if (serviceModule === 'userMetricsService') {
      module = await import('../services/userMetricsService');
    }
    
    const service = module?.[serviceName];
    if (service) {
      serviceCache[cacheKey] = service;
    }
    return service;
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

  // Memorizar los IDs de métricas y sus configuraciones base para evitar re-renders innecesarios
  const metricIdsString = useMemo(() => metricIds.join(','), [metricIds]);
  
  // Memorizar las configuraciones base de las métricas
  const baseMetrics = useMemo(() => 
    metricIds
      .map(id => METRICS_REGISTRY[id])
      .filter(Boolean),
    [metricIdsString]
  );
  
  // Cache para los servicios importados
  const serviceCache = useMemo(() => ({}), []);
  
  // Crear una versión debounced de fetchMetrics
  const debouncedFetch = useCallback(
    debounce((fetchFn) => fetchFn(), 300),
    []
  );

  useEffect(() => {
    let isMounted = true;
    let abortController = new AbortController();
    const fetchMetrics = async () => {
      if (!axiosInstance) return; // Esperar a que axios esté listo
      
      setLoading(true);
      setError(null);

      try {
        if (!isMounted) return;
        
        console.log('🔄 SISTEMA HÍBRIDO: Procesando métricas:', baseMetrics.map(m => m.id));

        // Procesar métricas en paralelo
        const metricsWithData = await Promise.all(
          baseMetrics.map(async (metric) => {
            if (metric.hasRealService && metric.serviceConfig) {
              console.log(`📡 SERVICIO REAL: Cargando ${metric.id} desde ${metric.serviceConfig.serviceName}`);
              
              try {
                // Importar y ejecutar el servicio real
                const serviceFunction = await importService(
                  metric.serviceConfig.serviceModule,
                  metric.serviceConfig.serviceName,
                  serviceCache
                );
                
                if (serviceFunction) {
                  const response = await serviceFunction(axiosInstance, { 
                  startDate, 
                  endDate, 
                  period: presetId,
                  signal: abortController.signal 
                });
                  
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
                    
                    console.log(`✅ SERVICIO REAL: ${metric.id} cargado exitosamente`);
                    return formattedMetric;
                  } else {
                    throw new Error('Respuesta inválida del servidor');
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
            console.log(`📊 DATOS ESTÁTICOS: Usando mock para ${metric.id}`);
            return {
              ...metric,
              loading: false,
              error: null,
              isRealData: false
            };
          })
        );

        if (isMounted) {
          setMetrics(metricsWithData);
        }
      } catch (globalError) {
        console.error('❌ SISTEMA HÍBRIDO: Error global:', globalError);
        if (isMounted) {
          setError('Error cargando métricas');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (metricIds.length > 0) {
      debouncedFetch(() => fetchMetrics());
    } else {
      setMetrics([]);
      setLoading(false);
    }

    return () => {
      isMounted = false;
      abortController.abort(); // Abortar cualquier solicitud pendiente
    };
  }, [metricIdsString, startDate, endDate, presetId, axiosInstance]);

  const refetch = async () => {
    if (!axiosInstance) return;
    
    setLoading(true);
    setError(null);

    try {
      const baseMetrics = metricIds
        .map(id => METRICS_REGISTRY[id])
        .filter(Boolean);

      console.log('🔄 REFETCH: Recargando métricas híbridas');

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
                  throw new Error('Respuesta inválida del servidor');
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
export const useModuleMetrics = (module, { startDate, endDate, preset }) => {
  const moduleMetricIds = Object.values(METRICS_REGISTRY)
    .filter(metric => metric.module === module)
    .map(metric => metric.id);
  
  return useMetrics(moduleMetricIds, { startDate, endDate, presetId: preset });
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
