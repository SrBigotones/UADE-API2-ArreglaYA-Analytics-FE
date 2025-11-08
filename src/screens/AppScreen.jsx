import React, { useState, useMemo } from 'react';
import DateRangeSelector from '../components/DateRangeSelector';
import DraggableMetricCard from '../components/DraggableMetricCard';
import { useDashboardOrder } from '../hooks/useDashboardOrder';
import { useModuleMetrics } from '../hooks/useMetrics';

const AppScreen = ({ isDarkMode }) => {
  const [dateRange, setDateRange] = useState({ preset: 'last7' });

  // Preparar parámetros de fecha basados en el selector
  const dateParams = useMemo(() => {
    if (dateRange.preset === 'custom' && dateRange.startDate && dateRange.endDate) {
      return {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        preset: 'custom'
      };
    }
    return {
      startDate: undefined,
      endDate: undefined,
      preset: dateRange.preset
    };
  }, [dateRange]);

  // Obtener métricas específicas del módulo de App desde el hook
  const { metrics: appMetrics, loading, error, refetch } = useModuleMetrics('app', dateParams);
  const { orderedMetrics, reorderMetrics, saveOrderToStorage } = useDashboardOrder(appMetrics, 'app-metrics-order');

  return (
    <>
      <div className="mb-4">
        <h2 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          App de Búsqueda y Solicitudes
        </h2>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Métricas de la aplicación móvil y web
        </p>
      </div>
      
      <div className="mb-4">
        <DateRangeSelector value={dateRange} onChange={setDateRange} />
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

      {/* Grid de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
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
          (orderedMetrics && orderedMetrics.length ? orderedMetrics : appMetrics).map((metric, index) => (
            <DraggableMetricCard
              key={metric.id}
              metric={metric}
              index={index}
              dateRange={dateRange}
              isDarkMode={isDarkMode}
              onReorder={(from, to) => { reorderMetrics(from, to); saveOrderToStorage(); }}
              allowToggleToChart={metric.allowToggleToChart ?? (metric.type === 'card')}
              chartKind={metric.toggleChartKind || 'line'}
            />
          ))
        )}
      </div>
    </>
  );
};

export default AppScreen;
