// js/core/component-manager.js - ARCHIVO COMPLETO CORREGIDO
const ComponentManager = {
  config: {},
  
  init() {
    this.loadConfig();
  },
  
  loadConfig() {
    try {
      var saved = localStorage.getItem('dashboard_components_config');
      if (saved) {
        this.config = JSON.parse(saved);
        
        // Limpiar componentes que ya no existen
        for (var id in this.config) {
          if (this.config.hasOwnProperty(id)) {
            if (!this.componentExists(id)) {
              delete this.config[id];
            }
          }
        }
        
        // Agregar nuevos componentes que no están en la configuración
        var allComponents = this.getAllComponents();
        for (var id in allComponents) {
          if (allComponents.hasOwnProperty(id)) {
            if (this.config[id] === undefined) {
              var componentConfig = allComponents[id];
              this.config[id] = componentConfig.defaultActive;
            }
          }
        }
      } else {
        // Configuración por defecto
        this.config = {};
        var allComponents = this.getAllComponents();
        for (var id in allComponents) {
          if (allComponents.hasOwnProperty(id)) {
            var componentConfig = allComponents[id];
            this.config[id] = componentConfig.defaultActive;
          }
        }
        this.saveConfig();
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
      // Fallback
      this.config = {
        saldoCaja: true,
        ingresosVsEgresos: true,
        egresosVsAnterior: true,
        cotizacionesMonedas: true,
        analisisCategorias: false,
        cuentasPendientes: false,
        controlStock: false,
        proyeccionFlujo: false,
        calculadoraInversiones: false
      };
    }
  },
  
  saveConfig() {
    try {
      localStorage.setItem('dashboard_components_config', JSON.stringify(this.config));
    } catch (error) {
      console.error('Error guardando configuración:', error);
    }
  },
  
  getActiveComponents() {
    var active = [];
    for (var id in this.config) {
      if (this.config.hasOwnProperty(id) && this.config[id] === true) {
        active.push(id);
      }
    }
    return active;
  },
  
  // NUEVA FUNCIÓN: Obtener información de un componente
  getComponentInfo(componentId) {
    var allComponents = this.getAllComponents();
    var config = allComponents[componentId];
    
    if (config) {
      return {
        name: config.name,
        category: config.category,
        grid: config.grid,
        description: config.description
      };
    }
    
    // Fallback para componentes no configurados
    return { 
      name: componentId, 
      category: 'liviano', 
      grid: 'span-6',
      description: 'Componente no configurado'
    };
  },
  
  // NUEVA FUNCIÓN: Verificar si un componente existe
  componentExists(componentId) {
    var allComponents = this.getAllComponents();
    return allComponents.hasOwnProperty(componentId);
  },
  
  // NUEVA FUNCIÓN: Obtener todos los componentes disponibles
  getAllComponents() {
    return {
      saldoCaja: {
        name: 'Saldo de Caja',
        category: 'liviano',
        grid: 'span-3',
        defaultActive: true,
        description: 'Muestra el saldo actual de caja'
      },
      ingresosVsEgresos: {
        name: 'Ingresos vs Egresos',
        category: 'liviano',
        grid: 'span-5',
        defaultActive: true,
        description: 'Comparación entre ingresos y egresos mensuales'
      },
      egresosVsAnterior: {
        name: 'Comparación Mes Anterior',
        category: 'liviano',
        grid: 'span-4',
        defaultActive: true,
        description: 'Comparación de egresos con el mes anterior'
      },
      cotizacionesMonedas: {
        name: 'Cotizaciones',
        category: 'liviano',
        grid: 'span-6',
        defaultActive: true,
        description: 'Cotizaciones de monedas en tiempo real'
      },
      analisisCategorias: {
        name: 'Análisis por Categorías',
        category: 'mediano',
        grid: 'span-6',
        defaultActive: false,
        description: 'Análisis detallado por categorías de gastos'
      },
      cuentasPendientes: {
        name: 'Cuentas Pendientes',
        category: 'mediano',
        grid: 'span-6',
        defaultActive: false,
        description: 'Control de cuentas por cobrar y pagar'
      },
      controlStock: {
        name: 'Control de Stock',
        category: 'pesado',
        grid: 'span-6',
        defaultActive: false,
        description: 'Gestión y control de inventario'
      },
      proyeccionFlujo: {
        name: 'Proyección de Flujo',
        category: 'pesado',
        grid: 'span-6',
        defaultActive: false,
        description: 'Proyección futura del flujo de caja'
      },
      calculadoraInversiones: {
        name: 'Calculadora de Inversiones',
        category: 'mediano',
        grid: 'span-6',
        defaultActive: false,
        description: 'Simulador de diferentes tipos de inversiones'
      }
    };
  },
  
  // NUEVA FUNCIÓN: Cargar scripts de componentes dinámicamente
  loadComponentScripts(componentIds) {
    var scriptsToLoad = this.getScriptsToLoad(componentIds);
    var loadPromises = scriptsToLoad.map(function(scriptPath) {
      return new Promise(function(resolve, reject) {
        if (document.querySelector('script[src="' + scriptPath + '"]')) {
          resolve(); // Ya cargado
          return;
        }
        
        var script = document.createElement('script');
        script.src = scriptPath;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    });
    
    return Promise.all(loadPromises);
  },
  
  // NUEVA FUNCIÓN: Obtener scripts que necesitan ser cargados
  getScriptsToLoad(componentIds) {
    var scripts = [];
    var allComponents = this.getAllComponents();
    
    for (var i = 0; i < componentIds.length; i++) {
      var componentId = componentIds[i];
      var component = allComponents[componentId];
      if (component && component.script) {
        scripts.push(component.script);
      }
    }
    
    return scripts.filter(Boolean);
  }
};


        // AGREGAR esta función al component-manager.js existente
getComponentInfo(componentId) {
  // Mapeo simple de componentes a su información
  const componentInfo = {
    saldoCaja: { name: 'Saldo de Caja', category: 'liviano', grid: 'span-3' },
    ingresosVsEgresos: { name: 'Ingresos vs Egresos', category: 'liviano', grid: 'span-5' },
    egresosVsAnterior: { name: 'Comparación Mes Anterior', category: 'liviano', grid: 'span-4' },
    cotizacionesMonedas: { name: 'Cotizaciones', category: 'liviano', grid: 'span-6' },
    analisisCategorias: { name: 'Análisis por Categorías', category: 'mediano', grid: 'span-6' },
    cuentasPendientes: { name: 'Cuentas Pendientes', category: 'mediano', grid: 'span-6' },
    controlStock: { name: 'Control de Stock', category: 'pesado', grid: 'span-6' },
    proyeccionFlujo: { name: 'Proyección de Flujo', category: 'pesado', grid: 'span-6' },
    calculadoraInversiones: { name: 'Calculadora de Inversiones', category: 'mediano', grid: 'span-6' }
  };
  
  return componentInfo[componentId] || { name: componentId, category: 'liviano', grid: 'span-6' };
},
