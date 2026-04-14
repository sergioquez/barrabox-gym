// Waitlist System - Sistema de lista de espera para Barrabox Gym

class WaitlistSystem {
    constructor() {
        console.log('📋 Waitlist System inicializando...');
        
        // Dependencias
        this.dataManager = window.barraboxDataManager;
        this.authSystem = window.barraboxAuth;
        
        // Configuración
        this.config = {
            maxWaitlistSize: 10,
            autoPromote: true,
            notificationDelay: 1000, // 1 segundo para simulación
            promotionWindow: 15 // minutos para aceptar promoción
        };
        
        // Estado
        this.isInitialized = false;
        
        // Inicializar
        this.initialize();
    }
    
    // Inicializar sistema
    async initialize() {
        try {
            console.log('🧪 Verificando dependencias...');
            
            if (!this.dataManager) {
                throw new Error('Data Manager no disponible');
            }
            
            if (!this.authSystem) {
                throw new Error('Auth System no disponible');
            }
            
            // Verificar que exista la colección de waitlists
            const data = this.dataManager.getAllData();
            if (!data.waitlists) {
                console.log('📝 Creando colección de waitlists...');
                this.dataManager.data.waitlists = [];
                this.dataManager.saveData();
            }
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Marcar como inicializado
            this.isInitialized = true;
            
            console.log('✅ Waitlist System inicializado correctamente');
            
            // Disparar evento
            this.dispatchEvent('waitlist:initialized');
            
        } catch (error) {
            console.error('❌ Error inicializando Waitlist System:', error);
        }
    }
    
    // Unirse a lista de espera
    joinWaitlist(classId, userId = null) {
        if (!this.isInitialized) {
            throw new Error('Waitlist System no inicializado');
        }
        
        // Obtener usuario actual si no se proporciona
        if (!userId) {
            if (!this.authSystem.isLoggedIn()) {
                throw new Error('Usuario no autenticado');
            }
            userId = this.authSystem.getCurrentUser().id;
        }
        
        // Verificar que la clase exista
        const cls = this.dataManager.getClass(classId);
        if (!cls) {
            throw new Error('Clase no encontrada');
        }
        
        // Verificar que el usuario exista
        const user = this.dataManager.getUser(userId);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        
        // Verificar que la clase esté llena
        if (cls.booked < cls.capacity) {
            throw new Error('La clase aún tiene cupos disponibles');
        }
        
        // Verificar que el usuario no esté ya en la waitlist
        const existingWaitlist = this.dataManager.getWaitlistByUserAndClass(userId, classId);
        if (existingWaitlist) {
            throw new Error('Ya estás en la lista de espera para esta clase');
        }
        
        // Verificar que el usuario no tenga ya una reserva para esta clase
        const userBookings = this.dataManager.getBookingsByUser(userId);
        const existingBooking = userBookings.find(b => 
            b.classId === classId && b.status === 'confirmed'
        );
        
        if (existingBooking) {
            throw new Error('Ya tienes una reserva para esta clase');
        }
        
        // Verificar tamaño máximo de waitlist
        const classWaitlists = this.dataManager.getWaitlistsByClass(classId);
        if (classWaitlists.length >= this.config.maxWaitlistSize) {
            throw new Error('La lista de espera está llena');
        }
        
        // Calcular posición
        const position = classWaitlists.length + 1;
        
        // Crear entrada en waitlist
        const waitlistEntry = {
            id: `waitlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: userId,
            classId: classId,
            position: position,
            joinedAt: new Date().toISOString(),
            status: 'waiting',
            notified: false,
            promotionOffered: false,
            promotionExpiresAt: null
        };
        
        // Guardar waitlist
        const created = this.dataManager.createWaitlist(waitlistEntry);
        
        if (!created) {
            throw new Error('Error uniéndose a la lista de espera');
        }
        
        // Crear notificación
        this.dataManager.createNotification(
            userId,
            'waitlist_joined',
            'Te uniste a la lista de espera',
            `Te uniste a la lista de espera para ${cls.title}. Tu posición: #${position}`,
            'info'
        );
        
        console.log(`✅ Usuario ${user.email} se unió a waitlist para clase ${cls.title} (posición: ${position})`);
        
        // Disparar evento
        this.dispatchEvent('waitlist:joined', {
            waitlist: created,
            user: user,
            class: cls,
            position: position
        });
        
        return created;
    }
    
