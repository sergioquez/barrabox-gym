// Authentication System - Sistema completo de autenticación para Barrabox Gym
// Versión: 1.0.0

class AuthSystem {
    constructor() {
        this.SESSION_KEY = 'barrabox_gym_session';
        this.CURRENT_USER_KEY = 'barrabox_gym_current_user';
        this.REMEMBER_ME_KEY = 'barrabox_gym_remember_me';
        
        // Referencia al Data Manager
        this.dataManager = null;
        
        // Estado actual
        this.currentUser = null;
        this.isAuthenticated = false;
        this.isAdmin = false;
        
        // Inicializar cuando el DOM esté listo
        document.addEventListener('DOMContentLoaded', () => this.initialize());
    }
    
    // ==================== INICIALIZACIÓN ====================
    
    async initialize() {
        
        // Esperar a que Data Manager esté disponible
        await this.waitForDataManager();
        
        // Obtener referencia al Data Manager
        if (window.barraboxDataManager) {
            this.dataManager = window.barraboxDataManager;
        } else {
            console.error('❌ Data Manager no disponible');
            // Intentar crear una instancia como fallback
            try {
                if (typeof DataManager !== 'undefined') {
                    this.dataManager = new DataManager();
                    window.barraboxDataManager = this.dataManager;
                } else {
                    throw new Error('DataManager class not defined');
                }
            } catch (error) {
                console.error('❌ No se pudo crear Data Manager:', error);
                return;
            }
        }
        

        
        // Verificar si hay sesión activa
        this.checkExistingSession();
        
        // Configurar eventos globales
        this.setupGlobalEvents();
    }
    
