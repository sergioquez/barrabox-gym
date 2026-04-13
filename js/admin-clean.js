// Admin Clean JavaScript - Calendario interactivo

document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const adminNavBtns = document.querySelectorAll('.admin-nav-btn');
    const tabContents = document.querySelectorAll('.admin-tab-content');
    const addClassBtn = document.getElementById('addClassBtn');
    const printScheduleBtn = document.getElementById('printScheduleBtn');
    const notificationBtn = document.getElementById('notificationBtn');
    const prevDayBtn = document.getElementById('prevDay');
    const nextDayBtn = document.getElementById('nextDay');
    const currentDayElement = document.getElementById('currentDay');
    const dayScheduleElement = document.getElementById('daySchedule');
    const actionBtns = document.querySelectorAll('.action-btn');
    const adminModals = document.querySelectorAll('.admin-modal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    
    // Datos de ejemplo
    const days = [
        {
            date: 'Miércoles 16 Abril 2026',
            classes: [
                { time: '06:00', type: 'crossfit', title: 'CrossFit AM', coach: 'Carlos', capacity: '12/15', waitlist: 0 },
                { time: '08:00', type: 'halterofilia', title: 'Técnica Arranque', coach: 'Ana', capacity: '8/10', waitlist: 0 },
                { time: '10:00', type: 'crossfit', title: 'WOD Competidores', coach: 'Marco', capacity: '15/15', waitlist: 3 },
                { time: '12:00', type: 'gap', title: 'Core & Stability', coach: 'Sofia', capacity: '10/12', waitlist: 0 },
                { time: '14:00', type: 'halterofilia', title: 'Fuerza Olímpica', coach: 'Carlos', capacity: '6/8', waitlist: 1 },
                { time: '17:00', type: 'halterofilia', title: 'Técnica Envión', coach: 'Ana', capacity: '9/10', waitlist: 2 },
                { time: '19:00', type: 'gap', title: 'Glúteos & Abdomen', coach: 'Sofia', capacity: '8/12', waitlist: 0 },
                { time: '20:00', type: 'crossfit', title: 'Evening WOD', coach: 'Marco', capacity: '11/15', waitlist: 0 }
            ]
        },
        {
            date: 'Jueves 17 Abril 2026',
            classes: [
                { time: '06:00', type: 'crossfit', title: 'Morning Burn', coach: 'Carlos', capacity: '10/15', waitlist: 0 },
                { time: '08:00', type: 'halterofilia', title: 'Arranque Técnico', coach: 'Ana', capacity: '7/10', waitlist: 0 },
                { time: '17:00', type: 'crossfit', title: 'Strength & Conditioning', coach: 'Marco', capacity: '13/15', waitlist: 0 },
                { time: '19:00', type: 'gap', title: 'Full Body', coach: 'Sofia', capacity: '9/12', waitlist: 0 }
            ]
        },
        {
            date: 'Viernes 18 Abril 2026',
            classes: [
                { time: '06:00', type: 'crossfit', title: 'Friday AM', coach: 'Carlos', capacity: '8/15', waitlist: 0 },
                { time: '17:30', type: 'crossfit', title: 'Friday Night Lights', coach: 'Marco', capacity: '14/15', waitlist: 1 },
                { time: '19:30', type: 'gap', title: 'Weekend Starter', coach: 'Sofia', capacity: '10/12', waitlist: 0 }
            ]
        }
    ];
    
    // Variables de estado
    let currentDayIndex = 0;
    
    // Inicializar
    initAdminDashboard();
    
    function initAdminDashboard() {
        // Configurar navegación de tabs
        adminNavBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const tabId = this.dataset.tab + 'Tab';
                
                // Remover active de todos
                adminNavBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(tab => tab.classList.remove('active'));
                
                // Agregar active al seleccionado
                this.classList.add('active');
                document.getElementById(tabId).classList.add('active');
                
                // Si es el tab de calendario, actualizar display
                if (tabId === 'calendarTab') {
                    updateDaySchedule();
                }
            });
        });
        
        // Configurar botón agregar clase
        if (addClassBtn) {
            addClassBtn.addEventListener('click', function() {
                openModal('addClassModal');
            });
        }
        
        // Configurar botón imprimir
        if (printScheduleBtn) {
            printScheduleBtn.addEventListener('click', function() {
                printSchedule();
            });
        }
        
        // Configurar botón notificaciones
        if (notificationBtn) {
            notificationBtn.addEventListener('click', function() {
                openModal('notificationModal');
            });
        }
        
        // Configurar navegación de días
        if (prevDayBtn && nextDayBtn) {
            prevDayBtn.addEventListener('click', goToPrevDay);
            nextDayBtn.addEventListener('click', goToNextDay);
        }
        
        // Configurar botones de acción
        actionBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const action = this.dataset.action;
                handleScheduleAction(action);
            });
        });
        
        // Configurar modales
        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const modal = this.closest('.admin-modal');
                closeModal(modal.id);
            });
        });
        
        adminModals.forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    closeModal(this.id);
                }
            });
        });
        
        // Cargar calendario inicial
        updateDaySchedule();
        
        // Configurar eventos para clases (delegación)
        dayScheduleElement.addEventListener('click', function(e) {
            const editBtn = e.target.closest('.btn-admin-action.edit');
            const manageBtn = e.target.closest('.btn-admin-action.manage');
            const cancelBtn = e.target.closest('.btn-admin-action.cancel');
            
            if (editBtn) {
                const scheduleItem = editBtn.closest('.schedule-item');
                editClass(scheduleItem);
            } else if (manageBtn) {
                const scheduleItem = manageBtn.closest('.schedule-item');
                manageClass(scheduleItem);
            } else if (cancelBtn) {
                const scheduleItem = cancelBtn.closest('.schedule-item');
                cancelClass(scheduleItem);
            }
        });
    }
    
    function updateDaySchedule() {
        if (!currentDayElement || !dayScheduleElement) return;
        
        const day = days[currentDayIndex];
        
        // Actualizar fecha actual
        currentDayElement.textContent = day.date;
        
        // Limpiar schedule
        dayScheduleElement.innerHTML = '';
        
        if (day.classes.length === 0) {
            dayScheduleElement.innerHTML = `
                <div class="no-classes">
                    <i class="fas fa-calendar-times"></i>
                    <h3>No hay clases programadas</h3>
                    <p>Haz clic en "Nueva Clase" para agregar una</p>
                </div>
            `;
            return;
        }
        
        // Agregar clases
        day.classes.forEach(cls => {
            const isFull = cls.capacity.split('/')[0] === cls.capacity.split('/')[1];
            const hasWaitlist = cls.waitlist > 0;
            
            const scheduleItem = document.createElement('div');
            scheduleItem.className = 'schedule-item';
            scheduleItem.dataset.time = cls.time;
            scheduleItem.dataset.type = cls.type;
            
            scheduleItem.innerHTML = `
                <div class="schedule-time">${cls.time}</div>
                <div class="schedule-details">
                    <span class="class-type-badge ${cls.type}">${getTypeLabel(cls.type)}</span>
                    <div class="class-info-admin">
                        <div class="class-title-admin">${cls.title}</div>
                        <div class="class-coach-admin">
                            <i class="fas fa-user-tie"></i>
                            <span>${cls.coach}</span>
                        </div>
                    </div>
                    <div class="class-stats">
                        <span>
                            <i class="fas fa-users"></i>
                            <span class="${isFull ? 'full' : 'available'}">${cls.capacity}</span>
                        </span>
                        ${hasWaitlist ? `
                            <span>
                                <i class="fas fa-clock"></i>
                                <span class="waitlist">Waitlist: ${cls.waitlist}</span>
                            </span>
                        ` : ''}
                    </div>
                </div>
                <div class="schedule-actions-admin">
                    <button class="btn-admin-action edit" title="Editar clase">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-admin-action manage" title="Gestionar lista">
                        <i class="fas fa-list"></i>
                    </button>
                    <button class="btn-admin-action cancel" title="Cancelar clase">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            dayScheduleElement.appendChild(scheduleItem);
        });
        
        // Agregar estilos para estados
        if (!document.querySelector('#schedule-styles')) {
            const styles = document.createElement('style');
            styles.id = 'schedule-styles';
            styles.textContent = `
                .no-classes {
                    text-align: center;
                    padding: 3rem 1rem;
                    color: #6c757d;
                }
                .no-classes i {
                    font-size: 3rem;
                    color: #e9ecef;
                    margin-bottom: 1rem;
                }
                .no-classes h3 {
                    color: #2D3047;
                    margin-bottom: 0.5rem;
                }
                .class-stats .full {
                    color: #dc3545;
                    font-weight: 600;
                }
                .class-stats .available {
                    color: #28a745;
                    font-weight: 600;
                }
                .class-stats .waitlist {
                    color: #ffc107;
                    font-weight: 600;
                }
            `;
            document.head.appendChild(styles);
        }
    }
    
    function getTypeLabel(type) {
        const labels = {
            crossfit: 'CrossFit',
            halterofilia: 'Halterofilia',
            gap: 'GAP'
        };
        return labels[type] || type;
    }
    
    function goToPrevDay() {
        if (currentDayIndex > 0) {
            currentDayIndex--;
            updateDaySchedule();
            showAdminNotification('Día anterior cargado', 'info');
        } else {
            showAdminNotification('Ya estás en el primer día disponible', 'warning');
        }
    }
    
    function goToNextDay() {
        if (currentDayIndex < days.length - 1) {
            currentDayIndex++;
            updateDaySchedule();
            showAdminNotification('Próximo día cargado', 'info');
        } else {
            showAdminNotification('No hay más días disponibles', 'warning');
        }
    }
    
    function handleScheduleAction(action) {
        switch(action) {
            case 'copy':
                copySchedule();
                break;
            case 'email':
                emailCoaches();
                break;
            case 'stats':
                showStats();
                break;
            default:
                console.log('Acción no implementada:', action);
        }
    }
    
    function copySchedule() {
        const day = days[currentDayIndex];
        let scheduleText = `Horario - ${day.date}\n\n`;
        
        day.classes.forEach(cls => {
            scheduleText += `${cls.time} - ${getTypeLabel(cls.type)}: ${cls.title} (${cls.coach}) - ${cls.capacity}\n`;
        });
        
        // Copiar al portapapeles
        navigator.clipboard.writeText(scheduleText).then(() => {
            showAdminNotification('Horario copiado al portapapeles', 'success');
        }).catch(err => {
            console.error('Error al copiar:', err);
            showAdminNotification('Error al copiar horario', 'error');
        });
    }
    
    function emailCoaches() {
        showAdminNotification('Enviando email a coaches...', 'info');
        
        // Simular envío de email
        setTimeout(() => {
            showAdminNotification('Email enviado a todos los coaches', 'success');
        }, 1500);
    }
    
    function showStats() {
        const day = days[currentDayIndex];
        const totalClasses = day.classes.length;
        const totalCapacity = day.classes.reduce((sum, cls) => {
            const [current, max] = cls.capacity.split('/').map(Number);
            return sum + max;
        }, 0);
        const totalBooked = day.classes.reduce((sum, cls) => {
            const [current] = cls.capacity.split('/').map(Number);
            return sum + current;
        }, 0);
        const occupancy = totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0;
        
        const statsText = `
            Estadísticas del día:
            • Clases: ${totalClasses}
            • Capacidad total: ${totalCapacity}
            • Reservas: ${totalBooked}
            • Ocupación: ${occupancy}%
            • Waitlists: ${day.classes.reduce((sum, cls) => sum + cls.waitlist, 0)}
        `;
        
        alert(statsText);
    }
    
    function editClass(scheduleItem) {
        if (!scheduleItem) return;
        
        const time = scheduleItem.dataset.time;
        const type = scheduleItem.dataset.type;
        
        showAdminNotification(`Editando clase de ${time} (${getTypeLabel(type)})`, 'info');
        
        // En un sistema real, aquí se abriría un formulario de edición
        setTimeout(() => {
            const modalHTML = `
                <div class="edit-class-modal">
                    <h3>Editar Clase</h3>
                    <p>Formulario de edición en desarrollo...</p>
                    <p>Clase: ${time} - ${getTypeLabel(type)}</p>
                    <div class="modal-actions">
                        <button class="btn btn-outline close-edit">Cancelar</button>
                        <button class="btn btn-primary save-edit">Guardar Cambios</button>
                    </div>
                </div>
            `;
            
            showCustomModal('Editar Clase', modalHTML);
            
            setTimeout(() => {
                const closeBtn = document.querySelector('.close-edit');
                const saveBtn = document.querySelector('.save-edit');
                
                if (closeBtn) {
                    closeBtn.addEventListener('click', closeCustomModal);
                }
                
                if (saveBtn) {
                    saveBtn.addEventListener('click', () => {
                        closeCustomModal();
                        showAdminNotification('Clase actualizada exitosamente', 'success');
                    });
                }
            }, 100);
        }, 500);
    }
    
    function manageClass(scheduleItem) {
        if (!scheduleItem) return;
        
        const time = scheduleItem.dataset.time;
        const type = scheduleItem.dataset.type;
        
        showAdminNotification(`Gestionando lista de ${time} (${getTypeLabel(type)})`, 'info');
        
        // En un sistema real, aquí se abriría la gestión de lista de espera
        setTimeout(() => {
            alert(`Gestión de lista para clase de ${time}\n\nFuncionalidad en desarrollo. En un sistema real aquí verías:\n• Lista de participantes\n• Waitlist\n• Opciones de gestión`);
        }, 500);
    }
    
    function cancelClass(scheduleItem) {
        if (!scheduleItem) return;
        
        const time = scheduleItem.dataset.time;
        const type = scheduleItem.dataset.type;
        
        if (confirm(`¿Estás seguro de que quieres cancelar la clase de ${time} (${getTypeLabel(type)})?\n\nEsta acción notificará a todos los participantes.`)) {
            scheduleItem.style.opacity = '0.5';
            scheduleItem.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                scheduleItem.innerHTML = `
                    <div style="text-align: center; padding: 1rem; width: 100%;">
                        <i class="fas fa-ban" style="color: #dc3545; font-size: 1.5rem; margin-bottom: 0.5rem;"></i>
                        <div style="color: #dc3545; font-weight: 600;">CLASE CANCELADA</div>
                        <div style="color: #6c757d; font-size: 0.9rem;">${time} - ${getTypeLabel(type)}</div>
                    </div>
                `;
                
                showAdminNotification('Clase cancelada y participantes notificados', 'success');
            }, 500);
        }
    }
    
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
                    h1 { color: #2D3047; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th