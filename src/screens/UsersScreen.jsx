import React, { useState, useEffect, useMemo } from 'react';
import DateRangeSelector from '../components/DateRangeSelector';
import FilterSelector from '../components/FilterSelector';
import DraggableMetricCard from '../components/DraggableMetricCard';
import MetricRenderer from '../components/MetricRenderer';
import { useDashboardOrder } from '../hooks/useDashboardOrder';
import PieResponsiveContainer from '../components/PieResponsiveContainer';
import { useModuleMetrics } from '../hooks/useMetrics';
import { useFilters } from '../context/FilterContext';

const UsersScreen = ({ isDarkMode }) => {
  const [dateRange, setDateRange] = useState(() => {
    try {
      const saved = localStorage.getItem('arreglaya-date-range-preset');
      if (saved) {
        return { preset: saved };
      }
    } catch (error) {
      console.error('Error loading date range preset from localStorage:', error);
    }
    return { preset: 'last7' };
  });
  const { getApiFilters, clearAllFilters } = useFilters();
  
  // Guardar el preset en localStorage cuando cambie
  useEffect(() => {
    try {
      localStorage.setItem('arreglaya-date-range-preset', dateRange.preset);
    } catch (error) {
      console.error('Error saving date range preset to localStorage:', error);
    }
  }, [dateRange.preset]);
  
  // Limpiar filtros al montar el componente (cuando se cambia de módulo)
  useEffect(() => {
    clearAllFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Memorizar los filtros para que se recalculen cuando activeFilters cambie
  const filters = useMemo(() => getApiFilters(), [getApiFilters]);
  
  // Obtener métricas específicas del módulo de usuarios desde el hook híbrido
  const { metrics: usersMetrics, loading, error, refetch } = useModuleMetrics('users', {
    ...dateRange,
    filters
  });
  const { orderedMetrics, reorderMetrics, saveOrderToStorage } = useDashboardOrder(usersMetrics, 'users-metrics-order');

  return (
    <>
      <div className="mb-4 mt-2 sm:mt-0">
        <h2 className={`text-2xl sm:text-3xl font-bold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          Usuarios y Roles
        </h2>
        <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Métricas de usuarios y gestión de roles</p>
      </div>
      
      {/* Controles de Fecha y Filtros */}
      <div className="mb-4 flex flex-col lg:flex-row lg:justify-between lg:items-start gap-3 lg:gap-4">
        <DateRangeSelector value={dateRange} onChange={setDateRange} />
        <FilterSelector module="users" />
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {loading ? (
          // Skeletons mientras carga
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className={`rounded-lg border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="animate-pulse">
                <div className={`h-4 rounded mb-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                <div className={`h-8 rounded mb-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                <div className={`h-3 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
              </div>
            </div>
          ))
        ) : (
          (orderedMetrics && orderedMetrics.length ? orderedMetrics : usersMetrics).map((metric, index) => (
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

export default UsersScreen;
