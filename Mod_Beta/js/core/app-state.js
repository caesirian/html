// Gestor de estado global de la aplicación
class AppState {
    constructor() {
        this.user = null;
        this.permissions = [];
        this.currentModule = 'dashboard';
        this.companySettings = {};
        this.notifications = [];
        this.isLoading = false;
        this.data = {};
    }

    setUser(userData) {
        this.user = userData;
        this.permissions = this.calculatePermissions(userData.role);
        this.loadUserPreferences();
    }

    calculatePermissions(role) {
        const permissionMatrix = {
            ADMIN: ['read', 'write', 'delete', 'approve', 'configure'],
            GERENTE: ['read', 'write', 'approve'],
            VENTAS: ['read', 'write'],
            ALMACEN: ['read', 'write'],
            RRHH: ['read', 'write']
        };
        return permissionMatrix[role] || ['read'];
    }

    addNotification(message, type = 'info', duration = 5000) {
        const notification = {
            id: Date.now() + Math.random(),
            message,
            type,
            timestamp: new Date()
        };

        this.notifications.push(notification);

        // Auto-remover después de la duración
        setTimeout(() => {
            this.removeNotification(notification.id);
        }, duration);

        return notification.id;
    }

    removeNotification(id) {
        this.notifications = this.notifications.filter(notif => notif.id !== id);
    }

    setLoading(state) {
        this.isLoading = state;
    }

    updateData(key, value) {
        this.data[key] = value;
    }

    getData(key) {
        return this.data[key];
    }
}

// Instancia global del estado
const appState = new AppState();
