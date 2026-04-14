// Calendar Responsive System - Mejoras para móviles

class ResponsiveCalendar {
    constructor(calendarInstance) {
        this.calendar = calendarInstance;
        this.isMobile = false;
        this.currentDayIndex = 0;
        this.daysToShowMobile = 2;
        
        this.init();
    }
    
    init() {
        console.log('📱 Responsive Calendar inicializando...');
        
        // Detectar si es móvil
        this.checkViewport();
        
        // Configurar event listeners
        this.setupEventListeners();
        
        // Aplicar cambios iniciales
        this.applyResponsiveChanges();
        
        console.log(`✅ Responsive Calendar listo (${this.isMobile ? 'Móvil' : 'Desktop'})`);
    }
    
    checkViewport() {
        const width = window.innerWidth;
        this.isMobile = width <= 768;
        
        console.log(`📱 Viewport: ${width}px (${this.isMobile ? 'Móvil' : 'Desktop'})`);
    }
    
    setupEventListeners() {
        // Redimensionamiento de ventana
        window.addEventListener('resize', () => {
            const wasMobile = this.isMobile;
            this.checkViewport();
            
            if (wasMobile !== this.isMobile) {
                console.log(`🔄 Cambio de viewport: ${wasMobile ? 'Móvil' : 'Desktop'} → ${this.isMobile ? 'Móvil' : 'Desktop'}`);
                this.applyResponsiveChanges();
            }
        });
        
        // Navegación por días en móviles
        document.addEventListener('click', (e) => {
            if (!this.isMobile) return;
            
            if (e.target.closest('.mobile-prev-day')) {
                e.preventDefault();
                this.navigateDays(-1);
            } else if (e.target.closest('.mobile-next-day')) {
                e.preventDefault();
                this.navigateDays(1);
            } else if (e.target.closest('.mobile-day-selector')) {
                e.preventDefault();
                this.showDaySelector();
            }
        });
        
        // Touch events para swipe
        this.setupSwipeEvents();
    }
    
