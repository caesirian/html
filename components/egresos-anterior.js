// Componente: Egresos vs Anterior
ComponentSystem.registrar('egresosVsAnterior', {
  grid: 'span-4',
  html: `
    <h2>Egresos: mes actual vs mes anterior</h2>
    <div class="chart-container">
      <canvas id="grafico-egresos"></canvas>
    </div>
  `,
  async render(data, element) {
    const fin = data.Finanzas_RegistroDiario || data['Finanzas_RegistroDiario'] || data.Caja_Movimientos || [];
    const sample = fin.find(r => r && typeof r === 'object') || {};
    const keys = Object.keys(sample);
    const montoKey = keys.find(k => /monto|importe|total/i.test(k)) || null;
    const tipoKey = keys.find(k => /tipo|ingres|egres/i.test(k)) || null;
    const fechaKey = keys.find(k => /fecha|date/i.test(k)) || null;
    
    const sums = {};
    for(const row of fin) {
      const rawFecha = row[fechaKey] ?? row['Fecha'] ?? row['fecha'] ?? row['Date'] ?? null;
      const d = UTILS.parseDate(rawFecha);
      const key = (!isNaN(d.getTime())) ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}` : 'sin-fecha';
      if(!sums[key]) sums[key] = {ing:0, eg:0};
      const tipo = String(row[tipoKey] ?? '').toLowerCase();
      const monto = UTILS.parseNumber(row[montoKey] ?? row['Monto'] ?? row['Importe'] ?? row['Total'] ?? 0);
      
      if(tipoKey && tipo.includes('egre')) sums[key].eg += Math.abs(monto);
      else if(!tipoKey && monto < 0) sums[key].eg += Math.abs(monto);
    }

    const today = new Date();
    const curKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}`;
    const prev = new Date(today.getFullYear(), today.getMonth()-1, 1);
    const prevKey = `${prev.getFullYear()}-${String(prev.getMonth()+1).padStart(2,'0')}`;

    const egActual = sums[curKey]?.eg || 0;
    const egPrev = sums[prevKey]?.eg || 0;

   // Obtener nombres reales de los meses
    const mesAnteriorLabel = UTILS.formatMonthKey(prevKey, true);
    const mesActualLabel = UTILS.formatMonthKey(curKey, true);

    const canvasEgresos = element.querySelector('#grafico-egresos');
    const ctxEgresos = canvasEgresos.getContext('2d');
    
    if(window.chartEgresos) {
      window.chartEgresos.destroy();
    }
    
    window.chartEgresos = new Chart(ctxEgresos, {
      type: 'bar',
      data: {
        labels: [mesAnteriorLabel, mesActualLabel],
    datasets: [{
      label: 'Egresos',
      data: [egPrev, egActual],
      backgroundColor: function(context) {
        const chart = context.chart;
        const {ctx, chartArea} = chart;
        if (!chartArea) return 'rgba(193,18,31,0.8)';
        
        // Crear gradiente para efecto relieve
        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
        gradient.addColorStop(0, 'rgba(160,20,35,0.9)');    // Parte inferior oscura
        gradient.addColorStop(0.6, 'rgba(193,18,31,0.9)'); // Parte media
        gradient.addColorStop(1, 'rgba(220,60,70,1)');     // Parte superior clara (efecto luz)
        
        return gradient;
      },
      borderColor: [
        'rgba(160,20,35,1)',
        'rgba(180,30,45,1)'
      ],
      borderWidth: 1,
      // Efecto de profundidad con sombra
      shadowOffsetX: 2,
      shadowOffsetY: 2,
      shadowBlur: 8,
      shadowColor: 'rgba(0,0,0,0.3)'
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        cornerRadius: 4,
        displayColors: false
      }
    },
    scales: {
      y: { 
        ticks: { color: '#cbdff3' }, 
        beginAtZero: true,
        grid: {
          color: 'rgba(255,255,255,0.05)'
        }
      },
      x: { 
        ticks: { color: '#cbdff3' },
        grid: {
          display: false
        }
      }
    },
    // Hacer las barras más angostas
    barPercentage: 0.4,
    categoryPercentage: 0.6
  }
});
  }
});
