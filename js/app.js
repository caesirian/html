// En app.js - modificar la función renderizarProgresivamente
async renderizarProgresivamente(data) {
  const grid = document.querySelector('.dashboard-grid');
  if (!grid) return;
  
  // Limpiar skeletons
  grid.innerHTML = '';
  
  // Cargar configuración de componentes
  const configComponentes = this.cargarConfiguracionComponentes();
  
  // Componentes en orden de prioridad según configuración
  const componentesActivos = Object.keys(configComponentes).filter(id => configComponentes[id]);
  
  // Separar por categorías para carga progresiva
  const componentesLivianos = componentesActivos.filter(id => 
    CONFIG.COMPONENTES.livianos.includes(id)
  );
  const componentesMedianos = componentesActivos.filter(id => 
    CONFIG.COMPONENTES.medianos.includes(id)
  );
  const componentesPesados = componentesActivos.filter(id => 
    CONFIG.COMPONENTES.pesados.includes(id)
  );
  
  // Renderizar componentes livianos primero
  for (const componentId of componentesLivianos) {
    const component = ComponentSystem.registros[componentId];
    if (component) {
      await this.renderizarComponenteConDelay(componentId, component, data, grid, 100);
    }
  }
  
  // Pequeña pausa
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Renderizar componentes medianos
  for (const componentId of componentesMedianos) {
    const component = ComponentSystem.registros[componentId];
    if (component) {
      await this.renderizarComponenteConDelay(componentId, component, data, grid, 150);
    }
  }
  
  // Pausa más larga para componentes pesados
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Renderizar componentes pesados
  for (const componentId of componentesPesados) {
    const component = ComponentSystem.registros[componentId];
    if (component) {
      await this.renderizarComponenteConDelay(componentId, component, data, grid, 200);
    }
  }
},

cargarConfiguracionComponentes() {
  const guardado = localStorage.getItem('dashboard_config_componentes');
  return guardado ? JSON.parse(guardado) : {...CONFIG.COMPONENTES_POR_DEFECTO};
},

setupEventListeners() {
  const refreshBtn = document.getElementById('refresh-data');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => this.loadData(true));
  }
  
  // Nuevo: Botón de gestión de componentes
  const btnGestionComponentes = document.getElementById('btn-gestion-componentes');
  if (btnGestionComponentes) {
    btnGestionComponentes.addEventListener('click', () => {
      this.mostrarGestorComponentes();
    });
  }
},

async mostrarGestorComponentes() {
  const grid = document.querySelector('.dashboard-grid');
  if (!grid) return;
  
  // Limpiar grid y mostrar solo el gestor
  grid.innerHTML = '';
  
  const gestorComponent = ComponentSystem.registros['gestorComponentes'];
  if (gestorComponent) {
    await ComponentSystem.renderComponent('gestorComponentes', gestorComponent, {}, grid);
  }
},
