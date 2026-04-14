// Funciones adicionales para Admin Integration

// Continuación de viewClassDetails
function viewClassDetails(classId) {
    const cls = window.barraboxDataManager.getClass(classId);
    if (!cls) {
        showError('Clase no encontrada');
        return;
    }
    
    const classBookings = window.barraboxDataManager.getBookingsByClass(classId);
    const activeBookings = classBookings.filter(b => b.status === 'confirmed').length;
    const occupancy = Math.round((cls.booked / cls.capacity) * 100);
    
    const modalHtml = `
        <div class="admin-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-dumbbell"></i> Detalles de la Clase</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="class-details">
                        <div class="detail-section">
                            <h4>Información de la Clase</h4>
                            <div class="detail-row">
                                <span class="label">Título:</span>
                                <span class="value">${cls.title}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Tipo:</span>
                                <span class="value badge badge-type-${cls.type}">${cls.type}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Coach:</span>
                                <span class="value">${cls.coach}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Horario:</span>
                                <span class="value">${cls.schedule}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Descripción:</span>
                                <span class="value">${cls.description || 'Sin descripción'}</span>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h4>Estadísticas de Ocupación</h4>
                            <div class="detail-row">
                                <span class="label">Capacidad:</span>
                                <span class="value">${cls.capacity} personas</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Reservados:</span>
                                <span class="value">${cls.booked} personas</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Disponibles:</span>
                                <span class="value">${cls.capacity - cls.booked} personas</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Ocupación:</span>
                                <span class="value">
                                    <div class="occupancy-bar-small">
                                        <div class="occupancy-fill" style="width: ${occupancy}%"></div>
                                    </div>
                                    ${occupancy}%
                                </span>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h4>Reservas Activas</h4>
                            <div class="detail-row">
                                <span class="label">Total reservas:</span>
                                <span class="value">${classBookings.length}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Reservas confirmadas:</span>
                                <span class="value">${activeBookings}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Reservas canceladas:</span>
                                <span class="value">${classBookings.length - activeBookings}</span>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h4>Información del Sistema</h4>
                            <div class="detail-row">
                                <span class="label">Creada:</span>
                                <span class="value">${new Date(cls.createdAt).toLocaleDateString('es-ES')}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Actualizada:</span>
                                <span class="value">${new Date(cls.updatedAt).toLocaleDateString('es-ES')}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-outline close-modal-btn">Cerrar</button>
                    <button class="btn btn-primary" id="editClassBtn">Editar Clase</button>
                </div>
            </div>
        </div>
    `;
    
    showModal(modalHtml);
    
    // Configurar event listeners del modal
    document.querySelector('.close-modal')?.addEventListener('click', closeModal);
    document.querySelector('.close-modal-btn')?.addEventListener('click', closeModal);
    document.getElementById('editClassBtn')?.addEventListener('click', () => {
        closeModal();
        editClass(classId);
    });
}

