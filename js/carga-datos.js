// js/carga-datos.js
const CargaDatosApp = {
  async init() {
    console.log('🚀 Iniciando app de carga de datos...');
    this.setupEventListeners();
    await this.loadData();
  },

  async loadData() {
    try {
      console.log('📡 Cargando datos...');
      const estadoElement = document.getElementById('estado');
      if (estadoElement) estadoElement.innerHTML = '<span class="loader"></span> Cargando datos...';

      const data = await DataManager.fetchData(true); // forzar actualización
      console.log('✅ Datos recibidos:', data);

      if (estadoElement) estadoElement.innerHTML = '<span style="color: #28a745;">✓</span> Datos actualizados';

      this.renderizarTabla(data);
      this.actualizarFiltros(data);

    } catch(error) {
      console.error('❌ Error cargando datos:', error);
      const estadoElement = document.getElementById('estado');
      if (estadoElement) estadoElement.innerHTML = '<span style="color: #dc3545;">✗</span> Error: ' + error.message;
    }
  },

  renderizarTabla(data) {
    const registros = data.Finanzas_RegistroDiario || data['Finanzas_RegistroDiario'] || [];
    const tbody = document.querySelector('#tabla-registros tbody');
    tbody.innerHTML = '';

    if (registros.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--muted);">No hay registros</td></tr>';
      return;
    }

    // Ordenar por fecha (más reciente primero)
    registros.sort((a, b) => new Date(b.Fecha) - new Date(a.Fecha));

    registros.forEach(registro => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${UTILS.formatDate(registro.Fecha)}</td>
        <td>
          <span style="color: ${registro.Tipo === 'Ingreso' ? '#28a745' : '#dc3545'}; font-weight: 600;">
            ${registro.Tipo}
          </span>
        </td>
        <td>${registro.Categoría || ''}</td>
        <td>${registro.Descripción || ''}</td>
        <td style="text-align: right; font-weight: 600; color: ${registro.Tipo === 'Ingreso' ? '#28a745' : '#dc3545'}">
          $ ${UTILS.parseNumber(registro.Monto).toLocaleString('es-AR', {minimumFractionDigits: 2})}
        </td>
        <td>${registro.ReflejarEnCaja ? 'Sí' : 'No'}</td>
        <td>
          <button class="btn small secondary" onclick="CargaDatosApp.editarRegistro('${registro.ID}')">Editar</button>
          <button class="btn small" style="background: #dc3545;" onclick="CargaDatosApp.eliminarRegistro('${registro.ID}')">Eliminar</button>
        </td>
      `;
      tbody.appendChild(fila);
    });

    // Inicializar DataTable
    this.inicializarDataTable();
  },

  inicializarDataTable() {
    const table = $('#tabla-registros');
    if ($.fn.dataTable.isDataTable(table)) {
      table.DataTable().destroy();
    }

    table.DataTable({
      pageLength: 10,
      dom: 'Bfrtip',
      buttons: [{ 
        extend: 'csv', 
        text: 'Exportar CSV',
        filename: `registros_finanzas_${new Date().toISOString().split('T')[0]}`
      }],
      language: {
        search: "Buscar:",
        lengthMenu: "Mostrar _MENU_ registros",
        info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
        paginate: {
          first: "Primero",
          last: "Último", 
          next: "Siguiente",
          previous: "Anterior"
        }
      },
      order: [[0, 'desc']] // Ordenar por fecha descendente
    });
  },

  actualizarFiltros(data) {
    const registros = data.Finanzas_RegistroDiario || data['Finanzas_RegistroDiario'] || [];
    const filtroMes = document.getElementById('filtro-mes');
    
    // Extraer meses únicos
    const meses = [...new Set(registros.map(r => {
      const fecha = UTILS.parseDate(r.Fecha);
      return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    }))].sort().reverse();

    filtroMes.innerHTML = '<option value="">Todos los meses</option>';
    meses.forEach(mes => {
      const [year, month] = mes.split('-');
      const option = document.createElement('option');
      option.value = mes;
      option.textContent = UTILS.formatMonthKey(mes, true);
      filtroMes.appendChild(option);
    });

    // Aplicar filtros
    filtroMes.addEventListener('change', () => this.aplicarFiltros());
    document.getElementById('filtro-tipo').addEventListener('change', () => this.aplicarFiltros());
    document.getElementById('buscar-registro').addEventListener('input', () => this.aplicarFiltros());
  },

  aplicarFiltros() {
    const tabla = $('#tabla-registros').DataTable();
    const filtroMes = document.getElementById('filtro-mes').value;
    const filtroTipo = document.getElementById('filtro-tipo').value;
    const busqueda = document.getElementById('buscar-registro').value;

    // Combinar filtros
    tabla.column(0).search(filtroMes, true, false); // Filtro por mes en columna de fecha
    tabla.column(1).search(filtroTipo);
    tabla.search(busqueda).draw();
  },

  setupEventListeners() {
    // Formulario de carga
    const form = document.getElementById('form-carga');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.guardarRegistro();
    });

    // Menú hamburguesa
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    if (menuToggle && sidebar && overlay) {
      menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
      });
      
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
      });
    }

    // Botón de actualizar
    const refreshBtn = document.getElementById('refresh-data');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.loadData());
    }
  },

  async guardarRegistro() {
    const form = document.getElementById('form-carga');
    const formData = new FormData(form);

    // Validar campos obligatorios
    const fecha = formData.get('fecha');
    const monto = formData.get('monto');
    const tipo = formData.get('tipo');
    const categoria = formData.get('categoria');

    if (!fecha || !monto || !tipo || !categoria) {
      alert('Por favor complete todos los campos obligatorios.');
      return;
    }

    // Preparar datos para enviar
    const registro = {
      Fecha: fecha,
      Monto: parseFloat(monto),
      Tipo: tipo,
      Categoría: categoria,
      Descripción: formData.get('descripcion') || '',
      ReflejarEnCaja: formData.get('reflejarEnCaja') === 'on'
    };

    try {
      const estadoElement = document.getElementById('estado');
      if (estadoElement) estadoElement.innerHTML = '<span class="loader"></span> Guardando...';

      // Enviar a Google Sheets
      await this.enviarRegistro(registro);

      if (estadoElement) estadoElement.innerHTML = '<span style="color: #28a745;">✓</span> Registro guardado';

      // Recargar datos
      await this.loadData();

      // Limpiar formulario
      form.reset();

    } catch (error) {
      console.error('Error guardando registro:', error);
      alert('Error al guardar el registro: ' + error.message);
      const estadoElement = document.getElementById('estado');
      if (estadoElement) estadoElement.innerHTML = '<span style="color: #dc3545;">✗</span> Error al guardar';
    }
  },

  async enviarRegistro(registro) {
    // Usar el mismo endpoint de GAS pero con parámetros de inserción
    const endpoint = CONFIG.GAS_ENDPOINT;
    
    const params = new URLSearchParams({
      action: 'insert',
      sheet: 'Finanzas_RegistroDiario',
      ...registro
    });

    const response = await fetch(`${endpoint}?${params}`);
    if (!response.ok) {
      throw new Error('Error en la respuesta del servidor');
    }

    const result = await response.json();
    if (result.success !== true) {
      throw new Error(result.error || 'Error desconocido');
    }

    return result;
  },

  editarRegistro(id) {
    // Implementar edición (similar a guardar pero con ID)
    alert('Editar registro ' + id);
  },

  eliminarRegistro(id) {
    if (confirm('¿Está seguro de eliminar este registro?')) {
      // Implementar eliminación
      alert('Eliminar registro ' + id);
    }
  }
};

// Inicialización
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    CargaDatosApp.init();
  });
} else {
  CargaDatosApp.init();
}
