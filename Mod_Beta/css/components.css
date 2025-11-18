/* Componentes específicos del sistema */

/* Module Header */
.module-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding: 20px;
    background: linear-gradient(135deg, rgba(62, 166, 255, 0.1), rgba(123, 97, 255, 0.05));
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.05);
}

.module-header .header-content h1 {
    margin: 0;
    color: var(--accent);
    font-size: 24px;
}

.module-header .header-content p {
    margin: 4px 0 0 0;
    color: var(--muted);
    font-size: 14px;
}

/* Form Styles */
.client-form {
    padding: 20px 0;
}

.form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(255,255,255,0.1);
}

.form-header h3 {
    margin: 0;
    color: var(--accent);
}

.form-sections {
    display: flex;
    flex-direction: column;
    gap: 32px;
}

.form-section h4 {
    margin: 0 0 16px 0;
    color: var(--text);
    font-size: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.form-hint {
    font-size: 12px;
    color: var(--muted);
    display: flex;
    align-items: center;
    gap: 6px;
}

/* Table Styles */
.table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 16px;
}

.table-header h3 {
    margin: 0;
    color: var(--text);
}

.table-controls {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
}

.search-box {
    position: relative;
    display: flex;
    align-items: center;
}

.search-box i {
    position: absolute;
    left: 12px;
    color: var(--muted);
}

.search-box input {
    padding-left: 36px;
    min-width: 250px;
}

.filter-select {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 6px;
    padding: 8px 12px;
    color: var(--text);
    font-size: 13px;
    min-width: 140px;
}

.table-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid rgba(255,255,255,0.05);
    font-size: 13px;
}

.pagination-controls {
    display: flex;
    align-items: center;
    gap: 12px;
}

.page-info {
    color: var(--muted);
    font-size: 12px;
}

/* Notification Styles */
.notification {
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
}

.notification-success {
    border-left-color: #28a745 !important;
}

.notification-error {
    border-left-color: #dc3545 !important;
}

.notification-warning {
    border-left-color: #ffc107 !important;
}

.notification-info {
    border-left-color: #3ea6ff !important;
}

/* Button Variants */
.btn-primary {
    background: var(--accent);
    color: #00121a;
}

.btn-secondary {
    background: rgba(255,255,255,0.05);
    color: var(--text);
    border: 1px solid rgba(255,255,255,0.1);
}

.btn-outline {
    background: transparent;
    color: var(--text);
    border: 1px solid rgba(255,255,255,0.2);
}

.btn-outline:hover {
    background: rgba(255,255,255,0.05);
}

/* Loading States */
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(11, 18, 32, 0.9);
    backdrop-filter: blur(5px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
}

.loading-overlay.active {
    opacity: 1;
    visibility: visible;
}

.loading-spinner {
    width: 50px;
    height: 50px;
    border: 3px solid rgba(62, 166, 255, 0.3);
    border-top: 3px solid var(--accent);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

/* Responsive Design */
@media (max-width: 768px) {
    .module-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
    }
    
    .table-header {
        flex-direction: column;
        align-items: stretch;
    }
    
    .table-controls {
        justify-content: stretch;
    }
    
    .search-box input {
        min-width: auto;
        flex: 1;
    }
    
    .table-footer {
        flex-direction: column;
        gap: 16px;
        text-align: center;
    }
    
    .form-grid {
        grid-template-columns: 1fr !important;
    }
}

/* Animations */
@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.fade-in {
    animation: slideIn 0.3s ease-out;
}

/* Status Badges */
.status-badge {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.status-active {
    background: rgba(40, 167, 69, 0.2);
    color: #28a745;
}

.status-inactive {
    background: rgba(108, 117, 125, 0.2);
    color: #6c757d;
}

.status-pending {
    background: rgba(255, 193, 7, 0.2);
    color: #ffc107;
}

.status-warning {
    background: rgba(253, 126, 20, 0.2);
    color: #fd7e14;
}
