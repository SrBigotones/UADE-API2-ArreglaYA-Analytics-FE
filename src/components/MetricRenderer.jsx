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
