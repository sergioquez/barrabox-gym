// Diagnostic System - Herramientas de diagnóstico para Barrabox Gym

class DiagnosticSystem {
    constructor() {
        console.log('🔧 Diagnostic System inicializado');
    }
    
    // Verificar estado completo del sistema
    checkSystemStatus() {
        console.group('🔍 DIAGNÓSTICO DEL SISTEMA');
        
        // 1. Verificar scripts cargados
        this.checkLoadedScripts();
        
        // 2. Verificar sistemas globales
        this.checkGlobalSystems();
        
        // 3. Verificar localStorage
        this.checkLocalStorage();
        
        // 4. Verificar errores en consola
        this.checkConsoleErrors();
        
        // 5. Verificar recursos (CSS, imágenes)
        this.checkResources();
        
        console.groupEnd();
        
        return this.generateReport();
    }
    
    // Verificar scripts cargados
    checkLoadedScripts() {
        console.group('📜 Scripts cargados:');
        
        const scripts = document.querySelectorAll('script[src]');
        const expectedScripts = [
            'init-system.js',
            'data-manager.js', 
            'auth.js',
            'main.js',
            'calendar.js',
            'booking-system.js',
            'theme-system.js',
            'fase6-integration.js'
        ];
        
        console.log(`Total scripts: ${scripts.length}`);
        
        // Listar todos los scripts
        scripts.forEach(script => {
            const src = script.src.split('/').pop();
            const status = script.readyState;
            console.log(`- ${src}: ${status}`);
        });
        
        // Verificar scripts esperados
        expectedScripts.forEach(expected => {
            const found = Array.from(scripts).some(s => s.src.includes(expected));
            console.log(`${found ? '✅' : '❌'} ${expected}: ${found ? 'Cargado' : 'Faltante'}`);
        });
        
        console.groupEnd();
    }
    
    // Verificar sistemas globales
    checkGlobalSystems() {
        console.group('🌐 Sistemas globales:');
        
        const systems = [
            { name: 'barraboxDataManager', check: () => window.barraboxDataManager && typeof window.barraboxDataManager.getUserByEmail === 'function' },
            { name: 'barraboxAuth', check: () => window.barraboxAuth && window.barraboxAuth.dataManager !== null },
            { name: 'barraboxInit', check: () => window.barraboxInit && window.barraboxInit.initialized },
            { name: 'barraboxTheme', check: () => window.barraboxTheme && window.barraboxTheme.isInitialized },
            { name: 'barraboxWaitlist', check: () => window.barraboxWaitlist && window.barraboxWaitlist.isInitialized },
            { name: 'barraboxFase6', check: () => window.barraboxFase6 && window.barraboxFase6.isInitialized }
        ];
        
        systems.forEach(system => {
            const isAvailable = system.check();
            console.log(`${isAvailable ? '✅' : '❌'} ${system.name}: ${isAvailable ? 'Disponible' : 'No disponible'}`);
            
            if (isAvailable && system.name === 'barraboxDataManager') {
                console.log('   📊 Métodos disponibles:', Object.keys(window.barraboxDataManager).filter(key => typeof window.barraboxDataManager[key] === 'function'));
            }
        });
        
        console.groupEnd();
    }
    
    // Verificar localStorage
    checkLocalStorage() {
        console.group('💾 localStorage:');
        
        try {
            const keys = Object.keys(localStorage);
            console.log(`Total items: ${keys.length}`);
            
            // Items importantes para Barrabox
            const importantKeys = [
                'barrabox_gym_data',
                'barrabox_gym_session',
                'barrabox_gym_current_user',
                'barrabox_gym_remember_me',
                'barrabox-theme'
            ];
            
            importantKeys.forEach(key => {
                const exists = localStorage.getItem(key) !== null;
                console.log(`${exists ? '✅' : '❌'} ${key}: ${exists ? 'Presente' : 'Ausente'}`);
                
                if (exists && key === 'barrabox_gym_data') {
                    try {
                        const data = JSON.parse(localStorage.getItem(key));
                        console.log('   📊 Datos:', {
                            users: data.users?.length || 0,
                            classes: data.classes?.length || 0,
                            bookings: data.bookings?.length || 0
                        });
                    } catch (e) {
                        console.log('   ❌ Error parseando datos');
                    }
                }
            });
            
        } catch (error) {
            console.error('❌ Error accediendo a localStorage:', error);
        }
        
        console.groupEnd();
    }
    
    // Verificar errores en consola
    checkConsoleErrors() {
        console.group('🚨 Errores recientes:');
        
        // Nota: No podemos acceder al historial de console.error directamente
        // Pero podemos verificar si hay errores comunes
        console.log('⚠️ Los errores de consola solo son visibles en tiempo real');
        console.log('💡 Presiona F12 → Console para ver errores actuales');
        
        console.groupEnd();
    }
    
    // Verificar recursos
    checkResources() {
        console.group('📁 Recursos:');
        
        // Verificar CSS cargados
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
        console.log(`Stylesheets cargados: ${stylesheets.length}`);
        
        stylesheets.forEach(link => {
            const href = link.href.split('/').pop();
            console.log(`- ${href}: ${link.sheet ? '✅ Cargado' : '❌ Error'}`);
        });
        
        console.groupEnd();
    }
    
