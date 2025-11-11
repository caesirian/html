// Componente: Cotizaciones de Monedas (VERSIÓN MEJORADA)
ComponentSystem.registrar('cotizacionesMonedas', {
  grid: 'span-3',
  html: `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
      <h2 style="margin: 0;">Cotizaciones</h2>
      <button id="btn-actualizar-cotizaciones" class="btn small secondary" style="padding: 4px 8px;">
        <span>🔄</span>
      </button>
    </div>
    <div id="cotizaciones-container">
      <div class="loader" style="margin: 20px auto;"></div>
    </div>
    <div class="text-muted" style="margin-top: 8px; font-size: 11px; text-align: center;">
      <span id="ultima-actualizacion">Actualizando...</span>
    </div>
  `,
  async render(data, element) {
    await this.cargarCotizaciones(element);
    this.setupEventListeners(element);
  },

  async cargarCotizaciones(element) {
    const container = element.querySelector('#cotizaciones-container');
    const actualizacionElement = element.querySelector('#ultima-actualizacion');
    
    try {
      container.innerHTML = '<div class="loader" style="margin: 20px auto;"></div>';
      
      // Usar DolarAPI - muy confiable para Argentina
      const cotizaciones = await this.obtenerDeDolarAPI();
      
      container.innerHTML = '';
      
      if (cotizaciones.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; color: var(--muted); padding: 20px;">
            No se pudieron cargar las cotizaciones
          </div>
        `;
        return;
      }
      
      cotizaciones.forEach(cotizacion => {
        const card = document.createElement('div');
        card.style.cssText = `
          background: rgba(255,255,255,0.03);
          border-radius: 8px;
          padding: 10px;
          margin-bottom: 8px;
          border: 1px solid rgba(255,255,255,0.05);
          transition: all 0.2s ease;
        `;
        
        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 16px;">${cotizacion.emoji}</span>
              <span style="font-weight: 600; font-size: 12px;">${cotizacion.nombre}</span>
            </div>
            <span style="font-size: 10px; color: ${cotizacion.variacion >= 0 ? '#28a745' : '#dc3545'}">
              ${cotizacion.variacion >= 0 ? '↗' : '↘'} ${cotizacion.variacion >= 0 ? '+' : ''}${cotizacion.variacion}%
            </span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11px; color: var(--muted);">Compra</span>
            <span style="font-size: 14px; font-weight: 700; color: #28a745;">$${cotizacion.compra}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11px; color: var(--muted);">Venta</span>
            <span style="font-size: 14px; font-weight: 700; color: #dc3545;">$${cotizacion.venta}</span>
          </div>
        `;
        
        container.appendChild(card);
      });
      
      actualizacionElement.textContent = `Actualizado: ${new Date().toLocaleTimeString('es-AR')}`;
      
    } catch (error) {
      console.error('Error cargando cotizaciones:', error);
      // Fallback a datos de ejemplo más realistas
      this.mostrarDatosEjemplo(element);
    }
  },

  async obtenerDeDolarAPI() {
    try {
      // API principal: DolarAPI (muy confiable)
      const response = await fetch('https://dolarapi.com/v1/dolares');
      
      if (!response.ok) {
        throw new Error('Error en la respuesta de la API');
      }
      
      const data = await response.json();
      
      // Procesar los tipos de dólar más relevantes
      const cotizaciones = [];
      
      // Mapear los tipos de la API a nuestros nombres
      const tiposMapeo = {
        'blue': { nombre: 'Dólar Blue', emoji: '💙' },
        'oficial': { nombre: 'Dólar Oficial', emoji: '💵' },
        'bolsa': { nombre: 'Dólar MEP', emoji: '📈' },
        'contadoconliqui': { nombre: 'Dólar CCL', emoji: '💸' }
      };
      
      data.forEach(dolar => {
        const tipoInfo = tiposMapeo[dolar.casa];
        if (tipoInfo) {
          cotizaciones.push({
            nombre: tipoInfo.nombre,
            emoji: tipoInfo.emoji,
            compra: this.formatearPrecio(dolar.compra),
            venta: this.formatearPrecio(dolar.venta),
            variacion: 0 // Esta API no proporciona variación
          });
        }
      });
      
      return cotizaciones;
      
    } catch (error) {
      console.error('Error con DolarAPI:', error);
      // Intentar con API alternativa
      return await this.obtenerDeBluelytics();
    }
  },

  async obtenerDeBluelytics() {
    try {
      // API alternativa: Bluelytics
      const response = await fetch('https://api.bluelytics.com.ar/v2/latest');
      
      if (!response.ok) {
        throw new Error('Error en Bluelytics');
      }
      
      const data = await response.json();
      
      return [
        {
          nombre: 'Dólar Blue',
          emoji: '💙',
          compra: this.formatearPrecio(data.blue.value_buy),
          venta: this.formatearPrecio(data.blue.value_sell),
          variacion: 0
        },
        {
          nombre: 'Dólar Oficial',
          emoji: '💵',
          compra: this.formatearPrecio(data.oficial.value_buy),
          venta: this.formatearPrecio(data.oficial.value_sell),
          variacion: 0
        }
      ];
      
    } catch (error) {
      console.error('Error con Bluelytics:', error);
      throw new Error('Todas las APIs fallaron');
    }
  },

  mostrarDatosEjemplo(element) {
    const container = element.querySelector('#cotizaciones-container');
    const actualizacionElement = element.querySelector('#ultima-actualizacion');
    
    // Datos de ejemplo realistas (actualizados aproximadamente)
    const datosEjemplo = [
      {
        nombre: 'Dólar Blue',
        emoji: '💙',
        compra: '980.50',
        venta: '990.25',
        variacion: 0.8
      },
      {
        nombre: 'Dólar Oficial',
        emoji: '💵',
        compra: '835.75',
        venta: '845.50',
        variacion: -0.1
      },
      {
        nombre: 'Dólar MEP',
        emoji: '📈',
        compra: '955.80',
        venta: '965.30',
        variacion: 0.4
      },
      {
        nombre: 'Dólar CCL',
        emoji: '💸',
        compra: '972.40',
        venta: '982.15',
        variacion: 0.3
      }
    ];
    
    container.innerHTML = '';
    
    datosEjemplo.forEach(cotizacion => {
      const card = document.createElement('div');
      card.style.cssText = `
        background: rgba(255,255,255,0.03);
        border-radius: 8px;
        padding: 10px;
        margin-bottom: 8px;
        border: 1px solid rgba(255,255,255,0.05);
        opacity: 0.8;
      `;
      
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 16px;">${cotizacion.emoji}</span>
            <span style="font-weight: 600; font-size: 12px;">${cotizacion.nombre}</span>
          </div>
          <span style="font-size: 10px; color: ${cotizacion.variacion >= 0 ? '#28a745' : '#dc3545'}">
            ${cotizacion.variacion >= 0 ? '↗' : '↘'} ${cotizacion.variacion >= 0 ? '+' : ''}${cotizacion.variacion}%
          </span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; color: var(--muted);">Compra</span>
          <span style="font-size: 14px; font-weight: 700; color: #28a745;">$${cotizacion.compra}</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; color: var(--muted);">Venta</span>
          <span style="font-size: 14px; font-weight: 700; color: #dc3545;">$${cotizacion.venta}</span>
        </div>
        <div style="text-align: center; margin-top: 4px;">
          <span style="font-size: 9px; color: var(--muted);">Datos de ejemplo</span>
        </div>
      `;
      
      container.appendChild(card);
    });
    
    actualizacionElement.textContent = `Último intento: ${new Date().toLocaleTimeString('es-AR')} (modo offline)`;
  },

  formatearPrecio(precio) {
    if (typeof precio === 'number') {
      return precio.toLocaleString('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
    
    if (typeof precio === 'string') {
      const numero = parseFloat(precio);
      return isNaN(numero) ? '0' : numero.toLocaleString('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
    
    return '0';
  },

  setupEventListeners(element) {
    const btnActualizar = element.querySelector('#btn-actualizar-cotizaciones');
    
    btnActualizar.addEventListener('click', async () => {
      btnActualizar.style.transform = 'rotate(180deg)';
      btnActualizar.style.transition = 'transform 0.3s ease';
      
      await this.cargarCotizaciones(element);
      
      setTimeout(() => {
        btnActualizar.style.transform = 'rotate(0deg)';
      }, 300);
    });
    
    // Actualizar automáticamente cada 2 minutos
    setInterval(() => {
      this.cargarCotizaciones(element);
    }, 2 * 60 * 1000);
  }
});
