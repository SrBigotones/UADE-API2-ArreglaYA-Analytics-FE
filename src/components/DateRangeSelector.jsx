import React, { useMemo } from 'react';

const PRESETS = [
  { id: 'today', label: 'Hoy' },
  { id: 'last7', label: 'Últimos 7 días' },
  { id: 'last30', label: 'Últimos 30 días' },
  { id: 'lastYear', label: 'Último año' },
  { id: 'custom', label: 'Personalizado' }
];

function formatDate(date) {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDate(value) {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return null;
  const dt = new Date(y, m - 1, d);
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
}

function getPresetRange(presetId) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (presetId) {
    case 'today': {
      return { startDate: today, endDate: today };
    }
    case 'last7': {
      const start = new Date(today);
      start.setDate(start.getDate() - 6);
      return { startDate: start, endDate: today };
    }
    case 'last30': {
      const start = new Date(today);
      start.setDate(start.getDate() - 29);
      return { startDate: start, endDate: today };
    }
    case 'lastYear': {
      const start = new Date(today);
      start.setFullYear(start.getFullYear() - 1);
      start.setDate(start.getDate() + 1);
      return { startDate: start, endDate: today };
    }
    default:
      return { startDate: null, endDate: null };
  }
}

const DateRangeSelector = ({
  value,
  onChange,
  minDate,
  maxDate,
  className
}) => {
  const preset = value?.preset || 'last7';

  const { startDate, endDate } = useMemo(() => {
    if (preset !== 'custom') {
      return getPresetRange(preset);
    }
    return {
      startDate: value?.startDate ? new Date(value.startDate) : null,
      endDate: value?.endDate ? new Date(value.endDate) : null
    };
  }, [preset, value?.startDate, value?.endDate]);

  const handlePresetClick = (id) => {
    if (id === 'custom') {
      onChange && onChange({ preset: 'custom', startDate: startDate || null, endDate: endDate || null });
      return;
    }
    const range = getPresetRange(id);
    onChange && onChange({ preset: id, startDate: range.startDate, endDate: range.endDate });
  };

  const handleStartChange = (e) => {
    const newStart = parseDate(e.target.value);
    onChange && onChange({ preset: 'custom', startDate: newStart, endDate });
  };

  const handleEndChange = (e) => {
    const newEnd = parseDate(e.target.value);
    onChange && onChange({ preset: 'custom', startDate, endDate: newEnd });
  };

  const minAttr = minDate ? formatDate(new Date(minDate)) : undefined;
  const maxAttr = maxDate ? formatDate(new Date(maxDate)) : undefined;

  return (
    <div className={className || ''}>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => handlePresetClick(p.id)}
            className={`px-3 py-1.5 rounded border text-sm transition-colors ${
              preset === p.id
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {preset === 'custom' && (
        <div className="mt-3 flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">Desde</label>
          <input
            type="date"
            className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            value={startDate ? formatDate(startDate) : ''}
            onChange={handleStartChange}
            min={minAttr}
            max={maxAttr}
          />
          <label className="text-sm text-gray-600 dark:text-gray-400">Hasta</label>
          <input
            type="date"
            className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            value={endDate ? formatDate(endDate) : ''}
            onChange={handleEndChange}
            min={minAttr}
            max={maxAttr}
          />
        </div>
      )}
    </div>
  );
};

export default DateRangeSelector;


