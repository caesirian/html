// Componente: Resumen de Pendientes (VERSIÓN CON NOMBRES DE COLUMNAS CORRECTOS)
ComponentSystem.registrar('cuentasPendientes', {
  grid: 'full',
  html: `
    <h2>Resumen de Compromisos Pendientes</h2>
  <div style="display: flex; gap: 12px; margin-bottom: 16px;">
    <button class="btn small active" data-filter="todos">Todos</button>
    <button class="btn small secondary" data-filter="cobrar">A Cobrar</button>
    <button class="btn small secondary" data-filter="pagar">A Pagar</button>
  </div>
  <div style="width: 100%; max-height: 400px; overflow-y: auto;">
    <table id="tabla-pendientes" style="width: 100%; min-width: 1000px; border-collapse: collapse;">
      <thead>
        <tr style="background:#0d1b2a; color:#fff;">
          <th style="padding: 8px 12px;">Cliente / Proveedor</th>
          <th style="padding: 8px 12px;">Tipo</th>
          <th style="padding: 8px 12px;">Cantidad</th>
          <th style="padding: 8px 12px;">Total Pendiente</th>
          <th style="padding: 8px 12px;">Promedio</th>
          <th style="padding: 8px 12px;">Más Antiguo</th>
          <th style="padding: 8px 12px;">Más Reciente</th>
        </tr>
      </thead>
      <tbody style="background:#ffffff10; color:#e0e0e0;"></tbody>
    </table>
  </div>
  <div style="margin-top: 16px; display: flex; justify-content: space-between; align-items: center;">
    <div class="text-muted" id="resumen-totales"></div>
    <button id="btn-ver-detalle" class="btn small secondary">Ver Detalle Completo</button>
  </div>
  `,
  async render(data, element) {
    try {
      console.log('🟢 INICIANDO cuentasPendientes.render()');
      
      const hoja = data["Cuentas_Pendientes"];
      
      if(!hoja || !Array.isArray(hoja)) {
        element.querySelector('tbody').innerHTML = '<tr><td colspan="7">No se encontraron datos de cuentas pendientes</td></tr>';
        return;
      }

      console.log('🔍 Total de registros en hoja:', hoja.length);
      
      // DEBUG: Ver estructura del primer registro
      if (hoja.length > 0) {
        console.log('👀 Primer registro:', hoja[0]);
        console.log('🔑 Keys del primer registro:', Object.keys(hoja[0]));
      }

      // Filtrado usando el nombre CORRECTO de la columna
      const pendientes = hoja.filter(r => {
        const estado = r["Estado (Pendiente/Pagado)"];
        return estado && String(estado).toLowerCase().includes("pendiente");
      });
      
      console.log('✅ Total pendientes filtrados:', pendientes.length);

      if(pendientes.length === 0) {
        element.querySelector('tbody').innerHTML = '<tr><td colspan="7">No hay compromisos pendientes</td></tr>';
        element.querySelector('#resumen-totales').innerText = '';
        return;
      }

      // Procesar datos para agrupar por cliente/proveedor - USANDO NOMBRES CORRECTOS
      const resumen = {};
      
      pendientes.forEach((r, index) => {
        try {
          // USAR LOS NOMBRES CORRECTOS DE LAS COLUMNAS
          const clave = r["Cliente/Proveedor"] || "Sin nombre";
          const tipo = r["Tipo"] || ""; // COLUMNA CORRECTA: "Tipo" no "Tipo (A cobrar/A pagar)"
          const importe = UTILS.parseNumber(r["Importe"]);
          const fechaEmision = UTILS.parseDate(r["Fecha"]);
          
          console.log(`📊 Procesando ${index}: "${clave}" - Tipo: "${tipo}" - Importe: ${importe}`);
          
          if (!resumen[clave]) {
            resumen[clave] = {
              nombre: clave,
              tipo: tipo,
              cantidad: 0,
              total: 0,
              fechas: [],
              promedios: []
            };
          }
          
          resumen[clave].cantidad++;
          resumen[clave].total += importe;
          resumen[clave].fechas.push(fechaEmision);
          resumen[clave].promedios.push(importe);
        } catch (error) {
          console.error(`❌ Error procesando registro ${index}:`, error, r);
        }
      });

      console.log('📈 Resumen agrupado:', Object.keys(resumen).length, 'entidades');

      // Calcular promedios y fechas extremas
      Object.values(resumen).forEach(item => {
        try {
          item.promedio = item.cantidad > 0 ? item.total / item.cantidad : 0;
          if (item.fechas.length > 0 && item.fechas.every(d => !isNaN(d.getTime()))) {
            item.masAntiguo = new Date(Math.min(...item.fechas.map(d => d.getTime())));
            item.masReciente = new Date(Math.max(...item.fechas.map(d => d.getTime())));
          } else {
            item.masAntiguo = new Date();
            item.masReciente = new Date();
          }
        } catch (error) {
          console.error('Error calculando promedios/fechas:', error, item);
        }
      });

      // Convertir a array y ordenar por total (mayor a menor)
      const resumenArray = Object.values(resumen).sort((a, b) => b.total - a.total);

      // Renderizar tabla
      const tbody = element.querySelector('tbody');
      tbody.innerHTML = '';
      
      resumenArray.forEach(item => {
        try {
          const tipoSeguro = (item.tipo && typeof item.tipo === 'string') ? item.tipo : '';
          const tipoNormalizado = tipoSeguro.toLowerCase();
          const esCobrar = tipoNormalizado.includes('cobrar');
          const esPagar = tipoNormalizado.includes('pagar');
          const color = esCobrar ? '#28a745' : (esPagar ? '#dc3545' : '#ffc107');
          const tipoFiltro = esCobrar ? 'cobrar' : (esPagar ? 'pagar' : 'otros');
          const tipoDisplay = tipoSeguro || 'Sin tipo especificado';
          
          const fila = document.createElement('tr');
          fila.setAttribute('data-tipo', tipoFiltro);
          fila.innerHTML = `
            <td><strong>${item.nombre}</strong></td>
            <td>
              <span style="color:${color}; font-weight:600">
                ${tipoDisplay}
              </span>
            </td>
            <td style="text-align:center">${item.cantidad}</td>
            <td style="text-align:right; font-weight:700; color:${color}">
              $ ${item.total.toLocaleString("es-AR",{minimumFractionDigits:2})}
            </td>
            <td style="text-align:right">
              $ ${item.promedio.toLocaleString("es-AR",{minimumFractionDigits:2})}
            </td>
            <td>${UTILS.formatDate(item.masAntiguo)}</td>
            <td>${UTILS.formatDate(item.masReciente)}</td>
          `;
          tbody.appendChild(fila);
        } catch (error) {
          console.error('❌ Error renderizando fila:', error, item);
        }
      });

      // Calcular totales generales
      const totalCobrar = resumenArray
        .filter(item => item && (item.tipo || '').toLowerCase().includes('cobrar'))
        .reduce((sum, item) => sum + (item?.total || 0), 0);
      
      const totalPagar = resumenArray
        .filter(item => item && (item.tipo || '').toLowerCase().includes('pagar'))
        .reduce((sum, item) => sum + (item?.total || 0), 0);

      const otros = resumenArray
        .filter(item => item && !(item.tipo || '').toLowerCase().includes('cobrar') && !(item.tipo || '').toLowerCase().includes('pagar'))
        .reduce((sum, item) => sum + (item?.total || 0), 0);

      const saldoNeto = totalCobrar - totalPagar;

      console.log('💰 Totales calculados:', {
        totalCobrar,
        totalPagar, 
        otros,
        saldoNeto
      });

      // Actualizar resumen de totales
      const resumenTotales = element.querySelector('#resumen-totales');
      let totalesHTML = `
        <strong>Total a Cobrar:</strong> $ ${totalCobrar.toLocaleString("es-AR",{minimumFractionDigits:2})} | 
        <strong>Total a Pagar:</strong> $ ${totalPagar.toLocaleString("es-AR",{minimumFractionDigits:2})}`;
      
      if (otros > 0) {
        totalesHTML += ` | <strong>Otros:</strong> $ ${otros.toLocaleString("es-AR",{minimumFractionDigits:2})}`;
      }
      
      totalesHTML += ` | <strong style="color:${saldoNeto >= 0 ? '#28a745' : '#dc3545'}">
        Saldo Neto: $ ${Math.abs(saldoNeto).toLocaleString("es-AR",{minimumFractionDigits:2})} ${saldoNeto >= 0 ? 'a favor' : 'en contra'}
      </strong>`;
      
      resumenTotales.innerHTML = totalesHTML;

      // Inicializar DataTable
      this.initializeDataTable(element);
      
      this.setupDetalleButton(element, pendientes);
      
      console.log('✅ Componente cuentasPendientes renderizado correctamente');

    } catch (error) {
      console.error('💥 ERROR CRÍTICO en cuentasPendientes:', error);
      element.querySelector('tbody').innerHTML = `
        <tr>
          <td colspan="7" style="color: #dc3545; text-align: center; padding: 20px;">
            <h4>Error al cargar los datos</h4>
            <p>${error.message}</p>
            <button class="btn small" onclick="location.reload()">Reintentar</button>
          </td>
        </tr>
      `;
    }
  },

  initializeDataTable(element) {
    if (typeof $ === 'undefined' || !$.fn.DataTable) {
      console.warn('DataTables no disponible, usando tabla básica');
      this.setupFiltersBasic(element);
      return;
    }

    const table = $(element).find('#tabla-pendientes');
    
    if ($.fn.dataTable.isDataTable(table)) {
      table.DataTable().destroy();
    }
    
    const dataTable = table.DataTable({
      pageLength: 10,
      dom: 'Bfrtip',
      buttons: [{ 
        extend: 'csv', 
        text: 'Exportar CSV',
        filename: 'cuentas_pendientes_' + new Date().toISOString().split('T')[0]
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
      order: [[3, 'desc']],
      columnDefs: [
        { targets: [2,3,4], className: 'dt-body-right' },
        { targets: [0], className: 'dt-body-left' }
      ]
    });

    this.setupFilters(element, dataTable);
  },

  setupFilters(element, dataTable) {
    const filterButtons = element.querySelectorAll('[data-filter]');
    
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        filterButtons.forEach(btn => {
          btn.classList.toggle('active', btn === button);
          btn.classList.toggle('secondary', btn !== button);
        });
        
        const filter = button.getAttribute('data-filter');
        let searchValue = '';
        
        if (filter === 'cobrar') {
          searchValue = 'cobrar';
        } else if (filter === 'pagar') {
          searchValue = 'pagar';
        }
        
        dataTable.column(1).search(searchValue).draw();
      });
    });
  },

  setupFiltersBasic(element) {
    const filterButtons = element.querySelectorAll('[data-filter]');
    const filas = element.querySelectorAll('tbody tr');
    
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        filterButtons.forEach(btn => {
          btn.classList.toggle('active', btn === button);
          btn.classList.toggle('secondary', btn !== button);
        });
        
        const filter = button.getAttribute('data-filter');
        
        filas.forEach(fila => {
          const tipo = fila.getAttribute('data-tipo');
          
          if (filter === 'todos') {
            fila.style.display = '';
          } else if (filter === tipo) {
            fila.style.display = '';
          } else {
            fila.style.display = 'none';
          }
        });
      });
    });
  },

  setupDetalleButton(element, pendientesCompletos) {
    const detalleButton = element.querySelector('#btn-ver-detalle');
    
    detalleButton.addEventListener('click', () => {
      this.mostrarDetalleCompleto(pendientesCompletos);
    });
  },

  mostrarDetalleCompleto(pendientes) {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      z-index: 10000;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
      box-sizing: border-box;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: var(--card-bg, #1e1e1e);
      border-radius: 12px;
      padding: 24px;
      max-width: 95%;
      max-height: 95%;
      overflow: auto;
      width: 1200px;
      border: 1px solid var(--border-color, #333);
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    `;
    
    modalContent.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border-color, #333);">
        <h3 style="margin: 0; color: var(--accent, #3ea6ff);">Detalle Completo de Pendientes</h3>
        <button id="cerrar-modal" class="btn small" style="background: #dc3545;">Cerrar</button>
      </div>
      <div class="tabla-container" style="max-height: 70vh; overflow-y: auto;">
        <table class="tabla-datos" style="width:100%; border-collapse:collapse; font-size: 14px;">
          <thead>
            <tr style="background:#0d1b2a; color:#fff; position: sticky; top: 0;">
              <th style="padding: 12px 8px;">Fecha Emisión</th>
              <th style="padding: 12px 8px;">Tipo</th>
              <th style="padding: 12px 8px;">Cliente / Proveedor</th>
              <th style="padding: 12px 8px;">ID Relacionado</th>
              <th style="padding: 12px 8px; text-align: right;">Importe</th>
              <th style="padding: 12px 8px;">Fecha Vto</th>
              <th style="padding: 12px 8px;">Estado</th>
            </tr>
          </thead>
          <tbody style="background:#ffffff10; color:#e0e0e0;">
            ${pendientes.map(p => {
              const tipo = p["Tipo"] || ''; // COLUMNA CORRECTA
              const color = tipo.includes('cobrar') ? "#28a745" : (tipo.includes('pagar') ? "#dc3545" : "#ffc107");
              return `
              <tr>
                <td style="padding: 10px 8px;">${UTILS.formatDate(p["Fecha"])}</td> <!-- COLUMNA CORRECTA -->
                <td style="padding: 10px 8px; color:${color}; font-weight:600">${tipo || 'Sin tipo'}</td>
                <td style="padding: 10px 8px;">${p["Cliente/Proveedor"] || ""}</td>
                <td style="padding: 10px 8px;">${p["ID Relacionado"] || ""}</td>
                <td style="padding: 10px 8px; text-align: right; font-weight:600">$ ${UTILS.parseNumber(p["Importe"]).toLocaleString("es-AR",{minimumFractionDigits:2})}</td>
                <td style="padding: 10px 8px;">${UTILS.formatDate(p["Fecha Vto"])}</td>
                <td style="padding: 10px 8px;">${p["Estado (Pendiente/Pagado)"] || ""}</td>
              </tr>
            `}).join('')}
          </tbody>
        </table>
      </div>
      <div style="margin-top: 16px; text-align: center; color: var(--muted); font-size: 14px;">
        Total de registros: ${pendientes.length}
      </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    const closeModal = () => {
      document.body.removeChild(modal);
      document.removeEventListener('keydown', modal._escHandler);
    };
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    
    const cerrarBtn = modalContent.querySelector('#cerrar-modal');
    cerrarBtn.addEventListener('click', closeModal);
    
    const handleEsc = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', handleEsc);
    
    modal._escHandler = handleEsc;
  }
});
