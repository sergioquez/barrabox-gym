// Calendar System for Barrabox Gym
class BarraboxCalendar {
    constructor(options = {}) {
        this.container = options.container || document.querySelector('.calendar-container');
        this.currentDate = options.initialDate || new Date();
        this.classes = options.classes || [];
        this.bookings = options.bookings || [];
        this.userId = options.userId || null;
        
        this.daysToShow = 6; // Lunes a Sábado
        this.timeSlots = this.generateTimeSlots();
        
        this.init();
    }
    
    init() {
        if (!this.container) {
            console.error('Calendar container not found');
            return;
        }
        
        this.render();
        this.setupEventListeners();
    }
    
    // ==================== TIME SLOTS GENERATION ====================
    
    generateTimeSlots() {
        // Horarios típicos de gimnasio
        return [
            { time: '06:00', label: '6:00 AM' },
            { time: '07:00', label: '7:00 AM' },
            { time: '08:00', label: '8:00 AM' },
            { time: '09:00', label: '9:00 AM' },
            { time: '10:00', label: '10:00 AM' },
            { time: '11:00', label: '11:00 AM' },
            { time: '12:00', label: '12:00 PM' },
            { time: '13:00', label: '1:00 PM' },
            { time: '14:00', label: '2:00 PM' },
            { time: '15:00', label: '3:00 PM' },
            { time: '16:00', label: '4:00 PM' },
            { time: '17:00', label: '5:00 PM' },
            { time: '18:00', label: '6:00 PM' },
            { time: '19:00', label: '7:00 PM' },
            { time: '20:00', label: '8:00 PM' },
            { time: '21:00', label: '9:00 PM' }
        ];
    }
    
    // ==================== DATE HELPERS ====================
    
    getWeekDates(startDate = this.currentDate) {
        const dates = [];
        const current = new Date(startDate);
        
        // Ir al lunes de esta semana
        const day = current.getDay();
        const diff = current.getDate() - day + (day === 0 ? -6 : 1); // Ajustar cuando es domingo
        current.setDate(diff);
        
        // Generar 6 días (Lunes a Sábado)
        for (let i = 0; i < this.daysToShow; i++) {
            const date = new Date(current);
            date.setDate(current.getDate() + i);
            dates.push(date);
        }
        
        return dates;
    }
    
    formatDate(date) {
        const options = { weekday: 'short', day: 'numeric', month: 'short' };
        return date.toLocaleDateString('es-ES', options);
    }
    
    formatTime(time) {
        return time.replace(':00', '');
    }
    
    getDateKey(date) {
        return date.toISOString().split('T')[0];
    }
    
    // ==================== CLASS MANAGEMENT ====================
    
    getClassesForDate(date, time) {
        const dateKey = this.getDateKey(date);
        return this.classes.filter(cls => {
            // En un sistema real, esto verificaría el horario real de la clase
            // Para demo, asignamos clases aleatorias
            const classTime = cls.schedule ? cls.schedule.split(' ')[1] : '18:00';
            return classTime === time;
        });
    }
    
    getBookingForSlot(date, time) {
        if (!this.userId) return null;
        
        const dateKey = this.getDateKey(date);
        return this.bookings.find(booking => {
            return booking.userId === this.userId &&
                   booking.date === dateKey &&
                   booking.time === time &&
                   booking.status === 'confirmed';
        });
    }
    
    isClassFull(cls, date, time) {
        const dateKey = this.getDateKey(date);
        const bookingsForClass = this.bookings.filter(booking => {
            return booking.classId === cls.id &&
                   booking.date === dateKey &&
                   booking.time === time &&
                   booking.status === 'confirmed';
        });
        
        return bookingsForClass.length >= cls.capacity;
    }
    
    // ==================== RENDERING ====================
    
    render() {
        const weekDates = this.getWeekDates();
        
        this.container.innerHTML = `
            <div class="calendar-header">
                <button class="calendar-nav prev-week">
                    <i class="fas fa-chevron-left"></i>
                    Semana Anterior
                </button>
                <h2 class="calendar-title">${this.getMonthYearTitle()}</h2>
                <button class="calendar-nav next-week">
                    Semana Siguiente
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
            
            <div class="calendar-grid">
                <div class="time-column">
                    <div class="time-header">Horario</div>
                    ${this.timeSlots.map(slot => `
                        <div class="time-slot">${slot.label}</div>
                    `).join('')}
                </div>
                
                ${weekDates.map(date => `
                    <div class="day-column" data-date="${this.getDateKey(date)}">
                        <div class="day-header">
                            <div class="day-name">${this.formatDate(date)}</div>
                            <div class="day-date">${date.getDate()}</div>
                        </div>
                        
                        ${this.timeSlots.map(slot => `
                            <div class="calendar-slot" 
                                 data-date="${this.getDateKey(date)}" 
                                 data-time="${slot.time}"
                                 data-available="true">
                                ${this.renderSlotContent(date, slot.time)}
                            </div>
                        `).join('')}
                    </div>
                `).join('')}
            </div>
            
            <div class="calendar-legend">
                <div class="legend-item">
                    <div class="legend-color available"></div>
                    <span>Disponible</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color booked"></div>
                    <span>Reservado por ti</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color full"></div>
                    <span>Lleno</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color unavailable"></div>
                    <span>No disponible</span>
                </div>
            </div>
        `;
        
        this.updateSlotStates();
    }
    
