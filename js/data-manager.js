// Data Manager - Sistema de persistencia en localStorage para Barrabox Gym
// Versión: 1.0.0

class DataManager {
    constructor() {
        this.STORAGE_KEY = 'barrabox_gym_data';
        this.SCHEMA_VERSION = '1.0';
        this.DEFAULT_DATA = this.getDefaultData();
        
        // Inicializar datos si no existen
        this.initializeData();
        
        console.log('📊 Data Manager inicializado - Versión:', this.SCHEMA_VERSION);
    }
    
    // ==================== DATOS POR DEFECTO ====================
    
    getDefaultData() {
        return {
            schemaVersion: this.SCHEMA_VERSION,
            lastUpdated: new Date().toISOString(),
            
            // Modelos de datos
            users: this.getDefaultUsers(),
            classes: this.getDefaultClasses(),
            bookings: [],
            waitlists: [],
            notifications: []
        };
    }
    
    getDefaultUsers() {
        return [
            {
                id: 'user_001',
                email: 'juan.perez@ejemplo.com',
                name: 'Juan Pérez',
                role: 'member',
                plan: 'premium',
                status: 'active',
                joinDate: '2026-03-15',
                phone: '+56912345678',
                avatarColor: '#FF6B35'
            },
            {
                id: 'user_002',
                email: 'maria.gonzalez@ejemplo.com',
                name: 'María González',
                role: 'member',
                plan: 'basic',
                status: 'active',
                joinDate: '2026-03-20',
                phone: '+56987654321',
                avatarColor: '#00A8A8'
            },
            {
                id: 'user_003',
                email: 'carlos.lopez@ejemplo.com',
                name: 'Carlos López',
                role: 'member',
                plan: 'premium',
                status: 'active',
                joinDate: '2026-04-01',
                phone: '+56911223344',
                avatarColor: '#2D3047'
            },
            {
                id: 'user_004',
                email: 'usuario@barrabox.cl',
                name: 'Usuario Demo',
                role: 'member',
                plan: 'premium',
                status: 'active',
                joinDate: '2026-04-10',
                phone: '+56955556666',
                avatarColor: '#28A745'
            },
            {
                id: 'admin_001',
                email: 'admin@barrabox.cl',
                name: 'Administrador Barrabox',
                role: 'admin',
                plan: 'admin',
                status: 'active',
                joinDate: '2026-01-01',
                phone: '+56900000000',
                avatarColor: '#DC3545'
            }
        ];
    }
    
    getDefaultClasses() {
        // Clases para la semana actual (Lun-Sáb, Dom cerrado)
        const baseDate = new Date('2026-04-13');
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const classTypes = [
            { type: 'crossfit', title: 'CrossFit AM', coach: 'Carlos', capacity: 15, duration: 60 },
            { type: 'halterofilia', title: 'Técnica Arranque', coach: 'Ana', capacity: 10, duration: 60 },
            { type: 'gap', title: 'Core & Stability', coach: 'Sofia', capacity: 12, duration: 45 },
            { type: 'crossfit', title: 'WOD Competidores', coach: 'Marco', capacity: 15, duration: 75 },
            { type: 'halterofilia', title: 'Fuerza Olímpica', coach: 'Carlos', capacity: 8, duration: 60 },
            { type: 'gap', title: 'Glúteos & Abdomen', coach: 'Sofia', capacity: 12, duration: 45 },
            { type: 'crossfit', title: 'Evening WOD', coach: 'Marco', capacity: 15, duration: 60 }
        ];
        
        const times = ['06:00', '08:00', '10:00', '12:00', '14:00', '17:00', '19:00', '20:00'];
        
        let classes = [];
        let classId = 1;
        
        // Generar clases para cada día (Lun-Sáb)
        days.forEach((day, dayIndex) => {
            // Para cada tipo de clase, asignar un horario
            classTypes.forEach((classType, typeIndex) => {
                const timeIndex = typeIndex % times.length;
                const time = times[timeIndex];
                
                // Calcular fecha para esta clase
                const classDate = new Date(baseDate);
                classDate.setDate(baseDate.getDate() + dayIndex);
                
                classes.push({
                    id: `class_${classId.toString().padStart(3, '0')}`,
                    type: classType.type,
                    title: classType.title,
                    coach: classType.coach,
                    day: day,
                    date: classDate.toISOString().split('T')[0],
                    time: time,
                    duration: classType.duration,
                    capacity: classType.capacity,
                    booked: Math.floor(Math.random() * (classType.capacity * 0.7)), // 0-70% ocupado
                    room: 'Sala Principal',
                    description: `Clase de ${classType.type} diseñada para mejorar tu técnica y condición física.`,
                    status: 'active'
                });
                
                classId++;
            });
        });
        
        return classes;
    }
    
