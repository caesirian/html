// js/carga-datos.js - VERSIÓN CORREGIDA
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

      const data = await DataManager.fetchData(true);
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
    const registros = data.Finanzas_RegistroDiario || [];
    const tbody = document.querySelector('#tabla-registros tbody');
    
    if (!tbody) return;

    tbody.innerHTML = '';

    if (registros.length === 0) {
      tbody.innerHTML = '<tr><td colspan="15" style="text-align: center; color: var(--muted); padding: 20px;">No hay registros</td></tr>';
      this.inicializarDataTable([]);
      return;
    }

    // Ordenar por fecha descendente (más recientes primero)
    const registrosOrdenados = [...registros].sort((a, b) => {
      const fechaA = UTILS.parseDate(a.Fecha);
      const fechaB = UTILS.parseDate(b.Fecha);
      return fechaB - fechaA; // Más reciente primero
    });

    registrosOrdenados.forEach(registro => {
      const fila = document.createElement('tr');
      
      const fecha = registro.Fecha || '';
      const tipo = registro.Tipo || '';
      const categoria = registro.Categoría || '';
      const subcategoria = registro.Subcategoría || '';
      const monto = UTILS.parseNumber(registro.Monto || 0);
      const medioPago = registro['Medio de Pago'] || '';
      const comprobante = registro.Comprobante || '';
      const descripcion = registro.Descripción || '';
      const proyecto = registro.Proyecto || '';
      const responsable = registro.Responsable || '';
      const clienteProveedor = registro['Cliente/Proveedor'] || '';
      const idRelacionado = registro['ID Relacionado'] || '';
      const observaciones = registro.Observaciones || '';
      const reflejarEnCaja = registro['Reflejar en Caja'] || '';

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
      order: [[0, 'desc']], // Ordenar por fecha descendente
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
      columnDefs: [
        { targets: [7, 12], width: '200px' },
        { targets: [4], className: 'dt-body-right' },
        { targets: '_all', className: 'dt-body-left' }
      ],
      responsive: true
    });
  },

  actualizarFiltros(data) {
    const registros = data.Finanzas_RegistroDiario || [];
    
    const filtroMes = document.getElementById('filtro-mes');
    const meses = [...new Set(registros.map(r => {
      const fecha = UTILS.parseDate(r.Fecha);
      return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    }))].sort().reverse();

    filtroMes.innerHTML = '<option value="">Todos los meses</option>';
    meses.forEach(mes => {
      const option = document.createElement('option');
      option.value = mes;
      option.textContent = UTILS.formatMonthKey(mes, true);
      filtroMes.appendChild(option);
    });

    const filtroCategoria = document.getElementById('filtro-categoria');
    const categorias = [...new Set(registros.map(r => r.Categoría).filter(Boolean))].sort();

    filtroCategoria.innerHTML = '<option value="">Todas las categorías</option>';
    categorias.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      filtroCategoria.appendChild(option);
    });

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

    tabla.column(0).search(filtroMes, true, false);
    tabla.column(1).search(filtroTipo);
    tabla.column(2).search(filtroCategoria);
    tabla.search(busqueda).draw();
  },

  setupEventListeners() {
    const form = document.getElementById('form-carga');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.guardarRegistro();
    });

    const fechaInput = document.getElementById('fecha');
    if (fechaInput) {
      fechaInput.value = UTILS.getCurrentDateForInput();
    }

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

    const refreshBtn = document.getElementById('refresh-data');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.loadData());
    }

    const tipoSelect = document.getElementById('tipo');
    const categoriaInput = document.getElementById('categoria');
    
    if (tipoSelect && categoriaInput) {
      tipoSelect.addEventListener('change', () => {
        if (tipoSelect.value === 'Ingreso' && !categoriaInput.value) {
          categoriaInput.value = 'Ventas';
        } else if (tipoSelect.value === 'Egreso' && !categoriaInput.value) {
          categoriaInput.value = 'Compras';
        }
      });
    }
  },

  async guardarRegistro() {
    const form = document.getElementById('form-carga');
    const formData = new FormData(form);

    const fecha = formData.get('fecha');
    const monto = formData.get('monto');
    const tipo = formData.get('tipo');
    const categoria = formData.get('categoria');

    if (!fecha || !monto || !tipo || !categoria) {
      alert('Por favor complete todos los campos obligatorios (marcados con *).');
      return;
    }

    if (parseFloat(monto) <= 0) {
      alert('El monto debe ser mayor a 0.');
      return;
    }

    try {
      this.mostrarEstado('Guardando registro...', 'loading');

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

      console.log('💾 Registro a guardar:', registro);

      const resultado = await this.enviarRegistro(registro);

      this.mostrarEstado('✓ Registro guardado exitosamente', 'success');
      
      // Esperar un momento antes de recargar para evitar Too Many Requests
      setTimeout(() => {
        alert('✅ Registro guardado correctamente en la fila: ' + (resultado.row || 'N/A'));
        this.loadData(); // Recargar datos
      }, 2000);

      form.reset();
      document.getElementById('fecha').value = UTILS.getCurrentDateForInput();

    } catch (error) {
      console.error('❌ Error guardando registro:', error);
      
      let mensajeError = 'Error al guardar el registro. ';
      
      if (error.message.includes('429')) {
        mensajeError += 'Demasiadas solicitudes. Espere unos segundos e intente nuevamente.';
      } else if (error.message.includes('404') || error.message.includes('Failed to fetch')) {
        mensajeError += 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      } else {
        mensajeError += error.message;
      }
      
      alert(mensajeError);
      this.mostrarEstado('✗ Error al guardar', 'error');
    }
  },

  async enviarRegistro(registro) {
    try {
      console.log('📤 PREPARANDO ENVÍO DE REGISTRO:', registro);
      
      const datosEnvio = {
        action: 'insert',
        sheet: 'Finanzas_RegistroDiario',
        Fecha: registro.Fecha,
        Monto: registro.Monto.toString(),
        Tipo: registro.Tipo,
        Categoría: registro.Categoría,
        Subcategoría: registro.Subcategoría,
        MediodePago: registro['Medio de Pago'],
        Comprobante: registro.Comprobante,
        Descripción: registro.Descripción,
        Proyecto: registro.Proyecto,
        Responsable: registro.Responsable,
        ClienteProveedor: registro['Cliente/Proveedor'],
        IDRelacionado: registro['ID Relacionado'],
        Observaciones: registro.Observaciones,
        ReflejarenCaja: registro['Reflejar en Caja'],
        Mes: registro.Mes
      };

      // Limpiar campos vacíos
      Object.keys(datosEnvio).forEach(key => {
        if (datosEnvio[key] === '' || datosEnvio[key] === null || datosEnvio[key] === undefined) {
          delete datosEnvio[key];
        }
      });

      console.log('📨 Datos a enviar (limpios):', datosEnvio);

      const url = CONFIG.GAS_ENDPOINT + '?' + new URLSearchParams(datosEnvio);
      console.log('🔗 URL final:', url);

      const response = await fetch(url);
      console.log('📞 Respuesta HTTP:', response.status, response.statusText);

      const responseText = await response.text();
      console.log('📄 Respuesta cruda:', responseText);

      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
      }

      const result = JSON.parse(responseText);
      console.log('✅ Resultado parseado:', result);

      if (!result.success) {
        throw new Error(result.error || 'Error desconocido del servidor');
      }

      return result;

    } catch (error) {
      console.error('❌ ERROR EN ENVIAR REGISTRO:', error);
      throw error;
    }
  },

  editarRegistro(id) {
    const registros = this.currentData?.Finanzas_RegistroDiario || [];
    const registro = registros.find(r => r.ID === id);
    
    if (!registro) {
      alert('Registro no encontrado');
      return;
    }

    document.getElementById('fecha').value = UTILS.formatDateForInput(registro.Fecha);
    document.getElementById('tipo').value = registro.Tipo || '';
    document.getElementById('categoria').value = registro.Categoría || '';
    document.getElementById('subcategoria').value = registro.Subcategoría || '';
    document.getElementById('monto').value = UTILS.parseNumber(registro.Monto || 0);
    document.getElementById('medioPago').value = registro['Medio de Pago'] || '';
    document.getElementById('comprobante').value = registro.Comprobante || '';
    document.getElementById('descripcion').value = registro.Descripción || '';
    document.getElementById('proyecto').value = registro.Proyecto || '';
    document.getElementById('responsable').value = registro.Responsable || '';
    document.getElementById('clienteProveedor').value = registro['Cliente/Proveedor'] || '';
    document.getElementById('idRelacionado').value = registro['ID Relacionado'] || '';
    document.getElementById('observaciones').value = registro.Observaciones || '';
    document.getElementById('reflejarEnCaja').checked = registro['Reflejar en Caja'] === 'TRUE';

    const submitBtn = document.querySelector('#form-carga button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Actualizar Registro';
    submitBtn.onclick = (e) => {
      e.preventDefault();
      this.actualizarRegistro(id);
      submitBtn.textContent = originalText;
      submitBtn.onclick = null;
    };

    document.querySelector('#form-carga').scrollIntoView({ behavior: 'smooth' });
  },

  async actualizarRegistro(id) {
    alert('Funcionalidad de actualización para el registro ' + id + ' - Por implementar');
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
