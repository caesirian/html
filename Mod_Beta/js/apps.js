// Aplicación principal del sistema de gestión
class App {
    constructor() {
        this.modules = new Map();
        this.currentModule = null;
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;
        
        console.log('🚀 Iniciando Sistema de Gestión Empresarial...');
        
        try {
            // Inicializar sistemas core
            await this.initializeCoreSystems();
            
            // Configurar interfaz
            this.setupUI();
            
            // Cargar datos iniciales
            await this.loadInitialData();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('✅ Sistema inicializado correctamente');
            
            // Mostrar dashboard por defecto
            this.loadModule('dashboard');
            
        } catch (error) {
            console.error('❌ Error inicializando la aplicación:', error);
            this.showFatalError(error);
        }
    }

    async initializeCoreSystems() {
        // Inicializar sistemas en paralelo
        await Promise.all([
            this.initializeDataManager(),
            this.initializeNotificationSystem(),
            this.initializeComponentSystem()
        ]);
    }

    async initializeDataManager() {
        // Verificar conectividad
        try {
            await dataManager.fetchData(true);
            notificationSystem.show('Sistema conectado correctamente', 'success');
        } catch (error) {
            console.warn('⚠️ Modo offline activado');
            notificationSystem.show('Modo offline activado - usando datos locales', 'warning');
        }
    }

    initializeNotificationSystem() {
        // El sistema de notificaciones se auto-inicializa
        console.log('📢 Sistema de notificaciones listo');
    }

    async initializeComponentSystem() {
        // Registrar componentes del dashboard
        this.registerDashboardComponents();
        console.log('🧩 Sistema de componentes inicializado');
    }

    registerDashboardComponents() {
        // Los componentes se registran automáticamente al cargar sus scripts
    }

    setupUI() {
        // Configurar elementos de la UI
        this.setupLoadingStates();
        this.setupMobileMenu();
    }

