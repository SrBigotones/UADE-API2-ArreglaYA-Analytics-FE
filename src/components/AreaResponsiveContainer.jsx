import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

const AreaResponsiveContainer = ({
  data,
  xKey = 'name',
  areaKey = 'value',
  color = '#0ea5e9',
  strokeWidth = 2,
  gradientId = 'areaGradient',
  showGrid = true,
  showLegend = false,
  showTooltip = true,
  height = 300,
  className,
  asCard = false,
  title,
  onClick,
  valueFormatter // Formatter para los valores del tooltip
}) => {
  // Calcular el dominio del eje Y para manejar valores en 0
  const calculateYDomain = () => {
    if (!data || data.length === 0) return [0, 4];
    
    const values = data.map(item => item[areaKey] || 0);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    
    // Si todos los valores son 0, establecer un rango visible
    if (maxValue === 0 && minValue === 0) {
      return [0, 4];
    }
    
    // Si hay valores, usar 'auto' para que Recharts calcule automáticamente
    return ['auto', 'auto'];
  };

  // Custom tick para mostrar mes y año en dos líneas
  const CustomXAxisTick = ({ x, y, payload }) => {
    // Si el label contiene | (formato: "Mes|Año"), dividir en dos líneas
    const value = payload.value;
    if (value && value.includes('|')) {
      const [month, year] = value.split('|');
      return (
        <g transform={`translate(${x},${y})`}>
          <text 
            x={0} 
            y={0} 
            dy={10} 
            textAnchor="middle" 
            fill="currentColor" 
            className="text-gray-500 dark:text-gray-400"
            fontSize={12}
          >
            {month}
          </text>
          <text 
            x={0} 
            y={14} 
            dy={10} 
            textAnchor="middle" 
            fill="currentColor" 
            className="text-gray-500 dark:text-gray-400"
            fontSize={10}
            opacity={0.7}
          >
            '{year}
          </text>
        </g>
      );
    }
    
    // Formato simple sin año
    return (
      <g transform={`translate(${x},${y})`}>
        <text 
          x={0} 
          y={0} 
          dy={16} 
          textAnchor="middle" 
          fill="currentColor" 
          className="text-gray-500 dark:text-gray-400"
          fontSize={12}
        >
          {value}
        </text>
      </g>
    );
  };

  // Tooltip personalizado para modo oscuro
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const displayValue = valueFormatter ? valueFormatter(value) : value;
      
      // Formatear el label si tiene el formato Mes|Año
      let displayLabel = label;
      if (label && label.includes('|')) {
        const [month, year] = label.split('|');
        displayLabel = `${month} '${year}`;
      }
      
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-gray-100">{displayLabel}</p>
          <p className="text-gray-600 dark:text-gray-300">
            <span className="font-medium">Valor:</span> {displayValue}
          </p>
        </div>
      );
    }
    return null;
  };

  const yDomain = calculateYDomain();

  const Chart = (
    <div className={className || ''} style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.45} />
              <stop offset="95%" stopColor={color} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-gray-700" />}
          <XAxis 
            dataKey={xKey} 
            stroke="currentColor"
            className="text-gray-500 dark:text-gray-400"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tick={<CustomXAxisTick />}
            height={50}
          />
          <YAxis 
            stroke="currentColor"
            className="text-gray-500 dark:text-gray-400"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            domain={yDomain}
          />
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          {showLegend && <Legend className="text-gray-600 dark:text-gray-300" />}
          <Area 
            type="monotone" 
            dataKey={areaKey} 
            stroke={color} 
            strokeWidth={strokeWidth} 
            fillOpacity={1} 
            fill={`url(#${gradientId})`}
            connectNulls={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  if (asCard) {
    return (
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-full flex flex-col cursor-pointer hover:shadow-md transition-shadow"
        onClick={onClick}
      >
        {title && (
          <div className="mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</h3>
          </div>
        )}
        <div className="flex-1">
          {Chart}
        </div>
      </div>
    );
  }

  return Chart;
};

export default AreaResponsiveContainer;


