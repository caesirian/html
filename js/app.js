// ====== CONTROLADOR PRINCIPAL ======
const DashboardApp = {
  async init() {
    this.setupEventListeners();
    this.showInitialLoading();
    await this.loadData();
  },

  setupEventListeners() {
    document.getElementById('refresh-data').addEventListener('click', () => this.loadData(true));
    document.getElementById('btn-export').addEventListener('click', this.exportData);
  },

  showInitialLoading() {
    // Mostrar skeleton de la estructura principal
    const grid = document.querySelector('.dashboard-grid');
    grid.innerHTML = this.getSkeletonHTML();
    
    // Mostrar barra de progreso
    this.showProgressBar();
    
    // Actualizar estado
    document.getElementById('estado').innerHTML = 
      '<span class="modern-spinner" style="width: 16px; height: 16px; display: inline-block; margin-right: 8px;"></span> Cargando datos financieros...';
  },

  getSkeletonHTML() {
    return `
      <section class="card skeleton-loader" data-grid="span-3" style="min-height: 110px; border: none;"></section>
      <section class="card skeleton-loader" data-grid="span-5" style="min-height: 220px; border: none;"></section>
      <section class="card skeleton-loader" data-grid="span-4" style="min-height: 220px; border: none;"></section>
      <section class="card skeleton-loader" data-grid="span-6" style="min-height: 220px; border: none;"></section>
      <section class="card skeleton-loader" data-grid="full" style="min-height: 300px; border: none;"></section>
    `;
  },

  showProgressBar() {
    // Crear barra de progreso
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.innerHTML = '<div class="progress-bar-inner"></div>';
    document.body.appendChild(progressBar);
    
    // Remover después de un tiempo
    setTimeout(() => {
      if (progressBar.parentNode) {
        progressBar.parentNode.removeChild(progressBar);
      }
    }, 3000);
  },

  async loadData(force = false) {
    try {
      // Mostrar estado de carga en botón si es recarga
      if (force) {
        const refreshBtn = document.getElementById('refresh-data');
        const originalText = refreshBtn.textContent;
        refreshBtn.classList.add('loading');
        
        // Restaurar botón después de 3 segundos máximo
        setTimeout(() => {
          refreshBtn.classList.remove('loading');
          refreshBtn.textContent = originalText;
        }, 3000);
      }
      
      document.getElementById('estado').innerHTML = 
        '<span class="modern-spinner" style="width: 16px; height: 16px; display: inline-block; margin-right: 8px;"></span> Actualizando datos...';
      
      const data = await DataManager.fetchData(force);
      await ComponentSystem.render(data);
      
      // Añadir animación de entrada a los componentes
      this.animateComponents();
      
      document.getElementById('estado').innerHTML = 
        '<span style="color: #28a745;">✓</span> Datos actualizados';
        
    } catch(error) {
      console.error('Error cargando datos:', error);
      document.getElementById('estado').innerHTML = 
        '<span style="color: #dc3545;">✗</span> Error: ' + error.message;
    }
  },

  animateComponents() {
    const components = document.querySelectorAll('.card');
    components.forEach((component, index) => {
      component.classList.add('fade-in');
      component.style.animationDelay = `${index * 0.1}s`;
    });
  },

  exportData() {
    const table = $('#tabla-pendientes').DataTable();
    if(table) {
      table.button('.buttons-csv').trigger();
    }
  }
};
