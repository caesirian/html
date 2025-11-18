class DataManager {
    constructor() {
        this.cache = new Map();
        this.pendingRequests = new Map();
        this.retryCount = 0;
        this.maxRetries = 3;
        this.useProxy = true; // Activar proxy por defecto
    }

    async makeRequest() {
        const targetUrl = CONFIG.GAS_ENDPOINT + '?t=' + Date.now();
        let url = targetUrl;
        
        // Usar proxy si está activado
        if (this.useProxy) {
            const proxyUrl = 'https://api.allorigins.win/raw?url=';
            url = proxyUrl + encodeURIComponent(targetUrl);
        }
        
        console.log('🔗 Conectando a:', url);

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 10000
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ Datos recibidos del servidor');
            return data;
            
        } catch (error) {
            // Si falla con proxy, intentar sin proxy
            if (this.useProxy && error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
                console.log('🔄 Intentando sin proxy...');
                this.useProxy = false;
                return this.makeRequest();
            }
            throw error;
        }
    }

    async fetchData(forceRefresh = false) {
        const cacheKey = 'app_data';
        
        // Verificar cache primero
        if (!forceRefresh) {
            const cached = this.getCache(cacheKey);
            if (cached) {
                console.log('📦 Usando datos cacheados');
                return cached;
            }
        }

        // Evitar requests duplicados
        if (this.pendingRequests.has(cacheKey)) {
            return this.pendingRequests.get(cacheKey);
        }

        try {
            console.log('🌐 Solicitando datos del servidor...');
            appState.addNotification('Actualizando datos...', 'info');

            const requestPromise = this.makeRequest();
            this.pendingRequests.set(cacheKey, requestPromise);

            const data = await requestPromise;
            
            // Procesar y normalizar datos
            const processedData = this.processData(data);
            
            // Guardar en cache
            this.setCache(cacheKey, processedData);
            
            // Actualizar estado global
            appState.updateData('lastUpdate', new Date());
            appState.updateData('currentData', processedData);

            appState.addNotification('Datos actualizados correctamente', 'success');
            
            return processedData;

        } catch (error) {
            console.error('❌ Error obteniendo datos:', error);
            
            // Reintentar si es posible
            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                console.log(`🔄 Reintentando... (${this.retryCount}/${this.maxRetries})`);
                await this.delay(1000 * this.retryCount); // Backoff exponencial
                return this.fetchData(forceRefresh);
            }
            
            // Usar datos de prueba como fallback
            const fallbackData = this.getFallbackData();
            appState.addNotification('Usando datos locales - Modo offline', 'warning');
            return fallbackData;

        } finally {
            this.pendingRequests.delete(cacheKey);
            this.retryCount = 0;
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ... el resto de tus métodos permanecen igual
    processData(rawData) {
        const processed = {};
        
        // Normalizar todas las hojas
        for (const [sheetName, sheetData] of Object.entries(rawData)) {
            if (Array.isArray(sheetData)) {
                processed[sheetName] = sheetData.map(row => this.normalizeRow(row));
            } else {
                processed[sheetName] = sheetData;
            }
        }

        // Calcular métricas derivadas
        processed.metrics = this.calculateMetrics(processed);
        
        return processed;
    }

    normalizeRow(row) {
        const normalized = {};
        
        for (const [key, value] of Object.entries(row)) {
            let newKey = key;
            
            // Normalizar nombres de campos
            if (key.includes('Tipo') || key.includes('Ingreso') || key.includes('Egreso')) {
                newKey = 'Tipo';
            } else if (key.includes('Fecha') || key.includes('Date')) {
                newKey = 'Fecha';
            } else if (key.includes('Monto') || key.includes('Importe') || key.includes('Total')) {
                newKey = 'Monto';
            } else if (key.includes('Cliente') || key.includes('Proveedor')) {
                newKey = 'ClienteProveedor';
            }
            
            normalized[newKey] = value;
        }
        
        return normalized;
    }

    calculateMetrics(data) {
        const finanzas = data.Finanzas_RegistroDiario || [];
        const hoy = new Date();
        const mesActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
        
        const ingresosMes = finanzas
            .filter(item => item.Tipo === 'Ingreso' && item.Fecha?.includes(mesActual))
            .reduce((sum, item) => sum + (Number(item.Monto) || 0), 0);

        const egresosMes = finanzas
            .filter(item => item.Tipo === 'Egreso' && item.Fecha?.includes(mesActual))
            .reduce((sum, item) => sum + (Number(item.Monto) || 0), 0);

        return {
            ingresosMes,
            egresosMes,
            saldoCaja: ingresosMes - egresosMes,
            totalVentas: finanzas.filter(item => item.Tipo === 'Ingreso').length,
            totalClientes: (data.Clientes || []).length,
            productosStockBajo: (data.Productos || []).filter(p => (p.Stock || 0) < (p.StockMinimo || 0)).length
        };
    }

    getCache(key) {
        const item = this.cache.get(key);
        if (!item) return null;

        // Verificar expiración (5 minutos)
        if (Date.now() - item.timestamp > 5 * 60 * 1000) {
            this.cache.delete(key);
            return null;
        }

        return item.data;
    }

    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    getFallbackData() {
        return {
            Finanzas_RegistroDiario: [],
            Clientes: [],
            Productos: [],
            metrics: {
                ingresosMes: 0,
                egresosMes: 0,
                saldoCaja: 0,
                totalVentas: 0,
                totalClientes: 0,
                productosStockBajo: 0
            }
        };
    }

    async sendData(sheet, data, action = 'insert') {
        try {
            const payload = {
                action,
                sheet,
                ...data
            };

            let url = CONFIG.GAS_ENDPOINT + '?' + new URLSearchParams(payload);
            
            // Usar proxy para POST también
            if (this.useProxy) {
                const proxyUrl = 'https://api.allorigins.win/raw?url=';
                url = proxyUrl + encodeURIComponent(url);
            }
            
            console.log('📤 Enviando datos:', payload);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('✅ Respuesta del servidor:', result);

            // Invalidar cache después de modificar datos
            this.cache.delete('app_data');

            return result;

        } catch (error) {
            console.error('❌ Error enviando datos:', error);
            throw error;
        }
    }
}

const dataManager = new DataManager();
