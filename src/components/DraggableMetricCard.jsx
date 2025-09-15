import React, { useState } from 'react';
import MetricRenderer from './MetricRenderer';
import SimpleResizeHandles from './SimpleResizeHandles';
import { useChartSizes } from '../hooks/useChartSizes';

const DraggableMetricCard = ({ 
  metric, 
  index, 
  dateRange, 
  isDarkMode, 
  onReorder,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showResizeHandles, setShowResizeHandles] = useState(false);
  
  const { getChartSize, updateChartSize, getGridClasses: getChartGridClasses } = useChartSizes();

  const handleDragStart = (e) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setIsDragOver(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    // Solo cambiar el estado si realmente salimos del elemento
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (draggedIndex !== index) {
      onReorder(draggedIndex, index);
    }
  };

  // Determinar si la métrica es un gráfico que puede redimensionarse (solo line charts y candlestick)
  const isResizableChart = ['area', 'line', 'candlestick'].includes(metric.type);
  
  // Obtener las clases de grid (para gráficos redimensionables usa el hook, para otros usa valores fijos)
  const gridClasses = isResizableChart 
    ? getChartGridClasses(metric.id, metric.type)
    : metric.type === 'pie' 
      ? 'col-span-1 md:col-span-1 lg:col-span-1 row-span-2'
      : 'col-span-1 row-span-1';
  
  const currentSize = isResizableChart ? getChartSize(metric.id, metric.type) : null;

  return (
    <div
      className={`metric-card-container ${gridClasses} ${isDragging ? 'opacity-50 scale-95' : ''} ${isDragOver ? 'drag-over' : ''} ${className} relative group`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onMouseEnter={() => setShowResizeHandles(true)}
      onMouseLeave={() => setShowResizeHandles(false)}
      style={{ 
        cursor: isDragging ? 'grabbing' : 'grab',
        transition: 'all 0.2s ease'
      }}
    >
      {/* Handles de redimensionamiento solo para line charts y candlestick */}
      {isResizableChart && showResizeHandles && !isDragging && (
        <SimpleResizeHandles
          metricId={metric.id}
          currentSize={currentSize}
          onSizeChange={updateChartSize}
          isDarkMode={isDarkMode}
        />
      )}
      
      <div className="metric-card-handle">
        <MetricRenderer
          metric={metric}
          dateRange={dateRange}
          isDarkMode={isDarkMode}
          chartSize={currentSize}
        />
      </div>
    </div>
  );
};

export default DraggableMetricCard;
