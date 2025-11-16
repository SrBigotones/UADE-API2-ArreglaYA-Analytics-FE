/**
 * Servicio para obtener las opciones disponibles para los filtros
 */

import { getCatalogoRubros, getCatalogoZonas } from './catalogService';

// Cache para las opciones de filtros
const filterOptionsCache = {
  rubros: null,
  zonas: null,
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
      console.log('✅ Usando rubros desde cache');
      return { success: true, data: filterOptionsCache.rubros };
    }

    console.log('📡 Obteniendo rubros desde la API...');
    const result = await getCatalogoRubros(axiosInstance);
    
    if (result.success && result.data) {
      // Guardar en cache con formato { id, nombre }
      filterOptionsCache.rubros = result.data;
      filterOptionsCache.lastFetch = Date.now();
      
      console.log('✅ Rubros obtenidos:', result.data.length);
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

// Obtener zonas disponibles desde la API
export const getZonas = async (axiosInstance) => {
  try {
    if (filterOptionsCache.zonas && isCacheValid()) {
      console.log('✅ Usando zonas desde cache');
      return { success: true, data: filterOptionsCache.zonas };
    }

    console.log('📡 Obteniendo zonas desde la API...');
    const result = await getCatalogoZonas(axiosInstance);
    
    if (result.success && result.data) {
      // Guardar en cache con formato { id, nombre }
      filterOptionsCache.zonas = result.data;
      filterOptionsCache.lastFetch = Date.now();
      
      console.log('✅ Zonas obtenidas:', result.data.length);
      return { success: true, data: result.data };
    }
    
    throw new Error('No se pudieron obtener las zonas');
  } catch (error) {
    console.error('❌ Error fetching zonas:', error);
    
    // Fallback: zonas hardcodeadas si falla la API
    const fallbackZonas = [
      { id: 64, nombre: 'Agronomía' },
      { id: 65, nombre: 'Almagro' },
      { id: 67, nombre: 'Balvanera' }
    ];
    
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

// Función para obtener todas las opciones de filtros
export const getAllFilterOptions = async (axiosInstance) => {
  try {
    const [rubrosResult, zonasResult, metodosResult, tiposResult] = await Promise.all([
      getRubros(axiosInstance),
      getZonas(axiosInstance),
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
  filterOptionsCache.zonas = null;
  filterOptionsCache.metodos = null;
  filterOptionsCache.tiposSolicitud = null;
  filterOptionsCache.lastFetch = null;
};
