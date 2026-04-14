// Fix para menú que se muestra desplegado siempre
console.log('🔧 Aplicando fix para menú desplegado...');

// 1. Remover clase 'active' del nav-menu al cargar
const navMenu = document.querySelector('.nav-menu');
if (navMenu && navMenu.classList.contains('active')) {
    console.log('❌ Menú tiene clase "active" al cargar, removiendo...');
    navMenu.classList.remove('active');
    
    // También resetear el icono del hamburger
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        hamburger.innerHTML = '<i class="fas fa-bars"></i>';
    }
}

// 2. Verificar que el CSS esté aplicando correctamente
console.log('🎨 Verificando estilos del menú...');
if (navMenu) {
    const styles = window.getComputedStyle(navMenu);
    console.log('📊 Estilos del nav-menu:', {
        display: styles.display,
        position: styles.position,
        top: styles.top,
        left: styles.left,
        width: styles.width,
        height: styles.height,
        backgroundColor: styles.backgroundColor
    });
}

// 3. Asegurar que el menú esté oculto por defecto en móvil
const mediaQuery = window.matchMedia('(max-width: 768px)');
if (mediaQuery.matches && navMenu) {
    console.log('📱 En móvil, ocultando menú...');
    navMenu.style.display = 'none';
    
    // Solo mostrar cuando tenga clase 'active'
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                if (navMenu.classList.contains('active')) {
                    navMenu.style.display = 'flex';
                } else {
                    navMenu.style.display = 'none';
                }
            }
        });
    });
    
    observer.observe(navMenu, { attributes: true });
}

// 4. Fix para hamburger icon
const hamburger = document.querySelector('.hamburger');
if (hamburger) {
    console.log('🍔 Configurando hamburger icon...');
    
    // Asegurar que empiece con icono de barras
    if (!hamburger.innerHTML.includes('fa-bars') && !hamburger.innerHTML.includes('fa-times')) {
        hamburger.innerHTML = '<i class="fas fa-bars"></i>';
    }
    
    // Asegurar que sea clickeable
    hamburger.style.pointerEvents = 'auto';
    hamburger.style.cursor = 'pointer';
}

// 5. Comando para debug
window.fixMenuDisplay = () => {
    console.log('🛠️ Forzando fix de menú...');
    
    if (navMenu) {
        navMenu.classList.remove('active');
        navMenu.style.display = 'none';
    }
    
    if (hamburger) {
        hamburger.innerHTML = '<i class="fas fa-bars"></i>';
    }
    
    console.log('✅ Menú fixeado');
};

console.log('✅ Fix aplicado. El menú debería estar oculto al cargar.');