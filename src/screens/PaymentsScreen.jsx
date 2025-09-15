import React, { useState } from 'react';
import DateRangeSelector from '../components/DateRangeSelector';
import MetricRenderer from '../components/MetricRenderer';
import { useModuleMetrics } from '../hooks/useMetrics';

const PaymentsScreen = ({ isDarkMode }) => {
  const [dateRange, setDateRange] = useState({ preset: 'last7' });
  
  // Obtener métricas específicas del módulo de pagos desde el hook híbrido
  const { metrics: paymentsMetrics, loading, error, refetch } = useModuleMetrics('payments', dateRange);

  return (
    <>
      <div className="mb-4">
        <h2 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          Pagos y Facturación
        </h2>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Métricas del sistema de pagos y facturación</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
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
          paymentsMetrics.map((metric) => (
            <MetricRenderer
              key={metric.id}
              metric={metric}
              dateRange={dateRange}
              isDarkMode={isDarkMode}
            />
          ))
        )}
      </div>
    </>
  );
};

export default PaymentsScreen;
