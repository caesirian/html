// js/core/component-manager.js - ARCHIVO COMPLETO CORREGIDO
const ComponentManager = {
  config: {},
  
  init() {
    this.loadConfig();
    return this;
  },
  
  loadConfig() {
    try {
      const saved = localStorage.getItem('dashboard_components_config');
      if (saved) {
        this.config = JSON.parse(saved);
        
        // Limpiar componentes que ya no existen
        for (const id in this.config) {
          if (this.config.hasOwnProperty(id)) {
            if (!this.componentExists(id)) {
              delete this.config[id];
            }
          }
        }
        
        // Agregar nuevos componentes que no están en la configuración
        const allComponents = this.getAllComponents();
        for (const id in allComponents) {
          if (allComponents.hasOwnProperty(id)) {
            if (this.config[id] === undefined) {
              const componentConfig = allComponents[id];
              this.config[id] = componentConfig.defaultActive;
            }
          }
        }
      } else {
        // Configuración por defecto
        this.config = {};
        const allComponents = this.getAllComponents();
        for (const id in allComponents) {
          if (allComponents.hasOwnProperty(id)) {
            const componentConfig = allComponents[id];
            this.config[id] = componentConfig.defaultActive;
          }
        }
        this.saveConfig();
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
      // Fallback a configuración básica
      this.config = CONFIG.COMPONENTES_POR_DEFECTO;
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
    const active = [];
    for (const id in this.config) {
      if (this.config.hasOwnProperty(id) && this.config[id] === true) {
        active.push(id);
      }
    }
    return active;
  },
  
  // Función: Obtener información de un componente
  getComponentInfo(componentId) {
    const allComponents = this.getAllComponents();
    const config = allComponents[componentId];
    
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
  
  // Función: Verificar si un componente existe
  componentExists(componentId) {
    const allComponents = this.getAllComponents();
    return allComponents.hasOwnProperty(componentId);
  },
  
  // Función: Obtener todos los componentes disponibles
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
        grid: 'full',
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
  
  // Función: Cargar scripts de componentes dinámicamente
  loadComponentScripts(componentIds) {
    const scriptsToLoad = this.getScriptsToLoad(componentIds);
    const loadPromises = scriptsToLoad.map(function(scriptPath) {
      return new Promise(function(resolve, reject) {
        if (document.querySelector('script[src="' + scriptPath + '"]')) {
          resolve(); // Ya cargado
          return;
        }
        
        const script = document.createElement('script');
        script.src = scriptPath;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    });
    
    return Promise.all(loadPromises);
  },
  
  // Función: Obtener scripts que necesitan ser cargados
  getScriptsToLoad(componentIds) {
    const scripts = [];
    const allComponents = this.getAllComponents();
    
    for (let i = 0; i < componentIds.length; i++) {
      const componentId = componentIds[i];
      const component = allComponents[componentId];
      if (component && component.script) {
        scripts.push(component.script);
      }
    }
    
    return scripts.filter(Boolean);
  }
};
