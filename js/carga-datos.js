async enviarRegistro(registro) {
  try {
    console.log('📤 PREPARANDO ENVÍO DE REGISTRO:', registro);
    
    const datosEnvio = {
      action: 'insert',
      sheet: 'Finanzas_RegistroDiario',
      Fecha: registro.Fecha,
      Monto: registro.Monto.toString(),
      Tipo: registro.Tipo,
      Categoría: registro.Categoría,
      Subcategoría: registro.Subcategoría,
      MediodePago: registro['Medio de Pago'],
      Comprobante: registro.Comprobante,
      Descripción: registro.Descripción,
      Proyecto: registro.Proyecto,
      Responsable: registro.Responsable,
      ClienteProveedor: registro['Cliente/Proveedor'],
      IDRelacionado: registro['ID Relacionado'],
      Observaciones: registro.Observaciones,
      ReflejarenCaja: registro['Reflejar en Caja'],
      Mes: registro.Mes
    };

    Object.keys(datosEnvio).forEach(key => {
      if (datosEnvio[key] === '' || datosEnvio[key] === null || datosEnvio[key] === undefined) {
        delete datosEnvio[key];
      }
    });

    console.log('📨 Datos a enviar (limpios):', datosEnvio);

    const url = CONFIG.GAS_ENDPOINT + '?' + new URLSearchParams(datosEnvio);
    console.log('🔗 URL final:', url);

    const response = await fetch(url);
    console.log('📞 Respuesta HTTP:', response.status, response.statusText);

    const responseText = await response.text();
    console.log('📄 Respuesta cruda:', responseText);

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
    }

    const result = JSON.parse(responseText);
    console.log('✅ Resultado parseado:', result);

    if (!result.success) {
      throw new Error(result.error || 'Error desconocido del servidor');
    }

    return result;

  } catch (error) {
    console.error('❌ ERROR EN ENVIAR REGISTRO:', error);
    throw error;
  }
},
