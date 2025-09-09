import { useState, useEffect } from 'react';

// Hook para manejar el orden de las métricas en el dashboard
export const useDashboardOrder = (initialMetrics = []) => {
  const [orderedMetrics, setOrderedMetrics] = useState(initialMetrics || []);

  // Sincronizar con las métricas iniciales cuando cambien
  useEffect(() => {
    if (initialMetrics && initialMetrics.length > 0) {
      setOrderedMetrics(initialMetrics);
    }
  }, [initialMetrics]);

  // Función para reordenar las métricas
  const reorderMetrics = (fromIndex, toIndex) => {
    setOrderedMetrics(prevMetrics => {
      if (!prevMetrics || prevMetrics.length === 0) return prevMetrics;
      const newMetrics = [...prevMetrics];
      const [movedMetric] = newMetrics.splice(fromIndex, 1);
      newMetrics.splice(toIndex, 0, movedMetric);
      return newMetrics;
    });
  };

  // Función para actualizar el orden completo
  const updateOrder = (newOrder) => {
    setOrderedMetrics(newOrder || []);
  };

  // Guardar el orden en localStorage
  const saveOrderToStorage = () => {
    try {
      if (orderedMetrics && orderedMetrics.length > 0) {
        const metricIds = orderedMetrics.map(metric => metric.id);
        localStorage.setItem('dashboard-metrics-order', JSON.stringify(metricIds));
      }
    } catch (error) {
      console.warn('Error saving dashboard order to storage:', error);
    }
  };

  // Cargar el orden desde localStorage
  const loadOrderFromStorage = (availableMetrics) => {
    try {
      if (!availableMetrics || availableMetrics.length === 0) {
        return availableMetrics || [];
      }

      const savedOrder = localStorage.getItem('dashboard-metrics-order');
      if (savedOrder) {
        const savedIds = JSON.parse(savedOrder);
        // Filtrar solo las métricas que están disponibles
        const orderedAvailableMetrics = savedIds
          .map(id => availableMetrics.find(metric => metric.id === id))
          .filter(Boolean);
        
        // Agregar métricas nuevas que no estaban en el orden guardado
        const newMetrics = availableMetrics.filter(
          metric => !savedIds.includes(metric.id)
        );
        
        const result = [...orderedAvailableMetrics, ...newMetrics];
        setOrderedMetrics(result);
        return result;
      }
    } catch (error) {
      console.warn('Error loading dashboard order from storage:', error);
    }
    return availableMetrics || [];
  };

  return {
    orderedMetrics: orderedMetrics || [],
    reorderMetrics,
    updateOrder,
    saveOrderToStorage,
    loadOrderFromStorage
  };
};
