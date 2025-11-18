// Componente: Saldo de Caja
componentSystem.register('saldoCaja', {
    name: 'Saldo de Caja',
    category: 'financial',
    grid: 'span-3',
    defaultActive: true,
    
    async render(data, element) {
        const metrics = data.metrics || {};
        const saldo = metrics.saldoCaja || 0;
        const tendencia = saldo > 50000 ? 'up' : saldo < 0 ? 'down' : 'neutral';
        
        element.innerHTML = `
            <div class="metric-card">
                <h2><i class="fas fa-wallet"></i> Saldo de Caja</h2>
                <div class="metric-value">${UTILS.formatCurrency(saldo)}</div>
                <div class="metric-label">Disponible actualmente</div>
                <div class="trend-${tendencia}">
                    <i class="fas fa-arrow-${tendencia === 'up' ? 'up' : tendencia === 'down' ? 'down' : 'right'}"></i>
                    ${tendencia === 'up' ? 'Saldo saludable' : tendencia === 'down' ? 'Atención requerida' : 'Estable'}
                </div>
            </div>
        `;
        
        // Agregar interactividad
        element.addEventListener('click', () => {
            App.loadModule('caja');
        });
        
        element.style.cursor = 'pointer';
    }
});
