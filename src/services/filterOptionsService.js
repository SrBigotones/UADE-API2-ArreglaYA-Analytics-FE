/**
 * Servicio para obtener las opciones disponibles para los filtros
 */

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

// Obtener rubros disponibles
export const getRubros = async (axiosInstance) => {
  try {
    if (filterOptionsCache.rubros && isCacheValid()) {
      return { success: true, data: filterOptionsCache.rubros };
    }

    // Rubros reales del sistema
    const rubros = [
      'Sistemas',
      'Diseño y Comunicación',
      'Marketing',
      'Consultoría',
      'Educación',
      'Legal',
      'Arquitectura',
      'Jardinería',
      'Plomería',
      'Carpintería',
      'Limpieza',
      'Catering',
      'Mecánica'
    ];
    
    filterOptionsCache.rubros = rubros;
    filterOptionsCache.lastFetch = Date.now();
    
    return { success: true, data: rubros };
  } catch (error) {
    console.error('Error fetching rubros:', error);
    return { success: false, message: error.message };
  }
};

// Obtener zonas disponibles
export const getZonas = async (axiosInstance) => {
  try {
    if (filterOptionsCache.zonas && isCacheValid()) {
      return { success: true, data: filterOptionsCache.zonas };
    }

    // Barrios/zonas reales del sistema
    const zonas = [
      'Agronomía',
      'Almagro',
      'Balvanera',
      'Barracas',
      'Belgrano',
      'Boedo',
      'Caballito',
      'Chacarita',
      'Coghlan',
      'Colegiales',
      'Constitución',
      'Flores',
      'Floresta',
      'La Boca',
      'La Paternal',
      'Liniers',
      'Mataderos',
      'Monte Castro',
      'Montserrat',
      'Nueva Pompeya',
      'Núñez',
      'Palermo',
      'Parque Avellaneda',
      'Parque Chacabuco',
      'Parque Patricios',
      'Puerto Madero',
      'Recoleta',
      'Retiro',
      'Saavedra',
      'San Cristóbal',
      'San Nicolás',
      'San Telmo',
      'Versalles',
      'Villa Crespo',
      'Villa Devoto',
      'Villa General Mitre',
      'Villa Lugano',
      'Villa Luro',
      'Villa Ortúzar',
      'Villa Pueyrredón',
      'Villa Real',
      'Villa Riachuelo',
      'Villa Santa Rita',
      'Villa Soldati',
      'Villa Urquiza',
      'Villa del Parque',
      'Vélez Sarsfield'
    ];
    
    filterOptionsCache.zonas = zonas;
    filterOptionsCache.lastFetch = Date.now();
    
    return { success: true, data: zonas };
  } catch (error) {
    console.error('Error fetching zonas:', error);
    return { success: false, message: error.message };
  }
};

// Obtener métodos de pago disponibles
export const getMetodosPago = async (axiosInstance) => {
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
export const getTiposSolicitud = async (axiosInstance) => {
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
