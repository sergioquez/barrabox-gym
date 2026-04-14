// Auth System Simple - Autenticación simplificada
// Versión: 1.0.0 - Sin dependencias complejas

class AuthSystemSimple {
    constructor() {
        console.log('🔐 Auth System Simple inicializando...');
        
        this.eventBus = window.eventBus;
        this.dataManager = window.barraboxDataManager;
        
        // Keys de almacenamiento
        this.SESSION_KEY = 'barrabox_gym_session';
        this.CURRENT_USER_KEY = 'barrabox_gym_current_user';
        
        // Estado
        this.currentUser = null;
        this.isAuthenticated = false;
        this.isAdmin = false;
        this.isInitialized = false;
        
        this.initialize();
    }
    
    initialize() {
        console.log('⚙️ Configurando Auth System Simple...');
        
        // Verificar sesión existente
        this.checkExistingSession();
        
        // Escuchar eventos del sistema
        this.eventBus.on(this.eventBus.SYSTEM_EVENTS.DATA_LOADED, () => {
            this.isInitialized = true;
            console.log('✅ Auth System Simple inicializado con Data Manager');
            this.eventBus.emit(this.eventBus.SYSTEM_EVENTS.AUTH_LOADED, {
                isAuthenticated: this.isAuthenticated,
                user: this.currentUser
            });
        });
        
        // Si Data Manager ya está listo
        if (this.dataManager && this.dataManager.isInitialized) {
            setTimeout(() => {
                this.isInitialized = true;
                console.log('✅ Auth System Simple inicializado (Data Manager ya listo)');
                this.eventBus.emit(this.eventBus.SYSTEM_EVENTS.AUTH_LOADED);
            }, 100);
        }
        
        // Configurar timeout por si Data Manager nunca carga
        setTimeout(() => {
            if (!this.isInitialized) {
                console.warn('⚠️ Auth System no pudo inicializar con Data Manager, usando modo standalone');
                this.isInitialized = true;
                this.eventBus.emit(this.eventBus.SYSTEM_EVENTS.AUTH_LOADED);
            }
        }, 3000);
    }
    
    checkExistingSession() {
        try {
            const sessionData = localStorage.getItem(this.SESSION_KEY);
            const userData = localStorage.getItem(this.CURRENT_USER_KEY);
            
            if (sessionData && userData) {
                const session = JSON.parse(sessionData);
                const user = JSON.parse(userData);
                
                // Verificar que la sesión no haya expirado
                const now = Date.now();
                if (session.expiresAt && session.expiresAt > now) {
                    this.currentUser = user;
                    this.isAuthenticated = true;
                    this.isAdmin = user.role === 'admin';
                    
                    console.log('🔑 Sesión restaurada:', user.email);
                    return true;
                } else {
                    console.log('⏰ Sesión expirada, limpiando...');
                    this.clearSession();
                }
            }
        } catch (error) {
            console.error('❌ Error verificando sesión:', error);
            this.clearSession();
        }
        
        return false;
    }
    
    // Métodos principales
    
    async login(email, password, rememberMe = false) {
        console.log('🔐 Intentando login:', email);
        
        // Validaciones básicas
        if (!this.validateEmail(email)) {
            throw new Error('Email inválido');
        }
        
        if (!password || password.trim() === '') {
            throw new Error('La contraseña es requerida');
        }
        
        // Buscar usuario
        let user = null;
        
        if (this.dataManager && this.dataManager.getUserByEmail) {
            user = this.dataManager.getUserByEmail(email);
        }
        
        // Si no existe, crear usuario automáticamente (modo demo)
        if (!user) {
            console.log('👤 Usuario no encontrado, creando automáticamente (modo demo)...');
            
            user = {
                id: `user_${Date.now()}`,
                email: email,
                name: email.split('@')[0],
                role: 'member',
                status: 'active'
            };
            
            if (this.dataManager && this.dataManager.createUser) {
                user = this.dataManager.createUser(user);
            }
        }
        
        // Verificar estado del usuario
        if (user.status !== 'active') {
            throw new Error('Usuario inactivo');
        }
        
        // En modo simple, cualquier contraseña funciona
        console.log('✅ Login exitoso (modo simple):', email);
        
        // Establecer sesión
        this.setSession(user, rememberMe);
        
        // Emitir evento
        this.eventBus.emit(this.eventBus.SYSTEM_EVENTS.USER_LOGIN, { user });
        
        return {
            success: true,
            user: user,
            message: 'Login exitoso'
        };
    }
    
