// Sistema de componentes para el dashboard
class ComponentSystem {
    constructor() {
        this.components = new Map();
        this.activeComponents = new Set();
    }

    register(id, config) {
        this.components.set(id, {
            id,
            name: config.name,
            category: config.category,
            grid: config.grid,
            render: config.render,
            defaultActive: config.defaultActive || false,
            script: config.script
        });
    }

    async loadComponent(id) {
        const component = this.components.get(id);
        if (!component) {
            throw new Error(`Componente ${id} no encontrado`);
        }

        // Cargar script si existe
        if (component.script && !document.querySelector(`script[src="${component.script}"]`)) {
            await this.loadScript(component.script);
        }

        return component;
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async renderComponent(id, container, data) {
        try {
            const component = await this.loadComponent(id);
            const element = document.createElement('div');
            element.className = `component component-${id} card fade-in`;
            element.setAttribute('data-grid', component.grid);
            element.setAttribute('data-component', id);

            if (component.render) {
                await component.render(data, element);
            }

            container.appendChild(element);
            this.activeComponents.add(id);

            return element;
        } catch (error) {
            console.error(`Error renderizando componente ${id}:`, error);
            throw error;
        }
    }

    getComponentConfig(id) {
        return this.components.get(id);
    }

    getComponentsByCategory(category) {
        return Array.from(this.components.values()).filter(comp => comp.category === category);
    }
}

const componentSystem = new ComponentSystem();
