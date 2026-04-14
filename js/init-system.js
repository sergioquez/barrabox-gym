// Initialization System - Asegura el orden correcto de carga de sistemas

class InitSystem {
    constructor() {
        this.systems = {
            dataManager: false,
            auth: false,
            calendar: false,
            booking: false,
            theme: false,
            waitlist: false,
            fase6: false
        };
        
        this.initialized = false;
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Initialization System iniciando...');
        
        try {
            // 1. Esperar a que el DOM esté listo
            await this.waitForDOM();
            
            // 2. Cargar Data Manager primero (si no está cargado)
            await this.loadDataManager();
            
            // 3. Cargar Auth System
            await this.loadAuthSystem();
            
            // 4. Cargar scripts específicos de la página
            await this.loadPageSpecificScripts();
            
            // 5. Cargar sistema de diagnóstico
            await this.loadDiagnosticSystem();
            
            // 6. Marcar como inicializado
            this.initialized = true;
            
            console.log('✅ Initialization System completado');
            console.log('📊 Sistemas cargados:', Object.keys(this.systems).filter(key => this.systems[key]));
            
            // Disparar evento
            this.dispatchEvent('init:complete', {
                systems: this.systems,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('❌ Error en Initialization System:', error);
            this.showError(error);
        }
    }
    
    // Esperar a que el DOM esté listo
    waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }
    
    // Cargar Data Manager
    async loadDataManager() {
        console.log('📊 Cargando Data Manager...');
        
        // Verificar si ya está cargado
        if (window.barraboxDataManager && typeof window.barraboxDataManager.getUserByEmail === 'function') {
            console.log('✅ Data Manager ya cargado');
            this.systems.dataManager = true;
            return;
        }
        
        // Intentar cargar el script
        try {
            console.log('📥 Intentando cargar: js/data-manager.js?v=5.0');
            await this.loadScript('js/data-manager.js?v=5.0');
            console.log('📦 Script data-manager.js cargado, esperando inicialización...');
            
            // Data Manager se inicializa en DOMContentLoaded, pero nosotros ya estamos después de DOMContentLoaded
            // Necesitamos inicializarlo manualmente si no se ha inicializado automáticamente
            if (!window.barraboxDataManager && typeof DataManager !== 'undefined') {
                console.log('⚡ Inicializando Data Manager manualmente...');
                window.barraboxDataManager = new DataManager();
            }
            
            // Esperar a que esté disponible
            await this.waitForCondition(() => {
                const isAvailable = window.barraboxDataManager && 
                                   typeof window.barraboxDataManager.getUserByEmail === 'function';
                if (!isAvailable) {
                    console.log('⏳ Esperando Data Manager...', {
                        exists: !!window.barraboxDataManager,
                        hasGetUserByEmail: window.barraboxDataManager ? 
                                          typeof window.barraboxDataManager.getUserByEmail : 'no dataManager',
                        DataManagerClass: typeof DataManager
                    });
                }
                return isAvailable;
            }, 5000, 100); // 5 segundos máximo, verificar cada 100ms
            
            this.systems.dataManager = true;
            console.log('✅ Data Manager cargado exitosamente');
            
        } catch (error) {
            console.error('❌ Error cargando Data Manager:', error);
            console.error('📊 Estado actual:', {
                barraboxDataManager: window.barraboxDataManager,
                hasGetUserByEmail: window.barraboxDataManager ? 
                                  typeof window.barraboxDataManager.getUserByEmail : 'no dataManager',
                DataManagerClass: typeof DataManager
            });
            
            // Intentar fallback: crear Data Manager manualmente
            try {
                console.log('🔄 Intentando fallback: crear Data Manager manualmente...');
                if (typeof DataManager !== 'undefined') {
                    window.barraboxDataManager = new DataManager();
                    this.systems.dataManager = true;
                    console.log('✅ Data Manager creado manualmente como fallback');
                    return;
                }
            } catch (fallbackError) {
                console.error('❌ Fallback también falló:', fallbackError);
            }
            
            // Último recurso: Data Manager de emergencia
            this.createEmergencyDataManager();
            
            // No lanzamos error, permitimos que el sistema continúe
            console.warn('⚠️ Usando Data Manager de emergencia - funcionalidad limitada');
        }
    }
    
    // Cargar Auth System
    async loadAuthSystem() {
        console.log('🔐 Cargando Auth System...');
        
        // Verificar si ya está cargado
        if (window.barraboxAuth && window.barraboxAuth.dataManager !== null) {
            console.log('✅ Auth System ya cargado');
            this.systems.auth = true;
            return;
        }
        
        // Cargar el script
        try {
            await this.loadScript('js/auth.js?v=5.0');
            
            // Auth System se inicializa en DOMContentLoaded, pero nosotros ya estamos después de DOMContentLoaded
            // Necesitamos inicializarlo manualmente si no se ha inicializado automáticamente
            if (!window.barraboxAuth && typeof AuthSystem !== 'undefined') {
                console.log('⚡ Inicializando Auth System manualmente...');
                window.barraboxAuth = new AuthSystem();
                
                // Llamar a initialize manualmente ya que el event listener DOMContentLoaded ya pasó
                if (window.barraboxAuth.initialize) {
                    await window.barraboxAuth.initialize();
                }
            }
            
            // Esperar a que esté listo
            await this.waitForCondition(() => {
                const isReady = window.barraboxAuth && window.barraboxAuth.dataManager !== null;
                if (!isReady) {
                    console.log('⏳ Esperando Auth System...', {
                        exists: !!window.barraboxAuth,
                        hasDataManager: window.barraboxAuth ? window.barraboxAuth.dataManager !== null : false,
                        AuthSystemClass: typeof AuthSystem
                    });
                }
                return isReady;
            }, 5000, 100);
            
            this.systems.auth = true;
            console.log('✅ Auth System cargado exitosamente');
            
        } catch (error) {
            console.error('❌ Error cargando Auth System:', error);
            
            // No lanzamos error crítico, permitimos que el sistema continúe
            console.warn('⚠️ Auth System no disponible - algunas funcionalidades limitadas');
            
            // Crear Auth System de emergencia
            this.createEmergencyAuthSystem();
        }
    }
    
    // Cargar scripts específicos de la página
    async loadPageSpecificScripts() {
        const page = this.getCurrentPage();
        console.log(`📄 Cargando scripts para página: ${page}`);
        
        switch (page) {
            case 'booking.html':
                await this.loadBookingScripts();
                break;
                
            case 'admin-dashboard.html':
                await this.loadAdminScripts();
                break;
                
            case 'user-dashboard.html':
            case 'profile.html':
                await this.loadDashboardScripts();
                break;
                
            default:
                // Para index.html y otras páginas
                await this.loadMainScript();
        }
    }
    
    // Obtener la página actual
    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';
        return page;
    }
    
