import { useState, useEffect } from 'react';
import { METRICS_REGISTRY } from '../data/metricsRegistry';

// Hook personalizado para manejar métricas desde el backend
export const useMetrics = (metricIds, dateRange) => {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      setError(null);

      try {
        // Obtener las definiciones base del registro
        const baseMetrics = metricIds
          .map(id => METRICS_REGISTRY[id])
          .filter(Boolean);

        // Simular delay para mostrar loading
        await new Promise(resolve => setTimeout(resolve, 500));

        // Para desarrollo: usar datos estáticos siempre
        const metricsWithData = baseMetrics.map(metric => ({
          ...metric,
          loading: false,
          error: null
        }));

        setMetrics(metricsWithData);
      } catch (globalError) {
        console.error('Error fetching metrics:', globalError);
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
  }, [metricIds.join(','), JSON.stringify(dateRange)]);

  const refetch = async () => {
    setLoading(true);
    setError(null);

    try {
      const baseMetrics = metricIds
        .map(id => METRICS_REGISTRY[id])
        .filter(Boolean);

      await new Promise(resolve => setTimeout(resolve, 500));

      const metricsWithData = baseMetrics.map(metric => ({
        ...metric,
        loading: false,
        error: null
      }));

      setMetrics(metricsWithData);
    } catch (globalError) {
      console.error('Error fetching metrics:', globalError);
      setError('Error cargando métricas');
    } finally {
      setLoading(false);
    }
  };

  return { metrics, loading, error, refetch };
};

// Hook para métricas de un módulo específico
export const useModuleMetrics = (module, dateRange) => {
  const moduleMetricIds = Object.values(METRICS_REGISTRY)
    .filter(metric => metric.module === module)
    .map(metric => metric.id);
  
  return useMetrics(moduleMetricIds, dateRange);
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

  const { metrics, loading, error, refetch } = useMetrics(selectedMetricIds, dateRange);

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
