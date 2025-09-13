import { useState, useEffect } from 'react';

export const useChartSizes = () => {
  const [chartSizes, setChartSizes] = useState({});

  // Cargar tamaños guardados del localStorage
  useEffect(() => {
    const savedSizes = localStorage.getItem('dashboard-chart-sizes');
    if (savedSizes) {
      try {
        setChartSizes(JSON.parse(savedSizes));
      } catch (error) {
        console.error('Error loading chart sizes:', error);
      }
    }
  }, []);

  // Guardar tamaños en localStorage cuando cambien
  useEffect(() => {
    if (Object.keys(chartSizes).length > 0) {
      localStorage.setItem('dashboard-chart-sizes', JSON.stringify(chartSizes));
    }
  }, [chartSizes]);

  // Obtener el tamaño actual de un gráfico
  const getChartSize = (metricId, defaultType) => {
    // Si no hay tamaño guardado, usar el por defecto según el tipo
    if (!chartSizes[metricId]) {
      const defaultCols = getDefaultSize(defaultType);
      return { cols: defaultCols, rows: 2 };
    }
    const saved = chartSizes[metricId];
    // Migrar formato antiguo (número) al nuevo (objeto)
    if (typeof saved === 'number') {
      return { cols: saved, rows: 2 };
    }
    return saved;
  };

  // Obtener tamaño por defecto según el tipo
  const getDefaultSize = (type) => {
    switch (type) {
      case 'area':
      case 'line':
      case 'candlestick':
        return 2; // 2 columnas por defecto
      case 'pie':
        return 1; // 1 columna por defecto
      default:
        return 1;
    }
  };

  // Actualizar el tamaño de un gráfico
  const updateChartSize = (metricId, newSize) => {
    setChartSizes(prev => ({
      ...prev,
      [metricId]: typeof newSize === 'object' ? newSize : { cols: typeof newSize === 'number' ? newSize : 2, rows: 2 }
    }));
  };

  // Obtener las clases CSS Grid según el tamaño
  const getGridClasses = (metricId, type) => {
    const size = getChartSize(metricId, type);
    const cols = size.cols || 2;
    const rows = size.rows || 2;
    
    switch (type) {
      case 'pie':
        return 'col-span-1 md:col-span-1 lg:col-span-1 row-span-2';
      case 'area':
      case 'line':
      case 'candlestick':
        let colClass;
        if (cols === 3) {
          colClass = 'col-span-1 md:col-span-3 lg:col-span-3';
        } else if (cols === 2) {
          colClass = 'col-span-1 md:col-span-2 lg:col-span-2';
        } else {
          colClass = 'col-span-1 md:col-span-1 lg:col-span-1';
        }
        
        const rowClass = rows === 1 ? 'row-span-1' : 'row-span-2';
        return `${colClass} ${rowClass}`;
      default:
        return 'col-span-1 row-span-1';
    }
  };

  // Resetear todos los tamaños
  const resetChartSizes = () => {
    setChartSizes({});
    localStorage.removeItem('dashboard-chart-sizes');
  };

  return {
    chartSizes,
    getChartSize,
    updateChartSize,
    getGridClasses,
    resetChartSizes
  };
};