    // Cargar scripts para booking
    async loadBookingScripts() {
        console.log('📅 Cargando scripts de booking...');
        
        try {
            await this.loadScript('js/calendar.js?v=1.0');
            this.systems.calendar = true;
            console.log('✅ Calendar System cargado');
            
            await this.loadScript('js/calendar-responsive.js?v=1.0');
            console.log('✅ Calendar Responsive cargado');
            
            await this.loadScript('js/booking-system.js?v=1.0');
            this.systems.booking = true;
            console.log('✅ Booking System cargado');
            
        } catch (error) {
            console.error('❌ Error cargando scripts de booking:', error);
            throw new Error('No se pudo cargar el sistema de reservas');
        }
    }
    
    // Cargar scripts para admin
    async loadAdminScripts() {
        console.log('👑 Cargando scripts de admin...');
        
        try {
            await this.loadScript('js/admin-system.js?v=1.0');
            console.log('✅ Admin System cargado');
            
            // Otros scripts específicos de admin si existen
            
        } catch (error) {
            console.error('❌ Error cargando scripts de admin:', error);
            // No lanzamos error porque admin podría funcionar sin scripts adicionales
        }
    }
    
    // Cargar scripts para dashboard
    async loadDashboardScripts() {
        console.log('👤 Cargando scripts de dashboard...');
        
        try {
            // Scripts comunes para dashboards
            await this.loadScript('js/update-dashboard.js?v=1.0');
            console.log('✅ Update Dashboard cargado');
            
        } catch (error) {
            console.error('❌ Error cargando scripts de dashboard:', error);
            // No lanzamos error crítico
        }
    }
    
