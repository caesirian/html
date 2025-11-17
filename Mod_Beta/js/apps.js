// Aplicación principal del sistema
const App = {
  currentModule: 'dashboard',

  init() {
    console.log('🚀 Iniciando sistema de gestión empresarial...');
    this.setupEventListeners();
    this.loadDashboard();
  },

  setupEventListeners() {
    // Navegación principal
    const navLinks = document.querySelectorAll('.nav-link, .subnav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.getAttribute('data-page');
        this.loadModule(page);
        
        // Actualizar navegación activa
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Cerrar menú en móviles
        if (window.innerWidth <= 900) {
          document.querySelector('.sidebar').classList.remove('active');
          document.getElementById('sidebarOverlay').classList.remove('active');
        }
      });
    });

    // Grupos de navegación
    const navGroups = document.querySelectorAll('.nav-group');
    navGroups.forEach(group => {
      const button = group.querySelector('.nav-link');
      button.addEventListener('click', (e) => {
        if (window.innerWidth > 900) {
          e.stopPropagation();
          navGroups.forEach(g => {
            if (g !== group) g.classList.remove('active');
          });
          group.classList.toggle('active');
        }
      });
    });

    // Menú móvil
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

  loadModule(moduleName) {
    console.log(`📂 Cargando módulo: ${moduleName}`);
    this.currentModule = moduleName;
    
    // Actualizar título de página
    this.updatePageTitle(moduleName);
    
    switch (moduleName) {
      case 'dashboard':
        this.loadDashboard();
        break;
      case 'clientes':
        this.loadClientes();
        break;
      default:
        this.loadDefaultModule(moduleName);
    }
  },

  updatePageTitle(moduleName) {
    const pageTitle = document.getElementById('page-title');
    const pageDescription = document.getElementById('page-description');
    
    const titles = {
      dashboard: { title: 'Dashboard', desc: 'Resumen general del sistema' },
      clientes: { title: 'Clientes', desc: 'Gestión de clientes' },
      ventas: { title: 'Ventas', desc: 'Gestión de ventas' },
      compras: { title: 'Compras', desc: 'Gestión de compras' }
    };
    
    const moduleInfo = titles[moduleName] || { title: moduleName, desc: 'Módulo del sistema' };
    
    if (pageTitle) pageTitle.textContent = moduleInfo.title;
    if (pageDescription) pageDescription.textContent = moduleInfo.desc;
  },

  loadDashboard() {
    const container = document.getElementById('content-container');
    container.innerHTML = `
      <div class="dashboard-grid">
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
          <h2>Ingresos vs Egresos</h2>
          <div class="chart-container">
            <canvas id="ingresosEgresosChart"></canvas>
          </div>
        </div>
        
        <div class="card" data-grid="span-6">
          <h2>Últimas Ventas</h2>
          <div class="tabla-container">
            <table class="tabla-datos">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Monto</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>15/11/2024</td>
                  <td>Cliente XYZ</td>
                  <td>$ 8,500</td>
                  <td><span class="venta-status status-cobrada">Cobrada</span></td>
                </tr>
                <tr>
                  <td>14/11/2024</td>
                  <td>Empresa ABC</td>
                  <td>$ 12,300</td>
                  <td><span class="venta-status status-cobrada">Cobrada</span></td>
                </tr>
                <tr>
                  <td>12/11/2024</td>
                  <td>Cliente Personal</td>
                  <td>$ 3,200</td>
                  <td><span class="venta-status status-pendiente">Pendiente</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
    
    this.initializeCharts();
  },

  loadClientes() {
    const container = document.getElementById('content-container');
    container.innerHTML = `
      <div class="card" data-grid="full" style="margin-bottom: 20px;">
        <h2 style="margin-top: 0; margin-bottom: 20px;">Gestión de Clientes</h2>
        
        <form id="form-cliente">
          <div class="form-section">
            <h3>Información Básica</h3>
            <div class="form-grid">
              <div class="form-field">
                <label for="nombre">Nombre/Razón Social</label>
                <input type="text" id="nombre" name="nombre" required>
              </div>
              
              <div class="form-field">
                <label for="tipoCliente">Tipo de Cliente</label>
                <select id="tipoCliente" name="tipoCliente">
                  <option value="">Seleccionar...</option>
                  <option value="Empresa">Empresa</option>
                  <option value="Particular">Particular</option>
                </select>
              </div>
              
              <div class="form-field">
                <label for="email">Email</label>
                <input type="email" id="email" name="email">
              </div>
              
              <div class="form-field">
                <label for="telefono">Teléfono</label>
                <input type="text" id="telefono" name="telefono">
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn">Guardar Cliente</button>
            <button type="reset" class="btn secondary">Limpiar</button>
          </div>
        </form>
      </div>

      <div class="card" data-grid="full">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h2 style="margin: 0;">Clientes Registrados</h2>
          <input type="text" id="buscar-cliente" placeholder="Buscar..." 
                 style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); color: var(--text); padding: 6px 10px; border-radius: 6px; min-width: 200px;">
        </div>

        <div class="tabla-container">
          <table class="tabla-datos" style="width: 100%;">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Cliente XYZ</td>
                <td>Empresa</td>
                <td>contacto@clientexyz.com</td>
                <td>+54 11 1234-5678</td>
                <td><span class="client-status status-active">Activo</span></td>
                <td>
                  <div class="action-buttons">
                    <button class="btn small">Editar</button>
                    <button class="btn small secondary">Eliminar</button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>Cliente Personal</td>
                <td>Particular</td>
                <td>cliente@personal.com</td>
                <td>+54 11 8765-4321</td>
                <td><span class="client-status status-active">Activo</span></td>
                <td>
                  <div class="action-buttons">
                    <button class="btn small">Editar</button>
                    <button class="btn small secondary">Eliminar</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Agregar event listener al formulario
    const form = document.getElementById('form-cliente');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.guardarCliente();
      });
    }
  },

  loadDefaultModule(moduleName) {
    const container = document.getElementById('content-container');
    container.innerHTML = `
      <div class="card" data-grid="full">
        <h2>${this.getModuleTitle(moduleName)}</h2>
        <p>Módulo en desarrollo. Próximamente disponible.</p>
        <div style="text-align: center; padding: 40px;">
          <i class="fas fa-tools" style="font-size: 48px; color: var(--muted); margin-bottom: 20px;"></i>
          <p>Estamos trabajando en este módulo</p>
        </div>
      </div>
    `;
  },

  getModuleTitle(moduleName) {
    const titles = {
      dashboard: 'Dashboard',
      clientes: 'Gestión de Clientes',
      ventas: 'Gestión de Ventas',
      compras: 'Gestión de Compras',
      proveedores: 'Proveedores',
      caja: 'Gestor de Caja',
      inventario: 'Control de Inventario'
    };
    return titles[moduleName] || moduleName;
  },

  guardarCliente() {
    const nombre = document.getElementById('nombre').value;
    const tipo = document.getElementById('tipoCliente').value;
    
    if (!nombre) {
      alert('Por favor complete el nombre del cliente.');
      return;
    }

    alert(`Cliente "${nombre}" guardado correctamente (Tipo: ${tipo})`);
    
    // Limpiar formulario
    document.getElementById('form-cliente').reset();
  },

  initializeCharts() {
    const ctx = document.getElementById('ingresosEgresosChart');
    if (ctx && window.Chart) {
      new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
          labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
          datasets: [
            {
              label: 'Ingresos',
              data: [65000, 72000, 68000, 76000, 82000, 85720],
              backgroundColor: 'rgba(62, 166, 255, 0.8)',
              borderColor: 'rgba(62, 166, 255, 1)',
              borderWidth: 1
            },
            {
              label: 'Egresos',
              data: [42000, 45000, 48000, 44000, 43700, 42150],
              backgroundColor: 'rgba(255, 99, 132, 0.8)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
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
  }
};

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  App.init();
});
