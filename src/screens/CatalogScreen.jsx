import React, { useEffect, useState } from 'react';
import MetricCard from '../components/MetricCard';
import DateRangeSelector from '../components/DateRangeSelector';
import PieResponsiveContainer from '../components/PieResponsiveContainer';
import AreaResponsiveContainer from '../components/AreaResponsiveContainer';
import MetricRenderer from '../components/MetricRenderer';
import { useAxios } from '../hooks/useAxios';
import { getCatalogOrdersHeatmap, getCatalogProvidersRegistered } from '../services/catalogService';

const CatalogScreen = ({ isDarkMode }) => {
  const [dateRange, setDateRange] = useState({ preset: 'last7' });
  const axiosInstance = useAxios();
  const [heatPoints, setHeatPoints] = useState([]);
  const [loadingMap, setLoadingMap] = useState(false);
  const [errorMap, setErrorMap] = useState(null);
  const [providersMetric, setProvidersMetric] = useState({ value: '—', change: null, changeStatus: 'neutral', changeType: 'porcentaje' });

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const load = async () => {
      setLoadingMap(true);
      setErrorMap(null);
      try {
        const { preset, startDate, endDate } = dateRange || {};
        const period = preset || 'last7';
        const [heatResp, providersResp] = await Promise.all([
          getCatalogOrdersHeatmap(axiosInstance, {
          period,
          startDate,
          endDate,
          signal: controller.signal
          }),
          getCatalogProvidersRegistered(axiosInstance, {
            period,
            startDate,
            endDate,
            signal: controller.signal
          })
        ]);
        if (!cancelled && heatResp?.success) {
          setHeatPoints(heatResp.data.points || []);
        }
        if (!cancelled && providersResp?.success) {
          setProvidersMetric({
            value: providersResp.data.value?.toString() ?? '0',
            change: providersResp.data.change,
            changeType: providersResp.data.changeType,
            changeStatus: providersResp.data.changeStatus === 'positivo' ? 'positive' : providersResp.data.changeStatus === 'negativo' ? 'negative' : 'neutral',
          });
        }
      } catch (err) {
        if (!cancelled) setErrorMap(err.message || 'Error cargando mapa de calor');
      } finally {
        if (!cancelled) setLoadingMap(false);
      }
    };

    load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [axiosInstance, dateRange]);

  return (
    <>
      <div className="mb-4">
        <h2 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          Catálogo de Servicios y Prestadores
        </h2>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Métricas del catálogo de servicios y prestadores</p>
      </div>
      <div className="mb-4">
          <DateRangeSelector value={dateRange} onChange={setDateRange} />
      </div>
      {/* Metrics Grid (incluye demo card) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {(() => {
          const sign = providersMetric.changeStatus === 'positive' ? '+' : providersMetric.changeStatus === 'negative' ? '-' : '';
          const numericChange = Number(providersMetric.change);
          const valueAbs = Number.isFinite(numericChange) ? Math.abs(numericChange) : providersMetric.change;
          const suffix = providersMetric.changeType === 'porcentaje' && Number.isFinite(numericChange) ? '%' : '';
          const changeText = providersMetric.change != null ? `${sign}${valueAbs}${suffix}` : undefined;
          return (
            <MetricCard
              title="Nuevos prestadores registrados"
              value={providersMetric.value}
              change={changeText}
              changeStatus={providersMetric.changeStatus}
              periodLabel={dateRange.preset === 'custom' ? 'Personalizado' : 'Últimos 7 días'}
            />
          );
        })()}

        {/* Mapa de calor de servicios/prestadores por ubicación (idéntico al dashboard) */}
        <div className="col-span-1 row-span-2">
          {errorMap ? (
            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-red-900/20 border-red-800 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`}>
              {errorMap}
            </div>
          ) : (
            <MetricRenderer
              metric={{
                id: 'catalog-orders-heatmap',
                type: 'map',
                title: 'Mapa de calor de pedidos',
                description: 'Distribución geográfica de pedidos',
                points: heatPoints || [],
                height: 290
              }}
              dateRange={dateRange}
              isDarkMode={isDarkMode}
              metricKey={`catalog-orders-heatmap`}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default CatalogScreen;
