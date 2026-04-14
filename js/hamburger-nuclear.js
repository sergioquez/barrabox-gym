// HAMBURGUESA NUCLEAR - Sistema de menú a prueba de fallos
// Versión: 1.0.0 - Funciona SIEMPRE en móvil y desktop

console.log('☢️ HAMBURGUESA NUCLEAR inicializando...');

class HamburgerNuclear {
    constructor() {
        console.log('🍔 Creando menú hamburguesa nuclear...');
        
        // Configuración
        this.config = {
            mobileBreakpoint: 768, // px
            animationDuration: 300, // ms
            zIndex: 9999, // Máximo posible
            overlayOpacity: 0.7,
            backgroundColor: '#ffffff',
            textColor: '#333333',
            accentColor: '#4a6cf7'
        };
        
        // Estado
        this.isOpen = false;
        this.isMobile = window.innerWidth <= this.config.mobileBreakpoint;
        this.menuCreated = false;
        
        // Elementos
        this.elements = {
            originalHamburger: null,
            originalNavMenu: null,
            nuclearHamburger: null,
            nuclearMenu: null,
            overlay: null
        };
        
        this.initialize();
    }
    
    initialize() {
        console.log('⚙️ Configurando hamburguesa nuclear...');
        
        // 1. Detectar viewport
        this.detectViewport();
        
        // 2. Crear menú nuclear (si es necesario)
        this.createNuclearMenu();
        
        // 3. Configurar event listeners
        this.setupEventListeners();
        
        // 4. Inyectar estilos nucleares
        this.injectNuclearStyles();
        
        console.log('✅ Hamburguesa nuclear lista para acción');
        
        // Debug info
        console.log('📊 Estado:', {
            isMobile: this.isMobile,
            menuCreated: this.menuCreated,
            originalElements: {
                hamburger: !!this.elements.originalHamburger,
                navMenu: !!this.elements.originalNavMenu
            }
        });
    }
    
    detectViewport() {
        const width = window.innerWidth;
        this.isMobile = width <= this.config.mobileBreakpoint;
        
        console.log(`📱 Viewport detectado: ${width}px (${this.isMobile ? 'MÓVIL' : 'DESKTOP'})`);
        
        // Escuchar cambios de tamaño
        window.addEventListener('resize', () => {
            const newIsMobile = window.innerWidth <= this.config.mobileBreakpoint;
            if (newIsMobile !== this.isMobile) {
                this.isMobile = newIsMobile;
                console.log(`🔄 Viewport cambiado a: ${this.isMobile ? 'MÓVIL' : 'DESKTOP'}`);
                this.updateMenuForViewport();
            }
        });
    }
    
    createNuclearMenu() {
        console.log('🛠️ Creando elementos nucleares...');
        
        // 1. Buscar elementos originales
        this.elements.originalHamburger = document.querySelector('.hamburger');
        this.elements.originalNavMenu = document.querySelector('.nav-menu');
        
        // 2. Crear overlay (fondo oscuro)
        this.createOverlay();
        
        // 3. Crear botón hamburguesa nuclear (si no existe original)
        if (!this.elements.originalHamburger || this.isMobile) {
            this.createNuclearHamburgerButton();
        }
        
        // 4. Crear menú nuclear (si no existe original o en móvil)
        if (!this.elements.originalNavMenu || this.isMobile) {
            this.createNuclearMenuContent();
        }
        
        this.menuCreated = true;
    }
    
    createOverlay() {
        console.log('🎨 Creando overlay...');
        
        this.elements.overlay = document.createElement('div');
        this.elements.overlay.className = 'nuclear-overlay';
        
        Object.assign(this.elements.overlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            backgroundColor: `rgba(0, 0, 0, ${this.config.overlayOpacity})`,
            zIndex: this.config.zIndex - 1,
            display: 'none',
            opacity: '0',
            transition: `opacity ${this.config.animationDuration}ms ease`
        });
        
        // Cerrar menú al hacer click en overlay
        this.elements.overlay.addEventListener('click', () => {
            this.closeMenu();
        });
        
