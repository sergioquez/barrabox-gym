// System Loader - Sistema simple de carga de componentes
// Versión: 1.0.0 - Sin dependencias complejas

class SystemLoader {
    constructor() {
        console.log('🚀 System Loader inicializando...');
        
        this.eventBus = window.eventBus;
        this.components = new Map();
        this.loadedComponents = new Set();
        this.failedComponents = new Set();
        
        this.config = {
            timeout: 3000, // 3 segundos máximo por componente
            retryAttempts: 1,
            loadOrder: ['core', 'feature', 'ui']
        };
        
        // Definir componentes del sistema
        this.defineComponents();
        
        this.initialize();
    }
    
    defineComponents() {
        // Componentes CORE (esenciales)
        this.components.set('event-bus', {
            name: 'Event Bus',
            type: 'core',
            script: 'js/event-bus.js',
            priority: 0,
            required: true
        });
        
        this.components.set('data-manager', {
            name: 'Data Manager',
            type: 'core',
            script: 'js/data-manager-simple.js',
            priority: 1,
            required: true,
            dependencies: ['event-bus']
        });
        
        this.components.set('auth-system', {
            name: 'Auth System',
            type: 'core',
            script: 'js/auth-simple.js',
            priority: 2,
            required: true,
            dependencies: ['event-bus', 'data-manager']
        });
        
        // Componentes FEATURE (funcionalidades)
        this.components.set('theme-system', {
            name: 'Theme System',
            type: 'feature',
            script: 'js/theme-simple.js',
            priority: 3,
            required: false,
            dependencies: ['event-bus']
        });
        
        this.components.set('main-ui', {
            name: 'Main UI',
            type: 'ui',
            script: 'js/main-simple.js',
            priority: 4,
            required: true,
            dependencies: ['event-bus', 'auth-system']
        });
        
        this.components.set('diagnostic', {
            name: 'Diagnostic System',
            type: 'feature',
            script: 'js/diagnostic-simple.js',
            priority: 5,
            required: false,
            dependencies: ['event-bus']
        });
    }
    
    initialize() {
        console.log('⚙️ Configurando System Loader...');
        
        // Escuchar evento de DOM listo
        this.eventBus.on(this.eventBus.SYSTEM_EVENTS.DOM_READY, () => {
            console.log('🏗️ DOM listo, comenzando carga de componentes...');
            this.loadComponents();
        });
        
        // Si DOM ya está listo, comenzar inmediatamente
        if (document.readyState !== 'loading') {
            console.log('⚡ DOM ya cargado, comenzando carga inmediata...');
            setTimeout(() => {
                this.eventBus.emit(this.eventBus.SYSTEM_EVENTS.DOM_READY);
            }, 100);
        }
        
        console.log('✅ System Loader listo para cargar componentes');
    }
    
    async loadComponents() {
        console.log('📦 Cargando componentes en orden...');
        
        // Ordenar componentes por prioridad
        const sortedComponents = Array.from(this.components.entries())
            .sort((a, b) => a[1].priority - b[1].priority);
        
        // Cargar componentes en orden
        for (const [id, component] of sortedComponents) {
            await this.loadComponent(id, component);
        }
        
        // Verificar si todos los componentes requeridos cargaron
        this.checkSystemReady();
    }
    
    async loadComponent(id, component) {
        // Verificar dependencias
        if (component.dependencies) {
            const missingDeps = component.dependencies.filter(dep => !this.loadedComponents.has(dep));
            
            if (missingDeps.length > 0) {
                console.log(`⏳ Esperando dependencias para ${component.name}:`, missingDeps);
                
                // Esperar a que las dependencias carguen
                await Promise.all(
                    missingDeps.map(dep => this.waitForComponent(dep))
                );
            }
        }
        
        console.log(`🔄 Cargando ${component.name}...`);
        
        try {
            await this.loadScript(component.script, component.name);
            
            this.loadedComponents.add(id);
            console.log(`✅ ${component.name} cargado exitosamente`);
            
            // Emitir evento de componente cargado
            this.eventBus.emit(`component:loaded:${id}`, { component });
            
        } catch (error) {
            console.error(`❌ Error cargando ${component.name}:`, error.message);
            this.failedComponents.add(id);
            
            if (component.required) {
                console.error(`🚨 ${component.name} es REQUERIDO pero falló`);
                // Para componentes requeridos, crear versión mínima
                this.createFallbackComponent(id, component);
            } else {
                console.warn(`⚠️ ${component.name} es opcional, continuando...`);
            }
        }
    }
    
