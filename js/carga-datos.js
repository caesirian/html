// Reemplazar la función enviarRegistro con esta versión mejorada
async enviarRegistro(registro) {
  try {
    console.log('📤 Enviando registro:', registro);
    
    const endpoint = CONFIG.GAS_ENDPOINT;
    
    // Construir URL con parámetros
    const url = new URL(endpoint);
    url.searchParams.append('action', 'insert');
    url.searchParams.append('sheet', 'Finanzas_RegistroDiario');
    
    // Agregar todos los campos del registro
    Object.keys(registro).forEach(key => {
      if (registro[key] !== null && registro[key] !== undefined && registro[key] !== '') {
        url.searchParams.append(key, registro[key]);
      }
    });

    console.log('🔗 URL de envío:', url.toString());

    const response = await fetch(url.toString(), {
      method: 'GET', // Cambiar a GET ya que GAS funciona con doGet
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📨 Respuesta del servidor:', response.status, response.statusText);

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Resultado del servidor:', result);

    if (result.success !== true) {
      throw new Error(result.error || 'Error desconocido al guardar');
    }

    return result;

  } catch (error) {
    console.error('❌ Error en enviarRegistro:', error);
    throw error;
  }
},
