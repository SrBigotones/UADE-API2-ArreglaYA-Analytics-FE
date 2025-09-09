import React, { useState } from 'react';
import MetricCard from '../components/MetricCard';
import DateRangeSelector from '../components/DateRangeSelector';
import PieResponsiveContainer from '../components/PieResponsiveContainer';
import AreaResponsiveContainer from '../components/AreaResponsiveContainer';

const CatalogScreen = ({ isDarkMode }) => {
  const [dateRange, setDateRange] = useState({ preset: 'last7' });
  const metrics = [
    { name: "Nuevos prestadores registrados", value: "47", change: "+23%", status: "positive" },
    { name: "Perfiles completados", value: "89.3%", change: "+4.7%", status: "positive" },
    { name: "Actualizaciones de prestadores", value: "156", change: "+18%", status: "positive" },
    { name: "Servicios activos", value: "2,847", change: "+12%", status: "positive" },
    { name: "Categorías disponibles", value: "24", change: "+2", status: "positive" }
  ];

  const pieData = [
    { name: 'Alta', value: 45 },
    { name: 'Media', value: 30 },
    { name: 'Baja', value: 25 }
  ];

  const areaData = [
    { name: 'Ene', value: 30 },
    { name: 'Feb', value: 45 },
    { name: 'Mar', value: 40 },
    { name: 'Abr', value: 55 },
    { name: 'May', value: 50 },
    { name: 'Jun', value: 62 }
  ];

  return (
    <>
      <div className="mb-8">
        <h2 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          Catálogo de Servicios y Prestadores
        </h2>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Métricas del catálogo de servicios y prestadores</p>
      </div>
      <div className="mb-4">
          <DateRangeSelector value={dateRange} onChange={setDateRange} />
      </div>
      {/* Metrics Grid (incluye demo card) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        <MetricCard
          title="Nuevos prestadores registrados"
          value="47"
          change="+23%"
          changeStatus="positive"
          periodLabel={dateRange.preset === 'custom' ? 'Personalizado' : 'Últimos 7 días'}
        />
        
      </div>
    </>
  );
};

export default CatalogScreen;
