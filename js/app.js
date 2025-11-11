const DashboardApp = {
  async init() {
    console.log('🚀 Iniciando dashboard...');
    await this.loadData();
  },

  async loadData(force = false) {
    try {
      console.log('📡 Cargando datos...');
      const data = await DataManager.fetchData(force);
      console.log('✅ Datos cargados:', data);
      await ComponentSystem.render(data);
    } catch(error) {
      console.error('❌ Error cargando datos:', error);
    }
  }
};

// INICIALIZACIÓN - esto es clave
document.addEventListener('DOMContentLoaded', function() {
  console.log('📄 DOM cargado, iniciando app...');
  DashboardApp.init();
});
