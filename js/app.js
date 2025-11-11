// app.js - versión corregida
const DashboardApp = {
  async init() {
    console.log('🚀 Iniciando dashboard...');
    
    // Inicializar ComponentManager primero
    if (typeof ComponentManager !== 'undefined') {
      ComponentManager.init();
    }
    
    this.mostrarLoading();
    this.setupEventListeners();
    await this.loadData();
  },

  mostrarLoading() {
    const grid = document.querySelector('.dashboard-grid');
    if (grid) {
      grid.innerHTML = this.getSkeletonHTML();
    }
    this.mostrarBarraProgreso();
  },

  getSkeletonHTML() {
    return `
      <section class="card skeleton-loader" data-grid="span-3" style="min-height: 110px;"></section>
      <section class="card skeleton-loader" data-grid="span-5" style="min-height: 220px;"></section>
      <section class="card skeleton-loader" data-grid="span-4" style="min-height: 220px;"></section>
      <section class="card skeleton-loader" data-grid="span-6" style="min-height: 220px;"></section>
    `;
  },

  async loadData(force = false) {
    try {
      console.log('📡 Cargando datos...');
      const estadoElement = document.getElementById('estado');
      if (estadoElement) estadoElement.innerHTML = '<span class="loader"></span> Cargando datos...';
      
      const data = await DataManager.fetchData(force);
      console.log('✅ Datos recibidos, renderizando...');
      
      if (estadoElement) estadoElement.innerHTML = '<span style="color: #28a745;">✓</span> Datos actualizados';
      
      await this.renderizarComponentesActivos(data);
      this.ocultarBarraProgreso();
      
    } catch(error) {
      console.error('❌ Error cargando datos:', error);
      const estadoElement = document.getElementById('estado');
      if (estadoElement) estadoElement.innerHTML = '<span style="color: #dc3545;">✗</span> Error: ' + error.message;
      this.ocultarBarraProgreso();
    }
  },

  async renderizarComponentesActivos(data) {
    const grid = document.querySelector('.dashboard-grid');
    if (!grid) return;
    
    // Limpiar skeletons
    grid.innerHTML = '';
    
    // Obtener componentes activos
    const componentesActivos = ComponentManager ? ComponentManager.getActiveComponents() : 
      ['saldoCaja', 'ingresosVsEgresos', 'egresosVsAnterior', 'cotizacionesMonedas'];
    
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
    
    // Renderizar componentes en orden
    for (const componentId of componentesActivos) {
      const component = ComponentSystem.registros[componentId];
      if (component) {
        await this.renderizarComponente(componentId, component, data, grid);
        // Pequeña pausa entre componentes para mejor UX
        await new Promise(resolve => setTimeout(resolve, 100));
      } else {
        console.warn(`⚠️ Componente ${componentId} no encontrado en registros`);
      }
    }
  },

  async renderizarComponente(id, component, data, grid) {
    try {
      const element = document.createElement('section');
      element.id = `componente-${id}`;
      element.className = 'card fade-in';
      
      // Obtener grid del componente
      const componentInfo = ComponentManager ? ComponentManager.getComponentInfo(id) : { grid: 'span-6' };
      element.setAttribute('data-grid', component.grid || componentInfo.grid);
      
      if (component.html) {
        element.innerHTML = component.html;
      }

      grid.appendChild(element);

      if (component.render) {
        await component.render(data, element);
      }
      
      console.log(`✅ Componente ${id} renderizado`);
      
    } catch (error) {
      console.error(`❌ Error en componente ${id}:`, error);
      // Mostrar error en el componente
      const errorElement = document.querySelector(`#componente-${id}`);
      if (errorElement) {
        errorElement.innerHTML = `
          <div style="color: #dc3545; padding: 20px; text-align: center;">
            <h3>Error en ${id}</h3>
            <p>${error.message}</p>
          </div>
        `;
      }
    }
  },

  ocultarBarraProgreso() {
    const progressBar = document.querySelector('.progress-bar-global');
    if (progressBar) {
      progressBar.style.opacity = '0';
      setTimeout(() => {
        if (progressBar.parentNode) {
          progressBar.parentNode.removeChild(progressBar);
        }
      }, 300);
    }
  },

  setupEventListeners() {
    // Botón de refresh
    const refreshBtn = document.getElementById('refresh-data');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.loadData(true));
    }
    
    // Botón de gestión de componentes
    const btnGestion = document.getElementById('btn-gestion-componentes');
    if (btnGestion) {
      btnGestion.addEventListener('click', () => this.mostrarGestorComponentes());
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
  },

  async mostrarGestorComponentes() {
    const grid = document.querySelector('.dashboard-grid');
    if (!grid) return;
    
    // Limpiar y mostrar solo el gestor
    grid.innerHTML = '';
    
    // Crear componente gestor simple (sin necesidad de registro complejo)
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
    if (!ComponentManager) return '<div>Error: ComponentManager no disponible</div>';
    
    return CONFIG.COMPONENTES_DISPONIBLES.map(componentId => {
      const info = ComponentManager.getComponentInfo(componentId);
      const activo = ComponentManager.isComponentActive(componentId);
      
      return `
        <div style="padding: 16px; border: 1px solid ${activo ? '#3ea6ff' : 'rgba(255,255,255,0.1)'}; border-radius: 8px; background: rgba(255,255,255,0.02);">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
            <input type="checkbox" id="chk-${componentId}" ${activo ? 'checked' : ''} 
                   style="margin: 0; transform: scale(1.2);">
            <label for="chk-${componentId}" style="flex: 1; font-weight: 600; cursor: pointer;">
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
            Tamaño: ${info.grid} | ID: ${componentId}
          </div>
        </div>
      `;
    }).join('');
  },

  setupGestorEventListeners() {
    // Volver al dashboard
    document.getElementById('btn-volver-dashboard').addEventListener('click', () => {
      window.location.reload();
    });
    
    // Activar/desactivar todos
    document.getElementById('btn-activar-todos').addEventListener('click', () => {
      CONFIG.COMPONENTES_DISPONIBLES.forEach(id => {
        document.getElementById(`chk-${id}`).checked = true;
      });
    });
    
    document.getElementById('btn-desactivar-todos').addEventListener('click', () => {
      CONFIG.COMPONENTES_DISPONIBLES.forEach(id => {
        document.getElementById(`chk-${id}`).checked = false;
      });
    });
    
    // Aplicar cambios
    document.getElementById('btn-aplicar-cambios').addEventListener('click', () => {
      CONFIG.COMPONENTES_DISPONIBLES.forEach(id => {
        const activo = document.getElementById(`chk-${id}`).checked;
        ComponentManager.setComponentActive(id, activo);
      });
      
      // Mostrar mensaje y recargar
      alert('Configuración guardada. Recargando dashboard...');
      window.location.reload();
    });
  }
};

// Inicialización
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    DashboardApp.init();
  });
} else {
  DashboardApp.init();
}