    setupSwipeEvents() {
        if (!this.isMobile) return;
        
        const calendarGrid = document.querySelector('.calendar-grid');
        if (!calendarGrid) return;
        
        let touchStartX = 0;
        let touchEndX = 0;
        
        calendarGrid.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        calendarGrid.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
        }, { passive: true });
    }
    
    handleSwipe(startX, endX) {
        const threshold = 50; // Mínimo desplazamiento para considerar swipe
        
        if (startX - endX > threshold) {
            // Swipe izquierda = siguiente día
            this.navigateDays(1);
        } else if (endX - startX > threshold) {
            // Swipe derecha = día anterior
            this.navigateDays(-1);
        }
    }
    
    navigateDays(direction) {
        if (!this.isMobile) return;
        
        const totalDays = 6; // Lunes a Sábado
        this.currentDayIndex += direction;
        
        // Circular navigation
        if (this.currentDayIndex < 0) {
            this.currentDayIndex = totalDays - this.daysToShowMobile;
        } else if (this.currentDayIndex > totalDays - this.daysToShowMobile) {
            this.currentDayIndex = 0;
        }
        
        console.log(`📅 Navegando a día ${this.currentDayIndex + 1}`);
        this.updateVisibleDays();
    }
    
    updateVisibleDays() {
        if (!this.isMobile) return;
        
        const dayHeaders = document.querySelectorAll('.day-header');
        const dayColumns = document.querySelectorAll('.day-column');
        
        // Ocultar todos los días
        dayHeaders.forEach((header, index) => {
            if (index >= this.currentDayIndex && index < this.currentDayIndex + this.daysToShowMobile) {
                header.style.display = '';
                if (dayColumns[index]) dayColumns[index].style.display = '';
            } else {
                header.style.display = 'none';
                if (dayColumns[index]) dayColumns[index].style.display = 'none';
            }
        });
        
        // Actualizar indicador de días
        this.updateDayIndicator();
    }
    
    updateDayIndicator() {
        const indicator = document.querySelector('.mobile-day-indicator');
        if (!indicator) return;
        
        const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const currentDay = dayNames[this.currentDayIndex] || 'Lun';
        const nextDay = dayNames[this.currentDayIndex + 1] || 'Mar';
        
        indicator.innerHTML = `
            <span class="current-day">${currentDay}</span>
            <span class="day-separator">•</span>
            <span class="next-day">${nextDay}</span>
            <span class="day-counter">(${this.currentDayIndex + 1}-${this.currentDayIndex + 2}/6)</span>
        `;
    }
    
    showDaySelector() {
        // Crear modal selector de días
        const modal = document.createElement('div');
        modal.className = 'mobile-day-selector-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 1rem;
        `;
        
        const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        
        modal.innerHTML = `
            <div style="background: white; border-radius: 12px; padding: 1.5rem; max-width: 300px; width: 100%;">
                <h3 style="margin: 0 0 1rem 0; color: #2D3047; text-align: center;">Seleccionar día</h3>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem;">
                    ${dayNames.map((day, index) => `
                        <button class="day-option" data-index="${index}" 
                                style="padding: 0.8rem; border: 1px solid #e9ecef; border-radius: 8px; 
                                       background: ${index >= this.currentDayIndex && index < this.currentDayIndex + this.daysToShowMobile ? '#FF6B35' : 'white'}; 
                                       color: ${index >= this.currentDayIndex && index < this.currentDayIndex + this.daysToShowMobile ? 'white' : '#2D3047'};">
                            ${day}
                        </button>
                    `).join('')}
                </div>
                <button class="close-selector" style="margin-top: 1rem; width: 100%; padding: 0.8rem; 
                        background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; color: #6c757d;">
                    Cerrar
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners para el modal
        modal.querySelectorAll('.day-option').forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentDayIndex = parseInt(btn.dataset.index);
                this.updateVisibleDays();
                document.body.removeChild(modal);
            });
        });
        
        modal.querySelector('.close-selector').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Cerrar al hacer click fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
    
    applyResponsiveChanges() {
        if (!this.calendar.container) return;
        
        if (this.isMobile) {
            this.applyMobileStyles();
            this.addMobileControls();
            this.updateVisibleDays();
        } else {
            this.removeMobileStyles();
            this.removeMobileControls();
            this.showAllDays();
        }
    }
    
    applyMobileStyles() {
        const container = this.calendar.container;
        
        // Agregar clase para estilos móviles
        container.classList.add('calendar-mobile');
        
        // Asegurar que el contenedor tenga scroll horizontal
        const calendarGrid = container.querySelector('.calendar-grid');
        if (calendarGrid) {
            calendarGrid.style.minWidth = '320px';
            calendarGrid.style.width = 'max-content';
        }
        
        // Mejorar touch targets
        const buttons = container.querySelectorAll('.btn-book, .calendar-nav');
        buttons.forEach(btn => {
            btn.style.minHeight = '44px';
            btn.style.minWidth = '44px';
            btn.style.padding = '12px 16px';
        });
        
        // Ajustar fuentes para mejor legibilidad
        const textElements = container.querySelectorAll('.class-title, .class-coach, .class-slots');
        textElements.forEach(el => {
            el.style.fontSize = '0.9rem';
            el.style.lineHeight = '1.3';
        });
    }
    
    removeMobileStyles() {
        const container = this.calendar.container;
        container.classList.remove('calendar-mobile');
        
        // Restaurar estilos
        const calendarGrid = container.querySelector('.calendar-grid');
        if (calendarGrid) {
            calendarGrid.style.minWidth = '';
            calendarGrid.style.width = '';
        }
        
        const buttons = container.querySelectorAll('.btn-book, .calendar-nav');
        buttons.forEach(btn => {
            btn.style.minHeight = '';
            btn.style.minWidth = '';
            btn.style.padding = '';
        });
    }
    
    addMobileControls() {
        const header = this.calendar.container.querySelector('.calendar-header');
        if (!header) return;
        
        // Verificar si ya existen controles móviles
        if (header.querySelector('.mobile-controls')) return;
        
        // Agregar controles de navegación por días
        const mobileControls = document.createElement('div');
        mobileControls.className = 'mobile-controls';
        mobileControls.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            margin-top: 1rem;
            gap: 0.5rem;
        `;
        
        mobileControls.innerHTML = `
            <button class="mobile-prev-day" style="padding: 0.6rem; background: rgba(255,255,255,0.1); 
                    border: none; border-radius: 8px; color: white; min-width: 44px;">
                <i class="fas fa-chevron-left"></i>
            </button>
            
            <button class="mobile-day-selector" style="flex: 1; padding: 0.8rem; background: rgba(255,255,255,0.1); 
                    border: none; border-radius: 8px; color: white; font-weight: 600;">
                <div class="mobile-day-indicator">
                    Lun • Mar (1-2/6)
                </div>
            </button>
            
            <button class="mobile-next-day" style="padding: 0.6rem; background: rgba(255,255,255,0.1); 
                    border: none; border-radius: 8px; color: white; min-width: 44px;">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        header.appendChild(mobileControls);
        
        // Agregar hint de scroll
        const scrollHint = document.createElement('div');
        scrollHint.className = 'scroll-hint';
        scrollHint.innerHTML = `
            <span>Desliza para ver más horas</span>
            <i class="fas fa-arrow-right"></i>
        `;
        
        this.calendar.container.appendChild(scrollHint);
    }
    
    removeMobileControls() {
        const mobileControls = this.calendar.container.querySelector('.mobile-controls');
        if (mobileControls) {
            mobileControls.remove();
        }
        
        const scrollHint = this.calendar.container.querySelector('.scroll-hint');
        if (scrollHint) {
            scrollHint.remove();
        }
    }
    
    showAllDays() {
        const dayHeaders = document.querySelectorAll('.day-header');
        const dayColumns = document.querySelectorAll('.day-column');
        
        dayHeaders.forEach(header => header.style.display = '');
        dayColumns.forEach(column => column.style.display = '');
    }
    
    // Método para actualizar cuando el calendario se rerenderiza
    onCalendarRender() {
        if (this.isMobile) {
            setTimeout(() => {
                this.applyMobileStyles();
                this.addMobileControls();
                this.updateVisibleDays();
            }, 100);
        }
    }
}

