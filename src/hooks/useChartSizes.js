import { useState, useEffect } from 'react';

export const useChartSizes = () => {
  const [chartSizes, setChartSizes] = useState({});

  // Cargar tamaños guardados del localStorage
  useEffect(() => {
    const savedSizes = localStorage.getItem('dashboard-chart-sizes');
    if (savedSizes) {
      try {
        const parsed = JSON.parse(savedSizes);
        // Validar y limpiar datos al cargar
        const cleaned = {};
        Object.entries(parsed).forEach(([key, value]) => {
          if (typeof value === 'object' && value !== null && 
              typeof value.cols === 'number' && typeof value.rows === 'number' &&
              value.cols >= 1 && value.cols <= 3 && value.rows >= 1 && value.rows <= 5) {
            cleaned[key] = value;
          } else if (typeof value === 'number' && value >= 1 && value <= 3) {
            // Migrar formato antiguo válido
            cleaned[key] = { cols: value, rows: 2 };
          }
          // Ignorar valores inválidos
        });
        setChartSizes(cleaned);
        
        // Si se limpiaron datos, actualizar localStorage
        if (Object.keys(cleaned).length !== Object.keys(parsed).length) {
          localStorage.setItem('dashboard-chart-sizes', JSON.stringify(cleaned));
          console.log('Datos de tamaño limpiados automáticamente');
        }
      } catch (error) {
        console.error('Error loading chart sizes:', error);
        localStorage.removeItem('dashboard-chart-sizes');
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
      const defaultRows = defaultType === 'card' ? 1 : 2; // Solo cards tienen 1 fila por defecto
      return { cols: defaultCols, rows: defaultRows };
    }
    const saved = chartSizes[metricId];
    // Migrar formato antiguo (número) al nuevo (objeto)
    if (typeof saved === 'number') {
      const defaultRows = defaultType === 'card' ? 1 : 2;
      return { cols: saved, rows: defaultRows };
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
      case 'map':
        return 1; // 1 columna por defecto
      case 'card':
        return 1; // 1 columna por defecto para tarjetas
      default:
        return 1;
    }
  };

  // Actualizar el tamaño de un gráfico
  const updateChartSize = (metricId, newSize) => {
    // Asegurar que newSize sea un objeto válido
    let validSize;
    if (typeof newSize === 'object' && newSize !== null) {
      // Validar rangos
      const cols = Math.max(1, Math.min(3, newSize.cols || 1));
      const rows = Math.max(1, Math.min(5, newSize.rows || 2));
      validSize = { cols, rows };
    } else if (typeof newSize === 'number') {
      const cols = Math.max(1, Math.min(3, newSize));
      validSize = { cols, rows: 2 };
    } else {
      // Si hay un problema, no actualizar nada para mantener el valor actual
      console.warn('updateChartSize: newSize inválido', metricId, newSize);
      return;
    }
    
    // Debug temporal para detectar cambios inesperados
    console.log(`Actualizando tamaño - ${metricId}:`, validSize, 'Stack:', new Error().stack.split('\n')[2]);
    
    setChartSizes(prev => ({
      ...prev,
      [metricId]: validSize
    }));
  };

  // Obtener las clases CSS Grid según el tamaño para todos los tipos
  const getGridClasses = (metricId, type) => {
    const size = getChartSize(metricId, type);
    const cols = size.cols || getDefaultSize(type);
    
    
    // Definir altura por defecto según el tipo
    let defaultRows = 2; // Por defecto 2 filas para gráficos y mapas
    if (type === 'card') {
      defaultRows = 1; // Solo las tarjetas simples tienen 1 fila por defecto
    }
    
    const rows = size.rows || defaultRows;
    
    
    // Generar clases de columnas basadas en el tamaño
    const colClass = cols === 3 ? 'col-span-1 md:col-span-3 lg:col-span-3'
      : cols === 2 ? 'col-span-1 md:col-span-2 lg:col-span-2'
      : 'col-span-1 md:col-span-1 lg:col-span-1';
    
    // Generar clases de filas basadas en el tamaño
    const rowClass = rows === 1 ? 'row-span-1' 
      : rows === 2 ? 'row-span-2' 
      : rows === 3 ? 'row-span-3'
      : rows === 4 ? 'row-span-4'
      : 'row-span-5';
    
    return `${colClass} ${rowClass}`;
  };

  // Resetear todos los tamaños
  const resetChartSizes = () => {
    setChartSizes({});
    localStorage.removeItem('dashboard-chart-sizes');
  };

  // Función para limpiar datos corruptos del localStorage
  const cleanCorruptedSizes = () => {
    const saved = localStorage.getItem('dashboard-chart-sizes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const cleaned = {};
        
        // Limpiar cada entrada
        Object.entries(parsed).forEach(([key, value]) => {
          if (typeof value === 'object' && value !== null && 
              typeof value.cols === 'number' && typeof value.rows === 'number') {
            cleaned[key] = value;
          } else if (typeof value === 'number') {
            // Migrar formato antiguo
            cleaned[key] = { cols: value, rows: 2 };
          }
          // Ignorar valores corruptos
        });
        
        localStorage.setItem('dashboard-chart-sizes', JSON.stringify(cleaned));
        setChartSizes(cleaned);
        console.log('Datos de tamaño limpiados:', cleaned);
      } catch (error) {
        console.error('Error limpiando datos:', error);
        resetChartSizes();
      }
    }
  };

  // Función para resetear tamaños de métricas específicas que están causando problemas
  const resetMetricSize = (metricId) => {
    setChartSizes(prev => {
      const newSizes = { ...prev };
      delete newSizes[metricId];
      localStorage.setItem('dashboard-chart-sizes', JSON.stringify(newSizes));
      console.log(`Tamaño reseteado para métrica: ${metricId}`);
      return newSizes;
    });
  };

  return {
    chartSizes,
    getChartSize,
    updateChartSize,
    getGridClasses,
    resetChartSizes,
    cleanCorruptedSizes,
    resetMetricSize
  };
};
