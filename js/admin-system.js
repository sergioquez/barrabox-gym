// Admin System - Sistema central de administración para Barrabox Gym
class AdminSystem {
    constructor() {
        console.log('🚀 Admin System inicializando...');
        
        // Dependencias necesarias
        this.dataManager = window.barraboxDataManager;
        this.authSystem = window.barraboxAuth;
        
        // Estado del sistema
        this.currentAdmin = null;
        this.isInitialized = false;
        this.permissions = {
            manageMembers: true,
            manageClasses: true,
            manageBookings: true,
            managePayments: true,
            viewReports: true,
            systemSettings: true
        };
        
        // Cache de datos
        this.cache = {
            members: null,
            classes: null,
            bookings: null,
            lastUpdate: null
        };
        
        // Configuración
        this.config = {
            cacheTTL: 30000, // 30 segundos
            maxExportRows: 1000,
            defaultPageSize: 20
        };
        
        // Inicializar
        this.initialize();
    }
    
    // Inicializar sistema
    async initialize() {
        try {
            console.log('🧪 Verificando dependencias...');
            
            // Verificar que Data Manager esté disponible
            if (!this.dataManager) {
                throw new Error('Data Manager no disponible');
            }
            
            // Verificar que Auth System esté disponible
            if (!this.authSystem) {
                throw new Error('Auth System no disponible');
            }
            
            // Verificar que el usuario sea administrador
            if (!this.authSystem.isLoggedIn()) {
                throw new Error('Usuario no autenticado');
            }
            
            this.currentAdmin = this.authSystem.getCurrentUser();
            
            if (this.currentAdmin.role !== 'admin') {
                throw new Error('Acceso denegado: Se requiere rol de administrador');
            }
            
            console.log('✅ Admin verificado:', this.currentAdmin.email);
            
            // Cargar datos iniciales
            await this.loadInitialData();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Marcar como inicializado
            this.isInitialized = true;
            
            // Disparar evento de inicialización
            this.dispatchEvent('admin:initialized', {
                admin: this.currentAdmin,
                timestamp: new Date().toISOString()
            });
            
            console.log('✅ Admin System inicializado correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando Admin System:', error);
            this.handleInitializationError(error);
        }
    }
    
    // Cargar datos iniciales
    async loadInitialData() {
        console.log('📊 Cargando datos iniciales...');
        
        try {
            // Cargar todos los datos necesarios
            this.cache.members = this.dataManager.getAllUsers();
            this.cache.classes = this.dataManager.getAllClasses();
            this.cache.bookings = this.dataManager.getAllBookings();
            this.cache.lastUpdate = new Date();
            
            console.log(`📈 Datos cargados: 
                ${this.cache.members.length} miembros,
                ${this.cache.classes.length} clases,
                ${this.cache.bookings.length} reservas`);
            
            // Disparar evento de datos cargados
            this.dispatchEvent('admin:dataLoaded', {
                members: this.cache.members.length,
                classes: this.cache.classes.length,
                bookings: this.cache.bookings.length,
                timestamp: this.cache.lastUpdate.toISOString()
            });
            
        } catch (error) {
            console.error('Error cargando datos:', error);
            throw error;
        }
    }
    
    // Refrescar datos del cache
    async refreshData(force = false) {
        const now = new Date();
        const timeSinceLastUpdate = now - this.cache.lastUpdate;
        
        if (!force && timeSinceLastUpdate < this.config.cacheTTL) {
            console.log('🔄 Cache aún válido, usando datos cacheados');
            return this.cache;
        }
        
        console.log('🔄 Refrescando datos del cache...');
        
        try {
            const oldCounts = {
                members: this.cache.members ? this.cache.members.length : 0,
                classes: this.cache.classes ? this.cache.classes.length : 0,
                bookings: this.cache.bookings ? this.cache.bookings.length : 0
            };
            
            // Actualizar cache
            this.cache.members = this.dataManager.getAllUsers();
            this.cache.classes = this.dataManager.getAllClasses();
            this.cache.bookings = this.dataManager.getAllBookings();
            this.cache.lastUpdate = new Date();
            
            const newCounts = {
                members: this.cache.members.length,
                classes: this.cache.classes.length,
                bookings: this.cache.bookings.length
            };
            
            // Verificar cambios
            const changes = {
                members: newCounts.members - oldCounts.members,
                classes: newCounts.classes - oldCounts.classes,
                bookings: newCounts.bookings - oldCounts.bookings
            };
            
            console.log(`📊 Datos refrescados: 
                Miembros: ${oldCounts.members} → ${newCounts.members} (${changes.members >= 0 ? '+' : ''}${changes.members})
                Clases: ${oldCounts.classes} → ${newCounts.classes} (${changes.classes >= 0 ? '+' : ''}${changes.classes})
                Reservas: ${oldCounts.bookings} → ${newCounts.bookings} (${changes.bookings >= 0 ? '+' : ''}${changes.bookings})`);
            
            // Disparar evento de datos refrescados
            this.dispatchEvent('admin:dataRefreshed', {
                oldCounts,
                newCounts,
                changes,
                timestamp: this.cache.lastUpdate.toISOString()
            });
            
            return this.cache;
            
        } catch (error) {
            console.error('Error refrescando datos:', error);
            throw error;
        }
    }
    
