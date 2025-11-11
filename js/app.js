// app.js - VERSIÓN COMPLETA Y CORREGIDA
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
    
    // Obtener componentes activos del ComponentManager
    let componentesActivos = [];
    if (typeof ComponentManager !== 'undefined') {
      ComponentManager.init();
      componentesActivos = ComponentManager.getActiveComponents();
    } else {
      // Fallback a componentes por defecto
      componentesActivos = ['saldoCaja', 'ingresosVsEgresos', 'egresosVsAnterior', 'cotizacionesMonedas'];
    }
    
    console.log('🎨 Renderizando componentes activos:', componentesActivos);
    
    if (componentesActivos.length === 0) {
      grid.innerHTML = `
        <div class="card" data-grid="full" style="text-align: center; padding: 40px;">
          <h3>No hay componentes activos</h3>
          <p>Usa el gestor de componentes para activar algunos componentes.</p>
          <button class="btn" onclick="DashboardApp.mostrarGestorComponentes()">Abrir Gestor de Componentes</button>
        </div>
      `;
      return;
    }
    
    // Renderizar componentes activos
    for (const componentId of componentesActivos) {
      const component = ComponentSystem.registros[componentId];
      if (component) {
        await this.renderizarComponenteConDelay(componentId, component, data, grid, 100);
      } else {
        console.warn(`⚠️ Componente ${componentId} no encontrado`);
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

    // Menú hamburguesa para móviles
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    if (menuToggle && sidebar && overlay) {
      menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
      });
      
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
      });
    }

    // Botón de gestión de componentes
    const btnGestion = document.getElementById('btn-gestion-componentes');
    if (btnGestion) {
      btnGestion.addEventListener('click', () => this.mostrarGestorComponentes());
    }
  },

  mostrarGestorComponentes() {
    const grid = document.querySelector('.dashboard-grid');
    if (!grid) return;
    
    // Limpiar y mostrar solo el gestor
    grid.innerHTML = '';
    
    const gestorHTML = `
      <div class="card" data-grid="full">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h2 style="margin: 0;">Gestor de Componentes</h2>
          <button id="btn-volver-dashboard" class="btn">Volver al Dashboard</button>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; margin-bottom: 20px;">
          ${this.generarListaComponentes()}
        </div>
        
        <div style="display: flex; gap: 12px; justify-content: space-between; align-items: center;">
          <div>
            <button id="btn-activar-todos" class="btn small">Activar Todos</button>
            <button id="btn-desactivar-todos" class="btn small secondary">Desactivar Todos</button>
          </div>
          <button id="btn-aplicar-cambios" class="btn">Aplicar Cambios</button>
        </div>
      </div>
    `;
    
    grid.innerHTML = gestorHTML;
    this.setupGestorEventListeners();
  },

  generarListaComponentes() {
    const componentes = {
      saldoCaja: { name: 'Saldo de Caja', category: 'liviano' },
      ingresosVsEgresos: { name: 'Ingresos vs Egresos', category: 'liviano' },
      egresosVsAnterior: { name: 'Comparación Mes Anterior', category: 'liviano' },
      cotizacionesMonedas: { name: 'Cotizaciones', category: 'liviano' },
      analisisCategorias: { name: 'Análisis por Categorías', category: 'mediano' },
      cuentasPendientes: { name: 'Cuentas Pendientes', category: 'mediano' },
      controlStock: { name: 'Control de Stock', category: 'pesado' }
    };

    let html = '';
    for (const [id, info] of Object.entries(componentes)) {
      const activo = ComponentManager.config[id] || false;
      html += `
        <div style="padding: 16px; border: 1px solid ${activo ? '#3ea6ff' : 'rgba(255,255,255,0.1)'}; border-radius: 8px; background: rgba(255,255,255,0.02);">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
            <input type="checkbox" id="chk-${id}" ${activo ? 'checked' : ''} 
                   style="margin: 0; transform: scale(1.2);">
            <label for="chk-${id}" style="flex: 1; font-weight: 600; cursor: pointer;">
              ${info.name}
            </label>
            <span style="font-size: 12px; padding: 4px 8px; border-radius: 4px; background: ${
              info.category === 'liviano' ? 'rgba(40, 167, 69, 0.2)' : 
              info.category === 'mediano' ? 'rgba(255, 193, 7, 0.2)' : 
              'rgba(220, 53, 69, 0.2)'
            }; color: ${
              info.category === 'liviano' ? '#28a745' : 
              info.category === 'mediano' ? '#ffc107' : 
              '#dc3545'
            };">
              ${info.category}
            </span>
          </div>
          <div style="font-size: 13px; color: var(--muted);">
            ID: ${id}
          </div>
        </div>
      `;
    }
    return html;
  },

  setupGestorEventListeners() {
    // Volver al dashboard
    document.getElementById('btn-volver-dashboard').addEventListener('click', () => {
      window.location.reload();
    });
    
    // Activar/desactivar todos
    document.getElementById('btn-activar-todos').addEventListener('click', () => {
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(checkbox => {
        checkbox.checked = true;
      });
    });
    
    document.getElementById('btn-desactivar-todos').addEventListener('click', () => {
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(checkbox => {
        checkbox.checked = false;
      });
    });
    
    // Aplicar cambios
    document.getElementById('btn-aplicar-cambios').addEventListener('click', () => {
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(checkbox => {
        const componentId = checkbox.id.replace('chk-', '');
        ComponentManager.config[componentId] = checkbox.checked;
      });
      
      ComponentManager.saveConfig();
      alert('Configuración guardada. Recargando dashboard...');
      window.location.reload();
    });
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
