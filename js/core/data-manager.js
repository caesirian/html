// data-manager.js - VERSIÓN COMPLETA CON NORMALIZACIÓN
const DataManager = {
  async fetchData(force = false) {
    console.log('📡 Iniciando carga de datos...');
    
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
      
      // DEBUG: Mostrar campos antes de normalizar
      console.log('🔍 CAMPOS ANTES DE NORMALIZAR:', Object.keys(rawData.Finanzas_RegistroDiario?.[0] || {}));
      
      // Normalizar nombres de campos
      const processedData = this.procesarDatos(rawData);
      
      // DEBUG: Mostrar campos después de normalizar
      console.log('🔍 CAMPOS DESPUÉS DE NORMALIZAR:', Object.keys(processedData.Finanzas_RegistroDiario?.[0] || {}));
      
      UTILS.saveCache(processedData);
      console.log('✅ Datos normalizados y guardados');
      
      return processedData;
      
    } catch(error) {
      console.error('❌ Error:', error.message);
      
      const cached = UTILS.loadCache();
      if (cached) {
        console.log('🔄 Usando cache como fallback');
        return cached;
      }
      
      console.log('🔄 Usando datos de prueba');
      return this.getDatosPrueba();
    }
  },

  procesarDatos(rawData) {
    const processed = {};
    
    for (const sheetName in rawData) {
      if (Array.isArray(rawData[sheetName])) {
        processed[sheetName] = rawData[sheetName].map(row => {
          const newRow = {};
          
          for (const key in row) {
            // Normalizar nombres de campos problemáticos
            let newKey = key;
            
            // Normalizar campo "Tipo (Ingreso/Egreso)" → "Tipo"
            if (key === 'Tipo (Ingreso/Egreso)' || key.toLowerCase().includes('tipo')) {
              newKey = 'Tipo';
            }
            // Normalizar campo "Fecha" (mantener igual)
            else if (key === 'Fecha' || key.toLowerCase().includes('fecha')) {
              newKey = 'Fecha';
            }
            // Normalizar campo "Monto" (mantener igual) 
            else if (key === 'Monto' || key.toLowerCase().includes('monto')) {
              newKey = 'Monto';
            }
            // Mantener otros campos igual
            else {
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

  getDatosPrueba() {
    const fecha = new Date().toISOString().split('T')[0];
    
    return {
      Finanzas_RegistroDiario: [
        {
          Fecha: fecha,
          Tipo: 'Ingreso',
          Monto: 15000,
          Categoría: 'Ventas',
          Descripción: 'Ejemplo de ingreso'
        }
      ],
      Caja_Movimientos: [
        {
          Fecha: fecha,
          Saldo: 18000,
          Descripción: 'Saldo actual'
        }
      ]
    };
  }
};