    // ==================== GESTIÓN DE MIEMBROS ====================
    
    // Obtener todos los miembros
    getAllMembers(filters = {}) {
        if (!this.isInitialized) {
            throw new Error('Admin System no inicializado');
        }
        
        let members = [...this.cache.members];
        
        // Aplicar filtros
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            members = members.filter(member => 
                member.name.toLowerCase().includes(searchTerm) ||
                member.email.toLowerCase().includes(searchTerm) ||
                (member.phone && member.phone.includes(searchTerm))
            );
        }
        
        if (filters.role) {
            members = members.filter(member => member.role === filters.role);
        }
        
        if (filters.status) {
            members = members.filter(member => member.status === filters.status);
        }
        
        if (filters.plan) {
            members = members.filter(member => member.plan === filters.plan);
        }
        
        // Ordenar
        if (filters.sortBy) {
            members.sort((a, b) => {
                if (a[filters.sortBy] < b[filters.sortBy]) return -1;
                if (a[filters.sortBy] > b[filters.sortBy]) return 1;
                return 0;
            });
            
            if (filters.sortOrder === 'desc') {
                members.reverse();
            }
        }
        
        return members;
    }
    
    // Crear nuevo miembro
    createMember(memberData) {
        if (!this.isInitialized) {
            throw new Error('Admin System no inicializado');
        }
        
        // Validar datos
        if (!memberData.email || !memberData.name) {
            throw new Error('Email y nombre son requeridos');
        }
        
        // Verificar que el email no exista
        const existingMember = this.dataManager.getUserByEmail(memberData.email);
        if (existingMember) {
            throw new Error('Ya existe un miembro con este email');
        }
        
        // Datos por defecto
        const newMember = {
            ...memberData,
            role: memberData.role || 'member',
            plan: memberData.plan || 'basic',
            status: memberData.status || 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Crear miembro
        const createdMember = this.dataManager.createUser(newMember);
        
        if (!createdMember) {
            throw new Error('Error creando miembro');
        }
        
        // Actualizar cache
        this.cache.members.push(createdMember);
        
        // Crear notificación
        this.dataManager.createNotification(
            this.currentAdmin.id,
            'member_created',
            'Nuevo Miembro Creado',
            `Miembro "${createdMember.name}" creado por ${this.currentAdmin.name}`,
            'info'
        );
        
        // Disparar evento
        this.dispatchEvent('admin:memberCreated', {
            member: createdMember,
            admin: this.currentAdmin,
            timestamp: new Date().toISOString()
        });
        
        console.log('✅ Miembro creado:', createdMember.email);
        
        return createdMember;
    }
    
    // Actualizar miembro
    updateMember(memberId, updates) {
        if (!this.isInitialized) {
            throw new Error('Admin System no inicializado');
        }
        
        // Verificar que el miembro exista
        const existingMember = this.dataManager.getUser(memberId);
        if (!existingMember) {
            throw new Error('Miembro no encontrado');
        }
        
        // No permitir cambiar email (requeriría validación especial)
        if (updates.email && updates.email !== existingMember.email) {
            throw new Error('No se puede cambiar el email directamente');
        }
        
        // Actualizar miembro
        const updatedMember = this.dataManager.updateUser(memberId, {
            ...updates,
            updatedAt: new Date().toISOString()
        });
        
        if (!updatedMember) {
            throw new Error('Error actualizando miembro');
        }
        
        // Actualizar cache
        const index = this.cache.members.findIndex(m => m.id === memberId);
        if (index !== -1) {
            this.cache.members[index] = updatedMember;
        }
        
        // Crear notificación
        this.dataManager.createNotification(
            this.currentAdmin.id,
            'member_updated',
            'Miembro Actualizado',
            `Miembro "${updatedMember.name}" actualizado por ${this.currentAdmin.name}`,
            'info'
        );
        
        // Disparar evento
        this.dispatchEvent('admin:memberUpdated', {
            oldMember: existingMember,
            newMember: updatedMember,
            admin: this.currentAdmin,
            timestamp: new Date().toISOString()
        });
        
        console.log('✅ Miembro actualizado:', updatedMember.email);
        
        return updatedMember;
    }
    
    // Eliminar miembro
    deleteMember(memberId) {
        if (!this.isInitialized) {
            throw new Error('Admin System no inicializado');
        }
        
        // Verificar que el miembro exista
        const existingMember = this.dataManager.getUser(memberId);
        if (!existingMember) {
            throw new Error('Miembro no encontrado');
        }
        
        // No permitir eliminar al administrador actual
        if (memberId === this.currentAdmin.id) {
            throw new Error('No puedes eliminar tu propia cuenta de administrador');
        }
        
        // Verificar si el miembro tiene reservas activas
        const memberBookings = this.dataManager.getBookingsByUser(memberId);
        const activeBookings = memberBookings.filter(b => b.status === 'confirmed');
        
        if (activeBookings.length > 0) {
            throw new Error(`El miembro tiene ${activeBookings.length} reservas activas. Cancélalas primero.`);
        }
        
        // Eliminar miembro
        const deleted = this.dataManager.deleteUser(memberId);
        
        if (!deleted) {
            throw new Error('Error eliminando miembro');
        }
        
        // Actualizar cache
        this.cache.members = this.cache.members.filter(m => m.id !== memberId);
        
        // Crear notificación
        this.dataManager.createNotification(
            this.currentAdmin.id,
            'member_deleted',
            'Miembro Eliminado',
            `Miembro "${existingMember.name}" eliminado por ${this.currentAdmin.name}`,
            'warning'
        );
        
        // Disparar evento
        this.dispatchEvent('admin:memberDeleted', {
            member: existingMember,
            admin: this.currentAdmin,
            timestamp: new Date().toISOString()
        });
        
        console.log('✅ Miembro eliminado:', existingMember.email);
        
        return true;
    }
    
    // ==================== GESTIÓN DE CLASES ====================
    
    // Obtener todas las clases
    getAllClasses(filters = {}) {
        if (!this.isInitialized) {
            throw new Error('Admin System no inicializado');
        }
        
        let classes = [...this.cache.classes];
        
        // Aplicar filtros
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            classes = classes.filter(cls => 
                cls.title.toLowerCase().includes(searchTerm) ||
                cls.coach.toLowerCase().includes(searchTerm) ||
                cls.description.toLowerCase().includes(searchTerm)
            );
        }
        
        if (filters.type) {
            classes = classes.filter(cls => cls.type === filters.type);
        }
        
        if (filters.coach) {
            classes = classes.filter(cls => cls.coach === filters.coach);
        }
        
        // Filtrar por disponibilidad
        if (filters.availability === 'available') {
            classes = classes.filter(cls => cls.booked < cls.capacity);
        } else if (filters.availability === 'full') {
            classes = classes.filter(cls => cls.booked >= cls.capacity);
        }
        
        // Ordenar
        if (filters.sortBy) {
            classes.sort((a, b) => {
                if (a[filters.sortBy] < b[filters.sortBy]) return -1;
                if (a[filters.sortBy] > b[filters.sortBy]) return 1;
                return 0;
            });
            
            if (filters.sortOrder === 'desc') {
                classes.reverse();
            }
        }
        
        return classes;
    }
    
    // Crear nueva clase
    createClass(classData) {
        if (!this.isInitialized) {
            throw new Error('Admin System no inicializado');
        }
        
        // Validar datos
        if (!classData.title || !classData.type || !classData.coach || !classData.schedule) {
            throw new Error('Título, tipo, coach y horario son requeridos');
        }
        
        if (!classData.capacity || classData.capacity <= 0) {
            throw new Error('Capacidad debe ser mayor a 0');
        }
        
        // Datos por defecto
        const newClass = {
            ...classData,
            booked: classData.booked || 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Crear clase
        const createdClass = this.dataManager.createClass(newClass);
        
        if (!createdClass) {
            throw new Error('Error creando clase');
        }
        
        // Actualizar cache
        this.cache.classes.push(createdClass);
        
        // Crear notificación
        this.dataManager.createNotification(
            this.currentAdmin.id,
            'class_created',
            'Nueva Clase Creada',
            `Clase "${createdClass.title}" creada por ${this.currentAdmin.name}`,
            'info'
        );
        
        // Disparar evento
        this.dispatchEvent('admin:classCreated', {
            class: createdClass,
            admin: this.currentAdmin,
            timestamp: new Date().toISOString()
        });
        
        console.log('✅ Clase creada:', createdClass.title);
        
        return createdClass;
    }
    
    // Actualizar clase
    updateClass(classId, updates) {
        if (!this.isInitialized) {
            throw new Error('Admin System no inicializado');
        }
        
        // Verificar que la clase exista
        const existingClass = this.dataManager.getClass(classId);
        if (!existingClass) {
            throw new Error('Clase no encontrada');
        }
        
        // Validar capacidad
        if (updates.capacity !== undefined && updates.capacity < existingClass.booked) {
            throw new Error(`No se puede reducir la capacidad a menos de ${existingClass.booked} (reservas existentes)`);
        }
        
        // Actualizar clase
        const updatedClass = this.dataManager.updateClass(classId, {
            ...updates,
            updatedAt: new Date().toISOString()
        });
        
        if (!updatedClass) {
            throw new Error('Error actualizando clase');
        }
        
        // Actualizar cache
        const index = this.cache.classes.findIndex(c => c.id === classId);
        if (index !== -1) {
            this.cache.classes[index] = updatedClass;
        }
        
        // Crear notificación
        this.dataManager.createNotification(
            this.currentAdmin.id,
            'class_updated',
            'Clase Actualizada',
            `Clase "${updatedClass.title}" actualizada por ${this.currentAdmin.name}`,
            'info'
        );
        
        // Disparar evento
        this.dispatchEvent('admin:classUpdated', {
            oldClass: existingClass,
            newClass: updatedClass,
            admin: this.currentAdmin,
            timestamp: new Date().toISOString()
        });
        
        console.log('✅ Clase actualizada:', updatedClass.title);
        
        return updatedClass;
    }
    
    // Eliminar clase
    deleteClass(classId) {
        if (!this.isInitialized) {
            throw new Error('Admin System no inicializado');
        }
        
        // Verificar que la clase exista
// Continuación de admin-system.js

        const existingClass = this.dataManager.getClass(classId);
        if (!existingClass) {
            throw new Error('Clase no encontrada');
        }
        
        // Verificar si la clase tiene reservas activas
        const classBookings = this.dataManager.getBookingsByClass(classId);
        const activeBookings = classBookings.filter(b => b.status === 'confirmed');
        
        if (activeBookings.length > 0) {
            throw new Error(`La clase tiene ${activeBookings.length} reservas activas. Cancélalas primero.`);
        }
        
        // Eliminar clase
        const deleted = this.dataManager.deleteClass(classId);
        
        if (!deleted) {
            throw new Error('Error eliminando clase');
        }
        
        // Actualizar cache
        this.cache.classes = this.cache.classes.filter(c => c.id !== classId);
        
        // Crear notificación
        this.dataManager.createNotification(
            this.currentAdmin.id,
            'class_deleted',
            'Clase Eliminada',
            `Clase "${existingClass.title}" eliminada por ${this.currentAdmin.name}`,
            'warning'
        );
        
        // Disparar evento
        this.dispatchEvent('admin:classDeleted', {
            class: existingClass,
            admin: this.currentAdmin,
            timestamp: new Date().toISOString()
        });
        
        console.log('✅ Clase eliminada:', existingClass.title);
        
        return true;
    }
    
    // ==================== GESTIÓN DE RESERVAS ====================
    
    // Obtener todas las reservas
    getAllBookings(filters = {}) {
        if (!this.isInitialized) {
            throw new Error('Admin System no inicializado');
        }
        
        let bookings = [...this.cache.bookings];
        
        // Aplicar filtros
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            bookings = bookings.filter(booking => {
                const user = this.dataManager.getUser(booking.userId);
                const cls = this.dataManager.getClass(booking.classId);
                
                return (
                    (user && user.name.toLowerCase().includes(searchTerm)) ||
                    (user && user.email.toLowerCase().includes(searchTerm)) ||
                    (cls && cls.title.toLowerCase().includes(searchTerm)) ||
                    (cls && cls.coach.toLowerCase().includes(searchTerm))
                );
            });
        }
        
        if (filters.status) {
            bookings = bookings.filter(booking => booking.status === filters.status);
        }
        
        if (filters.dateFrom) {
            const dateFrom = new Date(filters.dateFrom);
            bookings = bookings.filter(booking => new Date(booking.date) >= dateFrom);
        }
        
        if (filters.dateTo) {
            const dateTo = new Date(filters.dateTo);
            bookings = bookings.filter(booking => new Date(booking.date) <= dateTo);
        }
        
        if (filters.userId) {
            bookings = bookings.filter(booking => booking.userId === filters.userId);
        }
        
        if (filters.classId) {
            bookings = bookings.filter(booking => booking.classId === filters.classId);
        }
        
        // Ordenar
        if (filters.sortBy) {
            bookings.sort((a, b) => {
                if (a[filters.sortBy] < b[filters.sortBy]) return -1;
                if (a[filters.sortBy] > b[filters.sortBy]) return 1;
                return 0;
            });
            
            if (filters.sortOrder === 'desc') {
                bookings.reverse();
            }
        } else {
            // Ordenar por fecha por defecto
            bookings.sort((a, b) => {
                const dateA = new Date(a.date + 'T' + a.time);
                const dateB = new Date(b.date + 'T' + b.time);
                return dateB - dateA; // Más recientes primero
            });
        }
        
        return bookings;
    }
    
    // Cancelar reserva como administrador
    cancelBookingAsAdmin(bookingId, reason = 'Cancelado por administrador') {
        if (!this.isInitialized) {
            throw new Error('Admin System no inicializado');
        }
        
        // Verificar que la reserva exista
        const existingBooking = this.dataManager.getBooking(bookingId);
        if (!existingBooking) {
            throw new Error('Reserva no encontrada');
        }
        
        // Obtener información de la clase
        const cls = this.dataManager.getClass(existingBooking.classId);
        if (!cls) {
            throw new Error('Clase no encontrada');
        }
        
        // Obtener información del usuario
        const user = this.dataManager.getUser(existingBooking.userId);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        
        // Cancelar reserva
        const cancelled = this.dataManager.cancelBooking(bookingId);
        
        if (!cancelled) {
            throw new Error('Error cancelando reserva');
        }
        
        // Liberar cupo
        this.dataManager.updateClass(cls.id, {
            booked: Math.max(0, cls.booked - 1)
        });
        
        // Crear notificación para el usuario
        this.dataManager.createNotification(
            existingBooking.userId,
            'booking_cancelled_admin',
            'Reserva Cancelada por Administrador',
            `Tu reserva para ${cls.title} ha sido cancelada por el administrador. Razón: ${reason}`,
            'warning'
        );
        
        // Crear notificación para el administrador
        this.dataManager.createNotification(
            this.currentAdmin.id,
            'booking_cancelled',
            'Reserva Cancelada',
            `Reserva de ${user.name} para ${cls.title} cancelada por ${this.currentAdmin.name}`,
            'info'
        );
        
        // Actualizar cache
        const index = this.cache.bookings.findIndex(b => b.id === bookingId);
        if (index !== -1) {
            this.cache.bookings[index] = cancelled;
        }
        
        // Disparar evento
        this.dispatchEvent('admin:bookingCancelled', {
            booking: existingBooking,
            user: user,
            class: cls,
            admin: this.currentAdmin,
            reason: reason,
            timestamp: new Date().toISOString()
        });
        
        console.log('✅ Reserva cancelada por admin:', bookingId);
        
        return cancelled;
    }
    
    // ==================== REPORTES Y ESTADÍSTICAS ====================
    
    // Obtener estadísticas generales
    getGeneralStats() {
        if (!this.isInitialized) {
            throw new Error('Admin System no inicializado');
        }
        
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        // Filtrar reservas de los últimos 30 días
        const recentBookings = this.cache.bookings.filter(booking => {
            const bookingDate = new Date(booking.date + 'T' + booking.time);
            return bookingDate >= thirtyDaysAgo && booking.status === 'confirmed';
        });
        
        // Calcular estadísticas
        const stats = {
            // Totales
            totalMembers: this.cache.members.length,
            totalClasses: this.cache.classes.length,
            totalBookings: this.cache.bookings.filter(b => b.status === 'confirmed').length,
            
            // Últimos 30 días
            recentBookings: recentBookings.length,
            activeMembers: this.cache.members.filter(m => m.status === 'active').length,
            upcomingClasses: this.cache.classes.filter(c => {
                // Clases con cupo disponible
                return c.booked < c.capacity;
            }).length,
            
            // Distribución por tipo de clase
            classTypes: {},
            
            // Ocupación promedio
            averageOccupancy: 0,
            
            // Miembros por plan
            membersByPlan: {
                basic: 0,
                premium: 0
            },
            
            // Tasa de cancelación
            cancellationRate: 0
        };
        
        // Calcular distribución por tipo de clase
        this.cache.classes.forEach(cls => {
            stats.classTypes[cls.type] = (stats.classTypes[cls.type] || 0) + 1;
        });
        
        // Calcular ocupación promedio
        if (this.cache.classes.length > 0) {
            const totalCapacity = this.cache.classes.reduce((sum, cls) => sum + cls.capacity, 0);
            const totalBooked = this.cache.classes.reduce((sum, cls) => sum + cls.booked, 0);
            stats.averageOccupancy = totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0;
        }
        
        // Calcular miembros por plan
        this.cache.members.forEach(member => {
            if (member.plan === 'basic') {
                stats.membersByPlan.basic++;
            } else if (member.plan === 'premium') {
                stats.membersByPlan.premium++;
            }
        });
        
        // Calcular tasa de cancelación
        const totalBookingsEver = this.cache.bookings.length;
        const cancelledBookings = this.cache.bookings.filter(b => b.status === 'cancelled').length;
        stats.cancellationRate = totalBookingsEver > 0 ? 
            Math.round((cancelledBookings / totalBookingsEver) * 100) : 0;
        
        return stats;
    }
    
    // Obtener reporte de ocupación por día
    getOccupancyReport(days = 7) {
        if (!this.isInitialized) {
            throw new Error('Admin System no inicializado');
        }
        
        const report = {};
        const now = new Date();
        
        // Inicializar reporte para los últimos N días
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];
            
            report[dateStr] = {
                date: dateStr,
                totalClasses: 0,
                totalCapacity: 0,
                totalBooked: 0,
                occupancyRate: 0,
                classes: []
            };
        }
        
        // Procesar clases
        this.cache.classes.forEach(cls => {
            // Extraer fecha del schedule (formato: "Lunes 18:00")
            // En una implementación real, las clases tendrían fechas específicas
            // Por ahora, asignamos aleatoriamente a los días del reporte
            
            const dates = Object.keys(report);
            const randomDate = dates[Math.floor(Math.random() * dates.length)];
            
            if (report[randomDate]) {
                report[randomDate].totalClasses++;
                report[randomDate].totalCapacity += cls.capacity;
                report[randomDate].totalBooked += cls.booked;
                
                report[randomDate].classes.push({
                    title: cls.title,
                    type: cls.type,
                    coach: cls.coach,
                    capacity: cls.capacity,
                    booked: cls.booked,
                    occupancy: Math.round((cls.booked / cls.capacity) * 100)
                });
            }
        });
        
        // Calcular tasas de ocupación
        Object.values(report).forEach(day => {
            if (day.totalCapacity > 0) {
                day.occupancyRate = Math.round((day.totalBooked / day.totalCapacity) * 100);
            }
        });
        
        return report;
    }
    
    // ==================== EXPORTACIÓN DE DATOS ====================
    
    // Exportar datos a JSON
    exportData(dataType, filters = {}) {
        if (!this.isInitialized) {
            throw new Error('Admin System no inicializado');
        }
        
        let data;
        
        switch (dataType) {
            case 'members':
                data = this.getAllMembers(filters);
                break;
                
            case 'classes':
                data = this.getAllClasses(filters);
                break;
                
            case 'bookings':
                data = this.getAllBookings(filters);
                break;
                
            case 'all':
                data = {
                    members: this.getAllMembers(filters),
                    classes: this.getAllClasses(filters),
                    bookings: this.getAllBookings(filters),
                    exportedAt: new Date().toISOString(),
                    exportedBy: this.currentAdmin.email
                };
                break;
                
            default:
                throw new Error(`Tipo de datos no soportado: ${dataType}`);
        }
        
        // Limitar cantidad de registros
        if (Array.isArray(data) && data.length > this.config.maxExportRows) {
            data = data.slice(0, this.config.maxExportRows);
        }
        
        // Crear notificación
        this.dataManager.createNotification(
            this.currentAdmin.id,
            'data_exported',
            'Datos Exportados',
            `Datos de ${dataType} exportados por ${this.currentAdmin.name}`,
            'info'
        );
        
        console.log(`✅ Datos exportados (${dataType}):`, Array.isArray(data) ? data.length : 'multiple');
        
        return {
            data: data,
            metadata: {
                type: dataType,
                count: Array.isArray(data) ? data.length : 'multiple',
                exportedAt: new Date().toISOString(),
                exportedBy: this.currentAdmin.email,
                filters: filters
            }
        };
    }
    
    // ==================== UTILIDADES ====================
    
    // Configurar event listeners
    setupEventListeners() {
        // Escuchar cambios en Data Manager
        if (this.dataManager && this.dataManager.addEventListener) {
            this.dataManager.addEventListener('dataChanged', () => {
                console.log('🔄 Data Manager cambió, refrescando cache...');
                this.refreshData(true).catch(console.error);
            });
        }
        
        // Escuchar cambios en Auth System
        if (this.authSystem && this.authSystem.addEventListener) {
            this.authSystem.addEventListener('auth:logout', () => {
                console.log('👋 Usuario cerró sesión, limpiando Admin System...');
                this.cleanup();
            });
        }
        
        // Escuchar eventos del DOM
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                console.log('📱 Página visible, refrescando datos...');
                this.refreshData().catch(console.error);
            }
        });
    }
    
    // Disparar eventos personalizados
    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, {
            detail: {
                ...detail,
                source: 'AdminSystem',
                timestamp: new Date().toISOString()
            }
        });
        
        document.dispatchEvent(event);
    }
    
    // Manejar errores de inicialización
    handleInitializationError(error) {
        console.error('❌ Error crítico en Admin System:', error);
        
        // Disparar evento de error
        this.dispatchEvent('admin:error', {
            error: error.message,
            timestamp: new Date().toISOString()
        });
        
        // Mostrar mensaje al usuario
        if (typeof window !== 'undefined' && window.alert) {
            if (error.message.includes('Acceso denegado')) {
                window.alert('❌ Acceso denegado: Se requiere rol de administrador');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else if (error.message.includes('no autenticado')) {
                window.alert('🔐 Debes iniciar sesión primero');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                window.alert(`❌ Error del sistema: ${error.message}`);
            }
        }
    }
    
    // Limpiar recursos
    cleanup() {
        this.isInitialized = false;
        this.currentAdmin = null;
        this.cache = {
            members: null,
            classes: null,
            bookings: null,
            lastUpdate: null
        };
        
        console.log('🧹 Admin System limpiado');
    }
    
    // Verificar permisos
    hasPermission(permission) {
        return this.permissions[permission] === true;
    }
    
    // Obtener información del sistema
    getSystemInfo() {
        return {
            initialized: this.isInitialized,
            admin: this.currentAdmin ? {
                id: this.currentAdmin.id,
                email: this.currentAdmin.email,
                name: this.currentAdmin.name
            } : null,
            cache: {
                members: this.cache.members ? this.cache.members.length : 0,
                classes: this.cache.classes ? this.cache.classes.length : 0,
                bookings: this.cache.bookings ? this.cache.bookings.length : 0,
                lastUpdate: this.cache.lastUpdate
            },
            permissions: this.permissions,
            config: this.config
        };
    }
}

// Crear instancia global
if (typeof window !== 'undefined') {
    window.barraboxAdmin = new AdminSystem();
    
    // Exponer para debugging
    window.debugAdminSystem = () => {
        console.log('🔧 Debug Admin System:', window.barraboxAdmin.getSystemInfo());
    };
    
    console.log('🌐 Admin System cargado como window.barraboxAdmin');
}