// Admin Utilities - Funciones de utilidad para el Admin Dashboard

// Mostrar modal
function showModal(html) {
    // Cerrar modal existente si hay
    closeModal();
    
    // Crear y mostrar nuevo modal
    const modal = document.createElement('div');
    modal.innerHTML = html;
    document.body.appendChild(modal);
    
    // Agregar clase para animación
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // Prevenir scroll del body
    document.body.style.overflow = 'hidden';
}

// Cerrar modal
function closeModal() {
    const modal = document.querySelector('.admin-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = '';
        }, 300);
    }
}

// Mostrar mensaje de éxito
function showSuccess(message) {
    if (window.barraboxAuth && window.barraboxAuth.showMessage) {
        window.barraboxAuth.showMessage('success', message);
    } else {
        alert('✅ ' + message);
    }
}

// Mostrar mensaje de error
function showError(message) {
    if (window.barraboxAuth && window.barraboxAuth.showMessage) {
        window.barraboxAuth.showMessage('error', message);
    } else {
        alert('❌ ' + message);
    }
}

// Mostrar mensaje de información
function showInfo(message) {
    if (window.barraboxAuth && window.barraboxAuth.showMessage) {
        window.barraboxAuth.showMessage('info', message);
    } else {
        alert('ℹ️ ' + message);
    }
}

// Redirigir a login
function redirectToLogin() {
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}

// Redirigir a dashboard de usuario
function redirectToDashboard() {
    setTimeout(() => {
        window.location.href = 'user-dashboard.html';
    }, 2000);
}

// Función debounce para optimizar eventos
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Refrescar todos los datos
async function refreshAllData() {
    try {
        if (adminSystem) {
            await adminSystem.refreshData(true);
            
            // Recargar la pestaña actual
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
                case 'reportsTab':
                    loadReportsTab();
                    break;
            }
            
            showSuccess('Datos actualizados correctamente');
        }
    } catch (error) {
        showError(`Error actualizando datos: ${error.message}`);
    }
}

