// data-manager.js - VERSIÓN MEJORADA
const DataManager = {
  async fetchData(force = false) {
    console.time('📊 Tiempo carga datos');
    
    // Intentar cache primero si no es forzado
    if (!force) {
      const cached = UTILS.loadCache();
      if (cached) {
        console.timeEnd('📊 Tiempo carga datos');
        console.log('✅ Datos cargados desde cache');
        return cached;
      }
    }

    const connStatus = document.getElementById('conn-status');
    if (connStatus) connStatus.innerText = 'cargando...';

    try {
      // Timeout de 15 segundos para la petición (más tiempo)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      console.log('🌐 Intentando conectar a:', CONFIG.GAS_ENDPOINT);
      
      const res = await fetch(CONFIG.GAS_ENDPOINT, {
        signal: controller.signal,
        method: 'GET',
        mode: 'cors'
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        throw new Error(`Error HTTP: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      
      if (connStatus) connStatus.innerText = 'conectado';
      
      const lastSync = document.getElementById('last-sync');
      if (lastSync) lastSync.innerText = new Date().toLocaleString();
      
      // Validar que los datos tengan la estructura esperada
      if (!this.validarEstructuraDatos(data)) {
        throw new Error('Estructura de datos inválida del servidor');
      }
      
      // Guardar en cache
      UTILS.saveCache(data);
      
      console.timeEnd('📊 Tiempo carga datos');
      console.log('✅ Datos cargados desde API:', data);
      return data;
      
    } catch(error) {
      console.timeEnd('📊 Tiempo carga datos');
      console.error('❌ Error fetching data:', error);
      
      if (connStatus) connStatus.innerText = 'error';
      
      // Intentar devolver cache incluso si está expirado como fallback
      const cachedFallback = UTILS.loadCache();
      if (cachedFallback) {
        console.log('🔄 Usando cache como fallback');
        return cachedFallback;
      }
      
      // Datos de prueba como último recurso
      console.log('🔄 Cargando datos de prueba...');
      return this.getDatosPrueba();
    }
  },

  validarEstructuraDatos(data) {
    if (!data || typeof data !== 'object') {
      console.warn('❌ Datos no son un objeto válido');
      return false;
    }
    
    // Verificar que tenga al menos una de las estructuras esperadas
    const tieneDatos = 
      Array.isArray(data.Finanzas_RegistroDiario) ||
      Array.isArray(data.Caja_Movimientos) ||
      Array.isArray(data.Inventario_RegistroDiario) ||
      Array.isArray(data.Cuentas_Pendientes);
    
    if (!tieneDatos) {
      console.warn('❌ Datos no tienen estructura esperada:', Object.keys(data));
    }
    
    return tieneDatos;
  },

  getDatosPrueba() {
    console.log('🔄 Cargando datos de prueba MEJORADOS...');
    
    // Crear datos de prueba más realistas
    const fecha = new Date();
    const mesActual = fecha.getMonth() + 1;
    const añoActual = fecha.getFullYear();
    
    return {
      Finanzas_RegistroDiario: [
        {
          Fecha: `${añoActual}-${mesActual.toString().padStart(2, '0')}-01`,
          Tipo: 'Ingreso',
          Monto: 15000,
          Categoría: 'Ventas',
          Descripción: 'Venta producto A'
        },
        {
          Fecha: `${añoActual}-${mesActual.toString().padStart(2, '0')}-05`,
          Tipo: 'Egreso', 
          Monto: 5000,
          Categoría: 'Gastos Operativos',
          Descripción: 'Pago servicios'
        },
        {
          Fecha: `${añoActual}-${mesActual.toString().padStart(2, '0')}-10`,
          Tipo: 'Ingreso',
          Monto: 8000,
          Categoría: 'Ventas',
          Descripción: 'Venta producto B'
        }
      ],
      Caja_Movimientos: [
        {
          Fecha: `${añoActual}-${mesActual.toString().padStart(2, '0')}-15`,
          Saldo: 18000,
          Descripción: 'Saldo actual'
        }
      ],
      Inventario_RegistroDiario: [
        {
          Producto: 'Producto A',
          Categoría: 'Electrónicos',
          Tipo: 'Alta',
          Cantidad: 100,
          'Costo Unitario': 50,
          'Stock mínimo': 20,
          'Stock deseado': 200,
          Fecha: `${añoActual}-${mesActual.toString().padStart(2, '0')}-01`
        },
        {
          Producto: 'Producto B', 
          Categoría: 'Electrónicos',
          Tipo: 'Baja',
          Cantidad: 10,
          'Costo Unitario': 30,
          'Stock mínimo': 15,
          'Stock deseado': 150,
          Fecha: `${añoActual}-${mesActual.toString().padStart(2, '0')}-05`
        }
      ],
      Cuentas_Pendientes: [
        {
          Cliente: 'Cliente A',
          Monto: 5000,
          Vencimiento: `${añoActual}-${(mesActual + 1).toString().padStart(2, '0')}-01`,
          Estado: 'Pendiente'
        }
      ]
    };
  }
};
