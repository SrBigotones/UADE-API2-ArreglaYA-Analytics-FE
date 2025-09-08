import React from 'react';

const UsersScreen = () => {
  const metrics = [
    { name: "Nuevos usuarios registrados", value: "234", change: "+28%", status: "positive" },
    { name: "Usuarios con roles asignados", value: "94.1%", change: "+3.2%", status: "positive" },
    { name: "Tiempo promedio JWT", value: "0.3s", change: "-8%", status: "positive" },
    { name: "Usuarios activos este mes", value: "8,456", change: "+15%", status: "positive" },
    { name: "Tasa de retención", value: "87.3%", change: "+5.1%", status: "positive" }
  ];

  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 text-gray-900">
          Usuarios & Roles
        </h2>
        <p className="text-gray-600">Métricas de usuarios y gestión de roles</p>
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

export default UsersScreen;
