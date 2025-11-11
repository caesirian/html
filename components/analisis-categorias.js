 // Componente: Análisis de Categorías por Mes (CON BOTONES)
ComponentSystem.registrar('analisisCategorias', {
  grid: 'span-6',
  html: `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
      <h2 style="margin: 0;">Análisis por Categorías</h2>
      <div style="display: flex; gap: 4px; align-items: center;">
        <button class="btn tipo-btn active" data-tipo="egresos">Egresos</button>
        <button class="btn tipo-btn secondary" data-tipo="ingresos">Ingresos</button>
      </div>
    </div>
    
    <div style="margin-bottom: 16px;">
      <div class="text-muted" style="margin-bottom: 8px; font-size: 12px;">Selecciona el mes:</div>
      <div id="botones-mes" style="display: flex; gap: 6px; flex-wrap: wrap;">
        <div class="loader" style="margin: 0 auto;"></div>
      </div>
    </div>
    
    <div class="chart-container-large">
      <canvas id="grafico-categorias"></canvas>
    </div>
    
    <div style="margin-top: 12px; display: flex; justify-content: space-between; align-items: center;">
      <div class="text-muted" id="resumen-categorias"></div>
      <button id="btn-export-categorias" class="btn small secondary">Exportar</button>
    </div>
  `,
  async render(data, element) {
    // Inicializar datos y UI
    await this.cargarDatosYRenderizar(data, element);
    
    // Event listeners
    this.setupEventListeners(element, data);
  },

  async cargarDatosYRenderizar(data, element) {
    const movimientos = data.Finanzas_RegistroDiario || data['Finanzas_RegistroDiario'] || data.Caja_Movimientos || [];
    
    if (movimientos.length === 0) {
      element.querySelector('#resumen-categorias').innerText = 'No hay datos de movimientos';
      return;
    }

    // Procesar datos para extraer meses disponibles y categorías
    const { mesesDisponibles, datosPorMes } = this.procesarDatosMovimientos(movimientos);
    
    // Guardar datos en el elemento para uso posterior
    element._datosMovimientos = { mesesDisponibles, datosPorMes };
    
    // Crear botones de meses
    this.crearBotonesMeses(element, mesesDisponibles);
    
    // Si hay meses disponibles, seleccionar el más reciente y renderizar
    if (mesesDisponibles.length > 0) {
      const mesMasReciente = mesesDisponibles[mesesDisponibles.length - 1];
      this.seleccionarMes(element, mesMasReciente);
      this.renderizarGrafico(element, mesMasReciente, 'egresos');
    }
  },

  procesarDatosMovimientos(movimientos) {
    const mesesDisponibles = new Set();
    const datosPorMes = {};
    
    // Detectar columnas
    const sample = movimientos.find(r => r && typeof r === 'object') || {};
    const keys = Object.keys(sample);
    const fechaKey = keys.find(k => /fecha|date/i.test(k)) || null;
    const montoKey = keys.find(k => /monto|importe|total/i.test(k)) || null;
    const tipoKey = keys.find(k => /tipo|ingres|egres/i.test(k)) || null;
    const categoriaKey = keys.find(k => /categor|rubro|concepto|descrip/i.test(k)) || null;
    
    movimientos.forEach(row => {
      const rawFecha = row[fechaKey] ?? row['Fecha'] ?? row['fecha'] ?? row['Date'] ?? null;
      const fecha = UTILS.parseDate(rawFecha);
      
      if (isNaN(fecha.getTime())) return;
      
      const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      const mesLabel = `${String(fecha.getMonth() + 1).padStart(2, '0')}/${fecha.getFullYear()}`;
      
      mesesDisponibles.add(mesKey);
      
      if (!datosPorMes[mesKey]) {
        datosPorMes[mesKey] = {
          label: mesLabel,
          ingresos: {},
          egresos: {}
        };
      }
      
      const tipo = String(row[tipoKey] ?? '').toLowerCase();
      let monto = UTILS.parseNumber(row[montoKey] ?? row['Monto'] ?? row['Importe'] ?? row['Total'] ?? 0);
      const categoria = row[categoriaKey] || row['Categoría'] || row['Rubro'] || row['Concepto'] || 'Sin categoría';
      
      // Determinar si es ingreso o egreso
      let tipoMovimiento = '';
      if (tipoKey && tipo.includes('ingre')) {
        tipoMovimiento = 'ingresos';
      } else if (tipoKey && tipo.includes('egre')) {
        tipoMovimiento = 'egresos';
      } else {
        // Heurística: positivo = ingreso, negativo = egreso
        tipoMovimiento = monto >= 0 ? 'ingresos' : 'egresos';
        monto = Math.abs(monto);
      }
      
      // Agrupar por categoría
      if (!datosPorMes[mesKey][tipoMovimiento][categoria]) {
        datosPorMes[mesKey][tipoMovimiento][categoria] = 0;
      }
      
      datosPorMes[mesKey][tipoMovimiento][categoria] += monto;
    });
    
    return {
      mesesDisponibles: Array.from(mesesDisponibles).sort(),
      datosPorMes
    };
  },

   crearBotonesMeses(element, mesesDisponibles) {
    const contenedorBotones = element.querySelector('#botones-mes');
    contenedorBotones.innerHTML = '';
    
    if (mesesDisponibles.length === 0) {
      contenedorBotones.innerHTML = '<span class="text-muted">No hay meses disponibles</span>';
      return;
    }
    
    // Crear botón para cada mes con nombre en mayúsculas
    mesesDisponibles.forEach((mesKey, index) => {
      const button = document.createElement('button');
      button.className = 'btn small mes-btn';
      if (index === mesesDisponibles.length - 1) {
        button.classList.add('active');
      } else {
        button.classList.add('secondary');
      }
      button.setAttribute('data-mes', mesKey);
      button.textContent = UTILS.formatMonthKey(mesKey, true); // true para formato corto
      contenedorBotones.appendChild(button);
    });
  },

  seleccionarMes(element, mesKey) {
    // Remover clase active de todos los botones de mes
    const botonesMes = element.querySelectorAll('.mes-btn');
    botonesMes.forEach(btn => {
      btn.classList.remove('active');
      btn.classList.add('secondary');
    });
    
    // Agregar clase active al botón seleccionado
    const botonSeleccionado = element.querySelector(`.mes-btn[data-mes="${mesKey}"]`);
    if (botonSeleccionado) {
      botonSeleccionado.classList.remove('secondary');
      botonSeleccionado.classList.add('active');
    }
  },

  obtenerTipoSeleccionado(element) {
    const botonActivo = element.querySelector('.tipo-btn.active');
    return botonActivo ? botonActivo.getAttribute('data-tipo') : 'egresos';
  },

  renderizarGrafico(element, mesKey, tipo) {
    if (!element._datosMovimientos) return;
    
    const { datosPorMes } = element._datosMovimientos;
    const datosMes = datosPorMes[mesKey];
    
    if (!datosMes) {
      element.querySelector('#resumen-categorias').innerText = 'No hay datos para el mes seleccionado';
      return;
    }
    
    const datos = datosMes[tipo];
    const categorias = Object.keys(datos);
    
    if (categorias.length === 0) {
      element.querySelector('#resumen-categorias').innerText = `No hay ${tipo} para el mes seleccionado`;
      
      // Limpiar gráfico si existe
      if (window.chartCategorias) {
        window.chartCategorias.destroy();
      }
      return;
    }
    
    // Ordenar categorías por monto (descendente) y tomar top 10
    const categoriasOrdenadas = categorias
      .map(cat => ({ categoria: cat, monto: datos[cat] }))
      .sort((a, b) => b.monto - a.monto)
      .slice(0, 10);
    
    const labels = categoriasOrdenadas.map(item => {
      // Acortar nombres largos de categorías
      return item.categoria.length > 20 
        ? item.categoria.substring(0, 20) + '...' 
        : item.categoria;
    });
    
    const valores = categoriasOrdenadas.map(item => item.monto);
    const total = valores.reduce((sum, val) => sum + val, 0);
    
    // Actualizar resumen
    const resumenElement = element.querySelector('#resumen-categorias');
    const [year, month] = mesKey.split('-');
    resumenElement.innerHTML = `
      <strong>${tipo === 'ingresos' ? 'Ingresos' : 'Egresos'} de ${month}/${year}:</strong> 
      $ ${total.toLocaleString("es-AR",{minimumFractionDigits:2})} | 
      <strong>Categorías:</strong> ${categoriasOrdenadas.length}
    `;
    
    // Crear colores para el gráfico
    const colores = this.generarColores(categoriasOrdenadas.length, tipo);
    
    // Renderizar gráfico
    const canvasCategorias = element.querySelector('#grafico-categorias');
    const ctxCategorias = canvasCategorias.getContext('2d');
    
    // Destruir gráfico anterior si existe
    if(window.chartCategorias) {
      window.chartCategorias.destroy();
    }
    
    window.chartCategorias = new Chart(ctxCategorias, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: tipo === 'ingresos' ? 'Ingresos por Categoría' : 'Egresos por Categoría',
          data: valores,
          backgroundColor: function(context) {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            if (!chartArea) return colores[context.dataIndex] || '#3ea6ff';
            
            const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            const colorBase = colores[context.dataIndex] || '#3ea6ff';
            
            if (tipo === 'ingresos') {
              gradient.addColorStop(0, colorBase.replace('0.8', '0.6'));
              gradient.addColorStop(0.7, colorBase);
              gradient.addColorStop(1, colorBase.replace('0.8', '1'));
            } else {
              gradient.addColorStop(0, colorBase.replace('0.8', '0.6'));
              gradient.addColorStop(0.7, colorBase);
              gradient.addColorStop(1, colorBase.replace('0.8', '1'));
            }
            
            return gradient;
          },
          borderColor: colores.map(color => color.replace('0.8', '1')),
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.parsed.y;
                const percentage = ((value / total) * 100).toFixed(1);
                return `$ ${value.toLocaleString("es-AR",{minimumFractionDigits:2})} (${percentage}%)`;
              },
              afterLabel: function(context) {
                const categoriaCompleta = categoriasOrdenadas[context.dataIndex].categoria;
                if (categoriaCompleta.length > 20) {
                  return `Categoría: ${categoriaCompleta}`;
                }
                return '';
              }
            },
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            cornerRadius: 4
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#cbdff3',
              callback: function(value) {
                return '$ ' + value.toLocaleString("es-AR",{minimumFractionDigits:0});
              }
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
        },
        barPercentage: 0.7,
        categoryPercentage: 0.8
      }
    });
  },

  generarColores(cantidad, tipo) {
    const coloresBase = tipo === 'ingresos' 
      ? [
          'rgba(76, 175, 80, 0.8)',   // Verde
          'rgba(56, 142, 60, 0.8)',   // Verde oscuro
          'rgba(46, 125, 50, 0.8)',   // Verde más oscuro
          'rgba(27, 94, 32, 0.8)',    // Verde muy oscuro
          'rgba(67, 160, 71, 0.8)',   // Verde medio
          'rgba(102, 187, 106, 0.8)', // Verde claro
          'rgba(129, 199, 132, 0.8)', // Verde muy claro
          'rgba(165, 214, 167, 0.8)', // Verde pastel
          'rgba(200, 230, 201, 0.8)', // Verde muy pastel
          'rgba(232, 245, 233, 0.8)'  // Verde ultra claro
        ]
      : [
          'rgba(244, 67, 54, 0.8)',   // Rojo
          'rgba(229, 57, 53, 0.8)',   // Rojo oscuro
          'rgba(211, 47, 47, 0.8)',   // Rojo más oscuro
          'rgba(183, 28, 28, 0.8)',   // Rojo muy oscuro
          'rgba(229, 115, 115, 0.8)', // Rojo claro
          'rgba(239, 154, 154, 0.8)', // Rojo más claro
          'rgba(229, 57, 53, 0.8)',   // Rojo medio
          'rgba(245, 138, 135, 0.8)', // Rojo pastel
          'rgba(251, 188, 188, 0.8)', // Rojo muy pastel
          'rgba(255, 205, 210, 0.8)'  // Rojo ultra claro
        ];
    
    // Si necesitamos más colores de los disponibles, generamos variaciones
    if (cantidad <= coloresBase.length) {
      return coloresBase.slice(0, cantidad);
    }
    
    // Para más de 10 categorías, generamos colores interpolados
    const colores = [];
    for (let i = 0; i < cantidad; i++) {
      const baseColor = coloresBase[i % coloresBase.length];
      const factor = Math.floor(i / coloresBase.length);
      const opacity = 0.8 - (factor * 0.1);
      colores.push(baseColor.replace('0.8', opacity.toFixed(1)));
    }
    
    return colores;
  },

  setupEventListeners(element, data) {
    const btnExport = element.querySelector('#btn-export-categorias');
    
    // Event listeners para botones de mes
    element.addEventListener('click', (e) => {
      if (e.target.classList.contains('mes-btn')) {
        const mesKey = e.target.getAttribute('data-mes');
        this.seleccionarMes(element, mesKey);
        const tipo = this.obtenerTipoSeleccionado(element);
        this.renderizarGrafico(element, mesKey, tipo);
      }
      
      if (e.target.classList.contains('tipo-btn')) {
        // Cambiar tipo (ingresos/egresos)
        const botonesTipo = element.querySelectorAll('.tipo-btn');
        botonesTipo.forEach(btn => {
          btn.classList.remove('active');
          btn.classList.add('secondary');
        });
        e.target.classList.remove('secondary');
        e.target.classList.add('active');
        
        const mesActivo = element.querySelector('.mes-btn.active');
        if (mesActivo) {
          const mesKey = mesActivo.getAttribute('data-mes');
          const tipo = e.target.getAttribute('data-tipo');
          this.renderizarGrafico(element, mesKey, tipo);
        }
      }
    });
    
    btnExport.addEventListener('click', () => {
      this.exportarDatosCategorias(element);
    });
  },

  exportarDatosCategorias(element) {
    const mesActivo = element.querySelector('.mes-btn.active');
    const tipoActivo = element.querySelector('.tipo-btn.active');
    
    if (!mesActivo || !element._datosMovimientos) {
      alert('No hay datos para exportar');
      return;
    }
    
    const mesKey = mesActivo.getAttribute('data-mes');
    const tipo = tipoActivo.getAttribute('data-tipo');
    
    const { datosPorMes } = element._datosMovimientos;
    const datosMes = datosPorMes[mesKey];
    
    if (!datosMes) return;
    
    const datos = datosMes[tipo];
    const categorias = Object.keys(datos)
      .map(cat => ({ categoria: cat, monto: datos[cat] }))
      .sort((a, b) => b.monto - a.monto);
    
    // Crear CSV
    let csv = 'Categoría,Monto\n';
    categorias.forEach(item => {
      csv += `"${item.categoria}",${item.monto}\n`;
    });
    
    // Descargar
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `categorias_${tipo}_${mesKey}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
});
