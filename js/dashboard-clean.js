// Barrabox Dashboard JavaScript - Iteración 2
document.addEventListener('DOMContentLoaded', function() {
    console.log('Barrabox Dashboard cargado');
    
    // Datos de ejemplo
    const dashboardData = {
        user: { name: "Juan Pérez", plan: "Premium", avatar: "👤" },
        stats: { classesThisMonth: 12, hoursTrained: 18, caloriesBurned: 4200, streakDays: 7 },
        classes: [
            { id: 1, type: "crossfit", name: "Crossfit AMRAP", time: "08:00 - 09:00", coach: "María González", spots: 5, maxSpots: 12, booked: false },
            { id: 2, type: "halterofilia", name: "Halterofilia Técnica", time: "10:00 - 11:30", coach: "Carlos Rodríguez", spots: 3, maxSpots: 8, booked: true },
            { id: 3, type: "gap", name: "GAP Intensivo", time: "17:00 - 18:00", coach: "Ana Martínez", spots: 8, maxSpots: 15, booked: false },
            { id: 4, type: "crossfit", name: "Crossfit WOD", time: "19:00 - 20:00", coach: "Pedro Sánchez", spots: 2, maxSpots: 12, booked: false },
            { id: 5, type: "halterofilia", name: "Powerlifting", time: "20:30 - 22:00", coach: "Carlos Rodríguez", spots: 0, maxSpots: 6, booked: false }
        ],
        calendarWeek: [
            { day: "Lun", date: 14, classes: ["Crossfit 08:00", "GAP 17:00"] },
            { day: "Mar", date: 15, classes: ["Halterofilia 10:00", "Crossfit 19:00"] },
            { day: "Mié", date: 16, classes: ["Crossfit 08:00", "GAP 17:00"] },
            { day: "Jue", date: 17, classes: ["Halterofilia 10:00", "Powerlifting 20:30"] },
            { day: "Vie", date: 18, classes: ["Crossfit 08:00", "GAP 17:00"] },
            { day: "Sáb", date: 19, classes: ["Open Box 09:00-13:00"] },
            { day: "Dom", date: 20, classes: ["Descanso"] }
        ],
        payments: [
            { id: "PAY-001", date: "2026-04-01", amount: 45000, method: "Tarjeta ****1234", status: "paid" },
            { id: "PAY-002", date: "2026-03-01", amount: 45000, method: "Tarjeta ****1234", status: "paid" },
            { id: "PAY-003", date: "2026-02-01", amount: 45000, method: "Transferencia", status: "paid" },
            { id: "PAY-004", date: "2026-01-01", amount: 42000, method: "Tarjeta ****1234", status: "paid" }
        ],
        paymentMethods: [
            { type: "credit-card", last4: "1234", expiry: "12/27", default: true },
            { type: "bank", bank: "Banco Estado", account: "****5678" }
        ]
    };

    // Inicializar
    initUserMenu();
    initTabs();
    initClassesFilter();
    initCalendar();
    initPlanActions();
    initPaymentActions();
    loadDashboardData();
    
    function loadDashboardData() {
        document.querySelector('.user-name').textContent = dashboardData.user.name;
        document.querySelector('.user-plan').textContent = `Plan ${dashboardData.user.plan}`;
        document.querySelector('.user-avatar').textContent = dashboardData.user.avatar;
        
        document.getElementById('stat-classes').textContent = dashboardData.stats.classesThisMonth;
        document.getElementById('stat-hours').textContent = dashboardData.stats.hoursTrained;
        document.getElementById('stat-calories').textContent = dashboardData.stats.caloriesBurned.toLocaleString();
        document.getElementById('stat-streak').textContent = dashboardData.stats.streakDays;
        
        renderClasses(dashboardData.classes);
        renderCalendar(dashboardData.calendarWeek);
        renderPayments(dashboardData.payments);
        renderPaymentMethods(dashboardData.paymentMethods);
    }
    
    function initUserMenu() {
        const menuToggle = document.getElementById('userMenuToggle');
        const menuDropdown = document.getElementById('userMenuDropdown');
        
        if (menuToggle && menuDropdown) {
            menuToggle.addEventListener('click', function(e) {
                e.stopPropagation();
                menuDropdown.classList.toggle('show');
            });
            
            document.addEventListener('click', function() {
                menuDropdown.classList.remove('show');
            });
            
            menuDropdown.addEventListener('click', function(e) {
                e.stopPropagation();
            });
            
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                        showNotification('Sesión cerrada correctamente', 'success');
                        setTimeout(() => {
                            window.location.href = 'index.html';
                        }, 1500);
                    }
                });
            }
        }
    }
    
    function initTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                tabButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                tabContents.forEach(content => content.classList.remove('active'));
                const tabId = this.getAttribute('data-tab');
                const tabContent = document.getElementById(tabId);
                if (tabContent) tabContent.classList.add('active');
            });
        });
        
        if (tabButtons.length > 0) tabButtons[0].click();
    }
    
    function initClassesFilter() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                const filterType = this.getAttribute('data-filter');
                filterClasses(filterType);
            });
        });
    }
    
    function filterClasses(type) {
        let filteredClasses = type === 'all' ? dashboardData.classes : dashboardData.classes.filter(cls => cls.type === type);
        renderClasses(filteredClasses);
    }
    
    function renderClasses(classes) {
        const classesContainer = document.getElementById('classes-list');
        if (!classesContainer) return;
        
        classesContainer.innerHTML = '';
        
        classes.forEach(cls => {
            const classCard = document.createElement('div');
            classCard.className = 'class-card';
            classCard.innerHTML = `
                <div class="class-header">
                    <span class="class-type ${cls.type}">${getClassTypeName(cls.type)}</span>
                    <span class="class-time">${cls.time}</span>
                </div>
                <h3>${cls.name}</h3>
                <div class="class-coach"><i class="fas fa-user"></i><span>Coach: ${cls.coach}</span></div>
                <div class="class-spots"><i class="fas fa-users"></i><span>Disponibles: ${cls.spots}/${cls.maxSpots}</span></div>
                <button class="btn btn-primary btn-small ${cls.booked ? 'booked' : ''} ${cls.spots === 0 ? 'disabled' : ''}" 
                        data-class-id="${cls.id}" ${cls.spots === 0 ? 'disabled' : ''}>
                    ${cls.booked ? 'Cancelar Reserva' : (cls.spots === 0 ? 'Completo' : 'Reservar')}
                </button>
            `;
            classesContainer.appendChild(classCard);
        });
        
        document.querySelectorAll('#classes-list .btn').forEach(button => {
            button.addEventListener('click', function() {
                const classId = parseInt(this.getAttribute('data-class-id'));
                const classData = dashboardData.classes.find(c => c.id === classId);
                if (classData) {
                    if (classData.booked) cancelBooking(classId);
                    else bookClass(classId);
                }
            });
        });
    }
    
    function getClassTypeName(type) {
        const names = { 'crossfit': 'Crossfit', 'halterofilia': 'Halterofilia', 'gap': 'GAP' };
        return names[type] || type;
    }
    
    function initCalendar() {
        const prevBtn = document.getElementById('calendarPrev');
        const nextBtn = document.getElementById('calendarNext');
        const currentWeek = document.getElementById('currentWeek');
        
        if (prevBtn) prevBtn.addEventListener('click', () => showNotification('Semana anterior', 'info'));
        if (nextBtn) nextBtn.addEventListener('click', () => showNotification('Próxima semana', 'info'));
        
        if (currentWeek) {
            const today = new Date();
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay() + 1);
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            const options = { day: 'numeric', month: 'short' };
            currentWeek.textContent = `${startOfWeek.toLocaleDateString('es-ES', options)} - ${endOfWeek.toLocaleDateString('es-ES', options)}`;
        }
    }
    
    function renderCalendar(weekData) {
        const calendarContainer = document.getElementById('calendar-week');
        if (!calendarContainer) return;
        
        calendarContainer.innerHTML = '';
        const today = new Date().getDate();
        
        weekData.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.className = `calendar-day ${day.date === today ? 'current' : ''}`;
            dayElement.innerHTML = `
                <div class="day-header">${day.day}</div>
                <div class="day-number">${day.date}</div>
                <div class="day-classes">${day.classes.join('<br>')}</div>
            `;
            calendarContainer.appendChild(dayElement);
        });
    }
    
    function initPlanActions() {
        const renewBtn = document.getElementById('renewPlanBtn');
        const cancelAutoBtn = document.getElementById('cancelAutoRenewal');
        const upgradeBtns = document.querySelectorAll('.upgrade-plan');
        
        if (renewBtn) renewBtn.addEventListener('click', () => {
            if (confirm('¿Renovar plan Premium por $45.000?')) {
                showNotification('Plan renovado exitosamente', 'success');
                setTimeout(() => showNotification('Pago procesado. Próxima renovación: 13/05/2026', 'success'), 1000);
            }
        });
        
        if (cancelAutoBtn) cancelAutoBtn.addEventListener('click', () => {
            if (confirm('¿Cancelar renovación automática? Deberás renovar manualmente cada mes.')) {
                showNotification('Renovación automática cancelada', 'warning');
            }
        });
        
        upgradeBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const plan = this.getAttribute('data-plan');
                const price = this.getAttribute('data-price');
                if (confirm(`¿Cambiar a plan ${plan} por $${price}?`)) {
                    showNotification(`Plan cambiado a ${plan}`, 'success');
                }
            });
        });
    }
    
    function initPaymentActions() {
        const addPaymentBtn = document.getElementById('addPaymentMethod');
        if (addPaymentBtn) addPaymentBtn.addEventListener('click', () => {
            showNotification('Funcionalidad de añadir método de pago en desarrollo', 'info');
        });
        
        document.querySelectorAll('.remove-method').forEach(btn => {
            btn.addEventListener('click', function() {
                const methodId = this.getAttribute('data-method-id');
                if (confirm('¿Eliminar este método de pago?')) {
                    showNotification('Método de pago eliminado', 'success');
                }
            });
        });
    }
    
    function renderPayments(payments) {
        const paymentsBody = document.getElementById('payments-body');
        if (!paymentsBody) return;
        
        paymentsBody.innerHTML = '';
        payments.forEach(payment => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${payment.id}</td>
                <td>${formatDate(payment.date)}</td>
                <td>$${payment.amount.toLocaleString()}</td>
                <td>${payment.method}</td>
                <td><span class="payment-status status-${payment.status}">${getStatusText(payment.status)}</span></td>
            `;
            paymentsBody.appendChild(row);
        });
    }
    
    function renderPaymentMethods(methods) {
        const methodsList = document.getElementById('payment-methods-list');
        if (!methodsList) return;
        
        methodsList.innerHTML = '';
        methods.forEach(method => {
            const methodCard = document.createElement('div');
            methodCard.className = 'method-card';
            methodCard.innerHTML = `
                <div class="method-info">
                    <i class="fas fa-${method.type === 'credit-card' ? 'credit-card' : 'university'}"></i>
                    <div>
                        <p>${getMethodName(method)}</p>
                        <small>${getMethodDetails(method)}</small>
                    </div>
                </div>
                ${method.default ? '<span class="badge badge-primary">Predeterminado</span>' : 
                  '<button class="btn btn-outline-danger btn-small remove-method" data-method-id="${method.type}">Eliminar</button>'}
            `;
            methodsList.appendChild(methodCard);
        });
    }
    
    function getMethodName(method) {
        return method.type === 'credit-card' ? 'Tarjeta de Crédito' : 
               method.type === 'bank' ? 'Transferencia Bancaria' : 'Método de Pago';
    }
    
    function getMethodDetails(method) {
        return method.type === 'credit-card' ? `Terminada en ${method.last4} · Expira ${method.expiry}` :
               method.type === 'bank' ? `${method.bank} · Cuenta ${method.account}` : '';
    }
    
    // Funciones de reserva
    function bookClass(classId) {
        const classData = dashboardData.classes.find(c => c.id === classId);
        if (!classData) return;
        
        if (classData.spots === 0) {
            showNotification('Lo sentimos, esta clase está completa', 'error');
            return;
        }
        
        classData.booked = true;
        classData.spots -= 1;
        dashboardData.stats.classesThisMonth += 1;
        dashboardData.stats.hoursTrained += 1.5;
        dashboardData.stats.caloriesBurned += 350;
        
        showNotification(`Clase "${classData.name}" reservada exitosamente`, 'success');
        renderClasses(dashboardData.classes);
        loadDashboardData();
    }
    
    function cancelBooking(classId) {
        const classData = dashboardData.classes.find(c => c.id === classId);
        if (!classData) return;
        
        if (confirm(`¿Cancelar reserva de "${classData.name}"?`)) {
            classData.booked = false;
            classData.spots += 1;
            dashboardData.stats.classesThisMonth -= 1;
            dashboardData.stats.hoursTrained -= 1.5;
            dashboardData.stats.caloriesBurned -= 350;
            
            showNotification(`Reserva de "${classData.name}" cancelada`, 'warning');
            renderClasses(dashboardData.classes);
            loadDashboardData();
        }
    }
    
    // Funciones auxiliares
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    
    function getStatusText(status) {
        const statusMap = { paid: 'Pagado', pending: 'Pendiente', failed: 'Fallido' };
        return statusMap[status] || status;
    }
    
    function showNotification(message, type = 'info') {
        // Crear notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        // Añadir al DOM
        const container = document.getElementById('notifications-container') || createNotificationContainer();
        container.appendChild(notification);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
        
        // Botón de cerrar
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        });
    }
    
    function createNotificationContainer() {
        const container = document.createElement('div');
        container.id = 'notifications-container';
        container.className = 'notifications-container';
        document.body.appendChild(container);
        return container;
    }
});