    // Salir de lista de espera
    leaveWaitlist(waitlistId, userId = null) {
        if (!this.isInitialized) {
            throw new Error('Waitlist System no inicializado');
        }
        
        // Obtener waitlist
        const waitlist = this.dataManager.getWaitlist(waitlistId);
        if (!waitlist) {
            throw new Error('Entrada de waitlist no encontrada');
        }
        
        // Verificar permisos
        if (userId && waitlist.userId !== userId) {
            // Verificar si es administrador
            const user = this.dataManager.getUser(userId);
            if (!user || user.role !== 'admin') {
                throw new Error('No tienes permiso para eliminar esta entrada de waitlist');
            }
        }
        
        // Obtener información de clase y usuario
        const cls = this.dataManager.getClass(waitlist.classId);
        const user = this.dataManager.getUser(waitlist.userId);
        
        // Eliminar waitlist
        const deleted = this.dataManager.deleteWaitlist(waitlistId);
        
        if (!deleted) {
            throw new Error('Error saliendo de la lista de espera');
        }
        
        // Recalcular posiciones para esta clase
        this.recalculatePositions(waitlist.classId);
        
        // Crear notificación
        if (user) {
            this.dataManager.createNotification(
                user.id,
                'waitlist_left',
                'Saliste de la lista de espera',
                `Saliste de la lista de espera para ${cls?.title || 'la clase'}`,
                'info'
            );
        }
        
        console.log(`❌ Usuario salió de waitlist para clase ${cls?.title || waitlist.classId}`);
        
        // Disparar evento
        this.dispatchEvent('waitlist:left', {
            waitlist: waitlist,
            user: user,
            class: cls
        });
        
        return true;
    }
    
    // Recalcular posiciones después de que alguien sale
    recalculatePositions(classId) {
        const waitlists = this.dataManager.getWaitlistsByClass(classId);
        
        // Ordenar por fecha de ingreso
        waitlists.sort((a, b) => new Date(a.joinedAt) - new Date(b.joinedAt));
        
        // Reasignar posiciones
        waitlists.forEach((waitlist, index) => {
            if (waitlist.position !== index + 1) {
                this.dataManager.updateWaitlist(waitlist.id, {
                    position: index + 1,
                    updatedAt: new Date().toISOString()
                });
                
                // Notificar cambio de posición si es significativo
                if (Math.abs(waitlist.position - (index + 1)) >= 2) {
                    const user = this.dataManager.getUser(waitlist.userId);
                    const cls = this.dataManager.getClass(classId);
                    
                    if (user && cls) {
                        this.dataManager.createNotification(
                            user.id,
                            'waitlist_position_changed',
                            'Cambió tu posición en la lista de espera',
                            `Tu posición en la lista de espera para ${cls.title} cambió a #${index + 1}`,
                            'info'
                        );
                    }
                }
            }
        });
    }
    
    // Obtener waitlists por clase
    getWaitlistsByClass(classId, filters = {}) {
        if (!this.isInitialized) {
            throw new Error('Waitlist System no inicializado');
        }
        
        let waitlists = this.dataManager.getWaitlistsByClass(classId);
        
        // Aplicar filtros
        if (filters.status) {
            waitlists = waitlists.filter(w => w.status === filters.status);
        }
        
        if (filters.userId) {
            waitlists = waitlists.filter(w => w.userId === filters.userId);
        }
        
        // Ordenar por posición
        waitlists.sort((a, b) => a.position - b.position);
        
        return waitlists;
    }
    
