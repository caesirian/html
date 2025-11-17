// Utilidades del sistema
const UTILS = {
  // Función para obtener nombre del mes
  getMonthName(monthNumber, short = false) {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const monthsShort = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return short ? monthsShort[monthNumber - 1] : months[monthNumber - 1];
  },

  // Función para formatear fecha
  formatDate(dateString) {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      return dateString;
    }
  },

  // Función para formatear moneda
  formatCurrency(n) {
    return '$ ' + (Number(n) || 0).toLocaleString('es-AR');
  },

  // Obtener fecha actual para inputs
  getCurrentDateForInput() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
};