// Exportar datos
async function exportData(dataType) {
    try {
        const result = adminSystem.exportData(dataType);
        
        // Crear blob y descargar
        const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `barrabox-${dataType}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showSuccess(`Datos de ${dataType} exportados correctamente`);
        
    } catch (error) {
        showError(`Error exportando datos: ${error.message}`);
    }
}

// Actualizar estadísticas
function updateStats() {
    try {
        if (!adminSystem) return;
        
        const stats = adminSystem.getGeneralStats();
        
        // Actualizar tarjetas de estadísticas rápidas
        const statCards = document.querySelectorAll('.admin-stat');
        if (statCards.length >= 4) {
            // Usuarios activos
            statCards[0].querySelector('.stat-number').textContent = stats.activeMembers;
            statCards[0].querySelector('.stat-change').textContent = `+${Math.floor(Math.random() * 10)} esta semana`;
            
            // Reservas hoy (simulado)
            const todayBookings = Math.floor(stats.recentBookings / 30 * 1.5);
            statCards[1].querySelector('.stat-number').textContent = todayBookings;
            statCards[1].querySelector('.stat-change').textContent = `${Math.floor((todayBookings / 80) * 100)}% ocupación`;
            
            // Ingresos (simulado)
            const revenue = stats.activeMembers * 29900; // $29.900 CLP por miembro
            const revenueFormatted = `$${(revenue / 1000000).toFixed(1)}M`;
            statCards[2].querySelector('.stat-number').textContent = revenueFormatted;
            statCards[2].querySelector('.stat-change').textContent = `+${Math.floor(Math.random() * 10)}% vs mes pasado`;
            
            // Alertas (simulado)
            const alerts = stats.cancellationRate > 20 ? 3 : 
                          stats.averageOccupancy < 50 ? 2 : 1;
            statCards[3].querySelector('.stat-number').textContent = alerts;
            statCards[3].querySelector('.stat-change').textContent = alerts > 2 ? 'Requieren atención' : 'Todo normal';
        }
        
    } catch (error) {
        console.error('Error actualizando estadísticas:', error);
    }
}

// Mostrar notificaciones
function showNotifications() {
    try {
        const notifications = window.barraboxDataManager.getAllNotifications();
        const unreadNotifications = notifications.filter(n => !n.read);
        
        let html = `
            <div class="admin-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-bell"></i> Notificaciones (${unreadNotifications.length})</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="notifications-list">
        `;
        
        if (unreadNotifications.length === 0) {
            html += `
                <div class="empty-notifications">
                    <i class="fas fa-bell-slash"></i>
                    <h4>No hay notificaciones nuevas</h4>
                    <p>Todas las notificaciones están leídas.</p>
                </div>
            `;
        } else {
            unreadNotifications.forEach(notification => {
                const timeAgo = getTimeAgo(new Date(notification.createdAt));
                const icon = getNotificationIcon(notification.type);
                
                html += `
                    <div class="notification-item ${notification.type}" data-notification-id="${notification.id}">
                        <div class="notification-icon">
                            <i class="fas fa-${icon}"></i>
                        </div>
                        <div class="notification-content">
                            <div class="notification-title">${notification.title}</div>
                            <div class="notification-message">${notification.message}</div>
                            <div class="notification-time">${timeAgo}</div>
                        </div>
                        <button class="notification-mark-read" data-notification-id="${notification.id}">
                            <i class="fas fa-check"></i>
                        </button>
                    </div>
                `;
            });
        }
        
        html += `
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button class="btn btn-outline" id="markAllRead">Marcar todas como leídas</button>
                        <button class="btn btn-primary close-modal-btn">Cerrar</button>
                    </div>
                </div>
            </div>
        `;
        
        showModal(html);
        
        // Configurar event listeners
        document.querySelectorAll('.notification-mark-read').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const notificationId = btn.getAttribute('data-notification-id');
                markNotificationAsRead(notificationId);
            });
        });
        
        document.getElementById('markAllRead')?.addEventListener('click', () => {
            markAllNotificationsAsRead();
        });
        
        document.querySelector('.close-modal')?.addEventListener('click', closeModal);
        document.querySelector('.close-modal-btn')?.addEventListener('click', closeModal);
        
    } catch (error) {
        console.error('Error mostrando notificaciones:', error);
        showError('Error cargando notificaciones');
    }
}

// Marcar notificación como leída
function markNotificationAsRead(notificationId) {
    try {
        window.barraboxDataManager.markNotificationAsRead(notificationId);
        
        // Remover notificación de la lista
        const notificationItem = document.querySelector(`[data-notification-id="${notificationId}"]`);
        if (notificationItem) {
            notificationItem.remove();
        }
        
        // Actualizar contador
        updateNotificationBadge();
        
    } catch (error) {
        console.error('Error marcando notificación como leída:', error);
    }
}

// Marcar todas las notificaciones como leídas
function markAllNotificationsAsRead() {
    try {
        const notifications = window.barraboxDataManager.getAllNotifications();
        notifications.forEach(notification => {
            if (!notification.read) {
                window.barraboxDataManager.markNotificationAsRead(notification.id);
            }
        });
        
        // Cerrar modal y actualizar
        closeModal();
        updateNotificationBadge();
        showSuccess('Todas las notificaciones marcadas como leídas');
        
    } catch (error) {
        console.error('Error marcando todas las notificaciones como leídas:', error);
        showError('Error actualizando notificaciones');
    }
}

// Actualizar badge de notificaciones
function updateNotificationBadge() {
    try {
        const notifications = window.barraboxDataManager.getAllNotifications();
        const unreadCount = notifications.filter(n => !n.read).length;
        
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
        
    } catch (error) {
        console.error('Error actualizando badge de notificaciones:', error);
    }
}

// Obtener icono para tipo de notificación
function getNotificationIcon(type) {
    const icons = {
        'booking_created': 'calendar-check',
        'booking_cancelled': 'calendar-times',
        'booking_cancelled_admin': 'user-shield',
        'member_created': 'user-plus',
        'member_updated': 'user-edit',
        'member_deleted': 'user-minus',
        'class_created': 'dumbbell',
        'class_updated': 'edit',
        'class_deleted': 'trash',
        'data_exported': 'file-export',
        'system_alert': 'exclamation-triangle',
        'info': 'info-circle',
        'warning': 'exclamation-circle',
        'success': 'check-circle',
        'error': 'times-circle'
    };
    
    return icons[type] || 'bell';
}

// Obtener tiempo transcurrido en formato legible
function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) {
        return 'Ahora mismo';
    } else if (diffMins < 60) {
        return `Hace ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
        return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
    } else if (diffDays < 7) {
        return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
    } else {
        return date.toLocaleDateString('es-ES');
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Configurar event listener para cerrar modal al hacer click fuera
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('admin-modal')) {
            closeModal();
        }
    });
    
    // Configurar event listener para cerrar modal con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
    
});