// data-manager.js - SOLUCIÓN FOCALIZADA EN PARSEO
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
      
      // DEBUG: Mostrar estructura de datos
      console.log('🔍 Estructura de datos recibida:');
      Object.keys(rawData).forEach(sheetName => {
        const sheetData = rawData[sheetName];
        console.log(`📊 ${sheetName}:`, Array.isArray(sheetData) ? `${sheetData.length} registros` : 'No es array');
        if (Array.isArray(sheetData) && sheetData.length > 0) {
          console.log('   Primer registro:', sheetData[0]);
        }
      });

      // Procesar solo los valores numéricos y fechas, mantener estructura
      const processedData = this.procesarValoresNumericos(rawData);
      
      UTILS.saveCache(processedData);
      console.log('✅ Datos procesados y guardados');
      
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

  procesarValoresNumericos(rawData) {
    const processed = {};
    
    for (const sheetName in rawData) {
      if (Array.isArray(rawData[sheetName])) {
        processed[sheetName] = rawData[sheetName].map(row => {
          const newRow = {};
          
          for (const key in row) {
            const value = row[key];
            
            // Solo procesar valores que parecen números o fechas
            if (this.esValorNumerico(key, value)) {
              newRow[key] = this.parsearValorNumerico(value);
            } else if (this.esFecha(key, value)) {
              newRow[key] = this.parsearFecha(value);
            } else {
              newRow[key] = value; // Mantener original
            }
          }
          
          return newRow;
        });
      } else {
        processed[sheetName] = rawData[sheetName];
      }
    }
    
    return processed;
  },

  esValorNumerico(key, value) {
    if (value === null || value === undefined || value === '') return false;
    
    const keyLower = key.toLowerCase();
    const esCampoNumerico = keyLower.includes('monto') || 
                           keyLower.includes('importe') || 
                           keyLower.includes('total') || 
                           keyLower.includes('saldo') ||
                           keyLower.includes('cantidad') ||
                           keyLower.includes('precio') ||
                           keyLower.includes('costo');
    
    if (!esCampoNumerico) return false;
    
    // Verificar si el valor ya es número
    if (typeof value === 'number') return true;
    
    // Verificar si parece ser un número
    const str = String(value).trim();
    return /^-?\d*[.,]?\d+$/.test(str) || /^\$?\s*-?\d{1,3}([.,]\d{3})*([.,]\d+)?$/.test(str);
  },

  esFecha(key, value) {
    if (value === null || value === undefined || value === '') return false;
    
    const keyLower = key.toLowerCase();
    const esCampoFecha = keyLower.includes('fecha') || keyLower.includes('date');
    
    if (!esCampoFecha) return false;
    
    // Verificar si ya es fecha válida
    if (value instanceof Date && !isNaN(value)) return true;
    
    // Verificar si parece fecha
    const str = String(value).trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(str) || 
           /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str) ||
           /^\d{1,2}\/\d{1,2}\/\d{2}$/.test(str);
  },

  parsearValorNumerico(value) {
    if (typeof value === 'number') return value;
    
    const str = String(value).trim();
    
    // Casos especiales
    if (str === '') return 0;
    if (str === '-') return 0;
    
    // Limpiar caracteres no numéricos excepto puntos, comas y signo negativo
    let limpio = str.replace(/[^\d,\-.]/g, '');
    
    // Si queda vacío, retornar 0
    if (!limpio) return 0;
    
    // Manejar formato europeo vs inglés
    const tieneComa = limpio.includes(',');
    const tienePunto = limpio.includes('.');
    
    if (tieneComa && tienePunto) {
      // Si tiene ambos, determinar cuál es separador decimal
      const ultimaComa = limpio.lastIndexOf(',');
      const ultimoPunto = limpio.lastIndexOf('.');
      
      if (ultimaComa > ultimoPunto) {
        // Formato: 1.000,00 (europeo)
        limpio = limpio.replace(/\./g, '').replace(',', '.');
      } else {
        // Formato: 1,000.00 (inglés)
        limpio = limpio.replace(/,/g, '');
      }
    } else if (tieneComa) {
      // Solo comas - verificar si es decimal
      const partes = limpio.split(',');
      if (partes.length === 2 && partes[1].length <= 2) {
        // Probable decimal: 1234,56
        limpio = limpio.replace(',', '.');
      } else {
        // Probable miles: 1,234,567
        limpio = limpio.replace(/,/g, '');
      }
    }
    // Si solo tiene puntos, dejarlo (asumir formato inglés)
    
    const numero = parseFloat(limpio);
    return isNaN(numero) ? 0 : numero;
  },

  parsearFecha(value) {
    if (value instanceof Date) return value;
    
    const str = String(value).trim();
    
    // Ya está en formato YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    
    // Formato DD/MM/YYYY o DD/MM/YY
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str) || /^\d{1,2}\/\d{1,2}\/\d{2}$/.test(str)) {
      const [day, month, year] = str.split('/');
      const fullYear = year.length === 2 ? `20${year}` : year;
      return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    // Timestamp de Google Sheets (días desde 1899-12-30)
    if (/^\d+$/.test(str)) {
      const timestamp = parseInt(str);
      const fecha = new Date(Date.UTC(1899, 11, 30));
      fecha.setUTCDate(fecha.getUTCDate() + timestamp);
      return fecha.toISOString().split('T')[0];
    }
    
    // Devolver original si no se puede parsear
    return str;
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