// Editar clase
function editClass(classId) {
    const cls = window.barraboxDataManager.getClass(classId);
    if (!cls) {
        showError('Clase no encontrada');
        return;
    }
    
    const modalHtml = `
        <div class="admin-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-edit"></i> Editar Clase</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="editClassForm">
                        <div class="form-group">
                            <label for="editClassTitle">Título</label>
                            <input type="text" id="editClassTitle" value="${cls.title}" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="editClassType">Tipo de Clase</label>
                            <select id="editClassType">
                                <option value="crossfit" ${cls.type === 'crossfit' ? 'selected' : ''}>CrossFit</option>
                                <option value="yoga" ${cls.type === 'yoga' ? 'selected' : ''}>Yoga</option>
                                <option value="hiit" ${cls.type === 'hiit' ? 'selected' : ''}>HIIT</option>
                                <option value="spinning" ${cls.type === 'spinning' ? 'selected' : ''}>Spinning</option>
                                <option value="boxing" ${cls.type === 'boxing' ? 'selected' : ''}>Boxing</option>
                                <option value="halterofilia" ${cls.type === 'halterofilia' ? 'selected' : ''}>Halterofilia</option>
                                <option value="gap" ${cls.type === 'gap' ? 'selected' : ''}>GAP</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="editClassCoach">Coach</label>
                            <input type="text" id="editClassCoach" value="${cls.coach}" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="editClassSchedule">Horario</label>
                            <input type="text" id="editClassSchedule" value="${cls.schedule}" required>
                            <small class="form-text">Ej: Lunes 18:00, Martes 09:00</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="editClassCapacity">Capacidad</label>
                            <input type="number" id="editClassCapacity" value="${cls.capacity}" min="1" max="50" required>
                            <small class="form-text">Máximo 50 personas</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="editClassDescription">Descripción</label>
                            <textarea id="editClassDescription" rows="3">${cls.description || ''}</textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-outline close-modal-btn">Cancelar</button>
                    <button class="btn btn-danger" id="deleteClassBtn">Eliminar</button>
                    <button class="btn btn-primary" id="saveClassBtn">Guardar Cambios</button>
                </div>
            </div>
        </div>
    `;
    
    showModal(modalHtml);
    
    // Configurar event listeners del modal
    document.querySelector('.close-modal')?.addEventListener('click', closeModal);
    document.querySelector('.close-modal-btn')?.addEventListener('click', closeModal);
    
    document.getElementById('saveClassBtn')?.addEventListener('click', async () => {
        try {
            const updates = {
                title: document.getElementById('editClassTitle').value,
                type: document.getElementById('editClassType').value,
                coach: document.getElementById('editClassCoach').value,
                schedule: document.getElementById('editClassSchedule').value,
                capacity: parseInt(document.getElementById('editClassCapacity').value),
                description: document.getElementById('editClassDescription').value
            };
            
            // Validar capacidad
            if (updates.capacity < cls.booked) {
                throw new Error(`No se puede reducir la capacidad a menos de ${cls.booked} (reservas existentes)`);
            }
            
            await adminSystem.updateClass(classId, updates);
            closeModal();
            loadClassesTab();
            showSuccess('Clase actualizada correctamente');
            
        } catch (error) {
            showError(`Error actualizando clase: ${error.message}`);
        }
    });
    
    document.getElementById('deleteClassBtn')?.addEventListener('click', () => {
        closeModal();
        deleteClass(classId);
    });
}

// Eliminar clase
async function deleteClass(classId) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta clase? Esta acción no se puede deshacer.')) {
        return;
    }
    
    try {
        await adminSystem.deleteClass(classId);
        loadClassesTab();
        showSuccess('Clase eliminada correctamente');
        
    } catch (error) {
        showError(`Error eliminando clase: ${error.message}`);
    }
}

