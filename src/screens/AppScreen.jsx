import React, { useState } from 'react';
import DateRangeSelector from '../components/DateRangeSelector';
import MetricCard from '../components/MetricCard';

const AppScreen = ({ isDarkMode }) => {
  const [dateRange, setDateRange] = useState({ preset: 'last7' });

  return (
    <>
      <div className="mb-8">
        <h2 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          App de Búsqueda y Solicitudes
        </h2>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Métricas de la aplicación móvil y web</p>
      </div>
      <div className="mb-4">
          <DateRangeSelector value={dateRange} onChange={setDateRange} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        <MetricCard
          title="Solicitudes creadas"
          value="892"
          change="+31%"
          changeStatus="positive"
          periodLabel={dateRange.preset === 'custom' ? 'Personalizado' : 'Periodo seleccionado'}
          description="Número de solicitudes de servicio creadas."
        />
        <MetricCard
          title="Conversión búsqueda → solicitud"
          value="67.4%"
          change="+5.2%"
          changeStatus="positive"
          periodLabel={dateRange.preset === 'custom' ? 'Personalizado' : 'Periodo seleccionado'}
          description="Porcentaje de conversión de búsqueda a solicitud"
        />
        <MetricCard
          title="Cancelación de solicitudes"
          value="12.3%"
          change="-2.1%"
          changeStatus="negative"
          periodLabel={dateRange.preset === 'custom' ? 'Personalizado' : 'Periodo seleccionado'}
          description="Porcentaje de cancelación de solicitudes"
        />
      </div>
    </>
  );
};

export default AppScreen;