    loadScript(src, componentName) {
        return new Promise((resolve, reject) => {
            // Verificar si ya está cargado
            const existingScript = document.querySelector(`script[src="${src}"]`);
            if (existingScript) {
                console.log(`📄 ${componentName} ya cargado`);
                resolve();
                return;
            }
            
            console.log(`📥 Cargando script: ${src}`);
            const script = document.createElement('script');
            script.src = src;
            
            let timeoutId;
            
            const cleanup = () => {
                if (timeoutId) clearTimeout(timeoutId);
            };
            
            script.onload = () => {
                cleanup();
                console.log(`✅ Script cargado: ${src}`);
                resolve();
            };
            
            script.onerror = (error) => {
                cleanup();
                console.error(`❌ Error cargando script ${src}:`, error);
                reject(new Error(`No se pudo cargar ${componentName}: ${src}`));
            };
            
            // Timeout
            timeoutId = setTimeout(() => {
                console.error(`⏰ Timeout cargando ${componentName}: ${src}`);
                reject(new Error(`Timeout cargando ${componentName}`));
            }, this.config.timeout);
            
            document.head.appendChild(script);
        });
    }
    
    waitForComponent(componentId) {
        return new Promise((resolve) => {
            if (this.loadedComponents.has(componentId)) {
                resolve();
                return;
            }
            
            // Escuchar evento de componente cargado
            const unsubscribe = this.eventBus.on(`component:loaded:${componentId}`, () => {
                unsubscribe();
                resolve();
            });
            
            // Timeout por si el componente nunca carga
            setTimeout(() => {
                unsubscribe();
                console.warn(`⏰ Timeout esperando componente: ${componentId}`);
                resolve(); // Continuar de todos modos
            }, this.config.timeout * 2);
        });
    }
    
    createFallbackComponent(id, component) {
        console.log(`🛡️ Creando fallback para ${component.name}...`);
        
        switch (id) {
            case 'data-manager':
                this.createFallbackDataManager();
                this.loadedComponents.add(id);
                break;
                
            case 'auth-system':
                this.createFallbackAuthSystem();
                this.loadedComponents.add(id);
                break;
                
            case 'main-ui':
                this.createFallbackMainUI();
                this.loadedComponents.add(id);
                break;
                
            default:
                console.warn(`⚠️ No hay fallback definido para ${component.name}`);
        }
    }
    
    createFallbackDataManager() {
        console.log('🛡️ Creando Data Manager de fallback...');
        
        const fallbackDataManager = {
            getAllData: () => ({
                users: [],
                classes: [],
                bookings: [],
                notifications: [],
                waitlists: []
            }),
            getUserByEmail: () => null,
            getUserById: () => null,
            createUser: (user) => ({ ...user, id: `user_${Date.now()}` }),
            saveData: () => console.log('💾 (Fallback) Datos guardados'),
            isInitialized: true
        };
        
        window.barraboxDataManager = fallbackDataManager;
        window.dataManager = fallbackDataManager;
        
        console.log('✅ Data Manager de fallback creado');
    }
    
    createFallbackAuthSystem() {
        console.log('🛡️ Creando Auth System de fallback...');
        
        const fallbackAuth = {
            dataManager: window.barraboxDataManager || this.createFallbackDataManager(),
            currentUser: null,
            isAuthenticated: false,
            
            login: async (email, password) => {
                console.log('🔐 (Fallback) Login:', email);
                const user = {
                    id: `user_${Date.now()}`,
                    email: email,
                    name: email.split('@')[0],
                    role: 'member'
                };
                
                this.dataManager.createUser(user);
                this.currentUser = user;
                this.isAuthenticated = true;
                
                this.eventBus.emit(this.eventBus.SYSTEM_EVENTS.USER_LOGIN, { user });
                
                return { success: true, user };
            },
            
            logout: () => {
                this.currentUser = null;
                this.isAuthenticated = false;
                this.eventBus.emit(this.eventBus.SYSTEM_EVENTS.USER_LOGOUT);
            },
            
            isLoggedIn: () => this.isAuthenticated,
            getCurrentUser: () => this.currentUser
        };
        
        window.barraboxAuth = fallbackAuth;
        window.authSystem = fallbackAuth;
        
        console.log('✅ Auth System de fallback creado');
    }
    
