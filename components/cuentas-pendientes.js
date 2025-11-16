// Componente: Resumen de Pendientes (MEJORADO)
ComponentSystem.registrar('cuentasPendientes', {
  grid: 'span-6',
  html: `
    <h2>Resumen de Compromisos Pendientes</h2>
    <div style="display: flex; gap: 12px; margin-bottom: 16px;">
      <button class="btn small active" data-filter="todos">Todos</button>
      <button class="btn small secondary" data-filter="cobrar">A Cobrar</button>
      <button class="btn small secondary" data-filter="pagar">A Pagar</button>
    </div>
    <div class="tabla-container" style="max-height:400px; overflow-y:auto; margin-top:12px;">
      <table id="tabla-pendientes" class="tabla-datos" style="width:100%; border-collapse:collapse;">
        <thead>
          <tr style="background:#0d1b2a; color:#fff;">
            <th>Cliente / Proveedor</th>
            <th>Tipo</th>
            <th>Cantidad</th>
            <th>Total Pendiente</th>
            <th>Promedio</th>
            <th>Más Antiguo</th>
            <th>Más Reciente</th>
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
    const hoja = data["Cuentas_Pendientes"];
    if(!hoja || !Array.isArray(hoja)) return;

  const pendientes = hoja.filter(r => {
  const estado = r["Estado (Pendiente/Pagado)"];
  return estado && String(estado).toLowerCase().includes("pendiente");
});
    
    if(pendientes.length === 0) {
      element.querySelector('tbody').innerHTML = '<tr><td colspan="7">No hay compromisos pendientes</td></tr>';
      element.querySelector('#resumen-totales').innerText = '';
      return;
    }




    

    // Procesar datos para agrupar por cliente/proveedor
    const resumen = {};
    
    pendientes.forEach(r => {
      const clave = r["Cliente/Proveedor"] || "Sin nombre";
      const tipo = r["Tipo (A cobrar/A pagar)"];
      const importe = UTILS.parseNumber(r["Importe"]);
      const fechaEmision = UTILS.parseDate(r["Fecha Emisión"]);
      
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
    });

    // Calcular promedios y fechas extremas
    Object.values(resumen).forEach(item => {
      item.promedio = item.total / item.cantidad;
      item.masAntiguo = new Date(Math.min(...item.fechas.map(d => d.getTime())));
      item.masReciente = new Date(Math.max(...item.fechas.map(d => d.getTime())));
    });

    // Convertir a array y ordenar por total (mayor a menor)
    const resumenArray = Object.values(resumen).sort((a, b) => b.total - a.total);

    // Renderizar tabla
    const tbody = element.querySelector('tbody');
    tbody.innerHTML = '';
    
    resumenArray.forEach(item => {
      const fila = document.createElement('tr');
      fila.setAttribute('data-tipo', item.tipo.toLowerCase().includes('cobrar') ? 'cobrar' : 'pagar');
      fila.innerHTML = `
        <td><strong>${item.nombre}</strong></td>
        <td>
          <span style="color:${item.tipo.includes('cobrar') ? '#28a745' : '#dc3545'}; font-weight:600">
            ${item.tipo}
          </span>
        </td>
        <td style="text-align:center">${item.cantidad}</td>
        <td style="text-align:right; font-weight:700; color:${item.tipo.includes('cobrar') ? '#28a745' : '#dc3545'}">
          $ ${item.total.toLocaleString("es-AR",{minimumFractionDigits:2})}
        </td>
        <td style="text-align:right">
          $ ${item.promedio.toLocaleString("es-AR",{minimumFractionDigits:2})}
        </td>
        <td>${UTILS.formatDate(item.masAntiguo)}</td>
        <td>${UTILS.formatDate(item.masReciente)}</td>
      `;
      tbody.appendChild(fila);
    });

    // Calcular totales generales
    const totalCobrar = resumenArray
      .filter(item => item.tipo.includes('cobrar'))
      .reduce((sum, item) => sum + item.total, 0);
    
    const totalPagar = resumenArray
      .filter(item => item.tipo.includes('pagar'))
      .reduce((sum, item) => sum + item.total, 0);

    const saldoNeto = totalCobrar - totalPagar;

    // Actualizar resumen de totales
    const resumenTotales = element.querySelector('#resumen-totales');
    resumenTotales.innerHTML = `
      <strong>Total a Cobrar:</strong> $ ${totalCobrar.toLocaleString("es-AR",{minimumFractionDigits:2})} | 
      <strong>Total a Pagar:</strong> $ ${totalPagar.toLocaleString("es-AR",{minimumFractionDigits:2})} | 
      <strong style="color:${saldoNeto >= 0 ? '#28a745' : '#dc3545'}">
        Saldo Neto: $ ${Math.abs(saldoNeto).toLocaleString("es-AR",{minimumFractionDigits:2})} ${saldoNeto >= 0 ? 'a favor' : 'en contra'}
      </strong>
    `;

    // Inicializar DataTable
    const table = $(element).find('#tabla-pendientes');
    if($.fn.dataTable.isDataTable(table)) {
      table.DataTable().destroy();
    }
    
    const dataTable = table.DataTable({
      pageLength: 10,
      dom: 'Bfrtip',
      buttons: [{ extend: 'csv', text: 'Exportar CSV' }],
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
      order: [[3, 'desc']], // Ordenar por Total Pendiente (columna 3) descendente
      columnDefs: [
        { targets: [2,3,4], className: 'dt-body-right' },
        { targets: [0], className: 'dt-body-left' }
      ]
    });

    // Funcionalidad de filtros
    this.setupFilters(element, dataTable);
    this.setupDetalleButton(element, pendientes);
  },

  setupFilters(element, dataTable) {
    const filterButtons = element.querySelectorAll('[data-filter]');
    
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Actualizar estado activo de botones
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
        // Si es 'todos', searchValue queda vacío
        
        dataTable.column(1).search(searchValue).draw();
      });
    });
  },

  setupDetalleButton(element, pendientesCompletos) {
    const detalleButton = element.querySelector('#btn-ver-detalle');
    
    detalleButton.addEventListener('click', () => {
      // Crear ventana modal con el detalle completo
      this.mostrarDetalleCompleto(pendientesCompletos);
    });
  },

  mostrarDetalleCompleto(pendientes) {
    // Crear modal para mostrar el detalle completo
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      z-index: 1000;
      display: flex;
      justify-content: center;
      align-items: center;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: var(--card);
      border-radius: 12px;
      padding: 20px;
      max-width: 90%;
      max-height: 90%;
      overflow: auto;
      width: 1000px;
    `;
    
    modalContent.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="margin: 0; color: var(--accent);">Detalle Completo de Pendientes</h3>
        <button id="cerrar-modal" class="btn small" style="background: #dc3545;">Cerrar</button>
      </div>
      <div class="tabla-container" style="max-height: 500px; overflow-y: auto;">
        <table class="tabla-datos" style="width:100%; border-collapse:collapse;">
          <thead>
            <tr style="background:#0d1b2a; color:#fff;">
              <th>Fecha Emisión</th>
              <th>Tipo</th>
              <th>Cliente / Proveedor</th>
              <th>ID Relacionado</th>
              <th>Importe</th>
              <th>Fecha Vto</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody style="background:#ffffff10; color:#e0e0e0;">
            ${pendientes.map(p => `
              <tr>
                <td>${UTILS.formatDate(p["Fecha Emisión"])}</td>
                <td style="color:${p["Tipo (A cobrar/A pagar)"].includes("cobrar") ? "#28a745" : "#dc3545"}">
                  ${p["Tipo (A cobrar/A pagar)"]}
                </td>
                <td>${p["Cliente/Proveedor"] || ""}</td>
                <td>${p["ID Relacionado"] || ""}</td>
                <td style="text-align:right">$ ${UTILS.parseNumber(p["Importe"]).toLocaleString("es-AR",{minimumFractionDigits:2})}</td>
                <td>${UTILS.formatDate(p["Fecha Vto"])}</td>
                <td>${p["Estado (Pendiente/Pagado)"] || ""}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Cerrar modal
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
    
    const cerrarBtn = modalContent.querySelector('#cerrar-modal');
    cerrarBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
  }
});
