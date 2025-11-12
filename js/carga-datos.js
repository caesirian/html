// js/carga-datos.js
const CargaDatosApp = {
  currentData: null,

  async init() {
    console.log('🚀 Iniciando app de carga de datos...');
    this.setupEventListeners();
    await this.loadData();
  },

  async loadData() {
    try {
      console.log('📡 Cargando datos...');
      this.mostrarEstado('Cargando datos...', 'loading');

      const data = await DataManager.fetchData(true); // forzar actualización
      console.log('✅ Datos recibidos:', data);
      
      this.currentData = data;
      this.mostrarEstado('Datos actualizados', 'success');
      this.renderizarTabla(data);
      this.actualizarFiltros(data);

    } catch(error) {
      console.error('❌ Error cargando datos:', error);
      this.mostrarEstado('Error: ' + error.message, 'error');
    }
  },

  mostrarEstado(mensaje, tipo = 'info') {
    const estadoElement = document.getElementById('estado');
    if (!estadoElement) return;

    const iconos = {
      loading: '<span class="loader"></span> ',
      success: '<span style="color: #28a745;">✓</span> ',
      error: '<span style="color: #dc3545;">✗</span> ',
      info: ''
    };

    estadoElement.innerHTML = (iconos[tipo] || '') + mensaje;
  },

  renderizarTabla(data) {
    const registros = data.Finanzas_RegistroDiario || data['Finanzas_RegistroDiario'] || [];
    const tbody = document.querySelector('#tabla-registros tbody');
    
    if (!tbody) return;

    tbody.innerHTML = '';

    if (registros.length === 0) {
      tbody.innerHTML = '<tr><td colspan="15" style="text-align: center; color: var(--muted); padding: 20px;">No hay registros</td></tr>';
      this.inicializarDataTable([]);
      return;
    }

    // Ordenar por fecha (más reciente primero)
    const registrosOrdenados = [...registros].sort((a, b) => {
      return new Date(b.Fecha || b.Date || b.fecha) - new Date(a.Fecha || a.Date || a.fecha);
    });

    registrosOrdenados.forEach(registro => {
      const fila = document.createElement('tr');
      
      // Determinar valores con fallbacks para diferentes nombres de columnas
      const fecha = registro.Fecha || registro.Date || registro.fecha || '';
      const tipo = registro.Tipo || registro.tipo || '';
      const categoria = registro.Categoría || registro.Categoria || registro.categoría || '';
      const subcategoria = registro.Subcategoría || registro.Subcategoria || '';
      const monto = UTILS.parseNumber(registro.Monto || registro.monto || 0);
      const medioPago = registro['Medio de Pago'] || registro.MedioPago || '';
      const comprobante = registro.Comprobante || registro.comprobante || '';
      const descripcion = registro.Descripción || registro.Descripcion || registro.descripción || '';
      const proyecto = registro.Proyecto || registro.proyecto || '';
      const responsable = registro.Responsable || registro.responsable || '';
      const clienteProveedor = registro['Cliente/Proveedor'] || registro.ClienteProveedor || '';
      const idRelacionado = registro['ID Relacionado'] || registro.IDRelacionado || '';
      const observaciones = registro.Observaciones || registro.observaciones || '';
      const reflejarEnCaja = registro['Reflejar en Caja'] || registro.ReflejarEnCaja || '';

      fila.innerHTML = `
        <td>${UTILS.formatDate(fecha)}</td>
        <td>
          <span style="color: ${tipo === 'Ingreso' ? '#28a745' : '#dc3545'}; font-weight: 600;">
            ${tipo}
          </span>
        </td>
        <td>${categoria}</td>
        <td>${subcategoria}</td>
        <td style="text-align: right; font-weight: 600; color: ${tipo === 'Ingreso' ? '#28a745' : '#dc3545'}">
          $ ${monto.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
        </td>
        <td>${medioPago}</td>
        <td>${comprobante}</td>
        <td title="${descripcion}">${this.acortarTexto(descripcion, 30)}</td>
        <td>${proyecto}</td>
        <td>${responsable}</td>
        <td>${clienteProveedor}</td>
        <td>${idRelacionado}</td>
        <td title="${observaciones}">${this.acortarTexto(observaciones, 30)}</td>
        <td>${reflejarEnCaja ? 'Sí' : 'No'}</td>
        <td>
          <button class="btn small secondary" onclick="CargaDatosApp.editarRegistro('${registro.ID || ''}')">Editar</button>
        </td>
      `;
      tbody.appendChild(fila);
    });

    this.inicializarDataTable(registrosOrdenados);
  },

  acortarTexto(texto, longitud) {
    if (!texto) return '';
    return texto.length > longitud ? texto.substring(0, longitud) + '...' : texto;
  },

  inicializarDataTable(registros) {
    const table = $('#tabla-registros');
    
    if ($.fn.dataTable.isDataTable(table)) {
      table.DataTable().destroy();
    }

    if (registros.length === 0) return;

    table.DataTable({
      pageLength: 10,
      lengthMenu: [10, 25, 50, 100],
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
      order: [[0, 'desc']], // Ordenar por fecha descendente
      columnDefs: [
        { targets: [7, 12], width: '200px' }, // Descripción y Observaciones más anchas
        { targets: [4], className: 'dt-body-right' }, // Monto alineado a la derecha
        { targets: '_all', className: 'dt-body-left' }
      ],
      responsive: true
    });
  },

  actualizarFiltros(data) {
    const registros = data.Finanzas_RegistroDiario || data['Finanzas_RegistroDiario'] || [];
    
    // Filtro por mes
    const filtroMes = document.getElementById('filtro-mes');
    const meses = [...new Set(registros.map(r => {
      const fecha = UTILS.parseDate(r.Fecha || r.Date || r.fecha);
      return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    }))].sort().reverse();

    filtroMes.innerHTML = '<option value="">Todos los meses</option>';
    meses.forEach(mes => {
      const option = document.createElement('option');
      option.value = mes;
      option.textContent = UTILS.formatMonthKey(mes, true);
      filtroMes.appendChild(option);
    });

    // Filtro por categoría
    const filtroCategoria = document.getElementById('filtro-categoria');
    const categorias = [...new Set(registros.map(r => 
      r.Categoría || r.Categoria || r.categoría
    ).filter(Boolean))].sort();

    filtroCategoria.innerHTML = '<option value="">Todas las categorías</option>';
    categorias.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      filtroCategoria.appendChild(option);
    });

    // Aplicar filtros
    filtroMes.addEventListener('change', () => this.aplicarFiltros());
    document.getElementById('filtro-tipo').addEventListener('change', () => this.aplicarFiltros());
    filtroCategoria.addEventListener('change', () => this.aplicarFiltros());
    document.getElementById('buscar-registro').addEventListener('input', () => this.aplicarFiltros());
  },

  aplicarFiltros() {
    const tabla = $('#tabla-registros').DataTable();
    if (!tabla) return;

    const filtroMes = document.getElementById('filtro-mes').value;
    const filtroTipo = document.getElementById('filtro-tipo').value;
    const filtroCategoria = document.getElementById('filtro-categoria').value;
    const busqueda = document.getElementById('buscar-registro').value;

    // Combinar filtros
    tabla.column(0).search(filtroMes, true, false); // Filtro por mes en columna de fecha
    tabla.column(1).search(filtroTipo);
    tabla.column(2).search(filtroCategoria);
    tabla.search(busqueda).draw();
  },

  setupEventListeners() {
    // Formulario de carga
    const form = document.getElementById('form-carga');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.guardarRegistro();
    });

    // Establecer fecha actual por defecto
    const fechaInput = document.getElementById('fecha');
    if (fechaInput) {
      fechaInput.value = UTILS.getCurrentDateForInput();
    }

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

    // Auto-seleccionar categoría basada en tipo
    const tipoSelect = document.getElementById('tipo');
    const categoriaInput = document.getElementById('categoria');
    
    tipoSelect.addEventListener('change', () => {
      if (tipoSelect.value === 'Ingreso' && !categoriaInput.value) {
        categoriaInput.value = 'Ventas';
      } else if (tipoSelect.value === 'Egreso' && !categoriaInput.value) {
        categoriaInput.value = 'Compras';
      }
    });
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
      alert('Por favor complete todos los campos obligatorios (marcados con *).');
      return;
    }

    // Preparar datos para enviar
    const registro = {
      Fecha: fecha,
      Monto: parseFloat(monto),
      Tipo: tipo,
      Categoría: categoria,
      Subcategoría: formData.get('subcategoria') || '',
      'Medio de Pago': formData.get('medioPago') || '',
      Comprobante: formData.get('comprobante') || '',
      Descripción: formData.get('descripcion') || '',
      Proyecto: formData.get('proyecto') || '',
      Responsable: formData.get('responsable') || '',
      'Cliente/Proveedor': formData.get('clienteProveedor') || '',
      'ID Relacionado': formData.get('idRelacionado') || '',
      Observaciones: formData.get('observaciones') || '',
      'Reflejar en Caja': formData.get('reflejarEnCaja') === 'on' ? 'TRUE' : 'FALSE',
      Mes: fecha.substring(0, 7) // YYYY-MM
    };

    try {
      this.mostrarEstado('Guardando registro...', 'loading');

      // Enviar a Google Sheets
      await this.enviarRegistro(registro);

      this.mostrarEstado('Registro guardado exitosamente', 'success');

      // Recargar datos para mostrar el nuevo registro
      await this.loadData();

      // Limpiar formulario pero mantener fecha actual
      form.reset();
      document.getElementById('fecha').value = UTILS.getCurrentDateForInput();

    } catch (error) {
      console.error('Error guardando registro:', error);
      alert('Error al guardar el registro: ' + error.message);
      this.mostrarEstado('Error al guardar registro', 'error');
    }
  },

  async enviarRegistro(registro) {
    const endpoint = CONFIG.GAS_ENDPOINT;
    
    const params = new URLSearchParams({
      action: 'insert',
      sheet: 'Finanzas_RegistroDiario',
      ...registro
    });

    const response = await fetch(`${endpoint}?${params}`);
    if (!response.ok) {
      throw new Error('Error en la respuesta del servidor: ' + response.status);
    }

    const result = await response.json();
    if (result.success !== true) {
      throw new Error(result.error || 'Error desconocido al guardar');
    }

    return result;
  },

  editarRegistro(id) {
    // Buscar el registro en los datos actuales
    const registros = this.currentData?.Finanzas_RegistroDiario || this.currentData?.['Finanzas_RegistroDiario'] || [];
    const registro = registros.find(r => r.ID === id);
    
    if (!registro) {
      alert('Registro no encontrado');
      return;
    }

    // Llenar el formulario con los datos del registro
    document.getElementById('fecha').value = UTILS.formatDateForInput(registro.Fecha || registro.Date || registro.fecha);
    document.getElementById('tipo').value = registro.Tipo || registro.tipo || '';
    document.getElementById('categoria').value = registro.Categoría || registro.Categoria || registro.categoría || '';
    document.getElementById('subcategoria').value = registro.Subcategoría || registro.Subcategoria || '';
    document.getElementById('monto').value = UTILS.parseNumber(registro.Monto || registro.monto || 0);
    document.getElementById('medioPago').value = registro['Medio de Pago'] || registro.MedioPago || '';
    document.getElementById('comprobante').value = registro.Comprobante || registro.comprobante || '';
    document.getElementById('descripcion').value = registro.Descripción || registro.Descripcion || registro.descripción || '';
    document.getElementById('proyecto').value = registro.Proyecto || registro.proyecto || '';
    document.getElementById('responsable').value = registro.Responsable || registro.responsable || '';
    document.getElementById('clienteProveedor').value = registro['Cliente/Proveedor'] || registro.ClienteProveedor || '';
    document.getElementById('idRelacionado').value = registro['ID Relacionado'] || registro.IDRelacionado || '';
    document.getElementById('observaciones').value = registro.Observaciones || registro.observaciones || '';
    document.getElementById('reflejarEnCaja').checked = registro['Reflejar en Caja'] || registro.ReflejarEnCaja || false;

    // Cambiar el texto del botón a "Actualizar"
    const submitBtn = document.querySelector('#form-carga button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Actualizar Registro';
    submitBtn.onclick = (e) => {
      e.preventDefault();
      this.actualizarRegistro(id);
      // Restaurar el botón
      submitBtn.textContent = originalText;
      submitBtn.onclick = null;
    };

    // Scroll al formulario
    document.querySelector('#form-carga').scrollIntoView({ behavior: 'smooth' });
  },

  async actualizarRegistro(id) {
    // Implementar actualización (similar a guardar pero con ID)
    alert('Funcionalidad de actualización para el registro ' + id + ' - Por implementar');
  }
};

// Agregar función auxiliar para fecha actual si no existe en UTILS
if (typeof UTILS.getCurrentDateForInput === 'undefined') {
  UTILS.getCurrentDateForInput = function() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
}

// Inicialización
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    CargaDatosApp.init();
  });
} else {
  CargaDatosApp.init();
}
