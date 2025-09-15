import React, { useState } from 'react';

const SimpleResizeHandles = ({ 
  metricId, 
  currentSize, 
  onSizeChange, 
  isDarkMode 
}) => {
  const [isResizing, setIsResizing] = useState(false);
  // Validar que currentSize sea válido
  const validCurrentSize = typeof currentSize === 'object' && currentSize 
    ? { cols: currentSize.cols || 2, rows: currentSize.rows || 2 }
    : { cols: 2, rows: 2 };

  const handleMouseDown = (direction) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startSize = validCurrentSize;
    let currentSize = { ...startSize };

    const handleMouseMove = (moveEvent) => {
      let newSize = { ...currentSize };

      if (direction === 'right' || direction === 'left') {
        // Redimensionamiento horizontal
        const deltaX = moveEvent.clientX - startX;
        const sizeChange = Math.floor(Math.abs(deltaX) / 300);
        
        if (direction === 'right') {
          if (deltaX > 0) {
            newSize.cols = Math.min(3, startSize.cols + sizeChange);
          } else {
            newSize.cols = Math.max(1, startSize.cols - sizeChange);
          }
        } else if (direction === 'left') {
          if (deltaX < 0) {
            newSize.cols = Math.min(3, startSize.cols + sizeChange);
          } else {
            newSize.cols = Math.max(1, startSize.cols - sizeChange);
          }
        }
      } else if (direction === 'bottom') {
        // Redimensionamiento vertical solo desde abajo
        const deltaY = moveEvent.clientY - startY;
        const sizeChange = Math.floor(Math.abs(deltaY) / 200);
        
        if (deltaY > 0) {
          // Arrastrando hacia abajo = aumentar altura
          newSize.rows = Math.min(2, startSize.rows + sizeChange);
        } else {
          // Arrastrando hacia arriba = disminuir altura
          newSize.rows = Math.max(1, startSize.rows - sizeChange);
        }
      }

      // Solo actualizar si el tamaño cambió
      if (newSize.cols !== currentSize.cols || newSize.rows !== currentSize.rows) {
        currentSize = { ...newSize };
        onSizeChange(metricId, newSize);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <>
      {/* Handle izquierdo */}
      <div
        className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-transparent"
        onMouseDown={handleMouseDown('left')}
        title="Arrastrar para cambiar ancho (1-3 columnas)"
      >
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-transparent rounded-r"></div>
      </div>

      {/* Handle derecho */}
      <div
        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-transparent"
        onMouseDown={handleMouseDown('right')}
        title="Arrastrar para cambiar ancho (1-3 columnas)"
      >
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-transparent rounded-l"></div>
      </div>

      {/* Handle inferior */}
      <div
        className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-transparent"
        onMouseDown={handleMouseDown('bottom')}
        title="Arrastrar para cambiar altura (1-2 filas)"
      >
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-transparent rounded-t"></div>
      </div>

      {/* Indicador visual cuando está redimensionando */}
      {isResizing && (
        <div className={`absolute top-2 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded text-xs font-medium z-20 ${
          isDarkMode 
            ? 'bg-teal-900 text-teal-100' 
            : 'bg-teal-100 text-teal-900'
        }`}>
          {validCurrentSize.cols}×{validCurrentSize.rows} (ancho×alto)
        </div>
      )}
    </>
  );
};

export default SimpleResizeHandles;
