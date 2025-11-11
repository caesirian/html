const ComponentSystem = {
  registros: {},
  
  registrar(id, config) {
    this.registros[id] = config;
  },

  async render(data) {
    const grid = document.querySelector('.dashboard-grid');
    if (!grid) return;
    
    // No limpiar el grid aquí - ya lo hace renderizarProgresivamente
    console.log('🎨 Renderizando componentes...');
  },

  async renderComponent(id, component, data, grid) {
    try {
      console.time(`⏱️ Componente ${id}`);
      
      const element = document.createElement(component.element || 'section');
      element.id = `componente-${id}`;
      element.className = component.classes || 'card fade-in';
      element.setAttribute('data-grid', component.grid);
      
      if (component.html) {
        element.innerHTML = component.html;
      }

      grid.appendChild(element);

      if (component.render) {
        await component.render(data, element);
      }
      
      console.timeEnd(`⏱️ Componente ${id}`);
      
    } catch (error) {
      console.error(`❌ Error en componente ${id}:`, error);
    }
  }
};
