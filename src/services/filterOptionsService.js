/**
 * Servicio para obtener las opciones disponibles para los filtros
 */

import { getCatalogoRubros, getCatalogoZonas, getCatalogoZonasSolicitudes } from './catalogService';

// Cache para las opciones de filtros
const filterOptionsCache = {
  rubros: null,
  zonasPrestadores: null,      // Zonas de prestadores (Agronomía, Barracas...)
  zonasSolicitudes: null,       // Zonas de solicitudes (Quilmes, caba...)
  metodos: null,
  tiposSolicitud: null,
  lastFetch: null
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Función para verificar si el cache es válido
const isCacheValid = () => {
  return filterOptionsCache.lastFetch && 
         (Date.now() - filterOptionsCache.lastFetch) < CACHE_DURATION;
};

// Obtener rubros disponibles desde la API
export const getRubros = async (axiosInstance) => {
  try {
    if (filterOptionsCache.rubros && isCacheValid()) {
      return { success: true, data: filterOptionsCache.rubros };
    }

    const result = await getCatalogoRubros(axiosInstance);
    
    if (result.success && result.data) {
      // Guardar en cache con formato { id, nombre }
      filterOptionsCache.rubros = result.data;
      filterOptionsCache.lastFetch = Date.now();
      
      return { success: true, data: result.data };
    }
    
    throw new Error('No se pudieron obtener los rubros');
  } catch (error) {
    console.error('❌ Error fetching rubros:', error);
    
    // Fallback: rubros hardcodeados si falla la API
    const fallbackRubros = [
      { id: 48, nombre: 'Sistemas' },
      { id: 49, nombre: 'Plomería' },
      { id: 50, nombre: 'Electricidad' }
    ];
    
    return { success: true, data: fallbackRubros };
  }
};

/**
 * Obtener zonas disponibles según el módulo
 * @param {Object} axiosInstance - Instancia de axios
 * @param {string} module - Módulo actual ('catalog' para prestadores, otros para solicitudes)
 * @returns {Promise<{success: boolean, data: Array}>}
 */
export const getZonas = async (axiosInstance, module = 'all') => {
  try {
    // Determinar qué tipo de zonas usar según el módulo
    // Prestadores: catalog, users, all (zona de prestadores - Agronomía, Barracas...)
    // Solicitudes/Pagos: app, payments, matching (DEPRECADO - zonas de solicitudes ya no existen)
    const usePrestadorZones = module === 'catalog' || module === 'users' || module === 'all';
    const cacheKey = usePrestadorZones ? 'zonasPrestadores' : 'zonasSolicitudes';
    
    if (filterOptionsCache[cacheKey] && isCacheValid()) {
      return { success: true, data: filterOptionsCache[cacheKey] };
    }

    if (usePrestadorZones) {
      // CATÁLOGO / USUARIOS / ALL: Zonas de prestadores (tabla zonas - relación prestador-zona)
      const result = await getCatalogoZonas(axiosInstance);
      
      if (result.success && result.data) {
        filterOptionsCache.zonasPrestadores = result.data;
        filterOptionsCache.lastFetch = Date.now();
        return { success: true, data: result.data };
      }
    } else {
      // APP / PAGOS / MATCHING: Zonas de solicitudes (DEPRECADO - retorna array vacío)
      const result = await getCatalogoZonasSolicitudes(axiosInstance);
      
      if (result.success && result.data) {
        filterOptionsCache.zonasSolicitudes = result.data;
        filterOptionsCache.lastFetch = Date.now();
        return { success: true, data: result.data };
      }
    }
    
    throw new Error('No se pudieron obtener las zonas');
  } catch (error) {
    console.error('❌ Error fetching zonas:', error);
    
    // Fallback según el tipo de zona
    const usePrestadorZones = module === 'catalog' || module === 'users' || module === 'all';
    const fallbackZonas = usePrestadorZones
      ? [
          { id: 64, nombre: 'Agronomía' },
          { id: 65, nombre: 'Almagro' },
          { id: 67, nombre: 'Balvanera' }
        ]
      : []; // Zonas de solicitudes deprecadas - retornar array vacío
    
    return { success: true, data: fallbackZonas };
  }
};

// Obtener métodos de pago disponibles
export const getMetodosPago = async () => {
  try {
    if (filterOptionsCache.metodos && isCacheValid()) {
      return { success: true, data: filterOptionsCache.metodos };
    }

    // Métodos de pago disponibles con formato para mostrar y enviar
    const metodos = [
      { label: 'Tarjeta de Crédito', value: 'CREDIT_CARD' },
      { label: 'Tarjeta de Débito', value: 'DEBIT_CARD' },
      { label: 'Mercado Pago', value: 'MERCADO_PAGO' }
    ];
    
    filterOptionsCache.metodos = metodos;
    filterOptionsCache.lastFetch = Date.now();
    
    return { success: true, data: metodos };
  } catch (error) {
    console.error('Error fetching métodos de pago:', error);
    return { success: false, message: error.message };
  }
};

// Obtener tipos de solicitud disponibles
export const getTiposSolicitud = async () => {
  try {
    if (filterOptionsCache.tiposSolicitud && isCacheValid()) {
      return { success: true, data: filterOptionsCache.tiposSolicitud };
    }

    // Valores fijos según la documentación
    const tipos = ['abierta', 'dirigida'];
    
    filterOptionsCache.tiposSolicitud = tipos;
    filterOptionsCache.lastFetch = Date.now();
    
    return { success: true, data: tipos };
  } catch (error) {
    console.error('Error fetching tipos de solicitud:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Función para obtener todas las opciones de filtros
 * @param {Object} axiosInstance - Instancia de axios
 * @param {string} module - Módulo actual para determinar qué zonas cargar
 */
export const getAllFilterOptions = async (axiosInstance, module = 'all') => {
  try {
    const [rubrosResult, zonasResult, metodosResult, tiposResult] = await Promise.all([
      getRubros(axiosInstance),
      getZonas(axiosInstance, module), // Pasamos el módulo para decidir qué zonas cargar
      getMetodosPago(axiosInstance),
      getTiposSolicitud(axiosInstance)
    ]);

    const result = {
      success: true,
      data: {
        rubros: rubrosResult.success ? rubrosResult.data : [],
        zonas: zonasResult.success ? zonasResult.data : [],
        metodos: metodosResult.success ? metodosResult.data : [],
        tiposSolicitud: tiposResult.success ? tiposResult.data : []
      }
    };

    return result;
  } catch (error) {
    console.error('❌ Error fetching all filter options:', error);
    return { success: false, message: error.message };
  }
};

// Función para limpiar el cache
export const clearFilterOptionsCache = () => {
  filterOptionsCache.rubros = null;
  filterOptionsCache.zonasPrestadores = null;
  filterOptionsCache.zonasSolicitudes = null;
  filterOptionsCache.metodos = null;
  filterOptionsCache.tiposSolicitud = null;
  filterOptionsCache.lastFetch = null;
};
