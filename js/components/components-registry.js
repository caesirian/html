// js/core/
const COMPONENTS_REGISTRY = {
  // Componentes base (siempre disponibles)
  saldoCaja: {
    name: 'Saldo de Caja',
    category: 'liviano',
    grid: 'span-6',
    defaultActive: true,
    script: 'js/components/saldo-caja.js',
    description: 'Muestra el saldo actual de caja'
  },
  ingresosVsEgresos: {
    name: 'Ingresos vs Egresos',
    category: 'liviano', 
    grid: 'span-5',
    defaultActive: true,
    script: 'js/components/ingresos-egresos.js',
    description: 'Comparación entre ingresos y egresos mensuales'
  },
  egresosVsAnterior: {
    name: 'Comparación Mes Anterior',
    category: 'liviano',
    grid: 'span-4',
    defaultActive: true,
    script: 'js/components/egresos-anterior.js',
    description: 'Comparación de egresos con el mes anterior'
  },
  cotizacionesMonedas: {
    name: 'Cotizaciones',
    category: 'liviano',
    grid: 'span-6',
    defaultActive: true,
    script: 'js/components/cotizaciones-monedas.js',
    description: 'Cotizaciones de monedas en tiempo real'
  },
  analisisCategorias: {
    name: 'Análisis por Categorías',
    category: 'mediano',
    grid: 'span-6',
    defaultActive: false,
    script: 'js/components/analisis-categorias.js',
    description: 'Análisis detallado por categorías de gastos'
  },
  cuentasPendientes: {
    name: 'Cuentas Pendientes',
    category: 'mediano',
    grid: 'span-6',
    defaultActive: false,
    script: 'js/components/cuentas-pendientes.js',
    description: 'Control de cuentas por cobrar y pagar'
  },
  controlStock: {
    name: 'Control de Stock',
    category: 'pesado',
    grid: 'span-6',
    defaultActive: false,
    script: 'js/components/control-stock.js',
    description: 'Gestión y control de inventario'
  },
  proyeccionFlujo: {
    name: 'Proyección de Flujo',
    category: 'pesado',
    grid: 'span-6',
    defaultActive: false,
    script: 'js/components/proyeccion-flujo.js',
    description: 'Proyección futura del flujo de caja'
  },
  calculadoraInversiones: {
    name: 'Calculadora de Inversiones',
    category: 'mediano',
    grid: 'span-6',
    defaultActive: false,
    script: 'js/components/calculadora-inversiones.js',
    description: 'Simulador de diferentes tipos de inversiones'
  }
};

// Funciones utilitarias para el registro
const ComponentsRegistry = {
  // Obtener todos los componentes
  getAll() {
    return COMPONENTS_REGISTRY;
  },

  // Obtener componentes por categoría
  getByCategory(category) {
    return Object.entries(COMPONENTS_REGISTRY)
      .filter(([id, config]) => config.category === category)
      .reduce((acc, [id, config]) => {
        acc[id] = config;
        return acc;
      }, {});
  },

  // Obtener componentes activos por defecto
  getDefaultActive() {
    return Object.entries(COMPONENTS_REGISTRY)
      .filter(([id, config]) => config.defaultActive)
      .reduce((acc, [id, config]) => {
        acc[id] = config;
        return acc;
      }, {});
  },

  // Obtener configuración de un componente específico
  getComponent(id) {
    return COMPONENTS_REGISTRY[id];
  },

  // Obtener scripts que necesitan ser cargados
  getScriptsToLoad(componentIds) {
    return componentIds.map(id => COMPONENTS_REGISTRY[id]?.script).filter(Boolean);
  },

  // Verificar si un componente existe
  exists(componentId) {
    return componentId in COMPONENTS_REGISTRY;
  }
};
