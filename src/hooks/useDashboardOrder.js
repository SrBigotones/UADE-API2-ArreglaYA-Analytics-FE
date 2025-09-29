import { useState, useEffect, useRef, useCallback } from 'react';

// Hook para manejar el orden de las métricas en el dashboard
export const useDashboardOrder = (initialMetrics = []) => {
  const [orderedMetrics, setOrderedMetrics] = useState(initialMetrics || []);
  const hasLoadedInitialOrder = useRef(false);
  const currentMetricIds = useRef(new Set());

  // Sincronizar con las métricas iniciales cuando cambien, manteniendo el orden guardado
  useEffect(() => {
    if (initialMetrics && initialMetrics.length > 0) {
      const newMetricIds = new Set(initialMetrics.map(m => m.id));
      const previousMetricIds = currentMetricIds.current;
      
      // Si es la primera carga o cambió el conjunto de métricas disponibles
      if (!hasLoadedInitialOrder.current || !areSetsEqual(newMetricIds, previousMetricIds)) {
        // Intentar cargar el orden guardado primero
        const savedOrder = localStorage.getItem('dashboard-metrics-order');
        if (savedOrder) {
          try {
            const savedIds = JSON.parse(savedOrder);
            // Filtrar solo las métricas que están disponibles
            const orderedAvailableMetrics = savedIds
              .map(id => initialMetrics.find(metric => metric.id === id))
              .filter(Boolean);
            
            // Agregar métricas nuevas que no estaban en el orden guardado
            const newMetrics = initialMetrics.filter(
              metric => !savedIds.includes(metric.id)
            );
            
            const orderedMetrics = [...orderedAvailableMetrics, ...newMetrics];
            setOrderedMetrics(orderedMetrics);
          } catch (error) {
            console.warn('Error loading dashboard order from storage:', error);
            setOrderedMetrics(initialMetrics);
          }
        } else {
          setOrderedMetrics(initialMetrics);
        }
        
        hasLoadedInitialOrder.current = true;
        currentMetricIds.current = newMetricIds;
      } else {
        // Si las métricas son las mismas, solo actualizar los datos pero mantener el orden
        setOrderedMetrics(prevOrderedMetrics => {
          return prevOrderedMetrics.map(orderedMetric => {
            const updatedMetric = initialMetrics.find(m => m.id === orderedMetric.id);
            return updatedMetric || orderedMetric;
          });
        });
      }
    }
  }, [initialMetrics]);

  // Función auxiliar para comparar sets
  const areSetsEqual = (set1, set2) => {
    if (set1.size !== set2.size) return false;
    for (let item of set1) {
      if (!set2.has(item)) return false;
    }
    return true;
  };

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
  const saveOrderToStorage = useCallback(() => {
    try {
      if (orderedMetrics && orderedMetrics.length > 0) {
        const metricIds = orderedMetrics.map(metric => metric.id);
        localStorage.setItem('dashboard-metrics-order', JSON.stringify(metricIds));
      }
    } catch (error) {
      console.warn('Error saving dashboard order to storage:', error);
    }
  }, [orderedMetrics]);

  // Auto-guardar cuando cambie el orden
  useEffect(() => {
    if (orderedMetrics && orderedMetrics.length > 0) {
      saveOrderToStorage();
    }
  }, [orderedMetrics, saveOrderToStorage]);

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