    renderSlotContent(date, time) {
        const classes = this.getClassesForDate(date, time);
        const booking = this.getBookingForSlot(date, time);
        
        if (booking) {
            const cls = this.classes.find(c => c.id === booking.classId);
            return `
                <div class="slot-content booked">
                    <div class="class-type">${cls ? cls.type : 'Clase'}</div>
                    <div class="class-title">${cls ? cls.title : 'Reservado'}</div>
                    <div class="class-coach">${cls ? cls.coach : ''}</div>
                    <div class="booking-status">RESERVADO</div>
                </div>
            `;
        }
        
        if (classes.length > 0) {
            const cls = classes[0]; // Tomar primera clase para demo
            const isFull = this.isClassFull(cls, date, time);
            
            return `
                <div class="slot-content ${isFull ? 'full' : 'available'}">
                    <div class="class-type">${cls.type}</div>
                    <div class="class-title">${cls.title}</div>
                    <div class="class-coach">${cls.coach}</div>
                    <div class="class-slots">
                        ${cls.booked}/${cls.capacity} cupos
                    </div>
                    ${!isFull ? '<button class="btn-book" data-class-id="${cls.id}">Reservar</button>' : ''}
                </div>
            `;
        }
        
        return `
            <div class="slot-content unavailable">
                <div class="no-class">Sin clase</div>
            </div>
        `;
    }
    
    updateSlotStates() {
        const slots = this.container.querySelectorAll('.calendar-slot');
        
        slots.forEach(slot => {
            const date = slot.dataset.date;
            const time = slot.dataset.time;
            const booking = this.getBookingForSlot(new Date(date), time);
            const classes = this.getClassesForDate(new Date(date), time);
            
            if (booking) {
                slot.dataset.state = 'booked';
            } else if (classes.length > 0) {
                const cls = classes[0];
                const isFull = this.isClassFull(cls, new Date(date), time);
                slot.dataset.state = isFull ? 'full' : 'available';
            } else {
                slot.dataset.state = 'unavailable';
            }
        });
    }
    
    getMonthYearTitle() {
        const options = { month: 'long', year: 'numeric' };
        return this.currentDate.toLocaleDateString('es-ES', options);
    }
    
    // ==================== EVENT HANDLERS ====================
    
    setupEventListeners() {
        // Navegación entre semanas
        this.container.addEventListener('click', (e) => {
            if (e.target.closest('.prev-week')) {
                this.navigateWeek(-1);
            } else if (e.target.closest('.next-week')) {
                this.navigateWeek(1);
            } else if (e.target.closest('.btn-book')) {
                this.handleBooking(e.target.closest('.btn-book'));
            } else if (e.target.closest('.calendar-slot.booked')) {
                this.handleBookingClick(e.target.closest('.calendar-slot'));
            }
        });
    }
    
    navigateWeek(direction) {
        this.currentDate.setDate(this.currentDate.getDate() + (direction * 7));
        this.render();
    }
    
    async handleBooking(bookButton) {
        const classId = bookButton.dataset.classId;
        const slot = bookButton.closest('.calendar-slot');
        const date = slot.dataset.date;
        const time = slot.dataset.time;
        
        const cls = this.classes.find(c => c.id === classId);
        if (!cls) return;
        
        // Verificar si aún hay cupos
        if (this.isClassFull(cls, new Date(date), time)) {
            this.showMessage('error', 'Esta clase ya está llena');
            return;
        }
        
        // Crear reserva
        const booking = {
            userId: this.userId,
            classId: classId,
            date: date,
            time: time,
            status: 'confirmed',
            createdAt: new Date().toISOString()
        };
        
        // Usar Data Manager si está disponible
        if (window.barraboxDataManager) {
            const createdBooking = window.barraboxDataManager.createBooking(booking);
            
            if (createdBooking) {
                // Actualizar contador de cupos
                window.barraboxDataManager.updateClass(classId, {
                    booked: cls.booked + 1
                });
                
                // Crear notificación
                window.barraboxDataManager.createNotification(
                    this.userId,
                    'booking_confirmed',
                    'Reserva Confirmada',
                    `Tu reserva para ${cls.title} el ${date} a las ${time} ha sido confirmada.`,
                    'success'
                );
                
                this.showMessage('success', `¡Reserva confirmada para ${cls.title}!`);
                this.refreshData();
            }
        } else {
            // Demo fallback
            this.bookings.push(booking);
            cls.booked += 1;
            this.showMessage('success', `¡Reserva demo confirmada para ${cls.title}!`);
            this.updateSlotStates();
        }
        
        // Disparar evento personalizado
        this.dispatchEvent('bookingCreated', { booking, class: cls });
    }
    