    // ==================== OPERACIONES CRUD BÁSICAS ====================
    
    // Obtener todos los datos
    getAllData() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        if (!data) {
            return this.DEFAULT_DATA;
        }
        
        try {
            return JSON.parse(data);
        } catch (error) {
            console.error('❌ Error al parsear datos:', error);
            return this.DEFAULT_DATA;
        }
    }
    
    // Guardar todos los datos
    saveAllData(data) {
        try {
            data.lastUpdated = new Date().toISOString();
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data, null, 2));
            return true;
        } catch (error) {
            console.error('❌ Error al guardar datos:', error);
            return false;
        }
    }
    
    // Inicializar datos si no existen
    initializeData() {
        const existingData = localStorage.getItem(this.STORAGE_KEY);
        if (!existingData) {
            console.log('📝 Inicializando datos por primera vez...');
            this.saveAllData(this.DEFAULT_DATA);
        } else {
            // Verificar versión del esquema
            try {
                const data = JSON.parse(existingData);
                if (data.schemaVersion !== this.SCHEMA_VERSION) {
                    console.log('🔄 Actualizando esquema de datos...');
                    this.migrateData(data);
                }
            } catch (error) {
                console.error('❌ Error al verificar esquema:', error);
            }
        }
    }
    
    // Migrar datos (para futuras versiones)
    migrateData(oldData) {
        // Por ahora, simplemente reemplazar con datos nuevos
        // En versiones futuras, aquí se harían migraciones específicas
        this.saveAllData(this.DEFAULT_DATA);
    }
    
    // ==================== OPERACIONES POR MODELO ====================
    
    // USUARIOS
    getUsers() {
        return this.getAllData().users;
    }
    
    getUserById(id) {
        return this.getUsers().find(user => user.id === id);
    }
    
    getUserByEmail(email) {
        return this.getUsers().find(user => user.email.toLowerCase() === email.toLowerCase());
    }
    
    saveUser(user) {
        const data = this.getAllData();
        const index = data.users.findIndex(u => u.id === user.id);
        
        if (index >= 0) {
            // Actualizar usuario existente
            data.users[index] = { ...data.users[index], ...user };
        } else {
            // Crear nuevo usuario
            if (!user.id) {
                user.id = `user_${(data.users.length + 1).toString().padStart(3, '0')}`;
            }
            data.users.push(user);
        }
        
        return this.saveAllData(data);
    }
    
    deleteUser(id) {
        const data = this.getAllData();
        data.users = data.users.filter(user => user.id !== id);
        return this.saveAllData(data);
    }
    
    // CLASES
    getClasses() {
        return this.getAllData().classes;
    }
    
    getClassById(id) {
        return this.getClasses().find(cls => cls.id === id);
    }
    
    getClassesByDay(day) {
        return this.getClasses().filter(cls => cls.day === day);
    }
    
    getClassesByDate(date) {
        return this.getClasses().filter(cls => cls.date === date);
    }
    
    saveClass(cls) {
        const data = this.getAllData();
        const index = data.classes.findIndex(c => c.id === cls.id);
        
        if (index >= 0) {
            // Actualizar clase existente
            data.classes[index] = { ...data.classes[index], ...cls };
        } else {
            // Crear nueva clase
            if (!cls.id) {
                cls.id = `class_${(data.classes.length + 1).toString().padStart(3, '0')}`;
            }
            data.classes.push(cls);
        }
        
        return this.saveAllData(data);
    }
    
    deleteClass(id) {
        const data = this.getAllData();
        data.classes = data.classes.filter(cls => cls.id !== id);
        return this.saveAllData(data);
    }
    
    // RESERVAS
    getBookings() {
        return this.getAllData().bookings;
    }
    
    getBookingById(id) {
        return this.getBookings().find(booking => booking.id === id);
    }
    
    getUserBookings(userId) {
        return this.getBookings().filter(booking => booking.userId === userId);
    }
    
    getClassBookings(classId) {
        return this.getBookings().filter(booking => booking.classId === classId);
    }
    
    createBooking(userId, classId, date, time) {
        const data = this.getAllData();
        
        // Verificar que la clase existe
        const classItem = this.getClassById(classId);
        if (!classItem) {
            throw new Error('Clase no encontrada');
        }
        
        // Verificar que hay cupos disponibles
        const classBookings = this.getClassBookings(classId).filter(b => b.status === 'confirmed');
        if (classBookings.length >= classItem.capacity) {
            throw new Error('Clase llena');
        }
        
        // Verificar que el usuario no tenga ya una reserva para esta clase
        const existingBooking = data.bookings.find(b => 
            b.userId === userId && 
            b.classId === classId && 
            b.date === date && 
            b.status !== 'cancelled'
        );
        
        if (existingBooking) {
            throw new Error('Ya tienes una reserva para esta clase');
        }
        
        // Crear nueva reserva
        const booking = {
            id: `book_${(data.bookings.length + 1).toString().padStart(3, '0')}`,
            userId: userId,
            classId: classId,
            date: date,
            time: time,
            status: 'confirmed',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        data.bookings.push(booking);
        
        // Actualizar contador de reservas en la clase
        const classIndex = data.classes.findIndex(c => c.id === classId);
        if (classIndex >= 0) {
            data.classes[classIndex].booked = classBookings.length + 1;
        }
        
        // Crear notificación
        this.createNotification(
            userId,
            'booking_confirmation',
            'Reserva Confirmada',
            `Tu reserva para ${classItem.title} (${date} ${time}) ha sido confirmada.`
        );
        
        return this.saveAllData(data) ? booking : null;
    }
    
    cancelBooking(bookingId) {
        const data = this.getAllData();
        const bookingIndex = data.bookings.findIndex(b => b.id === bookingId);
        
        if (bookingIndex < 0) {
            throw new Error('Reserva no encontrada');
        }
        
        const booking = data.bookings[bookingIndex];
        
        // Actualizar estado de la reserva
        data.bookings[bookingIndex].status = 'cancelled';
        data.bookings[bookingIndex].updatedAt = new Date().toISOString();
        
        // Actualizar contador de reservas en la clase
        const classIndex = data.classes.findIndex(c => c.id === booking.classId);
        if (classIndex >= 0) {
            const classBookings = this.getClassBookings(booking.classId)
                .filter(b => b.status === 'confirmed');
            data.classes[classIndex].booked = classBookings.length;
        }
        
        // Crear notificación
        const classItem = this.getClassById(booking.classId);
        this.createNotification(
            booking.userId,
            'booking_cancellation',
            'Reserva Cancelada',
            `Tu reserva para ${classItem.title} ha sido cancelada.`
        );
        
        // Verificar waitlist para esta clase
        this.processWaitlist(booking.classId, booking.date);
        
        return this.saveAllData(data);
    }
    
    // WAITLISTS
    getWaitlists() {
        return this.getAllData().waitlists;
    }
    
    joinWaitlist(userId, classId, date) {
        const data = this.getAllData();
        
        // Verificar que el usuario no esté ya en la waitlist
        const existingWaitlist = data.waitlists.find(w => 
            w.userId === userId && 
            w.classId === classId && 
            w.date === date
        );
        
        if (existingWaitlist) {
            throw new Error('Ya estás en la waitlist para esta clase');
        }
        
        // Obtener posición en la waitlist
        const classWaitlists = data.waitlists.filter(w => w.classId === classId && w.date === date);
        const position = classWaitlists.length + 1;
        
        const waitlist = {
            id: `wait_${(data.waitlists.length + 1).toString().padStart(3, '0')}`,
            userId: userId,
            classId: classId,
            date: date,
            position: position,
            joinedAt: new Date().toISOString(),
            status: 'waiting'
        };
        
        data.waitlists.push(waitlist);
        
        // Crear notificación
        const classItem = this.getClassById(classId);
        this.createNotification(
            userId,
            'waitlist_joined',
            'Agregado a Waitlist',
            `Te has unido a la waitlist para ${classItem.title}. Tu posición: ${position}`
        );
        
        return this.saveAllData(data) ? waitlist : null;
    }
    
    processWaitlist(classId, date) {
        const data = this.getAllData();
        const waitlists = data.waitlists
            .filter(w => w.classId === classId && w.date === date && w.status === 'waiting')
            .sort((a, b) => a.position - b.position);
        
        if (waitlists.length === 0) return;
        
        // Tomar el primero en la waitlist
        const nextInLine = waitlists[0];
        
        // Intentar crear reserva automáticamente
        try {
            const booking = this.createBooking(nextInLine.userId, classId, date, nextInLine.time);
            
            if (booking) {
                // Actualizar estado de la waitlist
                const waitlistIndex = data.waitlists.findIndex(w => w.id === nextInLine.id);
                if (waitlistIndex >= 0) {
                    data.waitlists[waitlistIndex].status = 'promoted';
                    data.waitlists[waitlistIndex].promotedAt = new Date().toISOString();
                    data.waitlists[waitlistIndex].bookingId = booking.id;
                }
                
                // Recalcular posiciones para los demás en waitlist
                data.waitlists
                    .filter(w => w.classId === classId && w.date === date && w.status === 'waiting')
                    .forEach((w, index) => {
                        w.position = index + 1;
                    });
                
                this.saveAllData(data);
                
                // Notificar al usuario
                const classItem = this.getClassById(classId);
                this.createNotification(
                    nextInLine.userId,
                    'waitlist_promoted',
                    '¡Cupo Disponible!',
                    `Hay un cupo disponible para ${classItem.title}. Tu reserva ha sido creada automáticamente.`
                );
            }
        } catch (error) {
            console.error('Error al procesar waitlist:', error);
        }
    }
    
    // NOTIFICACIONES
    getNotifications() {
        return this.getAllData().notifications;
    }
    
    getUserNotifications(userId) {
        return this.getNotifications()
            .filter(n => n.userId === userId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    createNotification(userId, type, title, message) {
        const data = this.getAllData();
        
        const notification = {
            id: `notif_${(data.notifications.length + 1).toString().padStart(3, '0')}`,
            userId: userId,
            type: type,
            title: title,
            message: message,
            read: false,
            createdAt: new Date().toISOString()
        };
        
        data.notifications.push(notification);
        return this.saveAllData(data) ? notification : null;
    }
    
    markNotificationAsRead(notificationId) {
        const data = this.getAllData();
        const notificationIndex = data.notifications.findIndex(n => n.id === notificationId);
        
        if (notificationIndex >= 0) {
            data.notifications[notificationIndex].read = true;
            data.notifications[notificationIndex].readAt = new Date().toISOString();
            return this.saveAllData(data);
        }
        
        return false;
    }
    
    markAllNotificationsAsRead(userId) {
        const data = this.getAllData();
        let updated = false;
        
        data.notifications.forEach(notification => {
            if (notification.userId === userId && !notification.read) {
                notification.read = true;
                notification.readAt = new Date().toISOString();
                updated = true;
            }
        });
        
        if (updated) {
            return this.saveAllData(data);
        }
        
        return false;
    }
    
    // ==================== UTILIDADES ====================
    
    // Exportar todos los datos (para backup)
    exportData() {
        const data = this.getAllData();
        return JSON.stringify(data, null, 2);
    }
    
    // Importar datos (para restore)
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            // Validar estructura básica
            if (!data.users || !data.classes || !data.bookings) {
                throw new Error('Estructura de datos inválida');
            }
            
            // Asegurar que tenga la versión correcta
            data.schemaVersion = this.SCHEMA_VERSION;
            data.lastUpdated = new Date().toISOString();
            
            return this.saveAllData(data);
        } catch (error) {
            console.error('❌ Error al importar datos:', error);
            return false;
        }
    }
    
    // Resetear a datos por defecto
    resetData() {
        if (confirm('¿Estás seguro de que quieres resetear todos los datos? Se perderá toda la información.')) {
            return this.saveAllData(this.DEFAULT_DATA);
        }
        return false;
    }
    
    // Estadísticas del sistema
    getStats() {
        const data = this.getAllData();
        
        return {
            totalUsers: data.users.length,
            activeUsers: data.users.filter(u => u.status === 'active').length,
            totalClasses: data.classes.length,
            activeClasses: data.classes.filter(c => c.status === 'active').length,
            totalBookings: data.bookings.length,
            confirmedBookings: data.bookings.filter(b => b.status === 'confirmed').length,
            totalWaitlists: data.waitlists.length,
            activeWaitlists: data.waitlists.filter(w => w.status === 'waiting').length,
            totalNotifications: data.notifications.length,
            unreadNotifications: data.notifications.filter(n => !n.read).length,
            storageSize: JSON.stringify(data).length,
            lastUpdated: data.lastUpdated
        };
    }
    
    // Buscar clases disponibles para una fecha
    getAvailableClasses(date, time = null) {
        const classes = this.getClassesByDate(date);
        
        return classes.filter(cls => {
            // Filtrar por hora si se especifica
            if (time && cls.time !== time) return false;
            
            // Verificar que la clase esté activa
            if (cls.status !== 'active') return false;
            
            // Verificar que haya cupos disponibles
            const classBookings = this.getClassBookings(cls.id)
                .filter(b => b.status === 'confirmed' && b.date === date);
            
            return classBookings.length < cls.capacity;
        });
    }
    
    // Obtener ocupación de una clase
    getClassOccupancy(classId, date) {
        const classItem = this.getClassById(classId);
        if (!classItem) return null;
        
        const classBookings = this.getClassBookings(classId)
            .filter(b => b.status === 'confirmed' && b.date === date);
        
        return {
            class: classItem,
            bookings: classBookings.length,
            capacity: classItem.capacity,
            available: classItem.capacity - classBookings.length,
            occupancyPercentage: Math.round((classBookings.length / classItem.capacity) * 100)
        };
    }
    
    // Obtener próximas clases para un usuario
    getUserUpcomingClasses(userId) {
        const userBookings = this.getUserBookings(userId)
            .filter(b => b.status === 'confirmed')
            .sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));
        
        return userBookings.map(booking => {
            const classItem = this.getClassById(booking.classId);
            return {
                booking: booking,
                class: classItem,
                date: booking.date,
                time: booking.time
            };
        });
    }
    
    // Verificar si un usuario puede reservar una clase
    canUserBookClass(userId, classId, date) {
        const classItem = this.getClassById(classId);
        if (!classItem) return { canBook: false, reason: 'Clase no encontrada' };
        
        // Verificar que la clase esté activa
        if (classItem.status !== 'active') {
            return { canBook: false, reason: 'Clase no disponible' };
        }
        
        // Verificar fecha
        if (classItem.date !== date) {
            return { canBook: false, reason: 'Fecha no coincide' };
        }
        
        // Verificar cupos
        const classBookings = this.getClassBookings(classId)
            .filter(b => b.status === 'confirmed' && b.date === date);
        
        if (classBookings.length >= classItem.capacity) {
            return { canBook: false, reason: 'Clase llena' };
        }
        
        // Verificar que el usuario no tenga ya una reserva
        const existingBooking = this.getUserBookings(userId).find(b => 
            b.classId === classId && 
            b.date === date && 
            b.status === 'confirmed'
        );
        
        if (existingBooking) {
            return { canBook: false, reason: 'Ya tienes una reserva para esta clase' };
        }
        
        return { canBook: true, reason: '' };
    }
    
    // ==================== MÉTODOS DE AYUDA PARA UI ====================
    
    // Formatear fecha para display
    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('es-ES', options);
    }
    
    // Formatear hora para display
    formatTime(timeString) {
        return timeString;
    }
    
    // Obtener color para tipo de clase
    getClassTypeColor(type) {
        const colors = {
            crossfit: '#FF6B35',
            halterofilia: '#00A8A8',
            gap: '#2D3047'
        };
        return colors[type] || '#6C757D';
    }
    
    // Obtener icono para tipo de clase
    getClassTypeIcon(type) {
        const icons = {
            crossfit: 'fa-dumbbell',
            halterofilia: 'fa-weight-hanging',
            gap: 'fa-running'
        };
        return icons[type] || 'fa-calendar-alt';
    }
    
    // Obtener estado visual de una clase
    getClassStatus(classId, date) {
        const occupancy = this.getClassOccupancy(classId, date);
        if (!occupancy) return 'unknown';
        
        if (occupancy.available === 0) {
            return 'full';
        } else if (occupancy.available <= 3) {
            return 'almost-full';
        } else {
            return 'available';
        }
    }
    
    // ==================== DEBUG Y MONITOREO ====================
    
    // Mostrar resumen en consola
    debugSummary() {
        const stats = this.getStats();
        console.group('📊 Data Manager - Resumen del Sistema');
        console.log('👥 Usuarios:', stats.totalUsers, '(activos:', stats.activeUsers, ')');
        console.log('🏋️ Clases:', stats.totalClasses, '(activas:', stats.activeClasses, ')');
        console.log('📅 Reservas:', stats.totalBookings, '(confirmadas:', stats.confirmedBookings, ')');
        console.log('⏳ Waitlists:', stats.totalWaitlists, '(activas:', stats.activeWaitlists, ')');
        console.log('🔔 Notificaciones:', stats.totalNotifications, '(no leídas:', stats.unreadNotifications, ')');
        console.log('💾 Tamaño almacenamiento:', stats.storageSize, 'bytes');
        console.log('🕐 Última actualización:', stats.lastUpdated);
        console.groupEnd();
    }
    
    // Validar integridad de datos
    validateData() {
        const data = this.getAllData();
        const errors = [];
        
        // Validar usuarios
        data.users.forEach((user, index) => {
            if (!user.id || !user.email) {
                errors.push(`Usuario ${index}: Falta id o email`);
            }
        });
        
        // Validar clases
        data.classes.forEach((cls, index) => {
            if (!cls.id || !cls.type || !cls.title) {
                errors.push(`Clase ${index}: Falta id, type o title`);
            }
        });
        
        // Validar reservas
        data.bookings.forEach((booking, index) => {
            if (!booking.id || !booking.userId || !booking.classId) {
                errors.push(`Reserva ${index}: Falta id, userId o classId`);
            }
        });
        
        if (errors.length === 0) {
            console.log('✅ Validación de datos: OK');
            return true;
        } else {
            console.error('❌ Errores de validación:', errors);
            return false;
        }
    }
    
    // Limpiar datos antiguos (mantener solo últimos 30 días)
    cleanupOldData() {
        const data = this.getAllData();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        let cleaned = false;
        
        // Limpiar notificaciones antiguas
        const originalNotificationCount = data.notifications.length;
        data.notifications = data.notifications.filter(n => {
            const notificationDate = new Date(n.createdAt);
            return notificationDate > thirtyDaysAgo;
        });
        
        if (data.notifications.length < originalNotificationCount) {
            cleaned = true;
        }
        
        if (cleaned) {
            this.saveAllData(data);
            console.log('🧹 Datos antiguos limpiados');
        }
        
        return cleaned;
    }
}

