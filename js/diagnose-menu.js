// DIAGNÓSTICO: Menú se ve 2 veces en móvil
console.log('🔍 DIAGNÓSTICO: Menú duplicado en móvil');

// 1. Contar cuántos menús hay
const allNavMenus = document.querySelectorAll('.nav-menu');
const allHamburgers = document.querySelectorAll('.hamburger');

console.log('📊 CONTEO DE ELEMENTOS:');
console.log('- .nav-menu encontrados:', allNavMenus.length);
console.log('- .hamburger encontrados:', allHamburgers.length);

// 2. Mostrar información de cada menú
allNavMenus.forEach((menu, index) => {
    console.log(`\n📋 NAV-MENU #${index + 1}:`);
    console.log('- HTML:', menu.outerHTML.substring(0, 200) + '...');
    console.log('- Clases:', menu.className);
    console.log('- Estilos:', {
        display: window.getComputedStyle(menu).display,
        position: window.getComputedStyle(menu).position,
        top: window.getComputedStyle(menu).top,
        left: window.getComputedStyle(menu).left
    });
    console.log('- Parent:', menu.parentNode ? menu.parentNode.tagName : 'N/A');
    console.log('- En viewport?', menu.getBoundingClientRect().width > 0 ? '✅ Sí' : '❌ No');
});

// 3. Mostrar información de cada hamburger
allHamburgers.forEach((hamburger, index) => {
    console.log(`\n🍔 HAMBURGER #${index + 1}:`);
    console.log('- HTML:', hamburger.outerHTML);
    console.log('- Clases:', hamburger.className);
    console.log('- Estilos:', {
        display: window.getComputedStyle(hamburger).display,
        position: window.getComputedStyle(hamburger).position,
        top: window.getComputedStyle(hamburger).top,
        left: window.getComputedStyle(hamburger).left
    });
    console.log('- Parent:', hamburger.parentNode ? hamburger.parentNode.tagName : 'N/A');
});

// 4. Verificar qué scripts están cargados
console.log('\n📜 SCRIPTS CARGADOS:');
const scripts = document.querySelectorAll('script[src]');
scripts.forEach(script => {
    console.log('-', script.src);
});

// 5. Verificar event listeners
console.log('\n🎯 EVENT LISTENERS:');
if (allHamburgers.length > 0) {
    const hamburger = allHamburgers[0];
    console.log('- onclick:', hamburger.onclick ? '✅ Sí' : '❌ No');
    
    // Intentar ver listeners (no estándar, pero informativo)
    console.log('- _listeners:', hamburger._listeners || 'N/A');
}

// 6. Comandos para limpiar
console.log('\n🛠️ COMANDOS DISPONIBLES:');
console.log('cleanupDuplicateMenus() - Remover menús duplicados');
console.log('disableOtherMenuSystems() - Deshabilitar otros sistemas');
console.log('forceSimpleMenuOnly() - Forzar solo nuestro sistema simple');

window.cleanupDuplicateMenus = () => {
    console.log('🧹 Limpiando menús duplicados...');
    
    // Mantener solo el primer nav-menu
    if (allNavMenus.length > 1) {
        for (let i = 1; i < allNavMenus.length; i++) {
            console.log(`❌ Removiendo nav-menu #${i + 1}`);
            allNavMenus[i].remove();
        }
    }
    
    // Mantener solo el primer hamburger
    if (allHamburgers.length > 1) {
        for (let i = 1; i < allHamburgers.length; i++) {
            console.log(`❌ Removiendo hamburger #${i + 1}`);
            allHamburgers[i].remove();
        }
    }
    
    console.log('✅ Limpieza completada');
    console.log('- .nav-menu restantes:', document.querySelectorAll('.nav-menu').length);
    console.log('- .hamburger restantes:', document.querySelectorAll('.hamburger').length);
};

window.disableOtherMenuSystems = () => {
    console.log('🚫 Deshabilitando otros sistemas de menú...');
    
    // Deshabilitar cualquier sistema que no sea el nuestro
    if (window.simpleMenu) {
        console.log('✅ Nuestro sistema simple está activo');
    }
    
    if (window.nuclearHamburger) {
        console.log('❌ Sistema nuclear detectado, deshabilitando...');
        window.nuclearHamburger = null;
    }
    
    if (window.mainUISimple) {
        console.log('❌ Main UI Simple detectado, deshabilitando...');
        window.mainUISimple = null;
    }
    
    if (window.barraboxInit) {
        console.log('❌ Init System detectado, deshabilitando...');
        window.barraboxInit = null;
    }
    
    console.log('✅ Otros sistemas deshabilitados');
};

window.forceSimpleMenuOnly = () => {
    console.log('💥 Forzando solo sistema simple...');
    
    cleanupDuplicateMenus();
    disableOtherMenuSystems();
    
    // Reiniciar nuestro sistema simple
    if (window.simpleMenu) {
        window.simpleMenu.forceClose();
        setTimeout(() => {
            window.simpleMenu.resetMenuState();
            console.log('✅ Sistema simple reiniciado');
        }, 100);
    }
    
    console.log('🎯 Solo sistema simple activo');
};

console.log('✅ Diagnóstico completado. Ejecuta cleanupDuplicateMenus() para limpiar.');