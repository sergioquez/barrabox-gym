// Profile Management Script
document.addEventListener('DOMContentLoaded', function() {
    // Auth System
    let authSystem = null;
    let dataManager = null;
    
    // Initialize systems
    function initializeSystems() {
        if (window.barraboxAuth) {
            authSystem = window.barraboxAuth;
        }
        
        if (window.barraboxDataManager) {
            dataManager = window.barraboxDataManager;
        }
        
        // Load user data
        loadUserData();
        setupEventListeners();
        updateStats();
    }
    
    // Load user data from auth system
    function loadUserData() {
        if (authSystem && authSystem.isLoggedIn()) {
            const user = authSystem.getCurrentUser();
            
            // Update profile fields
            const nameField = document.getElementById('profileName');
            const emailField = document.getElementById('profileEmail');
            const phoneField = document.getElementById('profilePhone');
            
            if (nameField) nameField.value = user.name || '';
            if (emailField) emailField.value = user.email || '';
            if (phoneField) phoneField.value = user.phone || '';
            
            // Update display elements
            const displayName = document.querySelector('[data-user-name]');
            const displayEmail = document.querySelector('[data-user-email]');
            const displayPlan = document.querySelector('[data-user-plan]');
            
            if (displayName) displayName.textContent = user.name || 'Usuario';
            if (displayEmail) displayEmail.textContent = user.email || '';
            if (displayPlan) displayPlan.textContent = user.plan === 'premium' ? 'Plan Premium' : 'Plan Básico';
            
            // Update avatar with initials
            const avatar = document.querySelector('[data-user-avatar]');
            if (avatar && user.name) {
                const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
                avatar.innerHTML = `<span style="font-size: 2.5rem; font-weight: 700;">${initials}</span>`;
            }
        }
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Profile form
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', handleProfileUpdate);
        }
        
        // Password form
        const passwordForm = document.getElementById('passwordForm');
        if (passwordForm) {
            passwordForm.addEventListener('submit', handlePasswordChange);
        }
        
        // Request data button
        const requestDataBtn = document.getElementById('requestDataBtn');
        if (requestDataBtn) {
            requestDataBtn.addEventListener('click', handleDataRequest);
        }
        
        // Delete account button
        const deleteAccountBtn = document.getElementById('deleteAccountBtn');
        if (deleteAccountBtn) {
            deleteAccountBtn.addEventListener('click', handleAccountDeletion);
        }
        
        // Logout buttons
        const logoutButtons = document.querySelectorAll('[data-logout]');
        logoutButtons.forEach(btn => {
            btn.addEventListener('click', handleLogout);
        });
    }
    
    // Handle profile update
    async function handleProfileUpdate(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Guardando...';
            
            const formData = {
                name: document.getElementById('profileName').value,
                phone: document.getElementById('profilePhone').value || ''
            };
            
            if (authSystem && authSystem.updateProfile) {
                const result = await authSystem.updateProfile(formData);
                
                if (result.success) {
                    showMessage('success', '¡Perfil actualizado exitosamente!');
                    loadUserData(); // Reload data
                }
            } else {
                // Simulate update
                showMessage('success', '¡Perfil actualizado exitosamente! (demo)');
            }
            
        } catch (error) {
            showMessage('error', error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }
    
    // Handle password change
    async function handlePasswordChange(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Cambiando...';
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Validations
            if (newPassword.length < 6) {
                throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
            }
            
            if (newPassword !== confirmPassword) {
                throw new Error('Las contraseñas no coinciden');
            }
            
            if (authSystem && authSystem.changePassword) {
                const result = await authSystem.changePassword(
                    currentPassword,
                    newPassword,
                    confirmPassword
                );
                
                if (result.success) {
                    showMessage('success', '¡Contraseña cambiada exitosamente!');
                    form.reset();
                }
            } else {
                // Simulate change
                showMessage('success', '¡Contraseña cambiada exitosamente! (demo)');
                form.reset();
            }
            
        } catch (error) {
            showMessage('error', error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }
    
    // Handle data request
    function handleDataRequest() {
        if (dataManager) {
            try {
                const exportData = dataManager.exportData();
                
                // Create blob and download
                const blob = new Blob([exportData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `barrabox-backup-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                showMessage('success', '¡Datos exportados! El archivo se ha descargado.');
            } catch (error) {
                showMessage('error', 'Error al exportar datos: ' + error.message);
            }
        } else {
            showMessage('error', 'Data Manager no disponible');
        }
    }
    
    // Handle account deletion
    function handleAccountDeletion() {
        if (confirm('¿ESTÁS ABSOLUTAMENTE SEGURO?\n\nEsta acción eliminará permanentemente tu cuenta y todos tus datos. Esta acción NO se puede deshacer.')) {
            if (confirm('Última confirmación: ¿Realmente quieres eliminar tu cuenta permanentemente?')) {
                showMessage('info', 'Solicitud de eliminación enviada (en un sistema real)');
                
                // In a real system, this would make an API call
                // For demo, we'll simulate it
                setTimeout(() => {
                    if (authSystem && authSystem.logout) {
                        authSystem.logout();
                    }
                    showMessage('success', 'Cuenta eliminada. Redirigiendo...');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 2000);
                }, 1500);
            }
        }
    }
    
    // Handle logout
    async function handleLogout(e) {
        e.preventDefault();
        
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            if (authSystem && authSystem.logout) {
                const result = await authSystem.logout();
                
                if (result.success) {
                    showMessage('success', 'Sesión cerrada exitosamente');
                    
                    setTimeout(() => {
                        window.location.href = result.redirectTo || 'index.html';
                    }, 1000);
                }
            } else {
                // Simple logout
                showMessage('info', 'Sesión cerrada');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            }
        }
    }
    
    // Update stats from data manager
    function updateStats() {
        if (dataManager && authSystem && authSystem.isLoggedIn()) {
            const user = authSystem.getCurrentUser();
            
            // Get user's bookings
            const bookings = dataManager.getBookingsByUser(user.id);
            const upcomingBookings = bookings.filter(b => {
                const bookingDate = new Date(b.date + 'T' + b.time);
                return bookingDate > new Date();
            });
            
            // Get user's classes this month
            const now = new Date();
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            
            const classesThisMonth = bookings.filter(b => {
                const bookingDate = new Date(b.date + 'T' + b.time);
                return bookingDate >= firstDay && bookingDate <= lastDay;
            });
            
            // Update stats
            const statClasses = document.getElementById('statClasses');
            const statBookings = document.getElementById('statBookings');
            
            if (statClasses) statClasses.textContent = classesThisMonth.length;
            if (statBookings) statBookings.textContent = upcomingBookings.length;
        }
    }
    
    // Show message helper
    function showMessage(type, message) {
        const messageEl = document.createElement('div');
        messageEl.className = `auth-message auth-message-${type}`;
        messageEl.innerHTML = `
            <i class="fas ${getMessageIcon(type)}"></i>
            <span>${message}</span>
            <button class="auth-message-close">&times;</button>
        `;
        
        // Add styles if they don't exist
        if (!document.querySelector('#auth-message-styles')) {
            const styles = document.createElement('style');
            styles.id = 'auth-message-styles';
            styles.textContent = `
                .auth-message {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 1rem 1.5rem;
                    border-radius: 8px;
                    color: white;
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    min-width: 300px;
                    max-width: 500px;
                    z-index: 10000;
                    animation: slideIn 0.3s ease, slideOut 0.3s ease 5s forwards;
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
                .auth-message-success {
                    background-color: #28a745;
                }
                .auth-message-error {
                    background-color: #dc3545;
                }
                .auth-message-info {
                    background-color: #17a2b8;
                }
                .auth-message-warning {
                    background-color: #ffc107;
                    color: #212529;
                }
                .auth-message-close {
                    background: none;
                    border: none;
                    color: inherit;
                    font-size: 1.2rem;
                    cursor: pointer;
                    opacity: 0.7;
                    margin-left: auto;
                }
                .auth-message-close:hover {
                    opacity: 1;
                }
                .auth-message-warning .auth-message-close {
                    color: #212529;
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(messageEl);
        
        const closeBtn = messageEl.querySelector('.auth-message-close');
        closeBtn.addEventListener('click', () => {
            messageEl.remove();
        });
        
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.remove();
            }
        }, 5000);
    }
    
    function getMessageIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle',
            warning: 'fa-exclamation-triangle'
        };
        return icons[type] || 'fa-info-circle';
    }
    
    // Check if user is logged in
    function checkAuth() {
        if (authSystem && !authSystem.isLoggedIn()) {
            showMessage('warning', 'Debes iniciar sesión para acceder a esta página');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return false;
        }
        return true;
    }
    
    // Initialize
    setTimeout(() => {
        if (checkAuth()) {
            initializeSystems();
        }
    }, 500);
});