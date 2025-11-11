// js/core/component-manager.js
const ComponentManager = {
  config: {},
  
  init() {
    this.loadConfig();
  },
  
  loadConfig() {
    const saved = localStorage.getItem('dashboard_components_config');
    if (saved) {
      this.config = JSON.parse(saved);
    } else {
      // Por defecto, solo componentes livianos
      this.config = {
        saldoCaja: true,
        ingresosVsEgresos: true,
        egresosVsAnterior: true,
        cotizacionesMonedas: true,
        analisisCategorias: false,
        cuentasPendientes: false,
        controlStock: false
      };
      this.saveConfig();
    }
    console.log('📋 Configuración de componentes cargada:', this.config);
  },
  
  saveConfig() {
    localStorage.setItem('dashboard_components_config', JSON.stringify(this.config));
  },
  
  getActiveComponents() {
    return Object.keys(this.config).filter(id => this.config[id]);
  }
};
