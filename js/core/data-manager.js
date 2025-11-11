const DataManager = {
  async fetchData(force = false) {
    console.log('🔗 Conectando a Google Sheets...');
    
    // Actualizar estado de conexión SI EXISTE el elemento
    const connStatus = document.getElementById('conn-status');
    if (connStatus) connStatus.innerText = 'cargando...';

    try {
      const res = await fetch(CONFIG.GAS_ENDPOINT);
      if(!res.ok) throw new Error('Error: ' + res.status);
      const data = await res.json();
      
      // Actualizar estado SI EXISTE el elemento
      if (connStatus) connStatus.innerText = 'conectado';
      
      // Actualizar última sincronización SI EXISTE el elemento
      const lastSync = document.getElementById('last-sync');
      if (lastSync) lastSync.innerText = new Date().toLocaleString();
      
      console.log('📊 Datos recibidos de Google Sheets');
      return data;
    } catch(error) {
      console.error('❌ Error fetching data:', error);
      
      // Actualizar estado a error SI EXISTE el elemento
      if (connStatus) connStatus.innerText = 'error';
      
      // Devolver datos de prueba
      return {
        Caja_Movimientos: [
          {Saldo: 15000, Fecha: '2024-01-01'},
          {Saldo: 18000, Fecha: '2024-01-02'}
        ],
        Finanzas_RegistroDiario: [
          {Tipo: 'Ingreso', Monto: 5000, Fecha: '2024-01-01'},
          {Tipo: 'Egreso', Monto: 2000, Fecha: '2024-01-02'},
          {Tipo: 'Ingreso', Monto: 3000, Fecha: '2024-01-03'}
        ],
        "Cuentas_Pendientes": [
          {
            "Cliente/Proveedor": "Cliente A",
            "Tipo (A cobrar/A pagar)": "A cobrar", 
            "Importe": 5000,
            "Fecha Emisión": "2024-01-01",
            "Estado (Pendiente/Pagado)": "Pendiente"
          }
        ],
        "Inventario_RegistroDiario": [
          {
            "Fecha": "2024-01-01",
            "Tipo": "Alta",
            "Producto": "Producto 1",
            "Categoría": "Electrónicos",
            "Cantidad": 100,
            "Costo Unitario": 50,
            "Stock mínimo": 20,
            "Stock deseado": 200
          }
        ]
      };
    }
  }
};
