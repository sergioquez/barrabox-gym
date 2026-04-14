// Admin Integration Script - Conecta el Admin Dashboard con el Admin System
document.addEventListener('DOMContentLoaded', function() {
    
    // Variables globales
    let adminSystem = null;
    let currentTab = 'calendarTab';
    
    // Inicializar sistema
    async function initialize() {
        
        // Esperar a que los sistemas necesarios estén disponibles
        await waitForDependencies();
        
        // Verificar que el usuario sea administrador
        if (!window.barraboxAuth || !window.barraboxAuth.isLoggedIn()) {
            showError('Debes iniciar sesión como administrador');
            redirectToLogin();
            return;
        }
        
        const currentUser = window.barraboxAuth.getCurrentUser();
        if (currentUser.role !== 'admin') {
            showError('Acceso denegado: Se requiere rol de administrador');
            redirectToDashboard();
            return;
        }
        
        
        // Inicializar Admin System
        adminSystem = window.barraboxAdmin;
        
        if (!adminSystem || !adminSystem.isInitialized) {
            showError('Admin System no disponible');
            return;
        }
        
        // Cargar datos iniciales
        await loadInitialData();
        
        // Configurar UI
        setupUI();
        
        // Configurar event listeners
        setupEventListeners();
        
        // Actualizar estadísticas
        updateStats();
        
    }
    
    // Esperar dependencias
    async function waitForDependencies() {
        const maxWaitTime = 10000; // 10 segundos máximo
        const startTime = Date.now();
        
        while (Date.now() - startTime < maxWaitTime) {
            if (window.barraboxDataManager && window.barraboxAuth) {
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        throw new Error('Timeout esperando dependencias');
    }
    
    // Cargar datos iniciales
    async function loadInitialData() {
        try {
            // Refrescar datos del admin system
            await adminSystem.refreshData(true);
            
            // Cargar datos en las pestañas
            loadMembersTab();
            loadClassesTab();
            loadBookingsTab();
            loadReportsTab();
            
            showSuccess('Datos cargados correctamente');
            
        } catch (error) {
            console.error('Error cargando datos:', error);
            showError('Error cargando datos del sistema');
        }
    }
    
    // Configurar UI
    function setupUI() {
        // Configurar tabs
        setupTabs();
        
        // Configurar botones de acción
        setupActionButtons();
        
        // Configurar filtros
        setupFilters();
        
        // Configurar modals
        setupModals();
    }
    
    // Configurar tabs
    function setupTabs() {
        const tabButtons = document.querySelectorAll('.admin-tab-btn');
        const tabContents = document.querySelectorAll('.admin-tab-content');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                
                // Actualizar botones activos
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Actualizar contenidos activos
                tabContents.forEach(content => content.classList.remove('active'));
                document.getElementById(tabId).classList.add('active');
                
                // Guardar tab actual
                currentTab = tabId;
                
                // Cargar datos específicos del tab
                switch (tabId) {
                    case 'membersTab':
                        loadMembersTab();
                        break;
                    case 'classesTab':
                        loadClassesTab();
                        break;
                    case 'reservationsTab':
                        loadBookingsTab();
                        break;
                    case 'reportsTab':
                        loadReportsTab();
                        break;
                }
                
            });
        });
    }
    
    // Cargar tab de miembros
    function loadMembersTab() {
        const container = document.getElementById('membersList');
        if (!container) return;
        
        try {
            const members = adminSystem.getAllMembers();
            
            if (members.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-users"></i>
                        <h3>No hay miembros registrados</h3>
                        <p>Usa el botón "Nuevo Miembro" para agregar el primero.</p>
                    </div>
                `;
                return;
            }
            
            let html = `
                <div class="members-table">
                    <div class="table-header">
                        <div class="col-name">Nombre</div>
                        <div class="col-email">Email</div>
                        <div class="col-role">Rol</div>
                        <div class="col-plan">Plan</div>
                        <div class="col-status">Estado</div>
                        <div class="col-actions">Acciones</div>
                    </div>
                    <div class="table-body">
            `;
            
            members.forEach(member => {
                const statusClass = member.status === 'active' ? 'status-active' : 'status-inactive';
                const planClass = member.plan === 'premium' ? 'plan-premium' : 'plan-basic';
                
                html += `
                    <div class="table-row" data-member-id="${member.id}">
                        <div class="col-name">
                            <div class="member-avatar">
                                <i class="fas fa-user"></i>
                            </div>
                            <div class="member-info">
                                <div class="member-name">${member.name}</div>
                                <div class="member-phone">${member.phone || 'Sin teléfono'}</div>
                            </div>
                        </div>
                        <div class="col-email">${member.email}</div>
                        <div class="col-role">
                            <span class="badge ${member.role === 'admin' ? 'badge-admin' : 'badge-member'}">
                                ${member.role === 'admin' ? 'Admin' : 'Miembro'}
                            </span>
                        </div>
                        <div class="col-plan">
                            <span class="badge ${planClass}">
                                ${member.plan === 'premium' ? 'Premium' : 'Básico'}
                            </span>
                        </div>
                        <div class="col-status">
                            <span class="badge ${statusClass}">
                                ${member.status === 'active' ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>
                        <div class="col-actions">
                            <button class="btn-action btn-view" data-action="view" data-member-id="${member.id}">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-action btn-edit" data-action="edit" data-member-id="${member.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-action btn-delete" data-action="delete" data-member-id="${member.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
            
            container.innerHTML = html;
            
            // Configurar event listeners para los botones
            container.querySelectorAll('.btn-action').forEach(btn => {
                btn.addEventListener('click', () => {
                    const action = btn.getAttribute('data-action');
                    const memberId = btn.getAttribute('data-member-id');
                    
                    switch (action) {
                        case 'view':
                            viewMemberDetails(memberId);
                            break;
                        case 'edit':
                            editMember(memberId);
                            break;
                        case 'delete':
                            deleteMember(memberId);
                            break;
                    }
                });
            });
            
        } catch (error) {
            console.error('Error cargando miembros:', error);
            container.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error cargando miembros</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }
    
    // Cargar tab de clases
    function loadClassesTab() {
        const container = document.getElementById('classesList');
        if (!container) return;
        
        try {
            const classes = adminSystem.getAllClasses();
            
            if (classes.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-dumbbell"></i>
                        <h3>No hay clases programadas</h3>
                        <p>Usa el botón "Nueva Clase" para agregar la primera.</p>
                    </div>
                `;
                return;
            }
            
            let html = `
                <div class="classes-table">
                    <div class="table-header">
                        <div class="col-title">Clase</div>
                        <div class="col-type">Tipo</div>
                        <div class="col-coach">Coach</div>
                        <div class="col-schedule">Horario</div>
                        <div class="col-capacity">Cupos</div>
                        <div class="col-actions">Acciones</div>
                    </div>
                    <div class="table-body">
            `;
            
            classes.forEach(cls => {
                const occupancy = Math.round((cls.booked / cls.capacity) * 100);
                const occupancyClass = occupancy >= 90 ? 'occupancy-high' : 
                                     occupancy >= 70 ? 'occupancy-medium' : 'occupancy-low';
                
                html += `
                    <div class="table-row" data-class-id="${cls.id}">
                        <div class="col-title">
                            <div class="class-title">${cls.title}</div>
                            <div class="class-desc">${cls.description || 'Sin descripción'}</div>
                        </div>
                        <div class="col-type">
                            <span class="badge badge-type-${cls.type}">
                                ${cls.type}
                            </span>
                        </div>
                        <div class="col-coach">${cls.coach}</div>
                        <div class="col-schedule">${cls.schedule}</div>
                        <div class="col-capacity">
                            <div class="capacity-bar">
                                <div class="capacity-fill ${occupancyClass}" style="width: ${occupancy}%"></div>
                            </div>
                            <div class="capacity-text">${cls.booked}/${cls.capacity} (${occupancy}%)</div>
                        </div>
                        <div class="col-actions">
                            <button class="btn-action btn-view" data-action="view" data-class-id="${cls.id}">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-action btn-edit" data-action="edit" data-class-id="${cls.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-action btn-delete" data-action="delete" data-class-id="${cls.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
            
            container.innerHTML = html;
            
            // Configurar event listeners para los botones
            container.querySelectorAll('.btn-action').forEach(btn => {
                btn.addEventListener('click', () => {
                    const action = btn.getAttribute('data-action');
                    const classId = btn.getAttribute('data-class-id');
                    
                    switch (action) {
                        case 'view':
                            viewClassDetails(classId);
                            break;
                        case 'edit':
                            editClass(classId);
                            break;
                        case 'delete':
                            deleteClass(classId);
                            break;
                    }
                });
            });
            
        } catch (error) {
            console.error('Error cargando clases:', error);
            container.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error cargando clases</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }
    
    // Cargar tab de reservas
    function loadBookingsTab() {
        const container = document.getElementById('reservationsList');
        if (!container) return;
        
        try {
            const bookings = adminSystem.getAllBookings();
            
            if (bookings.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-calendar-check"></i>
                        <h3>No hay reservas</h3>
                        <p>Los miembros aún no han hecho reservas.</p>
                    </div>
                `;
                return;
            }
            
            let html = `
                <div class="bookings-table">
                    <div class="table-header">
                        <div class="col-member">Miembro</div>
                        <div class="col-class">Clase</div>
                        <div class="col-date">Fecha</div>
                        <div class="col-time">Hora</div>
                        <div class="col-status">Estado</div>
                        <div class="col-actions">Acciones</div>
                    </div>
                    <div class="table-body">
            `;
            
            bookings.forEach(booking => {
                const user = window.barraboxDataManager.getUser(booking.userId);
                const cls = window.barraboxDataManager.getClass(booking.classId);
                
                if (!user || !cls) return;
                
                const statusClass = booking.status === 'confirmed' ? 'status-confirmed' : 'status-cancelled';
                const statusText = booking.status === 'confirmed' ? 'Confirmada' : 'Cancelada';
                
                html += `
                    <div class="table-row" data-booking-id="${booking.id}">
                        <div class="col-member">
                            <div class="member-info">
                                <div class="member-name">${user.name}</div>
                                <div class="member-email">${user.email}</div>
                            </div>
                        </div>
                        <div class="col-class">
                            <div class="class-title">${cls.title}</div>
                            <div class="class-type">${cls.type} - ${cls.coach}</div>
                        </div>
                        <div class="col-date">${booking.date}</div>
                        <div class="col-time">${booking.time}</div>
                        <div class="col-status">
                            <span class="badge ${statusClass}">
                                ${statusText}
                            </span>
                        </div>
                        <div class="col-actions">
                            <button class="btn-action btn-view" data-action="view" data-booking-id="${booking.id}">
                                <i class="fas fa-eye"></i>
                            </button>
                            ${booking.status === 'confirmed' ? `
                                <button class="btn-action btn-cancel" data-action="cancel" data-booking-id="${booking.id}">
                                    <i class="fas fa-times"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
            
            container.innerHTML = html;
            
            // Configurar event listeners para los botones
            container.querySelectorAll('.btn-action').forEach(btn => {
                btn.addEventListener('click', () => {
                    const action = btn.getAttribute('data-action');
                    const bookingId = btn.getAttribute('data-booking-id');
                    
                    switch (action) {
                        case 'view':
                            viewBookingDetails(bookingId);
                            break;
                        case 'cancel':
                            cancelBookingAsAdmin(bookingId);
                            break;
                    }
                });
            });
            
        } catch (error) {
            console.error('Error cargando reservas:', error);
            container.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error cargando reservas</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }
    
    // Cargar tab de reportes
    function loadReportsTab() {
        const container = document.getElementById('reportsContent');
        if (!container) return;
        
        try {
            const stats = adminSystem.getGeneralStats();
            const occupancyReport = adminSystem.getOccupancyReport(7);
            
            let html = `
                <div class="reports-dashboard">
                    <!-- Estadísticas principales -->
                    <div class="stats-cards">
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-users"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-number">${stats.totalMembers}</div>
                                <div class="stat-label">Miembros Totales</div>
                                <div class="stat-sub">${stats.activeMembers} activos</div>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-dumbbell"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-number">${stats.totalClasses}</div>
                                <div class="stat-label">Clases Totales</div>
                                <div class="stat-sub">${stats.upcomingClasses} con cupo</div>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-calendar-check"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-number">${stats.totalBookings}</div>
                                <div class="stat-label">Reservas Totales</div>
                                <div class="stat-sub">${stats.recentBookings} últimos 30 días</div>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon">
// Continuación de admin-integration.js

                            <i class="fas fa-chart-line"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-number">${stats.averageOccupancy}%</div>
                                <div class="stat-label">Ocupación Promedio</div>
                                <div class="stat-sub">Tasa de cancelación: ${stats.cancellationRate}%</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Distribución por tipo de clase -->
                    <div class="report-section">
                        <h3><i class="fas fa-chart-pie"></i> Distribución por Tipo de Clase</h3>
                        <div class="class-types-distribution">
            `;
            
            // Mostrar distribución por tipo
            Object.entries(stats.classTypes).forEach(([type, count]) => {
                const percentage = Math.round((count / stats.totalClasses) * 100);
                html += `
                    <div class="type-item">
                        <div class="type-name">${type}</div>
                        <div class="type-bar">
                            <div class="type-fill" style="width: ${percentage}%"></div>
                        </div>
                        <div class="type-count">${count} (${percentage}%)</div>
                    </div>
                `;
            });
            
            html += `
                        </div>
                    </div>
                    
                    <!-- Ocupación por día -->
                    <div class="report-section">
                        <h3><i class="fas fa-calendar-alt"></i> Ocupación Últimos 7 Días</h3>
                        <div class="occupancy-chart">
            `;
            
            // Mostrar ocupación por día
            Object.values(occupancyReport).forEach(day => {
                const date = new Date(day.date);
                const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' });
                const dayNumber = date.getDate();
                
                html += `
                    <div class="day-column">
                        <div class="day-header">
                            <div class="day-name">${dayName}</div>
                            <div class="day-number">${dayNumber}</div>
                        </div>
                        <div class="day-occupancy">
                            <div class="occupancy-bar">
                                <div class="occupancy-fill" style="height: ${day.occupancyRate}%"></div>
                            </div>
                            <div class="occupancy-text">${day.occupancyRate}%</div>
                        </div>
                        <div class="day-stats">
                            <div class="stat">${day.totalClasses} clases</div>
                            <div class="stat">${day.totalBooked}/${day.totalCapacity}</div>
                        </div>
                    </div>
                `;
            });
            
            html += `
                        </div>
                    </div>
                    
                    <!-- Miembros por plan -->
                    <div class="report-section">
                        <h3><i class="fas fa-crown"></i> Miembros por Plan</h3>
                        <div class="plans-distribution">
                            <div class="plan-item">
                                <div class="plan-name">Básico</div>
                                <div class="plan-bar">
                                    <div class="plan-fill basic" style="width: ${(stats.membersByPlan.basic / stats.totalMembers) * 100}%"></div>
                                </div>
                                <div class="plan-count">${stats.membersByPlan.basic} miembros</div>
                            </div>
                            <div class="plan-item">
                                <div class="plan-name">Premium</div>
                                <div class="plan-bar">
                                    <div class="plan-fill premium" style="width: ${(stats.membersByPlan.premium / stats.totalMembers) * 100}%"></div>
                                </div>
                                <div class="plan-count">${stats.membersByPlan.premium} miembros</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Acciones de exportación -->
                    <div class="report-actions">
                        <h3><i class="fas fa-download"></i> Exportar Datos</h3>
                        <div class="export-buttons">
                            <button class="btn btn-outline" id="exportMembers">
                                <i class="fas fa-users"></i> Exportar Miembros
                            </button>
                            <button class="btn btn-outline" id="exportClasses">
                                <i class="fas fa-dumbbell"></i> Exportar Clases
                            </button>
                            <button class="btn btn-outline" id="exportBookings">
                                <i class="fas fa-calendar-check"></i> Exportar Reservas
                            </button>
                            <button class="btn btn-primary" id="exportAll">
                                <i class="fas fa-file-export"></i> Exportar Todo
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            container.innerHTML = html;
            
            // Configurar event listeners para exportación
            document.getElementById('exportMembers')?.addEventListener('click', () => exportData('members'));
            document.getElementById('exportClasses')?.addEventListener('click', () => exportData('classes'));
            document.getElementById('exportBookings')?.addEventListener('click', () => exportData('bookings'));
            document.getElementById('exportAll')?.addEventListener('click', () => exportData('all'));
            
        } catch (error) {
            console.error('Error cargando reportes:', error);
            container.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error cargando reportes</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }
    
    // Configurar botones de acción
    function setupActionButtons() {
        // Botón nuevo miembro
        const newMemberBtn = document.getElementById('newMemberBtn');
        if (newMemberBtn) {
            newMemberBtn.addEventListener('click', () => showNewMemberModal());
        }
        
        // Botón nueva clase
        const newClassBtn = document.getElementById('newClassBtn');
        if (newClassBtn) {
            newClassBtn.addEventListener('click', () => showNewClassModal());
        }
        
        // Botón refrescar
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => refreshAllData());
        }
        
        // Botón notificaciones
        const notificationBtn = document.getElementById('notificationBtn');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', () => showNotifications());
        }
    }
    
    // Configurar filtros
    function setupFilters() {
        // Filtro de búsqueda
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', debounce(() => {
                applyFilters();
            }, 300));
        }
        
        // Filtro de estado
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                applyFilters();
            });
        }
        
        // Filtro de tipo
        const typeFilter = document.getElementById('typeFilter');
        if (typeFilter) {
            typeFilter.addEventListener('change', () => {
                applyFilters();
            });
        }
    }
    
    // Aplicar filtros
    function applyFilters() {
        
        // Recargar la pestaña actual con los filtros aplicados
        switch (currentTab) {
            case 'membersTab':
                loadMembersTab();
                break;
            case 'classesTab':
                loadClassesTab();
                break;
            case 'reservationsTab':
                loadBookingsTab();
                break;
        }
    }
    
    // Configurar modals
    function setupModals() {
        // Modal de detalles de miembro
        // Modal de detalles de clase
        // Modal de detalles de reserva
        // Modal de nuevo miembro
        // Modal de nueva clase
        // Modal de confirmación de eliminación
    }
    
    // ==================== FUNCIONES DE ACCIÓN ====================
    
    // Ver detalles de miembro
    function viewMemberDetails(memberId) {
        const member = window.barraboxDataManager.getUser(memberId);
        if (!member) {
            showError('Miembro no encontrado');
            return;
        }
        
        const memberBookings = window.barraboxDataManager.getBookingsByUser(memberId);
        const activeBookings = memberBookings.filter(b => b.status === 'confirmed').length;
        
        const modalHtml = `
            <div class="admin-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-user"></i> Detalles del Miembro</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="member-details">
                            <div class="detail-section">
                                <h4>Información Personal</h4>
                                <div class="detail-row">
                                    <span class="label">Nombre:</span>
                                    <span class="value">${member.name}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Email:</span>
                                    <span class="value">${member.email}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Teléfono:</span>
                                    <span class="value">${member.phone || 'No registrado'}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Rol:</span>
                                    <span class="value badge ${member.role === 'admin' ? 'badge-admin' : 'badge-member'}">
                                        ${member.role === 'admin' ? 'Administrador' : 'Miembro'}
                                    </span>
                                </div>
                            </div>
                            
                            <div class="detail-section">
                                <h4>Información de Cuenta</h4>
                                <div class="detail-row">
                                    <span class="label">Plan:</span>
                                    <span class="value badge ${member.plan === 'premium' ? 'plan-premium' : 'plan-basic'}">
                                        ${member.plan === 'premium' ? 'Premium' : 'Básico'}
                                    </span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Estado:</span>
                                    <span class="value badge ${member.status === 'active' ? 'status-active' : 'status-inactive'}">
                                        ${member.status === 'active' ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Creado:</span>
                                    <span class="value">${new Date(member.createdAt).toLocaleDateString('es-ES')}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Actualizado:</span>
                                    <span class="value">${new Date(member.updatedAt).toLocaleDateString('es-ES')}</span>
                                </div>
                            </div>
                            
                            <div class="detail-section">
                                <h4>Estadísticas</h4>
                                <div class="detail-row">
                                    <span class="label">Reservas activas:</span>
                                    <span class="value">${activeBookings}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Total reservas:</span>
                                    <span class="value">${memberBookings.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button class="btn btn-outline close-modal-btn">Cerrar</button>
                        <button class="btn btn-primary" id="editMemberBtn">Editar Miembro</button>
                    </div>
                </div>
            </div>
        `;
        
        showModal(modalHtml);
        
        // Configurar event listeners del modal
        document.querySelector('.close-modal')?.addEventListener('click', closeModal);
        document.querySelector('.close-modal-btn')?.addEventListener('click', closeModal);
        document.getElementById('editMemberBtn')?.addEventListener('click', () => {
            closeModal();
            editMember(memberId);
        });
    }
    
    // Editar miembro
    function editMember(memberId) {
        const member = window.barraboxDataManager.getUser(memberId);
        if (!member) {
            showError('Miembro no encontrado');
            return;
        }
        
        const modalHtml = `
            <div class="admin-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-edit"></i> Editar Miembro</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="editMemberForm">
                            <div class="form-group">
                                <label for="editName">Nombre</label>
                                <input type="text" id="editName" value="${member.name}" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="editEmail">Email</label>
                                <input type="email" id="editEmail" value="${member.email}" disabled>
                                <small class="form-text">El email no se puede cambiar</small>
                            </div>
                            
                            <div class="form-group">
                                <label for="editPhone">Teléfono</label>
                                <input type="tel" id="editPhone" value="${member.phone || ''}">
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="editRole">Rol</label>
                                    <select id="editRole">
                                        <option value="member" ${member.role === 'member' ? 'selected' : ''}>Miembro</option>
                                        <option value="admin" ${member.role === 'admin' ? 'selected' : ''}>Administrador</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label for="editPlan">Plan</label>
                                    <select id="editPlan">
                                        <option value="basic" ${member.plan === 'basic' ? 'selected' : ''}>Básico</option>
                                        <option value="premium" ${member.plan === 'premium' ? 'selected' : ''}>Premium</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="editStatus">Estado</label>
                                    <select id="editStatus">
                                        <option value="active" ${member.status === 'active' ? 'selected' : ''}>Activo</option>
                                        <option value="inactive" ${member.status === 'inactive' ? 'selected' : ''}>Inactivo</option>
                                    </select>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-actions">
                        <button class="btn btn-outline close-modal-btn">Cancelar</button>
                        <button class="btn btn-danger" id="deleteMemberBtn">Eliminar</button>
                        <button class="btn btn-primary" id="saveMemberBtn">Guardar Cambios</button>
                    </div>
                </div>
            </div>
        `;
        
        showModal(modalHtml);
        
        // Configurar event listeners del modal
        document.querySelector('.close-modal')?.addEventListener('click', closeModal);
        document.querySelector('.close-modal-btn')?.addEventListener('click', closeModal);
        
        document.getElementById('saveMemberBtn')?.addEventListener('click', async () => {
            try {
                const updates = {
                    name: document.getElementById('editName').value,
                    phone: document.getElementById('editPhone').value,
                    role: document.getElementById('editRole').value,
                    plan: document.getElementById('editPlan').value,
                    status: document.getElementById('editStatus').value
                };
                
                await adminSystem.updateMember(memberId, updates);
                closeModal();
                loadMembersTab();
                showSuccess('Miembro actualizado correctamente');
                
            } catch (error) {
                showError(`Error actualizando miembro: ${error.message}`);
            }
        });
        
        document.getElementById('deleteMemberBtn')?.addEventListener('click', () => {
            closeModal();
            deleteMember(memberId);
        });
    }
    
    // Eliminar miembro
    async function deleteMember(memberId) {
        if (!confirm('¿Estás seguro de que quieres eliminar este miembro? Esta acción no se puede deshacer.')) {
            return;
        }
        
        try {
            await adminSystem.deleteMember(memberId);
            loadMembersTab();
            showSuccess('Miembro eliminado correctamente');
            
        } catch (error) {
            showError(`Error eliminando miembro: ${error.message}`);
        }
    }
    
    // Ver detalles de clase
    function viewClassDetails(classId) {
        const cls = window.barraboxDataManager.getClass(classId);
        if (!cls) {
            showError('Clase no encontrada');
            return;
        }
        
        const classBookings = window.barraboxDataManager.getBookingsByClass(classId);
        const activeBookings = classBookings.filter(b => b.status === 'confirmed').length;
        const occupancy = Math.round((cls.booked / cls.capacity) * 100);
        
        const modalHtml = `
            <div class="admin-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-dumbbell"></i> Detalles de la Clase</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="class-details">
                            <div class="detail-section">
                                <h4>Información de la Clase</h4>
                                <div class="detail-row">
                                    <span class="label">Título:</span>
                                    <span class="value">${cls.title}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Tipo:</span>
                                    <span class="value">${cls.type}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Ocupación:</span>
                                    <span class="value">${cls.booked}/${cls.capacity} (${occupancy}%)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button class="btn btn-outline close-modal-btn">Cerrar</button>
                    </div>
                </div>
            </div>
        `;
        
        showModal(modalHtml);
        
        document.querySelector('.close-modal')?.addEventListener('click', closeModal);
        document.querySelector('.close-modal-btn')?.addEventListener('click', closeModal);
    }
    
    // ==================== UTILIDADES ====================
    
    function debounce(fn, delay) {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    }
    
    function refreshAllData() {
        loadMembersTab();
        loadClassesTab();
        loadBookingsTab();
        loadReportsTab();
    }
    
    function showNotifications() {
        alert('Sistema de notificaciones en desarrollo');
    }
    
    function showNewClassModal() {
        alert('Formulario de nueva clase en desarrollo');
    }
    
    function exportData(type) {
        try {
            let data;
            let filename;
            
            switch (type) {
                case 'members':
                    data = adminSystem.getAllMembers();
                    filename = 'barrabox_miembros.json';
                    break;
                case 'classes':
                    data = adminSystem.getAllClasses();
                    filename = 'barrabox_clases.json';
                    break;
                case 'bookings':
                    data = adminSystem.getAllBookings();
                    filename = 'barrabox_reservas.json';
                    break;
                case 'all':
                    data = {
                        members: adminSystem.getAllMembers(),
                        classes: adminSystem.getAllClasses(),
                        bookings: adminSystem.getAllBookings()
                    };
                    filename = 'barrabox_backup_completo.json';
                    break;
                default:
                    return;
            }
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
            
            showSuccess(`Datos exportados: ${filename}`);
        } catch (error) {
            showError(`Error exportando datos: ${error.message}`);
        }
    }
    
    // ==================== INICIALIZACIÓN ====================
    
    // Inicializar cuando DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAdminIntegration);
    } else {
        initAdminIntegration();
    }

})();