    setupLoadingStates() {
        // Mostrar/ocultar loading global
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            appState.setLoading(true);
            try {
                const response = await originalFetch(...args);
                return response;
            } finally {
                setTimeout(() => appState.setLoading(false), 300);
            }
        };
    }

    setupEventListeners() {
        // Navegación principal
        this.setupNavigation();
        
        // Menú móvil
        this.setupMobileMenu();
        
        // Eventos globales
        this.setupGlobalEvents();
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link, .subnav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                const moduleName = link.getAttribute('data-page');
                
                // Actualizar navegación activa
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Activar grupo padre si es un subnav
                const parentGroup = link.closest('.nav-group');
                if (parentGroup && link.classList.contains('subnav-link')) {
                    parentGroup.classList.add('active');
                }
                
                // Cargar módulo
                await this.loadModule(moduleName);
                
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
    }

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
    }

    setupGlobalEvents() {
        // Actualizar datos cuando la ventana gana foco
        window.addEventListener('focus', async () => {
            await dataManager.fetchData(true);
        });

        // Manejar teclas globales
        document.addEventListener('keydown', (e) => {
            // Ctrl + S para guardar
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.handleGlobalSave();
            }
            
            // Escape para cancelar
            if (e.key === 'Escape') {
                this.handleGlobalEscape();
            }
        });
    }

    async loadInitialData() {
        try {
            const data = await dataManager.fetchData(false);
            appState.updateData('initialData', data);
        } catch (error) {
            console.error('Error cargando datos iniciales:', error);
        }
    }

    async loadModule(moduleName) {
        if (this.currentModule === moduleName) return;
        
        console.log(`📂 Cargando módulo: ${moduleName}`);
        
        try {
            appState.setLoading(true);
            
            // Ejecutar limpieza del módulo anterior
            if (this.currentModule && this.modules.has(this.currentModule)) {
                const previousModule = this.modules.get(this.currentModule);
                if (typeof previousModule.onUnload === 'function') {
                    await previousModule.onUnload();
                }
            }
            
            let module;
            
            switch (moduleName) {
                case 'dashboard':
                    module = await this.loadDashboard();
                    break;
                case 'clientes':
                    module = await this.loadClientesModule();
                    break;
                case 'ventas':
                    module = await this.loadVentasModule();
                    break;
                default:
                    module = await this.loadGenericModule(moduleName);
            }
            
            this.modules.set(moduleName, module);
            this.currentModule = moduleName;
            
            this.updatePageTitle(moduleName);
            
            notificationSystem.show(`Módulo ${this.getModuleTitle(moduleName)} cargado`, 'success', 2000);
            
        } catch (error) {
            console.error(`Error cargando módulo ${moduleName}:`, error);
            notificationSystem.show(`Error cargando ${moduleName}`, 'error');
            this.showErrorView(moduleName, error);
        } finally {
            appState.setLoading(false);
        }
    }

    async loadDashboard() {
        const container = document.getElementById('content-container');
        container.innerHTML = '<div id="dashboard-content"></div>';
        
        const dashboardContent = document.getElementById('dashboard-content');
        dashboardContent.innerHTML = `
            <div class="module-header">
                <div class="header-content">
                    <h1><i class="fas fa-tachometer-alt"></i> Dashboard Principal</h1>
                    <p>Vista general del rendimiento de tu empresa</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-secondary" id="btn-refresh-dashboard">
                        <i class="fas fa-sync-alt"></i> Actualizar
                    </button>
                    <button class="btn btn-primary" id="btn-customize-dashboard">
                        <i class="fas fa-cog"></i> Personalizar
                    </button>
                </div>
            </div>
            <div class="dashboard-grid" id="dashboard-components">
                <!-- Los componentes se cargarán aquí -->
            </div>
        `;
        
        // Configurar event listeners del dashboard
        document.getElementById('btn-refresh-dashboard').addEventListener('click', () => {
            this.refreshDashboard();
        });
        
        // Cargar componentes activos
        await this.renderDashboardComponents();
        
        return {
            onUnload: () => {
                console.log('Limpiando dashboard...');
            }
        };
    }

    async renderDashboardComponents() {
        const container = document.getElementById('dashboard-components');
        const data = appState.getData('currentData') || await dataManager.fetchData();
        
        // Componentes por defecto (luego se puede personalizar)
        const defaultComponents = ['saldoCaja', 'ingresosVsEgresos'];
        
        for (const componentId of defaultComponents) {
            try {
                await componentSystem.renderComponent(componentId, container, data);
            } catch (error) {
                console.error(`Error renderizando componente ${componentId}:`, error);
            }
        }
    }

    async loadClientesModule() {
        const container = document.getElementById('content-container');
        container.innerHTML = '<div id="clientes-module"></div>';
        
        const clientesModule = new ClientesModule();
        await clientesModule.init();
        
        return clientesModule;
    }

    async loadVentasModule() {
        // Placeholder para módulo de ventas
        return this.loadGenericModule('ventas');
    }

    async loadGenericModule(moduleName) {
        const container = document.getElementById('content-container');
        container.innerHTML = `
            <div class="module-placeholder">
                <div class="placeholder-content">
                    <i class="fas fa-tools"></i>
                    <h2>${this.getModuleTitle(moduleName)}</h2>
                    <p>Este módulo está en desarrollo activo</p>
                    <div class="placeholder-actions">
                        <button class="btn btn-primary" onclick="App.suggestFeature('${moduleName}')">
                            <i class="fas fa-lightbulb"></i> Sugerir Funcionalidad
                        </button>
                        <button class="btn btn-secondary" onclick="App.loadModule('dashboard')">
                            <i class="fas fa-arrow-left"></i> Volver al Dashboard
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        return {
            onUnload: () => console.log(`Limpiando ${moduleName}...`)
        };
    }

    refreshDashboard() {
        notificationSystem.show('Actualizando dashboard...', 'info');
        this.loadModule('dashboard');
    }

    updatePageTitle(moduleName) {
        const pageTitle = document.getElementById('page-title');
        const pageDescription = document.getElementById('page-description');
        
        if (pageTitle) pageTitle.textContent = this.getModuleTitle(moduleName);
        if (pageDescription) pageDescription.textContent = this.getModuleDescription(moduleName);
    }

    getModuleTitle(moduleName) {
        const titles = {
            dashboard: 'Dashboard',
            clientes: 'Clientes',
            ventas: 'Ventas',
            compras: 'Compras',
            proveedores: 'Proveedores',
            caja: 'Caja',
            inventario: 'Inventario',
            stock: 'Stock',
            rrhh: 'Recursos Humanos',
            proyectos: 'Proyectos',
            reportes: 'Reportes'
        };
        return titles[moduleName] || moduleName;
    }

    getModuleDescription(moduleName) {
        const descriptions = {
            dashboard: 'Vista general del sistema',
            clientes: 'Gestión de cartera de clientes',
            ventas: 'Control de ventas e ingresos',
            compras: 'Gestión de compras y gastos',
            caja: 'Flujo de caja y tesorería',
            inventario: 'Control de stock y productos'
        };
        return descriptions[moduleName] || 'Módulo del sistema';
    }

    handleGlobalSave() {
        // Guardado global - implementar según el módulo actual
        notificationSystem.show('Función de guardado global', 'info');
    }

    handleGlobalEscape() {
        // Cancelar acciones en curso
        if (this.currentModule === 'clientes' && this.modules.has('clientes')) {
            this.modules.get('clientes').cancelEdit?.();
        }
    }

    showErrorView(moduleName, error) {
        const container = document.getElementById('content-container');
        container.innerHTML = `
            <div class="error-view">
                <div class="error-content">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h2>Error al cargar ${this.getModuleTitle(moduleName)}</h2>
                    <p>${error.message}</p>
                    <div class="error-actions">
                        <button class="btn btn-primary" onclick="App.loadModule('${moduleName}')">
                            <i class="fas fa-redo"></i> Reintentar
                        </button>
                        <button class="btn btn-secondary" onclick="App.loadModule('dashboard')">
                            <i class="fas fa-home"></i> Ir al Dashboard
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    showFatalError(error) {
        document.body.innerHTML = `
            <div class="fatal-error">
                <div class="fatal-error-content">
                    <h1>⚠️ Error Crítico</h1>
                    <p>El sistema no pudo inicializarse correctamente.</p>
                    <div class="error-details">
                        <code>${error.message}</code>
                    </div>
                    <button class="btn btn-primary" onclick="location.reload()">
                        Recargar Aplicación
                    </button>
                </div>
            </div>
        `;
    }

    static suggestFeature(moduleName) {
        notificationSystem.show(`¡Gracias por tu interés en el módulo ${moduleName}!`, 'info');
        // Aquí se podría integrar con un sistema de feedback
    }
}

// Inicializar aplicación cuando el DOM esté listo
const app = new App();

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

// Hacer disponible globalmente
window.App = app;
