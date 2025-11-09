import React, { useState, useMemo, useEffect } from 'react';
import DateRangeSelector from '../components/DateRangeSelector';
import FilterSelector from '../components/FilterSelector';
import MetricRenderer from '../components/MetricRenderer';
import DraggableMetricCard from '../components/DraggableMetricCard';
import { useModuleMetrics } from '../hooks/useMetrics';
import { useDashboardOrder } from '../hooks/useDashboardOrder';
import { useFilters } from '../context/FilterContext';

const CatalogScreen = ({ isDarkMode }) => {
  const [dateRange, setDateRange] = useState({ preset: 'last7' });
  const { activeFilters, getApiFilters, clearAllFilters } = useFilters();
  
  // Limpiar filtros al montar el componente (cuando se cambia de módulo)
  useEffect(() => {
    clearAllFilters();
  }, []); // Solo se ejecuta al montar
  
  // Memorizar los filtros para que se recalculen cuando activeFilters cambie
  const filters = useMemo(() => getApiFilters(), [activeFilters, getApiFilters]);
  
  // Traer todas las métricas del módulo catálogo desde el registry con filtros aplicados
  const { metrics: catalogMetrics, loading, error, refetch } = useModuleMetrics('catalog', {
    ...dateRange,
    filters
  });
  const { orderedMetrics, reorderMetrics, saveOrderToStorage } = useDashboardOrder(catalogMetrics, 'catalog-metrics-order');

  return (
    <>
      <div className="mb-4 mt-2 sm:mt-0">
        <h2 className={`text-2xl sm:text-3xl font-bold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          Catálogo de Servicios y Prestadores
        </h2>
        <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Métricas del catálogo de servicios y prestadores</p>
      </div>
      {/* Controles de Fecha y Filtros */}
      <div className="mb-4 flex flex-col lg:flex-row lg:justify-between lg:items-start gap-3 lg:gap-4">
        <DateRangeSelector value={dateRange} onChange={setDateRange} />
        <FilterSelector module="catalog" />
      </div>
      {/* Estados de carga y error */}
      {error && (
        <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-red-900/20 border-red-800 text-red-400' : 'bg-red-50 border-red-200 text-red-600'} mb-6`}>
          <div className="flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={refetch} className="text-sm underline hover:no-underline">Reintentar</button>
          </div>
        </div>
      )}

      {/* Metrics Grid por categoría (igual enfoque que otras pantallas) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {loading ? (
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
          (orderedMetrics && orderedMetrics.length ? orderedMetrics : catalogMetrics).map((metric, index) => (
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

export default CatalogScreen;
