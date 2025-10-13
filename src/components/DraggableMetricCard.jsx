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
    if (allowToggleToChart && metric?.type === 'card') {
      const stored = localStorage.getItem(`dashboard-showTrend-${metric.id}`);
      return stored ? JSON.parse(stored) === true : false;
    }
    return false;
  });

  // Persistir estado de toggle por métrica
  useEffect(() => {
    if (allowToggleToChart && metric?.type === 'card') {
      localStorage.setItem(`dashboard-showTrend-${metric.id}`, JSON.stringify(showTrend));
    }
  }, [showTrend, allowToggleToChart, metric?.type, metric?.id]);

  // Si la feature se deshabilita dinámicamente, forzar volver a card y limpiar
  useEffect(() => {
    if (!allowToggleToChart && showTrend) {
      setShowTrend(false);
      localStorage.setItem(`dashboard-showTrend-${metric.id}`, JSON.stringify(false));
    }
  }, [allowToggleToChart, showTrend, metric?.id]);
  
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
    // Evitar drag si es un mapa y el evento viene del área del mapa
    if (metric.type === 'map') {
      // Solo permitir drag desde el área del título, no desde el mapa
      if (e.target.closest('.leaflet-container') || 
          !e.target.closest('.metric-card-handle')) {
        e.preventDefault();
        return;
      }
    }
    
    console.log(`Iniciando drag de: ${metric.id} (${metric.type})`);
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
      console.log(`Reordenando: ${draggedIndex} -> ${index}, metric: ${metric.id}`);
      onReorder(draggedIndex, index);
    }
  };

  // Todos los tipos de contenedores ahora son redimensionables
  const isResizableChart = true;
  
  // Usar el hook para obtener las clases de grid para todos los tipos
  const gridClasses = getChartGridClasses(metric.id, metric.type);
  
  const currentSize = isResizableChart ? getChartSize(metric.id, metric.type) : null;
  const isDraggable = metric.type !== 'map'; // deshabilitar drag para mapas

  return (
    <div
      className={`metric-card-container ${gridClasses} ${isDragging ? 'opacity-50 scale-95' : ''} ${isDragOver ? 'drag-over' : ''} ${className} relative group ${metric.type === 'map' ? 'map-container' : ''}`}
      draggable={isDraggable}
      onDragStart={isDraggable ? handleDragStart : undefined}
      onDragEnd={isDraggable ? handleDragEnd : undefined}
      onDragOver={isDraggable ? handleDragOver : undefined}
      onDragLeave={isDraggable ? handleDragLeave : undefined}
      onDrop={isDraggable ? handleDrop : undefined}
      onMouseEnter={() => isResizableChart && setShowResizeHandles(true)}
      onMouseLeave={() => isResizableChart && setShowResizeHandles(false)}
      style={{ 
        cursor: isDraggable && metric.type !== 'map' ? (isDragging ? 'grabbing' : 'grab') : 'default',
        transition: metric.type !== 'map' ? 'all 0.2s ease' : 'none'
      }}
    >
      
      {/* Handles de redimensionamiento para todos los tipos de contenedores */}
      {isResizableChart && showResizeHandles && !isDragging && !isDragOver && (
        <SimpleResizeHandles
          metricId={metric.id}
          currentSize={currentSize}
          onSizeChange={(metricId, newSize) => {
            // Evitar redimensionamiento accidental durante drag
            if (!isDragging && !isDragOver) {
              console.log(`Redimensionando manualmente: ${metricId}`, newSize);
              updateChartSize(metricId, newSize);
            }
          }}
          isDarkMode={isDarkMode}
        />
      )}
      
      <div 
        className="metric-card-handle" 
        onClick={(e) => { 
          // Solo activar toggle para cards, no para mapas u otros tipos
          if (allowToggleToChart && metric.type === 'card' && !showTrend) {
            setShowTrend(true);
            localStorage.setItem(`dashboard-showTrend-${metric.id}`, JSON.stringify(true));
          }
          // Para mapas, evitar que el click se propague y cause selección
          if (metric.type === 'map') {
            e.stopPropagation();
          }
        }}
        draggable={metric.type === 'map'}
        onDragStart={metric.type === 'map' ? handleDragStart : undefined}
        onDragEnd={metric.type === 'map' ? handleDragEnd : undefined}
        style={metric.type === 'map' ? { cursor: 'grab' } : {}}
      >
        <MetricRenderer
          metric={metric.type === 'card' ? { ...metric, showTrend: allowToggleToChart && showTrend, chartData: localChartData, trendKind: chartKind } : metric}
          dateRange={dateRange}
          isDarkMode={isDarkMode}
          chartSize={currentSize}
          metricKey={`${metric.id}-${index}`}
          onClick={(e) => { 
            if (allowToggleToChart && metric.type === 'card' && showTrend) {
              setShowTrend(false);
              localStorage.setItem(`dashboard-showTrend-${metric.id}`, JSON.stringify(false));
            }
            // Para mapas, evitar interferencia con navegación
            if (metric.type === 'map') {
              e?.stopPropagation();
            }
          }}
        />
      </div>
    </div>
  );
};

export default DraggableMetricCard;
