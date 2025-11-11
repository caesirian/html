// js/core/component-manager.js
const ComponentManager = {
  config: {},
  
  init() {
    this.loadConfig();
    console.log('📋 Component Manager iniciado:', this.config);
  },
  
  loadConfig() {
    const saved = localStorage.getItem('dashboard_components_config');
    this.config = saved ? JSON.parse(saved) : {...CONFIG.COMPONENTES_POR_DEFECTO};
  },
  
  saveConfig() {
    localStorage.setItem('dashboard_components_config', JSON.stringify(this.config));
  },
  
  getActiveComponents() {
    return Object.keys(this.config).filter(componentId => this.config[componentId]);
  },
  
  isComponentActive(componentId) {
    return this.config[componentId] === true;
  },
  
  setComponentActive(componentId, active) {
    this.config[componentId] = active;
    this.saveConfig();
  },
  
  // Para el gestor de componentes
  getComponentInfo(componentId) {
    const info = {
      saldoCaja: { name: 'Saldo de Caja', category: 'liviano', grid: 'span-3' },
      ingresosVsEgresos: { name: 'Ingresos vs Egresos', category: 'liviano', grid: 'span-5' },
      egresosVsAnterior: { name: 'Comparación Mes Anterior', category: 'liviano', grid: 'span-4' },
      cotizacionesMonedas: { name: 'Cotizaciones', category: 'liviano', grid: 'span-6' },
      analisisCategorias: { name: 'Análisis por Categorías', category: 'mediano', grid: 'span-6' },
      cuentasPendientes: { name: 'Cuentas Pendientes', category: 'mediano', grid: 'span-6' },
      controlStock: { name: 'Control de Stock', category: 'pesado', grid: 'span-6' }
    };
    return info[componentId] || { name: componentId, category: 'liviano', grid: 'span-6' };
  }
};
