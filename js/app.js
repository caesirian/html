// app.js - VERSIÓN COMPLETAMENTE CORREGIDA
const DashboardApp = {
  loadingStartTime: null,
  loadingInterval: null,

  async init() {
    console.log('🚀 Iniciando dashboard...');
    this.loadingStartTime = Date.now();
    this.mostrarPantallaCarga();
    this.setupEventListeners();
    await this.loadData();
  },

  mostrarPantallaCarga() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.add('active');
    }
    
    // Iniciar contador de tiempo
    this.actualizarTiempoCarga();
    this.loadingInterval = setInterval(() => {
      this.actualizarTiempoCarga();
    }, 1000);
  },

  actualizarTiempoCarga() {
    const timeElement = document.getElementById('loading-time');
    if (timeElement && this.loadingStartTime) {
      const seconds = Math.floor((Date.now() - this.loadingStartTime) / 1000);
      timeElement.textContent = `${seconds}s`;
    }
  },

  ocultarPantallaCarga() {
    console.log('🔄 Ocultando pantalla de carga...');
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.opacity = '0';
      setTimeout(() => {
        loadingScreen.classList.remove('active');
        if (this.loadingInterval) {
          clearInterval(this.loadingInterval);
        }
      }, 500);
    }
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

  mostrarBarraProgreso() {
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar-global';
    progressBar.innerHTML = '<div class="progress-bar-inner-global"></div>';
    document.body.appendChild(progressBar);
    
    setTimeout(() => {
      if (progressBar.parentNode) {
        progressBar.parentNode.removeChild(progressBar);
      }
    }, 5000);
  },

  async loadData(force = false) {
    try {
      this.actualizarPaso("Conectando con Google Sheets...");
      
      console.log('📡 Cargando datos...');
      const estadoElement = document.getElementById('estado');
      if (estadoElement) estadoElement.innerHTML = '<span class="loader"></span> Cargando datos...';
      
      // Mostrar skeletons mientras se cargan los datos
      this.mostrarLoading();
      
      const data = await DataManager.fetchData(force);
      console.log('✅ Datos recibidos:', data);
      
      if (estadoElement) estadoElement.innerHTML = '<span style="color: #28a745;">✓</span> Datos actualizados';
      
      // Renderizar componentes
      await this.renderizarComponentes(data);
      
      // Ocultar pantalla de carga
      this.ocultarPantallaCarga();
      this.ocultarBarraProgreso();
      
    } catch(error) {
      console.error('❌ Error cargando datos:', error);
      const estadoElement = document.getElementById('estado');
      if (estadoElement) estadoElement.innerHTML = '<span style="color: #dc3545;">✗</span> Error: ' + error.message;
      
      this.mostrarErrorEnCarga(error);
    }
  },

  actualizarPaso(mensaje) {
    const stepElement = document.getElementById('loading-step');
    if (stepElement) {
      stepElement.textContent = mensaje;
    }
  },

  mostrarErrorEnCarga(error) {
    const loadingContent = document.querySelector('.loading-content');
    if (loadingContent) {
      loadingContent.innerHTML = `
        <div style="text-align: center; color: #dc3545;">
          <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
          <h2 style="color: #dc3545; margin-bottom: 15px;">Error al cargar los datos</h2>
          <p style="color: var(--muted); margin-bottom: 25px;">${error.message}</p>
          <button class="btn" onclick="window.location.reload()" style="background: #dc3545;">
            Reintentar
          </button>
        </div>
      `;
    }
  },

  async renderizarComponentes(data) {
    const grid = document.querySelector('.dashboard-grid');
    if (!grid) {
      console.error('❌ No se encontró el grid principal');
      return;
    }
    
    // Limpiar skeletons
    grid.innerHTML = '';
    
    // Obtener componentes activos
    let componentesActivos = [];
    try {
      if (typeof ComponentManager !== 'undefined') {
        ComponentManager.init();
        componentesActivos = ComponentManager.getActiveComponents();
      } else {
        componentesActivos = ['saldoCaja', 'ingresosVsEgresos', 'egresosVsAnterior', 'cotizacionesMonedas'];
      }
    } catch (error) {
      console.warn('⚠️ Error al cargar ComponentManager, usando componentes por defecto');
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
    
    // Renderizar componentes en orden de prioridad
    for (let i = 0; i < componentesActivos.length; i++) {
      const componentId = componentesActivos[i];
      await this.renderizarComponente(componentId, data, grid);
    }
  },

  async renderizarComponente(componentId, data, grid) {
    try {
      console.log(`🔄 Renderizando componente: ${componentId}`);
      
      const component = ComponentSystem.registros[componentId];
      if (!component) {
        console.warn(`⚠️ Componente ${componentId} no encontrado en registros`);
        return;
      }

      const element = document.createElement('section');
      element.id = `componente-${componentId}`;
      element.className = 'card fade-in';
      element.setAttribute('data-grid', component.grid || 'span-6');
      
      if (component.html) {
        element.innerHTML = component.html;
      }

      grid.appendChild(element);

      if (component.render) {
        await component.render(data, element);
        console.log(`✅ Componente ${componentId} renderizado correctamente`);
      }
      
    } catch (error) {
      console.error(`❌ Error renderizando componente ${componentId}:`, error);
      const errorElement = document.querySelector(`#componente-${componentId}`);
      if (errorElement) {
        errorElement.innerHTML = `
          <div style="color: #dc3545; padding: 20px; text-align: center;">
            <h3>Error en ${componentId}</h3>
            <p>${error.message}</p>
          </div>
        `;
      }
    }
  },

  ocultarBarraProgreso() {
    const progressBar = document.querySelector('.progress-bar-global');
    if (progressBar && progressBar.parentNode) {
      progressBar.parentNode.removeChild(progressBar);
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

  mostrarGestorComponentes() {
    const grid = document.querySelector('.dashboard-grid');
    if (!grid) return;
    
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
    // Si ComponentManager no está disponible, usar configuración por defecto
    let config = {};
    try {
      if (typeof ComponentManager !== 'undefined') {
        config = ComponentManager.config;
      } else {
        config = {
          saldoCaja: true,
          ingresosVsEgresos: true,
          egresosVsAnterior: true,
          cotizacionesMonedas: true,
          analisisCategorias: false,
          cuentasPendientes: false,
          controlStock: false,
      proyeccionFlujo: false
        };
      }
    } catch (error) {
      config = {
        saldoCaja: true,
        ingresosVsEgresos: true,
        egresosVsAnterior: true,
        cotizacionesMonedas: true,
        analisisCategorias: false,
        cuentasPendientes: false,
        controlStock: false,
      proyeccionFlujo: false
      };
    }

    const componentes = {
      saldoCaja: { name: 'Saldo de Caja', category: 'liviano' },
      ingresosVsEgresos: { name: 'Ingresos vs Egresos', category: 'liviano' },
      egresosVsAnterior: { name: 'Comparación Mes Anterior', category: 'liviano' },
      cotizacionesMonedas: { name: 'Cotizaciones', category: 'liviano' },
      analisisCategorias: { name: 'Análisis por Categorías', category: 'mediano' },
      cuentasPendientes: { name: 'Cuentas Pendientes', category: 'mediano' },
      controlStock: { name: 'Control de Stock', category: 'pesado' },
  proyeccionFlujo: { name: 'Proyección de Flujo', category: 'pesado' } 
    };

    let html = '';
    for (const [id, info] of Object.entries(componentes)) {
      const activo = config[id] || false;
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
    const btnVolver = document.getElementById('btn-volver-dashboard');
    if (btnVolver) {
      btnVolver.addEventListener('click', () => {
        window.location.reload();
      });
    }
    
    // Activar/desactivar todos
    const btnActivarTodos = document.getElementById('btn-activar-todos');
    if (btnActivarTodos) {
      btnActivarTodos.addEventListener('click', () => {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
          checkbox.checked = true;
        });
      });
    }
    
    const btnDesactivarTodos = document.getElementById('btn-desactivar-todos');
    if (btnDesactivarTodos) {
      btnDesactivarTodos.addEventListener('click', () => {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
          checkbox.checked = false;
        });
      });
    }
    
    // Aplicar cambios
    const btnAplicar = document.getElementById('btn-aplicar-cambios');
    if (btnAplicar) {
      btnAplicar.addEventListener('click', () => {
        try {
          const checkboxes = document.querySelectorAll('input[type="checkbox"]');
          checkboxes.forEach(checkbox => {
            const componentId = checkbox.id.replace('chk-', '');
            if (typeof ComponentManager !== 'undefined') {
              ComponentManager.config[componentId] = checkbox.checked;
            }
          });
          
          if (typeof ComponentManager !== 'undefined') {
            ComponentManager.saveConfig();
          }
          
          alert('Configuración guardada. Recargando dashboard...');
          window.location.reload();
        } catch (error) {
          console.error('Error guardando configuración:', error);
          alert('Error al guardar la configuración');
        }
      });
    }
  }
};

// Inicialización
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM cargado, iniciando app...');
    DashboardApp.init();
  });
} else {
  console.log('⚡ DOM ya listo, iniciando app inmediatamente...');
  DashboardApp.init();
}
