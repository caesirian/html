// Sistema de notificaciones en tiempo real
class NotificationSystem {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        this.createContainer();
        this.setupObservers();
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'notifications-container';
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 400px;
        `;
        document.body.appendChild(this.container);
    }

    setupObservers() {
        // Observar cambios en el estado de notificaciones
        const observer = new MutationObserver(() => {
            this.render();
        });

        // Aquí podríamos observar cambios en appState.notifications
    }

    show(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            background: var(--card);
            border: 1px solid rgba(255,255,255,0.1);
            border-left: 4px solid ${this.getColor(type)};
            border-radius: 8px;
            padding: 12px 16px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transform: translateX(400px);
            opacity: 0;
            transition: all 0.3s ease;
            min-width: 280px;
            max-width: 350px;
            display: flex;
            align-items: center;
            gap: 10px;
        `;

        const icon = this.getIcon(type);
        notification.innerHTML = `
            <i class="fas ${icon}" style="color: ${this.getColor(type)};"></i>
            <span>${message}</span>
        `;

        this.container.appendChild(notification);

        // Animación de entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        }, 100);

        // Auto-remover después de la duración
        if (duration > 0) {
            setTimeout(() => {
                this.hide(notification);
            }, duration);
        }

        return notification;
    }

    hide(notification) {
        notification.style.transform = 'translateX(400px)';
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    getColor(type) {
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#3ea6ff'
        };
        return colors[type] || colors.info;
    }

    getIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-triangle',
            warning: 'fa-exclamation-circle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    render() {
        // Renderizar notificaciones del estado global
        appState.notifications.forEach(notification => {
            this.show(notification.message, notification.type, 5000);
        });
    }
}

const notificationSystem = new NotificationSystem();
