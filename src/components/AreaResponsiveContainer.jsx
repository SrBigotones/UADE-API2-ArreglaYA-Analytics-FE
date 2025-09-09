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
  title
}) => {
  // Tooltip personalizado para modo oscuro
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-gray-100">{label}</p>
          <p className="text-gray-600 dark:text-gray-300">
            <span className="font-medium">Valor:</span> {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  const Chart = (
    <div className={className || ''} style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
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
          />
          <YAxis 
            stroke="currentColor"
            className="text-gray-500 dark:text-gray-400"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          {showLegend && <Legend className="text-gray-600 dark:text-gray-300" />}
          <Area type="monotone" dataKey={areaKey} stroke={color} strokeWidth={strokeWidth} fillOpacity={1} fill={`url(#${gradientId})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  if (asCard) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        {title && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          </div>
        )}
        {Chart}
      </div>
    );
  }

  return Chart;
};

export default AreaResponsiveContainer;


