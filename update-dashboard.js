// Script para actualizar el dashboard con enlace al sistema de reservas
document.addEventListener('DOMContentLoaded', function() {
    // Buscar el enlace del calendario
    const calendarLink = document.querySelector('.calendar-section .btn-view-all');
    if (calendarLink) {
        calendarLink.href = 'booking.html';
        calendarLink.textContent = 'Ir al sistema de reservas ';
        
        const icon = document.createElement('i');
        icon.className = 'fas fa-arrow-right';
        calendarLink.appendChild(icon);
        
        console.log('✅ Enlace al sistema de reservas actualizado');
    }
    
    // También actualizar el título si existe
    const calendarTitle = document.querySelector('.calendar-section h2');
    if (calendarTitle) {
        const icon = calendarTitle.querySelector('i');
        if (icon) {
            calendarTitle.innerHTML = '<i class="fas fa-calendar-alt"></i> Sistema de Reservas';
        }
    }
    
    // Agregar tarjeta de acción rápida para reservas
    const quickStats = document.querySelector('.quick-stats-grid');
    if (quickStats) {
        const bookingCard = document.createElement('div');
        bookingCard.className = 'stat-card';
        bookingCard.innerHTML = `
            <div class="stat-icon" style="background: rgba(40,167,69,0.1);">
                <i class="fas fa-plus-circle" style="color: #28A745;"></i>
            </div>
            <div class="stat-content">
                <div class="stat-number">Nueva</div>
                <div class="stat-label">Reserva</div>
                <a href="booking.html" class="stat-link">Reservar ahora</a>
            </div>
        `;
        
        quickStats.appendChild(bookingCard);
        console.log('✅ Tarjeta de reserva rápida agregada');
    }
});