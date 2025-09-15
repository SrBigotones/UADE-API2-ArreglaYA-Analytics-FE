import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

import { METRICS_REGISTRY } from '../data/metricsRegistry';
import { useAxios } from './useAxios';
import { debounce } from '../utils/debounce';

// Cache global para servicios importados
const serviceCache = {};

// Importar servicios dinámicamente con caché
const importService = async (serviceModule, serviceName) => {
  const cacheKey = `${serviceModule}.${serviceName}`;
  
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

// Cache de resultados de métricas
const metricsResultsCache = new Map();

// Hook personalizado para manejar métricas desde el backend
export const useMetrics = (metricIds, { startDate, endDate, presetId }) => {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosInstance = useAxios();
  const abortControllerRef = useRef(null);
  
  const baseMetrics = useMemo(() => 
    metricIds
      .map(id => METRICS_REGISTRY[id])
      .filter(Boolean),
    [metricIds]
  );

  const cacheKey = useMemo(() => {
    return JSON.stringify({ metricIds, startDate, endDate, presetId });
  }, [metricIds, startDate, endDate, presetId]);

  const fetchMetrics = useCallback(async () => {
    if (!axiosInstance) return;

    setLoading(true);
    setError(null);

    try {
      const metricsWithData = await Promise.all(
        baseMetrics.map(async (metric) => {
          if (metric.hasRealService && metric.serviceConfig) {
            try {
              const serviceFunction = await importService(
                metric.serviceConfig.serviceModule,
                metric.serviceConfig.serviceName
              );
              
              if (serviceFunction) {
                const response = await serviceFunction(axiosInstance, { startDate, endDate, period: presetId });
                
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
                value: 'Error',
                change: '',
                changeStatus: 'neutral',
                _debug: {
                  timestamp: new Date().toISOString(),
                  requestConfig: serviceError.config,
                  responseStatus: serviceError.response?.status,
                  responseData: serviceError.response?.data
                }
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
      console.error('❌ SISTEMA HÍBRIDO: Error global:', globalError);
      setError('Error cargando métricas');
    } finally {
      setLoading(false);
    }
  }, [axiosInstance, baseMetrics, startDate, endDate, presetId]);

  const debouncedFetch = useMemo(() => debounce(fetchMetrics, 300), [fetchMetrics]);

  useEffect(() => {
    if (metricIds.length > 0) {
      debouncedFetch();
    } else {
      setMetrics([]);
      setLoading(false);
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [metricIds.length, debouncedFetch]);

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics
  };
};

// Hook para métricas de un módulo específico
export const useModuleMetrics = (module, dateRange) => {
  const moduleMetricIds = useMemo(() => {
    return Object.values(METRICS_REGISTRY)
      .filter(metric => metric.module === module)
      .map(metric => metric.id);
  }, [module]);
  
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
