// Booking Flow JavaScript - Mejor flujo de reservas

document.addEventListener('DOMContentLoaded', function() {
    // Datos de ejemplo de clases
    const classesData = [
        {
            id: 1,
            type: 'crossfit',
            title: 'WOD - Fuerza y Condición',
            time: '10:00 AM',
            duration: '60 minutos',
            coach: 'Carlos',
            location: 'Sala Principal',
            spots: { available: 5, total: 15 },
            level: 'Intermedio',
            description: 'Entrenamiento de alta intensidad combinando fuerza y condición física.',
            booked: false
        },
        {
            id: 2,
            type: 'halterofilia',
            title: 'Técnica de Envión',
            time: '17:00 PM',
            duration: '90 minutos',
            coach: 'Ana',
            location: 'Sala de Pesas',
            spots: { available: 0, total: 10 },
            level: 'Avanzado',
            description: 'Perfeccionamiento de la técnica de envión con pesos olímpicos.',
            booked: false
        },
        {
            id: 3,
            type: 'gap',
            title: 'Glúteos, Abdomen, Piernas',
            time: '19:00 PM',
            duration: '45 minutos',
            coach: 'Sofia',
            location: 'Sala de Grupo',
            spots: { available: 3, total: 12 },
            level: 'Todos los niveles',
            description: 'Entrenamiento focalizado en glúteos, abdomen y piernas.',
            booked: true
        },
        {
            id: 4,
            type: 'crossfit',
            title: 'Morning CrossFit',
            time: '06:00 AM',
            duration: '60 minutos',
            coach: 'Marco',
            location: 'Sala Principal',
            spots: { available: 8, total: 15 },
            level: 'Principiante',
            description: 'Clase matutina para empezar el día con energía.',
            booked: false
        },
        {
            id: 5,
            type: 'halterofilia',
            title: 'Arranque Técnico',
            time: '14:00 PM',
            duration: '75 minutos',
            coach: 'Carlos',
            location: 'Sala de Pesas',
            spots: { available: 2, total: 8 },
            level: 'Intermedio',
            description: 'Técnica de arranque con enfoque en movilidad y potencia.',
            booked: false
        },
        {
            id: 6,
            type: 'gap',
            title: 'Core & Stability',
            time: '20:00 PM',
            duration: '50 minutos',
            coach: 'Sofia',
            location: 'Sala de Grupo',
            spots: { available: 6, total: 12 },
            level: 'Todos los niveles',
            description: 'Fortalece tu core y mejora la estabilidad.',
            booked: false
        }
    ];

    // Elementos del DOM
    const classesGrid = document.getElementById('classesGrid');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const quickBookBtn = document.getElementById('quickBookBtn');
    const bookingModal = document.getElementById('bookingModal');
    const closeBookingModal = document.querySelector('.close-booking-modal');
    const bookingSteps = document.querySelectorAll('.booking-step');
    const bookingFormSteps = document.querySelectorAll('.booking-form-step');
    const bookingFormActions = document.querySelector('.booking-form-actions');
    
    // Variables de estado
    let currentFilter = 'all';
    let visibleClasses = 3;
    let currentBookingStep = 1;
    let selectedClass = null;

    // Inicializar
    initBookingFlow();

    function initBookingFlow() {
        // Cargar clases iniciales
        renderClasses();
        
        // Configurar filtros
        setupFilters();
        
        // Configurar botón "Cargar más"
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', loadMoreClasses);
        }
        
        // Configurar botón de reserva rápida
        if (quickBookBtn) {
            quickBookBtn.addEventListener('click', openQuickBooking);
        }
        
        // Configurar modal de reserva
        if (bookingModal && closeBookingModal) {
            closeBookingModal.addEventListener('click', closeBookingModalFunc);
            bookingModal.addEventListener('click', function(e) {
                if (e.target === bookingModal) {
                    closeBookingModalFunc();
                }
            });
        }
        
        // Configurar navegación de pasos
        setupBookingSteps();
    }

    function renderClasses() {
        if (!classesGrid) return;
        
        classesGrid.innerHTML = '';
        
        const filteredClasses = filterClasses();
        const classesToShow = filteredClasses.slice(0, visibleClasses);
        
        if (classesToShow.length === 0) {
            classesGrid.innerHTML = `
                <div class="no-classes">
                    <i class="fas fa-calendar-times"></i>
                    <h3>No hay clases disponibles</h3>
                    <p>Intenta con otro filtro o horario</p>
                </div>
            `;
            return;
        }
        
        classesToShow.forEach(cls => {
            const classCard = createClassCard(cls);
            classesGrid.appendChild(classCard);
        });
        
        // Actualizar visibilidad del botón "Cargar más"
        if (loadMoreBtn) {
            loadMoreBtn.style.display = filteredClasses.length > visibleClasses ? 'flex' : 'none';
        }
    }

    function filterClasses() {
        let filtered = [...classesData];
        
        // Aplicar filtro por tipo
        if (currentFilter !== 'all') {
            if (currentFilter === 'available') {
                filtered = filtered.filter(cls => cls.spots.available > 0 && !cls.booked);
            } else {
                filtered = filtered.filter(cls => cls.type === currentFilter);
            }
        }
        
        // Ordenar: disponibles primero, luego por horario
        filtered.sort((a, b) => {
            if (a.spots.available > 0 && b.spots.available === 0) return -1;
            if (a.spots.available === 0 && b.spots.available > 0) return 1;
            return a.time.localeCompare(b.time);
        });
        
        return filtered;
    }

    function createClassCard(cls) {
        const card = document.createElement('div');
        card.className = `class-card ${cls.spots.available > 0 ? 'available' : 'full'} ${cls.booked ? 'booked' : ''}`;
        card.dataset.id = cls.id;
        
        const isAvailable = cls.spots.available > 0;
        const isBooked = cls.booked;
        
        card.innerHTML = `
            <div class="class-header">
                <span class="class-type ${cls.type}">${getTypeLabel(cls.type)}</span>
                <span class="class-time">${cls.time}</span>
            </div>
            <h3>${cls.title}</h3>
            <div class="class-details">
                <div class="class-detail">
                    <i class="fas fa-user-tie"></i>
                    <span>Coach: ${cls.coach}</span>
                </div>
                <div class="class-detail">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${cls.location}</span>
                </div>
                <div class="class-detail">
                    <i class="fas fa-clock"></i>
                    <span>${cls.duration}</span>
                </div>
                <div class="class-detail">
                    <i class="fas fa-signal"></i>
                    <span>Nivel: ${cls.level}</span>
                </div>
            </div>
            <div class="class-spots">
                <div class="spots-info">
                    ${isAvailable ? 
                        `<span class="available">${cls.spots.available}</span> cupos disponibles de ${cls.spots.total}` :
                        `<span class="full">LLENO</span> 0 cupos disponibles de ${cls.spots.total}`
                    }
                </div>
            </div>
            ${isBooked ? 
                `<div class="booking-status booked">
                    <i class="fas fa-check-circle"></i>
                    <span>Ya reservaste esta clase</span>
                </div>` :
                `<div class="class-actions">
                    <button class="btn btn-outline btn-small view-details" data-id="${cls.id}">
                        <i class="fas fa-info-circle"></i> Detalles
                    </button>
                    <button class="btn btn-primary btn-small book-class" data-id="${cls.id}" ${!isAvailable ? 'disabled' : ''}>
                        <i class="fas fa-calendar-check"></i> ${isAvailable ? 'Reservar' : 'Lleno'}
                    </button>
                </div>`
            }
        `;
        
        // Agregar event listeners a los botones
        const viewDetailsBtn = card.querySelector('.view-details');
        const bookBtn = card.querySelector('.book-class');
        
        if (viewDetailsBtn) {
            viewDetailsBtn.addEventListener('click', () => showClassDetails(cls));
        }
        
        if (bookBtn && isAvailable) {
            bookBtn.addEventListener('click', () => startBookingProcess(cls));
        }
        
        return card;
    }

    function getTypeLabel(type) {
        const labels = {
            crossfit: 'CrossFit',
            halterofilia: 'Halterofilia',
            gap: 'GAP'
        };
        return labels[type] || type;
    }

    function setupFilters() {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remover clase active de todos los botones
                filterButtons.forEach(b => b.classList.remove('active'));
                
                // Agregar clase active al botón clickeado
                this.classList.add('active');
                
                // Actualizar filtro actual
                currentFilter = this.dataset.filter || 'all';
                
                // Reiniciar contador de clases visibles
                visibleClasses = 3;
                
                // Re-renderizar clases
                renderClasses();
            });
        });
    }

    function loadMoreClasses() {
        visibleClasses += 3;
        renderClasses();
        
        // Scroll suave a las nuevas clases
        const newCards = classesGrid.querySelectorAll('.class-card:nth-child(n+' + (visibleClasses - 2) + ')');
        if (newCards.length > 0) {
            newCards[0].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    function openQuickBooking() {
        // Mostrar modal de búsqueda rápida
        alert('Funcionalidad de búsqueda rápida en desarrollo. Por ahora, usa los filtros para encontrar clases.');
    }

    function showClassDetails(cls) {
        const modalContent = `
            <div class="class-details-modal">
                <h3>${cls.title}</h3>
                <div class="details-grid">
                    <div class="detail-item">
                        <i class="fas fa-clock"></i>
                        <div>
                            <strong>Horario:</strong>
                            <p>${cls.time} • ${cls.duration}</p>
                        </div>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-user-tie"></i>
                        <div>
                            <strong>Coach:</strong>
                            <p>${cls.coach}</p>
                        </div>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <div>
                            <strong>Ubicación:</strong>
                            <p>${cls.location}</p>
                        </div>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-signal"></i>
                        <div>
                            <strong>Nivel:</strong>
                            <p>${cls.level}</p>
                        </div>
                    </div>
                </div>
                <div class="description">
                    <h4>Descripción:</h4>
                    <p>${cls.description}</p>
                </div>
                <div class="spots-info">
                    <h4>Disponibilidad:</h4>
                    <p>${cls.spots.available} de ${cls.spots.total} cupos disponibles</p>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-outline close-details">Cerrar</button>
                    ${cls.spots.available > 0 && !cls.booked ? 
                        `<button class="btn btn-primary book-from-details" data-id="${cls.id}">Reservar Ahora</button>` : 
                        ''
                    }
                </div>
            </div>
        `;
        
        // Crear y mostrar modal
        showCustomModal('Detalles de la Clase', modalContent);
        
        // Configurar botones del modal
        setTimeout(() => {
            const closeBtn = document.querySelector('.close-details');
            const bookBtn = document.querySelector('.book-from-details');
            
            if (closeBtn) {
                closeBtn.addEventListener('click', closeCustomModal);
            }
            
            if (bookBtn) {
                bookBtn.addEventListener('click', () => {
                    closeCustomModal();
                    startBookingProcess(cls);
                });
            }
        }, 100);
    }

    function startBookingProcess(cls) {
        selectedClass = cls;
        currentBookingStep = 1;
        
        // Mostrar modal de reserva
        if (bookingModal) {
            // Actualizar resumen de la clase
            updateBookingSummary(cls);
            
            // Resetear pasos
            resetBookingSteps();
            
            // Mostrar primer paso
            showBookingStep(1);
            
            // Mostrar modal
            bookingModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function updateBookingSummary(cls) {
        const summaryElement = document.querySelector('.booking-summary');
        if (!summaryElement) return;
        
        summaryElement.innerHTML = `
            <h3>Resumen de la Clase</h3>
            <div class="booking-details">
                <div class="booking-detail">
                    <i class="fas fa-dumbbell"></i>
                    <span>Clase:</span>
                    <span class="detail-value">${cls.title}</span>
                </div>
                <div class="booking-detail">
                    <i class="fas fa-clock"></i>
                    <span>Horario:</span>
                    <span class="detail-value">${cls.time} • ${cls.duration}</span>
                </div>
                <div class="booking-detail">
                    <i class="fas fa-user-tie"></i>
                    <span>Coach:</span>
                    <span class="detail-value">${cls.coach}</span>
                </div>
                <div class="booking-detail">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>Ubicación:</span>
                    <span class="detail-value">${cls.location}</span>
                </div>
            </div>
        `;
    }

    function resetBookingSteps() {
        bookingSteps.forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index === 0) {
                step.classList.add('active');
            }
        });
        
        bookingFormSteps.forEach((step, index) => {
            step.classList.remove('active');
            if (index === 0) {
                step.classList.add('active');
            }
        });
    }

    function showBookingStep(stepNumber) {
        // Actualizar indicadores de pasos
        bookingSteps.forEach((step, index) => {
            step.classList.remove('active');
            if (index < stepNumber - 1) {
                step.classList.add('completed');
            } else if (index === stepNumber - 1) {
                step.classList.add('active');
            }
        });
        
        // Mostrar formulario del paso actual
        bookingFormSteps.forEach((step, index) => {
            step.classList.remove('active');
            if (index === stepNumber - 1) {
                step.classList.add('active');
            }
        });
        
        // Actualizar botones de navegación
        updateBookingNavigation(stepNumber);
    }

    function updateBookingNavigation(stepNumber) {
        if (!bookingFormActions) return;
        
        const isLastStep = stepNumber === 3;
        
        bookingFormActions.innerHTML = `
            ${stepNumber > 1 ? 
                `<button class="btn btn-outline" id="prevStepBtn">
                    <i class="fas fa-arrow-left"></i> Anterior
                </button>` : 
                `<div></div>`
            }
            <button class="btn ${isLastStep ? 'btn-success' : 'btn-primary'}" id="nextStepBtn">
                ${isLastStep ? 
                    '<i class="fas fa-check"></i> Confirmar Reserva' : 
                    'Siguiente <i class="fas fa-arrow-right"></i>'
                }
            </button>
        `;
        
        // Configurar event listeners
        const prevBtn = document.getElementById('prevStepBtn');
        const nextBtn = document.getElementById('nextStepBtn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (stepNumber > 1) {
                    showBookingStep(stepNumber - 1);
                }
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (stepNumber < 3) {
                    showBookingStep(stepNumber + 1);
                } else {
                    completeBooking();
                }
            });
        }
    }

    function completeBooking() {
        // Simular reserva exitosa
        const confirmationElement = document.querySelector('.booking-confirmation');
        if (confirmationElement) {
            confirmationElement.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <h3>¡Reserva Confirmada!</h3>
                <p>Tu reserva para "${selectedClass.title}" ha sido confirmada.</p>
                <p>Recibirás un email de confirmación en los próximos minutos.</p>
