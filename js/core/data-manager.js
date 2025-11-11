// ====== GESTOR DE DATOS ======
const DataManager = {
  async fetchData(force = false) {
    if(!force) {
      const cached = UTILS.loadCache();
      if(cached) {
        document.getElementById('conn-status').innerText = 'cache local';
        return cached;
      }
    }

    document.getElementById('conn-status').innerText = 'cargando...';
    try {
      const res = await fetch(CONFIG.GAS_ENDPOINT);
      if(!res.ok) throw new Error('Error al consultar endpoint: ' + res.status);
      const data = await res.json();
      UTILS.saveCache(data);
      document.getElementById('conn-status').innerText = 'conectado';
      document.getElementById('last-sync').innerText = new Date().toLocaleString();
      return data;
    } catch(error) {
      document.getElementById('conn-status').innerText = 'error';
      throw error;
    }
  }
};
