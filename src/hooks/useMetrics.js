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
      console.log('🔄 SISTEMA HÍBRIDO: Procesando métricas:', baseMetrics.map(m => m.id));

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
                console.log(`📡 SERVICIO REAL: Cargando ${metric.id} desde ${metric.serviceConfig.serviceName}`);
                
                const response = await serviceFunction(axiosInstance, {
                  startDate,
                  endDate,
                  period: presetId,
                  signal: abortControllerRef.current.signal
                });

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
                }
                
                throw new Error('Respuesta inválida del servidor');
              }
            } catch (error) {
              if (error.name === 'AbortError') {
                console.log(`🛑 Petición cancelada para ${metric.id}`);
                throw error; // Re-throw para que Promise.all se cancele
              }
              
              console.error(`❌ SERVICIO REAL: Error en ${metric.id}:`, error);
              return {
                ...metric,
                loading: false,
                error: error.message,
                isRealData: true
              };
            }
          }
          
          console.log(`📊 DATOS ESTÁTICOS: Usando mock para ${metric.id}`);
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
        console.error('❌ SISTEMA HÍBRIDO: Error global:', error);
        setError('Error cargando métricas');
      }
    } finally {
      setLoading(false);
    }
  }, [axiosInstance, baseMetrics, cacheKey, startDate, endDate, presetId]);

  // Versión debounced de fetchMetrics
  const debouncedFetch = useMemo(() => 
    debounce(fetchMetrics, 300),
    [fetchMetrics]
  );

  // Efecto principal
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
export const useModuleMetrics = (module, { startDate, endDate, preset }) => {
  const moduleMetricIds = Object.values(METRICS_REGISTRY)
    .filter(metric => metric.module === module)
    .map(metric => metric.id);
  
  return useMetrics(moduleMetricIds, { startDate, endDate, presetId: preset });
};

// Hook específico para métricas del dashboard
export const useDashboardMetrics = ({ startDate, endDate, preset }) => {
  // Filtrar métricas que pertenecen al dashboard/core
  const dashboardMetricIds = Object.values(METRICS_REGISTRY)
    .filter(metric => metric.module === 'core' || metric.showInDashboard)
    .map(metric => metric.id);

  return useMetrics(dashboardMetricIds, { startDate, endDate, presetId: preset });
};