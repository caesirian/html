// Configuración principal del sistema
const CONFIG = {
  // Endpoint de Google Apps Script
  GAS_ENDPOINT: "https://script.google.com/macros/s/AKfycbyTLrGiqes1VOp8E51Kq91P7YihPKNtN1f0f6u2JitXOteGyGrNXqiSjdXYJ8HAtfs/exec",
  
  // Configuración de cache
  CACHE_KEY: "hg_dashboard_cache_v6",
  CACHE_TTL: 1000 * 60 * 60, // 1 hora
  
  // Configuración de componentes del dashboard
  COMPONENTES_DISPONIBLES: [
    'saldoCaja',
    'ingresosVsEgresos', 
    'egresosVsAnterior',
    'cotizacionesMonedas',
    'analisisCategorias',
    'cuentasPendientes',
    'controlStock',
    'proyeccionFlujo',
    'calculadoraInversiones'
  ],
  
  COMPONENTES_POR_DEFECTO: {
    saldoCaja: true,
    ingresosVsEgresos: true,
    egresosVsAnterior: true,
    cotizacionesMonedas: true,
    analisisCategorias: false,
    cuentasPendientes: false,
    controlStock: false,
    proyeccionFlujo: false,
    calculadoraInversiones: false
  }
};
