// CLEANUP ALL - Remover todos los sistemas excepto el nuestro
console.log('🧹 CLEANUP ALL: Removiendo sistemas duplicados...');

// 1. Deshabilitar TODOS los sistemas de menú
console.log('🚫 Deshabilitando sistemas de menú...');

const systemsToDisable = [
    'nuclearHamburger',
    'mainUISimple',
    'barraboxInit',
    'barraboxAuth',
    'barraboxDataManager',
    'barraboxEventBus',
    'systemLoader',
    'eventBus',
    'initializeMain',
    'window.barraboxTheme',
    'window.barraboxWaitlist'
];

systemsToDisable.forEach(systemName => {
    if (window[systemName]) {
        console.log(`❌ Deshabilitando: ${systemName}`);
        window[systemName] = null;
    }
});

// 2. Remover menús duplicados
console.log('🗑️ Removiendo menús duplicados...');

// Solo debe haber UN .nav-menu y UN .hamburger
const allNavMenus = document.querySelectorAll('.nav-menu');
const allHamburgers = document.querySelectorAll('.hamburger');

// Remover extras
if (allNavMenus.length > 1) {
    console.log(`❌ ${allNavMenus.length} nav-menus encontrados, manteniendo solo el primero`);
    for (let i = 1; i < allNavMenus.length; i++) {
        allNavMenus[i].remove();
    }
}

if (allHamburgers.length > 1) {
    console.log(`❌ ${allHamburgers.length} hamburgers encontrados, manteniendo solo el primero`);
    for (let i = 1; i < allHamburgers.length; i++) {
        allHamburgers[i].remove();
    }
}

// 3. Asegurar que el menú esté CERRADO
console.log('🔒 Asegurando menú cerrado...');

const navMenu = document.querySelector('.nav-menu');
const hamburger = document.querySelector('.hamburger');

if (navMenu) {
    // Remover clase active
    navMenu.classList.remove('active');
    
    // En móvil, ocultar completamente
    if (window.innerWidth <= 768) {
        navMenu.style.display = 'none';
    } else {
        navMenu.style.display = 'flex';
    }
    
    // Remover estilos inline conflictivos
    navMenu.style.cssText = '';
}

if (hamburger) {
    // Asegurar icono correcto
    hamburger.innerHTML = '<i class="fas fa-bars"></i>';
    
    // Remover todos los event listeners (clonando el elemento)
    const newHamburger = hamburger.cloneNode(true);
    hamburger.parentNode.replaceChild(newHamburger, hamburger);
    
    // Asegurar que sea clickeable
    newHamburger.style.pointerEvents = 'auto';
    newHamburger.style.cursor = 'pointer';
}

// 4. Remover estilos conflictivos
console.log('🎨 Removiendo estilos conflictivos...');

const conflictStyles = document.querySelectorAll('style[id*="nuclear"], style[id*="debug"], style[id*="fix"]');
conflictStyles.forEach(style => {
    console.log(`❌ Removiendo estilo: ${style.id || 'sin id'}`);
    style.remove();
});

// 5. Inyectar estilos limpios
console.log('💉 Inyectando estilos limpios...');

const cleanStyles = `
    /* ESTILOS LIMPIOS PARA MENÚ */
    .nav-menu {
        display: flex;
    }
    
    @media (max-width: 768px) {
        .nav-menu {
            display: none;
            flex-direction: column;
            position: fixed;
            top: 80px;
            left: 0;
            right: 0;
            background: var(--color-surface);
            padding: 2rem;
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            animation: slideDown 0.3s var(--ease-smooth);
            gap: 1rem;
        }
        
        .nav-menu.active {
            display: flex !important;
        }
        
        .hamburger {
            display: block;
            pointer-events: auto !important;
            cursor: pointer !important;
        }
    }
    
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

const styleEl = document.createElement('style');
styleEl.textContent = cleanStyles;
styleEl.id = 'clean-menu-styles';
document.head.appendChild(styleEl);

// 6. Esperar y luego inicializar nuestro sistema simple
console.log('⏳ Esperando para inicializar sistema simple...');

setTimeout(() => {
    console.log('🚀 Inicializando sistema simple...');
    
    // Si nuestro sistema simple no está cargado, cargarlo manualmente
    if (!window.simpleMenu) {
        console.log('📦 Cargando sistema simple manualmente...');
        
        // Crear una versión mínima del sistema simple
        const simpleMenuScript = document.createElement('script');
        simpleMenuScript.src = 'js/simple-menu.js';
        document.head.appendChild(simpleMenuScript);
        
        simpleMenuScript.onload = () => {
            console.log('✅ Sistema simple cargado manualmente');
        };
    } else {
        console.log('✅ Sistema simple ya está cargado');
        
        // Reiniciar el sistema
        if (window.simpleMenu.resetMenuState) {
            window.simpleMenu.resetMenuState();
        }
    }
}, 1000);

// 7. Comandos finales
console.log('\n✅ CLEANUP COMPLETADO');
console.log('📊 Estado final:');
console.log('- .nav-menu:', document.querySelectorAll('.nav-menu').length);
console.log('- .hamburger:', document.querySelectorAll('.hamburger').length);
console.log('- window.simpleMenu:', !!window.simpleMenu);

console.log('\n🛠️ COMANDOS:');
console.log('verifyCleanup() - Verificar que el cleanup funcionó');
console.log('reloadPage() - Recargar página limpia');

window.verifyCleanup = () => {
    console.log('🔍 Verificando cleanup...');
    
    const issues = [];
    
    // Verificar elementos duplicados
    if (document.querySelectorAll('.nav-menu').length > 1) {
        issues.push('❌ Múltiples .nav-menu');
    }
    
    if (document.querySelectorAll('.hamburger').length > 1) {
        issues.push('❌ Múltiples .hamburger');
    }
    
    // Verificar sistemas conflictivos
    const conflictSystems = ['nuclearHamburger', 'mainUISimple', 'barraboxInit'];
    conflictSystems.forEach(system => {
        if (window[system]) {
            issues.push(`❌ Sistema ${system} todavía activo`);
        }
    });
    
    // Verificar menú estado
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu && navMenu.classList.contains('active')) {
        issues.push('❌ Menú tiene clase active (debería estar cerrado)');
    }
    
    if (issues.length === 0) {
        console.log('✅ Todo limpio!');
    } else {
        console.log('⚠️ Problemas encontrados:', issues);
    }
};

window.reloadPage = () => {
    console.log('🔄 Recargando página...');
    location.reload(true); // Recarga forzada (clear cache)
};

console.log('🎯 El menú debería funcionar correctamente ahora.');