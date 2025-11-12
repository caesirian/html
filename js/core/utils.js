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
  // Nueva función para formatear fecha
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
    const s = String(val).replace(/[^0-9\-,\.]/g,"").trim();
    if(!s) return 0;
    const parts = s.split(',');
    if(parts.length > 1 && parts[0].includes('.')) {
      return parseFloat(s.replace(/\./g,'').replace(',','.')) || 0;
    }
    return parseFloat(s.replace(',', '.')) || 0;
  },

  parseDate(v) {
    if(!v) return new Date(NaN);
    if(v instanceof Date) return v;
    const s = String(v).trim();
    if(/^\d{4}-\d{2}-\d{2}/.test(s)) return new Date(s);
    if(/^\d{2}\/\d{2}\/\d{4}/.test(s)) {
      const [d,m,y] = s.split('/');
      return new Date(Number(y), Number(m)-1, Number(d));
    }
    const n = Number(s);
    if(!isNaN(n) && n > 1000) {
      const epoch = new Date(Date.UTC(1899,11,30));
      epoch.setUTCDate(epoch.getUTCDate() + Math.floor(n));
      return epoch;
    }
    return new Date(s);
  },

  formatCurrency(n) {
    const sign = n < 0 ? '-' : '';
    const abs = Math.abs(Number(n) || 0);
    return sign + '$' + abs.toLocaleString('es-AR', {minimumFractionDigits:0, maximumFractionDigits:0});
  },

  saveCache(obj) {
    localStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify({ts: Date.now(), data: obj}));
    document.getElementById('cache-status').innerText = 'sí';
  },
  getMonthName(monthNumber, short = false) {
    const months = [
      'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
      'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
    ];
    const monthsShort = [
      'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
      'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'
    ];
    
    return short ? monthsShort[monthNumber - 1] : months[monthNumber - 1];
  },

  formatMonthKey(mesKey, short = false) {
    if (!mesKey || !mesKey.includes('-')) return mesKey;
    const [year, month] = mesKey.split('-');
    const monthName = this.getMonthName(parseInt(month), short);
    return short ? `${monthName} ${year}` : `${monthName} ${year}`;
  },

  loadCache() {
    try {
      const raw = localStorage.getItem(CONFIG.CACHE_KEY);
      if(!raw) return null;
      const parsed = JSON.parse(raw);
      if(Date.now() - parsed.ts > CONFIG.CACHE_TTL) return null;
      return parsed.data;
    } catch(e) {
      return null;
    }
  }
};

// Agregar estas funciones a utils.js si no existen
UTILS.formatDateForInput = function(dateString) {
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
};

UTILS.getCurrentDateForInput = function() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
