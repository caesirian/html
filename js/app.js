const DashboardApp = {
  async init() {
    console.log('🚀 Iniciando dashboard...');
    this.mostrarLoading();
    this.setupEventListeners();
    await this.loadData();
  },

  mostrarLoading() {
    // Mostrar skeleton loading inmediatamente
    const grid = document.querySelector('.dashboard-grid');
    if (grid) {
      grid.innerHTML = this.getSkeletonHTML();
    }
    
    // Mostrar barra de progreso
    this.mostrarBarraProgreso();
  },

  getSkeletonHTML() {
    return `
      <!-- Skeleton para métricas rápidas -->
      <section class="card skeleton-loader" data-grid="span-3" style="min-height: 110px;"></section>
      <section class="card skeleton-loader" data-grid="span-5" style="min-height: 220px;"></section>
      <section class="card skeleton-loader" data-grid="span-4" style="min-height: 220px;"></section>
      <section class="card skeleton-loader" data-grid="span-6" style="min-height: 220px;"></section>
      
      <!-- Skeleton para componentes más grandes -->
      <section class="card skeleton-loader" data-grid="span-6" style="min-height: 280px;"></section>
      <section class="card skeleton-loader" data-grid="span-6" style="min-height: 280px;"></section>
      <section class="card skeleton-loader" data-grid="full" style="min-height: 350px;"></section>
    `;
  },

  mostrarBarraProgreso() {
    // Crear barra de progreso en la parte superior
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar-global';
    progressBar.innerHTML = '<div class="progress-bar-inner-global"></div>';
    document.body.appendChild(progressBar);
    
    // Remover después de 5 segundos (timeout de seguridad)
    setTimeout(() => {
      if (progressBar.parentNode) {
        progressBar.parentNode.removeChild(progressBar);
      }
    }, 5000);
  },

  async loadData(force = false) {
    try {
      console.log('📡 Cargando datos...');
      const estadoElement = document.getElementById('estado');
      if (estadoElement) estadoElement.innerHTML = '<span class="loader"></span> Cargando datos...';
      
      // Cargar datos críticos primero
      const data = await DataManager.fetchData(force);
      console.log('✅ Datos recibidos, renderizando...');
      
      if (estadoElement) estadoElement.innerHTML = '<span style="color: #28a745;">✓</span> Datos actualizados';
      
      // Renderizar componentes progresivamente
      await this.renderizarProgresivamente(data);
      
      // Ocultar barra de progreso
      this.ocultarBarraProgreso();
      
    } catch(error) {
      console.error('❌ Error cargando datos:', error);
      const estadoElement = document.getElementById('estado');
      if (estadoElement) estadoElement.innerHTML = '<span style="color: #dc3545;">✗</span> Error: ' + error.message;
      this.ocultarBarraProgreso();
    }
  },

  async renderizarProgresivamente(data) {
    const grid = document.querySelector('.dashboard-grid');
    if (!grid) return;
    
    // Limpiar skeletons
    grid.innerHTML = '';
    
    // Componentes en orden de prioridad
    const componentesPrioritarios = [
      'saldoCaja', 
      'ingresosVsEgresos', 
      'egresosVsAnterior',
      'cotizacionesMonedas'
    ];
    
    const componentesSecundarios = [
      'analisisCategorias',
      'controlStock',
      'cuentasPendientes'
    ];
    
    // Renderizar componentes prioritarios primero
    for (const componentId of componentesPrioritarios) {
      const component = ComponentSystem.registros[componentId];
      if (component) {
        await this.renderizarComponenteConDelay(componentId, component, data, grid, 100);
      }
    }
    
    // Pequeña pausa para que el usuario vea que está cargando
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Renderizar componentes secundarios
    for (const componentId of componentesSecundarios) {
      const component = ComponentSystem.registros[componentId];
      if (component) {
        await this.renderizarComponenteConDelay(componentId, component, data, grid, 150);
      }
    }
  },

  async renderizarComponenteConDelay(id, component, data, grid, delay) {
    await new Promise(resolve => setTimeout(resolve, delay));
    await ComponentSystem.renderComponent(id, component, data, grid);
  },

  ocultarBarraProgreso() {
    const progressBar = document.querySelector('.progress-bar-global');
    if (progressBar && progressBar.parentNode) {
      progressBar.parentNode.removeChild(progressBar);
    }
  },

  setupEventListeners() {
    const refreshBtn = document.getElementById('refresh-data');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.loadData(true));
    }
  }
};

// Inicialización optimizada
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM cargado, iniciando app...');
    DashboardApp.init();
  });
} else {
  console.log('⚡ DOM ya listo, iniciando app inmediatamente...');
  DashboardApp.init();
}
