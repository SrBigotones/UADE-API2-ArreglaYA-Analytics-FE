import React from 'react';

const MatchingScreen = () => {
  const metrics = [
    { name: "Tiempo promedio de matching", value: "4.2s", change: "-18%", status: "positive" },
    { name: "Cotizaciones aceptadas", value: "78.9%", change: "+6.1%", status: "positive" },
    { name: "Tiempo de respuesta prestadores", value: "2.1s", change: "-22%", status: "positive" },
    { name: "Matches exitosos por hora", value: "156", change: "+34%", status: "positive" },
    { name: "Tasa de satisfacción", value: "92.4%", change: "+3.7%", status: "positive" }
  ];

  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 text-gray-900">
          Matching y Agenda
        </h2>
        <p className="text-gray-600">Métricas del sistema de matching y agenda</p>
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

export default MatchingScreen;
