// SIMPLE MENU - Sistema ultra simple de menú hamburguesa
// Versión: 1.0.0 - Sin dependencias, sin complejidades

console.log('🍔 SIMPLE MENU inicializando...');

class SimpleMenu {
    constructor() {
        console.log('🔄 Configurando menú simple...');
        
        this.hamburger = null;
        this.navMenu = null;
        this.isOpen = false;
        
        this.initialize();
    }
    
    initialize() {
        console.log('🔍 Buscando elementos del menú...');
        
        // 1. Buscar elementos
        this.hamburger = document.querySelector('.hamburger');
        this.navMenu = document.querySelector('.nav-menu');
        
        console.log('📍 Elementos encontrados:', {
            hamburger: !!this.hamburger,
            navMenu: !!this.navMenu
        });
        
        if (!this.hamburger || !this.navMenu) {
            console.error('❌ No se encontraron elementos del menú');
            return;
        }
        
        // 2. Asegurar estado inicial
        this.resetMenuState();
        
        // 3. Configurar event listener
        this.setupEventListener();
        
        // 4. Configurar cierre al hacer click fuera
        this.setupClickOutside();
        
        // 5. Configurar cierre con Escape
        this.setupEscapeClose();
        
        console.log('✅ Menú simple configurado');
    }
    
    resetMenuState() {
        console.log('🔄 Reseteando estado del menú...');
        
        // Asegurar que el menú empiece CERRADO
        this.navMenu.classList.remove('active');
        this.isOpen = false;
        
        // Asegurar icono correcto
        this.hamburger.innerHTML = '<i class="fas fa-bars"></i>';
        
        // En móvil, ocultar el menú completamente
        if (window.innerWidth <= 768) {
            this.navMenu.style.display = 'none';
        } else {
            this.navMenu.style.display = 'flex';
        }
        
        console.log('📊 Estado inicial:', {
            isOpen: this.isOpen,
            hasActiveClass: this.navMenu.classList.contains('active'),
            display: this.navMenu.style.display
        });
    }
    
    setupEventListener() {
        console.log('🎯 Configurando event listener simple...');
        
        // Remover cualquier listener existente
        const newHamburger = this.hamburger.cloneNode(true);
        this.hamburger.parentNode.replaceChild(newHamburger, this.hamburger);
        this.hamburger = newHamburger;
        
        // Agregar nuestro listener simple
        this.hamburger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🖱️ Click en hamburguesa detectado');
            this.toggleMenu();
        });
        
        // Asegurar que sea clickeable
        this.hamburger.style.pointerEvents = 'auto';
        this.hamburger.style.cursor = 'pointer';
        
        console.log('✅ Event listener configurado');
    }
    
    setupClickOutside() {
        console.log('👁️ Configurando cierre al click fuera...');
        
        document.addEventListener('click', (e) => {
            if (this.isOpen && 
                !this.hamburger.contains(e.target) && 
                !this.navMenu.contains(e.target)) {
                console.log('👆 Click fuera del menú, cerrando...');
                this.closeMenu();
            }
        });
    }
    
    setupEscapeClose() {
        console.log('⌨️ Configurando cierre con Escape...');
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                console.log('🔒 Escape presionado, cerrando menú');
                this.closeMenu();
            }
        });
    }
    
    toggleMenu() {
        console.log('🔄 Alternando menú...');
        
        if (this.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }
    
    openMenu() {
        console.log('🔓 Abriendo menú...');
        
        // Agregar clase active
        this.navMenu.classList.add('active');
        this.isOpen = true;
        
        // Cambiar icono
        this.hamburger.innerHTML = '<i class="fas fa-times"></i>';
        
        // En móvil, mostrar el menú
        if (window.innerWidth <= 768) {
            this.navMenu.style.display = 'flex';
        }
        
        // Bloquear scroll del body
        document.body.style.overflow = 'hidden';
        
        console.log('✅ Menú ABIERTO');
    }
    
    closeMenu() {
        console.log('🔒 Cerrando menú...');
        
        // Remover clase active
        this.navMenu.classList.remove('active');
        this.isOpen = false;
        
        // Cambiar icono
        this.hamburger.innerHTML = '<i class="fas fa-bars"></i>';
        
        // En móvil, ocultar el menú
        if (window.innerWidth <= 768) {
            setTimeout(() => {
                this.navMenu.style.display = 'none';
            }, 300); // Esperar a que termine la animación
        }
        
        // Restaurar scroll del body
        document.body.style.overflow = '';
        
        console.log('✅ Menú CERRADO');
    }
    
    // Métodos de utilidad
    
    getStatus() {
        return {
            isOpen: this.isOpen,
            elements: {
                hamburger: !!this.hamburger,
                navMenu: !!this.navMenu
            },
            viewport: {
                width: window.innerWidth,
                isMobile: window.innerWidth <= 768
            }
        };
    }
    
    forceOpen() {
        console.log('💥 Forzando apertura del menú');
        this.openMenu();
    }
    
    forceClose() {
        console.log('💥 Forzando cierre del menú');
        this.closeMenu();
    }
}

// Inicializar cuando DOM esté listo
if (typeof window !== 'undefined') {
    const initSimpleMenu = () => {
        window.simpleMenu = new SimpleMenu();
        console.log('🍔 Simple Menu disponible como window.simpleMenu');
        
        // Comandos de debug
        console.log('🛠️ Comandos disponibles:');
        console.log('   window.simpleMenu.forceOpen()');
        console.log('   window.simpleMenu.forceClose()');
        console.log('   window.simpleMenu.getStatus()');
    };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSimpleMenu);
    } else {
        initSimpleMenu();
    }
}