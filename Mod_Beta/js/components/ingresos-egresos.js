// Componente: Ingresos vs Egresos
componentSystem.register('ingresosVsEgresos', {
    name: 'Ingresos vs Egresos',
    category: 'financial',
    grid: 'span-6',
    defaultActive: true,
    
    async render(data, element) {
        const metrics = data.metrics || {};
        const ingresos = metrics.ingresosMes || 0;
        const egresos = metrics.egresosMes || 0;
        const balance = ingresos - egresos;
        
        element.innerHTML = `
            <h2><i class="fas fa-chart-line"></i> Flujo Mensual</h2>
            <div class="chart-container">
                <canvas id="ingresosEgresosChart"></canvas>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 10px; font-size: 12px;">
                <div style="color: #28a745;">
                    <i class="fas fa-arrow-up"></i> Ingresos: ${UTILS.formatCurrency(ingresos)}
                </div>
                <div style="color: #dc3545;">
                    <i class="fas fa-arrow-down"></i> Egresos: ${UTILS.formatCurrency(egresos)}
                </div>
                <div style="color: ${balance >= 0 ? '#28a745' : '#dc3545'};">
                    Balance: ${UTILS.formatCurrency(balance)}
                </div>
            </div>
        `;
        
        // Renderizar gráfico
        this.renderChart(element, ingresos, egresos);
    },
    
    renderChart(element, ingresos, egresos) {
        const ctx = element.querySelector('#ingresosEgresosChart').getContext('2d');
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Ingresos', 'Egresos'],
                datasets: [{
                    data: [ingresos, egresos],
                    backgroundColor: [
                        'rgba(40, 167, 69, 0.8)',
                        'rgba(220, 53, 69, 0.8)'
                    ],
                    borderColor: [
                        'rgba(40, 167, 69, 1)',
                        'rgba(220, 53, 69, 1)'
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
                            color: 'var(--text)',
                            font: {
                                size: 11
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${UTILS.formatCurrency(context.raw)}`;
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }
});
