// Componente: Proyección de Flujo de Caja
ComponentSystem.registrar('proyeccionFlujo', {
  grid: 'span-6',
  html: `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
      <h2 style="margin: 0;">Proyección de Flujo de Caja</h2>
      <div style="display: flex; gap: 8px; align-items: center;">
        <select id="select-proyeccion-meses" class="btn small">
          <option value="3">3 meses</option>
          <option value="6" selected>6 meses</option>
          <option value="12">12 meses</option>
        </select>
      </div>
    </div>

    <div class="chart-container-large">
      <canvas id="grafico-proyeccion-flujo"></canvas>
    </div>

    <div style="margin-top: 12px; display: flex; justify-content: space-between; align-items: center;">
      <div class="text-muted" id="resumen-proyeccion"></div>
      <button id="btn-export-proyeccion" class="btn small secondary">Exportar</button>
    </div>

    <!-- Alertas -->
    <div id="alertas-proyeccion" style="margin-top: 12px;"></div>
  `,
  async render(data, element) {
    await this.cargarDatosYRenderizar(data, element);
    this.setupEventListeners(element, data);
  },

  async cargarDatosYRenderizar(data, element) {
    const movimientos = data.Finanzas_RegistroDiario || data['Finanzas_RegistroDiario'] || data.Caja_Movimientos || [];
    
    if (movimientos.length === 0) {
      element.querySelector('#resumen-proyeccion').innerText = 'No hay datos de movimientos';
      return;
    }

    // Procesar datos históricos
    const datosHistoricos = this.procesarDatosHistoricos(movimientos);
    element._datosHistoricos = datosHistoricos;

    // Calcular proyección
    const mesesProyeccion = parseInt(element.querySelector('#select-proyeccion-meses').value) || 6;
    const proyeccion = this.calcularProyeccion(datosHistoricos, mesesProyeccion);
    
    // Renderizar
    this.renderizarGrafico(element, datosHistoricos, proyeccion);
    this.mostrarAlertas(element, proyeccion);
  },

  procesarDatosHistoricos(movimientos) {
    const meses = {};
    
    // Usar misma lógica de detección de columnas que analisis-categorias
    const sample = movimientos.find(r => r && typeof r === 'object') || {};
    const keys = Object.keys(sample);
    const fechaKey = keys.find(k => /fecha|date/i.test(k)) || null;
    const montoKey = keys.find(k => /monto|importe|total/i.test(k)) || null;
    const tipoKey = keys.find(k => /tipo|ingres|egres/i.test(k)) || null;

    movimientos.forEach(row => {
      const rawFecha = row[fechaKey] ?? row['Fecha'] ?? row['fecha'] ?? row['Date'] ?? null;
      const fecha = UTILS.parseDate(rawFecha);
      
      if (isNaN(fecha.getTime())) return;
      
      const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      const mesLabel = UTILS.formatMonthKey(mesKey, true);
      
      if (!meses[mesKey]) {
        meses[mesKey] = {
          label: mesLabel,
          ingresos: 0,
          egresos: 0,
          saldo: 0,
          saldoAcumulado: 0
        };
      }
      
      const tipo = String(row[tipoKey] ?? '').toLowerCase();
      let monto = UTILS.parseNumber(row[montoKey] ?? row['Monto'] ?? row['Importe'] ?? row['Total'] ?? 0);
      
      if (tipoKey && tipo.includes('ingre')) {
        meses[mesKey].ingresos += monto;
      } else if (tipoKey && tipo.includes('egre')) {
        meses[mesKey].egresos += monto;
      } else {
        // Heurística: positivo = ingreso, negativo = egreso
        if (monto >= 0) {
          meses[mesKey].ingresos += monto;
        } else {
          meses[mesKey].egresos += Math.abs(monto);
        }
      }
    });

    // Calcular saldos
    const mesesArray = Object.keys(meses).sort().map(key => ({
      ...meses[key],
      key,
      saldo: meses[key].ingresos - meses[key].egresos
    }));

    // Calcular saldo acumulado
    let saldoAcumulado = 0;
    mesesArray.forEach(mes => {
      saldoAcumulado += mes.saldo;
      mes.saldoAcumulado = saldoAcumulado;
    });

    return mesesArray;
  },

  calcularProyeccion(datosHistoricos, mesesProyeccion) {
    if (datosHistoricos.length < 3) {
      return []; // No hay suficientes datos para proyección
    }

    // Calcular tendencias (promedio de últimos 6 meses o todos si son menos)
    const mesesAnalisis = datosHistoricos.slice(-6);
    const avgIngresos = mesesAnalisis.reduce((sum, m) => sum + m.ingresos, 0) / mesesAnalisis.length;
    const avgEgresos = mesesAnalisis.reduce((sum, m) => sum + m.egresos, 0) / mesesAnalisis.length;
    
    // Proyectar meses futuros
    const proyeccion = [];
    let ultimoSaldo = datosHistoricos[datosHistoricos.length - 1].saldoAcumulado;
    const ultimoMes = datosHistoricos[datosHistoricos.length - 1].key;

    for (let i = 1; i <= mesesProyeccion; i++) {
      const [year, month] = ultimoMes.split('-').map(Number);
      let nextMonth = month + i;
      let nextYear = year;
      
      while (nextMonth > 12) {
        nextMonth -= 12;
        nextYear++;
      }
      
      const mesKey = `${nextYear}-${String(nextMonth).padStart(2, '0')}`;
      const mesLabel = UTILS.formatMonthKey(mesKey, true);
      
      // Proyección conservadora (podría mejorarse con estacionalidad)
      const ingresosProyectados = avgIngresos * (1 + (0.02 * i)); // 2% crecimiento mensual
      const egresosProyectados = avgEgresos * (1 + (0.015 * i)); // 1.5% crecimiento mensual
      const saldoMensual = ingresosProyectados - egresosProyectados;
      
      ultimoSaldo += saldoMensual;

      proyeccion.push({
        key: mesKey,
        label: mesLabel,
        ingresos: ingresosProyectados,
        egresos: egresosProyectados,
        saldo: saldoMensual,
        saldoAcumulado: ultimoSaldo,
        esProyeccion: true
      });
    }

    return proyeccion;
  },

  renderizarGrafico(element, datosHistoricos, proyeccion) {
    const canvas = element.querySelector('#grafico-proyeccion-flujo');
    const ctx = canvas.getContext('2d');
    
    const todosLosDatos = [...datosHistoricos, ...proyeccion];
    const labels = todosLosDatos.map(d => d.label);
    const saldosAcumulados = todosLosDatos.map(d => d.saldoAcumulado);
    const esProyeccion = todosLosDatos.map(d => d.esProyeccion || false);

    // Destruir gráfico anterior si existe
    if (window.chartProyeccionFlujo) {
      window.chartProyeccionFlujo.destroy();
    }

    window.chartProyeccionFlujo = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Saldo Acumulado',
            data: saldosAcumulados,
            borderColor: '#3ea6ff',
            backgroundColor: 'rgba(62, 166, 255, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: function(context) {
              const index = context.dataIndex;
              return esProyeccion[index] ? '#ff6b6b' : '#3ea6ff';
            },
            pointBorderColor: function(context) {
              const index = context.dataIndex;
              return esProyeccion[index] ? '#ff6b6b' : '#3ea6ff';
            },
            segment: {
              borderColor: function(context) {
                if (context.p1DataIndex >= datosHistoricos.length - 1) {
                  return '#ff6b6b';
                }
                return '#3ea6ff';
              },
              borderDash: function(context) {
                if (context.p1DataIndex >= datosHistoricos.length - 1) {
                  return [5, 5];
                }
                return [];
              }
            }
          }
        ]
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
                const index = context.dataIndex;
                const esProy = esProyeccion[index];
                return `Saldo ${esProy ? 'Proyectado' : 'Histórico'}: $ ${value.toLocaleString("es-AR",{minimumFractionDigits:2})}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
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
        }
      }
    });

    // Actualizar resumen
    const resumenElement = element.querySelector('#resumen-proyeccion');
    const ultimoHistorico = datosHistoricos[datosHistoricos.length - 1];
    const ultimaProyeccion = proyeccion[proyeccion.length - 1];
    
    resumenElement.innerHTML = `
      <strong>Saldo Actual:</strong> $ ${ultimoHistorico.saldoAcumulado.toLocaleString("es-AR",{minimumFractionDigits:2})} | 
      <strong>Proyección Final:</strong> $ ${ultimaProyeccion.saldoAcumulado.toLocaleString("es-AR",{minimumFractionDigits:2})}
    `;
  },

  mostrarAlertas(element, proyeccion) {
    const alertasContainer = element.querySelector('#alertas-proyeccion');
    alertasContainer.innerHTML = '';

    const alertas = [];

    // Verificar proyecciones negativas
    const mesesNegativos = proyeccion.filter(m => m.saldoAcumulado < 0);
    if (mesesNegativos.length > 0) {
      alertas.push({
        tipo: 'critico',
        mensaje: `⚠️ Alerta: ${mesesNegativos.length} mes(es) proyectado(s) con saldo negativo`
      });
    }

    // Verificar tendencia decreciente
    if (proyeccion.length >= 3) {
      const ultimos3 = proyeccion.slice(-3);
      const tendenciaDecreciente = ultimos3[0].saldoAcumulado < ultimos3[2].saldoAcumulado;
      if (tendenciaDecreciente) {
        alertas.push({
          tipo: 'advertencia',
          mensaje: '📉 Tendencia decreciente en la proyección'
        });
      }
    }

    // Mostrar alertas
    alertas.forEach(alerta => {
      const alertDiv = document.createElement('div');
      alertDiv.className = `text-muted ${alerta.tipo === 'critico' ? 'color: #dc3545' : 'color: #ffc107'}`;
      alertDiv.style.cssText = 'padding: 8px 12px; background: rgba(255,255,255,0.05); border-radius: 6px; margin-bottom: 8px; font-size: 13px;';
      alertDiv.textContent = alerta.mensaje;
      alertasContainer.appendChild(alertDiv);
    });

    if (alertas.length === 0) {
      const alertDiv = document.createElement('div');
      alertDiv.className = 'text-muted';
      alertDiv.style.cssText = 'padding: 8px 12px; background: rgba(255,255,255,0.05); border-radius: 6px; font-size: 13px;';
      alertDiv.textContent = '✅ Proyección estable - sin alertas críticas';
      alertasContainer.appendChild(alertDiv);
    }
  },

  setupEventListeners(element, data) {
    const selectMeses = element.querySelector('#select-proyeccion-meses');
    const btnExport = element.querySelector('#btn-export-proyeccion');
    
    selectMeses.addEventListener('change', () => {
      this.cargarDatosYRenderizar(data, element);
    });
    
    btnExport.addEventListener('click', () => {
      this.exportarDatos(element);
    });
  },

  exportarDatos(element) {
    if (!element._datosHistoricos) return;
    
    const proyeccionMeses = parseInt(element.querySelector('#select-proyeccion-meses').value) || 6;
    const proyeccion = this.calcularProyeccion(element._datosHistoricos, proyeccionMeses);
    const todosLosDatos = [...element._datosHistoricos, ...proyeccion];
    
    let csv = 'Mes,Ingresos,Egresos,Saldo Mensual,Saldo Acumulado,Tipo\n';
    todosLosDatos.forEach(dato => {
      const tipo = dato.esProyeccion ? 'Proyección' : 'Histórico';
      csv += `"${dato.label}",${dato.ingresos},${dato.egresos},${dato.saldo},${dato.saldoAcumulado},"${tipo}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proyeccion_flujo_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
});