// Integración con el calendario existente
if (typeof window !== 'undefined' && window.BarraboxCalendar) {
    // Extender la clase BarraboxCalendar
    const originalRender = BarraboxCalendar.prototype.render;
    
    BarraboxCalendar.prototype.render = function() {
        // Llamar al render original
        const result = originalRender.apply(this, arguments);
        
        // Inicializar responsive calendar si no existe
        if (!this.responsiveCalendar) {
            this.responsiveCalendar = new ResponsiveCalendar(this);
        } else {
            this.responsiveCalendar.onCalendarRender();
        }
        
        return result;
    };
    
    console.log('📱 Responsive Calendar integrado con BarraboxCalendar');
}

// CSS adicional para móviles
const mobileStyles = `
/* Estilos específicos para móviles */
.calendar-mobile .calendar-grid {
    grid-template-columns: 60px repeat(2, 1fr) !important;
}

.calendar-mobile .day-header,
.calendar-mobile .day-column {
    min-width: 140px;
}

.calendar-mobile .slot-content {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.calendar-mobile .class-title {
    font-size: 0.9rem !important;
    line-height: 1.3 !important;
    margin-bottom: 0.3rem !important;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.calendar-mobile .class-coach,
.calendar-mobile .class-slots {
    font-size: 0.8rem !important;
    margin-bottom: 0.4rem !important;
}

.calendar-mobile .btn-book {
    margin-top: auto !important;
    padding: 0.6rem !important;
    font-size: 0.85rem !important;
    min-height: 40px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
}

.calendar-mobile .time-slot,
.calendar-mobile .calendar-slot {
    height: 95px !important;
    padding: 0.5rem !important;
}

/* Mejoras de touch */
.calendar-mobile .btn-book:active {
    transform: scale(0.95);
    transition: transform 0.1s;
}

.calendar-mobile .calendar-slot {
    user-select: none;
    -webkit-tap-highlight-color: transparent;
}

/* Scroll horizontal suave */
.calendar-mobile .calendar-container {
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
}

/* Indicador de días activos */
.mobile-day-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
}

.current-day, .next-day {
    font-weight: 700;
}

.day-separator {
    opacity: 0.5;
}

.day-counter {
    font-size: 0.8rem;
    opacity: 0.7;
    margin-left: 0.5rem;
}

/* Animación para swipe */
@keyframes swipeHint {
    0%, 100% { transform: translateX(0); opacity: 0.7; }
    50% { transform: translateX(10px); opacity: 1; }
}

.mobile-controls button:active {
    transform: scale(0.95);
    transition: transform 0.1s;
}

/* Modal de selección de día */
.mobile-day-selector-modal .day-option {
    transition: all 0.2s ease;
}

.mobile-day-selector-modal .day-option:active {
    transform: scale(0.95);
}
`;

// Inyectar estilos
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = mobileStyles;
    document.head.appendChild(style);
    console.log('🎨 Estilos responsive para calendario inyectados');
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.ResponsiveCalendar = ResponsiveCalendar;
    console.log('📱 ResponsiveCalendar disponible globalmente');
}