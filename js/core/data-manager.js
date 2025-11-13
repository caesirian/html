// data-manager.js - MEJOR PARSEO DE DATOS
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
      
      // Procesar y normalizar los datos
      const processedData = this.procesarDatos(rawData);
      
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

  procesarDatos(rawData) {
    const processed = {};
    
    // Procesar cada hoja
    for (const sheetName in rawData) {
      if (Array.isArray(rawData[sheetName])) {
        processed[sheetName] = this.procesarHoja(rawData[sheetName], sheetName);
      }
    }
    
    return processed;
  },

  procesarHoja(datos, nombreHoja) {
    if (!datos || datos.length === 0) return [];
    
    console.log(`📊 Procesando hoja: ${nombreHoja} con ${datos.length} registros`);
    
    return datos.map((fila, index) => {
      const filaProcesada = {};
      
      for (const key in fila) {
        if (fila.hasOwnProperty(key)) {
          const valor = fila[key];
          const nuevoKey = this.normalizarKey(key);
          filaProcesada[nuevoKey] = this.procesarValor(valor, nuevoKey, nombreHoja);
        }
      }
      
      // Agregar ID si no existe
      if (!filaProcesada.id && !filaProcesada.ID) {
        filaProcesada.ID = `auto_${nombreHoja}_${index}`;
      }
      
      return filaProcesada;
    });
  },

  normalizarKey(key) {
    // Normalizar nombres de columnas
    const mappings = {
      'fecha': 'Fecha',
      'date': 'Fecha',
      'monto': 'Monto',
      'amount': 'Monto',
      'tipo': 'Tipo',
      'type': 'Tipo',
      'categoria': 'Categoría',
      'category': 'Categoría',
      'saldo': 'Saldo',
      'balance': 'Saldo',
      'descripcion': 'Descripción',
      'description': 'Descripción'
    };
    
    const keyLower = key.toLowerCase().trim();
    return mappings[keyLower] || key;
  },

  procesarValor(valor, key, sheetName) {
    if (valor === null || valor === undefined || valor === '') {
      return '';
    }
    
    // Convertir a string para procesar
    const strValor = String(valor).trim();
    
    // Procesar según el tipo de campo
    switch (key.toLowerCase()) {
      case 'monto':
      case 'saldo':
      case 'amount':
      case 'balance':
        return this.procesarNumero(strValor);
        
      case 'fecha':
      case 'date':
        return this.procesarFecha(strValor);
        
      case 'tipo':
      case 'type':
        return this.procesarTipo(strValor);
        
      default:
        return strValor;
    }
  },

  procesarNumero(str) {
    // Limpiar y convertir número
    if (!str) return 0;
    
    // Remover caracteres no numéricos excepto puntos, comas y signos negativos
    let limpio = str.replace(/[^\d,\-.]/g, '');
    
    // Si está vacío después de limpiar, retornar 0
    if (!limpio) return 0;
    
    // Determinar si usa coma o punto como separador decimal
    const tieneComa = limpio.includes(',');
    const tienePunto = limpio.includes('.');
    
    if (tieneComa && tienePunto) {
      // Si tiene ambos, asumir que las comas son miles y el punto es decimal
      // o viceversa - analizar posiciones
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
      // Solo tiene comas - verificar si es decimal o miles
      const partes = limpio.split(',');
      if (partes.length === 2 && partes[1].length <= 2) {
        // Probable formato europeo: 1234,56
        limpio = limpio.replace(',', '.');
      } else {
        // Probable formato con comas como miles: 1,234,567
        limpio = limpio.replace(/,/g, '');
      }
    }
    // Si solo tiene puntos, dejarlo como está (asumir formato inglés)
    
    const numero = parseFloat(limpio);
    return isNaN(numero) ? 0 : numero;
  },

  procesarFecha(str) {
    if (!str) return '';
    
    // Intentar diferentes formatos de fecha
    const formatos = [
      // YYYY-MM-DD
      /^(\d{4})-(\d{1,2})-(\d{1,2})/,
      // DD/MM/YYYY
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})/,
      // MM/DD/YYYY  
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})/,
      // Timestamp de Google Sheets
      /^(\d+)$/
    ];
    
    for (const formato of formatos) {
      const match = str.match(formato);
      if (match) {
        if (formato.source === /^(\d+)$/.source) {
          // Timestamp de Google Sheets (días desde 1899-12-30)
          const timestamp = parseInt(match[1]);
          const fecha = new Date(Date.UTC(1899, 11, 30));
          fecha.setUTCDate(fecha.getUTCDate() + timestamp);
          return fecha.toISOString().split('T')[0];
        } else if (formato.source === /^(\d{4})-(\d{1,2})-(\d{1,2})/.source) {
          // YYYY-MM-DD
          return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
        } else {
          // DD/MM/YYYY o MM/DD/YYYY - asumir DD/MM/YYYY para Argentina
          const [_, d, m, y] = match;
          return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }
      }
    }
    
    // Si no coincide con ningún formato, devolver original
    return str;
  },

  procesarTipo(str) {
    if (!str) return '';
    
    const strLower = str.toLowerCase();
    if (strLower.includes('ingreso') || strLower.includes('income') || strLower.includes('entrada')) {
      return 'Ingreso';
    } else if (strLower.includes('egreso') || strLower.includes('expense') || strLower.includes('gasto') || strLower.includes('salida')) {
      return 'Egreso';
    }
    
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
