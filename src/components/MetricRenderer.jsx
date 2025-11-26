import React, { useMemo } from 'react';
import MetricCard from './MetricCard';
import PieResponsiveContainer from './PieResponsiveContainer';
import AreaResponsiveContainer from './AreaResponsiveContainer';
import CandlestickChart from './CandlestickChart';
import LeafletHeatMap from './LeafletHeatMap';
import InfoTooltip from './InfoTooltip';

const formatDisplayFilters = (activeFilters, acceptsFilters = [], activeFilterLabels = null) => {
  if (!activeFilters || !acceptsFilters || acceptsFilters.length === 0) return null;

  const filterLabels = {
    rubro: 'Rubro',
    zona: 'Zona',
    metodo: 'Método',
    tipoSolicitud: 'Tipo'
  };

  const paymentMethodLabels = {
    'CREDIT_CARD': 'Tarjeta de Crédito',
    'DEBIT_CARD': 'Tarjeta de Débito',
    'MERCADO_PAGO': 'Mercado Pago'
  };

  const filters = [];
  Object.entries(activeFilters).forEach(([key, value]) => {
    if (value && value !== '' && acceptsFilters.includes(key)) {
      const labelOverride = activeFilterLabels?.[key];
      const fallbackValue = key === 'metodo' ? (paymentMethodLabels[value] || value) : value;
      filters.push(`${filterLabels[key] || key}: ${labelOverride || fallbackValue}`);
    }
  });

  return filters.length > 0 ? filters : null;
};

const MetricRenderer = ({ metric, dateRange, className = '', isDarkMode, chartSize, onClick, metricKey, activeFilters, activeFilterLabels }) => {
  const displayFilters = useMemo(
    () => formatDisplayFilters(activeFilters, metric?.acceptsFilters, activeFilterLabels),
    [activeFilters, metric?.acceptsFilters, activeFilterLabels]
  );

  if (!metric) return null;

  const commonProps = {
    title: metric.title,
    value: metric.value,
    change: metric.change,
    changeStatus: metric.changeStatus,
    periodLabel: metric.customPeriodLabel || (dateRange?.preset === 'custom' ? 'Personalizado' : 'Periodo seleccionado'),
    description: metric.description,
    infoExtra: metric.infoExtra,
    loading: metric.loading,
    error: metric.error,
    isRealData: metric.isRealData,
    hideChangeIndicator: metric.hideChangeIndicator || false,
    activeFilters: activeFilters || null,
    activeFilterLabels: activeFilterLabels || null,
    acceptsFilters: metric.acceptsFilters || [],
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
      // Si el usuario pidió ver la evolución temporal
      if (metric.showTrend) {
        // Mostrar el gráfico incluso si chartData está vacío o tiene valores en 0
        // Solo mostrar mensaje de error si chartData es undefined/null
        if (Array.isArray(metric.chartData)) {
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
        
        // Si chartData es undefined/null (error o sin servicio), mostrar mensaje
        return (
          <div 
            className={`rounded-lg shadow-sm border p-6 ${isDarkMode ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} w-full h-full min-h-[200px] flex flex-col ${className}`}
            onClick={onClick}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className={`text-base font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {metric.title}
              </h3>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <svg className={`w-16 h-16 mb-3 ${isDarkMode ? 'text-yellow-600' : 'text-yellow-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                No hay datos históricos disponibles
              </p>
              <p className={`text-xs ${isDarkMode ? 'text-yellow-500/80' : 'text-yellow-600/80'} max-w-xs`}>
                No se encontraron datos para el período seleccionado. Intenta con otro rango de fechas o verifica que el backend tenga datos en la base.
              </p>
              {onClick && (
                <p className={`text-xs mt-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  Haz click para volver a la tarjeta
                </p>
              )}
            </div>
          </div>
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
      
      // Si no hay datos, mostrar mensaje
      if (!metric.chartData || metric.chartData.length === 0) {
        return (
          <div
            className={`rounded-lg shadow-sm border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} w-full flex items-center justify-center ${className}`}
            style={{ height: getChartHeight() }}
          >
            <div className="text-center">
              <svg className={`w-16 h-16 mb-3 mx-auto ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {metric.title}
              </p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                No hay datos para mostrar
              </p>
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
            title={
              <>
                {metric.title} {" "}
                <InfoTooltip content={metric.infoExtra} />
              </>
            }
            filters={displayFilters}
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
      const filterLabelClasses = isDarkMode ? 'text-blue-400' : 'text-blue-600';
      const filterTextClasses = isDarkMode ? 'text-gray-400' : 'text-gray-600';
      return (
        <div className={className}>
          <div className={`rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`px-4 py-3 ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-base font-medium">
                    {metric.title}
                    <InfoTooltip content={metric.infoExtra} />
                  </h3>
                  {metric.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">{metric.description}</p>
                  )}
                </div>
                {displayFilters && (
                  <div className="text-right">
                    <p className={`text-[10px] font-medium ${filterLabelClasses} mb-0.5`}>Filtros:</p>
                    {displayFilters.map((filter, index) => (
                      <p key={index} className={`text-[10px] ${filterTextClasses} leading-tight`}>
                        {filter}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="overflow-hidden rounded-b-lg">
            <LeafletHeatMap
              key={`${metricKey}-${chartSize?.cols || 1}x${chartSize?.rows || 2}`}
              mapKey={`${metricKey}-${chartSize?.cols || 1}x${chartSize?.rows || 2}`}
              points={metric.points || []}
              height={mapHeight}
              heatOptions={metric.heatOptions || { radius: 28, blur: 16, minOpacity: 0.08 }}
            />
            </div>
          </div>
        </div>
      );
    }
    
    default:
      return <MetricCard key={metric.id} {...commonProps} className={className} onClick={onClick} />;
  }
};

export default MetricRenderer;