    // Cargar script main para páginas generales
    async loadMainScript() {
        console.log('🏠 Cargando main script...');
        
        try {
            await this.loadScript('js/main.js?v=5.0');
            console.log('✅ Main script cargado');
            
            // DEBUG: Verificar que initializeMain existe
            console.log('🔍 DEBUG - typeof initializeMain:', typeof initializeMain);
            console.log('🔍 DEBUG - window.initializeMain:', window.initializeMain);
            
            // Inicializar main manualmente ya que DOMContentLoaded ya pasó
            if (typeof initializeMain === 'function') {
                console.log('⚡ Inicializando Main System manualmente...');
                setTimeout(() => {
                    try {
                        initializeMain();
                        console.log('✅ Main System inicializado manualmente');
                    } catch (error) {
                        console.error('❌ Error inicializando Main System:', error);
                        console.error('📊 Error details:', error.message, error.stack);
                    }
                }, 100);
            } else {
                console.error('❌ initializeMain NO es una función');
                console.error('📊 Estado:', {
                    initializeMain: typeof initializeMain,
                    windowInitializeMain: typeof window.initializeMain,
                    globalThisInitializeMain: typeof globalThis.initializeMain
                });
            }
            
        } catch (error) {
            console.error('❌ Error cargando main script:', error);
            // No es crítico para todas las páginas
        }
    }
    
    // Cargar sistema de diagnóstico
    async loadDiagnosticSystem() {
        console.log('🔧 Cargando Diagnostic System...');
        
        try {
            await this.loadScript('js/diagnostic.js?v=1.0');
            console.log('✅ Diagnostic System cargado');
            
            // Ejecutar diagnóstico automático si hay errores
            if (!this.systems.dataManager || !this.systems.auth) {
                console.log('⚠️ Sistemas críticos faltantes, ejecutando diagnóstico...');
                setTimeout(() => {
                    if (window.diagnostic) {
                        window.diagnostic.checkSystemStatus();
                    }
                }, 1000);
            }
            
        } catch (error) {
            console.error('❌ Error cargando Diagnostic System:', error);
            // No es crítico, solo para debugging
        }
    }
    
    // Método de emergencia: crear Data Manager si todo falla
    createEmergencyDataManager() {
        console.log('🚨 Creando Data Manager de emergencia...');
        
        // Crear un Data Manager mínimo
        const emergencyDataManager = {
            getAllData: () => ({
                users: [],
                classes: [],
                bookings: [],
                notifications: [],
                waitlists: []
            }),
            getUserByEmail: (email) => null,
            getUserById: (id) => null,
            createUser: (user) => ({ ...user, id: `user_${Date.now()}` }),
            saveData: () => console.log('💾 (Emergency) Datos guardados'),
            isInitialized: true
        };
        
        window.barraboxDataManager = emergencyDataManager;
        this.systems.dataManager = true;
        
        console.log('✅ Data Manager de emergencia creado');
        return emergencyDataManager;
    }
    
    // Método de emergencia: crear Auth System si todo falla
    createEmergencyAuthSystem() {
        console.log('🚨 Creando Auth System de emergencia...');
        
        // Crear un Auth System mínimo
        const emergencyAuthSystem = {
            dataManager: window.barraboxDataManager || this.createEmergencyDataManager(),
            currentUser: null,
            isAuthenticated: false,
            isAdmin: false,
            
            login: async (email, password) => {
                console.log('🔐 (Emergency) Login attempt:', email);
                // En emergencia, creamos un usuario automáticamente
                const user = {
                    id: `user_${Date.now()}`,
                    email: email,
                    name: email.split('@')[0],
                    role: 'member',
                    status: 'active'
                };
                
                if (this.dataManager && this.dataManager.createUser) {
                    this.dataManager.createUser(user);
                }
                
                this.currentUser = user;
                this.isAuthenticated = true;
                
                return { success: true, user: user };
            },
            
            logout: () => {
                this.currentUser = null;
                this.isAuthenticated = false;
                console.log('👋 (Emergency) Logout');
            },
            
            isLoggedIn: () => this.isAuthenticated,
            getCurrentUser: () => this.currentUser,
            isInitialized: true
        };
        
        window.barraboxAuth = emergencyAuthSystem;
        this.systems.auth = true;
        
        console.log('✅ Auth System de emergencia creado');
        return emergencyAuthSystem;
    }
    
