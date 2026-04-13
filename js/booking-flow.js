// Booking Flow JavaScript - Funciones completas

// Funciones auxiliares para modales
function showCustomModal(title, content) {
    const modalContainer = document.getElementById('customModalContainer');
    if (!modalContainer) return;
    
    const modalHTML = `
        <div class="custom-modal-overlay">
            <div class="custom-modal">
                <div class="custom-modal-header">
                    <h3>${title}</h3>
                    <button class="close-custom-modal">&times;</button>
                </div>
                <div class="custom-modal-body">
                    ${content}
                </div>
            </div>
        </div>
    `;
    
    modalContainer.innerHTML = modalHTML;
    
    // Agregar estilos si no existen
    if (!document.querySelector('#customModalStyles')) {
        const styles = document.createElement('style');
        styles.id = 'customModalStyles';
        styles.textContent = `
            .custom-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 2000;
                padding: 1rem;
            }
            .custom-modal {
                background: white;
                border-radius: 16px;
                width: 100%;
                max-width: 500px;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                animation: slideUp 0.3s ease;
            }
            .custom-modal-header {
                padding: 1.5rem;
                border-bottom: 1px solid #e9ecef;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .custom-modal-header h3 {
                color: #2D3047;
                font-size: 1.5rem;
                font-weight: 700;
                margin: 0;
            }
            .close-custom-modal {
                background: none;
                border: none;
                font-size: 1.5rem;
                color: #6c757d;
                cursor: pointer;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
            }
            .close-custom-modal:hover {
                background: #f8f9fa;
                color: #dc3545;
            }
            .custom-modal-body {
                padding: 1.5rem;
            }
            @keyframes slideUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .details-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
                margin: 1.5rem 0;
            }
            .detail-item {
                display: flex;
                align-items: flex-start;
                gap: 1rem;
            }
            .detail-item i {
                color: #FF6B35;
                font-size: 1.2rem;
                margin-top: 0.2rem;
            }
            .detail-item strong {
                display: block;
                color: #2D3047;
                margin-bottom: 0.2rem;
            }
            .detail-item p {
                color: #6c757d;
                margin: 0;
            }
            .description {
                margin: 1.5rem 0;
                padding: 1.5rem;
                background: #f8f9fa;
                border-radius: 12px;
            }
            .description h4 {
                color: #2D3047;
                margin-bottom: 0.8rem;
            }
            .description p {
                color: #6c757d;
                line-height: 1.6;
            }
            .modal-actions {
                display: flex;
                gap: 1rem;
                justify-content: flex-end;
                margin-top: 1.5rem;
                padding-top: 1.5rem;
                border-top: 1px solid #e9ecef;
            }
        `;
        document.head.appendChild(styles);
    }
    
    // Configurar botón de cerrar
    setTimeout(() => {
        const closeBtn = document.querySelector('.close-custom-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeCustomModal);
        }
    }, 100);
}

function closeCustomModal() {
    const modalContainer = document.getElementById('customModalContainer');
    if (modalContainer) {
        modalContainer.innerHTML = '';
    }
}

function closeBookingModalFunc() {
    const bookingModal = document.getElementById('bookingModal');
    if (bookingModal) {
        bookingModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Función para completar la reserva
function completeBooking() {
    // Simular reserva exitosa
    const confirmationElement = document.querySelector('.booking-confirmation');
    if (confirmationElement) {
        confirmationElement.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <h3>¡Reserva Confirmada!</h3>
            <p>Tu reserva para "${selectedClass.title}" ha sido confirmada.</p>
            <p>Recibirás un email de confirmación en los próximos minutos.</p>
            <div class="confirmation-details">
                <p><strong>Hora:</strong> ${selectedClass.time}</p>
                <p><strong>Coach:</strong> ${selectedClass.coach}</p>
                <p><strong>Sala:</strong> ${selectedClass.location}</p>
            </div>
            <div class="confirmation-actions">
                <button class="btn btn-primary" id="closeBookingModalBtn">Cerrar</button>
                <button class="btn btn-outline" id="addToCalendarBtn">
                    <i class="fas fa-calendar-plus"></i> Agregar a Calendario
                </button>
            </div>
        `;
        
        // Actualizar botones de navegación
        const bookingFormActions = document.querySelector('.booking-form-actions');
        if (bookingFormActions) {
            bookingFormActions.innerHTML = '';
        }
        
        // Configurar botones de confirmación
        setTimeout(() => {
            const closeBtn = document.getElementById('closeBookingModalBtn');
            const calendarBtn = document.getElementById('addToCalendarBtn');
            
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    closeBookingModalFunc();
                    // Actualizar la interfaz para reflejar la reserva
                    updateClassAsBooked(selectedClass.id);
                });
            }
            
            if (calendarBtn) {
                calendarBtn.addEventListener('click', () => {
                    alert('Funcionalidad de calendario en desarrollo. Tu reserva ya está confirmada.');
                });
            }
        }, 100);
    }
}

function updateClassAsBooked(classId) {
    // Actualizar datos locales
    const classIndex = classesData.findIndex(cls => cls.id === classId);
    if (classIndex !== -1) {
        classesData[classIndex].booked = true;
        classesData[classIndex].spots.available -= 1;
    }
    
    // Re-renderizar clases
    renderClasses();
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si estamos en el dashboard de usuario
    const classesGrid = document.getElementById('classesGrid');
    if (!classesGrid) return;
    
    // Inicializar el flujo de reservas
    initBookingFlow();
});

// Exportar funciones para uso global
window.BookingFlow = {
    init: initBookingFlow,
    showClassDetails: showClassDetails,
    startBookingProcess: startBookingProcess,
    closeBookingModal: closeBookingModalFunc
};