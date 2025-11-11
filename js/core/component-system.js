// ====== SISTEMA DE COMPONENTES ======
const ComponentSystem = {
  registrar(id, config) {
    COMPONENTES.registros[id] = config;
  },

  async render(data) {
    const grid = document.querySelector('.dashboard-grid');
    grid.innerHTML = '';

    for(const componentId of COMPONENTES.componentesActivos) {
      const component = COMPONENTES.registros[componentId];
      if(component) {
        try {
          await this.renderComponent(componentId, component, data, grid);
        } catch(error) {
          console.error(`Error renderizando componente ${componentId}:`, error);
        }
      }
    }
  },

  async renderComponent(id, component, data, grid) {
    const element = document.createElement(component.element || 'section');
    element.id = `componente-${id}`;
    element.className = component.classes || 'card';
    element.setAttribute('data-grid', component.grid);
    
    if(component.html) {
      element.innerHTML = component.html;
    }

    grid.appendChild(element);

    if(component.render) {
      await component.render(data, element);
    }
  },

  agregarComponente(id) {
    if(!COMPONENTES.componentesActivos.includes(id)) {
      COMPONENTES.componentesActivos.push(id);
    }
  },

  removerComponente(id) {
    const index = COMPONENTES.componentesActivos.indexOf(id);
    if(index > -1) {
      COMPONENTES.componentesActivos.splice(index, 1);
    }
  }
};
