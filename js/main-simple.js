// Main UI Simple - Interfaz de usuario simplificada
// Versión: 1.0.0 - Enfoque en funcionalidad básica

class MainUISimple {
    constructor() {
        console.log('🏠 Main UI Simple inicializando...');
        
        this.eventBus = window.eventBus;
        this.authSystem = window.barraboxAuth;
        
        // Estado
        this.isInitialized = false;
        this.uiElements = {
            hamburger: null,
            navMenu: null,
            loginBtn: null,
            loginModal: null
        };
        
        this.initialize();
    }
    
    initialize() {
        console.log('⚙️ Configurando Main UI Simple...');
        
        // Esperar a que Auth System esté listo
        this.eventBus.on(this.eventBus.SYSTEM_EVENTS.AUTH_LOADED, () => {
            this.setupUI();
        });
        
        // Timeout por si Auth System nunca carga
        setTimeout(() => {
            if (!this.isInitialized) {
                console.warn('⚠️ Main UI no pudo inicializar con Auth System, configurando UI básica...');
                this.setupUI();
            }
        }, 3000);
    }
    
    setupUI() {
        console.log('🖼️ Configurando elementos de UI...');
        
        // 1. Menú hamburguesa
        this.setupHamburgerMenu();
        
        // 2. Modal de login
        this.setupLoginModal();
        
        // 3. Actualizar UI basado en estado de autenticación
        this.updateAuthUI();
        
        // 4. Escuchar cambios de autenticación
        this.setupAuthListeners();
        
        this.isInitialized = true;
        console.log('✅ Main UI Simple inicializado');
        
        // Emitir evento
        this.eventBus.emit('ui:ready', { component: 'main-ui' });
    }
    
