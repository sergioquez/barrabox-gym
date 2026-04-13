// Admin Clean JavaScript - Funciones completas

// Funciones auxiliares
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function showAdminNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `admin-notification admin-notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    // Agregar estilos si no existen
    if (!document.querySelector('#admin-notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'admin-notification-styles';
        styles.textContent = `
            .admin-notification {
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
            .admin-notification-success { background-color: #28a745; }
            .admin-notification-info { background-color: #17a2b8; }
            .admin-notification-warning { background-color: #ffc107; color: #212529; }
            .admin-notification-error { background-color: #dc3545; }
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
            .admin-notification-warning .notification-close {
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
            .edit-class-modal h3 {
                color: #2D3047;
                font-size: 1.5rem;
                margin-bottom: 1.5rem;
            }
            .edit-class-modal p {
                color: #6c757d;
                margin-bottom: 1rem;
            }
            .modal-actions {
                display: flex;
                gap: 1rem;
                justify-content: flex-end;
                margin-top: 2rem;
                padding-top: 1.5rem;
                border-top: 1px solid #e9ecef;
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(modalContainer);
    
    // Configurar botón de cerrar
    setTimeout(() => {
        const closeBtn = modalContainer.querySelector('.close-custom-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modalContainer.remove();
            });
        }
    }, 100);
}

function closeCustomModal() {
    const modalContainer = document.querySelector('.custom-modal-overlay');
    if (modalContainer) {
        modalContainer.remove();
    }
}

// Función de impresión (completada)
function printSchedule() {
    const day = days[currentDayIndex];
    
    // Crear ventana de impresión
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Horario - ${day.date}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { color: #2D3047; margin-bottom: 10px; }
                h2 { color: #666; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th { background: #2D3047; color: white; padding: 12px; text-align: left; }
                td { padding: 10px; border-bottom: 1px solid #ddd; }
                tr:hover { background: #f5f5f5; }
                .badge { padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; }
                .badge-crossfit { background: #FF6B35; color: white; }
                .badge-halterofilia { background: #00A8A8; color: white; }
                .badge-gap { background: #2D3047; color: white; }
                .full { color: #dc3545; font-weight: bold; }
                .waitlist { color: #ffc107; font-weight: bold; }
                .footer { margin-top: 30px; color: #666; font-size: 12px; text-align: center; }
            </style>
        </head>
        <body>
            <h1>Barrabox Gym</h1>
            <h2>Horario - ${day.date}</h2>
            <table>
                <thead>
                    <tr>
                        <th>Hora</th>
                        <th>Tipo</th>
                        <th>Clase</th>
                        <th>Coach</th>
                        <th>Capacidad</th>
                        <th>Waitlist</th>
                    </tr>
                </thead>
                <tbody>
                    ${day.classes.map(cls => `
                        <tr>
                            <td><strong>${cls.time}</strong></td>
                            <td><span class="badge badge-${cls.type}">${getTypeLabel(cls.type)}</span></td>
                            <td>${cls.title}</td>
                            <td>${cls.coach}</td>
                            <td class="${cls.capacity.split('/')[0] === cls.capacity.split('/')[1] ? 'full' : ''}">${cls.capacity}</td>
                            <td class="${cls.waitlist > 0 ? 'waitlist' : ''}">${cls.waitlist > 0 ? cls.waitlist : '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="footer">
                <p>Generado el ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
                <p>Barrabox Admin Panel - Acceso restringido</p>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Esperar a que cargue y luego imprimir
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si estamos en el admin dashboard
    const adminNav = document.querySelector('.admin-navigation');
    if (!adminNav) return;
    
    // Inicializar el dashboard
    initAdminDashboard();
});

// Exportar funciones para uso global
window.AdminDashboard = {
    init: initAdminDashboard,
    openModal: openModal,
    closeModal: closeModal,
    showNotification: showAdminNotification
};