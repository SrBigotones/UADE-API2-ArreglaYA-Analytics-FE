/**
 * Contexto para manejar el estado global de filtros
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const FilterContext = createContext();

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};

export const FilterProvider = ({ children }) => {
  const [activeFilters, setActiveFilters] = useState(() => {
    // Intentar cargar filtros desde localStorage
    try {
      const saved = localStorage.getItem('arreglaya-active-filters');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading filters from localStorage:', error);
    }
    return {
      rubro: '',
      zona: '',
      metodo: '',
      tipoSolicitud: '',
      minMonto: '',
      maxMonto: ''
    };
  });

  // Guardar filtros en localStorage cuando cambien
  useEffect(() => {
    try {
      localStorage.setItem('arreglaya-active-filters', JSON.stringify(activeFilters));
    } catch (error) {
      console.error('Error saving filters to localStorage:', error);
    }
  }, [activeFilters]);

  const updateFilter = (filterType, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilter = (filterType) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: ''
    }));
  };

  const clearAllFilters = () => {
    setActiveFilters({
      rubro: '',
      zona: '',
      metodo: '',
      tipoSolicitud: '',
      minMonto: '',
      maxMonto: ''
    });
  };

  const hasActiveFilters = Object.values(activeFilters).some(value => value !== '');

  // Convertir filtros al formato esperado por la API
  const getApiFilters = () => {
    const apiFilters = {};
    
    if (activeFilters.rubro) apiFilters.rubro = activeFilters.rubro;
    if (activeFilters.zona) apiFilters.zona = activeFilters.zona;
    if (activeFilters.metodo) apiFilters.metodo = activeFilters.metodo;
    if (activeFilters.tipoSolicitud) apiFilters.tipoSolicitud = activeFilters.tipoSolicitud;
    if (activeFilters.minMonto) apiFilters.minMonto = parseFloat(activeFilters.minMonto);
    if (activeFilters.maxMonto) apiFilters.maxMonto = parseFloat(activeFilters.maxMonto);
    
    return apiFilters;
  };

  return (
    <FilterContext.Provider value={{
      activeFilters,
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
