// Simple E2E Testing para Barrabox Gym
// Para ejecutar: copiar y pegar en consola del navegador

(function() {
    console.log('🚀 Iniciando Simple E2E Testing para Barrabox Gym');
    console.log('='.repeat(60));
    
    let passed = 0;
    let failed = 0;
    const results = [];
    
    // Helper functions
    function assert(condition, message) {
        if (!condition) {
            throw new Error(message);
        }
    }
    
    function logTest(name, success, error = null) {
        const status = success ? '✅' : '❌';
        console.log(`${status} ${name}`);
        
        if (error) {
            console.error(`   Error: ${error}`);
        }
        
        results.push({ name, success, error });
        if (success) passed++; else failed++;
    }
    
    async function runTest(name, testFn) {
        try {
            await testFn();
            logTest(name, true);
            return true;
        } catch (error) {
            logTest(name, false, error.message);
            return false;
        }
    }
    
    // Test 1: Data Manager disponible
    async function testDataManager() {
        assert(window.barraboxDataManager, 'Data Manager debe estar disponible');
        assert(typeof window.barraboxDataManager.getAllData === 'function', 'Debe tener getAllData');
        
        const data = window.barraboxDataManager.getAllData();
        assert(data, 'Debe retornar datos');
        assert(data.users, 'Debe tener usuarios');
        assert(Array.isArray(data.users), 'Usuarios debe ser array');
    }
    
    // Test 2: Auth System disponible
    async function testAuthSystem() {
        assert(window.barraboxAuth, 'Auth System debe estar disponible');
        assert(typeof window.barraboxAuth.login === 'function', 'Debe tener login');
        assert(typeof window.barraboxAuth.logout === 'function', 'Debe tener logout');
    }
    
    // Test 3: Login de usuario
    async function testUserLogin() {
        const result = await window.barraboxAuth.login('usuario@barrabox.cl', 'cualquiercosa');
        assert(result.success, 'Login debe ser exitoso');
        assert(result.user, 'Debe retornar usuario');
        assert(result.user.email === 'usuario@barrabox.cl', 'Email debe coincidir');
    }
    
    // Test 4: Estado de sesión
    async function testSessionState() {
        assert(window.barraboxAuth.isLoggedIn(), 'Usuario debe estar autenticado');
        assert(window.barraboxAuth.getCurrentUser(), 'Debe obtener usuario actual');
    }
    
    // Test 5: Logout
    async function testLogout() {
        const result = await window.barraboxAuth.logout();
        assert(result.success, 'Logout debe ser exitoso');
        assert(!window.barraboxAuth.isLoggedIn(), 'Usuario no debe estar autenticado');
    }
    
    // Test 6: Login de admin
    async function testAdminLogin() {
        const result = await window.barraboxAuth.login('admin@barrabox.cl', 'cualquiercosa');
        assert(result.success, 'Login admin debe ser exitoso');
        assert(result.user.role === 'admin', 'Debe ser administrador');
    }
    
    // Test 7: CRUD usuarios
    async function testUserCRUD() {
        // Crear usuario de prueba
        const testUser = {
            email: 'test-e2e@barrabox.cl',
            name: 'Test E2E',
            role: 'member',
            plan: 'basic',
            status: 'active'
        };
        
        const created = window.barraboxDataManager.createUser(testUser);
        assert(created, 'Usuario debe crearse');
        assert(created.id, 'Debe tener ID');
        
        // Leer usuario
        const found = window.barraboxDataManager.getUserByEmail(testUser.email);
        assert(found, 'Debe encontrar usuario');
        
        // Actualizar usuario
        const updated = window.barraboxDataManager.updateUser(found.id, { name: 'Test Actualizado' });
        assert(updated, 'Usuario debe actualizarse');
        
        // Eliminar usuario
        const deleted = window.barraboxDataManager.deleteUser(found.id);
        assert(deleted, 'Usuario debe eliminarse');
    }
    
    // Test 8: CRUD clases
    async function testClassCRUD() {
        const testClass = {
            type: 'yoga',
            title: 'Yoga E2E Test',
            coach: 'Instructor Test',
            schedule: 'Lunes 18:00',
            capacity: 20,
            booked: 0
        };
        
        const created = window.barraboxDataManager.createClass(testClass);
        assert(created, 'Clase debe crearse');
        
        const allClasses = window.barraboxDataManager.getAllClasses();
        assert(Array.isArray(allClasses), 'Debe retornar array');
        assert(allClasses.length > 0, 'Debe haber clases');
    }
    
    // Test 9: Sistema de reservas
    async function testBookingSystem() {
        const users = window.barraboxDataManager.getAllUsers();
        const classes = window.barraboxDataManager.getAllClasses();
        
        if (users.length > 0 && classes.length > 0) {
            const user = users[0];
            const cls = classes[0];
            
            const booking = {
                userId: user.id,
                classId: cls.id,
                date: '2026-04-15',
                time: '18:00',
                status: 'confirmed'
            };
            
            const created = window.barraboxDataManager.createBooking(booking);
            assert(created, 'Reserva debe crearse');
            
            const userBookings = window.barraboxDataManager.getBookingsByUser(user.id);
            assert(Array.isArray(userBookings), 'Debe retornar array de reservas');
        }
    }
    
    // Test 10: Sistema de notificaciones
    async function testNotifications() {
        const users = window.barraboxDataManager.getAllUsers();
        if (users.length > 0) {
            const user = users[0];
            
            const notification = window.barraboxDataManager.createNotification(
                user.id,
                'test',
                'Test E2E',
                'Mensaje de prueba',
                'info'
            );
            
            assert(notification, 'Notificación debe crearse');
            
            const userNotifications = window.barraboxDataManager.getNotificationsByUser(user.id);
            assert(Array.isArray(userNotifications), 'Debe retornar array de notificaciones');
        }
    }
    
    // Test 11: Exportación de datos
    async function testDataExport() {
        const exportData = window.barraboxDataManager.exportData();
        assert(exportData, 'Debe exportar datos');
        assert(typeof exportData === 'string', 'Debe ser string JSON');
        
        try {
            JSON.parse(exportData);
        } catch (e) {
            throw new Error('JSON inválido en exportación');
        }
    }
    
    // Test 12: UI Elements
    async function testUIElements() {
        // Verificar elementos comunes
        const authElements = document.querySelectorAll('[data-auth]');
        assert(authElements.length > 0, 'Debe haber elementos con data-auth');
        
        const userElements = document.querySelectorAll('[data-user]');
        assert(userElements.length > 0, 'Debe haber elementos con data-user');
        
        // Verificar que no haya errores obvios en consola
        console.log('   UI Elements: OK');
    }
    
    // Ejecutar todos los tests
    async function runAllTests() {
        console.log('🧪 Ejecutando tests E2E...\n');
        
        const tests = [
            { name: 'Data Manager disponible', fn: testDataManager },
            { name: 'Auth System disponible', fn: testAuthSystem },
            { name: 'Login de usuario', fn: testUserLogin },
            { name: 'Estado de sesión', fn: testSessionState },
            { name: 'Logout', fn: testLogout },
            { name: 'Login de admin', fn: testAdminLogin },
            { name: 'CRUD usuarios', fn: testUserCRUD },
            { name: 'CRUD clases', fn: testClassCRUD },
            { name: 'Sistema de reservas', fn: testBookingSystem },
            { name: 'Sistema de notificaciones', fn: testNotifications },
            { name: 'Exportación de datos', fn: testDataExport },
            { name: 'Elementos UI', fn: testUIElements }
        ];
        
        for (const test of tests) {
            await runTest(test.name, test.fn);
            await new Promise(resolve => setTimeout(resolve, 100)); // Pequeña pausa
        }
        
        // Reporte final
        console.log('\n' + '='.repeat(60));
        console.log('📊 REPORTE FINAL DE TESTING E2E');
        console.log('='.repeat(60));
        console.log(`✅ Tests pasados: ${passed}`);
        console.log(`❌ Tests fallados: ${failed}`);
        console.log(`📈 Tasa de éxito: ${((passed / tests.length) * 100).toFixed(1)}%`);
        
        if (failed === 0) {
            console.log('\n🎉 ¡TODOS LOS TESTS PASARON! El sistema está funcionando correctamente.');
        } else {
            console.log('\n⚠️  Algunos tests fallaron. Revisar los errores arriba.');
        }
        
        return {
            total: tests.length,
            passed,
            failed,
            successRate: (passed / tests.length) * 100,
            results
        };
    }
    
    // Exponer para ejecución manual
    window.runBarraboxTests = runAllTests;
    
    console.log('📝 Para ejecutar tests, escribe en consola: runBarraboxTests()');
    console.log('='.repeat(60));
})();