// ==================== INICIALIZACIÓN GLOBAL ====================

// Crear instancia global
window.DataManager = DataManager;

// Inicializar inmediatamente (synchronous) para que auth.js pueda acceder
if (!window.barraboxDataManager) {
    window.barraboxDataManager = new DataManager();
    
    // Mostrar resumen en consola (solo en desarrollo)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.barraboxDataManager.debugSummary();
    }
    
    // Limpiar datos antiguos una vez al día
    const lastCleanup = localStorage.getItem('barrabox_last_cleanup');
    const today = new Date().toDateString();
    
    if (!lastCleanup || lastCleanup !== today) {
        window.barraboxDataManager.cleanupOldData();
        localStorage.setItem('barrabox_last_cleanup', today);
    }
    
    console.log('📊 Data Manager inicializado - Versión: 1.0');
}

// Exportar para Node.js (si es necesario)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataManager;
}

// ==================== EJEMPLOS DE USO ====================

/*
// Ejemplo 1: Obtener todas las clases del lunes
const dm = new DataManager();
const mondayClasses = dm.getClassesByDay('monday');
console.log('Clases del lunes:', mondayClasses);

// Ejemplo 2: Crear una reserva
try {
    const booking = dm.createBooking('user_001', 'class_001', '2026-04-16', '19:00');
    console.log('Reserva creada:', booking);
} catch (error) {
    console.error('Error al crear reserva:', error.message);
}

// Ejemplo 3: Obtener próximas clases de un usuario
const upcomingClasses = dm.getUserUpcomingClasses('user_001');
console.log('Próximas clases:', upcomingClasses);

// Ejemplo 4: Obtener estadísticas
const stats = dm.getStats();
console.log('Estadísticas:', stats);

// Ejemplo 5: Exportar datos (backup)
const backup = dm.exportData();
console.log('Backup:', backup);
*/