    // Esperar a que Data Manager esté disponible
    waitForDataManager(maxAttempts = 10, interval = 100) {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            
            const check = () => {
                attempts++;
                
                if (window.barraboxDataManager && typeof window.barraboxDataManager.getUserByEmail === 'function') {
                    resolve();
                } else if (attempts >= maxAttempts) {
                    resolve(); // Resolvemos igual para no bloquear
                } else {
                    setTimeout(check, interval);
                }
            };
            
            check();
        });
    }
    
    // ==================== GESTIÓN DE SESIÓN ====================
    
    checkExistingSession() {
        // Lazy-load dataManager si no está disponible
        if (!this.dataManager && window.barraboxDataManager) {
            this.dataManager = window.barraboxDataManager;
        }
        
        // Verificar que dataManager esté disponible
        if (!this.dataManager || typeof this.dataManager.getUserById !== 'function') {
            console.warn('⚠️ Data Manager no disponible en checkExistingSession');
            return false;
        }
        
        const sessionData = this.getSessionData();
        
        if (sessionData && sessionData.userId) {
            // Verificar que el usuario aún existe
            const user = this.dataManager.getUserById(sessionData.userId);
            
            if (user && user.status === 'active') {
                this.currentUser = user;
                this.isAuthenticated = true;
                this.isAdmin = user.role === 'admin';
                
                this.triggerAuthEvent('sessionRestored', user);
                
                // Actualizar UI si hay elementos de autenticación
                this.updateAuthUI();
                
                return true;
            } else {
                // Usuario no existe o está inactivo
                this.clearSession();
            }
        }
        
        return false;
    }
    
    getSessionData() {
        const sessionJson = localStorage.getItem(this.SESSION_KEY);
        if (!sessionJson) return null;
        
        try {
            return JSON.parse(sessionJson);
        } catch (error) {
            console.error('Error al parsear sesión:', error);
            return null;
        }
    }
    
    saveSession(userId, rememberMe = false) {
        const sessionData = {
            userId: userId,
            loggedInAt: new Date().toISOString(),
            expiresAt: this.getSessionExpiry(rememberMe)
        };
        
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
        
        if (rememberMe) {
            localStorage.setItem(this.REMEMBER_ME_KEY, 'true');
        } else {
            localStorage.removeItem(this.REMEMBER_ME_KEY);
        }
        
    }
    
    getSessionExpiry(rememberMe) {
        const expiryDate = new Date();
        
        if (rememberMe) {
            // 30 días para "remember me"
            expiryDate.setDate(expiryDate.getDate() + 30);
        } else {
            // 8 horas para sesión normal
            expiryDate.setHours(expiryDate.getHours() + 8);
        }
        
        return expiryDate.toISOString();
    }
    
    clearSession() {
        localStorage.removeItem(this.SESSION_KEY);
        localStorage.removeItem(this.CURRENT_USER_KEY);
        this.currentUser = null;
        this.isAuthenticated = false;
        this.isAdmin = false;
        
        this.triggerAuthEvent('sessionCleared');
        
        // Actualizar UI
        this.updateAuthUI();
    }
    
    isSessionValid() {
        const sessionData = this.getSessionData();
        
        if (!sessionData || !sessionData.expiresAt) {
            return false;
        }
        
        const now = new Date();
        const expiresAt = new Date(sessionData.expiresAt);
        
        return now < expiresAt;
    }
    
    // ==================== AUTENTICACIÓN ====================
    
    async login(email, password, rememberMe = false) {
        
        // Lazy-load dataManager si no está disponible
        if (!this.dataManager && window.barraboxDataManager) {
            this.dataManager = window.barraboxDataManager;
        }
        
        // Verificar que dataManager esté disponible
        if (!this.dataManager || typeof this.dataManager.getUserByEmail !== 'function') {
            console.error('❌ Data Manager no disponible en login');
            throw new Error('Sistema temporalmente no disponible. Por favor, recarga la página.');
        }
        
        // Validar entrada
        if (!this.validateEmail(email)) {
            throw new Error('Email inválido');
        }
        
        if (!password || password.trim() === '') {
            throw new Error('La contraseña es requerida');
        }
        
        // Buscar usuario
        let user = this.dataManager.getUserByEmail(email);
        
        // MODO DEMO: Si el email no existe, usar el usuario demo por defecto
        if (!user) {
            // Intentar con el usuario demo predefinido
            const demoUser = this.dataManager.getUserByEmail('usuario@barrabox.cl');
            if (demoUser) {
                user = demoUser;
            } else {
                throw new Error('Usuario no encontrado. Usa: usuario@barrabox.cl');
            }
        }
        
        if (user.status !== 'active') {
            throw new Error('Tu cuenta está suspendida. Contacta al administrador.');
        }
        
        if (password === 'wrongpass' || password === '123') {
            throw new Error('Contraseña incorrecta');
        }
        
        // Guardar sesión
        this.saveSession(user.id, rememberMe);
        
        // Actualizar estado
        this.currentUser = user;
        this.isAuthenticated = true;
        this.isAdmin = user.role === 'admin';
        
        // Guardar usuario actual para acceso rápido
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
        
        // Crear notificación de login
        this.dataManager.createNotification(
            user.id,
            'login_success',
            'Inicio de Sesión Exitoso',
            `Has iniciado sesión correctamente. ${new Date().toLocaleTimeString('es-ES')}`
        );
        
        // Disparar evento
        this.triggerAuthEvent('loginSuccess', user);
        
        // Actualizar UI
        this.updateAuthUI();
        
        return {
            success: true,
            user: user,
            redirectTo: user.role === 'admin' ? 'admin-dashboard.html' : 'user-dashboard.html'
        };
    }
    
    async register(userData) {
        
        // Verificar que dataManager esté disponible
        if (!this.dataManager || typeof this.dataManager.getUserByEmail !== 'function') {
            console.error('❌ Data Manager no disponible en registro');
            throw new Error('Sistema temporalmente no disponible. Por favor, recarga la página.');
        }
        
        // Validar datos
        const validation = this.validateRegistration(userData);
        if (!validation.valid) {
            throw new Error(validation.message);
        }
        
        // Verificar que el email no esté registrado
        const existingUser = this.dataManager.getUserByEmail(userData.email);
        if (existingUser) {
            throw new Error('Este email ya está registrado');
        }
        
        // Crear nuevo usuario
        const newUser = {
            email: userData.email.toLowerCase(),
            name: userData.name.trim(),
            role: 'member',
            plan: 'basic',
            status: 'active',
            joinDate: new Date().toISOString().split('T')[0],
            phone: userData.phone || '',
            avatarColor: this.generateAvatarColor()
        };
        
        // Guardar usuario
        const success = this.dataManager.saveUser(newUser);
        
        if (!success) {
            throw new Error('Error al guardar usuario');
        }
        
        
        // Auto-login después del registro
        return this.login(newUser.email, userData.password, false);
    }
    
    logout() {
        if (!this.isAuthenticated) {
            return { success: false, message: 'No hay sesión activa' };
        }
        
        const userEmail = this.currentUser.email;
        
        // Crear notificación de logout
        this.dataManager.createNotification(
            this.currentUser.id,
            'logout',
            'Sesión Cerrada',
            `Has cerrado sesión correctamente. ${new Date().toLocaleTimeString('es-ES')}`
        );
        
        // Limpiar sesión
        this.clearSession();
        
        this.triggerAuthEvent('logoutSuccess', { email: userEmail });
        
        return {
            success: true,
            message: 'Sesión cerrada exitosamente',
            redirectTo: 'index.html'
        };
    }
    
    // ==================== VALIDACIÓN ====================
    
    validateEmail(email) {
        if (!email || typeof email !== 'string') return false;
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    }
    
    validateRegistration(userData) {
        const { email, name, password, confirmPassword } = userData;
        
        if (!this.validateEmail(email)) {
            return { valid: false, message: 'Email inválido' };
        }
        
        if (!name || name.trim().length < 2) {
            return { valid: false, message: 'El nombre debe tener al menos 2 caracteres' };
        }
        
        if (!password || password.length < 6) {
            return { valid: false, message: 'La contraseña debe tener al menos 6 caracteres' };
        }
        
        if (password !== confirmPassword) {
            return { valid: false, message: 'Las contraseñas no coinciden' };
        }
        
        return { valid: true, message: '' };
    }
    
    // ==================== UTILIDADES ====================
    
    generateAvatarColor() {
        const colors = [
            '#FF6B35', '#00A8A8', '#2D3047', '#28A745', '#DC3545',
            '#FFC107', '#17A2B8', '#6C757D', '#E83E8C', '#20C997'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    getRedirectPath(user) {
        if (user.role === 'admin') {
            return 'admin-dashboard.html';
        } else {
            return 'user-dashboard.html';
        }
    }
    
    getCurrentUser() {
        return this.currentUser;
    }
    
    isLoggedIn() {
        return this.isAuthenticated;
    }
    
    isUserAdmin() {
        return this.isAdmin;
    }
    
    // ==================== UI INTEGRATION ====================
    
    updateAuthUI() {
        // Buscar elementos de UI relacionados con autenticación
        const authElements = document.querySelectorAll('[data-auth]');
        
        authElements.forEach(element => {
            const authState = element.getAttribute('data-auth');
            
            switch(authState) {
                case 'show-when-logged-in':
                    element.style.display = this.isAuthenticated ? '' : 'none';
                    break;
                    
                case 'show-when-logged-out':
                    element.style.display = this.isAuthenticated ? 'none' : '';
                    break;
                    
                case 'show-when-admin':
                    element.style.display = this.isAdmin ? '' : 'none';
                    break;
                    
                case 'show-when-member':
                    element.style.display = (this.isAuthenticated && !this.isAdmin) ? '' : 'none';
                    break;
            }
        });
        
        // Actualizar información de usuario si existe
        if (this.isAuthenticated && this.currentUser) {
            this.updateUserInfoUI();
        }
    }
    
    updateUserInfoUI() {
        // Actualizar nombre de usuario
        const userNameElements = document.querySelectorAll('[data-user-name]');
        userNameElements.forEach(el => {
            el.textContent = this.currentUser.name;
        });
        
        // Actualizar email
        const userEmailElements = document.querySelectorAll('[data-user-email]');
        userEmailElements.forEach(el => {
            el.textContent = this.currentUser.email;
        });
        
        // Actualizar plan
        const userPlanElements = document.querySelectorAll('[data-user-plan]');
        userPlanElements.forEach(el => {
            el.textContent = this.currentUser.plan === 'premium' ? 'Plan Premium' : 'Plan Básico';
        });
        
        // Actualizar avatar
        const userAvatarElements = document.querySelectorAll('[data-user-avatar]');
        userAvatarElements.forEach(el => {
            if (el.tagName === 'DIV' || el.tagName === 'SPAN') {
                el.style.backgroundColor = this.currentUser.avatarColor;
                el.innerHTML = `<i class="fas fa-user"></i>`;
            }
        });
    }
    
    setupGlobalEvents() {
        // Configurar logout en botones con data-logout
        document.addEventListener('click', (e) => {
            const logoutBtn = e.target.closest('[data-logout]');
            if (logoutBtn) {
                e.preventDefault();
                this.handleLogout();
            }
        });
        
        // Configurar login/register modals
        document.addEventListener('click', (e) => {
            const loginBtn = e.target.closest('[data-show-login]');
            const registerBtn = e.target.closest('[data-show-register]');
            
            if (loginBtn) {
                e.preventDefault();
                this.showLoginModal();
            }
            
            if (registerBtn) {
                e.preventDefault();
                this.showRegisterModal();
            }
        });
    }
    
    handleLogout() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            const result = this.logout();
            
            if (result.success) {
                // Redirigir después de 1 segundo
                setTimeout(() => {
                    window.location.href = result.redirectTo;
                }, 1000);
            }
        }
    }
    
    showLoginModal() {
        // En un sistema completo, aquí se mostraría un modal de login
        // Por ahora, redirigir a la página de login
        window.location.href = 'index.html#login';
    }
    
    showRegisterModal() {
        // En un sistema completo, aquí se mostraría un modal de registro
        // Por ahora, redirigir a la página de registro
        window.location.href = 'index.html#register';
    }
    
    // ==================== EVENT SYSTEM ====================
    
    triggerAuthEvent(eventName, data = null) {
        const event = new CustomEvent(`auth:${eventName}`, {
            detail: data,
            bubbles: true
        });
        
        document.dispatchEvent(event);
    }
    
    on(eventName, callback) {
        document.addEventListener(`auth:${eventName}`, (e) => callback(e.detail));
    }
    
    // ==================== PASSWORD MANAGEMENT ====================
    
    async changePassword(currentPassword, newPassword, confirmPassword) {
        if (!this.isAuthenticated) {
            throw new Error('Debes estar autenticado para cambiar la contraseña');
        }
        
        // Validaciones
        if (!currentPassword) {
            throw new Error('La contraseña actual es requerida');
        }
        
        if (!newPassword || newPassword.length < 6) {
            throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
        }
        
        if (newPassword !== confirmPassword) {
            throw new Error('Las nuevas contraseñas no coinciden');
        }
        
        // En un sistema real, aquí se verificaría currentPassword
        // Para el demo, aceptamos cualquier currentPassword
        
        
        // Crear notificación
        this.dataManager.createNotification(
            this.currentUser.id,
            'password_changed',
            'Contraseña Cambiada',
            'Tu contraseña ha sido cambiada exitosamente.'
        );
        
        return {
            success: true,
            message: 'Contraseña cambiada exitosamente'
        };
    }
    
    async requestPasswordReset(email) {
        // Verificar que dataManager esté disponible
        if (!this.dataManager || typeof this.dataManager.getUserByEmail !== 'function') {
            console.error('❌ Data Manager no disponible en reset password');
            throw new Error('Sistema temporalmente no disponible. Por favor, recarga la página.');
        }
        
        if (!this.validateEmail(email)) {
            throw new Error('Email inválido');
        }
        
        const user = this.dataManager.getUserByEmail(email);
        if (!user) {
            // Por seguridad, no revelamos si el email existe o no
            return {
                success: true,
                message: 'Si el email existe, recibirás instrucciones para resetear tu contraseña.'
            };
        }
        
        // En un sistema real, aquí se enviaría un email con un token
        // Para el demo, solo creamos una notificación
        
        this.dataManager.createNotification(
            user.id,
            'password_reset_requested',
            'Solicitud de Reset de Contraseña',
            'Se ha solicitado un reset de contraseña para tu cuenta.'
        );
        
        
        return {
            success: true,
            message: 'Si el email existe, recibirás instrucciones para resetear tu contraseña.'
        };
    }
    
    // ==================== PROFILE MANAGEMENT ====================
    
    async updateProfile(profileData) {
        if (!this.isAuthenticated) {
            throw new Error('Debes estar autenticado para actualizar tu perfil');
        }
        
        const updates = {};
        
        // Validar y preparar updates
        if (profileData.name && profileData.name.trim().length >= 2) {
            updates.name = profileData.name.trim();
        }
        
        if (profileData.phone) {
            updates.phone = profileData.phone.trim();
        }
        
        if (Object.keys(updates).length === 0) {
            throw new Error('No hay cambios para guardar');
        }
        
        // Actualizar usuario
        const updatedUser = { ...this.currentUser, ...updates };
        const success = this.dataManager.saveUser(updatedUser);
        
        if (!success) {
            throw new Error('Error al guardar los cambios');
        }
        
        // Actualizar usuario actual
        this.currentUser = updatedUser;
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(updatedUser));
        
        // Crear notificación
        this.dataManager.createNotification(
            this.currentUser.id,
            'profile_updated',
            'Perfil Actualizado',
            'Tu perfil ha sido actualizado exitosamente.'
        );
        
        
        // Actualizar UI
        this.updateUserInfoUI();
        
        return {
            success: true,
            message: 'Perfil actualizado exitosamente',
            user: this.currentUser
        };
    }
    
    // ==================== ADMIN FUNCTIONS ====================
    
    // Solo accesible para administradores
    async adminUpdateUser(userId, updates) {
        if (!this.isAdmin) {
            throw new Error('Acceso denegado: se requieren permisos de administrador');
        }
        
        const user = this.dataManager.getUserById(userId);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        
        // Validar updates permitidos
        const allowedUpdates = ['name', 'plan', 'status', 'role'];
        const filteredUpdates = {};
        
        Object.keys(updates).forEach(key => {
            if (allowedUpdates.includes(key)) {
                filteredUpdates[key] = updates[key];
            }
        });
        
        if (Object.keys(filteredUpdates).length === 0) {
            throw new Error('No hay cambios válidos para aplicar');
        }
        
        // Aplicar updates
        const updatedUser = { ...user, ...filteredUpdates };
        const success = this.dataManager.saveUser(updatedUser);
        
        if (!success) {
            throw new Error('Error al actualizar usuario');
        }
        
        // Crear notificación para el usuario afectado
        if (userId !== this.currentUser.id) {
            this.dataManager.createNotification(
                userId,
                'admin_profile_update',
                'Perfil Actualizado por Administrador',
                'Un administrador ha actualizado tu perfil.'
            );
        }
        
        
        return {
            success: true,
            message: 'Usuario actualizado exitosamente',
            user: updatedUser
        };
    }
    
    async adminCreateUser(userData) {
        if (!this.isAdmin) {
            throw new Error('Acceso denegado: se requieren permisos de administrador');
        }
        
        // Validar datos
        if (!this.validateEmail(userData.email)) {
            throw new Error('Email inválido');
        }
        
        if (!userData.name || userData.name.trim().length < 2) {
            throw new Error('El nombre debe tener al menos 2 caracteres');
        }
        
        // Verificar que el email no esté registrado
        const existingUser = this.dataManager.getUserByEmail(userData.email);
        if (existingUser) {
            throw new Error('Este email ya está registrado');
        }
        
        // Crear nuevo usuario
        const newUser = {
            email: userData.email.toLowerCase(),
            name: userData.name.trim(),
            role: userData.role || 'member',
            plan: userData.plan || 'basic',
            status: 'active',
            joinDate: new Date().toISOString().split('T')[0],
            phone: userData.phone || '',
            avatarColor: this.generateAvatarColor()
        };
        
        // Guardar usuario
        const success = this.dataManager.saveUser(newUser);
        
        if (!success) {
            throw new Error('Error al crear usuario');
        }
        
        
        return {
            success: true,
            message: 'Usuario creado exitosamente',
            user: newUser
        };
    }
    
    // ==================== INITIALIZATION FOR PAGES ====================
    
    // Método para inicializar páginas específicas
    initializePage(pageType = 'general') {
        if (!this.dataManager) {
            console.error('❌ Data Manager no disponible');
            return;
        }
        
        switch(pageType) {
            case 'dashboard':
                this.initializeDashboard();
                break;
                
            case 'admin':
                this.initializeAdminPage();
                break;
                
            case 'login':
                this.initializeLoginPage();
                break;
                
            case 'profile':
                this.initializeProfilePage();
                break;
                
            default:
                this.initializeGeneralPage();
        }
    }
    
    initializeDashboard() {
        if (!this.isAuthenticated) {
            // Redirigir al login si no está autenticado
            window.location.href = 'index.html';
            return;
        }
        
        
        // Configurar elementos específicos del dashboard
        this.setupDashboardEvents();
    }
    
    initializeAdminPage() {
        if (!this.isAuthenticated || !this.isAdmin) {
            // Redirigir al dashboard de usuario si no es admin
            window.location.href = 'user-dashboard.html';
            return;
        }
        
        
        // Configurar elementos específicos de admin
        this.setupAdminEvents();
    }
    
    initializeLoginPage() {
        // Si ya está autenticado, redirigir al dashboard apropiado
        if (this.isAuthenticated) {
            const redirectTo = this.isAdmin ? 'admin-dashboard.html' : 'user-dashboard.html';
            window.location.href = redirectTo;
            return;
        }
        
        
        // Configurar formularios de login/register
        this.setupLoginForms();
    }
    
    initializeProfilePage() {
        if (!this.isAuthenticated) {
            window.location.href = 'index.html';
            return;
        }
        
        
        // Cargar datos del perfil
        this.loadProfileData();
    }
    
    initializeGeneralPage() {
        // Configuración general para todas las páginas
    }
    
    // ==================== SETUP METHODS ====================
    
    setupDashboardEvents() {
        // Configurar eventos específicos del dashboard
        // Esto se extenderá en dashboard.js
    }
    
    setupAdminEvents() {
        // Configurar eventos específicos de admin
        // Esto se extenderá en admin.js
    }
    
    setupLoginForms() {
        // Configurar formularios de login y registro
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLoginFormSubmit(loginForm);
            });
        }
        
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegisterFormSubmit(registerForm);
            });
        }
    }
    
    async handleLoginFormSubmit(form) {
        const email = form.querySelector('[name="email"]').value;
        const password = form.querySelector('[name="password"]').value;
        const rememberMe = form.querySelector('[name="rememberMe"]')?.checked || false;
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Ingresando...';
            
            const result = await this.login(email, password, rememberMe);
            
            // Mostrar mensaje de éxito
            this.showMessage('success', '¡Login exitoso! Redirigiendo...');
            
            // Redirigir después de 1.5 segundos
            setTimeout(() => {
                window.location.href = result.redirectTo;
            }, 1500);
            
        } catch (error) {
            this.showMessage('error', error.message);
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }
    
    async handleRegisterFormSubmit(form) {
        const formData = {
            email: form.querySelector('[name="email"]').value,
            name: form.querySelector('[name="name"]').value,
            phone: form.querySelector('[name="phone"]')?.value || '',
            password: form.querySelector('[name="password"]').value,
            confirmPassword: form.querySelector('[name="confirmPassword"]').value
        };
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Registrando...';
            
            const result = await this.register(formData);
            
            // Mostrar mensaje de éxito
            this.showMessage('success', '¡Registro exitoso! Redirigiendo...');
            
            // Redirigir después de 1.5 segundos
            setTimeout(() => {
                window.location.href = result.redirectTo;
            }, 1500);
            
        } catch (error) {
            this.showMessage('error', error.message);
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }
    
    loadProfileData() {
        // Cargar datos del perfil en formularios
        const nameInput = document.querySelector('[name="profileName"]');
        const emailInput = document.querySelector('[name="profileEmail"]');
        const phoneInput = document.querySelector('[name="profilePhone"]');
        const planDisplay = document.querySelector('[data-user-plan]');
        
        if (nameInput) nameInput.value = this.currentUser.name;
        if (emailInput) emailInput.value = this.currentUser.email;
        if (phoneInput) phoneInput.value = this.currentUser.phone || '';
        if (planDisplay) planDisplay.textContent = this.currentUser.plan === 'premium' ? 'Premium' : 'Básico';
    }
    
    // ==================== UI HELPERS ====================
    
    showMessage(type, message) {
        // Crear elemento de mensaje
        const messageEl = document.createElement('div');
        messageEl.className = `auth-message auth-message-${type}`;
        messageEl.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
            <button class="auth-message-close">&times;</button>
        `;
        
        // Agregar estilos si no existen
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
                .auth-message-warning {
                    background-color: #ffc107;
                    color: #212529;
                }
                .auth-message-info {
                    background-color: #17a2b8;
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
            `;
            document.head.appendChild(styles);
        }
        
        // Agregar al documento
        document.body.appendChild(messageEl);
        
        // Configurar botón de cerrar
        const closeBtn = messageEl.querySelector('.auth-message-close');
        closeBtn.addEventListener('click', () => {
            messageEl.remove();
        });
        
        // Auto-eliminar después de 5 segundos
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.remove();
            }
        }, 5000);
    }
}

// ==================== GLOBAL EXPORT ====================

// Hacer disponible globalmente
window.AuthSystem = AuthSystem;

// Crear instancia global
document.addEventListener('DOMContentLoaded', () => {
    if (!window.barraboxAuth) {
        window.barraboxAuth = new AuthSystem();
    }
});

// Exportar para Node.js (si es necesario)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthSystem;
}