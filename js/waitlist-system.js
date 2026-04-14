// Waitlist System Simple - Versión simplificada para Barrabox Gym

class WaitlistSystem {
    constructor() {
        console.log('📋 Waitlist System inicializando...');
        
        this.dataManager = window.barraboxDataManager;
        this.authSystem = window.barraboxAuth;
        
        this.config = {
            maxWaitlistSize: 10,
            autoPromote: true
        };
        
        this.isInitialized = false;
        
        this.initialize();
    }
    
    initialize() {
        try {
            console.log('🧪 Verificando dependencias...');
            
            if (!this.dataManager) {
                console.warn('⚠️ Data Manager no disponible para Waitlist System');
                return;
            }
            
            if (!this.authSystem) {
                console.warn('⚠️ Auth System no disponible para Waitlist System');
                return;
            }
            
            // Verificar que exista la colección de waitlists
            const data = this.dataManager.getAllData();
            if (!data.waitlists) {
                console.log('📝 Creando colección de waitlists...');
                this.dataManager.data.waitlists = [];
                this.dataManager.saveData();
            }
            
            this.isInitialized = true;
            
            console.log('✅ Waitlist System inicializado correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando Waitlist System:', error);
        }
    }
    
    // Unirse a lista de espera (versión simple)
    joinWaitlist(classId, userId = null) {
        if (!this.isInitialized) {
            throw new Error('Waitlist System no inicializado');
        }
        
        if (!userId) {
            if (!this.authSystem.isLoggedIn()) {
                throw new Error('Usuario no autenticado');
            }
            userId = this.authSystem.getCurrentUser().id;
        }
        
        const cls = this.dataManager.getClass(classId);
        if (!cls) {
            throw new Error('Clase no encontrada');
        }
        
        const user = this.dataManager.getUser(userId);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        
        if (cls.booked < cls.capacity) {
            throw new Error('La clase aún tiene cupos disponibles');
        }
        
        // Verificar que no esté ya en la waitlist
        const existingWaitlist = this.dataManager.getWaitlistByUserAndClass(userId, classId);
        if (existingWaitlist) {
            throw new Error('Ya estás en la lista de espera para esta clase');
        }
        
        // Calcular posición
        const classWaitlists = this.dataManager.getWaitlistsByClass(classId);
        const position = classWaitlists.length + 1;
        
        // Crear entrada en waitlist
        const waitlistEntry = {
            id: `waitlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: userId,
            classId: classId,
            position: position,
            joinedAt: new Date().toISOString(),
            status: 'waiting'
        };
        
        // Guardar waitlist
        const created = this.dataManager.createWaitlist(waitlistEntry);
        
        if (!created) {
            throw new Error('Error uniéndose a la lista de espera');
        }
        
        console.log(`✅ Usuario ${user.email} se unió a waitlist para clase ${cls.title} (posición: ${position})`);
        
        return created;
    }
    
    // Salir de lista de espera
    leaveWaitlist(waitlistId, userId = null) {
        if (!this.isInitialized) {
            throw new Error('Waitlist System no inicializado');
        }
        
        const waitlist = this.dataManager.getWaitlist(waitlistId);
        if (!waitlist) {
            throw new Error('Entrada de waitlist no encontrada');
        }
        
        // Verificar permisos
        if (userId && waitlist.userId !== userId) {
            const user = this.dataManager.getUser(userId);
            if (!user || user.role !== 'admin') {
                throw new Error('No tienes permiso para eliminar esta entrada de waitlist');
            }
        }
        
        // Eliminar waitlist
        const deleted = this.dataManager.deleteWaitlist(waitlistId);
        
        if (!deleted) {
            throw new Error('Error saliendo de la lista de espera');
        }
        
        console.log(`❌ Usuario salió de waitlist para clase ${waitlist.classId}`);
        
        return true;
    }
    
    // Obtener waitlists por clase
    getWaitlistsByClass(classId) {
        if (!this.isInitialized) {
            throw new Error('Waitlist System no inicializado');
        }
        
        return this.dataManager.getWaitlistsByClass(classId);
    }
    
    // Obtener waitlists por usuario
    getWaitlistsByUser(userId) {
        if (!this.isInitialized) {
            throw new Error('Waitlist System no inicializado');
        }
        
        return this.dataManager.getWaitlistsByUser(userId);
    }
    
    // Obtener información del sistema
    getSystemInfo() {
        return {
            initialized: this.isInitialized,
            config: this.config
        };
    }
}

// Crear instancia global
if (typeof window !== 'undefined') {
    window.barraboxWaitlist = new WaitlistSystem();
    
    console.log('📋 Waitlist System cargado como window.barraboxWaitlist');
}