import React from 'react';
import MetricCard from './MetricCard';
import PieResponsiveContainer from './PieResponsiveContainer';
import AreaResponsiveContainer from './AreaResponsiveContainer';
import CandlestickChart from './CandlestickChart';
import LeafletHeatMap from './LeafletHeatMap';

const MetricRenderer = ({ metric, dateRange, className = '', isDarkMode, chartSize, onClick, metricKey }) => {
  if (!metric) return null;

  const commonProps = {
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
    if (!chartSize || !chartSize.rows) return 290;
    if (chartSize.rows === 1) return 180;
    if (chartSize.rows === 2) return 300;
    if (chartSize.rows === 3) return 490;
    if (chartSize.rows === 4) return 670; // altura para 4 filas
    if (chartSize.rows >= 5) return 780; // altura para 5 filas
    return 350;
  };

  // Altura específica para tarjetas que se convierten en gráficos (mantener consistencia)
  const getCardChartHeight = () => {
    // Para tarjetas que se expanden, usar altura más compacta
    if (!chartSize || !chartSize.rows) return 140; // altura más compacta
    if (chartSize.rows === 1) return 140; // mantener altura compacta
    if (chartSize.rows === 2) return 300; // altura para 2 filas
    if (chartSize.rows === 3) return 490; // altura para 3 filas
    if (chartSize.rows === 4) return 580; // altura para 4 filas
    if (chartSize.rows >= 5) return 680; // altura para 5 filas
    return 140;
  };

  switch (metric.type) {
    case 'card':
      // Si el usuario pidió ver la evolución temporal, renderizar área/linea/velas
      if (metric.showTrend && Array.isArray(metric.chartData) && metric.chartData.length) {
        const xKey = metric.chartData?.[0]?.time ? 'time' : 'date';
        if (metric.trendKind === 'candlestick') {
          return (
            <CandlestickChart
              data={metric.chartData}
              nameKey={xKey}
              openKey="open"
              closeKey="close"
              highKey="high"
              lowKey="low"
              valueKey="value" // Para datos simples (el componente detecta automáticamente)
              asCard={true}
              title={metric.title}
              height={getCardChartHeight()}
              className={className}
              onClick={onClick}
            />
          );
        }
        if (metric.trendKind === 'bar') {
          // Fallback simple: usar AreaResponsiveContainer con stroke ancho simulando barras si no hay Bar contenedor
          return (
            <AreaResponsiveContainer
              data={metric.chartData}
              xKey={xKey}
              areaKey="value"
              color={metric.color || '#0ea5e9'}
              asCard={true}
              title={metric.title}
              height={getCardChartHeight()}
              comparisonData={metric.previousPeriodData}
              comparisonLabel="Periodo anterior"
              currentLabel="Periodo actual"
              className={className}
              onClick={onClick}
            />
          );
        }
        return (
          <AreaResponsiveContainer
            data={metric.chartData}
            xKey={xKey}
            areaKey="value"
            color={metric.color || '#0ea5e9'}
            asCard={true}
            title={metric.title}
            height={getCardChartHeight()}
            comparisonData={metric.previousPeriodData}
            comparisonLabel="Periodo anterior"
            currentLabel="Periodo actual"
            className={className}
            onClick={onClick}
          />
        );
      }
      return <MetricCard key={metric.id} {...commonProps} className={className} onClick={onClick} />;
    
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
          height={getChartHeight()}
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
          nameKey={metric.chartData?.[0]?.time ? 'time' : 'date'}
          openKey="open"
          closeKey="close"
          highKey="high"
          lowKey="low"
          valueKey="value" // Para datos simples
          asCard={true}
          title={metric.title}
          height={getChartHeight()}
          className={className}
        />
      );
    case 'map': {
      // Renderizar el mapa con altura dinámica según el tamaño
      const mapHeight = getChartHeight();
      return (
        <div className={className}>
          <div className={`rounded-lg overflow-hidden border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`px-4 py-3 ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
              <h3 className="text-base font-medium">{metric.title}</h3>
              {metric.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400">{metric.description}</p>
              )}
            </div>
            <LeafletHeatMap
              key={`${metricKey}-${chartSize?.cols || 1}x${chartSize?.rows || 2}`}
              mapKey={`${metricKey}-${chartSize?.cols || 1}x${chartSize?.rows || 2}`}
              points={metric.points || []}
              height={mapHeight}
              heatOptions={metric.heatOptions || { radius: 28, blur: 16, minOpacity: 0.08 }}
            />
          </div>
        </div>
      );
    }
    
    default:
      return <MetricCard key={metric.id} {...commonProps} className={className} onClick={onClick} />;
  }
};

export default MetricRenderer;
