// Data Manager Simple - Sistema de persistencia simplificado
// Versión: 1.0.0 - Solo métodos esenciales

class DataManagerSimple {
    constructor() {
        console.log('📊 Data Manager Simple inicializando...');
        
        this.eventBus = window.eventBus;
        this.STORAGE_KEY = 'barrabox_gym_data';
        this.VERSION = '1.0';
        
        // Datos por defecto
        this.defaultData = {
            version: this.VERSION,
            users: [
                {
                    id: 'admin_001',
                    email: 'admin@barrabox.cl',
                    name: 'Administrador',
                    role: 'admin',
                    status: 'active',
                    createdAt: new Date().toISOString()
                }
            ],
            classes: [],
            bookings: [],
            notifications: [],
            waitlists: []
        };
        
        this.data = this.loadData();
        this.isInitialized = false;
        
        this.initialize();
    }
    
    initialize() {
        console.log('⚙️ Configurando Data Manager Simple...');
        
        // Verificar y migrar datos si es necesario
        this.migrateData();
        
        // Emitir evento de datos cargados
        this.eventBus.once(this.eventBus.SYSTEM_EVENTS.DOM_READY, () => {
            setTimeout(() => {
                this.isInitialized = true;
                console.log('✅ Data Manager Simple inicializado');
                this.eventBus.emit(this.eventBus.SYSTEM_EVENTS.DATA_LOADED, {
                    users: this.data.users.length,
                    classes: this.data.classes.length
                });
            }, 100);
        });
        
        // Si DOM ya está listo
        if (document.readyState !== 'loading') {
            setTimeout(() => {
                this.isInitialized = true;
                console.log('✅ Data Manager Simple inicializado (DOM ya listo)');
                this.eventBus.emit(this.eventBus.SYSTEM_EVENTS.DATA_LOADED);
            }, 100);
        }
    }
    
    loadData() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            
            if (stored) {
                const parsed = JSON.parse(stored);
                
                // Verificar versión
                if (parsed.version === this.VERSION) {
                    console.log('💾 Datos cargados desde localStorage');
                    return parsed;
                } else {
                    console.log('🔄 Datos de versión antigua, usando defaults');
                    return this.defaultData;
                }
            }
            
            console.log('🆕 No hay datos guardados, usando defaults');
            return this.defaultData;
            
        } catch (error) {
            console.error('❌ Error cargando datos:', error);
            return this.defaultData;
        }
    }
    
    saveData() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
            console.log('💾 Datos guardados en localStorage');
            return true;
        } catch (error) {
            console.error('❌ Error guardando datos:', error);
            return false;
        }
    }
    
    migrateData() {
        // Por ahora solo verificar versión
        if (this.data.version !== this.VERSION) {
            console.log('🔄 Migrando datos a versión', this.VERSION);
            this.data.version = this.VERSION;
            this.saveData();
        }
    }
    
    // Métodos esenciales
    
    getAllData() {
        return { ...this.data };
    }
    
    getUsers() {
        return [...this.data.users];
    }
    
    getUserByEmail(email) {
        if (!email) return null;
        return this.data.users.find(user => 
            user.email.toLowerCase() === email.toLowerCase()
        ) || null;
    }
    
    getUserById(id) {
        if (!id) return null;
        return this.data.users.find(user => user.id === id) || null;
    }
    
    createUser(userData) {
        const newUser = {
            id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            email: userData.email,
            name: userData.name || userData.email.split('@')[0],
            role: userData.role || 'member',
            status: 'active',
            createdAt: new Date().toISOString(),
            ...userData
        };
        
        this.data.users.push(newUser);
        this.saveData();
        
        console.log('👤 Usuario creado:', newUser.email);
        return newUser;
    }
    
    updateUser(userId, updates) {
        const index = this.data.users.findIndex(user => user.id === userId);
        
        if (index === -1) {
            console.error('❌ Usuario no encontrado:', userId);
            return null;
        }
        
        this.data.users[index] = {
            ...this.data.users[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        
        this.saveData();
        console.log('✏️ Usuario actualizado:', userId);
        
        return this.data.users[index];
    }
    
    getClasses() {
        return [...this.data.classes];
    }
    
    createClass(classData) {
        const newClass = {
            id: `class_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: classData.title,
            description: classData.description || '',
            capacity: classData.capacity || 20,
            booked: 0,
            date: classData.date || new Date().toISOString(),
            instructor: classData.instructor || 'Instructor',
            status: 'active',
            createdAt: new Date().toISOString(),
            ...classData
        };
        
        this.data.classes.push(newClass);
        this.saveData();
        
        console.log('🏋️ Clase creada:', newClass.title);
        return newClass;
    }
    
    // Métodos de utilidad
    
    clearAllData() {
        this.data = { ...this.defaultData };
        this.saveData();
        console.log('🧹 Todos los datos borrados');
        return true;
    }
    
    getStats() {
        return {
            users: this.data.users.length,
            classes: this.data.classes.length,
            bookings: this.data.bookings.length,
            notifications: this.data.notifications.length,
            waitlists: this.data.waitlists.length
        };
    }
    
    // Para compatibilidad con sistema antiguo
    getSystemInfo() {
        return {
            version: this.VERSION,
            isInitialized: this.isInitialized,
            ...this.getStats()
        };
    }
}

// Crear instancia global
if (typeof window !== 'undefined') {
    window.dataManagerSimple = new DataManagerSimple();
    
    // También hacer disponible como barraboxDataManager para compatibilidad
    window.barraboxDataManager = window.dataManagerSimple;
    
    console.log('📊 Data Manager Simple disponible como window.dataManagerSimple y window.barraboxDataManager');
}