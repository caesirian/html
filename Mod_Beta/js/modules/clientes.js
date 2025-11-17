// Módulo de Gestión de Clientes
const ClientesModule = {
  currentData: null,
  editingClientId: null,
  dataTable: null,

  async init() {
    console.log('🚀 Iniciando módulo de clientes...');
    await this.loadData();
    this.setupEventListeners();
    this.renderizarInterfaz();
  },

  async loadData() {
    try {
      this.mostrarEstado('Cargando datos...', 'loading');
      const data = await DataManager.fetchData(true);
      this.currentData = data;
      this.mostrarEstado('Datos cargados', 'success');
      this.renderizarTabla(data);
    } catch (error) {
      console.error('Error cargando datos:', error);
      this.mostrarEstado('Error cargando datos', 'error');
    }
  },

  mostrarEstado(mensaje, tipo = 'info') {
    // Implementar notificación de estado
    console.log(`${tipo}: ${mensaje}`);
  },

  renderizarInterfaz() {
    const container = document.getElementById('clientes-content');
    if (!container) return;

    container.innerHTML = `
      <div class="card" data-grid="full" style="margin-bottom: 20px;">
        <h2 style="margin-top: 0; margin-bottom: 20px;" id="form-title">Nuevo Cliente</h2>
        
        <form id="form-cliente">
          <div class="form-section">
            <h3>Información Básica</h3>
            <div class="form-grid">
              <div class="form-field required">
                <label for="nombre">Nombre/Razón Social</label>
                <input type="text" id="nombre" name="nombre" required>
              </div>
              
              <div class="form-field">
                <label for="tipoCliente">Tipo de Cliente</label>
                <select id="tipoCliente" name="tipoCliente">
                  <option value="">Seleccionar...</option>
                  <option value="Empresa">Empresa</option>
                  <option value="Particular">Particular</option>
                  <option value="Organización">Organización</option>
                </select>
              </div>
              
              <div class="form-field">
                <label for="categoria">Categoría</label>
                <select id="categoria" name="categoria">
                  <option value="">Seleccionar...</option>
                  <option value="A - Premium">A - Premium</option>
                  <option value="B - Regular">B - Regular</option>
                  <option value="C - Ocasional">C - Ocasional</option>
                </select>
              </div>
              
              <div class="form-field">
                <label for="estado">Estado</label>
                <select id="estado" name="estado">
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Información de Contacto</h3>
            <div class="form-grid">
              <div class="form-field">
                <label for="email">Email</label>
                <input type="email" id="email" name="email">
              </div>
              
              <div class="form-field">
                <label for="telefono">Teléfono</label>
                <input type="text" id="telefono" name="telefono">
              </div>
              
              <div class="form-field">
                <label for="celular">Celular</label>
                <input type="text" id="celular" name="celular">
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn" id="btn-guardar">Guardar Cliente</button>
            <button type="button" class="btn secondary" id="btn-cancelar" style="display:none;">Cancelar</button>
            <button type="reset" class="btn secondary">Limpiar Formulario</button>
          </div>
        </form>
      </div>

      <div class="card" data-grid="full">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h2 style="margin: 0;">Clientes Registrados</h2>
          <div style="display: flex; gap: 8px; align-items: center;">
            <input type="text" id="buscar-cliente" placeholder="Buscar..." 
                   style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); color: var(--text); padding: 6px 10px; border-radius: 6px; min-width: 200px;">
            <select id="filtro-estado" class="btn small">
              <option value="">Todos los estados</option>
              <option value="Activo">Activos</option>
              <option value="Inactivo">Inactivos</option>
            </select>
          </div>
        </div>

        <div class="tabla-container">
          <table id="tabla-clientes" class="tabla-datos" style="width: 100%;">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre/Razón Social</th>
                <th>Tipo</th>
                <th>Categoría</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <!-- Se llenará dinámicamente -->
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.setupFormListeners();
  },

  setupFormListeners() {
    const form = document.getElementById('form-cliente');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.guardarCliente();
      });
    }

    const btnCancelar = document.getElementById('btn-cancelar');
    if (btnCancelar) {
      btnCancelar.addEventListener('click', () => {
        this.cancelarEdicion();
      });
    }

    // Filtros
    document.getElementById('filtro-estado').addEventListener('change', () => this.aplicarFiltros());
    document.getElementById('buscar-cliente').addEventListener('input', () => this.aplicarFiltros());
  },

  renderizarTabla(data) {
    const clientes = data.Clientes || [];
    const tbody = document.querySelector('#tabla-clientes tbody');
    
    if (!tbody) return;

    tbody.innerHTML = '';

    if (clientes.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--muted); padding: 20px;">No hay clientes registrados</td></tr>';
      return;
    }

    clientes.forEach(cliente => {
      const fila = document.createElement('tr');
      
      const id = cliente.ID || '';
      const nombre = cliente.Nombre || '';
      const tipo = cliente.Tipo || '';
      const categoria = cliente.Categoria || '';
      const email = cliente.Email || '';
      const telefono = cliente.Telefono || '';
      const estado = cliente.Estado || 'Activo';
      const estadoClass = estado === 'Activo' ? 'status-active' : 'status-inactive';

      fila.innerHTML = `
        <td>${id}</td>
        <td style="font-weight: 600;">${nombre}</td>
        <td>${tipo}</td>
        <td>${categoria}</td>
        <td>${email}</td>
        <td>${telefono}</td>
        <td><span class="client-status ${estadoClass}">${estado}</span></td>
        <td>
          <div class="action-buttons">
            <button class="btn small" onclick="ClientesModule.editarCliente('${id}')">Editar</button>
            <button class="btn small secondary" onclick="ClientesModule.eliminarCliente('${id}')">Eliminar</button>
          </div>
        </td>
      `;
      tbody.appendChild(fila);
    });
  },

  async guardarCliente() {
    const form = document.getElementById('form-cliente');
    const formData = new FormData(form);

    const nombre = formData.get('nombre');
    if (!nombre) {
      alert('Por favor complete el nombre del cliente.');
      return;
    }

    try {
      const cliente = {
        Nombre: nombre,
        Tipo: formData.get('tipoCliente') || '',
        Categoria: formData.get('categoria') || '',
        Estado: formData.get('estado') || 'Activo',
        Email: formData.get('email') || '',
        Telefono: formData.get('telefono') || '',
        Celular: formData.get('celular') || '',
        FechaAlta: UTILS.getCurrentDateForInput()
      };

      let resultado;
      if (this.editingClientId) {
        resultado = await DataManager.enviarDatos('Clientes', { ...cliente, ID: this.editingClientId }, 'update');
      } else {
        resultado = await DataManager.enviarDatos('Clientes', cliente, 'insert');
      }

      if (resultado.success) {
        alert('Cliente guardado correctamente');
        await this.loadData();
        this.cancelarEdicion();
      } else {
        throw new Error(resultado.error || 'Error desconocido');
      }

    } catch (error) {
      console.error('Error guardando cliente:', error);
      alert('Error al guardar el cliente: ' + error.message);
    }
  },

  editarCliente(id) {
    const clientes = this.currentData?.Clientes || [];
    const cliente = clientes.find(c => c.ID === id);
    
    if (!cliente) {
      alert('Cliente no encontrado');
      return;
    }

    // Llenar formulario
    document.getElementById('nombre').value = cliente.Nombre || '';
    document.getElementById('tipoCliente').value = cliente.Tipo || '';
    document.getElementById('categoria').value = cliente.Categoria || '';
    document.getElementById('estado').value = cliente.Estado || 'Activo';
    document.getElementById('email').value = cliente.Email || '';
    document.getElementById('telefono').value = cliente.Telefono || '';
    document.getElementById('celular').value = cliente.Celular || '';

    // Cambiar interfaz para edición
    this.editingClientId = id;
    document.getElementById('form-title').textContent = 'Editando Cliente';
    document.getElementById('btn-guardar').textContent = 'Actualizar Cliente';
    document.getElementById('btn-cancelar').style.display = 'inline-block';
  },

  cancelarEdicion() {
    this.editingClientId = null;
    document.getElementById('form-title').textContent = 'Nuevo Cliente';
    document.getElementById('btn-guardar').textContent = 'Guardar Cliente';
    document.getElementById('btn-cancelar').style.display = 'none';
    document.getElementById('form-cliente').reset();
  },

  async eliminarCliente(id) {
    if (!confirm('¿Está seguro que desea eliminar este cliente?')) {
      return;
    }

    try {
      const resultado = await DataManager.enviarDatos('Clientes', { ID: id }, 'delete');
      
      if (resultado.success) {
        alert('Cliente eliminado correctamente');
        await this.loadData();
      } else {
        throw new Error(resultado.error || 'Error desconocido');
      }
    } catch (error) {
      console.error('Error eliminando cliente:', error);
      alert('Error al eliminar el cliente: ' + error.message);
    }
  },

  aplicarFiltros() {
    // Implementar filtros en la tabla
    const filtroEstado = document.getElementById('filtro-estado').value;
    const busqueda = document.getElementById('buscar-cliente').value.toLowerCase();
    
    const filas = document.querySelectorAll('#tabla-clientes tbody tr');
    
    filas.forEach(fila => {
      const estado = fila.cells[6].textContent;
      const nombre = fila.cells[1].textContent.toLowerCase();
      
      const coincideEstado = !filtroEstado || estado === filtroEstado;
      const coincideBusqueda = !busqueda || nombre.includes(busqueda);
      
      fila.style.display = (coincideEstado && coincideBusqueda) ? '' : 'none';
    });
  },

  setupEventListeners() {
    // Event listeners generales del módulo
    console.log('Event listeners configurados para módulo de clientes');
  }
};