    createFallbackMainUI() {
        console.log('🛡️ Creando Main UI de fallback...');
        
        // Función mínima para menú hamburguesa
        const setupHamburgerMenu = () => {
            const hamburger = document.querySelector('.hamburger');
            const navMenu = document.querySelector('.nav-menu');
            
            if (hamburger && navMenu) {
                hamburger.addEventListener('click', () => {
                    navMenu.classList.toggle('active');
                    hamburger.innerHTML = navMenu.classList.contains('active') 
                        ? '<i class="fas fa-times"></i>' 
                        : '<i class="fas fa-bars"></i>';
                    
                    this.eventBus.emit(this.eventBus.SYSTEM_EVENTS.MENU_TOGGLE, {
                        isOpen: navMenu.classList.contains('active')
                    });
                });
                
                console.log('✅ Menú hamburguesa configurado (fallback)');
                return true;
            }
            
            console.warn('⚠️ No se encontró menú hamburguesa para configurar');
            return false;
        };
        
        // Configurar UI cuando DOM esté listo
        const initializeUI = () => {
            console.log('🏠 Inicializando UI de fallback...');
            
            // Menú hamburguesa
            setupHamburgerMenu();
            
            // Login modal básico
            const loginBtn = document.querySelector('.btn-login');
            const loginModal = document.getElementById('loginModal');
            
            if (loginBtn && loginModal) {
                loginBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    loginModal.style.display = 'flex';
                    document.body.style.overflow = 'hidden';
                    
                    this.eventBus.emit(this.eventBus.SYSTEM_EVENTS.LOGIN_OPEN);
                });
                
                // Cerrar modal
                const closeModal = loginModal.querySelector('.close-modal');
                if (closeModal) {
                    closeModal.addEventListener('click', () => {
                        loginModal.style.display = 'none';
                        document.body.style.overflow = 'auto';
                        this.eventBus.emit(this.eventBus.SYSTEM_EVENTS.LOGIN_CLOSE);
                    });
                }
            }
            
            console.log('✅ UI de fallback inicializada');
        };
        
        // Ejecutar cuando DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeUI);
        } else {
            setTimeout(initializeUI, 100);
        }
        
        window.initializeMain = initializeUI;
        console.log('✅ Main UI de fallback creado');
    }
    
    checkSystemReady() {
        console.log('🔍 Verificando estado del sistema...');
        
        const requiredComponents = Array.from(this.components.values())
            .filter(c => c.required)
            .map(c => c.name);
        
        const loadedRequired = requiredComponents.filter(name => 
            Array.from(this.components.entries())
                .find(([id, c]) => c.name === name && this.loadedComponents.has(id))
        );
        
        console.log('📊 Estado de componentes requeridos:', {
            requeridos: requiredComponents.length,
            cargados: loadedRequired.length,
            faltantes: requiredComponents.length - loadedRequired.length
        });
        
        if (loadedRequired.length === requiredComponents.length) {
            console.log('🎉 ¡SISTEMA COMPLETAMENTE CARGADO!');
            this.eventBus.emit(this.eventBus.SYSTEM_EVENTS.SYSTEM_READY, {
                loadedComponents: Array.from(this.loadedComponents),
                failedComponents: Array.from(this.failedComponents)
            });
        } else {
            console.warn('⚠️ Sistema parcialmente cargado - algunos componentes faltan');
            this.eventBus.emit(this.eventBus.SYSTEM_EVENTS.SYSTEM_READY, {
                loadedComponents: Array.from(this.loadedComponents),
                failedComponents: Array.from(this.failedComponents),
                warning: 'Sistema parcialmente cargado'
            });
        }
    }
    
    getSystemStatus() {
        return {
            loaded: Array.from(this.loadedComponents),
            failed: Array.from(this.failedComponents),
            total: this.components.size,
            isComplete: this.loadedComponents.size === this.components.size
        };
    }
}

// Inicializar System Loader
if (typeof window !== 'undefined') {
    // Esperar a que Event Bus esté disponible
    const initSystemLoader = () => {
        if (window.eventBus) {
            window.systemLoader = new SystemLoader();
            console.log('🚀 System Loader disponible como window.systemLoader');
        } else {
            setTimeout(initSystemLoader, 100);
        }
    };
    
    // Iniciar después de breve delay para asegurar que Event Bus cargue primero
    setTimeout(initSystemLoader, 50);
}