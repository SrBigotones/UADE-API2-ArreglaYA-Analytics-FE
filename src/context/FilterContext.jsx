/**
 * Contexto para manejar el estado global de filtros
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const FilterContext = createContext();

const FILTER_VALUES_STORAGE_KEY = 'arreglaya-active-filters';
const FILTER_LABELS_STORAGE_KEY = 'arreglaya-active-filter-labels';

const getDefaultFilterValues = () => ({
  rubro: '',
  zona: '',
  metodo: '',
  tipoSolicitud: '',
  minMonto: '',
  maxMonto: ''
});

const getDefaultFilterLabels = () => ({
  rubro: '',
  zona: '',
  metodo: '',
  tipoSolicitud: ''
});

// Hook personalizado para usar el contexto de filtros
// eslint-disable-next-line react-refresh/only-export-components
export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};

export const FilterProvider = ({ children }) => {
  const [activeFilters, setActiveFilters] = useState(() => {
    try {
      const saved = localStorage.getItem(FILTER_VALUES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...getDefaultFilterValues(), ...parsed };
      }
    } catch (error) {
      console.error('Error loading filters from localStorage:', error);
    }
    return getDefaultFilterValues();
  });

  const [activeFilterLabels, setActiveFilterLabels] = useState(() => {
    try {
      const saved = localStorage.getItem(FILTER_LABELS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...getDefaultFilterLabels(), ...parsed };
      }
    } catch (error) {
      console.error('Error loading filter labels from localStorage:', error);
    }
    return getDefaultFilterLabels();
  });

  // Guardar filtros en localStorage cuando cambien
  useEffect(() => {
    try {
      localStorage.setItem(FILTER_VALUES_STORAGE_KEY, JSON.stringify(activeFilters));
    } catch (error) {
      console.error('Error saving filters to localStorage:', error);
    }
  }, [activeFilters]);

  useEffect(() => {
    try {
      localStorage.setItem(FILTER_LABELS_STORAGE_KEY, JSON.stringify(activeFilterLabels));
    } catch (error) {
      console.error('Error saving filter labels to localStorage:', error);
    }
  }, [activeFilterLabels]);

  const updateFilter = (filterType, value, displayLabel = '') => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setActiveFilterLabels(prev => ({
      ...prev,
      [filterType]: displayLabel || ''
    }));
  };

  const clearFilter = (filterType) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: ''
    }));
    setActiveFilterLabels(prev => ({
      ...prev,
      [filterType]: ''
    }));
  };

  const clearAllFilters = () => {
    setActiveFilters(getDefaultFilterValues());
    setActiveFilterLabels(getDefaultFilterLabels());
  };

  const hasActiveFilters = Object.values(activeFilters).some(value => value !== '');

  // Convertir filtros al formato esperado por la API
  const getApiFilters = useCallback(() => {
    const apiFilters = {};
    
    if (activeFilters.rubro) apiFilters.rubro = activeFilters.rubro;
    if (activeFilters.zona) apiFilters.zona = activeFilters.zona;
    if (activeFilters.metodo) apiFilters.metodo = activeFilters.metodo;
    if (activeFilters.tipoSolicitud) apiFilters.tipoSolicitud = activeFilters.tipoSolicitud;
    if (activeFilters.minMonto) apiFilters.minMonto = parseFloat(activeFilters.minMonto);
    if (activeFilters.maxMonto) apiFilters.maxMonto = parseFloat(activeFilters.maxMonto);
    
    return apiFilters;
  }, [activeFilters]);

  return (
    <FilterContext.Provider value={{
      activeFilters,
      activeFilterLabels,
      updateFilter,
      clearFilter,
      clearAllFilters,
      hasActiveFilters,
      getApiFilters
    }}>
      {children}
    </FilterContext.Provider>
  );
};
