import React, { useState } from 'react';
import DateRangeSelector from '../components/DateRangeSelector';
import MetricCard from '../components/MetricCard';
import PieResponsiveContainer from '../components/PieResponsiveContainer';

const UsersScreen = ({ isDarkMode }) => {
  const [dateRange, setDateRange] = useState({ preset: 'last7' });

  return (
    <>
      <div className="mb-8">
        
        <h2 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          Usuarios & Roles
        </h2>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Métricas de usuarios y gestión de roles</p>
      </div>
      <div className="mb-4">
          <DateRangeSelector value={dateRange} onChange={setDateRange} />
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        <MetricCard
          title="Nuevos usuarios registrados"
          value="234"
          change="+28%"
          changeStatus="positive"
          periodLabel={dateRange.preset === 'custom' ? 'Personalizado' : 'Periodo seleccionado'}
          description="Evento: Usuario Creado"
        />
        <MetricCard
          title="Tasa de roles asignados"
          value="94.1%"
          change="+3.2%"
          changeStatus="positive"
          periodLabel={dateRange.preset === 'custom' ? 'Personalizado' : 'Periodo seleccionado'}
          description="Clientes/Prestadores/Admins creados vs eliminados"
        />
        <div className="lg:row-span-2">
          <PieResponsiveContainer
            asCard
            title="Tasa de roles asignados"
            data={[
              { name: 'Clientes', value: 150 },
              { name: 'Prestadores', value: 100 },
              { name: 'Admins creados', value: 9 },
              { name: 'Admins eliminados', value: 10 }
            ]}
            label={false}
            height={280}
          />
        </div>
      </div>
    </>
  );
};

export default UsersScreen;
