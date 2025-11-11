  // ====== COMPONENTE DE CONTROL DE STOCK ======
ComponentSystem.registrar('controlStock', {
  grid: 'span-6,
  html: `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
      <h2 style="margin: 0;">Control de Stock</h2>
      <div style="display: flex; gap: 8px; align-items: center;">
        <button class="btn small active" data-filter="todos">Todos</button>
        <button class="btn small secondary" data-filter="critico">Stock Crítico</button>
        <button class="btn small secondary" data-filter="bajo">Stock Bajo</button>
        <button class="btn small secondary" data-filter="optimo">Stock Óptimo</button>
      </div>
    </div>

    <!-- Métricas Principales -->
    <div class="dashboard-grid" style="margin-bottom: 20px; grid-template-columns: repeat(12, 1fr);">
      <div class="card" data-grid="span-3">
        <h2>Tasa de Efectividad</h2>
        <div id="tasa-efectividad" class="kpi-grande" style="color: #28a745;">--%</div>
        <div class="text-muted">Productos con stock óptimo</div>
      </div>
      
      <div class="card" data-grid="span-3">
        <h2>Productos Críticos</h2>
        <div id="productos-criticos" class="kpi-grande" style="color: #dc3545;">--</div>
        <div class="text-muted">Debajo del mínimo</div>
      </div>
      
      <div class="card" data-grid="span-3">
        <h2>Stock Bajo</h2>
        <div id="productos-bajos" class="kpi-grande" style="color: #ffc107;">--</div>
        <div class="text-muted">Entre mínimo y deseado</div>
      </div>
      
      <div class="card" data-grid="span-3">
        <h2>Valor Total Stock</h2>
        <div id="valor-total-stock" class="kpi-grande" style="color: #3ea6ff;">--</div>
        <div class="text-muted">Valorización actual</div>
      </div>
    </div>

    <!-- Gráfico de Distribución -->
    <div class="card" data-grid="span-6">
      <h2>Distribución de Stock por Estado</h2>
      <div class="chart-container-medium">
        <canvas id="grafico-distribucion-stock"></canvas>
      </div>
    </div>

    <!-- Top Productos Críticos -->
    <div class="card" data-grid="span-6">
      <h2>Productos con Stock Más Bajo</h2>
      <div class="chart-container-medium">
        <canvas id="grafico-productos-criticos"></canvas>
      </div>
    </div>

    <!-- Tabla de Stock -->
    <div class="card" data-grid="full">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="margin: 0;">Detalle de Stock por Producto</h3>
        <button id="btn-export-stock" class="btn small">Exportar CSV</button>
      </div>
      
      <div style="margin-bottom: 12px; display: flex; gap: 8px; flex-wrap: wrap;">
        <input type="text" id="buscar-producto" placeholder="Buscar producto..." 
               style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); 
                      color: var(--text); padding: 6px 10px; border-radius: 6px; flex: 1; min-width: 200px;">
        <select id="filtro-categoria" class="btn small" style="appearance: none; padding-right: 28px;">
          <option value="">Todas las categorías</option>
        </select>
      </div>
      
      <div class="tabla-container" style="max-height: 400px; overflow-y: auto;">
        <table id="tabla-stock" class="tabla-datos" style="width: 100%;">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Stock Actual</th>
              <th>Stock Mínimo</th>
              <th>Stock Deseado</th>
              <th>Estado</th>
              <th>% Completado</th>
              <th>Valor Total</th>
              <th>Último Movimiento</th>
            </tr>
          </thead>
          <tbody>
            <!-- Los datos se llenarán dinámicamente -->
          </tbody>
        </table>
      </div>
      
      <div style="margin-top: 12px; display: flex; justify-content: space-between; align-items: center;">
        <div class="text-muted" id="resumen-stock"></div>
        <div style="display: flex; gap: 8px;">
          <button id="btn-ver-movimientos" class="btn small secondary">Ver Movimientos</button>
        </div>
      </div>
    </div>
  `,
  async render(data, element) {
    try {
      // Obtener datos de inventario
      const inventarioData = data.Inventario_RegistroDiario || data['Inventario_RegistroDiario'] || [];
      
      if (inventarioData.length === 0) {
        this.mostrarEstadoSinDatos(element);
        return;
      }

      // Procesar datos de stock
      const stockData = this.procesarDatosStock(inventarioData);
      
      // Renderizar componentes
      this.renderizarMetricas(element, stockData);
      this.renderizarGraficos(element, stockData);
      this.renderizarTabla(element, stockData);
      this.setupEventListeners(element, stockData);
      
    } catch (error) {
      console.error('Error en componente controlStock:', error);
      this.mostrarError(element, error);
    }
  },

  procesarDatosStock(inventarioData) {
    const productos = {};
    const movimientosPorProducto = {};
    
    // Procesar cada movimiento para calcular stock actual
    inventarioData.forEach(movimiento => {
      const idProducto = movimiento['ID Producto'] || movimiento['ID_Producto'] || movimiento.Producto;
      const producto = movimiento.Producto || 'Sin nombre';
      const categoria = movimiento.Categoría || movimiento.Categoria || 'Sin categoría';
      const tipo = movimiento.Tipo || 'Alta'; // Alta, Baja, Ajuste
      const cantidad = UTILS.parseNumber(movimiento.Cantidad) || 0;
      const costoUnitario = UTILS.parseNumber(movimiento['Costo Unitario'] || movimiento.Costo_Unitario) || 0;
      const fecha = UTILS.parseDate(movimiento.Fecha || movimiento.Date);
      const stockMinimo = UTILS.parseNumber(movimiento['Stock mínimo'] || movimiento.Stock_minimo);
      const stockDeseado = UTILS.parseNumber(movimiento['Stock deseado'] || movimiento.Stock_deseado);
      
      if (!productos[idProducto]) {
        productos[idProducto] = {
          id: idProducto,
          nombre: producto,
          categoria: categoria,
          stockActual: 0,
          stockMinimo: stockMinimo > 0 ? stockMinimo : 20, // Valor por defecto
          stockDeseado: stockDeseado > 0 ? stockDeseado : 200, // Valor por defecto
          valorTotal: 0,
          ultimoMovimiento: fecha,
          movimientos: []
        };
      }
      
      // Actualizar stock según tipo de movimiento
      if (tipo.toLowerCase() === 'alta' || tipo.toLowerCase() === 'ajuste' && cantidad > 0) {
        productos[idProducto].stockActual += cantidad;
      } else if (tipo.toLowerCase() === 'baja' || tipo.toLowerCase() === 'ajuste' && cantidad < 0) {
        productos[idProducto].stockActual -= Math.abs(cantidad);
      }
      
      // Actualizar valor total (usando el último costo unitario)
      if (costoUnitario > 0) {
        productos[idProducto].valorTotal = productos[idProducto].stockActual * costoUnitario;
      }
      
      // Actualizar última fecha
      if (fecha > productos[idProducto].ultimoMovimiento) {
        productos[idProducto].ultimoMovimiento = fecha;
      }
      
      // Guardar movimiento
      productos[idProducto].movimientos.push({
        tipo,
        cantidad,
        fecha,
        motivo: movimiento.Motivo || '',
        responsable: movimiento.Responsable || ''
      });
    });
    
    // Calcular estados y métricas
    const productosArray = Object.values(productos);
    let productosCriticos = 0;
    let productosBajos = 0;
    let productosOptimos = 0;
    let valorTotalStock = 0;
    
    productosArray.forEach(producto => {
      valorTotalStock += producto.valorTotal;
      
      // Determinar estado del producto
      if (producto.stockActual <= producto.stockMinimo) {
        producto.estado = 'crítico';
        producto.estadoColor = '#dc3545';
        productosCriticos++;
      } else if (producto.stockActual <= producto.stockDeseado) {
        producto.estado = 'bajo';
        producto.estadoColor = '#ffc107';
        productosBajos++;
      } else {
        producto.estado = 'óptimo';
        producto.estadoColor = '#28a745';
        productosOptimos++;
      }
      
      // Calcular porcentaje completado (hacia stock deseado)
      producto.porcentajeCompletado = producto.stockDeseado > 0 
        ? Math.min(100, (producto.stockActual / producto.stockDeseado) * 100) 
        : 0;
    });
    
    // Ordenar productos por stock actual (ascendente para los más críticos)
    productosArray.sort((a, b) => a.stockActual - b.stockActual);
    
    return {
      productos: productosArray,
      metricas: {
        totalProductos: productosArray.length,
        productosCriticos,
        productosBajos,
        productosOptimos,
        tasaEfectividad: productosArray.length > 0 ? (productosOptimos / productosArray.length * 100) : 0,
        valorTotalStock
      }
    };
  },

  renderizarMetricas(element, stockData) {
    const { metricas } = stockData;
    
    // Actualizar KPIs
    element.querySelector('#tasa-efectividad').textContent = `${metricas.tasaEfectividad.toFixed(1)}%`;
    element.querySelector('#productos-criticos').textContent = metricas.productosCriticos;
    element.querySelector('#productos-bajos').textContent = metricas.productosBajos;
    element.querySelector('#valor-total-stock').textContent = UTILS.formatCurrency(metricas.valorTotalStock);
    
    // Colores según valores
    const tasaElement = element.querySelector('#tasa-efectividad');
    if (metricas.tasaEfectividad >= 70) {
      tasaElement.style.color = '#28a745';
    } else if (metricas.tasaEfectividad >= 40) {
      tasaElement.style.color = '#ffc107';
    } else {
      tasaElement.style.color = '#dc3545';
    }
  },

  renderizarGraficos(element, stockData) {
    this.renderizarGraficoDistribucion(element, stockData);
    this.renderizarGraficoProductosCriticos(element, stockData);
  },

  renderizarGraficoDistribucion(element, stockData) {
    const { metricas } = stockData;
    const canvas = element.querySelector('#grafico-distribucion-stock');
    const ctx = canvas.getContext('2d');
    
    // Destruir gráfico anterior si existe
    if (window.chartDistribucionStock) {
      window.chartDistribucionStock.destroy();
    }
    
    window.chartDistribucionStock = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Crítico', 'Bajo', 'Óptimo'],
        datasets: [{
          data: [metricas.productosCriticos, metricas.productosBajos, metricas.productosOptimos],
          backgroundColor: [
            '#dc3545',
            '#ffc107', 
            '#28a745'
          ],
          borderColor: [
            '#c82333',
            '#e0a800',
            '#218838'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#cbdff3',
              padding: 15
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} productos (${percentage}%)`;
              }
            }
          }
        },
        cutout: '60%'
      }
    });
  },

  renderizarGraficoProductosCriticos(element, stockData) {
    // Tomar los 10 productos con menor stock
    const productosCriticos = stockData.productos
      .filter(p => p.estado === 'crítico')
      .slice(0, 10);
    
    const canvas = element.querySelector('#grafico-productos-criticos');
    const ctx = canvas.getContext('2d');
    
    if (window.chartProductosCriticos) {
      window.chartProductosCriticos.destroy();
    }
    
    if (productosCriticos.length === 0) {
      // Mostrar mensaje si no hay productos críticos
      ctx.fillStyle = '#9aa8ba';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('No hay productos con stock crítico', canvas.width / 2, canvas.height / 2);
      return;
    }
    
    window.chartProductosCriticos = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: productosCriticos.map(p => {
          // Acortar nombres largos
          return p.nombre.length > 15 ? p.nombre.substring(0, 15) + '...' : p.nombre;
        }),
        datasets: [{
          label: 'Stock Actual',
          data: productosCriticos.map(p => p.stockActual),
          backgroundColor: productosCriticos.map(p => p.estadoColor),
          borderColor: productosCriticos.map(p => p.estadoColor.replace('0.8', '1')),
          borderWidth: 1
        }, {
          label: 'Stock Mínimo',
          data: productosCriticos.map(p => p.stockMinimo),
          type: 'line',
          borderColor: '#dc3545',
          borderWidth: 2,
          pointBackgroundColor: '#dc3545',
          fill: false,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#cbdff3'
            }
          },
          tooltip: {
            callbacks: {
              afterLabel: function(context) {
                const producto = productosCriticos[context.dataIndex];
                return `Mínimo: ${producto.stockMinimo} | Deseado: ${producto.stockDeseado}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#cbdff3'
            },
            grid: {
              color: 'rgba(255,255,255,0.05)'
            }
          },
          x: {
            ticks: {
              color: '#cbdff3',
              maxRotation: 45,
              minRotation: 45
            },
            grid: {
              display: false
            }
          }
        }
      }
    });
  },

  renderizarTabla(element, stockData) {
    const tbody = element.querySelector('#tabla-stock tbody');
    const resumenElement = element.querySelector('#resumen-stock');
    
    // Actualizar resumen
    resumenElement.textContent = `Mostrando ${stockData.productos.length} productos`;
    
    // Limpiar tabla
    tbody.innerHTML = '';
    
    // Llenar tabla
    stockData.productos.forEach(producto => {
      const fila = document.createElement('tr');
      fila.setAttribute('data-estado', producto.estado);
      fila.setAttribute('data-categoria', producto.categoria);
      
      fila.innerHTML = `
        <td><strong>${producto.nombre}</strong></td>
        <td>${producto.categoria}</td>
        <td style="text-align: center; font-weight: 700; color: ${producto.estadoColor}">
          ${producto.stockActual}
        </td>
        <td style="text-align: center">${producto.stockMinimo}</td>
        <td style="text-align: center">${producto.stockDeseado}</td>
        <td>
          <span style="color: ${producto.estadoColor}; font-weight: 600">
            ${producto.estado.toUpperCase()}
          </span>
        </td>
        <td>
          <div style="background: rgba(255,255,255,0.1); border-radius: 4px; height: 8px; margin: 4px 0;">
            <div style="background: ${producto.estadoColor}; height: 100%; border-radius: 4px; width: ${producto.porcentajeCompletado}%"></div>
          </div>
          <div style="font-size: 11px; text-align: center; color: ${producto.estadoColor}">
            ${producto.porcentajeCompletado.toFixed(1)}%
          </div>
        </td>
        <td style="text-align: right">${UTILS.formatCurrency(producto.valorTotal)}</td>
        <td>${UTILS.formatDate(producto.ultimoMovimiento)}</td>
      `;
      
      tbody.appendChild(fila);
    });
    
    // Inicializar DataTable
    this.inicializarDataTable(element);
    
    // Llenar filtro de categorías
    this.actualizarFiltroCategorias(element, stockData);
  },

  inicializarDataTable(element) {
    const table = $(element).find('#tabla-stock');
    
    if ($.fn.dataTable.isDataTable(table)) {
      table.DataTable().destroy();
    }
    
    const dataTable = table.DataTable({
      pageLength: 10,
      dom: 'Bfrtip',
      buttons: [{ 
        extend: 'csv', 
        text: 'Exportar CSV',
        filename: `stock_${new Date().toISOString().split('T')[0]}`
      }],
      language: {
        search: "Buscar:",
        lengthMenu: "Mostrar _MENU_ registros",
        info: "Mostrando _START_ a _END_ de _TOTAL_ productos",
        paginate: {
          first: "Primero",
          last: "Último", 
          next: "Siguiente",
          previous: "Anterior"
        }
      },
      order: [[2, 'asc']], // Ordenar por stock actual (más bajo primero)
      columnDefs: [
        { targets: [2, 3, 4, 7], className: 'dt-body-right' },
        { targets: [0, 1], className: 'dt-body-left' }
      ]
    });
    
    // Guardar referencia para filtros
    element._dataTable = dataTable;
  },

  actualizarFiltroCategorias(element, stockData) {
    const categorias = [...new Set(stockData.productos.map(p => p.categoria))].sort();
    const filtroSelect = element.querySelector('#filtro-categoria');
    
    // Mantener la opción "Todas las categorías"
    filtroSelect.innerHTML = '<option value="">Todas las categorías</option>';
    
    categorias.forEach(categoria => {
      const option = document.createElement('option');
      option.value = categoria;
      option.textContent = categoria;
      filtroSelect.appendChild(option);
    });
  },

  setupEventListeners(element, stockData) {
    this.setupFiltros(element);
    this.setupBotones(element, stockData);
  },

  setupFiltros(element) {
    const filtroEstado = element.querySelectorAll('[data-filter]');
    const busquedaInput = element.querySelector('#buscar-producto');
    const filtroCategoria = element.querySelector('#filtro-categoria');
    const dataTable = element._dataTable;
    
    if (!dataTable) return;
    
    // Filtro por estado
    filtroEstado.forEach(btn => {
      btn.addEventListener('click', () => {
        // Actualizar estado activo de botones
        filtroEstado.forEach(b => {
          b.classList.toggle('active', b === btn);
          b.classList.toggle('secondary', b !== btn);
        });
        
        const estado = btn.getAttribute('data-filter');
        if (estado === 'todos') {
          dataTable.column(5).search('').draw();
        } else {
          dataTable.column(5).search(estado).draw();
        }
      });
    });
    
    // Búsqueda en tiempo real
    busquedaInput.addEventListener('input', () => {
      dataTable.search(busquedaInput.value).draw();
    });
    
    // Filtro por categoría
    filtroCategoria.addEventListener('change', () => {
      const categoria = filtroCategoria.value;
      dataTable.column(1).search(categoria).draw();
    });
  },

  setupBotones(element, stockData) {
    const btnExport = element.querySelector('#btn-export-stock');
    const btnMovimientos = element.querySelector('#btn-ver-movimientos');
    
    btnExport.addEventListener('click', () => {
      this.exportarDatosStock(stockData);
    });
    
    btnMovimientos.addEventListener('click', () => {
      this.mostrarMovimientosCompletos(stockData);
    });
  },

  exportarDatosStock(stockData) {
    let csv = 'Producto,Categoría,Stock Actual,Stock Mínimo,Stock Deseado,Estado,Porcentaje Completado,Valor Total,Último Movimiento\n';
    
    stockData.productos.forEach(producto => {
      csv += `"${producto.nombre}","${producto.categoria}",${producto.stockActual},${producto.stockMinimo},${producto.stockDeseado},"${producto.estado}",${producto.porcentajeCompletado.toFixed(1)}%,${producto.valorTotal},"${UTILS.formatDate(producto.ultimoMovimiento)}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `control_stock_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },

  mostrarMovimientosCompletos(stockData) {
    // Crear modal con todos los movimientos
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
      max-width: 95%;
      max-height: 90%;
      overflow: auto;
      width: 1200px;
    `;
    
    let movimientosHTML = '';
    stockData.productos.forEach(producto => {
      movimientosHTML += `
        <div style="margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 15px;">
          <h4 style="margin: 0 0 10px 0; color: var(--accent);">${producto.nombre} (${producto.categoria})</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 10px;">
            <div><strong>Stock Actual:</strong> ${producto.stockActual}</div>
            <div><strong>Stock Mínimo:</strong> ${producto.stockMinimo}</div>
            <div><strong>Stock Deseado:</strong> ${producto.stockDeseado}</div>
            <div><strong>Estado:</strong> <span style="color: ${producto.estadoColor}">${producto.estado.toUpperCase()}</span></div>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background: #0d1b2a;">
                <th style="padding: 8px; text-align: left;">Fecha</th>
                <th style="padding: 8px; text-align: left;">Tipo</th>
                <th style="padding: 8px; text-align: right;">Cantidad</th>
                <th style="padding: 8px; text-align: left;">Motivo</th>
                <th style="padding: 8px; text-align: left;">Responsable</th>
              </tr>
            </thead>
            <tbody>
              ${producto.movimientos.map(mov => `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                  <td style="padding: 6px 8px;">${UTILS.formatDate(mov.fecha)}</td>
                  <td style="padding: 6px 8px;">${mov.tipo}</td>
                  <td style="padding: 6px 8px; text-align: right; color: ${mov.tipo.toLowerCase() === 'alta' ? '#28a745' : '#dc3545'}">
                    ${mov.tipo.toLowerCase() === 'alta' ? '+' : '-'}${Math.abs(mov.cantidad)}
                  </td>
                  <td style="padding: 6px 8px;">${mov.motivo}</td>
                  <td style="padding: 6px 8px;">${mov.responsable}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    });
    
    modalContent.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="margin: 0; color: var(--accent);">Movimientos Completos de Stock</h3>
        <button id="cerrar-modal-movimientos" class="btn" style="background: #dc3545;">Cerrar</button>
      </div>
      <div style="max-height: 600px; overflow-y: auto;">
        ${movimientosHTML}
      </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Cerrar modal
    const cerrarBtn = modalContent.querySelector('#cerrar-modal-movimientos');
    cerrarBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  },

  mostrarEstadoSinDatos(element) {
    element.innerHTML = `
      <div class="card" data-grid="full">
        <div style="text-align: center; padding: 40px; color: var(--muted);">
          <h3>No hay datos de inventario disponibles</h3>
          <p>La pestaña "Inventario_RegistroDiario" no contiene datos o no existe.</p>
        </div>
      </div>
    `;
  },

  mostrarError(element, error) {
    element.innerHTML = `
      <div class="card" data-grid="full">
        <div style="text-align: center; padding: 40px; color: #dc3545;">
          <h3>Error al cargar el control de stock</h3>
          <p>${error.message}</p>
          <button class="btn" onclick="window.location.reload()">Reintentar</button>
        </div>
      </div>
    `;
  }
});