        document.body.appendChild(this.elements.overlay);
        console.log('✅ Overlay creado');
    }
    
    createNuclearHamburgerButton() {
        console.log('🔄 Creando botón hamburguesa nuclear...');
        
        // Usar original si existe, sino crear nuevo
        if (this.elements.originalHamburger) {
            this.elements.nuclearHamburger = this.elements.originalHamburger;
            console.log('🎯 Usando hamburguesa original');
        } else {
            this.elements.nuclearHamburger = document.createElement('div');
            this.elements.nuclearHamburger.className = 'nuclear-hamburger';
            this.elements.nuclearHamburger.innerHTML = '<i class="fas fa-bars"></i>';
            
            // Posicionar en esquina superior derecha
            Object.assign(this.elements.nuclearHamburger.style, {
                position: 'fixed',
                top: '20px',
                right: '20px',
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: this.config.accentColor,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                cursor: 'pointer',
                zIndex: this.config.zIndex,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                transition: 'all 0.3s ease'
            });
            
            // Agregar al documento
            document.body.appendChild(this.elements.nuclearHamburger);
            console.log('✅ Botón hamburguesa nuclear creado');
        }
        
        // Asegurar que sea clickeable
        this.elements.nuclearHamburger.style.pointerEvents = 'auto';
        this.elements.nuclearHamburger.style.cursor = 'pointer';
    }
    
    createNuclearMenuContent() {
        console.log('📋 Creando contenido del menú nuclear...');
        
        // Usar menú original si existe, sino crear nuevo
        if (this.elements.originalNavMenu) {
            this.elements.nuclearMenu = this.elements.originalNavMenu.cloneNode(true);
            this.elements.nuclearMenu.className = 'nuclear-menu';
            console.log('🎯 Clonando menú original');
        } else {
            this.elements.nuclearMenu = document.createElement('div');
            this.elements.nuclearMenu.className = 'nuclear-menu';
            
            // Contenido por defecto
            const menuItems = [
                { text: 'Inicio', href: '#home' },
                { text: 'Clases', href: '#classes' },
                { text: 'Planes', href: '#pricing' },
                { text: 'Nosotros', href: '#about' },
                { text: 'Contacto', href: '#contact' },
                { text: 'Iniciar Sesión', href: '#login', className: 'menu-login' }
            ];
            
            menuItems.forEach(item => {
                const link = document.createElement('a');
                link.href = item.href;
                link.textContent = item.text;
                link.className = item.className || '';
                
                link.addEventListener('click', (e) => {
                    if (item.href === '#login') {
                        e.preventDefault();
                        this.openLoginModal();
                    }
                    this.closeMenu();
                });
                
                this.elements.nuclearMenu.appendChild(link);
            });
            
            console.log('✅ Menú nuclear creado con contenido por defecto');
        }
        
        // Estilos del menú
        Object.assign(this.elements.nuclearMenu.style, {
            position: 'fixed',
            top: '0',
            right: '0',
            bottom: '0',
            width: this.isMobile ? '85%' : '300px',
            maxWidth: '400px',
            backgroundColor: this.config.backgroundColor,
            zIndex: this.config.zIndex,
            padding: '2rem',
            boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
            transform: 'translateX(100%)',
            transition: `transform ${this.config.animationDuration}ms ease`,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
        });
        
        // Estilos de los links
        const links = this.elements.nuclearMenu.querySelectorAll('a');
        links.forEach(link => {
            Object.assign(link.style, {
                color: this.config.textColor,
                textDecoration: 'none',
                fontSize: '1.1rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                display: 'block'
            });
            
            // Efecto hover
            link.addEventListener('mouseenter', () => {
                link.style.backgroundColor = this.config.accentColor;
                link.style.color = 'white';
                link.style.transform = 'translateX(-5px)';
            });
            
            link.addEventListener('mouseleave', () => {
                link.style.backgroundColor = '';
                link.style.color = this.config.textColor;
                link.style.transform = '';
            });
        });
        
        // Agregar al documento
        document.body.appendChild(this.elements.nuclearMenu);
        console.log('✅ Menú nuclear agregado al documento');
    }
    
    setupEventListeners() {
        console.log('🎯 Configurando event listeners nucleares...');
        
        // 1. Hamburguesa original (si existe)
        if (this.elements.originalHamburger) {
            console.log('🔗 Conectando a hamburguesa original...');
            
            // Remover listeners existentes para evitar conflictos
            const newHamburger = this.elements.originalHamburger.cloneNode(true);
            this.elements.originalHamburger.parentNode.replaceChild(newHamburger, this.elements.originalHamburger);
            this.elements.originalHamburger = newHamburger;
            
            // Agregar nuestro listener
            this.elements.originalHamburger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🖱️ Click en hamburguesa original detectado');
                this.toggleMenu();
            });
            
            // Asegurar que sea clickeable
            this.elements.originalHamburger.style.pointerEvents = 'auto';
            this.elements.originalHamburger.style.cursor = 'pointer';
        }
        
        // 2. Hamburguesa nuclear (si creamos una)
        if (this.elements.nuclearHamburger && this.elements.nuclearHamburger !== this.elements.originalHamburger) {
            this.elements.nuclearHamburger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🖱️ Click en hamburguesa nuclear detectado');
                this.toggleMenu();
            });
        }
        
        // 3. Cerrar con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                console.log('🔒 Escape presionado, cerrando menú');
                this.closeMenu();
            }
        });
        
        // 4. Touch events para móvil
        if ('ontouchstart' in window) {
            console.log('📱 Configurando touch events para móvil...');
            
            // Prevenir scroll cuando menú está abierto
            this.elements.nuclearMenu?.addEventListener('touchmove', (e) => {
                if (this.isOpen) {
                    e.preventDefault();
                }
            }, { passive: false });
        }
        
        console.log('✅ Event listeners nucleares configurados');
    }
    
    injectNuclearStyles() {
        console.log('💉 Inyectando estilos nucleares...');
        
        const nuclearStyles = `
            /* ESTILOS NUCLEARES - Sobreescriben TODO */
            .nuclear-hamburger, .hamburger {
                pointer-events: auto !important;
                cursor: pointer !important;
                z-index: 9999 !important;
            }
            
            /* Prevenir que otros estilos oculten el menú */
            .nav-menu, .nuclear-menu {
                display: flex !important;
                visibility: visible !important;
                opacity: 1 !important;
            }
            
            /* Overlay */
            .nuclear-overlay.show {
                display: block !important;
                opacity: 1 !important;
            }
            
            /* Menú abierto */
            .nuclear-menu.open {
                transform: translateX(0) !important;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .nuclear-menu {
                    width: 85% !important;
                }
                
                .hamburger {
                    top: 15px !important;
                    right: 15px !important;
                }
            }
            
            /* Animaciones */
            @keyframes nuclearSlideIn {
                from {
                    transform: translateX(100%);
                }
                to {
                    transform: translateX(0);
                }
            }
            
            .nuclear-menu {
                animation: nuclearSlideIn 0.3s ease !important;
            }
        `;
        
        const styleEl = document.createElement('style');
        styleEl.textContent = nuclearStyles;
        styleEl.id = 'nuclear-styles';
        document.head.appendChild(styleEl);
        
        console.log('✅ Estilos nucleares inyectados');
    }
    
    // Métodos de control
    
    toggleMenu() {
        console.log('🔄 Alternando menú nuclear...');
        
        if (this.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }
    
    openMenu() {
        console.log('🔓 Abriendo menú nuclear...');
        
        // Mostrar overlay
        if (this.elements.overlay) {
            this.elements.overlay.style.display = 'block';
            setTimeout(() => {
                this.elements.overlay.style.opacity = '1';
            }, 10);
        }
        
        // Mostrar menú
        if (this.elements.nuclearMenu) {
            this.elements.nuclearMenu.style.transform = 'translateX(0)';
        }
        
        // También mostrar menú original si existe
        if (this.elements.originalNavMenu) {
            this.elements.originalNavMenu.classList.add('active');
            this.elements.originalNavMenu.style.display = 'flex';
            this.elements.originalNavMenu.style.visibility = 'visible';
            this.elements.originalNavMenu.style.opacity = '1';
        }
        
        // Bloquear scroll del body
        document.body.style.overflow = 'hidden';
        
        this.isOpen = true;
        
        console.log('✅ Menú nuclear ABIERTO');
        
        // Emitir evento
        this.dispatchEvent('menu:open');
    }
    
    closeMenu() {
        console.log('🔒 Cerrando menú nuclear...');
        
        // Ocultar overlay
        if (this.elements.overlay) {
            this.elements.overlay.style.opacity = '0';
            setTimeout(() => {
                this.elements.overlay.style.display = 'none';
            }, this.config.animationDuration);
        }
        
        // Ocultar menú
        if (this.elements.nuclearMenu) {
            this.elements.nuclearMenu.style.transform = 'translateX(100%)';
        }
        
        // También ocultar menú original si existe
        if (this.elements.originalNavMenu) {
            this.elements.originalNavMenu.classList.remove('active');
            this.elements.originalNavMenu.style.display = 'none';
        }
        
        // Restaurar scroll del body
        document.body.style.overflow = '';
        
        this.isOpen = false;
        
        console.log('✅ Menú nuclear CERRADO');
        
        // Emitir evento
        this.dispatchEvent('menu:close');
    }
    
    openLoginModal() {
        console.log('🔐 Abriendo modal de login desde menú nuclear...');
        
        // Buscar modal de login existente
        const loginModal = document.getElementById('loginModal');
        const loginBtn = document.querySelector('.btn-login');
        
        if (loginModal) {
            loginModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            console.log('✅ Modal de login abierto');
        } else if (loginBtn) {
            loginBtn.click();
        } else {
            console.log('ℹ️ No se encontró modal de login, mostrando alerta');
            alert('Para iniciar sesión, por favor usa el botón "Iniciar Sesión" en el header.');
        }
    }
    
    updateMenuForViewport() {
        console.log('🔄 Actualizando menú para viewport...');
        
        if (this.elements.nuclearMenu) {
            this.elements.nuclearMenu.style.width = this.isMobile ? '85%' : '300px';
        }
        
        // Cerrar menú si cambia de móvil a desktop
        if (!this.isMobile && this.isOpen) {
            this.closeMenu();
        }
    }
    
    dispatchEvent(eventName, data = {}) {
        console.log(`📢 Evento nuclear: ${eventName}`, data);
        
        // Usar Event Bus si está disponible
        if (window.eventBus) {
            window.eventBus.emit(eventName, data);
        }
        
        // También disparar evento nativo
        const event = new CustomEvent(eventName, { detail: data });
        window.dispatchEvent(event);
    }
    
    // Métodos de utilidad
    
    getStatus() {
        return {
            isOpen: this.isOpen,
            isMobile: this.isMobile,
            menuCreated: this.menuCreated,
            elements: {
                originalHamburger: !!this.elements.originalHamburger,
                originalNavMenu: !!this.elements.originalNavMenu,
                nuclearHamburger: !!this.elements.nuclearHamburger,
                nuclearMenu: !!this.elements.nuclearMenu,
                overlay: !!this.elements.overlay
            }
        };
    }
    
    // Forzar apertura/cierre (para debugging)
    forceOpen() {
        console.log('💥 FORZANDO apertura del menú');
        this.openMenu();
    }
    
    forceClose() {
        console.log('💥 FORZANDO cierre del menú');
        this.closeMenu();
    }
}

// Inicializar sistema nuclear
if (typeof window !== 'undefined') {
    // Esperar a que DOM esté listo
    const initNuclearHamburger = () => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                window.nuclearHamburger = new HamburgerNuclear();
                console.log('☢️ Hamburguesa Nuclear disponible como window.nuclearHamburger');
            });
        } else {
            window.nuclearHamburger = new HamburgerNuclear();
            console.log('☢️ Hamburguesa Nuclear disponible como window.nuclearHamburger');
        }
    };
    
    // Iniciar después de breve delay
    setTimeout(initNuclearHamburger, 500);
}