    setupHamburgerMenu() {
        console.log('🍔 Configurando menú hamburguesa...');
        
        this.uiElements.hamburger = document.querySelector('.hamburger');
        this.uiElements.navMenu = document.querySelector('.nav-menu');
        
        if (!this.uiElements.hamburger || !this.uiElements.navMenu) {
            console.warn('⚠️ No se encontraron elementos del menú hamburguesa');
            return false;
        }
        
        // Configurar evento click
        this.uiElements.hamburger.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleMenu();
        });
        
        // Cerrar menú al hacer click fuera
        document.addEventListener('click', (e) => {
            if (this.uiElements.navMenu.classList.contains('active') &&
                !this.uiElements.hamburger.contains(e.target) &&
                !this.uiElements.navMenu.contains(e.target)) {
                this.closeMenu();
            }
        });
        
        // Cerrar menú al presionar Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.uiElements.navMenu.classList.contains('active')) {
                this.closeMenu();
            }
        });
        
        console.log('✅ Menú hamburguesa configurado');
        return true;
    }
    
    setupLoginModal() {
        console.log('🔐 Configurando modal de login...');
        
        this.uiElements.loginBtn = document.querySelector('.btn-login');
        this.uiElements.loginModal = document.getElementById('loginModal');
        
        if (!this.uiElements.loginBtn || !this.uiElements.loginModal) {
            console.warn('⚠️ No se encontraron elementos del modal de login');
            return false;
        }
        
        // Botón para abrir modal
        this.uiElements.loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.openLoginModal();
        });
        
        // Botón para cerrar modal
        const closeBtn = this.uiElements.loginModal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeLoginModal();
            });
        }
        
        // Cerrar modal al hacer click fuera
        this.uiElements.loginModal.addEventListener('click', (e) => {
            if (e.target === this.uiElements.loginModal) {
                this.closeLoginModal();
            }
        });
        
        // Cerrar modal con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.uiElements.loginModal.style.display === 'flex') {
                this.closeLoginModal();
            }
        });
        
        // Configurar formularios de login/registro
        this.setupLoginForms();
        
        console.log('✅ Modal de login configurado');
        return true;
    }
    
    setupLoginForms() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        
        // Formulario de login
        if (loginForm && this.authSystem) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const email = loginForm.querySelector('input[type="email"]').value;
                const password = loginForm.querySelector('input[type="password"]').value;
                const rememberMe = loginForm.querySelector('input[type="checkbox"]')?.checked || false;
                
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                
                // Mostrar loading
                submitBtn.textContent = 'Iniciando sesión...';
                submitBtn.disabled = true;
                
                try {
                    const result = await this.authSystem.login(email, password, rememberMe);
                    
                    if (result.success) {
                        console.log('✅ Login exitoso desde formulario');
                        this.showNotification('¡Sesión iniciada correctamente!', 'success');
                        this.closeLoginModal();
                        this.updateAuthUI();
                    } else {
                        throw new Error(result.message || 'Error en login');
                    }
                    
                } catch (error) {
                    console.error('❌ Error en login:', error);
                    this.showNotification(error.message || 'Error al iniciar sesión', 'error');
                    
                } finally {
                    // Restaurar botón
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            });
        }
        
        // Formulario de registro
        if (registerForm && this.authSystem) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const email = registerForm.querySelector('input[type="email"]').value;
                const password = registerForm.querySelectorAll('input[type="password"]')[0].value;
                const confirmPassword = registerForm.querySelectorAll('input[type="password"]')[1].value;
                const name = registerForm.querySelector('input[type="text"]')?.value || '';
                
                // Validar contraseñas
                if (password !== confirmPassword) {
                    this.showNotification('Las contraseñas no coinciden', 'error');
                    return;
                }
                
                const submitBtn = registerForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                
                // Mostrar loading
                submitBtn.textContent = 'Registrando...';
                submitBtn.disabled = true;
                
                try {
                    const result = await this.authSystem.register({
                        email,
                        password,
                        name
                    });
                    
                    if (result.success) {
                        console.log('✅ Registro exitoso desde formulario');
                        this.showNotification('¡Cuenta creada correctamente!', 'success');
                        this.closeLoginModal();
                        this.updateAuthUI();
                    } else {
                        throw new Error(result.message || 'Error en registro');
                    }
                    
                } catch (error) {
                    console.error('❌ Error en registro:', error);
                    this.showNotification(error.message || 'Error al crear cuenta', 'error');
                    
                } finally {
                    // Restaurar botón
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            });
        }
        
        // Tabs de login/registro
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        if (tabBtns.length > 0 && tabContents.length > 0) {
            tabBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const tabId = btn.getAttribute('data-tab');
                    
                    // Actualizar botones activos
                    tabBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    // Mostrar contenido activo
                    tabContents.forEach(content => {
                        content.classList.remove('active');
                        if (content.id === `${tabId}Tab`) {
                            content.classList.add('active');
                        }
                    });
                });
            });
        }
    }
    
    setupAuthListeners() {
        if (!this.authSystem) return;
        
        // Escuchar eventos de login/logout
        this.eventBus.on(this.eventBus.SYSTEM_EVENTS.USER_LOGIN, () => {
            console.log('🔄 Usuario hizo login, actualizando UI...');
            this.updateAuthUI();
        });
        
        this.eventBus.on(this.eventBus.SYSTEM_EVENTS.USER_LOGOUT, () => {
            console.log('🔄 Usuario hizo logout, actualizando UI...');
            this.updateAuthUI();
        });
    }
    
    updateAuthUI() {
        if (!this.authSystem) return;
        
        const isLoggedIn = this.authSystem.isLoggedIn();
        const currentUser = this.authSystem.getCurrentUser();
        
        console.log('🎨 Actualizando UI de autenticación:', {
            isLoggedIn,
            user: currentUser?.email
        });
        
        // Actualizar botón de login
        if (this.uiElements.loginBtn) {
            if (isLoggedIn && currentUser) {
                this.uiElements.loginBtn.textContent = `👤 ${currentUser.name || currentUser.email.split('@')[0]}`;
                this.uiElements.loginBtn.title = 'Mi cuenta';
            } else {
                this.uiElements.loginBtn.textContent = 'Iniciar Sesión';
                this.uiElements.loginBtn.title = 'Iniciar Sesión';
            }
        }
        
        // Actualizar enlaces en el menú (si existen)
        const loginMenuItems = document.querySelectorAll('.nav-menu a[href="#login"]');
        loginMenuItems.forEach(item => {
            if (isLoggedIn && currentUser) {
                item.textContent = `👤 ${currentUser.name || 'Mi Cuenta'}`;
            } else {
                item.textContent = 'Iniciar Sesión';
            }
        });
    }
    
    // Métodos de control de UI
    
    toggleMenu() {
        if (!this.uiElements.navMenu || !this.uiElements.hamburger) return;
        
        const isOpening = !this.uiElements.navMenu.classList.contains('active');
        
        this.uiElements.navMenu.classList.toggle('active');
        
        // Actualizar icono
        this.uiElements.hamburger.innerHTML = this.uiElements.navMenu.classList.contains('active') 
            ? '<i class="fas fa-times"></i>' 
            : '<i class="fas fa-bars"></i>';
        
        // Bloquear/desbloquear scroll del body
        document.body.style.overflow = this.uiElements.navMenu.classList.contains('active') 
            ? 'hidden' 
            : '';
        
        // Emitir evento
        this.eventBus.emit(this.eventBus.SYSTEM_EVENTS.MENU_TOGGLE, {
            isOpen: this.uiElements.navMenu.classList.contains('active')
        });
        
        console.log(`🍔 Menú ${isOpening ? 'abierto' : 'cerrado'}`);
    }
    
    openMenu() {
        if (this.uiElements.navMenu && !this.uiElements.navMenu.classList.contains('active')) {
            this.toggleMenu();
        }
    }
    
    closeMenu() {
        if (this.uiElements.navMenu && this.uiElements.navMenu.classList.contains('active')) {
            this.toggleMenu();
        }
    }
    
    openLoginModal() {
        if (!this.uiElements.loginModal) return;
        
        this.uiElements.loginModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Cerrar menú hamburguesa si está abierto
        this.closeMenu();
        
        // Emitir evento
        this.eventBus.emit(this.eventBus.SYSTEM_EVENTS.LOGIN_OPEN);
        
        console.log('🔐 Modal de login abierto');
    }
    
    closeLoginModal() {
        if (!this.uiElements.loginModal) return;
        
        this.uiElements.loginModal.style.display = 'none';
        document.body.style.overflow = '';
        
        // Limpiar formularios
        const forms = this.uiElements.loginModal.querySelectorAll('form');
        forms.forEach(form => form.reset());
        
        // Emitir evento
        this.eventBus.emit(this.eventBus.SYSTEM_EVENTS.LOGIN_CLOSE);
        
        console.log('🔐 Modal de login cerrado');
    }
    
    showNotification(message, type = 'info') {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Estilos básicos
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: 'var(--border-radius-lg)',
            backgroundColor: type === 'error' ? 'var(--color-error)' : 
                           type === 'success' ? 'var(--color-success)' : 
                           'var(--color-info)',
            color: 'white',
            zIndex: 9999,
            boxShadow: 'var(--shadow-lg)',
            animation: 'fadeIn 0.3s var(--ease-smooth)'
        });
        
        document.body.appendChild(notification);
        
        // Auto-remover después de 3 segundos
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s var(--ease-smooth)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
        
        console.log(`📢 Notificación (${type}):`, message);
    }
    
    // Métodos de utilidad
    
    getUIStatus() {
        return {
            isInitialized: this.isInitialized,
            hamburger: !!this.uiElements.hamburger,
            navMenu: !!this.uiElements.navMenu,
            loginBtn: !!this.uiElements.loginBtn,
            loginModal: !!this.uiElements.loginModal,
            authSystem: !!this.authSystem
        };
    }
}

// Crear instancia global
if (typeof window !== 'undefined') {
    window.mainUISimple = new MainUISimple();
    
    // También hacer disponible para compatibilidad
    window.initializeMain = () => {
        console.log('🔄 initializeMain llamado (compatibilidad)');
        if (window.mainUISimple && !window.mainUISimple.isInitialized) {
            window.mainUISimple.setupUI();
        }
    };
    
    console.log('🏠 Main UI Simple disponible como window.mainUISimple');
}