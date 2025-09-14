import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Tooltip, Legend, Cell } from 'recharts';

const DEFAULT_COLORS = [
  '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#e11d48', '#06b6d4'
];

const PieResponsiveContainer = ({
  data,
  dataKey = 'value',
  nameKey = 'name',
  colors = DEFAULT_COLORS,
  innerRadius = 0,
  outerRadius = '65%',
  showLegend = true,
  showTooltip = true,
  height = 280,
  label = false,
  className,
  chartMargin = { top: 0, right: 0, bottom: 0, left: 0 },
  legendProps = { layout: 'horizontal', align: 'center', verticalAlign: 'bottom', wrapperStyle: { fontSize: 12 } },
  asCard = false,
  title
}) => {
  // Tooltip personalizado para modo oscuro
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-gray-100">{payload[0].name}</p>
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
      <ResponsiveContainer width="100%" height="90%">
        <PieChart margin={chartMargin}>
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          {showLegend && (
            <Legend 
              layout={legendProps.layout}
              align={legendProps.align}
              verticalAlign={legendProps.verticalAlign}
              wrapperStyle={{
                ...legendProps.wrapperStyle,
                color: 'currentColor'
              }}
              className="text-gray-600 dark:text-gray-300"
            />
          )}
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            cx="50%"
            cy="50%"
            paddingAngle={0}
            label={label}
            isAnimationActive={true}
          >
            {(data || []).map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  if (!asCard) return Chart;

  return (
    <div className="rounded-lg shadow-sm border p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 h-full flex flex-col">
      {title && (
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">{title}</h3>
      )}
      <div className="flex-1">
        {Chart}
      </div>
    </div>
  );
};

export default PieResponsiveContainer;


