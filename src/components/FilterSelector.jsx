/**
 * Componente de filtros compacto que permite seleccionar por rubro, zona, método de pago o tipo de solicitud
 */

import React, { useState, useRef, useEffect } from 'react';
import { useFilters } from '../context/FilterContext';
import { useAxios } from '../hooks/useAxios';
import { getAllFilterOptions } from '../services/filterOptionsService';

const FilterSelector = ({ className = '', module = 'all' }) => {
  const { activeFilters, updateFilter, clearAllFilters } = useFilters();
  const [activeDropdown, setActiveDropdown] = useState('');
  const [zonaType, setZonaType] = useState('solicitudes'); // 'solicitudes' o 'prestadores'
  const [filterOptions, setFilterOptions] = useState({
    rubro: [],
    zona: [],
    metodo: [],
    tipo: []
  });
  const [loadingOptions, setLoadingOptions] = useState(false);
  const dropdownRef = useRef(null);
  const axiosInstance = useAxios();

  // Configuración de filtros por módulo
  const moduleFilterConfig = {
    'requests': ['rubro', 'zona', 'tipo'], // SOLICITUDES Y MATCHING
    'payments': ['rubro', 'zona', 'metodo'], // PAGOS Y FACTURACIÓN
    'users': [], // USUARIOS Y ROLES (sin filtros por rubro/zona)
    'catalog': ['rubro', 'zona'], // CATÁLOGO DE SERVICIOS Y PRESTADORES
    'all': ['rubro', 'zona', 'metodo', 'tipo'] // Por defecto, todos los filtros
  };

  // Obtener filtros disponibles para el módulo actual
  const availableFilters = moduleFilterConfig[module] || moduleFilterConfig['all'];

  // Mapear los filtros del contexto al formato local
  const selectedFilters = {
    rubro: activeFilters.rubro,
    zona: activeFilters.zona,
    metodo: activeFilters.metodo,
    tipo: activeFilters.tipoSolicitud
  };

  // Todos los tipos de filtros posibles
  const allFilterTypes = [
    { 
      id: 'rubro', 
      label: 'Rubro', 
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      )
    },
    { 
      id: 'zona', 
      label: 'Zona', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    { 
      id: 'metodo', 
      label: 'Método de Pago', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      )
    },
    { 
      id: 'tipo', 
      label: 'Tipo de Solicitud', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    }
  ];

  // Opciones fallback (datos reales del sistema)
  const getFallbackOptions = () => ({
    rubro: [
      { id: 48, nombre: 'Sistemas' },
      { id: 49, nombre: 'Plomería' },
      { id: 50, nombre: 'Electricidad' }
    ],
    zona: [
      { id: 64, nombre: 'Agronomía' },
      { id: 65, nombre: 'Almagro' },
      { id: 67, nombre: 'Balvanera' }
    ],
    metodo: [
      { label: 'Tarjeta de Crédito', value: 'CREDIT_CARD' },
      { label: 'Tarjeta de Débito', value: 'DEBIT_CARD' },
      { label: 'Mercado Pago', value: 'MERCADO_PAGO' }
    ],
    tipo: ['Abierta', 'Dirigida']
  });

  // Cargar opciones de filtros desde la API
  useEffect(() => {
    const loadFilterOptions = async () => {
      if (!axiosInstance) return;
      
      setLoadingOptions(true);
      try {
        // Para módulo "all", usar el zonaType seleccionado por el usuario
        const effectiveModule = module === 'all' 
          ? (zonaType === 'prestadores' ? 'catalog' : 'app')
          : module;
        
        // Pasar el módulo efectivo para que cargue las zonas correctas
        const result = await getAllFilterOptions(axiosInstance, effectiveModule);
        if (result.success) {
          setFilterOptions({
            rubro: result.data.rubros || [],
            zona: result.data.zonas || [],
            metodo: result.data.metodos || [],
            tipo: result.data.tiposSolicitud || []
          });
        } else {
          console.error('Error loading filter options:', result.message);
          setFilterOptions(getFallbackOptions());
        }
      } catch (error) {
        console.error('Error loading filter options:', error);
        setFilterOptions(getFallbackOptions());
      } finally {
        setLoadingOptions(false);
      }
    };

    loadFilterOptions();
  }, [axiosInstance, module, zonaType]); // Agregar zonaType como dependencia

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrar tipos de filtros según el módulo actual
  const filterTypes = allFilterTypes.filter(filterType => 
    availableFilters.includes(filterType.id)
  );

  // Si no hay filtros configurados para el módulo, no renderizar el componente
  if (filterTypes.length === 0) {
    return null;
  }

  const handleFilterTypeSelect = (filterType) => {
    if (activeDropdown === filterType) {
      // Si ya está abierto, lo cerramos
      setActiveDropdown('');
    } else {
      // Abrimos el dropdown del tipo seleccionado
      setActiveDropdown(filterType);
    }
  };

  const handleValueSelect = (filterType, selectedOption, displayLabel) => {
    // Mapear el tipo local al tipo del contexto
    const contextFilterType = filterType === 'tipo' ? 'tipoSolicitud' : filterType;
    
    // Para rubros: enviar ID (número)
    // Para zonas: enviar NOMBRE (string)
    // Para métodos de pago: enviar value
    // Para tipos de solicitud: enviar string
    let valueToSend;
    if (filterType === 'rubro') {
      // Enviar el ID para rubros (habilidades.id_rubro es numérico)
      valueToSend = selectedOption.id;
    } else if (filterType === 'zona') {
      // Enviar el NOMBRE para zonas (usuarios.ubicacion es VARCHAR)
      valueToSend = selectedOption.nombre;
    } else if (filterType === 'metodo') {
      // Enviar el value para métodos de pago
      valueToSend = typeof selectedOption === 'object' ? selectedOption.value : selectedOption;
    } else {
      // Enviar el valor directamente para tipos de solicitud
      valueToSend = selectedOption;
    }
    
    console.log(`🎯 FilterSelector: ${filterType} selected`, { 
      displayValue: filterType === 'rubro' || filterType === 'zona' ? selectedOption.nombre : selectedOption, 
      valueToSend,
      note: filterType === 'rubro' ? 'Enviando ID' : filterType === 'zona' ? 'Enviando NOMBRE' : ''
    });
    
    const labelToPersist = displayLabel || (
      typeof selectedOption === 'object' && selectedOption.nombre
        ? selectedOption.nombre
        : (typeof selectedOption === 'object' && selectedOption.label)
          ? selectedOption.label
          : (typeof selectedOption === 'string' ? selectedOption : '')
    );

    updateFilter(contextFilterType, valueToSend, labelToPersist);
    setActiveDropdown('');
  };

  const handleClearAllFilters = () => {
    clearAllFilters();
    setActiveDropdown('');
  };

  const handleZonaTypeChange = (newType) => {
    setZonaType(newType);
    // Limpiar el filtro de zona actual al cambiar el tipo
    if (selectedFilters.zona) {
      updateFilter('zona', '');
    }
  };

  const hasAnyFilter = Object.values(selectedFilters).some(value => value !== '');
  const currentOptions = activeDropdown ? filterOptions[activeDropdown] : [];
  const showZonaTypeSelector = module === 'all' && availableFilters.includes('zona');

  return (
    <div className={`relative w-full lg:w-auto lg:min-w-fit ${className}`} ref={dropdownRef}>
      {/* Contenedor principal - misma altura que DateRangeSelector */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg w-full lg:w-auto lg:min-w-fit">
        
        {/* Selector de tipo de zona (solo visible en module="all") */}
        {showZonaTypeSelector && (
          <div className="border-b border-gray-200 dark:border-gray-700 px-3 py-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Tipo de zona:</span>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleZonaTypeChange('solicitudes')}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    zonaType === 'solicitudes'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Solicitudes
                </button>
                <button
                  onClick={() => handleZonaTypeChange('prestadores')}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    zonaType === 'prestadores'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Prestadores
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Contenido principal responsive */}
        <div className="flex items-center px-2 sm:px-3 py-1.5 sm:py-1 min-h-[44px] sm:min-h-[36px]">
          {/* Lado izquierdo: Icono + Label + Filtros */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 flex-1 lg:flex-none lg:whitespace-nowrap overflow-hidden">
            {/* Icono y label más compactos */}
            <div className="flex items-center space-x-1 flex-shrink-0">
              <svg className="w-3 h-3 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
              </svg>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Filtros
              </span>
            </div>

            {/* Separador */}
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>

            {/* Botones de tipos de filtro responsive */}
            <div className="flex items-center space-x-0.5 sm:space-x-1 overflow-x-auto scrollbar-hide lg:overflow-visible">
              {filterTypes.map((filterType) => (
                <button
                  key={filterType.id}
                  onClick={() => handleFilterTypeSelect(filterType.id)}
                  className={`
                    px-2 sm:px-1.5 py-1 sm:py-0.5 rounded text-xs font-medium transition-all duration-200 flex items-center space-x-0.5 relative flex-shrink-0 min-h-[32px] sm:min-h-auto
                    ${activeDropdown === filterType.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  {filterType.icon}
                  <span className="hidden sm:inline">{filterType.label}</span>
                  {selectedFilters[filterType.id] && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full"></span>
                  )}
                </button>
              ))}
            </div>
            {/* Botón limpiar integrado */}
            {hasAnyFilter && (
              <button
                onClick={handleClearAllFilters}
                className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors px-2 sm:px-1 py-1 sm:py-0 whitespace-nowrap flex-shrink-0 min-h-[32px] sm:min-h-auto rounded"
              >
                Limpiar Filtros
              </button>
            )}
          </div>
        </div>

        {/* Dropdown de opciones */}
        {activeDropdown && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-48 overflow-y-auto">
            <div className="p-1">
              {currentOptions.length > 0 ? (
                currentOptions.map((option) => {
                  // Para rubros: option es {id, nombre} → comparar con ID
                  // Para zonas: option es {id, nombre} → comparar con NOMBRE
                  // Para métodos de pago: option es {label, value} → comparar con value
                  // Para tipos de solicitud: option es string → comparar con string
                  const isRubro = activeDropdown === 'rubro';
                  const isZona = activeDropdown === 'zona';
                  const isMetodo = activeDropdown === 'metodo';
                  
                  const displayText = (isRubro || isZona)
                    ? option.nombre 
                    : (isMetodo ? option.label : option);
                    
                  const optionValue = isRubro
                    ? option.id 
                    : isZona
                    ? option.nombre
                    : (isMetodo ? option.value : option);
                    
                  const isSelected = selectedFilters[activeDropdown] === optionValue;
                  
                  return (
                    <button
                      key={isRubro ? option.id : (isZona ? option.id : optionValue)}
                      onClick={() => handleValueSelect(activeDropdown, option, displayText)}
                      className={`
                        w-full text-left px-3 py-2 text-sm rounded transition-colors
                        ${isSelected
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
                        }
                      `}
                    >
                      {displayText}
                      {isSelected && (
                        <span className="float-right">✓</span>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                  {loadingOptions ? 'Cargando opciones...' : 'No hay opciones disponibles'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterSelector;
