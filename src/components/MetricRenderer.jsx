import React from 'react';
import MetricCard from './MetricCard';
import PieResponsiveContainer from './PieResponsiveContainer';
import AreaResponsiveContainer from './AreaResponsiveContainer';
import CandlestickChart from './CandlestickChart';

const MetricRenderer = ({ metric, dateRange, className = '', isDarkMode }) => {
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

  switch (metric.type) {
    case 'card':
      return <MetricCard {...commonProps} className={className} />;
    
    case 'pie':
      return (
        <div className={`col-span-1 md:col-span-1 lg:col-span-1 row-span-2 ${className}`}>
          <PieResponsiveContainer
            data={metric.chartData}
            dataKey="value"
            nameKey="name"
            colors={metric.chartData?.map(item => item.color)}
            asCard={true}
            title={metric.title}
            height={320}
          />
        </div>
      );
    
    case 'area':
      return (
        <div className={`col-span-1 md:col-span-2 lg:col-span-2 row-span-2 ${className}`}>
          <AreaResponsiveContainer
            data={metric.chartData}
            areaKey="value"
            xKey={metric.chartData?.[0]?.time ? 'time' : 'date'}
            asCard={true}
            title={metric.title}
            height={320}
          />
        </div>
      );
    
    case 'candlestick':
      return (
        <div className={`col-span-1 md:col-span-2 lg:col-span-2 row-span-2 ${className}`}>
          <CandlestickChart
            data={metric.chartData}
            openKey="open"
            closeKey="close"
            highKey="high"
            lowKey="low"
            asCard={true}
            title={metric.title}
            height={320}
          />
        </div>
      );
    
    default:
      return <MetricCard {...commonProps} className={className} />;
  }
};

export default MetricRenderer;
