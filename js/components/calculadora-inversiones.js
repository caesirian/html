// Componente: Calculadora de Inversiones
ComponentSystem.registrar('calculadoraInversiones', {
  grid: 'span-6',
  html: `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
      <h2 style="margin: 0;">Calculadora de Inversiones</h2>
    </div>

    <!-- Controles de entrada -->
    <div class="dashboard-grid" style="grid-template-columns: repeat(12, 1fr); gap: 12px; margin-bottom: 20px;">
      <!-- Tipo de inversión -->
      <div class="card" data-grid="span-6">
        <h3 style="margin: 0 0 12px 0; font-size: 14px;">Tipo de Inversión</h3>
        <select id="select-tipo-inversion" class="btn small" style="width: 100%;">
          <option value="plazoFijoPesos">Plazo Fijo en Pesos</option>
          <option value="plazoFijoDolares">Plazo Fijo en Dólares</option>
          <option value="plazoFijoUVA">Plazo Fijo UVA</option>
          <option value="FCI">Fondo Común de Inversión (FCI)</option>
          <option value="bonos">Bonos</option>
          <option value="acciones">Acciones</option>
        </select>
      </div>

      <!-- Capital inicial -->
      <div class="card" data-grid="span-6">
        <h3 style="margin: 0 0 12px 0; font-size: 14px;">Capital Inicial ($)</h3>
        <input type="number" id="input-capital" class="btn small" placeholder="Ej: 100000" 
               style="width: 100%; box-sizing: border-box; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); color: var(--text);" 
               value="100000" min="0" step="1000">
      </div>

      <!-- Tasa de interés -->
      <div class="card" data-grid="span-6">
        <h3 style="margin: 0 0 12px 0; font-size: 14px;">Tasa de Interés Anual (%)</h3>
        <input type="number" id="input-tasa" class="btn small" placeholder="Ej: 75" 
               style="width: 100%; box-sizing: border-box; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); color: var(--text);" 
               value="75" min="0" step="0.1">
      </div>

      <!-- Período de inversión -->
      <div class="card" data-grid="span-6">
        <h3 style="margin: 0 0 12px 0; font-size: 14px;">Período (meses)</h3>
        <input type="number" id="input-periodo" class="btn small" placeholder="Ej: 12" 
               style="width: 100%; box-sizing: border-box; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); color: var(--text);" 
               value="12" min="1" max="60" step="1">
      </div>

      <!-- Parámetros adicionales según tipo de inversión -->
      <div class="card" data-grid="span-6" id="container-param-adicional" style="display: none;">
        <h3 style="margin: 0 0 12px 0; font-size: 14px;" id="label-param-adicional">Parámetro Adicional</h3>
        <input type="number" id="input-param-adicional" class="btn small" 
               style="width: 100%; box-sizing: border-box; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); color: var(--text);" 
               value="0" step="0.1">
      </div>
    </div>

    <!-- Gráfico de proyección -->
    <div class="chart-container-large">
      <canvas id="grafico-proyeccion-inversion"></canvas>
    </div>

    <!-- Resumen de resultados -->
    <div class="dashboard-grid" style="grid-template-columns: repeat(12, 1fr); gap: 12px; margin-top: 16px;">
      <div class="card" data-grid="span-4">
        <h3 style="margin: 0 0 8px 0; font-size: 13px; color: var(--muted);">Capital Final</h3>
        <div id="resultado-capital-final" class="kpi-grande" style="font-size: 20px; color: #28a745;">$ 0</div>
      </div>
      
      <div class="card" data-grid="span-4">
        <h3 style="margin: 0 0 8px 0; font-size: 13px; color: var(--muted);">Ganancia Neta</h3>
        <div id="resultado-ganancia-neta" class="kpi-grande" style="font-size: 20px; color: #3ea6ff;">$ 0</div>
      </div>
      
      <div class="card" data-grid="span-4">
        <h3 style="margin: 0 0 8px 0; font-size: 13px; color: var(--muted);">Rentabilidad</h3>
        <div id="resultado-rentabilidad" class="kpi-grande" style="font-size: 20px; color: #ffc107;">0%</div>
      </div>
    </div>

    <div style="margin-top: 12px; display: flex; justify-content: space-between; align-items: center;">
      <div class="text-muted" id="resumen-inversion"></div>
      <button id="btn-export-inversion" class="btn small secondary">Exportar Proyección</button>
    </div>
  `,

  async render(data, element) {
    // Inicializar la calculadora
    this.inicializarCalculadora(element);
  },

  inicializarCalculadora(element) {
    // Configurar valores por defecto
    this.config = {
      capital: 100000,
      tasa: 75,
      periodo: 12,
      tipo: 'plazoFijoPesos'
    };

    // Crear gráfico inicial
    this.renderizarGrafico(element);

    // Configurar event listeners
    this.setupEventListeners(element);

    // Calcular proyección inicial
    this.calcularProyeccion(element);
  },

  setupEventListeners(element) {
    const selectTipo = element.querySelector('#select-tipo-inversion');
    const inputCapital = element.querySelector('#input-capital');
    const inputTasa = element.querySelector('#input-tasa');
    const inputPeriodo = element.querySelector('#input-periodo');
    const inputParamAdicional = element.querySelector('#input-param-adicional');

    // Actualizar gráfico cuando cambie cualquier input
    [selectTipo, inputCapital, inputTasa, inputPeriodo, inputParamAdicional].forEach(input => {
      input.addEventListener('input', () => {
        this.actualizarConfiguracion(element);
        this.calcularProyeccion(element);
      });
    });

    // Cambiar parámetros adicionales según el tipo de inversión
    selectTipo.addEventListener('change', () => {
      this.actualizarParametrosAdicionales(element);
      this.calcularProyeccion(element);
    });

    // Botón exportar
    const btnExport = element.querySelector('#btn-export-inversion');
    btnExport.addEventListener('click', () => {
      this.exportarProyeccion(element);
    });
  },

  actualizarConfiguracion(element) {
    this.config = {
      capital: parseFloat(element.querySelector('#input-capital').value) || 0,
      tasa: parseFloat(element.querySelector('#input-tasa').value) || 0,
      periodo: parseInt(element.querySelector('#input-periodo').value) || 0,
      tipo: element.querySelector('#select-tipo-inversion').value,
      paramAdicional: parseFloat(element.querySelector('#input-param-adicional').value) || 0
    };
  },

  actualizarParametrosAdicionales(element) {
    const container = element.querySelector('#container-param-adicional');
    const label = element.querySelector('#label-param-adicional');
    const input = element.querySelector('#input-param-adicional');
    const tipo = element.querySelector('#select-tipo-inversion').value;

    let mostrar = false;
    let textoLabel = '';
    let valorPorDefecto = 0;

    switch (tipo) {
      case 'plazoFijoUVA':
        mostrar = true;
        textoLabel = 'Inflación Esperada Anual (%)';
        valorPorDefecto = 50;
        break;
      case 'FCI':
        mostrar = true;
        textoLabel = 'Comisión Anual del Fondo (%)';
        valorPorDefecto = 2;
        break;
      case 'bonos':
        mostrar = true;
        textoLabel = 'Tasa Extra por Riesgo (%)';
        valorPorDefecto = 3;
        break;
      case 'acciones':
        mostrar = true;
        textoLabel = 'Volatilidad Esperada (%)';
        valorPorDefecto = 15;
        break;
    }

    if (mostrar) {
      container.style.display = 'block';
      label.textContent = textoLabel;
      input.value = valorPorDefecto;
    } else {
      container.style.display = 'none';
    }
  },

  calcularProyeccion(element) {
    const { capital, tasa, periodo, tipo, paramAdicional } = this.config;
    
    if (capital <= 0 || tasa <= 0 || periodo <= 0) {
      this.mostrarResultados(element, 0, 0, 0, []);
      return;
    }

    const proyeccion = this.generarProyeccion(capital, tasa, periodo, tipo, paramAdicional);
    const capitalFinal = proyeccion[proyeccion.length - 1].valor;
    const gananciaNeta = capitalFinal - capital;
    const rentabilidad = ((gananciaNeta / capital) * 100);

    this.mostrarResultados(element, capitalFinal, gananciaNeta, rentabilidad, proyeccion);
    this.actualizarGrafico(element, proyeccion);
  },

  generarProyeccion(capital, tasa, periodo, tipo, paramAdicional) {
    const proyeccion = [];
    let valorActual = capital;
    const tasaMensual = this.calcularTasaMensual(tasa, tipo);

    for (let mes = 0; mes <= periodo; mes++) {
      if (mes > 0) {
        switch (tipo) {
          case 'plazoFijoPesos':
            valorActual = capital * Math.pow(1 + (tasaMensual / 100), mes);
            break;
          case 'plazoFijoDolares':
            // Asumiendo una devaluación mensual del paramAdicional%
            const devaluacionMensual = paramAdicional / 100 / 12;
            valorActual = capital * Math.pow(1 + (tasaMensual / 100), mes) * Math.pow(1 + devaluacionMensual, mes);
            break;
          case 'plazoFijoUVA':
            // UVA: tasa real + inflación
            const inflacionMensual = paramAdicional / 100 / 12;
            valorActual = capital * Math.pow(1 + (tasaMensual / 100), mes) * Math.pow(1 + inflacionMensual, mes);
            break;
          case 'FCI':
            // FCI con comisión
            const comisionMensual = paramAdicional / 100 / 12;
            valorActual = capital * Math.pow(1 + (tasaMensual / 100 - comisionMensual), mes);
            break;
          case 'bonos':
            // Bonos con tasa base + riesgo
            const tasaConRiesgo = tasaMensual + (paramAdicional / 100 / 12);
            valorActual = capital * Math.pow(1 + (tasaConRiesgo / 100), mes);
            break;
          case 'acciones':
            // Acciones con volatilidad (simulación más realista)
            const volatilidad = paramAdicional / 100;
            const rendimientoMensual = (tasaMensual / 100) + (Math.random() - 0.5) * volatilidad;
            valorActual = valorActual * (1 + rendimientoMensual);
            break;
          default:
            valorActual = capital * Math.pow(1 + (tasaMensual / 100), mes);
        }
      }

      proyeccion.push({
        mes: mes,
        valor: valorActual
      });
    }

    return proyeccion;
  },

  calcularTasaMensual(tasaAnual, tipo) {
    // Conversión de tasa anual a mensual según tipo de inversión
    switch (tipo) {
      case 'plazoFijoPesos':
      case 'plazoFijoDolares':
        return tasaAnual / 12; // Tasa simple mensual
      case 'plazoFijoUVA':
        return tasaAnual / 12; // Tasa real mensual
      case 'FCI':
      case 'bonos':
      case 'acciones':
        return Math.pow(1 + tasaAnual / 100, 1/12) - 1; // Tasa compuesta mensual
      default:
        return tasaAnual / 12;
    }
  },

  mostrarResultados(element, capitalFinal, gananciaNeta, rentabilidad, proyeccion) {
    // Actualizar KPIs
    element.querySelector('#resultado-capital-final').textContent = 
      `$ ${capitalFinal.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    
    element.querySelector('#resultado-ganancia-neta').textContent = 
      `$ ${gananciaNeta.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    
    element.querySelector('#resultado-rentabilidad').textContent = 
      `${rentabilidad.toFixed(2)}%`;

    // Actualizar resumen
    const resumenElement = element.querySelector('#resumen-inversion');
    const tipoInversion = element.querySelector('#select-tipo-inversion');
    const tipoTexto = tipoInversion.options[tipoInversion.selectedIndex].text;
    
    resumenElement.innerHTML = `
      <strong>${tipoTexto}</strong> | 
      <strong>Capital:</strong> $ ${this.config.capital.toLocaleString('es-AR')} | 
      <strong>Tasa:</strong> ${this.config.tasa}% anual
    `;
  },

  renderizarGrafico(element) {
    const canvas = element.querySelector('#grafico-proyeccion-inversion');
    const ctx = canvas.getContext('2d');
    
    // Destruir gráfico anterior si existe
    if (window.chartInversion) {
      window.chartInversion.destroy();
    }

    window.chartInversion = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Proyección de Inversión',
          data: [],
          borderColor: '#3ea6ff',
          backgroundColor: 'rgba(62, 166, 255, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4
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
                return `Mes ${context.dataIndex}: $ ${context.parsed.y.toLocaleString('es-AR', {minimumFractionDigits: 2})}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#cbdff3',
              callback: function(value) {
                return '$ ' + value.toLocaleString('es-AR', {minimumFractionDigits: 0});
              }
            },
            grid: {
              color: 'rgba(255,255,255,0.05)'
            }
          },
          x: {
            ticks: {
              color: '#cbdff3'
            },
            grid: {
              display: false
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });
  },

  actualizarGrafico(element, proyeccion) {
    const chart = window.chartInversion;
    if (!chart) return;

    // Actualizar datos del gráfico
    chart.data.labels = proyeccion.map(p => `Mes ${p.mes}`);
    chart.data.datasets[0].data = proyeccion.map(p => p.valor);

    chart.update('none'); // 'none' para mejor performance
  },

  exportarProyeccion(element) {
    const { capital, tasa, periodo, tipo } = this.config;
    const proyeccion = this.generarProyeccion(capital, tasa, periodo, tipo, this.config.paramAdicional);
    
    let csv = 'Mes,Valor,Ganancia,Rentabilidad Acumulada\n';
    proyeccion.forEach((p, index) => {
      const ganancia = p.valor - capital;
      const rentabilidad = ((ganancia / capital) * 100);
      csv += `${p.mes},${p.valor.toFixed(2)},${ganancia.toFixed(2)},${rentabilidad.toFixed(2)}%\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proyeccion_inversion_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
});
