// Componente: Calculadora de Inversión
ComponentSystem.registrar('calculadoraInversion', {
  grid: 'span-6',
  html: `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
      <h2 style="margin: 0;">Calculadora de Inversión</h2>
    </div>

    <div class="form-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px; margin-bottom: 16px;">
      <div>
        <label>Tipo de inversión</label>
        <select id="tipo-inversion" class="btn small">
          <option value="plazo_pesos">Plazo fijo en pesos</option>
          <option value="plazo_dolares">Plazo fijo en dólares</option>
          <option value="uva">Plazo fijo UVA</option>
          <option value="fci">Fondo Común de Inversión (FCI)</option>
        </select>
      </div>
      <div>
        <label>Capital inicial ($)</label>
        <input type="number" id="capital" value="100000" min="0" class="input small" />
      </div>
      <div>
        <label>Tasa anual (%)</label>
        <input type="number" id="tasa" value="40" min="0" step="0.1" class="input small" />
      </div>
      <div>
        <label>Plazo (días)</label>
        <input type="number" id="plazo" value="180" min="1" class="input small" />
      </div>
    </div>

    <div class="chart-container-large" style="height: 300px;">
      <canvas id="grafico-inversion"></canvas>
    </div>

    <div style="margin-top: 12px; display: flex; justify-content: space-between; align-items: center;">
      <div class="text-muted" id="resumen-inversion"></div>
      <button id="btn-export-inversion" class="btn small secondary">Exportar</button>
    </div>
  `,

  render(data, element) {
    this.setup(element);
  },

  setup(element) {
    const tipo = element.querySelector('#tipo-inversion');
    const capital = element.querySelector('#capital');
    const tasa = element.querySelector('#tasa');
    const plazo = element.querySelector('#plazo');
    const exportBtn = element.querySelector('#btn-export-inversion');

    const ctx = element.querySelector('#grafico-inversion').getContext('2d');
    let chart;

    const calcularYRenderizar = () => {
      const capitalInicial = parseFloat(capital.value) || 0;
      const tasaAnual = parseFloat(tasa.value) || 0;
      const dias = parseInt(plazo.value) || 0;
      const tipoSeleccionado = tipo.value;

      // Ajuste de tasa según tipo de inversión
      let factorTasa = 1;
      if (tipoSeleccionado === 'uva') factorTasa = 1.1;
      if (tipoSeleccionado === 'fci') factorTasa = 0.8;
      if (tipoSeleccionado === 'plazo_dolares') factorTasa = 0.2;

      const tasaDiaria = (tasaAnual / 100 / 365) * factorTasa;
      let data = [];
      let labels = [];
      let valor = capitalInicial;

      for (let d = 0; d <= dias; d++) {
        valor = capitalInicial * Math.pow(1 + tasaDiaria, d);
        labels.push(d);
        data.push(valor.toFixed(2));
      }

      // Destruir gráfico previo
      if (chart) chart.destroy();

      chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Evolución de la inversión ($)',
            data,
            borderColor: '#007b55',
            backgroundColor: 'rgba(0,123,85,0.15)',
            borderWidth: 2,
            fill: true,
            tension: 0.25
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: ctx => `$${parseFloat(ctx.raw).toLocaleString('es-AR', {minimumFractionDigits:2})}`
              }
            }
          },
          scales: {
            x: {
              title: { display: true, text: 'Días' },
              ticks: { color: '#bbb' },
              grid: { display: false }
            },
            y: {
              title: { display: true, text: 'Monto acumulado ($)' },
              ticks: {
                color: '#bbb',
                callback: val => '$' + val.toLocaleString('es-AR')
              },
              grid: { color: 'rgba(0,0,0,0.05)' }
            }
          }
        }
      });

      // Actualizar resumen
      const totalGanancia = valor - capitalInicial;
      element.querySelector('#resumen-inversion').innerHTML = `
        <strong>Capital final:</strong> $ ${valor.toLocaleString('es-AR', {minimumFractionDigits:2})} |
        <strong>Ganancia:</strong> $ ${totalGanancia.toLocaleString('es-AR', {minimumFractionDigits:2})}
      `;
    };

    // Eventos
    [tipo, capital, tasa, plazo].forEach(el => el.addEventListener('input', calcularYRenderizar));
    calcularYRenderizar();

    // Exportar CSV
    exportBtn.addEventListener('click', () => {
      const dias = parseInt(plazo.value) || 0;
      const capitalInicial = parseFloat(capital.value) || 0;
      const tasaAnual = parseFloat(tasa.value) || 0;
      const tipoSeleccionado = tipo.value;
      let factorTasa = 1;
      if (tipoSeleccionado === 'uva') factorTasa = 1.1;
      if (tipoSeleccionado === 'fci') factorTasa = 0.8;
      if (tipoSeleccionado === 'plazo_dolares') factorTasa = 0.2;
      const tasaDiaria = (tasaAnual / 100 / 365) * factorTasa;

      let csv = 'Día,Monto Acumulado\n';
      for (let d = 0; d <= dias; d++) {
        const valor = capitalInicial * Math.pow(1 + tasaDiaria, d);
        csv += `${d},${valor.toFixed(2)}\n`;
      }

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `calculadora_inversion_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    });
  }
});