    async register(userData) {
        console.log('📝 Registrando nuevo usuario:', userData.email);
        
        // Validaciones
        if (!this.validateEmail(userData.email)) {
            throw new Error('Email inválido');
        }
        
        if (!userData.password || userData.password.trim() === '') {
            throw new Error('La contraseña es requerida');
        }
        
        if (userData.password.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres');
        }
        
        // Verificar que el email no esté registrado
        if (this.dataManager && this.dataManager.getUserByEmail) {
            const existingUser = this.dataManager.getUserByEmail(userData.email);
            if (existingUser) {
                throw new Error('Este email ya está registrado');
            }
        }
        
        // Crear usuario
        const user = {
            email: userData.email,
            name: userData.name || userData.email.split('@')[0],
            role: 'member',
            status: 'active'
        };
        
        let createdUser = user;
        
        if (this.dataManager && this.dataManager.createUser) {
            createdUser = this.dataManager.createUser(user);
        }
        
        console.log('✅ Usuario registrado:', createdUser.email);
        
        // Auto-login después de registro
        return this.login(userData.email, userData.password);
    }
    
    logout() {
        const userEmail = this.currentUser ? this.currentUser.email : 'unknown';
        
        console.log('👋 Cerrando sesión:', userEmail);
        
        // Limpiar sesión
        this.clearSession();
        
        // Emitir evento
        this.eventBus.emit(this.eventBus.SYSTEM_EVENTS.USER_LOGOUT, { email: userEmail });
        
        return {
            success: true,
            message: 'Sesión cerrada correctamente'
        };
    }
    
    // Métodos de sesión
    
    setSession(user, rememberMe = false) {
        const session = {
            userId: user.id,
            email: user.email,
            loggedInAt: Date.now(),
            expiresAt: rememberMe 
                ? Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 días
                : Date.now() + (24 * 60 * 60 * 1000) // 24 horas
        };
        
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
        
        this.currentUser = user;
        this.isAuthenticated = true;
        this.isAdmin = user.role === 'admin';
        
        console.log('🔐 Sesión establecida para:', user.email);
    }
    
    clearSession() {
        localStorage.removeItem(this.SESSION_KEY);
        localStorage.removeItem(this.CURRENT_USER_KEY);
        
        this.currentUser = null;
        this.isAuthenticated = false;
        this.isAdmin = false;
        
        console.log('🧹 Sesión limpiada');
    }
    
    // Métodos de utilidad
    
    validateEmail(email) {
        if (!email) return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    isLoggedIn() {
        return this.isAuthenticated;
    }
    
    getCurrentUser() {
        return this.currentUser;
    }
    
    isUserAdmin() {
        return this.isAdmin;
    }
    
    // Para compatibilidad con sistema antiguo
    getSystemInfo() {
        return {
            isInitialized: this.isInitialized,
            isAuthenticated: this.isAuthenticated,
            isAdmin: this.isAdmin,
            currentUser: this.currentUser ? {
                id: this.currentUser.id,
                email: this.currentUser.email,
                name: this.currentUser.name,
                role: this.currentUser.role
            } : null
        };
    }
}

// Crear instancia global
if (typeof window !== 'undefined') {
    window.authSystemSimple = new AuthSystemSimple();
    
    // También hacer disponible como barraboxAuth para compatibilidad
    window.barraboxAuth = window.authSystemSimple;
    
    console.log('🔐 Auth System Simple disponible como window.authSystemSimple y window.barraboxAuth');
}