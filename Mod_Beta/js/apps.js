// Aplicación principal del sistema
const App = {
  currentModule: null,
  modules: {},

  async init() {
    console.log('🚀 Iniciando sistema de gestión empresarial...');
    
    this.setupNavigation();
    this.setupMobileMenu();
    await this.loadModule('dashboard');
  },

  setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link, .subnav-link');
    
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.getAttribute('data-page');
        this.loadModule(page);
        
        // Cerrar menú en móviles
        if (window.innerWidth <= 900) {
          document.querySelector('.sidebar').classList.remove('active');
          document.getElementById('sidebarOverlay').classList.remove('active');
        }
      });
    });

    // Manejar grupos de navegación
    const navGroups = document.querySelectorAll('.nav-group');
    navGroups.forEach(group => {
      const button = group.querySelector('.nav-link');
      button.addEventListener('click', (e) => {
        if (window.innerWidth > 900) {
          e.stopPropagation();
          group.classList.toggle('active');
        }
      });
    });
  },

  setupMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
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

  async loadModule(moduleName) {
    console.log(`📂 Cargando módulo: ${moduleName}`);
    
    // Ocultar módulo actual
    if (this.currentModule && this.modules[this.currentModule]) {
      this.modules[this.currentModule].onUnload?.();
    }
    
    // Actualizar navegación
    this.updateNavigation(moduleName);
    
    // Cargar módulo
    try {
      switch (moduleName) {
        case 'dashboard':
          await this.loadDashboard();
          break;
        case 'clientes':
          await this.loadClientesModule();
          break;
        case 'ventas':
          await this.loadVentasModule();
          break;
        default:
          this.showDefaultView(moduleName);
      }
      
      this.currentModule = moduleName;
      
    } catch (error) {
      console.error(`Error cargando módulo ${moduleName}:`, error);
      this.showErrorView(moduleName, error);
    }
  },

  async loadDashboard() {
    const container = document.getElementById('content-container');
    container.innerHTML = `
      <div id="dashboard-content" class="page-content active">
        <div class="dashboard-grid">
          <!-- Los componentes del dashboard se cargarán aquí -->
          <div class="card" data-grid="span-3">
            <div class="metric-card">
              <h2>Saldo de Caja</h2>
              <div class="metric-value">$ 125,430</div>
              <div class="metric-label">Disponible</div>
              <div class="trend-up">+5.2% vs mes anterior</div>
            </div>
          </div>
          
          <div class="card" data-grid="span-3">
            <div class="metric-card">
              <h2>Ingresos del Mes</h2>
              <div class="metric-value">$ 85,720</div>
              <div class="metric-label">Noviembre 2024</div>
              <div class="trend-up">+12.8% vs octubre</div>
            </div>
          </div>
          
          <div class="card" data-grid="span-3">
            <div class="metric-card">
              <h2>Egresos del Mes</h2>
              <div class="metric-value">$ 42,150</div>
              <div class="metric-label">Noviembre 2024</div>
              <div class="trend-down">-3.5% vs octubre</div>
            </div>
          </div>
          
          <div class="card" data-grid="span-3">
            <div class="metric-card">
              <h2>Ventas Pendientes</h2>
              <div class="metric-value">8</div>
              <div class="metric-label">Por cobrar</div>
              <div class="trend-neutral">$ 24,500 total</div>
            </div>
          </div>
          
          <div class="card" data-grid="span-6">
            <h2>Ingresos vs Egresos - Últimos 6 meses</h2>
            <div class="chart-container">
              <canvas id="ingresosEgresosChart"></canvas>
            </div>
          </div>
          
          <div class="card" data-grid="span-6">
            <h2>Productos con Stock Bajo</h2>
            <div class="tabla-container">
              <table class="display">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Stock Actual</th>
                    <th>Stock Mínimo</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Producto A</td>
                    <td>12</td>
                    <td>20</td>
                    <td><span class="status-pendiente">Bajo</span></td>
                  </tr>
                  <tr>
                    <td>Producto C</td>
                    <td>5</td>
                    <td>15</td>
                    <td><span class="status-cancelada">Crítico</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
    
    this.initializeDashboardCharts();
  },

  async loadClientesModule() {
    // Cargar el módulo de clientes
    if (!this.modules.clientes) {
      this.modules.clientes = ClientesModule;
    }
    
    const container = document.getElementById('content-container');
    container.innerHTML = '<div id="clientes-content" class="page-content active"></div>';
    
    await this.modules.clientes.init();
  },

  async loadVentasModule() {
    // Placeholder para módulo de ventas
    this.showDefaultView('ventas');
  },

  showDefaultView(moduleName) {
    const container = document.getElementById('content-container');
    const moduleTitle = this.getModuleTitle(moduleName);
    
    container.innerHTML = `
      <div class="page-content active">
        <div class="card" data-grid="full">
          <h2>${moduleTitle}</h2>
          <p>Módulo en desarrollo. Próximamente disponible.</p>
          <div style="text-align: center; padding: 40px;">
            <i class="fas fa-tools" style="font-size: 48px; color: var(--muted); margin-bottom: 20px;"></i>
            <p>Estamos trabajando en este módulo</p>
          </div>
        </div>
      </div>
    `;
  },

  showErrorView(moduleName, error) {
    const container = document.getElementById('content-container');
    container.innerHTML = `
      <div class="page-content active">
        <div class="card" data-grid="full">
          <h2>Error</h2>
          <p>No se pudo cargar el módulo ${moduleName}:</p>
          <div style="color: #dc3545; padding: 20px; background: rgba(220, 53, 69, 0.1); border-radius: 8px;">
            ${error.message}
          </div>
          <button class="btn" onclick="App.loadModule('dashboard')" style="margin-top: 20px;">
            Volver al Dashboard
          </button>
        </div>
      </div>
    `;
  },

  updateNavigation(moduleName) {
    // Actualizar estado activo en la navegación
    const allLinks = document.querySelectorAll('.nav-link, .subnav-link');
    allLinks.forEach(link => link.classList.remove('active'));
    
    const activeLink = document.querySelector(`[data-page="${moduleName}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
      
      // Si es un subnav, activar también el grupo padre
      const parentGroup = activeLink.closest('.nav-group');
      if (parentGroup) {
        parentGroup.classList.add('active');
      }
    }
    
    // Actualizar título de página
    const pageTitle = document.getElementById('page-title');
    const pageDescription = document.getElementById('page-description');
    
    if (pageTitle && pageDescription) {
      pageTitle.textContent = this.getModuleTitle(moduleName);
      pageDescription.textContent = this.getModuleDescription(moduleName);
    }
  },

  getModuleTitle(moduleName) {
    const titles = {
      dashboard: 'Dashboard',
      clientes: 'Gestión de Clientes',
      ventas: 'Gestión de Ventas',
      compras: 'Gestión de Compras',
      proveedores: 'Proveedores',
      caja: 'Gestor de Caja',
      inventario: 'Control de Inventario',
      stock: 'Stock',
      movimientos: 'Movimientos',
      rrhh: 'Recursos Humanos',
      empleados: 'Empleados',
      asistencia: 'Asistencia',
      proyectos: 'Gestión de Proyectos',
      reportes: 'Reportes y Analytics'
    };
    return titles[moduleName] || moduleName;
  },

  getModuleDescription(moduleName) {
    const descriptions = {
      dashboard: 'Resumen general del sistema',
      clientes: 'Administración de clientes',
      ventas: 'Gestión de ventas e ingresos',
      compras: 'Gestión de compras y proveedores',
      proveedores: 'Administración de proveedores',
      caja: 'Control de flujo de caja',
      inventario: 'Gestión de inventario',
      stock: 'Control de niveles de stock',
      movimientos: 'Registro de movimientos de inventario',
      rrhh: 'Gestión de recursos humanos',
      empleados: 'Directorio de empleados',
      asistencia: 'Control de asistencia y horarios',
      proyectos: 'Seguimiento de proyectos y tareas',
      reportes: 'Reportes detallados y análisis'
    };
    return descriptions[moduleName] || 'Módulo del sistema';
  },

  initializeDashboardCharts() {
    // Inicializar gráficos del dashboard
    const ctx = document.getElementById('ingresosEgresosChart');
    if (ctx) {
      this.createIngresosEgresosChart(ctx);
    }
  },

  createIngresosEgresosChart(ctx) {
    const chart = new Chart(ctx.getContext('2d'), {
      type: 'line',
      data: {
        labels: ['Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov'],
        datasets: [
          {
            label: 'Ingresos',
            data: [65000, 72000, 68000, 76000, 82000, 85720],
            backgroundColor: 'rgba(62, 166, 255, 0.1)',
            borderColor: 'rgba(62, 166, 255, 1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
          },
          {
            label: 'Egresos',
            data: [42000, 45000, 48000, 44000, 43700, 42150],
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '$ ' + value.toLocaleString('es-AR');
              }
            }
          }
        }
      }
    });
  }
};

// Inicializar la aplicación cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    App.init();
  });
} else {
  App.init();
}
