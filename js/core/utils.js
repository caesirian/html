const UTILS = {
  // Función para obtener nombre del mes en mayúsculas
  getMonthName(monthNumber, short = false) {
    const months = [
      'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
      'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
    ];
    const monthsShort = [
      'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
      'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'
    ];
    
    if (monthNumber < 1 || monthNumber > 12) return '';
    return short ? monthsShort[monthNumber - 1] : months[monthNumber - 1];
  },

  // Función para formatear clave de mes (ej: "2024-01" → "ENE 2024")
  formatMonthKey(mesKey, short = false) {
    if (!mesKey || !mesKey.includes('-')) return mesKey;
    const [year, month] = mesKey.split('-');
    const monthName = this.getMonthName(parseInt(month), short);
    return short ? `${monthName} ${year}` : `${monthName} ${year}`;
  },

  // Función para obtener el mes anterior
  getPreviousMonth(mesKey) {
    if (!mesKey || !mesKey.includes('-')) return '';
    const [year, month] = mesKey.split('-');
    let prevYear = parseInt(year);
    let prevMonth = parseInt(month) - 1;
    
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear--;
    }
    
    return `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
  },

  // Función para formatear fecha
  formatDate(dateString) {
    if (!dateString) return '';
    
    try {
      const date = this.parseDate(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return dateString;
    }
  },
  
parseNumber(val) {
  if(val === null || val === undefined || val === "") return 0;
  if(typeof val === "number") return val;
  
  let s = String(val).trim();
  
  // Casos especiales
  if(s === '' || s === '-' || s === '.') return 0;
  
  // Remover símbolos de moneda, espacios y caracteres no numéricos
  s = s.replace(/[^\d,\-.]/g, '');
  
  // Si no queda nada, retornar 0
  if(!s) return 0;
  
  // Manejar negativo
  const esNegativo = s.startsWith('-');
  if(esNegativo) {
    s = s.substring(1);
  }
  
  // Contar separadores
  const tieneComa = s.includes(',');
  const tienePunto = s.includes('.');
  
  // CASO 1: Sin separadores - número entero simple
  if(!tieneComa && !tienePunto) {
    const num = parseInt(s);
    return esNegativo ? -num : num;
  }
  
  // CASO 2: Solo coma
  if(tieneComa && !tienePunto) {
    const partes = s.split(',');
    // Si después de la coma hay 2-3 dígitos, es decimal europeo
    if(partes.length === 2 && (partes[1].length === 2 || partes[1].length === 3)) {
      s = partes[0] + '.' + partes[1]; // Convertir a formato inglés
    } else {
      s = s.replace(/,/g, ''); // Eliminar comas (miles)
    }
  }
  
  // CASO 3: Solo punto
  else if(!tieneComa && tienePunto) {
    const partes = s.split('.');
    // Si después del punto hay 2-3 dígitos, es decimal inglés
    if(partes.length === 2 && (partes[1].length === 2 || partes[1].length === 3)) {
      // Ya está en formato inglés, dejar igual
    } else {
      s = s.replace(/\./g, ''); // Eliminar puntos (miles)
    }
  }
  
  // CASO 4: Ambos separadores
  else if(tieneComa && tienePunto) {
    const ultimaComa = s.lastIndexOf(',');
    const ultimoPunto = s.lastIndexOf('.');
    
    if(ultimaComa > ultimoPunto) {
      // Formato: 1.000,00 (europeo)
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      // Formato: 1,000.00 (inglés)
      s = s.replace(/,/g, '');
    }
  }
  
  const numero = parseFloat(s);
  return isNaN(numero) ? 0 : (esNegativo ? -numero : numero);
},

  parseDate(v) {
  if(!v) return new Date(NaN);
  if(v instanceof Date) return v;
  
  const s = String(v).trim();
  
  // DEBUG: Ver qué está llegando
  console.log('Parseando fecha:', s);
  
  // 1. Formato ISO con timezone: '2025-08-01T03:00:00.000Z'
  if(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(s)) {
    const date = new Date(s);
    console.log('Fecha ISO parseada:', date);
    return date;
  }
  
  // 2. Formato YYYY-MM-DD simple
  if(/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split('-');
    return new Date(Number(y), Number(m)-1, Number(d));
  }
  
  // 3. Formato DD/MM/YYYY
  if(/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
    const [d, m, y] = s.split('/');
    return new Date(Number(y), Number(m)-1, Number(d));
  }
  
  // 4. Timestamp de Google Sheets (días desde 1899-12-30)
  const n = Number(s);
  if(!isNaN(n) && n > 1000) {
    const epoch = new Date(Date.UTC(1899,11,30));
    epoch.setUTCDate(epoch.getUTCDate() + Math.floor(n));
    return epoch;
  }
  
  // 5. Intentar parseo nativo como último recurso
  const date = new Date(s);
  if(!isNaN(date.getTime())) {
    return date;
  }
  
  console.warn('No se pudo parsear fecha:', s);
  return new Date(NaN);
},

  formatCurrency(n) {
    const sign = n < 0 ? '-' : '';
    const abs = Math.abs(Number(n) || 0);
    return sign + '$' + abs.toLocaleString('es-AR', {minimumFractionDigits:0, maximumFractionDigits:0});
  },

  saveCache(obj) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify({ts: Date.now(), data: obj}));
      const cacheStatus = document.getElementById('cache-status');
      if (cacheStatus) cacheStatus.innerText = 'sí';
    }
  },

  loadCache() {
    try {
      if (typeof localStorage === 'undefined') return null;
      const raw = localStorage.getItem(CONFIG.CACHE_KEY);
      if(!raw) return null;
      const parsed = JSON.parse(raw);
      if(Date.now() - parsed.ts > CONFIG.CACHE_TTL) return null;
      return parsed.data;
    } catch(e) {
      return null;
    }
  },

  formatDateForInput(dateString) {
    if (!dateString) return '';
    
    try {
      const date = this.parseDate(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error formateando fecha para input:', error);
      return dateString;
    }
  },

  getCurrentDateForInput() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
};