// Ver detalles de reserva
function viewBookingDetails(bookingId) {
    const booking = window.barraboxDataManager.getBooking(bookingId);
    if (!booking) {
        showError('Reserva no encontrada');
        return;
    }
    
    const user = window.barraboxDataManager.getUser(booking.userId);
    const cls = window.barraboxDataManager.getClass(booking.classId);
    
    if (!user || !cls) {
        showError('Información incompleta de la reserva');
        return;
    }
    
    const bookingDate = new Date(booking.date + 'T' + booking.time);
    const formattedDate = bookingDate.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    const modalHtml = `
        <div class="admin-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-calendar-check"></i> Detalles de la Reserva</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="booking-details">
                        <div class="detail-section">
                            <h4>Información del Miembro</h4>
                            <div class="detail-row">
                                <span class="label">Nombre:</span>
                                <span class="value">${user.name}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Email:</span>
                                <span class="value">${user.email}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Plan:</span>
                                <span class="value badge ${user.plan === 'premium' ? 'plan-premium' : 'plan-basic'}">
                                    ${user.plan === 'premium' ? 'Premium' : 'Básico'}
                                </span>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h4>Información de la Clase</h4>
                            <div class="detail-row">
                                <span class="label">Clase:</span>
                                <span class="value">${cls.title}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Tipo:</span>
                                <span class="value badge badge-type-${cls.type}">${cls.type}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Coach:</span>
                                <span class="value">${cls.coach}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Capacidad:</span>
                                <span class="value">${cls.booked}/${cls.capacity}</span>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h4>Detalles de la Reserva</h4>
                            <div class="detail-row">
                                <span class="label">Fecha:</span>
                                <span class="value">${formattedDate}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Hora:</span>
                                <span class="value">${booking.time}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Estado:</span>
                                <span class="value badge ${booking.status === 'confirmed' ? 'status-confirmed' : 'status-cancelled'}">
                                    ${booking.status === 'confirmed' ? 'Confirmada' : 'Cancelada'}
                                </span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Creada:</span>
                                <span class="value">${new Date(booking.createdAt).toLocaleDateString('es-ES')}</span>
                            </div>
                            ${booking.updatedAt ? `
                                <div class="detail-row">
                                    <span class="label">Actualizada:</span>
                                    <span class="value">${new Date(booking.updatedAt).toLocaleDateString('es-ES')}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-outline close-modal-btn">Cerrar</button>
                    ${booking.status === 'confirmed' ? `
                        <button class="btn btn-danger" id="cancelBookingBtn">Cancelar Reserva</button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    showModal(modalHtml);
    
    // Configurar event listeners del modal
    document.querySelector('.close-modal')?.addEventListener('click', closeModal);
    document.querySelector('.close-modal-btn')?.addEventListener('click', closeModal);
    
    const cancelBtn = document.getElementById('cancelBookingBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            closeModal();
            cancelBookingAsAdmin(bookingId);
        });
    }
}

// Cancelar reserva como administrador
async function cancelBookingAsAdmin(bookingId) {
    const reason = prompt('Ingresa la razón de la cancelación (opcional):') || 'Cancelado por administrador';
    
    if (reason === null) return; // Usuario canceló
    
    if (!confirm(`¿Estás seguro de que quieres cancelar esta reserva?\nRazón: ${reason}`)) {
        return;
    }
    
    try {
        await adminSystem.cancelBookingAsAdmin(bookingId, reason);
        loadBookingsTab();
        showSuccess('Reserva cancelada correctamente');
        
    } catch (error) {
        showError(`Error cancelando reserva: ${error.message}`);
    }
}

// Mostrar modal de nuevo miembro
function showNewMemberModal() {
    const modalHtml = `
        <div class="admin-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-user-plus"></i> Nuevo Miembro</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="newMemberForm">
                        <div class="form-group">
                            <label for="newMemberName">Nombre Completo *</label>
                            <input type="text" id="newMemberName" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="newMemberEmail">Email *</label>
                            <input type="email" id="newMemberEmail" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="newMemberPhone">Teléfono</label>
                            <input type="tel" id="newMemberPhone">
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="newMemberRole">Rol</label>
                                <select id="newMemberRole">
                                    <option value="member">Miembro</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="newMemberPlan">Plan</label>
                                <select id="newMemberPlan">
                                    <option value="basic">Básico</option>
                                    <option value="premium">Premium</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="newMemberStatus">Estado</label>
                            <select id="newMemberStatus">
                                <option value="active">Activo</option>
                                <option value="inactive">Inactivo</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="newMemberPassword">Contraseña Temporal</label>
                            <input type="text" id="newMemberPassword" value="bienvenido123">
                            <small class="form-text">Se le pedirá cambiarla en su primer acceso</small>
                        </div>
                    </form>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-outline close-modal-btn">Cancelar</button>
                    <button class="btn btn-primary" id="saveMemberBtn">Crear Miembro</button>
                </div>
            </div>
        </div>
    `;
    
    showModal(modalHtml);
    
    // Configurar event listeners del modal
    document.querySelector('.close-modal')?.addEventListener('click', closeModal);
    document.querySelector('.close-modal-btn')?.addEventListener('click', closeModal);
    
    document.getElementById('saveMemberBtn')?.addEventListener('click', async () => {
        try {
            const newMember = {
                name: document.getElementById('newMemberName').value,
                email: document.getElementById('newMemberEmail').value,
                phone: document.getElementById('newMemberPhone')?.value || '',
                role: document.getElementById('newMemberRole').value,
                plan: document.getElementById('newMemberPlan').value,
                status: document.getElementById('newMemberStatus').value,
                password: document.getElementById('newMemberPassword').value
            };
            
            if (!newMember.name || !newMember.email) {
                throw new Error('Nombre y email son obligatorios');
            }
            
            await adminSystem.createMember(newMember);
            closeModal();
            loadMembersTab();
            showSuccess('Miembro creado correctamente');
            
        } catch (error) {
            showError(`Error creando miembro: ${error.message}`);
        }
    });
}

// Utility functions
function showModal(html) {
    const existing = document.querySelector('.admin-modal-overlay');
    if (existing) existing.remove();
    
    const overlay = document.createElement('div');
    overlay.className = 'admin-modal-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML = html;
    document.body.appendChild(overlay);
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });
}

function closeModal() {
    const overlay = document.querySelector('.admin-modal-overlay');
    if (overlay) overlay.remove();
}

function showSuccess(message) {
    console.info('[Admin]', message);
    alert('✅ ' + message);
}

function showError(message) {
    console.error('[Admin]', message);
    alert('❌ ' + message);
}