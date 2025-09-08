import React from 'react';

const CatalogScreen = () => {
  const metrics = [
    { name: "Nuevos prestadores registrados", value: "47", change: "+23%", status: "positive" },
    { name: "Perfiles completados", value: "89.3%", change: "+4.7%", status: "positive" },
    { name: "Actualizaciones de prestadores", value: "156", change: "+18%", status: "positive" },
    { name: "Servicios activos", value: "2,847", change: "+12%", status: "positive" },
    { name: "Categorías disponibles", value: "24", change: "+2", status: "positive" }
  ];

  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 text-gray-900">
          Catálogo de Servicios y Prestadores
        </h2>
        <p className="text-gray-600">Métricas del catálogo de servicios y prestadores</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
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

export default CatalogScreen;
