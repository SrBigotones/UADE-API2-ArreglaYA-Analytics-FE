import React from 'react';

const AppScreen = () => {
  const metrics = [
    { name: "Solicitudes creadas", value: "892", change: "+31%", status: "positive" },
    { name: "Tasa de conversión", value: "67.4%", change: "+5.2%", status: "positive" },
    { name: "Tasa de cancelación", value: "12.3%", change: "-2.1%", status: "positive" },
    { name: "Usuarios activos", value: "15,234", change: "+18%", status: "positive" },
    { name: "Tiempo promedio de sesión", value: "8.5min", change: "+12%", status: "positive" }
  ];

  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 text-gray-900">
          App de Búsqueda y Solicitudes
        </h2>
        <p className="text-gray-600">Métricas de la aplicación móvil y web</p>
      </div>

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

export default AppScreen;
