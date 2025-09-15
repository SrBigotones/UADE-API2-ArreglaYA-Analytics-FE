import React, { useState } from 'react';
import DateRangeSelector from '../components/DateRangeSelector';
import MetricCard from '../components/MetricCard';

const MatchingScreen = ({ isDarkMode }) => {
  const [dateRange, setDateRange] = useState({ preset: 'last7' });

  return (
    <>
      <div className="mb-4">
        
        <h2 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          Matching y Agenda
        </h2>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Métricas del sistema de matching y agenda</p>
      </div>
      <div className="mb-4">
          <DateRangeSelector value={dateRange} onChange={setDateRange} />
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        <MetricCard
          title="Cotizaciones pendientes"
          value="56"
          change="+12%"
          changeStatus="negative"
          periodLabel={dateRange.preset === 'custom' ? 'Personalizado' : 'Periodo seleccionado'}
          description="Evento: Cotización Pendiente"
        />
      </div>
    </>
  );
};

export default MatchingScreen;