    // Generar reporte resumido
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            systems: {
                dataManager: !!window.barraboxDataManager,
                auth: !!window.barraboxAuth,
                init: !!window.barraboxInit,
                localStorage: typeof localStorage !== 'undefined'
            },
            issues: []
        };
        
        // Detectar problemas comunes
        if (!window.barraboxDataManager) {
            report.issues.push('Data Manager no disponible');
        }
        
        if (window.barraboxDataManager && !window.barraboxDataManager.getUserByEmail) {
            report.issues.push('Data Manager no tiene método getUserByEmail');
        }
        
        if (!window.barraboxAuth) {
            report.issues.push('Auth System no disponible');
        }
        
        if (window.barraboxAuth && window.barraboxAuth.dataManager === null) {
            report.issues.push('Auth System no tiene Data Manager');
        }
        
        console.log('📋 REPORTE DE DIAGNÓSTICO:');
        console.log(JSON.stringify(report, null, 2));
        
        return report;
    }
    
    // Solucionar problemas comunes
    fixCommonIssues() {
        console.group('🔧 Intentando solucionar problemas...');
        
        let fixesApplied = 0;
        
        // 1. Si Data Manager no está disponible, intentar cargarlo manualmente
        if (!window.barraboxDataManager || typeof window.barraboxDataManager.getUserByEmail !== 'function') {
            console.log('🔄 Intentando cargar Data Manager manualmente...');
            this.loadScriptManually('js/data-manager.js?v=5.0')
                .then(() => {
                    console.log('✅ Data Manager cargado manualmente');
                    fixesApplied++;
                })
                .catch(error => {
                    console.error('❌ Error cargando Data Manager:', error);
                });
        }
        
        // 2. Si Auth System no tiene Data Manager, intentar reconectar
        if (window.barraboxAuth && window.barraboxAuth.dataManager === null && window.barraboxDataManager) {
            console.log('🔄 Reconectando Auth System con Data Manager...');
            window.barraboxAuth.dataManager = window.barraboxDataManager;
            console.log('✅ Auth System reconectado');
            fixesApplied++;
        }
        
        // 3. Limpiar localStorage corrupto
        try {
            const data = localStorage.getItem('barrabox_gym_data');
            if (data) {
                try {
                    JSON.parse(data);
                    console.log('✅ localStorage data es válido');
                } catch (e) {
                    console.log('🔄 localStorage corrupto, limpiando...');
                    localStorage.removeItem('barrabox_gym_data');
                    console.log('✅ localStorage limpiado');
                    fixesApplied++;
                }
            }
        } catch (error) {
            console.error('❌ Error verificando localStorage:', error);
        }
        
        console.log(`🔧 ${fixesApplied} fixes aplicados`);
        console.groupEnd();
        
        if (fixesApplied > 0) {
            console.log('🔄 Recargando página para aplicar fixes...');
            setTimeout(() => location.reload(), 1000);
        }
        
        return fixesApplied;
    }
    
    // Cargar script manualmente
    loadScriptManually(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = false;
            
            script.onload = resolve;
            script.onerror = reject;
            
            document.head.appendChild(script);
        });
    }
    
    // Ejecutar pruebas de funcionalidad
    runTests() {
        console.group('🧪 Ejecutando pruebas...');
        
        const tests = [
            {
                name: 'Data Manager - getUserByEmail',
                test: () => window.barraboxDataManager && typeof window.barraboxDataManager.getUserByEmail === 'function'
            },
            {
                name: 'Data Manager - createUser',
                test: () => window.barraboxDataManager && typeof window.barraboxDataManager.createUser === 'function'
            },
            {
                name: 'Auth System - login',
                test: () => window.barraboxAuth && typeof window.barraboxAuth.login === 'function'
            },
            {
                name: 'Auth System - dataManager conectado',
                test: () => window.barraboxAuth && window.barraboxAuth.dataManager !== null
            },
            {
                name: 'localStorage accesible',
                test: () => {
                    try {
                        localStorage.setItem('test', 'test');
                        localStorage.removeItem('test');
                        return true;
                    } catch {
                        return false;
                    }
                }
            }
        ];
        
        let passed = 0;
        let failed = 0;
        
        tests.forEach(test => {
            const result = test.test();
            console.log(`${result ? '✅' : '❌'} ${test.name}: ${result ? 'PASS' : 'FAIL'}`);
            
            if (result) passed++;
            else failed++;
        });
        
        console.log(`📊 Resultado: ${passed}/${tests.length} pruebas pasadas`);
        
        if (failed > 0) {
            console.log('🔧 Ejecuta diagnostic.fixCommonIssues() para intentar solucionar problemas');
        }
        
        console.groupEnd();
        
        return { passed, failed, total: tests.length };
    }
}

// Crear instancia global
if (typeof window !== 'undefined') {
    window.diagnostic = new DiagnosticSystem();
    
    // Comandos útiles para la consola
    window.runDiagnostics = () => window.diagnostic.checkSystemStatus();
    window.fixIssues = () => window.diagnostic.fixCommonIssues();
    window.runTests = () => window.diagnostic.runTests();
    
    console.log('🔧 Diagnostic System disponible como window.diagnostic');
    console.log('📋 Comandos disponibles:');
    console.log('  - runDiagnostics(): Verificar estado completo del sistema');
    console.log('  - fixIssues(): Intentar solucionar problemas comunes');
    console.log('  - runTests(): Ejecutar pruebas de funcionalidad');
}

// Auto-ejecutar diagnóstico si hay parámetro en URL
if (typeof window !== 'undefined' && window.location.search.includes('diagnostic=true')) {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            console.log('🔍 Auto-diagnóstico iniciado (parámetro URL)');
            window.diagnostic.checkSystemStatus();
        }, 1000);
    });
}