// js/carga-datos.js - ARCHIVO COMPLETO CORREGIDO
const CargaDatosApp = {
  currentData: null,

  async init() {
    console.log('🚀 Iniciando app de carga de datos...');
    
    // Limpiar filas vacías excesivas al iniciar
    await this.limpiarFilasVacias();
    
    const estructura = await this.verificarEstructuraHoja();
    console.log('📊 Estructura verificada:', estructura);
    
    this.setupEventListeners();
    await this.loadData();
  },

  async limpiarFilasVacias() {
    try {
      console.log('🧹 Solicitando limpieza de filas vacías...');
      
      const url = CONFIG.GAS_ENDPOINT + '?action=cleanEmptyRows&sheet=Finanzas_RegistroDiario';
      const response = await fetch(url);
      const result = await response.json();
      
      console.log('✅ Resultado limpieza:', result);
      return result;
    } catch (error) {
      console.error('Error limpiando filas:', error);
      return null;
    }
  },

  async verificarEstructuraHoja() {
    try {
      console.log('🔍 Verificando estructura de la hoja...');
      
      const url = CONFIG.GAS_ENDPOINT + '?action=debugSheetStructure';
      const response = await fetch(url);
      const result = await response.json();
      
      console.log('🏗️ Estructura de la hoja:', result);
      return result;
    } catch (error) {
      console.error('Error verificando estructura:', error);
      return null;
    }
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

  mostrarEstado(mensaje, tipo) {
    const estadoElement = document.getElementById('estado');
    if (!estadoElement) return;

    var iconos = {
      loading: '<span class="loader"></span> ',
      success: '<span style="color: #28a745;">✓</span> ',
      error: '<span style="color: #dc3545;">✗</span> ',
      info: ''
    };

    estadoElement.innerHTML = (iconos[tipo] || '') + mensaje;
  },

  renderizarTabla(data) {
    var registros = data.Finanzas_RegistroDiario || data['Finanzas_RegistroDiario'] || [];
    var tbody = document.querySelector('#tabla-registros tbody');
    
    if (!tbody) return;

    tbody.innerHTML = '';

    if (registros.length === 0) {
      tbody.innerHTML = '<tr><td colspan="15" style="text-align: center; color: var(--muted); padding: 20px;">No hay registros</td></tr>';
      this.inicializarDataTable([]);
      return;
    }

    var registrosOrdenados = registros.slice().sort(function(a, b) {
      var fechaA = new Date(a.Fecha || a.Date || a.fecha);
      var fechaB = new Date(b.Fecha || b.Date || b.fecha);
      return fechaB - fechaA;
    });

    var self = this;
    registrosOrdenados.forEach(function(registro) {
      var fila = document.createElement('tr');
      
      var fecha = registro.Fecha || registro.Date || registro.fecha || '';
      var tipo = registro.Tipo || registro.tipo || '';
      var categoria = registro.Categoría || registro.Categoria || registro.categoría || '';
      var subcategoria = registro.Subcategoría || registro.Subcategoria || '';
      var monto = UTILS.parseNumber(registro.Monto || registro.monto || 0);
      var medioPago = registro['Medio de Pago'] || registro.MedioPago || '';
      var comprobante = registro.Comprobante || registro.comprobante || '';
      var descripcion = registro.Descripción || registro.Descripcion || registro.descripción || '';
      var proyecto = registro.Proyecto || registro.proyecto || '';
      var responsable = registro.Responsable || registro.responsable || '';
      var clienteProveedor = registro['Cliente/Proveedor'] || registro.ClienteProveedor || '';
      var idRelacionado = registro['ID Relacionado'] || registro.IDRelacionado || '';
      var observaciones = registro.Observaciones || registro.observaciones || '';
      var reflejarEnCaja = registro['Reflejar en Caja'] || registro.ReflejarEnCaja || '';

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
        <td title="${descripcion}">${self.acortarTexto(descripcion, 30)}</td>
        <td>${proyecto}</td>
        <td>${responsable}</td>
        <td>${clienteProveedor}</td>
        <td>${idRelacionado}</td>
        <td title="${observaciones}">${self.acortarTexto(observaciones, 30)}</td>
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
    var table = $('#tabla-registros');
    
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
        filename: 'registros_finanzas_' + new Date().toISOString().split('T')[0]
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
      order: [[0, 'desc']],
      columnDefs: [
        { targets: [7, 12], width: '200px' },
        { targets: [4], className: 'dt-body-right' },
        { targets: '_all', className: 'dt-body-left' }
      ],
      responsive: true
    });
  },

  actualizarFiltros(data) {
    var registros = data.Finanzas_RegistroDiario || data['Finanzas_RegistroDiario'] || [];
    
    var filtroMes = document.getElementById('filtro-mes');
    var meses = [];
    var mesesSet = new Set();
    
    registros.forEach(function(r) {
      var fecha = UTILS.parseDate(r.Fecha || r.Date || r.fecha);
      var mesKey = fecha.getFullYear() + '-' + String(fecha.getMonth() + 1).padStart(2, '0');
      mesesSet.add(mesKey);
    });
    
    meses = Array.from(mesesSet).sort().reverse();

    filtroMes.innerHTML = '<option value="">Todos los meses</option>';
    meses.forEach(function(mes) {
      var option = document.createElement('option');
      option.value = mes;
      option.textContent = UTILS.formatMonthKey(mes, true);
      filtroMes.appendChild(option);
    });

    var filtroCategoria = document.getElementById('filtro-categoria');
    var categorias = [];
    var categoriasSet = new Set();
    
    registros.forEach(function(r) {
      var cat = r.Categoría || r.Categoria || r.categoría;
      if (cat) categoriasSet.add(cat);
    });
    
    categorias = Array.from(categoriasSet).sort();

    filtroCategoria.innerHTML = '<option value="">Todas las categorías</option>';
    categorias.forEach(function(cat) {
      var option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      filtroCategoria.appendChild(option);
    });

    var self = this;
    filtroMes.addEventListener('change', function() { self.aplicarFiltros(); });
    document.getElementById('filtro-tipo').addEventListener('change', function() { self.aplicarFiltros(); });
    filtroCategoria.addEventListener('change', function() { self.aplicarFiltros(); });
    document.getElementById('buscar-registro').addEventListener('input', function() { self.aplicarFiltros(); });
  },

  aplicarFiltros() {
    var tabla = $('#tabla-registros').DataTable();
    if (!tabla) return;

    var filtroMes = document.getElementById('filtro-mes').value;
    var filtroTipo = document.getElementById('filtro-tipo').value;
    var filtroCategoria = document.getElementById('filtro-categoria').value;
    var busqueda = document.getElementById('buscar-registro').value;

    tabla.column(0).search(filtroMes, true, false);
    tabla.column(1).search(filtroTipo);
    tabla.column(2).search(filtroCategoria);
    tabla.search(busqueda).draw();
  },

  setupEventListeners() {
    var form = document.getElementById('form-carga');
    var self = this;
    
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      self.guardarRegistro();
    });

    var fechaInput = document.getElementById('fecha');
    if (fechaInput) {
      fechaInput.value = UTILS.getCurrentDateForInput();
    }

    var menuToggle = document.getElementById('menu-toggle');
    var sidebar = document.querySelector('.sidebar');
    var overlay = document.getElementById('sidebar-overlay');
    
    if (menuToggle && sidebar && overlay) {
      menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
      });
      
      overlay.addEventListener('click', function() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
      });
    }

    var refreshBtn = document.getElementById('refresh-data');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', function() { self.loadData(); });
    }

    var tipoSelect = document.getElementById('tipo');
    var categoriaInput = document.getElementById('categoria');
    
    tipoSelect.addEventListener('change', function() {
      if (tipoSelect.value === 'Ingreso' && !categoriaInput.value) {
        categoriaInput.value = 'Ventas';
      } else if (tipoSelect.value === 'Egreso' && !categoriaInput.value) {
        categoriaInput.value = 'Compras';
      }
    });
  },

  async guardarRegistro() {
    var form = document.getElementById('form-carga');
    var formData = new FormData(form);

    var fecha = formData.get('fecha');
    var monto = formData.get('monto');
    var tipo = formData.get('tipo');
    var categoria = formData.get('categoria');

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

      var registro = {
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
        Mes: fecha.substring(0, 7)
      };

      console.log('💾 Registro a guardar:', registro);

      var resultado = await this.enviarRegistro(registro);

      this.mostrarEstado('✓ Registro guardado exitosamente', 'success');
      
      var self = this;
      setTimeout(function() {
        alert('✅ Registro guardado correctamente en la fila: ' + (resultado.row || 'N/A'));
      }, 100);

      await this.loadData();

      form.reset();
      document.getElementById('fecha').value = UTILS.getCurrentDateForInput();

    } catch (error) {
      console.error('❌ Error guardando registro:', error);
      
      var mensajeError = 'Error al guardar el registro. ';
      
      if (error.message.includes('404') || error.message.includes('Failed to fetch')) {
        mensajeError += 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      } else if (error.message.includes('405')) {
        mensajeError += 'Método no permitido. El servidor rechazó la solicitud.';
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
      
      var datosEnvio = {
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

      Object.keys(datosEnvio).forEach(function(key) {
        if (datosEnvio[key] === '' || datosEnvio[key] === null || datosEnvio[key] === undefined) {
          delete datosEnvio[key];
        }
      });

      console.log('📨 Datos a enviar (limpios):', datosEnvio);

      var url = CONFIG.GAS_ENDPOINT + '?' + new URLSearchParams(datosEnvio);
      console.log('🔗 URL final:', url);

      var response = await fetch(url);
      console.log('📞 Respuesta HTTP:', response.status, response.statusText);

      var responseText = await response.text();
      console.log('📄 Respuesta cruda:', responseText);

      if (!response.ok) {
        throw new Error('Error HTTP ' + response.status + ': ' + response.statusText);
      }

      var result = JSON.parse(responseText);
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
    var registros = this.currentData ? 
      (this.currentData.Finanzas_RegistroDiario || this.currentData['Finanzas_RegistroDiario'] || []) : [];
    
    var registro = null;
    for (var i = 0; i < registros.length; i++) {
      if (registros[i].ID === id) {
        registro = registros[i];
        break;
      }
    }
    
    if (!registro) {
      alert('Registro no encontrado');
      return;
    }

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

    var submitBtn = document.querySelector('#form-carga button[type="submit"]');
    var originalText = submitBtn.textContent;
    var self = this;
    
    submitBtn.textContent = 'Actualizar Registro';
    submitBtn.onclick = function(e) {
      e.preventDefault();
      self.actualizarRegistro(id);
      submitBtn.textContent = originalText;
      submitBtn.onclick = null;
    };

    document.querySelector('#form-carga').scrollIntoView({ behavior: 'smooth' });
  },

  async actualizarRegistro(id) {
    alert('Funcionalidad de actualización para el registro ' + id + ' - Por implementar');
  }
};

// Agregar función auxiliar si no existe
if (typeof UTILS.getCurrentDateForInput === 'undefined') {
  UTILS.getCurrentDateForInput = function() {
    var now = new Date();
    var year = now.getFullYear();
    var month = String(now.getMonth() + 1).padStart(2, '0');
    var day = String(now.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  };
}

// Inicialización
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    CargaDatosApp.init();
  });
} else {
  CargaDatosApp.init();
}
