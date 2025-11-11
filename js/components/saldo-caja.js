// Componente: Saldo de Caja
ComponentSystem.registrar('saldoCaja', {
  grid: 'span-3',
  html: `
    <h2>Saldo de caja</h2>
    <div id="saldo-actual" class="kpi-grande">Cargando...</div>
    <div id="saldo-fecha" class="text-muted" style="margin-top:6px;">—</div>
  `,
  async render(data, element) {
    const arr = data.Caja_Movimientos || data.caja_movimientos || data['Caja_Movimientos'] || [];
    
    if(!arr || arr.length === 0) {
      element.querySelector('#saldo-actual').innerText = 'Sin datos';
      return;
    }

    const sample = arr.find(r => r && typeof r === 'object');
    const keys = sample ? Object.keys(sample) : [];
    const saldoKey = keys.find(k => /saldo/i.test(k));
    
    if(saldoKey) {
      let lastVal = null;
      let lastRow = null;
      for(let i = arr.length-1; i >= 0; i--) {
        const v = arr[i][saldoKey];
        if(v !== null && v !== undefined && String(v).trim() !== '') {
          lastVal = v;
          lastRow = arr[i];
          break;
        }
      }
      const numeric = UTILS.parseNumber(lastVal);
      element.querySelector('#saldo-actual').innerText = UTILS.formatCurrency(numeric);
      
      const dateKey = keys.find(k => /fecha|date/i.test(k));
      if(lastRow && dateKey && lastRow[dateKey]) {
        const pd = UTILS.parseDate(lastRow[dateKey]);
        if(!isNaN(pd.getTime())) {
          element.querySelector('#saldo-fecha').innerText = 
            'Saldo registrado al ' + (pd.getDate()+"/"+(pd.getMonth()+1)+"/"+pd.getFullYear());
        }
      }
    }
  }
});