    // Obtener waitlists por usuario
    getWaitlistsByUser(userId, filters = {}) {
        if (!this.isInitialized) {
            throw new Error('Waitlist System no inicializado');
        }
        
        let waitlists = this.dataManager.getWaitlistsByUser(userId);
        
        // Aplicar filtros
        if (filters.status) {
            waitlists = waitlists.filter(w => w.status === filters.status);
        }
        
        if (filters.classId) {
            waitlists = waitlists.filter(w => w.classId === filters.classId);
        }
        
        // Ordenar por fecha de ingreso (más recientes primero)
        waitlists.sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt));
        
        return waitlists;
    }
    
    // Verificar si hay cupos disponibles y promover de waitlist
    async checkAndPromoteFromWaitlist(classId) {
        if (!this.isInitialized) {
            throw new Error('Waitlist System no inicializado');
        }
        
        const cls = this.dataManager.getClass(classId);
        if (!cls) {
            throw new Error('Clase no encontrada');
        }
        
        // Calcular cupos disponibles
        const availableSpots = cls.capacity - cls.booked;
        
        if (availableSpots <= 0) {
            console.log(`📊 Clase ${cls.title} sin cupos disponibles`);
            return [];
        }
        
        // Obtener waitlists para esta clase (solo waiting)
        const waitlists = this.getWaitlistsByClass(classId, { status: 'waiting' });
        
        if (waitlists.length === 0) {
            console.log(`📊 No hay waitlists para clase ${cls.title}`);
            return [];
        }
        
        // Ordenar por posición
        waitlists.sort((a, b) => a.position - b.position);
        
        // Tomar los primeros N según cupos disponibles
        const toPromote = waitlists.slice(0, Math.min(availableSpots, waitlists.length));
        
        console.log(`📊 ${availableSpots} cupos disponibles, ${toPromote.length} usuarios a promover`);
        
        const promoted = [];
        
        // Promover cada usuario
        for (const waitlist of toPromote) {
            try {
                const result = await this.promoteFromWaitlist(waitlist.id);
                if (result) {
                    promoted.push(result);
                }
            } catch (error) {
                console.error(`❌ Error promoviendo waitlist ${waitlist.id}:`, error);
            }
        }
        
        return promoted;
    }
    
    // Promover usuario de waitlist a reserva
    async promoteFromWaitlist(waitlistId) {
        if (!this.isInitialized) {
            throw new Error('Waitlist System no inicializado');
        }
        
        const waitlist = this.dataManager.getWaitlist(waitlistId);
        if (!waitlist) {
            throw new Error('Waitlist no encontrada');
        }
        
        if (waitlist.status !== 'waiting') {
            throw new Error(`Waitlist no está en estado waiting (actual: ${waitlist.status})`);
        }
        
        const cls = this.dataManager.getClass(waitlist.classId);
        const user = this.dataManager.getUser(waitlist.userId);
        
        if (!cls || !user) {
            throw new Error('Información de clase o usuario no encontrada');
        }
        
        // Verificar que aún haya cupo
        if (cls.booked >= cls.capacity) {
            throw new Error('La clase ya está llena');
        }
        
        // Ofrecer promoción (simular notificación)
        console.log(`🎯 Ofreciendo promoción a ${user.email} para clase ${cls.title}`);
        
        // Actualizar waitlist con oferta de promoción
        const updatedWaitlist = this.dataManager.updateWaitlist(waitlistId, {
            status: 'promotion_offered',
            promotionOffered: true,
            promotionOfferedAt: new Date().toISOString(),
            promotionExpiresAt: new Date(Date.now() + this.config.promotionWindow * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString()
        });
        
        // Crear notificación para el usuario
        this.dataManager.createNotification(
            user.id,
            'waitlist_promotion',
            '¡Cupo disponible!',
            `Hay un cupo disponible para ${cls.title}. Tienes ${this.config.promotionWindow} minutos para aceptar.`,
            'success'
        );
        
        // Disparar evento
        this.dispatchEvent('waitlist:promotionOffered', {
            waitlist: updatedWaitlist,
            user: user,
            class: cls,
            expiresAt: updatedWaitlist.promotionExpiresAt
        });
        
        // Simular espera de respuesta (en producción sería con webhook o polling)
        if (this.config.autoPromote) {
            // En demo, aceptamos automáticamente después de un delay
            setTimeout(() => {
                this.acceptPromotion(waitlistId).catch(console.error);
            }, this.config.notificationDelay);
        }
        
        return updatedWaitlist;
    }
    
    // Aceptar promoción de waitlist
    async acceptPromotion(waitlistId) {
        if (!this.isInitialized) {
            throw new Error('Waitlist System no inicializado');
        }
        
        const waitlist = this.dataManager.getWaitlist(waitlistId);
        if (!waitlist) {
            throw new Error('Waitlist no encontrada');
        }
        
        if (waitlist.status !== 'promotion_offered') {
            throw new Error('No hay una promoción ofrecida para esta waitlist');
        }
        
        // Verificar que la promoción no haya expirado
        if (waitlist.promotionExpiresAt && new Date(waitlist.promotionExpiresAt) < new Date()) {
            throw new Error('La promoción ha expirado');
        }
        
        const cls = this.dataManager.getClass(waitlist.classId);
        const user = this.dataManager.getUser(waitlist.userId);
        
        if (!cls || !user) {
            throw new Error('Información de clase o usuario no encontrada');
        }
        
        // Verificar que aún haya cupo
        if (cls.booked >= cls.capacity) {
            // Revertir a waiting
            this.dataManager.updateWaitlist(waitlistId, {
                status: 'waiting',
                promotionOffered: false,
                promotionExpiresAt: null,
                updatedAt: new Date().toISOString()
            });
            
            throw new Error('El cupo ya no está disponible');
        }
        
        // Crear reserva
        const bookingData = {
            userId: user.id,
            classId: cls.id,
            date: this.extractDateFromSchedule(cls.schedule),
            time: this.extractTimeFromSchedule(cls.schedule),
            status: 'confirmed',
            createdAt: new Date().toISOString(),
            waitlistPromoted: true,
            originalWaitlistId: waitlistId
        };
        
        const booking = this.dataManager.createBooking(bookingData);
        
        if (!booking) {
            throw new Error('Error creando reserva');
        }
        
        // Actualizar cupo de la clase
        this.dataManager.updateClass(cls.id, {
            booked: cls.booked + 1,
            updatedAt: new Date().toISOString()
        });
        
        // Actualizar waitlist como completada
        this.dataManager.updateWaitlist(waitlistId, {
            status: 'promoted',
            promotedAt: new Date().toISOString(),
            bookingId: booking.id,
            updatedAt: new Date().toISOString()
        });
        
        // Crear notificación
        this.dataManager.createNotification(
            user.id,
            'waitlist_promoted',
            '¡Reserva confirmada desde lista de espera!',
            `Tu reserva para ${cls.title} ha sido confirmada desde la lista de espera.`,
            'success'
        );
        
        console.log(`✅ Usuario ${user.email} promovido de waitlist a reserva para ${cls.title}`);
        
        // Disparar evento
        this.dispatchEvent('waitlist:promoted', {
            waitlist: waitlist,
            booking: booking,
            user: user,
            class: cls
        });
        
        // Recalcular posiciones para esta clase
        this.recalculatePositions(cls.id);
        
        return {
            waitlist: waitlist,
            booking: booking,
            user: user,
            class: cls
        };
    }
    
    // Rechazar promoción de waitlist
    rejectPromotion(waitlistId) {
        if (!this.isInitialized) {
            throw new Error('Waitlist System no inicializado');
        }
        
        const waitlist = this.dataManager.getWaitlist(waitlistId);
        if (!waitlist) {
            throw new Error('Waitlist no encontrada');
        }
// Continuación de waitlist-system.js

        if (waitlist.status !== 'promotion_offered') {
            throw new Error('No hay una promoción ofrecida para esta waitlist');
        }
        
        const cls = this.dataManager.getClass(waitlist.classId);
        const user = this.dataManager.getUser(waitlist.userId);
        
        // Revertir a waiting (pero al final de la lista)
        const updatedWaitlist = this.dataManager.updateWaitlist(waitlistId, {
            status: 'waiting',
            promotionOffered: false,
            promotionExpiresAt: null,
            position: 999, // Será recalculado
            updatedAt: new Date().toISOString()
        });
        
        // Recalcular posiciones (este usuario irá al final)
        this.recalculatePositions(cls.id);
        
        // Crear notificación
        if (user) {
            this.dataManager.createNotification(
                user.id,
                'waitlist_promotion_rejected',
                'Promoción rechazada',
                `Rechazaste el cupo disponible para ${cls?.title || 'la clase'}. Volviste a la lista de espera.`,
                'info'
            );
        }
        
        console.log(`❌ Usuario ${user?.email || waitlist.userId} rechazó promoción para ${cls?.title || waitlist.classId}`);
        
        // Disparar evento
        this.dispatchEvent('waitlist:promotionRejected', {
            waitlist: updatedWaitlist,
            user: user,
            class: cls
        });
        
        // Buscar siguiente en waitlist para ofrecer promoción
        setTimeout(() => {
            this.checkAndPromoteFromWaitlist(cls.id).catch(console.error);
        }, 1000);
        
        return updatedWaitlist;
    }
    
    // Extraer fecha del schedule (simplificado para demo)
    extractDateFromSchedule(schedule) {
        // En una implementación real, esto parsearía el schedule
        // Para demo, usamos fecha de hoy + días según el día de la semana
        const today = new Date();
        const dayMap = {
            'lunes': 1, 'martes': 2, 'miércoles': 3, 'jueves': 4, 'viernes': 5, 'sábado': 6, 'domingo': 0
        };
        
        const lowerSchedule = schedule.toLowerCase();
        for (const [day, offset] of Object.entries(dayMap)) {
            if (lowerSchedule.includes(day)) {
                const targetDate = new Date(today);
                const currentDay = today.getDay();
                const daysToAdd = (offset - currentDay + 7) % 7;
                targetDate.setDate(today.getDate() + daysToAdd);
                return targetDate.toISOString().split('T')[0];
            }
        }
        
        // Si no encontramos día, usamos mañana
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    }
    
    // Extraer hora del schedule
    extractTimeFromSchedule(schedule) {
        // Buscar patrón de hora (HH:MM)
        const timeMatch = schedule.match(/\b(\d{1,2}):(\d{2})\b/);
        if (timeMatch) {
            let hours = parseInt(timeMatch[1]);
            const minutes = timeMatch[2];
            
            // Ajustar formato 24h
            if (schedule.toLowerCase().includes('pm') && hours < 12) {
                hours += 12;
            }
            
            return `${hours.toString().padStart(2, '0')}:${minutes}`;
        }
        
        // Hora por defecto para demo
        return '18:00';
    }
    
    // Configurar event listeners
    setupEventListeners() {
        // Escuchar cancelaciones de reservas
        document.addEventListener('booking:cancelled', (e) => {
            const { booking, class: cls } = e.detail;
            
            if (cls) {
                // Verificar si hay waitlists para esta clase
                setTimeout(() => {
                    this.checkAndPromoteFromWaitlist(cls.id).catch(console.error);
                }, 500);
            }
        });
        
        // Escuchar cambios en capacidad de clases
        if (this.dataManager.addEventListener) {
            this.dataManager.addEventListener('classUpdated', (e) => {
                const { newClass: cls } = e.detail;
                
                // Si hay más capacidad, verificar waitlists
                setTimeout(() => {
                    this.checkAndPromoteFromWaitlist(cls.id).catch(console.error);
                }, 500);
            });
        }
        
        // Limpiar waitlists expiradas periódicamente
        setInterval(() => {
            this.cleanupExpiredWaitlists();
        }, 5 * 60 * 1000); // Cada 5 minutos
    }
    
    // Limpiar waitlists expiradas
    cleanupExpiredWaitlists() {
        if (!this.isInitialized) return;
        
        const allWaitlists = this.dataManager.getAllWaitlists();
        const now = new Date();
        
        let cleaned = 0;
        
        allWaitlists.forEach(waitlist => {
            // Limpiar promociones expiradas
            if (waitlist.status === 'promotion_offered' && waitlist.promotionExpiresAt) {
                const expiresAt = new Date(waitlist.promotionExpiresAt);
                
                if (expiresAt < now) {
                    // Promoción expirada, rechazar automáticamente
                    this.rejectPromotion(waitlist.id);
                    cleaned++;
                }
            }
            
            // Limpiar waitlists muy antiguas (más de 30 días)
            const joinedAt = new Date(waitlist.joinedAt);
            const daysOld = (now - joinedAt) / (1000 * 60 * 60 * 24);
            
            if (daysOld > 30 && waitlist.status === 'waiting') {
                this.leaveWaitlist(waitlist.id, waitlist.userId);
                cleaned++;
            }
        });
        
        if (cleaned > 0) {
            console.log(`🧹 Limpiadas ${cleaned} waitlists expiradas/antiguas`);
        }
    }
    
    // Obtener estadísticas de waitlists
    getWaitlistStats() {
        if (!this.isInitialized) {
            throw new Error('Waitlist System no inicializado');
        }
        
        const allWaitlists = this.dataManager.getAllWaitlists();
        const allClasses = this.dataManager.getAllClasses();
        
        const stats = {
            totalWaitlists: allWaitlists.length,
            waiting: 0,
            promotionOffered: 0,
            promoted: 0,
            byClass: {},
            byStatus: {},
            averageWaitTime: 0
        };
        
        // Contar por estado
        allWaitlists.forEach(waitlist => {
            stats[waitlist.status] = (stats[waitlist.status] || 0) + 1;
            
            // Por clase
            if (!stats.byClass[waitlist.classId]) {
                const cls = this.dataManager.getClass(waitlist.classId);
                stats.byClass[waitlist.classId] = {
                    className: cls?.title || waitlist.classId,
                    total: 0,
                    waiting: 0,
                    promotionOffered: 0,
                    promoted: 0
                };
            }
            
            stats.byClass[waitlist.classId].total++;
            stats.byClass[waitlist.classId][waitlist.status]++;
            
            // Por estado general
            stats.byStatus[waitlist.status] = (stats.byStatus[waitlist.status] || 0) + 1;
        });
        
        // Calcular tiempo promedio de espera (solo para waitlists promovidas)
        const promotedWaitlists = allWaitlists.filter(w => w.status === 'promoted' && w.promotedAt);
        if (promotedWaitlists.length > 0) {
            const totalWaitTime = promotedWaitlists.reduce((sum, w) => {
                const joined = new Date(w.joinedAt);
                const promoted = new Date(w.promotedAt);
                return sum + (promoted - joined);
            }, 0);
            
            stats.averageWaitTime = Math.round(totalWaitTime / promotedWaitlists.length / (1000 * 60)); // en minutos
        }
        
        // Clases con waitlist más larga
        stats.topClasses = Object.entries(stats.byClass)
            .map(([classId, classStats]) => ({
                classId,
                ...classStats
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);
        
        return stats;
    }
    
    // Disparar eventos personalizados
    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, {
            detail: {
                ...detail,
                source: 'WaitlistSystem',
                timestamp: new Date().toISOString()
            }
        });
        
        document.dispatchEvent(event);
    }
    
    // Obtener información del sistema
    getSystemInfo() {
        return {
            initialized: this.isInitialized,
            config: this.config,
            stats: this.isInitialized ? this.getWaitlistStats() : null
        };
    }
}

