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
    var loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.add('active');
    }
    
    this.actualizarTiempoCarga();
    var self = this;
    this.loadingInterval = setInterval(function() {
      self.actualizarTiempoCarga();
    }, 1000);
  },

  actualizarTiempoCarga() {
    var timeElement = document.getElementById('loading-time');
    if (timeElement && this.loadingStartTime) {
      var seconds = Math.floor((Date.now() - this.loadingStartTime) / 1000);
      timeElement.textContent = seconds + 's';
    }
  },

  ocultarPantallaCarga() {
    console.log('🔄 Ocultando pantalla de carga...');
    var loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.opacity = '0';
      var self = this;
      setTimeout(function() {
        loadingScreen.classList.remove('active');
        if (self.loadingInterval) {
          clearInterval(self.loadingInterval);
        }
      }, 500);
    }
  },

  mostrarLoading() {
    var grid = document.querySelector('.dashboard-grid');
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
    var progressBar = document.createElement('div');
    progressBar.className = 'progress-bar-global';
    progressBar.innerHTML = '<div class="progress-bar-inner-global"></div>';
    document.body.appendChild(progressBar);
    
    var self = this;
    setTimeout(function() {
      if (progressBar.parentNode) {
        progressBar.parentNode.removeChild(progressBar);
      }
    }, 5000);
  },

  async loadData(force) {
    try {
      this.actualizarPaso("Conectando con Google Sheets...");
      
      console.log('📡 Cargando datos...');
      var estadoElement = document.getElementById('estado');
      if (estadoElement) estadoElement.innerHTML = '<span class="loader"></span> Cargando datos...';
      
      this.mostrarLoading();
      
      var data = await DataManager.fetchData(force);
      console.log('✅ Datos recibidos:', data);
      
      if (estadoElement) estadoElement.innerHTML = '<span style="color: #28a745;">✓</span> Datos actualizados';
      
      await this.renderizarComponentes(data);
      
      this.ocultarPantallaCarga();
      this.ocultarBarraProgreso();
      
    } catch(error) {
      console.error('❌ Error cargando datos:', error);
      var estadoElement = document.getElementById('estado');
      if (estadoElement) estadoElement.innerHTML = '<span style="color: #dc3545;">✗</span> Error: ' + error.message;
      
      this.mostrarErrorEnCarga(error);
    }
  },

  actualizarPaso(mensaje) {
    var stepElement = document.getElementById('loading-step');
    if (stepElement) {
      stepElement.textContent = mensaje;
    }
  },

  mostrarErrorEnCarga(error) {
    var loadingContent = document.querySelector('.loading-content');
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
    var grid = document.querySelector('.dashboard-grid');
    if (!grid) {
      console.error('❌ No se encontró el grid principal');
      return;
    }
    
    grid.innerHTML = '';
    
    var componentesActivos = [];
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
    
    this.actualizarPaso('Cargando ' + componentesActivos.length + ' componentes...');
    
    for (var i = 0; i < componentesActivos.length; i++) {
      var componentId = componentesActivos[i];
      this.actualizarPaso('Cargando ' + this.obtenerNombreComponente(componentId) + '...');
      
      await this.renderizarComponente(componentId, data, grid);
    }
  },

  obtenerNombreComponente(id) {
    var nombres = {
      saldoCaja: 'Saldo de Caja',
      ingresosVsEgresos: 'Ingresos vs Egresos',
      egresosVsAnterior: 'Comparación Mensual',
      cotizacionesMonedas: 'Cotizaciones',
      analisisCategorias: 'Análisis por Categorías',
      cuentasPendientes: 'Cuentas Pendientes',
      controlStock: 'Control de Stock',
      proyeccionFlujo: 'Proyección de Flujo',
      calculadoraInversiones: 'Calculadora de Inversiones'
    };
    return nombres[id] || id;
  },

  async renderizarComponente(componentId, data, grid) {
  try {
    console.log('🔄 Renderizando componente: ' + componentId);
    
    var component = ComponentSystem.registros[componentId];
    if (!component) {
      console.warn('⚠️ Componente ' + componentId + ' no encontrado en registros');
      return;
    }

    var element = document.createElement('section');
    element.id = 'componente-' + componentId;
    element.className = 'card fade-in';
    
    // OBTENER GRID CON MEJOR FALLBACK
    var gridSize = 'span-6'; // Valor por defecto
    
    if (component.grid) {
      gridSize = component.grid;
    } else {
      // Intentar obtener de ComponentManager
      if (typeof ComponentManager !== 'undefined' && typeof ComponentManager.getComponentInfo === 'function') {
        var componentInfo = ComponentManager.getComponentInfo(componentId);
        gridSize = componentInfo.grid || 'span-6';
      }
    }
    
    element.setAttribute('data-grid', gridSize);
    
    if (component.html) {
      element.innerHTML = component.html;
    }

    grid.appendChild(element);

    if (component.render) {
      await component.render(data, element);
      console.log('✅ Componente ' + componentId + ' renderizado correctamente');
    }
    
  } catch (error) {
    console.error('❌ Error renderizando componente ' + componentId + ':', error);
    var errorElement = document.querySelector('#componente-' + componentId);
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
    var progressBar = document.querySelector('.progress-bar-global');
    if (progressBar && progressBar.parentNode) {
      progressBar.parentNode.removeChild(progressBar);
    }
  },

  setupEventListeners() {
    var refreshBtn = document.getElementById('refresh-data');
    if (refreshBtn) {
      var self = this;
      refreshBtn.addEventListener('click', function() {
        self.loadData(true);
      });
    }

    var btnGestion = document.getElementById('btn-gestion-componentes');
    if (btnGestion) {
      var self = this;
      btnGestion.addEventListener('click', function() {
        self.mostrarGestorComponentes();
      });
    }

    var menuToggle = document.getElementById('menu-toggle');
    var sidebar = document.querySelector('.sidebar');
    var overlay = document.getElementById('sidebar-overlay');
    
    if (menuToggle && sidebar && overlay) {
      menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
      });
      
      overlay.addEventListener('click', function() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
      });
    }
  },

  mostrarGestorComponentes() {
    var grid = document.querySelector('.dashboard-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    var gestorHTML = `
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
    var config = {};
    try {
      if (typeof ComponentManager !== 'undefined') {
        config = ComponentManager.config;
      } else {
        var defaultComponents = {
          saldoCaja: true,
          ingresosVsEgresos: true,
          egresosVsAnterior: true,
          cotizacionesMonedas: true,
          analisisCategorias: false,
          cuentasPendientes: false,
          controlStock: false,
          proyeccionFlujo: false,
          calculadoraInversiones: false
        };
        config = defaultComponents;
      }
    } catch (error) {
      var defaultComponents = {
        saldoCaja: true,
        ingresosVsEgresos: true,
        egresosVsAnterior: true,
        cotizacionesMonedas: true,
        analisisCategorias: false,
        cuentasPendientes: false,
        controlStock: false,
        proyeccionFlujo: false,
        calculadoraInversiones: false
      };
      config = defaultComponents;
    }

    var componentes = {
      saldoCaja: { name: 'Saldo de Caja', category: 'liviano' },
      ingresosVsEgresos: { name: 'Ingresos vs Egresos', category: 'liviano' },
      egresosVsAnterior: { name: 'Comparación Mes Anterior', category: 'liviano' },
      cotizacionesMonedas: { name: 'Cotizaciones', category: 'liviano' },
      analisisCategorias: { name: 'Análisis por Categorías', category: 'mediano' },
      cuentasPendientes: { name: 'Cuentas Pendientes', category: 'mediano' },
      controlStock: { name: 'Control de Stock', category: 'pesado' },
      proyeccionFlujo: { name: 'Proyección de Flujo', category: 'pesado' },
      calculadoraInversiones: { name: 'Calculadora de Inversiones', category: 'mediano' }
    };

    var html = '';
    for (var id in componentes) {
      if (componentes.hasOwnProperty(id)) {
        var info = componentes[id];
        var activo = config[id] || false;
        var colorFondo = '';
        var colorTexto = '';
        
        if (info.category === 'liviano') {
          colorFondo = 'rgba(40, 167, 69, 0.2)';
          colorTexto = '#28a745';
        } else if (info.category === 'mediano') {
          colorFondo = 'rgba(255, 193, 7, 0.2)';
          colorTexto = '#ffc107';
        } else {
          colorFondo = 'rgba(220, 53, 69, 0.2)';
          colorTexto = '#dc3545';
        }
        
        html += `
          <div style="padding: 16px; border: 1px solid ${activo ? '#3ea6ff' : 'rgba(255,255,255,0.1)'}; border-radius: 8px; background: rgba(255,255,255,0.02);">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
              <input type="checkbox" id="chk-${id}" ${activo ? 'checked' : ''} 
                     style="margin: 0; transform: scale(1.2);">
              <label for="chk-${id}" style="flex: 1; font-weight: 600; cursor: pointer;">
                ${info.name}
              </label>
              <span style="font-size: 12px; padding: 4px 8px; border-radius: 4px; background: ${colorFondo}; color: ${colorTexto};">
                ${info.category}
              </span>
            </div>
            <div style="font-size: 13px; color: var(--muted);">
              ID: ${id}
            </div>
          </div>
        `;
      }
    }
    return html;
  },

  setupGestorEventListeners() {
    var btnVolver = document.getElementById('btn-volver-dashboard');
    if (btnVolver) {
      btnVolver.addEventListener('click', function() {
        window.location.reload();
      });
    }
    
    var btnActivarTodos = document.getElementById('btn-activar-todos');
    if (btnActivarTodos) {
      btnActivarTodos.addEventListener('click', function() {
        var checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(function(checkbox) {
          checkbox.checked = true;
        });
      });
    }
    
    var btnDesactivarTodos = document.getElementById('btn-desactivar-todos');
    if (btnDesactivarTodos) {
      btnDesactivarTodos.addEventListener('click', function() {
        var checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(function(checkbox) {
          checkbox.checked = false;
        });
      });
    }
    
    var btnAplicar = document.getElementById('btn-aplicar-cambios');
    if (btnAplicar) {
      btnAplicar.addEventListener('click', function() {
        try {
          var checkboxes = document.querySelectorAll('input[type="checkbox"]');
          checkboxes.forEach(function(checkbox) {
            var componentId = checkbox.id.replace('chk-', '');
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
  document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM cargado, iniciando app...');
    DashboardApp.init();
  });
} else {
  console.log('⚡ DOM ya listo, iniciando app inmediatamente...');
  DashboardApp.init();
}
