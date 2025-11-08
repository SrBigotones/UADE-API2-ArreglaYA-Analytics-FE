import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { METRICS_REGISTRY } from '../data/metricsRegistry';
import { useAxios } from './useAxios';
import { debounce } from '../utils/debounce';

// Cache global para servicios importados
const serviceCache = {};

// Importar servicios dinámicamente con caché
const importService = async (serviceModule, serviceName, serviceCache) => {
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
    } else if (serviceModule === 'catalogService') {
      module = await import('../services/catalogService');
    } else if (serviceModule === 'appSearchsAndRequests') {
      module = await import('../services/appSearchsAndRequests');
    } else if (serviceModule === 'matchingMetricsService') {
      module = await import('../services/matchingMetricsService');
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

// Cache de resultados de métricas para evitar solicitudes duplicadas
const metricsResultsCache = new Map();

// Hook personalizado para manejar métricas desde el backend
export const useMetrics = (metricIds, { startDate, endDate, presetId }) => {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosInstance = useAxios();
  const abortControllerRef = useRef(null);
  
  // Memorizar las configuraciones base de las métricas
  const baseMetrics = useMemo(() => 
    metricIds
      .map(id => METRICS_REGISTRY[id])
      .filter(Boolean),
    [metricIds]
  );

  // Generar clave de cache basada en los parámetros actuales
  const cacheKey = useMemo(() => {
    return JSON.stringify({
      metricIds,
      startDate,
      endDate,
      presetId
    });
  }, [metricIds, startDate, endDate, presetId]);

  // Función principal para obtener métricas
  const fetchMetrics = useCallback(async () => {
    if (!axiosInstance) return;

    // Verificar cache
    const cached = metricsResultsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 5000) { // Cache por 5 segundos
      console.log('⚡ USANDO DATOS CACHEADOS', { cacheKey, cached: cached.data });
      setMetrics(cached.data);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Crear nuevo controlador
    abortControllerRef.current = new AbortController();

    try {

      const metricsWithData = await Promise.all(
        baseMetrics.map(async (metric) => {
          if (metric.hasRealService && metric.serviceConfig) {
            try {
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

                  const nextMetricBase = {
                    ...metric,
                    value: formattedValue,
                    change: formattedChange,
                    changeStatus: mappedStatus,
                    loading: false,
                    error: null,
                    isRealData: true,
                    lastUpdated: response.data.lastUpdated
                  };

                  // Soporte para tipo mapa: llenar points
                  if (metric.type === 'map') {
                    const points = serviceConfig.pointsFormatter
                      ? serviceConfig.pointsFormatter(response.data)
                      : (response.data.points || (serviceConfig.chartDataFormatter ? serviceConfig.chartDataFormatter(response.data) : []));
                    return {
                      ...nextMetricBase,
                      points
                    };
                  }

                  // Soporte estándar para chart data
                  const chartDataFormatted = serviceConfig.chartDataFormatter 
                    ? serviceConfig.chartDataFormatter(response.data)
                    : undefined;
                  
                  // Si no hay formatter, usar chartData directamente de response.data
                  const chartData = chartDataFormatted || (Array.isArray(response.data?.chartData) ? response.data.chartData : undefined);
                  
                  console.log(`📊 CHART DATA FORMATEADO - ${metric.id}:`, {
                    hasChartDataFormatter: !!serviceConfig.chartDataFormatter,
                    responseData: response.data,
                    chartDataFormatted: chartDataFormatted,
                    chartDataDirect: response.data?.chartData,
                    chartDataFinal: chartData,
                    chartDataLength: chartData?.length || 0
                  });
                  
                  return {
                    ...nextMetricBase,
                    ...(chartData && {
                      chartData: chartData
                    })
                  };
                }

                // Si la respuesta indica cancelación, propagar como AbortError para tratarlo de forma silenciosa
                if (response && response.success === false && response.error === 'Solicitud cancelada') {
                  throw new DOMException('Solicitud cancelada', 'AbortError');
                }

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
              
              return {
                ...metric,
                loading: false,
                error: error.message,
                isRealData: true
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

      // Guardar en cache
      metricsResultsCache.set(cacheKey, {
        timestamp: Date.now(),
        data: metricsWithData
      });

      setMetrics(metricsWithData);
    } catch (error) {
      if (error.name !== 'AbortError') {
        setError('Error cargando métricas');
      }
    } finally {
      setLoading(false);
    }
  }, [axiosInstance, baseMetrics, cacheKey, startDate, endDate, presetId]);

  // Mantener una referencia al fetchMetrics más reciente
  const latestFetchRef = useRef(fetchMetrics);
  useEffect(() => {
    latestFetchRef.current = fetchMetrics;
  }, [fetchMetrics]);

  // Debounce estable (700ms) que siempre llama a la versión más reciente de fetchMetrics
  const debouncedFetchRef = useRef(null);
  if (!debouncedFetchRef.current) {
    debouncedFetchRef.current = debounce(() => {
      return latestFetchRef.current();
    }, 700);
  }

  // Efecto principal: depende de cacheKey para evitar múltiples ejecuciones innecesarias
  useEffect(() => {
    if (metricIds.length > 0) {
      debouncedFetchRef.current();
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
  }, [cacheKey, metricIds.length]);

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics
  };
};

// Hook para métricas de un módulo específico
export const useModuleMetrics = (module, { startDate, endDate, preset }) => {
  const moduleMetricIds = Object.values(METRICS_REGISTRY)
    .filter(metric => metric.module === module)
    .map(metric => metric.id);
  
  return useMetrics(moduleMetricIds, { startDate, endDate, presetId: preset });
};

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
