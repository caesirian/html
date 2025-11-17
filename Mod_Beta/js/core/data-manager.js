// Gestor de datos - Conexión con Google Sheets
const DataManager = {
  async fetchData(force = false) {
    console.log('📡 Iniciando carga de datos...');
    
    // Verificar cache
    if (!force) {
      const cached = UTILS.loadCache();
      if (cached) {
        console.log('✅ Usando cache');
        return cached;
      }
    }

    try {
      const url = CONFIG.GAS_ENDPOINT + '?t=' + Date.now();
      console.log('🌐 Conectando:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Error: ' + response.status);
      }
      
      const rawData = await response.json();
      console.log('📦 Datos crudos recibidos');
      
      // Normalizar nombres de campos
      const processedData = this.procesarDatos(rawData);
      
      UTILS.saveCache(processedData);
      console.log('✅ Datos normalizados y guardados');
      
      return processedData;
      
    } catch(error) {
      console.error('❌ Error:', error.message);
      
      // Intentar usar cache como fallback
      const cached = UTILS.loadCache();
      if (cached) {
        console.log('🔄 Usando cache como fallback');
        return cached;
      }
      
      console.log('🔄 Usando datos de prueba');
      return this.getDatosPrueba();
    }
  },

  // Normalizar nombres de campos
  procesarDatos(rawData) {
    const processed = {};
    
    for (const sheetName in rawData) {
      if (Array.isArray(rawData[sheetName])) {
        processed[sheetName] = rawData[sheetName].map(row => {
          const newRow = {};
          
          for (const key in row) {
            // Normalizar nombres de campos problemáticos
            let newKey = key;
            
            if (key === 'Tipo (Ingreso/Egreso)' || key.toLowerCase().includes('tipo')) {
              newKey = 'Tipo';
            } else if (key === 'Fecha' || key.toLowerCase().includes('fecha')) {
              newKey = 'Fecha';
            } else if (key === 'Monto' || key.toLowerCase().includes('monto')) {
              newKey = 'Monto';
            } else {
              newKey = key;
            }
            
            newRow[newKey] = row[key];
          }
          
          return newRow;
        });
      } else {
        processed[sheetName] = rawData[sheetName];
      }
    }
    
    console.log('✅ Datos normalizados');
    return processed;
  },

  // Datos de prueba para desarrollo
  getDatosPrueba() {
    const fecha = new Date().toISOString().split('T')[0];
    const mesAnterior = new Date();
    mesAnterior.setMonth(mesAnterior.getMonth() - 1);
    const fechaAnterior = mesAnterior.toISOString().split('T')[0];
    
    return {
      Finanzas_RegistroDiario: [
        {
          ID: '1',
          Fecha: fecha,
          Tipo: 'Ingreso',
          Monto: 15000,
          Categoría: 'Ventas',
          Descripción: 'Venta de productos A',
          'Cliente/Proveedor': 'Cliente XYZ',
          Estado: 'Cobrado'
        },
        {
          ID: '2',
          Fecha: fecha,
          Tipo: 'Egreso',
          Monto: 5000,
          Categoría: 'Compras',
          Descripción: 'Compra de insumos',
          'Cliente/Proveedor': 'Proveedor ABC',
          Estado: 'Pagado'
        }
      ],
      Clientes: [
        {
          ID: '1',
          Nombre: 'Cliente XYZ',
          Tipo: 'Empresa',
          Categoria: 'A - Premium',
          Estado: 'Activo',
          Email: 'contacto@clientexyz.com',
          Telefono: '+54 11 1234-5678'
        },
        {
          ID: '2', 
          Nombre: 'Cliente Personal',
          Tipo: 'Particular',
          Categoria: 'B - Regular',
          Estado: 'Activo',
          Email: 'cliente@personal.com',
          Telefono: '+54 11 8765-4321'
        }
      ],
      Productos: [
        {
          ID: '1',
          Nombre: 'Producto A',
          Categoria: 'Electrónicos',
          Precio: 1500,
          Stock: 25,
          'Stock Mínimo': 10
        },
        {
          ID: '2',
          Nombre: 'Producto B', 
          Categoria: 'Oficina',
          Precio: 500,
          Stock: 8,
          'Stock Mínimo': 15
        }
      ]
    };
  },

  // Método para enviar datos al servidor
  async enviarDatos(sheet, datos, accion = 'insert') {
    try {
      const datosEnvio = {
        action: accion,
        sheet: sheet,
        ...datos
      };

      const url = CONFIG.GAS_ENDPOINT + '?' + new URLSearchParams(datosEnvio);
      console.log('📤 Enviando datos:', datosEnvio);

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Respuesta del servidor:', result);

      return result;

    } catch (error) {
      console.error('❌ Error enviando datos:', error);
      throw error;
    }
  }
};
