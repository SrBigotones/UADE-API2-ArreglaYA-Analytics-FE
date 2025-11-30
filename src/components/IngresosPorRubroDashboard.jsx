import React, { useEffect, useState } from 'react';
import { Card, Table, PieChart, BarChart, LineChart } from './YourChartComponents'; // Reemplaza con tus componentes reales
import { useAxios } from '../hooks/useAxios';

// Utilidad para formatear moneda ARS
const formatCurrency = value =>
  value?.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }) ?? '-';

const getBadge = (estado, cambio) => {
  if (estado === 'positivo') return <span className="text-green-600">↑ {formatCurrency(cambio)}</span>;
  if (estado === 'negativo') return <span className="text-red-600">↓ {formatCurrency(cambio)}</span>;
  return <span className="text-gray-500">→ {formatCurrency(cambio)}</span>;
};

const IngresosPorRubroDashboard = () => {
  const axios = useAxios();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios.get('/api/metrica/rubros/ingresos-por-categoria')
      .then(res => {
        setData(res.data.data);
        setError(null);
      })
      .catch(() => setError('Error al cargar datos'))
      .finally(() => setLoading(false));
  }, [axios]);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!data) return null;

  // Top 5 categorías
  const topCategorias = [...data.categorias]
    .sort((a, b) => b.ingresos_actuales - a.ingresos_actuales)
    .slice(0, 5);

  // Configuración de tabla
  const columns = [
    { field: 'nombre_rubro', header: 'Categoría' },
    { field: 'ingresos_actuales', header: 'Ingresos', render: row => formatCurrency(row.ingresos_actuales) },
    { field: 'cambio', header: 'Cambio', render: row => getBadge(row.cambio_estado, row.cambio) },
    { field: 'cambio_estado', header: 'Tendencia', render: row => getBadge(row.cambio_estado, row.cambio) },
  ];

  // Pie chart
  const chartDataPie = {
    labels: data.categorias.map(c => c.nombre_rubro),
    datasets: [{
      data: data.categorias.map(c => c.ingresos_actuales),
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
    }]
  };

  // Bar chart
  const chartDataBarras = {
    labels: data.categorias.map(c => c.nombre_rubro),
    datasets: [
      {
        label: 'Período Actual',
        data: data.categorias.map(c => c.ingresos_actuales),
        backgroundColor: '#10B981'
      },
      {
        label: 'Período Anterior',
        data: data.categorias.map(c => c.ingresos_anteriores),
        backgroundColor: '#94A3B8'
      }
    ]
  };

  // KPI config
  const kpiConfig = {
    title: 'Ingresos Totales',
    value: formatCurrency(data.total.ingresos_actuales),
    change: data.total.cambio,
    changeStatus: data.total.cambio_estado,
    trend: data.total.cambio_estado === 'positivo' ? 'up' : 'down',
    icon: '💰'
  };

  return (
    <div className="space-y-8">
      {/* Fila 1: KPI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card title={kpiConfig.title} icon={kpiConfig.icon}>
          <div className="text-3xl font-bold">{kpiConfig.value}</div>
          <div className={`mt-2 text-${kpiConfig.changeStatus === 'positivo' ? 'green' : kpiConfig.changeStatus === 'negativo' ? 'red' : 'gray'}-600 font-medium`}>
            {getBadge(kpiConfig.changeStatus, kpiConfig.change)}
          </div>
        </Card>
        {/* Aquí podrías agregar filtros o selector de período si lo necesitas */}
      </div>

      {/* Fila 2: Pie y Tabla */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PieChart data={chartDataPie} />
        <Table columns={columns} data={topCategorias} />
      </div>

      {/* Fila 3: Barras */}
      <div>
        <BarChart data={chartDataBarras} />
      </div>

      {/* Fila 4: Líneas por rubro */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.categorias.map(cat => (
          <LineChart
            key={cat.id_rubro}
            data={{
              labels: cat.datos_historicos.map(d => d.date),
              datasets: [{
                label: 'Ingresos',
                data: cat.datos_historicos.map(d => d.value),
                borderColor: '#3B82F6',
                fill: true,
                backgroundColor: 'rgba(59,130,246,0.1)'
              }]
            }}
            title={cat.nombre_rubro}
          />
        ))}
      </div>
    </div>
  );
};

export default IngresosPorRubroDashboard;
