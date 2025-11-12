// config.js
const CONFIG = {
  GAS_ENDPOINT: "https://script.google.com/macros/s/AKfycbyTLrGiqes1VOp8E51Kq91P7YihPKNtN1f0f6u2JitXOteGyGrNXqiSjdXYJ8HAtfs/exec",
  CACHE_KEY: "hg_dashboard_cache_v6",
  CACHE_TTL: 1000 * 60 * 60,
  
  // Estos ahora se derivan del registro
  get COMPONENTES_DISPONIBLES() {
    return Object.keys(ComponentsRegistry.getAll());
  },
  
  get COMPONENTES_POR_DEFECTO() {
    const defaultActive = ComponentsRegistry.getDefaultActive();
    return Object.keys(ComponentsRegistry.getAll()).reduce((acc, id) => {
      acc[id] = defaultActive[id] ? true : false;
      return acc;
    }, {});
  }
};
