import React, { useMemo, useState, useEffect } from 'react';
import MetricRenderer from './MetricRenderer';
import SimpleResizeHandles from './SimpleResizeHandles';
import { useChartSizes } from '../hooks/useChartSizes';

const DraggableMetricCard = ({ 
  metric, 
  index, 
  dateRange, 
  isDarkMode, 
  onReorder,
  className = '',
  allowToggleToChart = true,
  chartKind = 'line'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showResizeHandles, setShowResizeHandles] = useState(false);
  const [showTrend, setShowTrend] = useState(() => {
    try {
      if (allowToggleToChart && metric?.type === 'card') {
        const stored = localStorage.getItem(`dashboard-showTrend-${metric.id}`);
        return stored ? JSON.parse(stored) === true : false;
      }
    } catch (_) {}
    return false;
  });

  // Persistir estado de toggle por métrica
  useEffect(() => {
    try {
      if (allowToggleToChart && metric?.type === 'card') {
        localStorage.setItem(`dashboard-showTrend-${metric.id}`, JSON.stringify(showTrend));
      }
    } catch (_) {}
  }, [showTrend, allowToggleToChart, metric?.type, metric?.id]);

  // Si la feature se deshabilita dinámicamente, forzar volver a card y limpiar
  useEffect(() => {
    if (!allowToggleToChart && showTrend) {
      setShowTrend(false);
      try { localStorage.setItem(`dashboard-showTrend-${metric.id}`, JSON.stringify(false)); } catch (_) {}
    }
  }, [allowToggleToChart]);
  
  const { getChartSize, updateChartSize, getGridClasses: getChartGridClasses } = useChartSizes();

  // Preparar datos locales sin mutar la métrica original
  const localChartData = useMemo(() => {
    if (metric.chartData && metric.chartData.length) return metric.chartData;
    const now = new Date();
    const numericBase = Number(String(metric.value).replace(/[^0-9.]/g, '')) || 100;
    // Generar datos distintos si es velas
    if (chartKind === 'candlestick') {
      let lastClose = numericBase;
      return Array.from({ length: 12 }).map((_, i) => {
        const d = new Date(now);
        d.setDate(now.getDate() - (11 - i));
        const open = lastClose;
        const change = (Math.random() - 0.5) * (numericBase * 0.06);
        const close = Math.max(0, open + change);
        const high = Math.max(open, close) + Math.random() * (numericBase * 0.03);
        const low = Math.min(open, close) - Math.random() * (numericBase * 0.03);
        lastClose = close;
        return {
          date: d.toISOString().slice(0, 10),
          open: Math.round(open * 100) / 100,
          close: Math.round(close * 100) / 100,
          high: Math.round(high * 100) / 100,
          low: Math.round(low * 100) / 100
        };
      });
    }
    // Generar 7 días con una leve variación alrededor del valor actual para líneas/áreas
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (6 - i));
      return {
        date: d.toISOString().slice(0, 10),
        value: Math.max(0, Math.round(numericBase + (Math.random() - 0.5) * (numericBase * 0.1 || 4)))
      };
    });
  }, [metric.chartData, metric.value, chartKind]);

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
      : metric.type === 'map'
        ? 'col-span-1 row-span-2'
        : (metric.type === 'card' && showTrend)
          ? 'col-span-1 row-span-2'
          : 'col-span-1 row-span-1';
  
  const currentSize = isResizableChart ? getChartSize(metric.id, metric.type) : null;
  const isDraggable = true; // permitir mover todas las métricas

  return (
    <div
      className={`metric-card-container ${gridClasses} ${isDragging ? 'opacity-50 scale-95' : ''} ${isDragOver ? 'drag-over' : ''} ${className} relative group`}
      draggable={isDraggable}
      onDragStart={isDraggable ? handleDragStart : undefined}
      onDragEnd={isDraggable ? handleDragEnd : undefined}
      onDragOver={isDraggable ? handleDragOver : undefined}
      onDragLeave={isDraggable ? handleDragLeave : undefined}
      onDrop={isDraggable ? handleDrop : undefined}
      onMouseEnter={() => isResizableChart && setShowResizeHandles(true)}
      onMouseLeave={() => isResizableChart && setShowResizeHandles(false)}
      style={{ 
        cursor: isDraggable ? (isDragging ? 'grabbing' : 'grab') : 'default',
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
      
      <div className="metric-card-handle" onClick={() => { 
        if (allowToggleToChart && metric.type === 'card' && !showTrend) {
          setShowTrend(true);
          try { localStorage.setItem(`dashboard-showTrend-${metric.id}`, JSON.stringify(true)); } catch (_) {}
        }
      }}>
        <MetricRenderer
          metric={metric.type === 'card' ? { ...metric, showTrend: allowToggleToChart && showTrend, chartData: localChartData, trendKind: chartKind } : metric}
          dateRange={dateRange}
          isDarkMode={isDarkMode}
          chartSize={currentSize}
          metricKey={`${metric.id}-${index}`}
          onClick={() => { 
            if (allowToggleToChart && metric.type === 'card' && showTrend) {
              setShowTrend(false);
              try { localStorage.setItem(`dashboard-showTrend-${metric.id}`, JSON.stringify(false)); } catch (_) {}
            }
          }}
        />
      </div>
    </div>
  );
};

export default DraggableMetricCard;
