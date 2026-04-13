// Dashboard Clean JavaScript - Simple y funcional

document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const bookClassBtn = document.getElementById('bookClassBtn');
    const bookingModal = document.getElementById('bookingModal');
    const closeModalBtn = document.querySelector('.close-modal');
    const closeModalBtn2 = document.querySelector('.close-modal-btn');
    const confirmBookingBtn = document.querySelector('.confirm-booking');
    const prevWeekBtn = document.getElementById('prevWeek');
    const nextWeekBtn = document.getElementById('nextWeek');
    const currentWeekElement = document.getElementById('currentWeek');
    const bookButtons = document.querySelectorAll('.btn-book');
    
    // Variables de estado
    let currentWeek = 0; // 0 = semana actual
    
    // Fechas de ejemplo para las semanas
    const weekDates = [
        { start: '14', end: '20', month: 'Abril', year: '2026' },
        { start: '21', end: '27', month: 'Abril', year: '2026' },
        { start: '28', month: 'Abril', end: '4', monthEnd: 'Mayo', year: '2026' }
    ];
    
    // Inicializar
    initDashboard();
    
    function initDashboard() {
        // Configurar botón de reservar clase
        if (bookClassBtn) {
            bookClassBtn.addEventListener('click', function() {
                // Scroll a la primera clase disponible
                const firstAvailable = document.querySelector('.class-slot.available');
                if (firstAvailable) {
                    firstAvailable.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                    
                    // Destacar la clase
                    firstAvailable.style.animation = 'pulse 2s infinite';
                    setTimeout(() => {
                        firstAvailable.style.animation = '';
                    }, 2000);
                }
            });
        }
        
        // Configurar modal de reserva
        if (bookingModal && closeModalBtn) {
            closeModalBtn.addEventListener('click', closeBookingModal);
            if (closeModalBtn2) {
                closeModalBtn2.addEventListener('click', closeBookingModal);
            }
            
            bookingModal.addEventListener('click', function(e) {
                if (e.target === bookingModal) {
                    closeBookingModal();
                }
            });
        }
        
        // Configurar botón de confirmar reserva
        if (confirmBookingBtn) {
            confirmBookingBtn.addEventListener('click', confirmBooking);
        }
        
        // Configurar navegación de semanas
        if (prevWeekBtn && nextWeekBtn) {
            prevWeekBtn.addEventListener('click', goToPrevWeek);
            nextWeekBtn.addEventListener('click', goToNextWeek);
        }
        
        // Configurar botones de reserva en las clases
        bookButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const classSlot = this.closest('.class-slot');
                openBookingModal(classSlot);
            });
        });
        
        // Configurar botones de cancelar reserva
        const cancelButtons = document.querySelectorAll('.btn-danger');
        cancelButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const reservationCard = this.closest('.reservation-card');
                if (reservationCard && confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
                    cancelReservation(reservationCard);
                }
            });
        });
        
        // Configurar botones de detalles
        const detailButtons = document.querySelectorAll('.btn-outline');
        detailButtons.forEach(btn => {
            if (btn.textContent.includes('Detalles')) {
                btn.addEventListener('click', function() {
                    const card = this.closest('.reservation-card') || this.closest('.class-slot');
                    showClassDetails(card);
                });
            }
        });
        
        // Actualizar semana actual
        updateWeekDisplay();
    }
    
    function openBookingModal(classSlot) {
        if (!classSlot || !bookingModal) return;
        
        // Obtener información de la clase
        const classTime = classSlot.querySelector('.class-time')?.textContent || '--:--';
        const classType = classSlot.querySelector('.class-type')?.textContent || 'Clase';
        const classTitle = classSlot.querySelector('.class-title')?.textContent || 'Sin título';
        const classCoach = classSlot.querySelector('.class-coach')?.textContent || 'Coach: --';
        
        // Actualizar contenido del modal
        const modalTitle = bookingModal.querySelector('h4');
        const modalDetails = bookingModal.querySelector('.booking-details');
        
        if (modalTitle) {
            modalTitle.textContent = classTitle;
        }
        
        if (modalDetails) {
            // Obtener día de la clase
            const dayColumn = classSlot.closest('.day-column');
            const dayName = dayColumn?.querySelector('.day-name')?.textContent || 'Lun';
            const dayDate = dayColumn?.querySelector('.day-date')?.textContent || '14';
            
            modalDetails.innerHTML = `
                <div class="detail">
                    <i class="fas fa-clock"></i>
                    <span>${dayName} ${dayDate} Abril, ${classTime}</span>
                </div>
                <div class="detail">
                    <i class="fas fa-user-tie"></i>
                    <span>${classCoach}</span>
                </div>
                <div class="detail">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>Sala Principal</span>
                </div>
                <div class="detail">
                    <i class="fas fa-clock"></i>
                    <span>60 minutos</span>
                </div>
            `;
        }
        
        // Mostrar modal
        bookingModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeBookingModal() {
        if (bookingModal) {
            bookingModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    function confirmBooking() {
        // Simular reserva exitosa
        closeBookingModal();
        
        // Mostrar notificación
        showNotification('¡Reserva confirmada! Recibirás un email de confirmación.', 'success');
        
        // Actualizar interfaz después de 1 segundo
        setTimeout(() => {
            // En un sistema real, aquí se actualizaría la base de datos
            // Por ahora, solo mostramos un mensaje
            alert('Reserva confirmada exitosamente. Tu clase ha sido agregada a "Tus Próximas Reservas".');
        }, 500);
    }
    
    function cancelReservation(reservationCard) {
        // Simular cancelación
        reservationCard.style.opacity = '0.5';
        reservationCard.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            // En un sistema real, aquí se eliminaría de la base de datos
            // Por ahora, solo eliminamos el elemento visualmente
            reservationCard.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <i class="fas fa-check-circle" style="color: #28a745; font-size: 2rem; margin-bottom: 1rem;"></i>
                    <h4 style="color: #28a745;">Reserva Cancelada</h4>
                    <p style="color: #6c757d;">Esta reserva ha sido cancelada exitosamente.</p>
                </div>
            `;
            
            // Mostrar notificación
            showNotification('Reserva cancelada exitosamente.', 'info');
        }, 500);
    }
    
    function showClassDetails(card) {
        if (!card) return;
        
        // Obtener información de la clase/reserva
        const classType = card.querySelector('.class-type')?.textContent || 'Clase';
        const classTitle = card.querySelector('h3')?.textContent || card.querySelector('.class-title')?.textContent || 'Sin título';
        const classTime = card.querySelector('.class-time')?.textContent || card.querySelector('.reservation-date')?.textContent || '--:--';
        const classCoach = card.querySelector('.class-coach')?.textContent || 'Coach: --';
        
        // Crear modal de detalles
        const modalHTML = `
            <div class="class-details-modal">
                <h3>${classTitle}</h3>
                <div class="details-grid">
                    <div class="detail-item">
                        <i class="fas fa-tag"></i>
                        <div>
                            <strong>Tipo:</strong>
                            <p>${classType}</p>
                        </div>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-clock"></i>
                        <div>
                            <strong>Horario:</strong>
                            <p>${classTime}</p>
                        </div>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-user-tie"></i>
                        <div>
                            <strong>Coach:</strong>
                            <p>${classCoach}</p>
                        </div>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <div>
                            <strong>Ubicación:</strong>
                            <p>Sala Principal</p>
                        </div>
                    </div>
                </div>
                <div class="description">
                    <h4>Descripción:</h4>
                    <p>Clase de ${classType.toLowerCase()} diseñada para mejorar tu técnica y condición física. Nivel adecuado para todos los participantes.</p>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-outline close-details">Cerrar</button>
                </div>
            </div>
        `;
        
        // Mostrar modal
        showCustomModal('Detalles de la Clase', modalHTML);
        
        // Configurar botón de cerrar
        setTimeout(() => {
            const closeBtn = document.querySelector('.close-details');
            if (closeBtn) {
                closeBtn.addEventListener('click', closeCustomModal);
            }
        }, 100);
    }
    
    function goToPrevWeek() {
        if (currentWeek > 0) {
            currentWeek--;
            updateWeekDisplay();
            showNotification('Semana anterior cargada', 'info');
        } else {
            showNotification('Ya estás en la primera semana disponible', 'warning');
        }
    }
    
    function goToNextWeek() {
        if (currentWeek < weekDates.length - 1) {
            currentWeek++;
            updateWeekDisplay();
            showNotification('Próxima semana cargada', 'info');
        } else {
            showNotification('No hay más semanas disponibles', 'warning');
        }
    }
    
    function updateWeekDisplay() {
        if (!currentWeekElement) return;
        
        const week = weekDates[currentWeek];
        if (week.monthEnd) {
            currentWeekElement.textContent = `Semana ${week.start} ${week.month} - ${week.end} ${week.monthEnd} ${week.year}`;
        } else {
            currentWeekElement.textContent = `Semana ${week.start}-${week.end} ${week.month} ${week.year}`;
        }
    }
    
    function showNotification(message, type = 'info') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;
        
        // Agregar estilos si no existen
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 1rem 1.5rem;
                    border-radius: 8px;
                    color: white;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    min-width: 300px;
                    max-width: 500px;
                    z-index: 3000;
                    animation: slideIn 0.3s ease, slideOut 0.3s ease 3s forwards;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                .notification-success { background-color: #28a745; }
                .notification-info { background-color: #17a2b8; }
                .notification-warning { background-color: #ffc107; color: #212529; }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                }
                .notification-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.2rem;
                    cursor: pointer;
                    opacity: 0.7;
                    transition: opacity 0.3s ease;
                }
                .notification-close:hover {
                    opacity: 1;
                }
                .notification-warning .notification-close {
                    color: #212529;
                }
            `;
            document.head.appendChild(styles);
        }
        
        // Agregar al documento
        document.body.appendChild(notification);
        
        // Configurar botón de cerrar
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                notification.remove();
            });
        }
        
        // Auto-eliminar después de 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
    
    function getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            info: 'fa-info-circle',
            warning: 'fa-exclamation-triangle',
            error: 'fa-times-circle'
        };
        return icons[type] || 'fa-info-circle';
    }
    
    function showCustomModal(title, content) {
        const modalContainer = document.createElement('div');
        modalContainer.className = 'custom-modal-overlay';
        modalContainer.innerHTML = `
            <div class="custom-modal">
                <div class="custom-modal-header">
                    <h3>${title}</h3>
                    <button class="close-custom-modal">&times;</button>
                </div>
                <div class="custom-modal-body">
                    ${content}
                </div>
            </div>
        `;
        
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
                .class-details-modal h3 {
                    color: #2D3047;
                    font-size: 1.5rem;
                    margin-bottom: 1.5rem;
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
                    border-radius: