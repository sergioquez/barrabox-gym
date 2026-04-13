// Booking Integration Script
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Booking Integration cargando...');
    
    // Variables globales
    let calendar = null;
    let currentUser = null;
    
    // Inicializar sistema
    async function initialize() {
        console.log('🧪 Inicializando sistema de reservas...');
        
        // Verificar que los sistemas necesarios estén disponibles
        if (!window.barraboxDataManager) {
            showError('Data Manager no disponible');
            return;
        }
        
        if (!window.barraboxAuth) {
            showError('Auth System no disponible');
            return;
        }
        
        // Verificar autenticación
        if (!window.barraboxAuth.isLoggedIn()) {
            showError('Debes iniciar sesión para reservar clases');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return;
        }
        
        // Obtener usuario actual
        currentUser = window.barraboxAuth.getCurrentUser();
        console.log('✅ Usuario autenticado:', currentUser.email);
        
        // Cargar datos iniciales
        await loadInitialData();
        
        // Inicializar calendario
        initializeCalendar();
        
        // Cargar reservas próximas
        loadUpcomingBookings();
        
        // Configurar event listeners
        setupEventListeners();
        
        // Actualizar estadísticas
        updateStats();
        
        console.log('✅ Sistema de reservas inicializado correctamente');
    }
    
    // Cargar datos iniciales
    async function loadInitialData() {
        try {
            // Verificar que haya datos de demo si está vacío
            const data = window.barraboxDataManager.getAllData();
            
            if (data.classes.length === 0) {
                console.log('⚠️ No hay clases, creando datos de demo...');
                createDemoClasses();
            }
            
            if (data.users.length <= 2) { // Solo admin y usuario demo
                console.log('⚠️ Pocos usuarios, asegurando datos de demo...');
                ensureDemoData();
            }
            
        } catch (error) {
            console.error('Error cargando datos:', error);
            showError('Error cargando datos del sistema');
        }
    }
    
    // Crear clases de demo
    function createDemoClasses() {
        const demoClasses = [
            {
                type: 'crossfit',
                title: 'CrossFit Intenso',
                coach: 'María González',
                schedule: 'Lunes 18:00',
                capacity: 20,
                booked: 8,
                description: 'Entrenamiento funcional de alta intensidad'
            },
            {
                type: 'yoga',
                title: 'Yoga Restaurativo',
                coach: 'Carlos Rodríguez',
                schedule: 'Martes 09:00',
                capacity: 15,
                booked: 12,
                description: 'Yoga suave para relajación y flexibilidad'
            },
            {
                type: 'hiit',
                title: 'HIIT Cardio',
                coach: 'Ana Martínez',
                schedule: 'Miércoles 19:00',
                capacity: 25,
                booked: 20,
                description: 'Entrenamiento intervalado de alta intensidad'
            },
            {
                type: 'spinning',
                title: 'Spinning Energy',
                coach: 'Pedro López',
                schedule: 'Jueves 17:00',
                capacity: 30,
                booked: 25,
                description: 'Clase de ciclismo indoor con música energética'
            },
            {
                type: 'boxing',
                title: 'Boxing Fit',
                coach: 'Laura Sánchez',
                schedule: 'Viernes 20:00',
                capacity: 18,
                booked: 15,
                description: 'Entrenamiento de boxeo para fitness'
            },
            {
                type: 'crossfit',
                title: 'CrossFit Morning',
                coach: 'María González',
                schedule: 'Sábado 08:00',
                capacity: 20,
                booked: 10,
                description: 'CrossFit para empezar el día con energía'
            }
        ];
        
        demoClasses.forEach(cls => {
            window.barraboxDataManager.createClass(cls);
        });
        
        console.log('✅ Clases de demo creadas');
    }
    
    // Asegurar datos de demo
    function ensureDemoData() {
        // Verificar que existan usuarios demo
        const adminUser = window.barraboxDataManager.getUserByEmail('admin@barrabox.cl');
        const demoUser = window.barraboxDataManager.getUserByEmail('usuario@barrabox.cl');
        
        if (!adminUser) {
            window.barraboxDataManager.createUser({
                email: 'admin@barrabox.cl',
                name: 'Administrador Barrabox',
                role: 'admin',
                plan: 'premium',
                status: 'active'
            });
        }
        
        if (!demoUser) {
            window.barraboxDataManager.createUser({
                email: 'usuario@barrabox.cl',
                name: 'Usuario Demo',
                role: 'member',
                plan: 'premium',
                status: 'active'
            });
        }
    }
    
    // Inicializar calendario
    function initializeCalendar() {
        const container = document.getElementById('calendarContainer');
        if (!container) {
            showError('Contenedor del calendario no encontrado');
            return;
        }
        
        // Obtener datos para el calendario
        const classes = window.barraboxDataManager.getAllClasses();
        const bookings = window.barraboxDataManager.getAllBookings();
        
        console.log(`📊 Datos para calendario: ${classes.length} clases, ${bookings.length} reservas`);
        
        // Crear instancia del calendario
        calendar = new BarraboxCalendar({
            container: container,
            classes: classes,
            bookings: bookings,
            userId: currentUser.id
        });
        
        // Configurar event listeners del calendario
        container.addEventListener('calendar:bookingCreated', (e) => {
            console.log('✅ Reserva creada:', e.detail);
            showSuccess('¡Reserva creada exitosamente!');
            loadUpcomingBookings();
            updateStats();
        });
        
        container.addEventListener('calendar:bookingCancelled', (e) => {
            console.log('❌ Reserva cancelada:', e.detail);
            showInfo('Reserva cancelada exitosamente');
            loadUpcomingBookings();
            updateStats();
        });
        
        console.log('✅ Calendario inicializado');
    }
    
    // Cargar reservas próximas
    function loadUpcomingBookings() {
        const container = document.getElementById('upcomingBookings');
        if (!container) return;
        
        // Obtener reservas del usuario
        const userBookings = window.barraboxDataManager.getBookingsByUser(currentUser.id);
        
        // Filtrar solo reservas confirmadas futuras
        const now = new Date();
        const upcomingBookings = userBookings.filter(booking => {
            if (booking.status !== 'confirmed') return false;
            
            const bookingDate = new Date(booking.date + 'T' + booking.time);
            return bookingDate > now;
        }).sort((a, b) => {
            const dateA = new Date(a.date + 'T' + a.time);
            const dateB = new Date(b.date + 'T' + b.time);
            return dateA - dateB;
        });
        
        // Renderizar reservas
        if (upcomingBookings.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-check"></i>
                    <h3>No tienes reservas próximas</h3>
                    <p>Selecciona una clase disponible en el calendario para reservar.</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        
        upcomingBookings.forEach(booking => {
            const cls = window.barraboxDataManager.getClass(booking.classId);
            if (!cls) return;
            
            const bookingDate = new Date(booking.date + 'T' + booking.time);
            const formattedDate = bookingDate.toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
            });
            const formattedTime = booking.time.replace(':00', '');
            
            html += `
                <div class="booking-card">
                    <div class="booking-info">
                        <div class="booking-title">${cls.title}</div>
                        <div class="booking-details">
                            <div class="booking-detail">
                                <i class="fas fa-calendar"></i>
                                <span>${formattedDate}</span>
                            </div>
                            <div class="booking-detail">
                                <i class="fas fa-clock"></i>
                                <span>${formattedTime}</span>
                            </div>
                            <div class="booking-detail">
                                <i class="fas fa-user"></i>
                                <span>${cls.coach}</span>
                            </div>
                            <div class="booking-detail">
                                <i class="fas fa-dumbbell"></i>
                                <span>${cls.type}</span>
                            </div>
                        </div>
                    </div>
                    <div class="booking-actions">
                        <button class="btn btn-secondary btn-small view-booking" data-booking-id="${booking.id}">
                            <i class="fas fa-eye"></i>
                            Ver
                        </button>
                        <button class="btn btn-danger btn-small cancel-booking" data-booking-id="${booking.id}">
                            <i class="fas fa-times"></i>
                            Cancelar
                        </button>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
        // Configurar event listeners para los botones
        container.querySelectorAll('.view-booking').forEach(btn => {
            btn.addEventListener('click', () => viewBookingDetails(btn.dataset.bookingId));
        });
        
        container.querySelectorAll('.cancel-booking').forEach(btn => {
            btn.addEventListener('click', () => cancelBooking(btn.dataset.bookingId));
        });
    }
    
    // Ver detalles de reserva
    function viewBookingDetails(bookingId) {
        const booking = window.barraboxDataManager.getBooking(bookingId);
        if (!booking) {
            showError('Reserva no encontrada');
            return;
        }
        
        const cls = window.barraboxDataManager.getClass(booking.classId);
        if (!cls) {
            showError('Clase no encontrada');
            return;
        }
        
        const bookingDate = new Date(booking.date + 'T' + booking.time);
        const formattedDate = bookingDate.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        
        const modalHtml = `
            <div class="booking-details-modal">
                <div class="modal-content">
                    <h3>Detalles de Reserva</h3>
                    
                    <div class="booking-info">
                        <div class="info-row">
                            <span class="label">Clase:</span>
                            <span class="value">${cls.title}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Tipo:</span>
                            <span class="value">${cls.type}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Instructor:</span>
                            <span class="value">${cls.coach}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Fecha:</span>
                            <span class="value">${formattedDate}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Hora:</span>
                            <span class="value">${booking.time}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Estado:</span>
                            <span class="value status-${booking.status}">
                                ${booking.status === 'confirmed' ? 'Confirmada' : 'Cancelada'}
                            </span>
                        </div>
                        <div class="info-row">
                            <span class="label">Reservada el:</span>
                            <span class="value">${new Date(booking.createdAt).toLocaleDateString('es-ES')}</span>
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <button class="btn btn-secondary" id="closeModal">Cerrar</button>
                        ${booking.status === 'confirmed' ? `
                            <button class="btn btn-danger" id="cancelFromModal">Cancelar Reserva</button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
        const modal = document.createElement('div');
        modal.innerHTML = modalHtml;
        document.body.appendChild(modal);
        
        // Event listeners del modal
        modal.querySelector('#closeModal').addEventListener('click', () => {
            modal.remove();
        });
        
        const cancelBtn = modal.querySelector('#cancelFromModal');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                cancelBooking(bookingId);
                modal.remove();
            });
        }
        
        // Cerrar al hacer click fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    // Cancelar reserva
    async function cancelBooking(bookingId) {
        if (!confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
            return;
        }
        
        const booking = window.barraboxDataManager.getBooking(bookingId);
        if (!booking) {
            showError('Reserva no encontrada');
            return;
        }
        
        const cls = window.barraboxDataManager.getClass(booking.classId);
        if (!cls) {
            showError('Clase no encontrada');
            return;
        }
        
        try {
            const cancelled = window.barraboxDataManager.cancelBooking(bookingId);
            
            if (cancelled) {
                // Liberar cupo
                window.barraboxDataManager.updateClass(cls.id, {
                    booked: Math.max(0, cls.booked - 1)
                });
                
                // Crear notificación
                window.barraboxDataManager.createNotification(
                    currentUser.id,
                    'booking_cancelled',
                    'Reserva Cancelada',
                    `Tu reserva para ${cls.title} ha sido cancelada.`,
                    'warning'
                );
                
                showInfo('Reserva cancelada exitosamente');
                
                // Actualizar UI
                if (calendar) {
                    calendar.refreshData();
                }
                loadUpcomingBookings();
                updateStats();
            } else {
                showError('Error al cancelar la reserva');
            }
        } catch (error) {
            console.error('Error cancelando reserva:', error);
            showError('Error al cancelar la reserva');
        }
    }
    
    // Actualizar estadísticas
    function updateStats() {
        // Reservas activas
        const userBookings = window.barraboxDataManager.getBookingsByUser(currentUser.id);
        const activeBookings = userBookings.filter(b => b.status === 'confirmed').length;
        
        // Clases este mes
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        const classesThisMonth = userBookings.filter(b => {
            if (b.status !== 'confirmed') return false;
            const bookingDate = new Date(b.date + 'T' + b.time);
            return bookingDate >= firstDay && bookingDate <= lastDay;
        }).length;
        
        // Actualizar UI
        const statBookings = document.getElementById('statBookings');
        const statClasses = document.getElementById('statClasses');
        
        if (statBookings) statBookings.textContent = activeBookings;
        if (statClasses) statClasses.textContent = classesThisMonth;
    }
    
    // Configurar event listeners
    function setupEventListeners() {
        // Filtros
        const classTypeFilter = document.getElementById('classType');
        const timeRangeFilter = document.getElementById('timeRange');
        const showAvailableFilter = document.getElementById('showAvailable');
        const showBookedFilter = document.getElementById('showBooked');
        
        if (classTypeFilter) {
            classTypeFilter.addEventListener('change', applyFilters);
        }
        
        if (timeRangeFilter) {
            timeRangeFilter.addEventListener('change', applyFilters);
        }
        
        if (showAvailableFilter) {
            showAvailableFilter.addEventListener('change', applyFilters);
        }
        
        if (showBookedFilter) {
            showBookedFilter.addEventListener('change', applyFilters);
        }
        
        // Botones de acción
        const goTodayBtn = document.getElementById('goToday');
        const refreshBtn = document.getElementById('refreshCalendar');
        const helpBtn = document.getElementById('helpButton');
        const printBtn = document.getElementById('printCalendar');
        
        if (goTodayBtn) {
            goTodayBtn.addEventListener('click', () => {
                if (calendar) {
                    calendar.goToToday();
                }
            });
        }
        
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                if (calendar) {
                    calendar.refreshData();
                }
                loadUpcomingBookings();
                updateStats();
                showInfo('Calendario actualizado');
            });
        }
        
        if (helpBtn) {
            helpBtn.addEventListener('click', () => {
                showHelpModal();
            });
        }
        
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                window.print();
            });
        }
    }
    
    // Aplicar filtros
    function applyFilters() {
        // En una implementación real, esto filtraría las clases en el calendario
        // Por ahora, solo mostramos un mensaje
        console.log('Filtros aplicados');
        showInfo('Filtros aplicados (demo)');
    }
    
// Continuación de booking-integration.js

    // Mostrar modal de ayuda
    function showHelpModal() {
        const modalHtml = `
            <div class="booking-details-modal">
                <div class="modal-content">
                    <h3>Ayuda - Sistema de Reservas</h3>
                    
                    <div class="help-content">
                        <div class="help-section">
                            <h4><i class="fas fa-calendar-alt"></i> Cómo usar el calendario</h4>
                            <ul>
                                <li><strong>Clases disponibles:</strong> Aparecen en verde con botón "Reservar"</li>
                                <li><strong>Tus reservas:</strong> Aparecen en azul con estado "RESERVADO"</li>
                                <li><strong>Clases llenas:</strong> Aparecen en rojo sin botón de reserva</li>
                                <li><strong>Sin clase:</strong> Horarios sin programación aparecen en gris</li>
                            </ul>
                        </div>
                        
                        <div class="help-section">
                            <h4><i class="fas fa-clock"></i> Proceso de reserva</h4>
                            <ol>
                                <li>Busca una clase disponible en el calendario</li>
                                <li>Haz click en el botón "Reservar"</li>
                                <li>Confirma la reserva en el popup</li>
                                <li>Recibirás una notificación de confirmación</li>
                                <li>Tu reserva aparecerá en "Mis Próximas Reservas"</li>
                            </ol>
                        </div>
                        
                        <div class="help-section">
                            <h4><i class="fas fa-times-circle"></i> Cancelación de reservas</h4>
                            <ul>
                                <li>Puedes cancelar desde el calendario (click en tu reserva)</li>
                                <li>También desde la lista "Mis Próximas Reservas"</li>
                                <li>El cupo se libera automáticamente</li>
                                <li>Recibirás una notificación de cancelación</li>
                            </ul>
                        </div>
                        
                        <div class="help-section">
                            <h4><i class="fas fa-filter"></i> Filtros disponibles</h4>
                            <ul>
                                <li><strong>Tipo de clase:</strong> Filtra por CrossFit, Yoga, HIIT, etc.</li>
                                <li><strong>Horario:</strong> Mañana, tarde o noche</li>
                                <li><strong>Disponibilidad:</strong> Solo clases con cupos</li>
                                <li><strong>Tus reservas:</strong> Mostrar/ocultar tus reservas</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <button class="btn btn-primary" id="closeHelpModal">Entendido</button>
                    </div>
                </div>
            </div>
        `;
        
        const modal = document.createElement('div');
        modal.innerHTML = modalHtml;
        document.body.appendChild(modal);
        
        // Estilos para la ayuda
        const style = document.createElement('style');
        style.textContent = `
            .help-content {
                max-height: 400px;
                overflow-y: auto;
                margin-bottom: 1.5rem;
            }
            
            .help-section {
                margin-bottom: 1.5rem;
                padding-bottom: 1.5rem;
                border-bottom: 1px solid #e9ecef;
            }
            
            .help-section:last-child {
                border-bottom: none;
                margin-bottom: 0;
                padding-bottom: 0;
            }
            
            .help-section h4 {
                color: #2D3047;
                font-family: 'Montserrat', sans-serif;
                font-size: 1.1rem;
                margin-bottom: 0.8rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .help-section ul, .help-section ol {
                padding-left: 1.5rem;
                margin: 0;
            }
            
            .help-section li {
                margin-bottom: 0.5rem;
                line-height: 1.5;
            }
            
            .help-section li:last-child {
                margin-bottom: 0;
            }
        `;
        modal.querySelector('.modal-content').appendChild(style);
        
        // Event listener para cerrar
        modal.querySelector('#closeHelpModal').addEventListener('click', () => {
            modal.remove();
        });
        
        // Cerrar al hacer click fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    // Funciones de utilidad para mensajes
    function showSuccess(message) {
        if (window.barraboxAuth && window.barraboxAuth.showMessage) {
            window.barraboxAuth.showMessage('success', message);
        } else {
            alert('✅ ' + message);
        }
    }
    
    function showError(message) {
        if (window.barraboxAuth && window.barraboxAuth.showMessage) {
            window.barraboxAuth.showMessage('error', message);
        } else {
            alert('❌ ' + message);
        }
    }
    
    function showInfo(message) {
        if (window.barraboxAuth && window.barraboxAuth.showMessage) {
            window.barraboxAuth.showMessage('info', message);
        } else {
            alert('ℹ️ ' + message);
        }
    }
    
    // Inicializar cuando la página esté lista
    setTimeout(() => {
        initialize();
    }, 500);
    
    // Exponer funciones para debugging
    window.bookingSystem = {
        initialize,
        loadUpcomingBookings,
        updateStats,
        cancelBooking,
        viewBookingDetails
    };
    
    console.log('📋 Booking Integration cargado. Usa window.bookingSystem para debugging.');
});

// Estilos adicionales para la página de booking
const bookingStyles = document.createElement('style');
bookingStyles.textContent = `
    /* Mejoras para la página de booking */
    .calendar-container {
        min-height: 600px;
        position: relative;
    }
    
    .calendar-container .empty-state {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100%;
    }
    
    /* Estados de carga */
    .loading {
        opacity: 0.7;
        pointer-events: none;
    }
    
    .loading::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 40px;
        height: 40px;
        border: 3px solid #f3f3f3;
        border-top: 3px solid #FF6B35;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: translate(-50%, -50%) rotate(0deg); }
        100% { transform: translate(-50%, -50%) rotate(360deg); }
    }
    
    /* Mejoras responsive */
    @media (max-width: 768px) {
        .booking-main {
            gap: 1rem;
        }
        
        .booking-sidebar, .booking-content {
            padding: 1rem;
        }
        
        .calendar-container {
            min-height: 400px;
        }
    }
    
    /* Print optimizations */
    @media print {
        .booking-sidebar, .user-actions, .content-actions {
            display: none;
        }
        
        .booking-main {
            grid-template-columns: 1fr;
        }
    }
`;

// Agregar estilos al documento
if (document.head) {
    document.head.appendChild(bookingStyles);
}