    // Cargar script dinámicamente
    loadScript(src) {
        return new Promise((resolve, reject) => {
            // Verificar si ya está cargado
            const existingScript = document.querySelector(`script[src="${src}"]`);
            if (existingScript) {
                console.log(`📄 Script ya cargado: ${src}`);
                resolve();
                return;
            }
            
            console.log(`📥 Cargando script: ${src}`);
            const script = document.createElement('script');
            script.src = src;
            script.async = false; // Importante: cargar en orden
            
            let timeoutId;
            
            const cleanup = () => {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                    timeoutId = null;
                }
            };
            
            script.onload = () => {
                cleanup();
                console.log(`✅ Script cargado exitosamente: ${src}`);
                resolve();
            };
            
            script.onerror = (error) => {
                cleanup();
                console.error(`❌ Error cargando script ${src}:`, error);
                console.error('📊 Información del error:', {
                    src: src,
                    readyState: script.readyState,
                    error: error
                });
                reject(new Error(`Error cargando script: ${src}. Verifica que el archivo exista.`));
            };
            
            // Timeout por si el script nunca carga
            timeoutId = setTimeout(() => {
                if (script.readyState !== 'loaded' && script.readyState !== 'complete') {
                    console.error(`⏰ Timeout cargando script: ${src}`);
                    reject(new Error(`Timeout cargando script: ${src}`));
                }
            }, 5000); // 5 segundos timeout (reducido de 15)
            
            document.head.appendChild(script);
        });
    }
    
    // Esperar por una condición
    waitForCondition(condition, timeout = 10000, interval = 100) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            const check = () => {
                if (condition()) {
                    resolve();
                } else if (Date.now() - startTime > timeout) {
                    reject(new Error(`Timeout esperando condición después de ${timeout}ms`));
                } else {
                    setTimeout(check, interval);
                }
            };
            
            check();
        });
    }
    
    // Mostrar error al usuario
    showError(error) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'init-error';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 99999;
            max-width: 400px;
            font-family: 'Open Sans', sans-serif;
        `;
        
        errorDiv.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 0.8rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 1.2rem; flex-shrink: 0;"></i>
                <div>
                    <strong style="display: block; margin-bottom: 0.3rem;">Error de inicialización</strong>
                    <div style="font-size: 0.9rem; opacity: 0.9;">${error.message || 'Error desconocido'}</div>
                    <button onclick="location.reload()" style="margin-top: 0.8rem; padding: 0.4rem 0.8rem; 
                            background: rgba(255,255,255,0.2); border: none; border-radius: 4px; 
                            color: white; cursor: pointer; font-size: 0.85rem;">
                        <i class="fas fa-redo"></i> Recargar página
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
        
        // Auto-remover después de 10 segundos
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.style.opacity = '0';
                errorDiv.style.transition = 'opacity 0.3s ease';
                setTimeout(() => {
                    if (errorDiv.parentNode) {
                        errorDiv.parentNode.removeChild(errorDiv);
                    }
                }, 300);
            }
        }, 10000);
    }
    
    // Disparar eventos personalizados
    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, {
            detail: {
                ...detail,
                source: 'InitSystem',
                timestamp: new Date().toISOString()
            }
        });
        
        document.dispatchEvent(event);
    }
    
    // Obtener estado del sistema
    getSystemStatus() {
        return {
            initialized: this.initialized,
            systems: this.systems,
            dataManager: window.barraboxDataManager ? '✅ Disponible' : '❌ No disponible',
            auth: window.barraboxAuth ? '✅ Disponible' : '❌ No disponible'
        };
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM listo, iniciando Initialization System...');
    
    // Crear instancia global
    window.barraboxInit = new InitSystem();
    
    // Exponer para debugging
    window.debugInitSystem = () => {
        if (window.barraboxInit) {
            console.log('🔧 Debug Init System:', window.barraboxInit.getSystemStatus());
        } else {
            console.log('Init System no está disponible');
        }
    };
    
    console.log('✅ Initialization System instanciado como window.barraboxInit');
});

// Polyfill para CustomEvent en IE
(function() {
    if (typeof window.CustomEvent === "function") return false;
    
    function CustomEvent(event, params) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    }
    
    CustomEvent.prototype = window.Event.prototype;
    window.CustomEvent = CustomEvent;
})();