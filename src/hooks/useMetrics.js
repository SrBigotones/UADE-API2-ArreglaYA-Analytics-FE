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
<<<<<<< Updated upstream
      const baseMetrics = metricIds
        .map(id => METRICS_REGISTRY[id])
        .filter(Boolean);

=======
>>>>>>> Stashed changes

      const metricsWithData = await Promise.all(
        baseMetrics.map(async (metric) => {
          if (metric.hasRealService && metric.serviceConfig) {
            try {
              const serviceFunction = await importService(
                metric.serviceConfig.serviceModule,
                metric.serviceConfig.serviceName
              );
              
              if (serviceFunction) {
<<<<<<< Updated upstream
                const response = await serviceFunction(axiosInstance, { startDate, endDate, presetId });
                
                if (response.success) {
                  const { serviceConfig } = metric;
                  
=======
                const response = await serviceFunction(axiosInstance, {
                  startDate,
                  endDate,
                  period: presetId,
                  signal: abortControllerRef.current.signal
                });

                if (response && response.success) {
                  const { serviceConfig } = metric;
                  const metricData = response.data;
                  
                  // Console log para ver qué devuelve cada consulta del backend
                  console.log(`🔍 RESPUESTA BACKEND - ${metric.id}:`, {
                    endpoint: metric.endpoint,
                    serviceConfig: metric.serviceConfig,
                    response: response,
                    metricData: metricData,
                    timestamp: new Date().toISOString()
                  });
                  
                  const formattedValue = serviceConfig.valueFormatter ? 
                    serviceConfig.valueFormatter(metricData) : 
                    (metricData.value?.toString() || '0');
                    
                  const formattedChange = serviceConfig.changeFormatter ? 
                    serviceConfig.changeFormatter(metricData) : 
                    metricData.change;
                    
                  const mappedStatus = serviceConfig.statusMapper ? 
                    serviceConfig.statusMapper(metricData.changeStatus) : 
                    metricData.changeStatus;

>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
              } else {
                throw new Error('Servicio no disponible');
              }
            } catch (serviceError) {
=======
                
                // Console log cuando la respuesta no es exitosa
                console.log(`❌ RESPUESTA NO EXITOSA - ${metric.id}:`, {
                  endpoint: metric.endpoint,
                  response: response,
                  success: response?.success,
                  data: response?.data,
                  timestamp: new Date().toISOString()
                });
                
                throw new Error('Respuesta inválida del servidor');
              }
            } catch (error) {
              if (error.name === 'AbortError') {
                throw error; // Re-throw para que Promise.all se cancele
              }
              
              // Console log para errores de servicios
              console.log(`🚨 ERROR DE SERVICIO - ${metric.id}:`, {
                endpoint: metric.endpoint,
                serviceName: metric.serviceConfig?.serviceName,
                error: {
                  name: error.name,
                  message: error.message,
                  stack: error.stack
                },
                params: { startDate, endDate, period: presetId },
                timestamp: new Date().toISOString()
              });
              
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
          
=======
>>>>>>> Stashed changes
          return {
            ...metric,
            loading: false,
            error: null,
            isRealData: false
          };
        })
      );

      setMetrics(metricsWithData);
<<<<<<< Updated upstream
    } catch (globalError) {
      console.error('❌ REFETCH: Error global:', globalError);
      setError('Error cargando métricas');
=======
    } catch (error) {
      if (error.name !== 'AbortError') {
        setError('Error cargando métricas');
      }
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
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
=======
// Hook específico para métricas del dashboard
export const useDashboardMetrics = ({ startDate, endDate, preset }) => {
  // Estado para métricas seleccionadas por el usuario
  const [selectedMetricIds, setSelectedMetricIds] = useState(() => {
    // Cargar desde localStorage o usar métricas por defecto
    const saved = localStorage.getItem('dashboard-selected-metrics');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Error parsing saved metrics:', error);
      }
    }
    // Métricas por defecto si no hay guardadas
    return ['core-processing-time', 'catalog-new-providers', 'app-requests-created', 'payments-success-rate'];
  });

  // Función para actualizar métricas seleccionadas
  const updateSelectedMetrics = useCallback((newMetricIds) => {
    setSelectedMetricIds(newMetricIds);
    localStorage.setItem('dashboard-selected-metrics', JSON.stringify(newMetricIds));
  }, []);

  // Usar las métricas seleccionadas en lugar de todas las del dashboard
  const metricsResult = useMetrics(selectedMetricIds, { startDate, endDate, presetId: preset });

  return {
    ...metricsResult,
    selectedMetricIds,
    updateSelectedMetrics
  };
};
>>>>>>> Stashed changes
