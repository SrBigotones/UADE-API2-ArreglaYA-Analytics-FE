import React, { useState, useEffect } from 'react';
import DateRangeSelector from '../components/DateRangeSelector';
import FilterSelector from '../components/FilterSelector';
import MetricRenderer from '../components/MetricRenderer';
import DraggableMetricCard from '../components/DraggableMetricCard';
import { METRICS_REGISTRY } from '../data/metricsRegistry';
import { useDashboardMetrics } from '../hooks/useMetrics';
import { useDashboardOrder } from '../hooks/useDashboardOrder';
import { useFilters } from '../context/FilterContext';

const CoreScreen = ({ isDarkMode }) => {
  const [dateRange, setDateRange] = useState({ preset: 'last7' });
  const [isCustomizing, setIsCustomizing] = useState(false);
  const { clearAllFilters } = useFilters();
  
  // Limpiar filtros al montar el componente (cuando se cambia de módulo)
  useEffect(() => {
    clearAllFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // La selección de métricas se gestiona dentro del hook useDashboardMetrics

  // Efecto para manejar el scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isCustomizing) {
      // Prevenir scroll del body
      document.body.style.overflow = 'hidden';
    } else {
      // Restaurar scroll del body
      document.body.style.overflow = 'unset';
    }

    // Cleanup al desmontar el componente
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCustomizing]);

  // Hook personalizado que maneja las métricas del dashboard desde el backend
  const { 
    metrics: dashboardMetrics, 
    loading, 
    error, 
    refetch,
    selectedMetricIds,
    updateSelectedMetrics
  } = useDashboardMetrics(dateRange);

  // Hook para manejar el orden de las métricas
  const {
    orderedMetrics,
    reorderMetrics,
    saveOrderToStorage
  } = useDashboardOrder(dashboardMetrics);

  // Función para manejar el reordenamiento
  const handleReorder = (fromIndex, toIndex) => {
    reorderMetrics(fromIndex, toIndex);
    // Guardar inmediatamente
    saveOrderToStorage();
  };

  return (
    <>
      
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4 mt-2 sm:mt-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            <h2 className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              Dashboard Personal
            </h2>
            <DateRangeSelector value={dateRange} onChange={setDateRange} />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <FilterSelector module="all" />
            <button
              onClick={() => setIsCustomizing(true)}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm sm:text-base whitespace-nowrap"
            >
              Personalizar
            </button>
          </div>
        </div>
      </div>
      {/* Estados de carga y error */}
      {error && (
        <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-red-900/20 border-red-800 text-red-400' : 'bg-red-50 border-red-200 text-red-600'} mb-6`}>
          <div className="flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button 
              onClick={refetch}
              className="text-sm underline hover:no-underline"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="dashboard-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-min grid-flow-row-dense">
        {loading ? (
          // Skeletons mientras carga
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className={`rounded-lg border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="animate-pulse">
                <div className={`h-4 rounded mb-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                <div className={`h-8 rounded mb-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                <div className={`h-3 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
              </div>
            </div>
          ))
        ) : (
          (selectedMetricIds && selectedMetricIds.length > 0
            ? orderedMetrics.filter(m => selectedMetricIds.includes(m.id))
            : orderedMetrics
          ).map((metric, index) => {
            const allowToggle = metric.allowToggleToChart ?? (metric.type === 'card');
            const preferredKind = metric.toggleChartKind || 'line';
            return (
              <DraggableMetricCard
                key={metric.id}
                metric={metric}
                index={index}
                dateRange={dateRange}
                isDarkMode={isDarkMode}
                onReorder={handleReorder}
                allowToggleToChart={allowToggle}
                chartKind={preferredKind}
              />
            );
          })
        )}
      </div>

      {/* Modal de personalización */}
      {isCustomizing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-hidden">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col`}>
            
            {/* Header fijo */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Personalizar Dashboard</h3>
              <button
                onClick={() => setIsCustomizing(false)}
                className={`${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
              >
                ✕
              </button>
            </div>
            
            {/* Contenido scrolleable */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-6">
                {Object.entries(Object.entries(METRICS_REGISTRY).reduce((acc, [, metric]) => {
                  if (!acc[metric.module]) acc[metric.module] = [];
                  acc[metric.module].push(metric);
                  return acc;
                }, {})).map(([module, metrics]) => (
                  <div key={module}>
                    <h4 className={`text-lg font-semibold mb-3 capitalize ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {module === 'core' ? 'Dashboard' : module}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {metrics.map((metric) => (
                        <label key={metric.id} className={`flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 ${isDarkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200'}`}>
                          <input
                            type="checkbox"
                            checked={selectedMetricIds.includes(metric.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateSelectedMetrics([...selectedMetricIds, metric.id]);
                              } else {
                                updateSelectedMetrics(selectedMetricIds.filter(id => id !== metric.id));
                              }
                            }}
                            className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          />
                          <div>
                            <div className={`font-medium flex items-center gap-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                              {metric.title}
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                metric.type === 'card' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                metric.type === 'pie' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                                'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              }`}>
                                {metric.type === 'card' ? '📊' : metric.type === 'pie' ? '🥧' : '📈'}
                              </span>
                            </div>
                            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{metric.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Footer fijo */}
            <div className={`p-6 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} flex-shrink-0`}>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    const defaultMetrics = ['core-processing-time', 'catalog-new-providers', 'app-requests-created', 'payments-success-rate'];
                    updateSelectedMetrics(defaultMetrics);
                  }}
                  className={`px-4 py-2 border rounded-lg ${isDarkMode ? 'text-gray-300 border-gray-600 hover:bg-gray-700' : 'text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                >
                  Restaurar por defecto
                </button>
                <button
                  onClick={() => setIsCustomizing(false)}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  Guardar cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CoreScreen;
