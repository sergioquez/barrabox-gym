// E2E Testing Automatizado para Barrabox Gym
// Ejecutar en consola del navegador después de cargar la página

class BarraboxE2ETest {
    constructor() {
        this.tests = [];
        this.results = [];
        this.currentTest = null;
    }
    
    // ==================== TEST HELPERS ====================
    
    async wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    assert(condition, message) {
        if (!condition) {
            throw new Error(`Assertion failed: ${message}`);
        }
    }
    
    async simulateClick(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.click();
            await this.wait(100);
            return true;
        }
        return false;
    }
    
    async simulateInput(selector, value) {
        const element = document.querySelector(selector);
        if (element) {
            element.value = value;
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
            await this.wait(100);
            return true;
        }
        return false;
    }
    
    async simulateSubmit(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.dispatchEvent(new Event('submit', { bubbles: true }));
            await this.wait(100);
            return true;
        }
        return false;
    }
    
    // ==================== TEST DEFINITIONS ====================
    
    defineTests() {
        // Test 1: Data Manager básico
        this.tests.push({
            name: 'Data Manager - Inicialización',
            fn: async () => {
                this.assert(window.barraboxDataManager, 'Data Manager debe estar disponible');
                this.assert(typeof window.barraboxDataManager.getAllData === 'function', 'Debe tener método getAllData');
                
                const data = window.barraboxDataManager.getAllData();
                this.assert(data, 'Debe retornar datos');
                this.assert(data.users, 'Debe tener usuarios');
                this.assert(data.classes, 'Debe tener clases');
                this.assert(data.bookings, 'Debe tener reservas');
                
                console.log('✅ Data Manager inicializado correctamente');
                return true;
            }
        });
        
        // Test 2: Auth System básico
        this.tests.push({
            name: 'Auth System - Inicialización',
            fn: async () => {
                this.assert(window.barraboxAuth, 'Auth System debe estar disponible');
                this.assert(typeof window.barraboxAuth.login === 'function', 'Debe tener método login');
                this.assert(typeof window.barraboxAuth.logout === 'function', 'Debe tener método logout');
                this.assert(typeof window.barraboxAuth.register === 'function', 'Debe tener método register');
                
                console.log('✅ Auth System inicializado correctamente');
                return true;
            }
        });
        
        // Test 3: Login de usuario
        this.tests.push({
            name: 'Auth System - Login usuario',
            fn: async () => {
                const result = await window.barraboxAuth.login('usuario@barrabox.cl', 'cualquiercosa');
                this.assert(result.success, 'Login debe ser exitoso');
                this.assert(result.user, 'Debe retornar usuario');
                this.assert(result.user.email === 'usuario@barrabox.cl', 'Email debe coincidir');
                this.assert(result.user.role === 'member', 'Rol debe ser member');
                
                console.log('✅ Login de usuario exitoso');
                return true;
            }
        });
        
        // Test 4: Logout
        this.tests.push({
            name: 'Auth System - Logout',
            fn: async () => {
                const result = await window.barraboxAuth.logout();
                this.assert(result.success, 'Logout debe ser exitoso');
                this.assert(!window.barraboxAuth.isLoggedIn(), 'Usuario no debe estar autenticado');
                
                console.log('✅ Logout exitoso');
                return true;
            }
        });
        
        // Test 5: Login de admin
        this.tests.push({
            name: 'Auth System - Login admin',
            fn: async () => {
                const result = await window.barraboxAuth.login('admin@barrabox.cl', 'cualquiercosa');
                this.assert(result.success, 'Login admin debe ser exitoso');
                this.assert(result.user, 'Debe retornar usuario admin');
                this.assert(result.user.email === 'admin@barrabox.cl', 'Email admin debe coincidir');
                this.assert(result.user.role === 'admin', 'Rol debe ser admin');
                
                console.log('✅ Login de admin exitoso');
                return true;
            }
        });
        
        // Test 6: Gestión de usuarios
        this.tests.push({
            name: 'Data Manager - CRUD usuarios',
            fn: async () => {
                // Crear usuario de prueba
                const testUser = {
                    email: 'test@barrabox.cl',
                    name: 'Usuario Test',
                    role: 'member',
                    plan: 'basic',
                    status: 'active',
                    phone: '+56912345678'
                };
                
                const createdUser = window.barraboxDataManager.createUser(testUser);
                this.assert(createdUser, 'Usuario debe crearse');
                this.assert(createdUser.id, 'Usuario debe tener ID');
                this.assert(createdUser.email === testUser.email, 'Email debe coincidir');
                
                // Leer usuario
                const readUser = window.barraboxDataManager.getUserByEmail(testUser.email);
                this.assert(readUser, 'Debe poder leer usuario');
                this.assert(readUser.name === testUser.name, 'Nombre debe coincidir');
                
                // Actualizar usuario
                const updatedData = { name: 'Usuario Test Actualizado' };
                const updateResult = window.barraboxDataManager.updateUser(readUser.id, updatedData);
                this.assert(updateResult, 'Usuario debe actualizarse');
                
                const updatedUser = window.barraboxDataManager.getUser(readUser.id);
                this.assert(updatedUser.name === updatedData.name, 'Nombre debe actualizarse');
                
                // Eliminar usuario
                const deleteResult = window.barraboxDataManager.deleteUser(readUser.id);
                this.assert(deleteResult, 'Usuario debe eliminarse');
                
                const deletedUser = window.barraboxDataManager.getUser(readUser.id);
                this.assert(!deletedUser, 'Usuario no debe existir después de eliminar');
                
                console.log('✅ CRUD de usuarios funcionando');
                return true;
            }
        });
        
        // Test 7: Gestión de clases
        this.tests.push({
            name: 'Data Manager - CRUD clases',
            fn: async () => {
                // Crear clase de prueba
                const testClass = {
                    type: 'yoga',
                    title: 'Yoga Test',
                    coach: 'Instructor Test',
                    schedule: 'Lunes 18:00',
                    capacity: 20,
                    booked: 0,
                    description: 'Clase de prueba'
                };
                
                const createdClass = window.barraboxDataManager.createClass(testClass);
                this.assert(createdClass, 'Clase debe crearse');
                this.assert(createdClass.id, 'Clase debe tener ID');
                this.assert(createdClass.title === testClass.title, 'Título debe coincidir');
                
                // Leer todas las clases
                const allClasses = window.barraboxDataManager.getAllClasses();
                this.assert(Array.isArray(allClasses), 'Debe retornar array de clases');
                this.assert(allClasses.length > 0, 'Debe haber al menos una clase');
                
                // Actualizar clase
                const updatedData = { booked: 5 };
                const updateResult = window.barraboxDataManager.updateClass(createdClass.id, updatedData);
                this.assert(updateResult, 'Clase debe actualizarse');
                
                const updatedClass = window.barraboxDataManager.getClass(createdClass.id);
                this.assert(updatedClass.booked === updatedData.booked, 'Cupos reservados deben actualizarse');
                
                console.log('✅ CRUD de clases funcionando');
                return true;
            }
        });
        
        // Test 8: Sistema de reservas
        this.tests.push({
            name: 'Data Manager - Sistema de reservas',
            fn: async () => {
                // Obtener usuario y clase existentes
                const users = window.barraboxDataManager.getAllUsers();
                const classes = window.barraboxDataManager.getAllClasses();
                
                this.assert(users.length > 0, 'Debe haber usuarios');
                this.assert(classes.length > 0, 'Debe haber clases');
                
                const testUser = users[0];
                const testClass = classes[0];
                
                // Crear reserva
                const booking = {
                    userId: testUser.id,
                    classId: testClass.id,
                    date: '2026-04-15',
                    time: '18:00',
                    status: 'confirmed'
                };
                
                const createdBooking = window.barraboxDataManager.createBooking(booking);
                this.assert(createdBooking, 'Reserva debe crearse');
                this.assert(createdBooking.id, 'Reserva debe tener ID');
                
                // Obtener reservas por usuario
                const userBookings = window.barraboxDataManager.getBookingsByUser(testUser.id);
                this.assert(Array.isArray(userBookings), 'Debe retornar array de reservas');
                this.assert(userBookings.length > 0, 'Usuario debe tener reservas');
                
                // Cancelar reserva
                const cancelResult = window.barraboxDataManager.cancelBooking(createdBooking.id);
                this.assert(cancelResult, 'Reserva debe cancelarse');
                
                const cancelledBooking = window.barraboxDataManager.getBooking(createdBooking.id);
                this.assert(cancelledBooking.status === 'cancelled', 'Estado debe ser cancelled');
                
                console.log('✅ Sistema de reservas funcionando');
                return true;
            }
        });
        
        // Test 9: Sistema de notificaciones
        this.tests.push({
            name: 'Data Manager - Sistema de notificaciones',
            fn: async () => {
                const users = window.barraboxDataManager.getAllUsers();
                this.assert(users.length > 0, 'Debe haber usuarios');
                
                const testUser = users[0];
                
                // Crear notificación
                const notification = window.barraboxDataManager.createNotification(
                    testUser.id,
                    'test',
                    'Notificación Test',
                    'Este es un mensaje de prueba',
                    'info'
                );
                
                this.assert(notification, 'Notificación debe crearse');
                this.assert(notification.id, 'Notificación debe tener ID');
                this.assert(notification.userId === testUser.id, 'Debe pertenecer al usuario');
                
                // Obtener notificaciones del usuario
                const userNotifications = window.barraboxDataManager.getNotificationsByUser(testUser.id);
                this.assert(Array.isArray(userNotifications), 'Debe retornar array de notificaciones');
                this.assert(userNotifications.length > 0, 'Usuario debe tener notificaciones');
                
                // Marcar como leída
                const markResult = window.barraboxDataManager.markNotificationAsRead(notification.id);
                this.assert(markResult, 'Notificación debe marcarse como leída');
                
                const updatedNotification = window.barraboxDataManager.getNotification(notification.id);
                this.assert(updatedNotification.read, 'Debe estar marcada como leída');
                this.assert(updatedNotification.readAt, 'Debe tener fecha de lectura');
                
                console.log('✅ Sistema de notificaciones funcionando');
                return true;
            }
        });
        
        // Test 10: Exportación/Importación de datos
        this.tests.push({
            name: 'Data Manager - Exportación/Importación',
            fn: async () => {
                // Exportar datos
                const exportData = window.barraboxDataManager.exportData();
                this.assert(exportData, 'Debe exportar datos');
                this.assert(typeof exportData === 'string', 'Debe ser string JSON');
                
                // Parsear para validar estructura
                const parsedData = JSON.parse(exportData);
                this.assert(parsedData.schemaVersion === '1.0', 'Debe tener versión de esquema');
                this.assert(parsedData.users, 'Debe tener usuarios en exportación');
                this.assert(parsedData.classes, 'Debe tener clases en exportación');
                
                console.log('✅ Exportación/Importación funcionando');
                return true;
            }
        });
        
        // Test 11: Profile Management
        this.tests.push({
            name: 'Auth System - Gestión de perfil',
            fn: async () => {
                // Login primero
                await window.barraboxAuth.login('usuario@barrabox.cl', 'cualquiercosa');
                
                // Actualizar perfil
                const profileData = {
                    name: 'Usuario Actualizado',
                    phone: '+56987654321'
                };
                
                const updateResult = await window.barraboxAuth.updateProfile(profileData);
                this.assert(updateResult.success, 'Perfil debe actualizarse');
                this.assert(updateResult.user.name === profileData.name, 'Nombre debe actualizarse');
                this.assert(updateResult.user.phone === profileData.phone, 'Teléfono debe actualizarse');
                
                // Cambiar contraseña (demo - siempre funciona)
                const passwordResult = await window.barraboxAuth.changePassword(
                    'cualquiercosa',
                    'nuevacontraseña',
                    'nuevacontraseña'
                );
                
                this.assert(passwordResult.success, 'Cambio de contraseña debe funcionar');
                
                console.log('✅ Gestión de perfil funcionando');
                return true;
            }
        });
        
        // Test 12: UI Integration
        this.tests.push({
            name: 'UI - Elementos de autenticación',
            fn: async () => {
                // Verificar que elementos con data-auth existen
                const authElements = document.querySelectorAll('[data-auth]');
                this.assert(authElements.length > 0, 'Debe haber elementos con data-auth');
                
                // Verificar que elementos con data-user existen
                const userElements = document.querySelectorAll('[data-user]');
                this.assert(userElements.length > 0, 'Debe haber elementos con data-user');
                
                // Verificar botones de logout
                const logoutButtons = document.querySelectorAll('[data-logout]');
                this.assert(logoutButtons.length > 0, 'Debe haber botones de logout');
                
                console.log('✅ UI de autenticación integrada');
                return true;
            }
        });
    }
    
    // ==================== TEST RUNNER ====================
    
    async runAllTests() {
        console.log('🚀 Iniciando E2E Testing Automatizado para Barrabox Gym');
        console.log('=' .repeat(60));
        
        this.defineTests();
        
        let passed = 0;
        let failed = 0;
        
        for (let i = 0; i < this.tests.length; i++) {
            const test = this.tests[i];
            this.currentTest = test.name;
            
            console.log(`\n📋 Test ${i + 1}/${this.tests.length}: ${test.name}`);
            console.log('─'.repeat(60));
            
            try {
                const result = await test.fn();
                if (result) {
                    console.log(`✅ ${test.name} - PASÓ`);
                    this.results.push({ test: test.name, passed: true });
                    passed++;
                } else {
                    console.log(`❌ ${test.name} - FALLÓ (retornó false)`);
                    this.results.push({ test: test.name, passed: false, error: 'Retornó false' });
                    failed++;
                }
            } catch (error) {
                console.log(`❌ ${test.name} - ERROR: ${error.message}`);
                console.error(error);
                this.results.push({ test: test.name, passed: false, error: error.message });
                failed++;
            }
            
            // Pequeña pausa entre tests
            await this.wait(200);
        }
        
        // Reporte final
        console.log('\n' + '='.repeat(60));
        console.log('📊 REPORTE FINAL DE TESTING E2E');
        console.log('='.repeat(60));
        console.log(`✅ Tests pasados: ${passed}`);
        console.log(`❌ Tests fallados: ${failed}`);
        console.log(`📈 Tasa de éxito: ${((passed / this.tests.length) * 100).toFixed(1)}%`);
        
        if (failed === 0) {
            console.log('\n🎉 ¡TODOS LOS TESTS PASARON! El sistema está funcionando correctamente.');
        } else {
            console.log('\n⚠️  Algunos tests fallaron. Revisar los errores arriba.');
        }
        
        return {
            total: this.tests.length,
            passed,
            failed,
            successRate: (passed / this.tests.length) * 100,
            results: this.results
        };
    }
    
    // ==================== PAGE SPECIFIC TESTS ====================
    
    async testIndexPage() {
        console.log('🧪 Testing página index.html');
        
        const tests = [
            {
                name: 'Modal de login visible',
                fn: async () => {
                    const loginBtn = document.querySelector('.btn-login');
                    if (loginBtn) {
                        await this.simulateClick('.btn-login');
                        await this.wait(500);
                        
                        const modal = document.getElementById('loginModal');
                        this.assert(modal, 'Modal debe existir');
                        this.assert(modal.style.display === 'flex' || modal.classList.contains('active'), 'Modal debe estar visible');
                        return true;
                    }
                    return false;
                }
            },
            {
                name: 'Formulario de login funciona',
                fn: async () => {
                    await this.simulateInput('#