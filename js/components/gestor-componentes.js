// Componente: Gestor de Componentes
ComponentSystem.registrar('gestorComponentes', {
  grid: 'full',
  html: `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
      <h2 style="margin: 0;">Gestor de Componentes del Dashboard</h2>
      <div style="display: flex; gap: 8px; align-items: center;">
        <button id="btn-todo-livianos" class="btn small">Solo Livianos</button>
        <button id="btn-todo-completo" class="btn small">Completo</button>
        <button id="btn-guardar-config" class="btn small">Guardar Configuración</button>
      </div>
    </div>

    <div class="dashboard-grid" style="grid-template-columns: repeat(12, 1fr); gap: 12px; margin-bottom: 16px;">
      <!-- Componentes Livianos -->
      <div class="card" data-grid="span-4">
        <h3 style="color: #28a745; margin-bottom: 12px;">⚡ Componentes Livianos</h3>
        <div id="lista-livianos" style="display: flex; flex-direction: column; gap: 8px;">
          <!-- Se llenará dinámicamente -->
        </div>
      </div>

      <!-- Componentes Medianos -->
      <div class="card" data-grid="span-4">
        <h3 style="color: #ffc107; margin-bottom: 12px;">🔶 Componentes Medianos</h3>
        <div id="lista-medianos" style="display: flex; flex-direction: column; gap: 8px;">
          <!-- Se llenará dinámicamente -->
        </div>
      </div>

      <!-- Componentes Pesados -->
      <div class="card" data-grid="span-4">
        <h3 style="color: #dc3545; margin-bottom: 12px;">🔴 Componentes Pesados</h3>
        <div id="lista-pesados" style="display: flex; flex-direction: column; gap: 8px;">
          <!-- Se llenará dinámicamente -->
        </div>
      </div>
    </div>

    <div class="card" data-grid="full">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0;">Vista Previa del Dashboard</h3>
        <button id="btn-aplicar-cambios" class="btn">Aplicar Cambios y Recargar</button>
      </div>
      <div style="margin-top: 12px; padding: 16px; background: rgba(255,255,255,0.02); border-radius: 8px;">
        <div id="vista-previa-componentes" class="dashboard-grid">
          <!-- Vista previa de cómo quedaría el grid -->
        </div>
      </div>
    </div>
  `,

  async render(data, element) {
    this.configuracion = this.cargarConfiguracion();
    this.renderizarListasComponentes(element);
    this.setupEventListeners(element);
    this.actualizarVistaPrevia(element);
  },

  cargarConfiguracion() {
    const guardado = localStorage.getItem('dashboard_config_componentes');
    return guardado ? JSON.parse(guardado) : {...CONFIG.COMPONENTES_POR_DEFECTO};
  },

  guardarConfiguracion() {
    localStorage.setItem('dashboard_config_componentes', JSON.stringify(this.configuracion));
  },

  renderizarListasComponentes(element) {
    this.renderizarLista('livianos', element);
    this.renderizarLista('medianos', element);
    this.renderizarLista('pesados', element);
  },

  renderizarLista(tipo, element) {
    const contenedor = element.querySelector(`#lista-${tipo}`);
    contenedor.innerHTML = '';

    const componentes = CONFIG.COMPONENTES[tipo];
    const colores = {
      livianos: '#28a745',
      medianos: '#ffc107', 
      pesados: '#dc3545'
    };

    componentes.forEach(componentId => {
      const activo = this.configuracion[componentId];
      const div = document.createElement('div');
      div.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
        border-radius: 6px;
        background: rgba(255,255,255,0.03);
        border: 1px solid ${activo ? colores[tipo] : 'rgba(255,255,255,0.1)'};
      `;

      div.innerHTML = `
        <input type="checkbox" id="chk-${componentId}" ${activo ? 'checked' : ''} 
               style="margin: 0;">
        <label for="chk-${componentId}" style="flex: 1; cursor: pointer; color: var(--text);">
          ${this.obtenerNombreComponente(componentId)}
        </label>
        <span style="font-size: 10px; color: ${colores[tipo]}; text-transform: uppercase;">
          ${tipo}
        </span>
      `;

      contenedor.appendChild(div);
    });
  },

  obtenerNombreComponente(id) {
    const nombres = {
      saldoCaja: 'Saldo de Caja',
      ingresosVsEgresos: 'Ingresos vs Egresos',
      egresosVsAnterior: 'Comparación con Mes Anterior',
      cotizacionesMonedas: 'Cotizaciones de Monedas',
      analisisCategorias: 'Análisis por Categorías',
      cuentasPendientes: 'Cuentas Pendientes',
      controlStock: 'Control de Stock',
      proyeccionFlujo: 'Proyección de Flujo',
      calculadoraInversion: 'Calculadora de Inversiones',
      calculadoraInversiones: 'Calculadora de Inversiones 2'
    };
    return nombres[id] || id;
  },

  actualizarVistaPrevia(element) {
    const vistaPrevia = element.querySelector('#vista-previa-componentes');
    vistaPrevia.innerHTML = '';

    // Mostrar solo componentes activos en vista previa
    Object.keys(this.configuracion).forEach(componentId => {
      if (this.configuracion[componentId]) {
        const div = document.createElement('div');
        div.className = 'card';
        div.setAttribute('data-grid', this.obtenerGridComponente(componentId));
        div.style.cssText = `
          min-height: 80px;
          background: rgba(255,255,255,0.05);
          border: 1px dashed rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--muted);
          font-size: 12px;
        `;
        div.textContent = this.obtenerNombreComponente(componentId);
        vistaPrevia.appendChild(div);
      }
    });
  },

  obtenerGridComponente(componentId) {
    const grids = {
      saldoCaja: 'span-3',
      ingresosVsEgresos: 'span-5',
      egresosVsAnterior: 'span-4',
      cotizacionesMonedas: 'span-6',
      analisisCategorias: 'span-6',
      cuentasPendientes: 'span-6', 
      controlStock: 'span-6',
      proyeccionFlujo: 'span-6',
      calculadoraInversion: 'span-6'
    };
    return grids[componentId] || 'span-6';
  },

  setupEventListeners(element) {
    // Checkboxes individuales
    element.addEventListener('change', (e) => {
      if (e.target.type === 'checkbox') {
        const componentId = e.target.id.replace('chk-', '');
        this.configuracion[componentId] = e.target.checked;
        this.actualizarVistaPrevia(element);
      }
    });

    // Botones de preset
    element.querySelector('#btn-todo-livianos').addEventListener('click', () => {
      Object.keys(this.configuracion).forEach(key => {
        this.configuracion[key] = CONFIG.COMPONENTES.livianos.includes(key);
      });
      this.renderizarListasComponentes(element);
      this.actualizarVistaPrevia(element);
    });

    element.querySelector('#btn-todo-completo').addEventListener('click', () => {
      Object.keys(this.configuracion).forEach(key => {
        this.configuracion[key] = true;
      });
      this.renderizarListasComponentes(element);
      this.actualizarVistaPrevia(element);
    });

    // Guardar y aplicar
    element.querySelector('#btn-guardar-config').addEventListener('click', () => {
      this.guardarConfiguracion();
      this.mostrarMensaje('Configuración guardada correctamente', 'success');
    });

    element.querySelector('#btn-aplicar-cambios').addEventListener('click', () => {
      this.guardarConfiguracion();
      this.mostrarMensaje('Recargando dashboard con nueva configuración...', 'info');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    });
  },

  mostrarMensaje(mensaje, tipo) {
    // Podríamos implementar un sistema de notificaciones más elegante
    alert(mensaje); // Simple por ahora
  }
});
