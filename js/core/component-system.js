const ComponentSystem = {
  registros: {},
  
  registrar(id, config) {
    this.registros[id] = config;
  },

  async render(data) {
    const grid = document.querySelector('.dashboard-grid');
    if (!grid) return;
    
    grid.innerHTML = '';

    // CAMBIAR ESTA LÍNEA - usar CONFIG en lugar de COMPONENTES
    for(const componentId of CONFIG.COMPONENTES_ACTIVOS) {
      const component = this.registros[componentId];
      if(component) {
        await this.renderComponent(componentId, component, data, grid);
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
  }
};