// Crear instancia global
if (typeof window !== 'undefined') {
    window.barraboxWaitlist = new WaitlistSystem();
    
    // Exponer para debugging
    window.debugWaitlistSystem = () => {
        console.log('🔧 Debug Waitlist System:', window.barraboxWaitlist.getSystemInfo());
    };
    
    console.log('📋 Waitlist System cargado como window.barraboxWaitlist');
}

// ==================== INTEGRACIÓN CON UI ====================

// Función para integrar waitlist en la UI de booking
function integrateWaitlistUI() {
    console.log('🎨 Integrando Waitlist UI...');
    
    // Esperar a que los sistemas estén listos
    const checkInterval = setInterval(() => {
        if (window.barraboxWaitlist && window.barraboxWaitlist.isInitialized &&
            window.barraboxDataManager && window.barraboxAuth) {
            clearInterval(checkInterval);
            setupWaitlistUI();
        }
    }, 100);
    
    function setupWaitlistUI() {
        // Modificar botones de reserva en el calendario
        document.addEventListener('calendar:classRendered', (e) => {
            const { classElement, class: cls } = e.detail;
            
            if (classElement && cls) {
                const bookButton = classElement.querySelector('.btn-book');
                const statusBadge = classElement.querySelector('.class-status');
                
                if (bookButton && statusBadge) {
                    // Verificar si la clase está llena
                    if (cls.booked >= cls.capacity) {
                        // Cambiar a botón de waitlist
                        bookButton.textContent = 'Lista de Espera';
                        bookButton.classList.remove('btn-book');
                        bookButton.classList.add('btn-waitlist');
                        bookButton.dataset.classId = cls.id;
                        
                        // Agregar event listener
                        bookButton.addEventListener('click', handleWaitlistJoin);
                    }
                }
            }
        });
        
        // Agregar sección de waitlists en el perfil
        const profileSection = document.querySelector('.profile-section');
        if (profileSection) {
            const waitlistSection = document.createElement('div');
            waitlistSection.className = 'profile-waitlists';
            waitlistSection.innerHTML = `
                <h3><i class="fas fa-clock"></i> Mis Listas de Espera</h3>
                <div id="userWaitlists" class="waitlists-list">
                    <!-- Waitlists se cargarán aquí -->
                </div>
            `;
            profileSection.appendChild(waitlistSection);
            
            // Cargar waitlists del usuario
            loadUserWaitlists();
        }
        
        console.log('✅ Waitlist UI integrada');
    }
    
    // Manejar unirse a waitlist
    async function handleWaitlistJoin(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const button = e.target.closest('.btn-waitlist');
        if (!button) return;
        
        const classId = button.dataset.classId;
        
        try {
            // Verificar autenticación
            if (!window.barraboxAuth.isLoggedIn()) {
                alert('Debes iniciar sesión para unirte a la lista de espera');
                return;
            }
            
            // Unirse a waitlist
            const waitlist = await window.barraboxWaitlist.joinWaitlist(classId);
            
            // Actualizar UI
            button.textContent = 'En Lista de Espera';
            button.disabled = true;
            button.classList.remove('btn-waitlist');
            button.classList.add('btn-waitlist-joined');
            
            // Mostrar notificación
            if (window.barraboxAuth.showMessage) {
                window.barraboxAuth.showMessage('success', `Te uniste a la lista de espera. Posición: #${waitlist.position}`);
            }
            
            // Actualizar lista de waitlists del usuario
            loadUserWaitlists();
            
        } catch (error) {
            console.error('Error uniéndose a waitlist:', error);
            
            if (window.barraboxAuth.showMessage) {
                window.barraboxAuth.showMessage('error', error.message);
            }
        }
    }
    
    // Cargar waitlists del usuario
    async function loadUserWaitlists() {
        const container = document.getElementById('userWaitlists');
        if (!container) return;
        
        try {
            const currentUser = window.barraboxAuth.getCurrentUser();
            const waitlists = window.barraboxWaitlist.getWaitlistsByUser(currentUser.id);
            
            if (waitlists.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-clock"></i>
                        <p>No estás en ninguna lista de espera</p>
                    </div>
                `;
                return;
            }
            
            let html = '<div class="waitlist-items">';
            
            waitlists.forEach(waitlist => {
                const cls = window.barraboxDataManager.getClass(waitlist.classId);
                if (!cls) return;
                
                const statusText = {
                    'waiting': 'En espera',
                    'promotion_offered': '¡Cupo disponible!',
                    'promoted': 'Promovido a reserva'
                }[waitlist.status] || waitlist.status;
                
                const statusClass = {
                    'waiting': 'status-waiting',
                    'promotion_offered': 'status-promotion',
                    'promoted': 'status-promoted'
                }[waitlist.status] || '';
                
                html += `
                    <div class="waitlist-item ${statusClass}" data-waitlist-id="${waitlist.id}">
                        <div class="waitlist-info">
                            <div class="waitlist-class">${cls.title}</div>
                            <div class="waitlist-details">
                                <span class="waitlist-position">Posición: #${waitlist.position}</span>
                                <span class="waitlist-status">${statusText}</span>
                                <span class="waitlist-date">Unido: ${new Date(waitlist.joinedAt).toLocaleDateString('es-ES')}</span>
                            </div>
                        </div>
                        <div class="waitlist-actions">
                            ${waitlist.status === 'promotion_offered' ? `
                                <button class="btn btn-sm btn-success accept-promotion" data-waitlist-id="${waitlist.id}">
                                    <i class="fas fa-check"></i> Aceptar
                                </button>
                                <button class="btn btn-sm btn-outline reject-promotion" data-waitlist-id="${waitlist.id}">
                                    <i class="fas fa-times"></i> Rechazar
                                </button>
                            ` : ''}
                            ${waitlist.status === 'waiting' ? `
                                <button class="btn btn-sm btn-outline leave-waitlist" data-waitlist-id="${waitlist.id}">
                                    <i class="fas fa-sign-out-alt"></i> Salir
                                </button>
                            ` : ''}
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
            container.innerHTML = html;
            
            // Configurar event listeners
            container.querySelectorAll('.accept-promotion').forEach(btn => {
                btn.addEventListener('click', handleAcceptPromotion);
            });
            
            container.querySelectorAll('.reject-promotion').forEach(btn => {
                btn.addEventListener('click', handleRejectPromotion);
            });
            
            container.querySelectorAll('.leave-waitlist').forEach(btn => {
                btn.addEventListener('click', handleLeaveWaitlist);
            });
            
        } catch (error) {
            console.error('Error cargando waitlists:', error);
            container.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error cargando listas de espera</p>
                </div>
            `;
        }
    }
    
    // Manejar aceptar promoción
    async function handleAcceptPromotion(e) {
        const waitlistId = e.target.closest('button').dataset.waitlistId;
        
        try {
            await window.barraboxWaitlist.acceptPromotion(waitlistId);
            
            if (window.barraboxAuth.showMessage) {
                window.barraboxAuth.showMessage('success', '¡Reserva confirmada desde lista de espera!');
            }
            
            // Recargar waitlists
            loadUserWaitlists();
            
        } catch (error) {
            console.error('Error aceptando promoción:', error);
            
            if (window.barraboxAuth.showMessage) {
                window.barraboxAuth.showMessage('error', error.message);
            }
        }
    }
    
    // Manejar rechazar promoción
    async function handleRejectPromotion(e) {
        const waitlistId = e.target.closest('button').dataset.wait