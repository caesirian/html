// Sistema de enrutamiento para SPA
class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        this.init();
    }

    init() {
        // Manejar navegación con el botón atrás/adelante
        window.addEventListener('popstate', (e) => {
            this.navigate(window.location.pathname, false);
        });

        // Interceptar clicks en enlaces
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[data-route]');
            if (link) {
                e.preventDefault();
                this.navigate(link.getAttribute('href'));
            }
        });
    }

    addRoute(path, component, title = 'Sistema de Gestión') {
        this.routes[path] = { component, title };
    }

    async navigate(path, pushState = true) {
        if (pushState) {
            window.history.pushState({}, '', path);
        }

        const route = this.routes[path] || this.routes['/dashboard'];
        
        if (route) {
            document.title = route.title;
            this.currentRoute = path;
            
            // Cargar el componente
            await this.loadComponent(route.component);
        }
    }

    async loadComponent(component) {
        try {
            appState.setLoading(true);
            await component();
            appState.setLoading(false);
        } catch (error) {
            console.error('Error loading component:', error);
            this.showError('Error al cargar el módulo');
        }
    }

    showError(message) {
        appState.addNotification(message, 'error');
    }
}

const router = new Router();
