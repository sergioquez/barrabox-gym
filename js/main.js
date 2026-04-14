// Barrabox - Main JavaScript (Actualizado con Auth System)
// Función de inicialización que se puede llamar en cualquier momento
function initializeMain() {
    // Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.innerHTML = navMenu.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
    }
    
    // Login Modal
    const loginBtn = document.querySelector('.btn-login');
    const loginModal = document.getElementById('loginModal');
    const closeModal = document.querySelector('.close-modal');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Open Modal
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            loginModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    }
    
    // Close Modal
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            closeLoginModal();
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === loginModal) {
            closeLoginModal();
        }
    });
    
    // Function to close modal properly
    function closeLoginModal() {
        console.log('Cerrando modal de login');
        loginModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        // Force remove any inline styles that might block
        loginModal.removeAttribute('style');
    }
    
    // Tab Switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId + 'Tab') {
                    content.classList.add('active');
                }
            });
        });
    });
    
    // ==================== AUTH SYSTEM INTEGRATION ====================
    
    // Inicializar Auth System si está disponible
    let authSystem = null;
    if (window.barraboxAuth) {
        authSystem = window.barraboxAuth;
    } else {
        // Los módulos se cargarán automáticamente
    }
    
    // User Login Form - Actualizado con Auth System
    const userLoginForm = document.getElementById('userLoginForm');
    if (userLoginForm) {
        userLoginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const email = document.getElementById('userEmail').value;
            const password = document.getElementById('userPassword').value;
            const rememberMe = document.getElementById('rememberMe')?.checked || false;
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            try {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Ingresando...';
                
                // Usar Auth System si está disponible
                if (authSystem) {
                    const result = await authSystem.login(email, password, rememberMe);
                    
                    // Mostrar mensaje de éxito
                    showNotification(`¡Bienvenido ${result.user.name}!`, 'success');
                    
                    // Cerrar modal y redirigir
                    closeLoginModal();
                    
                    setTimeout(() => {
                        window.location.href = result.redirectTo;
                    }, 1000);
                    
                } else {
                    // Fallback al sistema antiguo
                    simulateUserLogin(email, password);
                }
                
            } catch (error) {
                showNotification(error.message, 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
            
            return false;
        });
    }
    
    // Admin Login Form - Actualizado con Auth System
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const email = document.getElementById('adminEmail').value;
            const password = document.getElementById('adminPassword').value;
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            try {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Ingresando...';
                
                // Usar Auth System si está disponible
                if (authSystem) {
                    const result = await authSystem.login(email, password, false);
                    
                    // Verificar que sea admin
                    if (!result.user.role === 'admin') {
                        throw new Error('Acceso denegado: se requieren permisos de administrador');
                    }
                    
                    // Mostrar mensaje de éxito
                    showNotification(`¡Bienvenido Administrador ${result.user.name}!`, 'admin');
                    
                    // Cerrar modal y redirigir
                    closeLoginModal();
                    
                    setTimeout(() => {
                        window.location.href = result.redirectTo;
                    }, 1000);
                    
                } else {
                    // Fallback al sistema antiguo
                    simulateAdminLogin(email, password);
                }
                
            } catch (error) {
                showNotification(error.message, 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
            
            return false;
        });
    }
    
    // Register Form - Nuevo con Auth System
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const formData = {
                email: document.getElementById('registerEmail').value,
                name: document.getElementById('registerName').value,
                phone: document.getElementById('registerPhone')?.value || '',
                password: document.getElementById('registerPassword').value,
                confirmPassword: document.getElementById('registerConfirmPassword').value
            };
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            try {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Registrando...';
                
                if (authSystem) {
                    const result = await authSystem.register(formData);
                    
                    // Mostrar mensaje de éxito
                    showNotification(`¡Bienvenido ${result.user.name}! Tu cuenta ha sido creada.`, 'success');
                    
                    // Cerrar modal y redirigir
                    closeLoginModal();
                    
                    setTimeout(() => {
                        window.location.href = result.redirectTo;
                    }, 1500);
                    
                } else {
                    throw new Error('Sistema de registro no disponible');
                }
                
            } catch (error) {
                showNotification(error.message, 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
            
            return false;
        });
    }
    
    // ==================== FUNCIONES DE AYUDA ====================
    
    // Simulate User Login (fallback)
    function simulateUserLogin(email, password) {
        const submitBtn = userLoginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Ingresando...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            // Close modal
            closeLoginModal();
            
            // Show success message
            showNotification(`¡Bienvenido! Redirigiendo al dashboard...`, 'success');
            
            // Redirect to user dashboard
            setTimeout(() => {
                window.location.href = 'user-dashboard.html';
            }, 1000);
            
            // Reset form
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            userLoginForm.reset();
        }, 1000);
    }
    
    // Simulate Admin Login (fallback)
    function simulateAdminLogin(email, password) {
        const submitBtn = adminLoginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Ingresando...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            // Close modal
            closeLoginModal();
            
            // Show admin message
            showNotification(`Panel de Administración activo. Redirigiendo...`, 'admin');
            
            // Redirect to admin dashboard immediately
            window.location.href = 'admin-dashboard.html';
            
            // Reset form
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            adminLoginForm.reset();
        }, 1000);
    }
    
    // Notification System
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;
        
        // Add styles if they don't exist
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
                .notification-error { background-color: #dc3545; }
                .notification-admin { background-color: #2D3047; }
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
        
        // Add to document
        document.body.appendChild(notification);
        
        // Setup close button
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                notification.remove();
            });
        }
        
        // Auto-remove after 5 seconds
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
            error: 'fa-times-circle',
            admin: 'fa-user-shield'
        };
        return icons[type] || 'fa-info-circle';
    }
    
    // ==================== INITIALIZATION ====================
    
    // Verificar autenticación al cargar la página
    function checkAuthStatus() {
        if (authSystem && authSystem.isLoggedIn()) {
            const user = authSystem.getCurrentUser();
            
            // Actualizar UI si hay elementos de autenticación
            updateAuthUI(user);
        } else {
        }
    }
    
    function updateAuthUI(user) {
        // Actualizar elementos con data-user
        const userElements = document.querySelectorAll('[data-user]');
        userElements.forEach(el => {
            const attr = el.getAttribute('data-user');
            if (attr === 'name') el.textContent = user.name;
            if (attr === 'email') el.textContent = user.email;
            if (attr === 'plan') el.textContent = user.plan === 'premium' ? 'Plan Premium' : 'Plan Básico';
        });
        
        // Mostrar/ocultar elementos basados en autenticación
        const authElements = document.querySelectorAll('[data-auth]');
        authElements.forEach(el => {
            const authState = el.getAttribute('data-auth');
            const isLoggedIn = authSystem.isLoggedIn();
            const isAdmin = authSystem.isUserAdmin();
            
            switch(authState) {
                case 'show-when-logged-in':
                    el.style.display = isLoggedIn ? '' : 'none';
                    break;
                case 'show-when-logged-out':
                    el.style.display = isLoggedIn ? 'none' : '';
                    break;
                case 'show-when-admin':
                    el.style.display = isAdmin ? '' : 'none';
                    break;
                case 'show-when-member':
                    el.style.display = (isLoggedIn && !isAdmin) ? '' : 'none';
                    break;
            }
        });
    }
    
    // Configurar logout buttons
    function setupLogoutButtons() {
        const logoutButtons = document.querySelectorAll('[data-logout]');
        logoutButtons.forEach(btn => {
            btn.addEventListener('click', async function(e) {
                e.preventDefault();
                
                if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                    if (authSystem) {
                        const result = await authSystem.logout();
                        
                        if (result.success) {
                            showNotification('Sesión cerrada exitosamente', 'info');
                            
                            setTimeout(() => {
                                window.location.href = result.redirectTo;
                            }, 1000);
                        }
                    } else {
                        // Fallback simple
                        showNotification('Sesión cerrada', 'info');
                        setTimeout(() => {
                            window.location.href = 'index.html';
                        }, 1000);
                    }
                }
            });
        });
    }
    
    // Inicializar cuando Auth System esté listo
    function initializeAuth() {
        if (window.barraboxAuth) {
            authSystem = window.barraboxAuth;
            checkAuthStatus();
            setupLogoutButtons();
            
            // Escuchar eventos de autenticación
            authSystem.on('loginSuccess', (user) => {
                console.log('Evento: loginSuccess', user.email);
                updateAuthUI(user);
            });
            
            authSystem.on('logoutSuccess', () => {
                console.log('Evento: logoutSuccess');
                updateAuthUI(null);
            });
            
            authSystem.on('sessionRestored', (user) => {
                console.log('Evento: sessionRestored', user.email);
                updateAuthUI(user);
            });
        } else {
            // Reintentar después de un delay
            setTimeout(initializeAuth, 500);
        }
    }
    
    // Iniciar verificación de auth
    setTimeout(initializeAuth, 1000);
    
    // ==================== OTHER FUNCTIONALITY ====================
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Plan selection
    const planCards = document.querySelectorAll('.plan-card');
    planCards.forEach(card => {
        card.addEventListener('click', function() {
            planCards.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
    
    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Enviando...';
            submitBtn.disabled = true;
            
            // Simulate form submission
            setTimeout(() => {
                showNotification('¡Mensaje enviado! Te contactaremos pronto.', 'success');
                contactForm.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 1500);
        });
    }
    
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initializeMain);

// También exportar para inicialización manual
// Asegurarse de que esté disponible globalmente de múltiples formas
if (typeof window !== 'undefined') {
    // Asignar a window (scope global)
    window.initializeMain = initializeMain;
    
    // También asignar a globalThis para mayor compatibilidad
    if (typeof globalThis !== 'undefined') {
        globalThis.initializeMain = initializeMain;
    }
    
    
    // Si ya estamos después de DOMContentLoaded, inicializar ahora
    if (document.readyState === 'loading') {
        // DOM aún cargando, esperar a DOMContentLoaded
        console.log('⏳ DOM aún cargando, esperando DOMContentLoaded...');
    } else {
        // DOM ya cargado, inicializar ahora
        setTimeout(() => {
            try {
                initializeMain();
            } catch (error) {
                console.error('❌ Error auto-inicializando Main System:', error);
            }
        }, 100);
    }
}