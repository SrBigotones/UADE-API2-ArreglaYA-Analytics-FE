import React, { useState } from 'react';

const HomeScreen = () => {
  const [activeCategory, setActiveCategory] = useState('core');

  const metrics = {
    core: {
      title: "Core (Hub de Mensajería)",
      metrics: [
        { name: "Tiempo promedio de procesamiento de mensajes", value: "2.3s", change: "+5%", status: "positive" },
        { name: "Tasa de reintentos exitosos", value: "94.2%", change: "+2.1%", status: "positive" },
        { name: "Tasa de reintentos fallidos", value: "5.8%", change: "-1.2%", status: "positive" },
        { name: "Mensajes enviados/min", value: "1,247", change: "+12%", status: "positive" },
        { name: "Mensajes recibidos/min", value: "1,189", change: "+8%", status: "positive" }
      ]
    },
    catalog: {
      title: "Catálogo de Servicios y Prestadores",
      metrics: [
        { name: "Nuevos prestadores registrados", value: "47", change: "+23%", status: "positive" },
        { name: "Perfiles completados", value: "89.3%", change: "+4.7%", status: "positive" },
        { name: "Actualizaciones de prestadores", value: "156", change: "+18%", status: "positive" }
      ]
    },
    app: {
      title: "App de Búsqueda y Solicitudes",
      metrics: [
        { name: "Solicitudes creadas", value: "892", change: "+31%", status: "positive" },
        { name: "Tasa de conversión", value: "67.4%", change: "+5.2%", status: "positive" },
        { name: "Tasa de cancelación", value: "12.3%", change: "-2.1%", status: "positive" }
      ]
    },
    payments: {
      title: "Pagos y Facturación",
      metrics: [
        { name: "Tasa de éxito de pagos", value: "98.7%", change: "+0.8%", status: "positive" },
        { name: "Tiempo promedio de procesamiento", value: "1.8s", change: "-12%", status: "positive" },
        { name: "Reembolsos emitidos", value: "23", change: "-15%", status: "positive" }
      ]
    },
    users: {
      title: "Usuarios & Roles",
      metrics: [
        { name: "Nuevos usuarios registrados", value: "234", change: "+28%", status: "positive" },
        { name: "Usuarios con roles asignados", value: "94.1%", change: "+3.2%", status: "positive" },
        { name: "Tiempo promedio JWT", value: "0.3s", change: "-8%", status: "positive" }
      ]
    },
    matching: {
      title: "Matching y Agenda",
      metrics: [
        { name: "Tiempo promedio de matching", value: "4.2s", change: "-18%", status: "positive" },
        { name: "Cotizaciones aceptadas", value: "78.9%", change: "+6.1%", status: "positive" },
        { name: "Tiempo de respuesta prestadores", value: "2.1s", change: "-22%", status: "positive" }
      ]
    }
  };

  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 text-gray-900">
          {metrics[activeCategory].title}
        </h2>
        <p className="text-gray-600">Métricas en tiempo real del sistema</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics[activeCategory].metrics.map((metric, index) => (
          <div key={index} className="rounded-lg shadow-sm border p-6 bg-white border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">{metric.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                metric.status === 'positive' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {metric.change}
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{metric.value}</div>
            <div className="mt-2 flex items-center">
              <span className={`text-sm ${
                metric.status === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.change.includes('+') ? '↗' : '↘'} {metric.change}
              </span>
              <span className="text-sm ml-2 text-gray-500">vs mes anterior</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default HomeScreen;
