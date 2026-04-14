// Debug script para menú hamburguesa
console.log('🔍 DEBUG: Verificando menú hamburguesa...');

// 1. Verificar que los elementos existen
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

console.log('📍 Elementos encontrados:', {
    hamburger: hamburger ? '✅ Sí' : '❌ No',
    navMenu: navMenu ? '✅ Sí' : '❌ No',
    hamburgerHTML: hamburger ? hamburger.outerHTML.substring(0, 100) : 'N/A',
    navMenuHTML: navMenu ? navMenu.outerHTML.substring(0, 100) : 'N/A'
});

// 2. Verificar event listeners
if (hamburger) {
    console.log('🎯 Event listeners en hamburger:', {
        onclick: hamburger.onclick ? '✅ Sí' : '❌ No',
        _listeners: hamburger._listeners || 'N/A',
        eventListeners: hamburger.eventListeners || 'N/A'
    });
    
    // Probar click manualmente
    console.log('🖱️ Probando click manualmente...');
    hamburger.click();
    
    // Verificar si se agregó clase active
    setTimeout(() => {
        console.log('📊 Estado después de click:', {
            navMenuHasActive: navMenu ? navMenu.classList.contains('active') : 'N/A',
            hamburgerIcon: hamburger.innerHTML
        });
    }, 100);
}

// 3. Verificar si hay CSS que bloquee clicks
console.log('🎨 Verificando estilos CSS:');
if (hamburger) {
    const styles = window.getComputedStyle(hamburger);
    console.log('📐 Estilos de hamburger:', {
        pointerEvents: styles.pointerEvents,
        cursor: styles.cursor,
        display: styles.display,
        visibility: styles.visibility,
        opacity: styles.opacity,
        zIndex: styles.zIndex
    });
}

// 4. Verificar si hay elementos superpuestos
console.log('🔍 Verificando elementos superpuestos:');
if (hamburger) {
    const rect = hamburger.getBoundingClientRect();
    const elementsAtPoint = document.elementsFromPoint(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2
    );
    
    console.log('📍 Elementos en la posición del hamburger:', 
        elementsAtPoint.map(el => ({
            tag: el.tagName,
            id: el.id,
            class: el.className,
            isHamburger: el === hamburger
        })).filter(el => el.tag !== 'BODY' && el.tag !== 'HTML')
    );
}

// 5. Comandos para probar manualmente
console.log('🛠️ Comandos disponibles:');
console.log('   toggleMenu() - Alternar menú manualmente');
console.log('   forceOpenMenu() - Forzar abrir menú');
console.log('   forceCloseMenu() - Forzar cerrar menú');

window.toggleMenu = () => {
    if (navMenu && hamburger) {
        navMenu.classList.toggle('active');
        hamburger.innerHTML = navMenu.classList.contains('active') 
            ? '<i class="fas fa-times"></i>' 
            : '<i class="fas fa-bars"></i>';
        console.log('🔄 Menú toggled manualmente');
    }
};

window.forceOpenMenu = () => {
    if (navMenu && hamburger) {
        navMenu.classList.add('active');
        hamburger.innerHTML = '<i class="fas fa-times"></i>';
        console.log('🔓 Menú forzado abierto');
    }
};

window.forceCloseMenu = () => {
    if (navMenu && hamburger) {
        navMenu.classList.remove('active');
        hamburger.innerHTML = '<i class="fas fa-bars"></i>';
        console.log('🔒 Menú forzado cerrado');
    }
};

console.log('✅ Debug script cargado. Ejecuta toggleMenu() para probar.');