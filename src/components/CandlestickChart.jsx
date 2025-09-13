import React from 'react';
import {
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  Line,
  Cell
} from 'recharts';

const CandlestickChart = ({
  data = [],
  dataKey = 'value',
  nameKey = 'name',
  openKey = 'open',
  closeKey = 'close',
  highKey = 'high',
  lowKey = 'low',
  colors = ['#10b981', '#ef4444'],
  height = 300,
  showGrid = true,
  showTooltip = true,
  asCard = false,
  title,
  className = '',
  chartMargin = { top: 20, right: 30, left: 20, bottom: 5 }
}) => {
  // Función para el tooltip personalizado
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-gray-100">{label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-gray-600 dark:text-gray-300">
              <span className="font-medium">Apertura:</span> {data[openKey]}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              <span className="font-medium">Cierre:</span> {data[closeKey]}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              <span className="font-medium">Máximo:</span> {data[highKey]}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              <span className="font-medium">Mínimo:</span> {data[lowKey]}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Función para colorear las barras según si es alcista o bajista
  const getBarColor = (entry) => {
    return entry[closeKey] >= entry[openKey] ? colors[0] : colors[1];
  };

  const chartContent = (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart
        data={data}
        margin={chartMargin}
        className={className}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-gray-700" />}
        <XAxis 
          dataKey={nameKey} 
          stroke="currentColor"
          className="text-gray-500 dark:text-gray-400"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          stroke="currentColor"
          className="text-gray-500 dark:text-gray-400"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        {showTooltip && <Tooltip content={<CustomTooltip />} />}
        
        {/* Líneas para mostrar máximos y mínimos */}
        <Line
          type="monotone"
          dataKey={highKey}
          stroke="#9ca3af"
          strokeWidth={1}
          dot={false}
          connectNulls={false}
        />
        <Line
          type="monotone"
          dataKey={lowKey}
          stroke="#9ca3af"
          strokeWidth={1}
          dot={false}
          connectNulls={false}
        />
        
        {/* Barras para mostrar el rango de apertura-cierre */}
        <Bar
          dataKey={closeKey}
          radius={[2, 2, 0, 0]}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
          ))}
        </Bar>
      </ComposedChart>
    </ResponsiveContainer>
  );

  if (asCard) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-full flex flex-col">
        {title && (
          <div className="mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</h3>
          </div>
        )}
        <div className="flex-1">
          {chartContent}
        </div>
      </div>
    );
  }

  return chartContent;
};

export default CandlestickChart;