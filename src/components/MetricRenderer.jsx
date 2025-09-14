import React from 'react';
import MetricCard from './MetricCard';
import PieResponsiveContainer from './PieResponsiveContainer';
import AreaResponsiveContainer from './AreaResponsiveContainer';
import CandlestickChart from './CandlestickChart';

const MetricRenderer = ({ metric, dateRange, className = '', isDarkMode, chartSize }) => {
  if (!metric) return null;

  const commonProps = {
    key: metric.id,
    title: metric.title,
    value: metric.value,
    change: metric.change,
    changeStatus: metric.changeStatus,
    periodLabel: dateRange?.preset === 'custom' ? 'Personalizado' : 'Periodo seleccionado',
    description: metric.description,
    loading: metric.loading,
    error: metric.error,
    isRealData: metric.isRealData,
  };

  // Calcular altura dinámica según el tamaño del chart
  const getChartHeight = () => {
    if (!chartSize || !chartSize.rows) return 280;
    return chartSize.rows === 1 ? 150 : 280; // Altura ajustada para content flexible
  };

  switch (metric.type) {
    case 'card':
      return <MetricCard {...commonProps} className={className} />;
    
    case 'pie':
      // Si hay error, mostrar componente de error en lugar del gráfico
      if (metric.error) {
        return (
          <div className={`rounded-lg shadow-sm border p-6 ${isDarkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} w-full h-full min-h-[300px] flex items-center justify-center ${className}`}>
            <div className="text-center">
              <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'} mb-2 font-medium`}>{metric.title}</p>
              <p className={`text-xs ${isDarkMode ? 'text-red-300' : 'text-red-500'}`}>{metric.error}</p>
            </div>
          </div>
        );
      }
      
      // Si está cargando, mostrar skeleton
      if (metric.loading) {
        return (
          <div className={`rounded-lg border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} w-full h-full min-h-[300px] ${className}`}>
            <div className="animate-pulse h-full">
              <div className={`h-4 rounded mb-3 w-1/2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
              <div className={`flex-1 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} style={{height: 'calc(100% - 32px)'}}></div>
            </div>
          </div>
        );
      }
      
      return (
        <PieResponsiveContainer
          data={metric.chartData}
          dataKey="value"
          nameKey="name"
          colors={metric.chartData?.map(item => item.color)}
          asCard={true}
          title={metric.title}
          height={293}
          className={className}
        />
      );
    
    case 'area':
    case 'line':
      // Si hay error, mostrar componente de error
      if (metric.error) {
        return (
          <div className={`rounded-lg shadow-sm border p-6 ${isDarkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} w-full h-full min-h-[300px] flex items-center justify-center ${className}`}>
            <div className="text-center">
              <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'} mb-2 font-medium`}>{metric.title}</p>
              <p className={`text-xs ${isDarkMode ? 'text-red-300' : 'text-red-500'}`}>{metric.error}</p>
            </div>
          </div>
        );
      }
      
      // Si está cargando, mostrar skeleton
      if (metric.loading) {
        return (
          <div className={`rounded-lg border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} w-full h-full min-h-[300px] ${className}`}>
            <div className="animate-pulse h-full">
              <div className={`h-4 rounded mb-3 w-1/2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
              <div className={`flex-1 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} style={{height: 'calc(100% - 32px)'}}></div>
            </div>
          </div>
        );
      }
      
      return (
        <AreaResponsiveContainer
          data={metric.chartData}
          areaKey="value"
          xKey={metric.chartData?.[0]?.time ? 'time' : 'date'}
          asCard={true}
          title={metric.title}
          height={getChartHeight()}
          className={className}
        />
      );
    
    case 'candlestick':
      // Si hay error, mostrar componente de error
      if (metric.error) {
        return (
          <div className={`rounded-lg shadow-sm border p-6 ${isDarkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} w-full h-full min-h-[300px] flex items-center justify-center ${className}`}>
            <div className="text-center">
              <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'} mb-2 font-medium`}>{metric.title}</p>
              <p className={`text-xs ${isDarkMode ? 'text-red-300' : 'text-red-500'}`}>{metric.error}</p>
            </div>
          </div>
        );
      }
      
      // Si está cargando, mostrar skeleton
      if (metric.loading) {
        return (
          <div className={`rounded-lg border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} w-full h-full min-h-[300px] ${className}`}>
            <div className="animate-pulse h-full">
              <div className={`h-4 rounded mb-3 w-1/2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
              <div className={`flex-1 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} style={{height: 'calc(100% - 32px)'}}></div>
            </div>
          </div>
        );
      }
      
      return (
        <CandlestickChart
          data={metric.chartData}
          openKey="open"
          closeKey="close"
          highKey="high"
          lowKey="low"
          asCard={true}
          title={metric.title}
          height={getChartHeight()}
          className={className}
        />
      );
    
    default:
      return <MetricCard {...commonProps} className={className} />;
  }
};

export default MetricRenderer;
