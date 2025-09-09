import React, { useState } from 'react';
import MetricRenderer from './MetricRenderer';

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

  return (
    <div
      className={`metric-card-container ${isDragging ? 'opacity-50 scale-95' : ''} ${isDragOver ? 'drag-over' : ''} ${className}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{ 
        cursor: 'grab',
        transition: 'all 0.2s ease'
      }}
    >
      <div className="metric-card-handle">
        <MetricRenderer
          metric={metric}
          dateRange={dateRange}
          isDarkMode={isDarkMode}
        />
      </div>
    </div>
  );
};

export default DraggableMetricCard;