    handleBookingClick(slot) {
        const date = slot.dataset.date;
        const time = slot.dataset.time;
        const booking = this.getBookingForSlot(new Date(date), time);
        
        if (booking) {
            const cls = this.classes.find(c => c.id === booking.classId);
            this.showBookingDetails(booking, cls);
        }
    }
    
    showBookingDetails(booking, cls) {
        const modalHtml = `
            <div class="booking-details-modal">
                <div class="modal-content">
                    <h3>Detalles de tu Reserva</h3>
                    
                    <div class="booking-info">
                        <div class="info-row">
                            <span class="label">Clase:</span>
                            <span class="value">${cls ? cls.title : 'Clase'}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Tipo:</span>
                            <span class="value">${cls ? cls.type : ''}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Instructor:</span>
                            <span class="value">${cls ? cls.coach : ''}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Fecha:</span>
                            <span class="value">${booking.date}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Hora:</span>
                            <span class="value">${booking.time}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Estado:</span>
                            <span class="value status-${booking.status}">${booking.status === 'confirmed' ? 'Confirmada' : 'Cancelada'}</span>
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <button class="btn btn-secondary" id="closeDetails">Cerrar</button>
                        ${booking.status === 'confirmed' ? `
                            <button class="btn btn-danger" id="cancelBooking">Cancelar Reserva</button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
        const modal = document.createElement('div');
        modal.innerHTML = modalHtml;
        document.body.appendChild(modal);
        
        // Event listeners para el modal
        modal.querySelector('#closeDetails').addEventListener('click', () => {
            modal.remove();
        });
        
        const cancelBtn = modal.querySelector('#cancelBooking');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.cancelBooking(booking.id, cls);
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
    
    async cancelBooking(bookingId, cls) {
        if (!confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
            return;
        }
        
        if (window.barraboxDataManager) {
            const cancelled = window.barraboxDataManager.cancelBooking(bookingId);
            
            if (cancelled) {
                // Liberar cupo
                window.barraboxDataManager.updateClass(cls.id, {
                    booked: Math.max(0, cls.booked - 1)
                });
                
                // Crear notificación
                window.barraboxDataManager.createNotification(
                    this.userId,
                    'booking_cancelled',
                    'Reserva Cancelada',
                    `Tu reserva para ${cls.title} ha sido cancelada.`,
                    'warning'
                );
                
                this.showMessage('info', 'Reserva cancelada exitosamente');
                this.refreshData();
            }
        } else {
            // Demo fallback
            const booking = this.bookings.find(b => b.id === bookingId);
            if (booking) {
                booking.status = 'cancelled';
                cls.booked = Math.max(0, cls.booked - 1);
                this.showMessage('info', 'Reserva demo cancelada');
                this.updateSlotStates();
            }
        }
        
        this.dispatchEvent('bookingCancelled', { bookingId, class: cls });
    }
    
    // ==================== DATA MANAGEMENT ====================
    
    refreshData() {
        if (window.barraboxDataManager) {
            this.classes = window.barraboxDataManager.getAllClasses();
            this.bookings = window.barraboxDataManager.getAllBookings();
            
            if (window.barraboxAuth && window.barraboxAuth.isLoggedIn()) {
                this.userId = window.barraboxAuth.getCurrentUser().id;
            }
        }
        
        this.updateSlotStates();
    }
    
    // ==================== UTILITIES ====================
    
    showMessage(type, message) {
        // Usar sistema de notificaciones existente si está disponible
        if (window.barraboxAuth && window.barraboxAuth.showMessage) {
            window.barraboxAuth.showMessage(type, message);
        } else {
            // Fallback simple
            alert(message);
        }
    }
    
    dispatchEvent(eventName, detail) {
        const event = new CustomEvent(`calendar:${eventName}`, { detail });
        this.container.dispatchEvent(event);
    }
    
    // ==================== PUBLIC API ====================
    
    updateData(classes, bookings, userId) {
        this.classes = classes || this.classes;
        this.bookings = bookings || this.bookings;
        this.userId = userId || this.userId;
        this.refreshData();
    }
    
    goToDate(date) {
        this.currentDate = new Date(date);
        this.render();
    }
    
    goToToday() {
        this.currentDate = new Date();
        this.render();
    }
}

// Export global
window.BarraboxCalendar