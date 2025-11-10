import React from 'react';

const statusStyles = {
  positive: 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
  negative: 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
  neutral: 'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-700/30'
};

const MetricCard = ({
  title,
  value,
  change,
  changeStatus = 'neutral',
  description,
  periodLabel,
  loading = false,
  error = null,
  icon = null,
  className,
  onClick,
  compact = false,
  hideChangeIndicator = false,
  activeFilters = null,
  acceptsFilters = []
}) => {
  // Formatear filtros activos para mostrar (solo los que la métrica acepta)
  const formatActiveFilters = () => {
    if (!activeFilters || !acceptsFilters || acceptsFilters.length === 0) return null;
    
    const filterLabels = {
      rubro: 'Rubro',
      zona: 'Zona',
      metodo: 'Método',
      tipoSolicitud: 'Tipo'
    };
    
    // Mapeo de valores de métodos de pago a labels legibles
    const paymentMethodLabels = {
      'CREDIT_CARD': 'Tarjeta de Crédito',
      'DEBIT_CARD': 'Tarjeta de Débito',
      'MERCADO_PAGO': 'Mercado Pago'
    };
    
    const filters = [];
    Object.entries(activeFilters).forEach(([key, value]) => {
      // Solo mostrar el filtro si la métrica lo acepta y tiene valor
      if (value && value !== '' && acceptsFilters.includes(key)) {
        // Para métodos de pago, usar el label legible
        const displayValue = key === 'metodo' ? (paymentMethodLabels[value] || value) : value;
        filters.push(`${filterLabels[key] || key}: ${displayValue}`);
      }
    });
    
    return filters.length > 0 ? filters : null;
  };

  const displayFilters = formatActiveFilters();
  return (
    <div
      className={`rounded-lg shadow-sm border ${compact ? 'p-4' : 'p-5'} bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className || ''} h-full flex flex-col`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className={`${compact ? 'text-sm' : 'text-base'} font-medium text-gray-700 dark:text-gray-300`}>{title}</h3>
          </div>
          {periodLabel && (
            <p className={`${compact ? 'text-[11px]' : 'text-xs'} text-gray-500 dark:text-gray-400 mt-1`}>{periodLabel}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          {icon && (
            <div className="text-gray-400 dark:text-gray-500">{icon}</div>
          )}
          {displayFilters && (
            <div className="text-right">
              <p className="text-[10px] font-medium text-blue-600 dark:text-blue-400 mb-0.5">Filtros:</p>
              {displayFilters.map((filter, index) => (
                <p key={index} className="text-[10px] text-gray-600 dark:text-gray-400 leading-tight">
                  {filter}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3">
        {loading ? (
          <div className="h-8 w-24 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
        ) : error ? (
          <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
        ) : (
          <div className="flex items-center gap-2">
            <div className={`${compact ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900 dark:text-gray-100`}>{value}</div>
            {!hideChangeIndicator && (change !== undefined && change !== null && change !== '') && (
              <>
                <span className={`px-2 py-0.5 rounded-full ${compact ? 'text-[11px]' : 'text-xs'} font-medium ${statusStyles[changeStatus] || statusStyles.neutral}`}>
                  {change}
                </span>
                <span className={`${compact ? 'text-[11px]' : 'text-xs'} text-gray-500 dark:text-gray-400`}>vs periodo anterior</span>
              </>
            )}
          </div>
        )}
      </div>

      {description && (
        <p className={`mt-3 ${compact ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-400`}>{description}</p>
      )}
    </div>
  );
};

export default MetricCard;


