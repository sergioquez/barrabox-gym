// Event Bus - Sistema centralizado de eventos para Barrabox Gym
// Versión: 1.0.0 - Simple y robusto

class EventBus {
    constructor() {
        console.log('🎫 Event Bus inicializando...');
        this.events = new Map();
        this.oneTimeEvents = new Set();
        this.isInitialized = false;
        
        // Eventos del sistema
        this.SYSTEM_EVENTS = {
            // Fases de inicialización
            CORE_LOADED: 'system:core:loaded',
            FEATURES_LOADED: 'system:features:loaded',
            UI_READY: 'system:ui:ready',
            SYSTEM_READY: 'system:ready',
            
            // Componentes específicos
            DOM_READY: 'dom:ready',
            AUTH_LOADED: 'auth:loaded',
            DATA_LOADED: 'data:loaded',
            THEME_LOADED: 'theme:loaded',
            
            // Interacción de usuario
            MENU_TOGGLE: 'menu:toggle',
            LOGIN_OPEN: 'login:open',
            LOGIN_CLOSE: 'login:close',
            
            // Estados de autenticación
            USER_LOGIN: 'user:login',
            USER_LOGOUT: 'user:logout',
            
            // Errores
            ERROR: 'system:error',
            WARNING: 'system:warning'
        };
        
        this.initialize();
    }
    
    initialize() {
        console.log('⚙️ Configurando Event Bus...');
        
        // Escuchar evento DOMContentLoaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.emit(this.SYSTEM_EVENTS.DOM_READY);
            });
        } else {
            // DOM ya cargado, emitir inmediatamente
            setTimeout(() => {
                this.emit(this.SYSTEM_EVENTS.DOM_READY);
            }, 0);
        }
        
        this.isInitialized = true;
        console.log('✅ Event Bus inicializado');
        
        // Emitir evento de sistema listo después de breve delay
        setTimeout(() => {
            this.emit(this.SYSTEM_EVENTS.CORE_LOADED);
        }, 100);
    }
    
    // Suscribirse a un evento
    on(eventName, callback, options = {}) {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, []);
        }
        
        const listener = {
            callback,
            once: options.once || false,
            id: Date.now() + Math.random().toString(36).substr(2, 9)
        };
        
        this.events.get(eventName).push(listener);
        
        console.log(`📡 Suscrito a evento: ${eventName} (id: ${listener.id})`);
        
        // Retornar función para desuscribirse
        return () => {
            this.off(eventName, listener.id);
        };
    }
    
    // Suscribirse una sola vez
    once(eventName, callback) {
        return this.on(eventName, callback, { once: true });
    }
    
    // Desuscribirse
    off(eventName, listenerId) {
        if (!this.events.has(eventName)) return;
        
        const listeners = this.events.get(eventName);
        const initialLength = listeners.length;
        
        this.events.set(
            eventName,
            listeners.filter(listener => listener.id !== listenerId)
        );
        
        if (listeners.length !== initialLength) {
            console.log(`📡 Desuscrito de evento: ${eventName} (id: ${listenerId})`);
        }
    }
    
    // Emitir evento
    emit(eventName, data = null) {
        console.log(`📢 Emitiendo evento: ${eventName}`, data ? `(datos: ${JSON.stringify(data).substring(0, 100)}...)` : '');
        
        if (!this.events.has(eventName)) {
            return;
        }
        
        const listeners = [...this.events.get(eventName)];
        
        // Ejecutar listeners
        listeners.forEach(listener => {
            try {
                listener.callback(data);
                
                // Si es once, remover después de ejecutar
                if (listener.once) {
                    this.off(eventName, listener.id);
                }
            } catch (error) {
                console.error(`❌ Error en listener de evento ${eventName}:`, error);
                // No propagar el error para no romper otros listeners
            }
        });
    }
    
    // Verificar si hay listeners para un evento
    hasListeners(eventName) {
        return this.events.has(eventName) && this.events.get(eventName).length > 0;
    }
    
    // Limpiar todos los listeners de un evento
    clear(eventName) {
        if (this.events.has(eventName)) {
            this.events.delete(eventName);
            console.log(`🧹 Limpiados todos los listeners de: ${eventName}`);
        }
    }
    
    // Limpiar todos los eventos
    clearAll() {
        this.events.clear();
        console.log('🧹 Limpiados todos los eventos');
    }
    
    // Obtener información del sistema
    getInfo() {
        return {
            isInitialized: this.isInitialized,
            totalEvents: this.events.size,
            totalListeners: Array.from(this.events.values()).reduce((sum, listeners) => sum + listeners.length, 0),
            systemEvents: Object.keys(this.SYSTEM_EVENTS).length
        };
    }
}

// Crear instancia global
if (typeof window !== 'undefined') {
    window.eventBus = new EventBus();
    
    // También hacerlo disponible como barraboxEventBus para compatibilidad
    window.barraboxEventBus = window.eventBus;
    
    console.log('🎫 Event Bus disponible como window.eventBus y window.barraboxEventBus');
    
    // Debug helper
    window.debugEventBus = () => {
        const info = window.eventBus.getInfo();
        console.log('🔍 Event Bus Debug Info:', info);
        return info;
    };
}