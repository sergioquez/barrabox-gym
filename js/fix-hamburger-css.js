// Fix para menú hamburguesa - Problema de CSS
console.log('🎨 DEBUG: Diagnosticando problema CSS del menú hamburguesa...');

const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (!hamburger || !navMenu) {
    console.error('❌ No se encontraron elementos del menú');
    return;
}

// 1. Verificar clases actuales
console.log('📋 Clases actuales:', {
    hamburger: hamburger.className,
    navMenu: navMenu.className
});

// 2. Forzar agregar clase active y verificar estilos
console.log('🔄 Agregando clase "active" manualmente...');
navMenu.classList.add('active');

// 3. Verificar estilos computados
setTimeout(() => {
    const styles = window.getComputedStyle(navMenu);
    
    console.log('🎨 Estilos computados de navMenu (con active):', {
        display: styles.display,
        visibility: styles.visibility,
        opacity: styles.opacity,
        transform: styles.transform,
        left: styles.left,
        right: styles.right,
        width: styles.width,
        height: styles.height,
        position: styles.position,
        zIndex: styles.zIndex,
        backgroundColor: styles.backgroundColor
    });
    
    // 4. Verificar si hay reglas CSS que sobrescriben
    console.log('🔍 Buscando reglas CSS para .nav-menu.active...');
    
    // Buscar en todos los stylesheets
    for (let i = 0; i < document.styleSheets.length; i++) {
        try {
            const sheet = document.styleSheets[i];
            const rules = sheet.cssRules || sheet.rules;
            
            if (rules) {
                for (let j = 0; j < rules.length; j++) {
                    const rule = rules[j];
                    if (rule.selectorText && 
                        (rule.selectorText.includes('.nav-menu.active') || 
                         rule.selectorText.includes('.nav-menu.active') ||
                         rule.selectorText.includes('.active') && rule.selectorText.includes('.nav-menu'))) {
                        console.log('📝 Regla CSS encontrada:', rule.selectorText, rule.cssText);
                    }
                }
            }
        } catch (e) {
            // Ignorar errores de CORS
        }
    }
    
    // 5. Aplicar estilos de emergencia si es necesario
    console.log('🚀 Aplicando estilos de emergencia...');
    
    // Estilos mínimos para que el menú sea visible
    const emergencyStyles = `
        .nav-menu.active {
            display: flex !important;
            visibility: visible !important;
            opacity: 1 !important;
            transform: none !important;
            left: 0 !important;
            right: auto !important;
            width: 100% !important;
            height: auto !important;
            position: fixed !important;
            top: 80px !important;
            background: var(--color-surface) !important;
            z-index: 1000 !important;
            box-shadow: var(--shadow-lg) !important;
            padding: 2rem !important;
            flex-direction: column !important;
            gap: 1rem !important;
        }
        
        .nav-menu.active a {
            color: var(--color-text-primary) !important;
            font-size: 1.2rem !important;
            padding: 0.75rem 1rem !important;
            border-radius: var(--border-radius-base) !important;
            transition: all 0.3s var(--ease-smooth) !important;
        }
        
        .nav-menu.active a:hover {
            background: var(--color-brand-primary) !important;
            color: white !important;
            transform: translateX(5px) !important;
        }
        
        /* Para móviles */
        @media (max-width: 768px) {
            .nav-menu.active {
                top: 70px !important;
                padding: 1.5rem !important;
            }
        }
    `;
    
    // Crear y agregar stylesheet de emergencia
    const styleEl = document.createElement('style');
    styleEl.textContent = emergencyStyles;
    document.head.appendChild(styleEl);
    
    console.log('✅ Estilos de emergencia aplicados. El menú DEBERÍA ser visible ahora.');
    
    // 6. Comandos para probar
    console.log('🛠️ Comandos disponibles:');
    console.log('   testMenu() - Probar visibilidad del menú');
    console.log('   fixMenuCSS() - Aplicar fix CSS permanente');
    
    window.testMenu = () => {
        console.log('🧪 Probando visibilidad del menú...');
        const rect = navMenu.getBoundingClientRect();
        console.log('📏 Dimensiones del menú:', {
            width: rect.width,
            height: rect.height,
            top: rect.top,
            left: rect.left,
            visible: rect.width > 0 && rect.height > 0
        });
        
        // Verificar si es visible para el usuario
        const isVisible = (
            rect.width > 0 &&
            rect.height > 0 &&
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
        
        console.log('👁️ ¿Visible en viewport?', isVisible ? '✅ Sí' : '❌ No');
    };
    
    window.fixMenuCSS = () => {
        console.log('🔧 Aplicando fix CSS permanente...');
        
        // Agregar estilos inline como último recurso
        navMenu.style.cssText = `
            display: flex !important;
            visibility: visible !important;
            opacity: 1 !important;
            transform: none !important;
            position: fixed !important;
            top: 80px !important;
            left: 0 !important;
            right: 0 !important;
            background: var(--color-surface) !important;
            z-index: 1000 !important;
            box-shadow: var(--shadow-lg) !important;
            padding: 2rem !important;
            flex-direction: column !important;
            gap: 1rem !important;
            width: 100% !important;
            height: auto !important;
        `;
        
        console.log('✅ Fix CSS aplicado. Recarga la página para ver cambios permanentes.');
    };
    
    // Ejecutar test automáticamente
    setTimeout(testMenu, 100);
    
}, 100);

console.log('✅ Debug CSS cargado. El menú debería ser visible ahora.');