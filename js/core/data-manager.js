const DataManager = {
  async fetchData(force = false) {
    console.time('📊 Tiempo carga datos');
    
    // Intentar cache primero si no es forzado
    if (!force) {
      const cached = UTILS.loadCache();
      if (cached) {
        console.timeEnd('📊 Tiempo carga datos');
        console.log('✅ Datos cargados desde cache');
        return cached;
      }
    }

    const connStatus = document.getElementById('conn-status');
    if (connStatus) connStatus.innerText = 'cargando...';

    try {
      // Timeout de 8 segundos para la petición
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const res = await fetch(CONFIG.GAS_ENDPOINT, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) throw new Error('Error: ' + res.status);
      
      const data = await res.json();
      
      if (connStatus) connStatus.innerText = 'conectado';
      
      const lastSync = document.getElementById('last-sync');
      if (lastSync) lastSync.innerText = new Date().toLocaleString();
      
      // Guardar en cache
      UTILS.saveCache(data);
      
      console.timeEnd('📊 Tiempo carga datos');
      console.log('✅ Datos cargados desde API');
      return data;
      
    } catch(error) {
      console.timeEnd('📊 Tiempo carga datos');
      console.error('❌ Error fetching data:', error);
      
      if (connStatus) connStatus.innerText = 'error';
      
      // Intentar devolver cache incluso si está expirado como fallback
      const cachedFallback = UTILS.loadCache();
      if (cachedFallback) {
        console.log('🔄 Usando cache como fallback');
        return cachedFallback;
      }
      
      // Datos de prueba como último recurso
      return this.getDatosPrueba();
    }
  },

  getDatosPrueba() {
    console.log('🔄 Cargando datos de prueba...');
    return {
      Caja_Movimientos: [
        {Saldo: 15000, Fecha: new Date().toISOString().split('T')[0]}
      ],
      Finanzas_RegistroDiario: [
        {Tipo: 'Ingreso', Monto: 5000, Fecha: new Date().toISOString().split('T')[0]},
        {Tipo: 'Egreso', Monto: 2000, Fecha: new Date().toISOString().split('T')[0]}
      ],
      "Cuentas_Pendientes": [],
      "Inventario_RegistroDiario": []
    };
  }
};
