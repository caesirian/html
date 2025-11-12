// config.js
const CONFIG = {
  GAS_ENDPOINT: "https://script.google.com/macros/s/AKfycbyTLrGiqes1VOp8E51Kq91P7YihPKNtN1f0f6u2JitXOteGyGrNXqiSjdXYJ8HAtfs/exec",
  CACHE_KEY: "hg_dashboard_cache_v5",
  CACHE_TTL: 1000 * 60 * 60,
  
  // Componentes disponibles
  COMPONENTES_DISPONIBLES: [
    'saldoCaja',
    'ingresosVsEgresos',
    'egresosVsAnterior', 
    'cotizacionesMonedas',
    'analisisCategorias',
    'cuentasPendientes',
        'proyeccionFlujo',
    'controlStock'
  ],
  
  // Configuración por defecto (qué componentes mostrar inicialmente)
  COMPONENTES_POR_DEFECTO: {
    saldoCaja: true,
    ingresosVsEgresos: true,
    egresosVsAnterior: true,
    cotizacionesMonedas: true,
    analisisCategorias: false,
    cuentasPendientes: false,
    proyeccionFlujo:true,
    controlStock: false
  }
};
