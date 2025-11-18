// Módulo avanzado de gestión de clientes
class ClientesModule {
    constructor() {
        this.currentData = null;
        this.editingClientId = null;
        this.dataTable = null;
        this.filters = {
            estado: '',
            categoria: '',
            search: ''
        };
    }

    async init() {
        console.log('🚀 Iniciando módulo de clientes...');
        await this.loadData();
        this.render();
        this.setupEventListeners();
        this.setupRealTimeUpdates();
    }

    async loadData() {
        try {
            appState.setLoading(true);
            this.currentData = await dataManager.fetchData(true);
            appState.setLoading(false);
        } catch (error) {
            console.error('Error cargando datos:', error);
            notificationSystem.show('Error cargando datos de clientes', 'error');
        }
    }

    render() {
        const container = document.getElementById('content-container');
        container.innerHTML = this.getTemplate();
        this.renderTable();
        this.renderStats();
    }

    getTemplate() {
        return `
            <div class="module-header">
                <div class="header-content">
                    <h1><i class="fas fa-users"></i> Gestión de Clientes</h1>
                    <p>Administra tu cartera de clientes de manera eficiente</p>
                </div>
                <button class="btn btn-primary" id="btn-nuevo-cliente">
                    <i class="fas fa-plus"></i> Nuevo Cliente
                </button>
            </div>

            <div class="dashboard-grid">
                <!-- Tarjetas de estadísticas -->
                <div class="card" data-grid="span-3">
                    <div class="metric-card">
                        <h3>Total Clientes</h3>
                        <div class="metric-value">${this.getTotalClientes()}</div>
                        <div class="metric-label">Registrados en el sistema</div>
                    </div>
                </div>

                <div class="card" data-grid="span-3">
                    <div class="metric-card">
                        <h3>Clientes Activos</h3>
                        <div class="metric-value">${this.getClientesActivos()}</div>
                        <div class="metric-label">Con estado activo</div>
                    </div>
                </div>

                <div class="card" data-grid="span-3">
                    <div class="metric-card">
                        <h3>Premium</h3>
                        <div class="metric-value">${this.getClientesPremium()}</div>
                        <div class="metric-label">Categoría A</div>
                    </div>
                </div>

                <div class="card" data-grid="span-3">
                    <div class="metric-card">
                        <h3>Deuda Total</h3>
                        <div class="metric-value">${UTILS.formatCurrency(this.getDeudaTotal())}</div>
                        <div class="metric-label">Por cobrar</div>
                    </div>
                </div>

                <!-- Formulario de cliente -->
                <div class="card" data-grid="full" id="form-container" style="display: none;">
                    <div class="form-header">
                        <h3 id="form-title">Nuevo Cliente</h3>
                        <button class="btn btn-secondary" id="btn-cerrar-form">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    ${this.getFormTemplate()}
                </div>

                <!-- Lista de clientes -->
                <div class="card" data-grid="full">
                    <div class="table-header">
                        <h3>Clientes Registrados</h3>
                        <div class="table-controls">
                            <div class="search-box">
                                <i class="fas fa-search"></i>
                                <input type="text" id="search-clientes" placeholder="Buscar clientes...">
                            </div>
                            <select id="filter-estado" class="filter-select">
                                <option value="">Todos los estados</option>
                                <option value="Activo">Activos</option>
                                <option value="Inactivo">Inactivos</option>
                            </select>
                            <select id="filter-categoria" class="filter-select">
                                <option value="">Todas las categorías</option>
                                <option value="A - Premium">Premium</option>
                                <option value="B - Regular">Regular</option>
                                <option value="C - Ocasional">Ocasional</option>
                            </select>
                            <button class="btn btn-secondary" id="btn-exportar">
                                <i class="fas fa-download"></i> Exportar
                            </button>
                        </div>
                    </div>
                    <div class="tabla-container">
                        <table id="tabla-clientes" class="tabla-datos">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre/Razón Social</th>
                                    <th>Tipo</th>
                                    <th>Categoría</th>
                                    <th>Contacto</th>
                                    <th>Ubicación</th>
                                    <th>Estado</th>
                                    <th>Última Actualización</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="clientes-tbody">
                                <!-- Datos se cargan dinámicamente -->
                            </tbody>
                        </table>
                    </div>
                    <div class="table-footer">
                        <div class="pagination-info">
                            Mostrando <span id="clientes-count">0</span> de <span id="clientes-total">0</span> clientes
                        </div>
                        <div class="pagination-controls">
                            <button class="btn btn-secondary" id="btn-prev">
                                <i class="fas fa-chevron-left"></i> Anterior
                            </button>
                            <span class="page-info">Página 1 de 1</span>
                            <button class="btn btn-secondary" id="btn-next">
                                Siguiente <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getFormTemplate() {
        return `
            <form id="form-cliente" class="client-form">
                <div class="form-sections">
                    <div class="form-section">
                        <h4><i class="fas fa-id-card"></i> Información Básica</h4>
                        <div class="form-grid">
                            <div class="form-field required">
                                <label for="nombre">Nombre/Razón Social</label>
                                <input type="text" id="nombre" name="nombre" required>
                            </div>
                            
                            <div class="form-field">
                                <label for="tipoCliente">Tipo de Cliente</label>
                                <select id="tipoCliente" name="tipoCliente">
                                    <option value="">Seleccionar...</option>
                                    <option value="Empresa">Empresa</option>
                                    <option value="Particular">Particular</option>
                                    <option value="Organización">Organización</option>
                                </select>
                            </div>
                            
                            <div class="form-field">
                                <label for="categoria">Categoría</label>
                                <select id="categoria" name="categoria">
                                    <option value="">Seleccionar...</option>
                                    <option value="A - Premium">A - Premium</option>
                                    <option value="B - Regular">B - Regular</option>
                                    <option value="C - Ocasional">C - Ocasional</option>
                                </select>
                            </div>
                            
                            <div class="form-field">
                                <label for="estado">Estado</label>
                                <select id="estado" name="estado">
                                    <option value="Activo">Activo</option>
                                    <option value="Inactivo">Inactivo</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="form-section">
                        <h4><i class="fas fa-address-book"></i> Información de Contacto</h4>
                        <div class="form-grid">
                            <div class="form-field">
                                <label for="email">Email</label>
                                <input type="email" id="email" name="email">
                            </div>
                            
                            <div class="form-field">
                                <label for="telefono">Teléfono</label>
                                <input type="text" id="telefono" name="telefono">
                            </div>
                            
                            <div class="form-field">
                                <label for="celular">Celular</label>
                                <input type="text" id="celular" name="celular">
                            </div>
                            
                            <div class="form-field">
                                <label for="web">Sitio Web</label>
                                <input type="url" id="web" name="web" placeholder="https://...">
                            </div>
                        </div>
                    </div>

                    <div class="form-section">
                        <h4><i class="fas fa-map-marker-alt"></i> Dirección</h4>
                        <div class="form-grid">
                            <div class="form-field" style="grid-column: span 2;">
                                <label for="direccion">Dirección</label>
                                <input type="text" id="direccion" name="direccion">
                            </div>
                            
                            <div class="form-field">
                                <label for="ciudad">Ciudad</label>
                                <input type="text" id="ciudad" name="ciudad">
                            </div>
                            
                            <div class="form-field">
                                <label for="provincia">Provincia</label>
                                <input type="text" id="provincia" name="provincia">
                            </div>
                            
                            <div class="form-field">
                                <label for="codigoPostal">Código Postal</label>
                                <input type="text" id="codigoPostal" name="codigoPostal">
                            </div>
                        </div>
                    </div>

                    <div class="form-section">
                        <h4><i class="fas fa-file-invoice-dollar"></i> Información Fiscal</h4>
                        <div class="form-grid">
                            <div class="form-field">
                                <label for="cuit">CUIT/CUIL</label>
                                <input type="text" id="cuit" name="cuit" placeholder="XX-XXXXXXXX-X">
                            </div>
                            
                            <div class="form-field">
                                <label for="condicionIva">Condición IVA</label>
                                <select id="condicionIva" name="condicionIva">
                                    <option value="">Seleccionar...</option>
                                    <option value="Responsable Inscripto">Responsable Inscripto</option>
                                    <option value="Monotributo">Monotributo</option>
                                    <option value="Consumidor Final">Consumidor Final</option>
                                    <option value="Exento">Exento</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="form-section">
                        <h4><i class="fas fa-sticky-note"></i> Información Adicional</h4>
                        <div class="form-grid">
                            <div class="form-field" style="grid-column: span 2;">
                                <label for="observaciones">Observaciones</label>
                                <textarea id="observaciones" name="observaciones" rows="3" 
                                          placeholder="Información adicional sobre el cliente..."></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn btn-primary" id="btn-guardar">
                        <i class="fas fa-save"></i> Guardar Cliente
                    </button>
                    <button type="button" class="btn btn-secondary" id="btn-cancelar">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                    <button type="reset" class="btn btn-outline">
                        <i class="fas fa-broom"></i> Limpiar Formulario
                    </button>
                    <div style="flex: 1;"></div>
                    <span class="form-hint">
                        <i class="fas fa-info-circle"></i> Campos marcados con * son obligatorios
                    </span>
                </div>
            </form>
        `;
    }

    // ... más métodos para la funcionalidad completa
}

// Hacer disponible globalmente
window.ClientesModule = ClientesModule;
