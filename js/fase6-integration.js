// FASE 6 Integration - Sistema completo de Polish & UX

class Fase6Integration {
    constructor() {
        
        // Sistemas
        this.systems = {
            theme: null,
            waitlist: null,
            animations: null,
            rating: null,
            pwa: null
        };
        
        // Estado
        this.isInitialized = false;
        this.loadedSystems = new Set();
        
        // Inicializar
        this.initialize();
    }
    
    // Inicializar todos los sistemas
    async initialize() {
        try {
            
            // 1. Cargar sistemas en orden
            await this.loadThemeSystem();
            await this.loadWaitlistSystem();
            await this.loadAnimations();
            // Rating y PWA pendientes de implementación
            // await this.loadRatingSystem();
            // await this.loadPWASystem();
            
            // 2. Aplicar mejoras de UX
            this.applyUXEnhancements();
            
            // 3. Configurar event listeners
            this.setupEventListeners();
            
            // 4. Marcar como inicializado
            this.isInitialized = true;
            
            
            // Disparar evento
            this.dispatchEvent('fase6:initialized', {
                systems: Array.from(this.loadedSystems),
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('❌ Error inicializando FASE 6:', error);
        }
    }
    
    // Cargar sistema de temas
    async loadThemeSystem() {
        try {
            
            // Verificar si el script ya está cargado
            if (typeof window.barraboxTheme !== 'undefined') {
                this.systems.theme = window.barraboxTheme;
            } else {
                // Cargar script
                await this.loadScript('js/theme-system.js');
                
                // Esperar a que se inicialice
                await this.waitForCondition(() => 
                    typeof window.barraboxTheme !== 'undefined' && 
                    window.barraboxTheme.isInitialized
                );
                
                this.systems.theme = window.barraboxTheme;
            }
            
            this.loadedSystems.add('theme');
            
            // Crear botón de toggle de tema
            if (this.systems.theme && this.systems.theme.createThemeToggleButton) {
                this.systems.theme.createThemeToggleButton({
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    size: 'medium',
                    showText: true,
                    animation: true
                });
            }
            
        } catch (error) {
            console.error('❌ Error cargando Theme System:', error);
        }
    }
    
    // Cargar sistema de waitlist
    async loadWaitlistSystem() {
        try {
            
            // Verificar dependencias
            if (!window.barraboxDataManager || !window.barraboxAuth) {
                console.log('⏳ Esperando dependencias para Waitlist System...');
                await this.waitForCondition(() => 
                    window.barraboxDataManager && window.barraboxAuth
                );
            }
            
            // Verificar si el script ya está cargado
            if (typeof window.barraboxWaitlist !== 'undefined') {
                this.systems.waitlist = window.barraboxWaitlist;
            } else {
                // Cargar script
                await this.loadScript('js/waitlist-system.js');
                
                // Esperar a que se inicialice
                await this.waitForCondition(() => 
                    typeof window.barraboxWaitlist !== 'undefined' && 
                    window.barraboxWaitlist.isInitialized
                );
                
                this.systems.waitlist = window.barraboxWaitlist;
            }
            
            this.loadedSystems.add('waitlist');
            
            // Integrar UI de waitlist
            if (this.systems.waitlist) {
                // Llamar a la función de integración si existe
                if (typeof integrateWaitlistUI === 'function') {
                    integrateWaitlistUI();
                }
            }
            
        } catch (error) {
            console.error('❌ Error cargando Waitlist System:', error);
        }
    }
    
    // Cargar animaciones
    async loadAnimations() {
        try {
            
            // Cargar CSS de animaciones
            await this.loadCSS('css/animations.css');
            
            // Aplicar clases de animación a elementos existentes
            this.applyAnimationClasses();
            
            this.loadedSystems.add('animations');
            
        } catch (error) {
            console.error('❌ Error cargando animaciones:', error);
        }
    }
    
    // Cargar sistema de rating
    async loadRatingSystem() {
        try {
            console.log('⭐ Cargando Rating System...');
            
            // Verificar dependencias
            if (!window.barraboxDataManager || !window.barraboxAuth) {
                console.log('⏳ Esperando dependencias para Rating System...');
                await this.waitForCondition(() => 
                    window.barraboxDataManager && window.barraboxAuth
                );
            }
            
            // Cargar script (si existe)
            if (await this.scriptExists('js/rating-system.js')) {
                await this.loadScript('js/rating-system.js');
                
                // Esperar a que se inicialice
                await this.waitForCondition(() => 
                    typeof window.barraboxRating !== 'undefined' && 
                    window.barraboxRating.isInitialized
                );
                
                this.systems.rating = window.barraboxRating;
                this.loadedSystems.add('rating');
            } else {
                console.log('ℹ️ Rating System no disponible (archivo no encontrado)');
            }
            
        } catch (error) {
            console.error('❌ Error cargando Rating System:', error);
        }
    }
    
    // Cargar sistema PWA
    async loadPWASystem() {
        try {
            
            // Verificar si existe service worker
            if ('serviceWorker' in navigator) {
                // Cargar script (si existe)
                if (await this.scriptExists('js/pwa-service-worker.js')) {
                    await this.loadScript('js/pwa-service-worker.js');
                    this.loadedSystems.add('pwa');
                } else {
                    console.log('ℹ️ PWA System no disponible (archivo no encontrado)');
                }
            } else {
                console.log('ℹ️ PWA no soportado en este navegador');
            }
            
        } catch (error) {
            console.error('❌ Error cargando PWA System:', error);
        }
    }
    
    // Aplicar mejoras de UX
    applyUXEnhancements() {
        
        // 1. Mejorar formularios
        this.enhanceForms();
        
        // 2. Mejorar navegación
        this.enhanceNavigation();
        
        // 3. Agregar skeleton loading
        this.addSkeletonLoading();
        
        // 4. Mejorar feedback visual
        this.enhanceVisualFeedback();
        
        // 5. Optimizar para móviles
        this.optimizeForMobile();
        
    }
    
    // Mejorar formularios
    enhanceForms() {
        // Agregar validación en tiempo real
        document.querySelectorAll('input, select, textarea').forEach(input => {
            // Agregar clases de validación
            input.addEventListener('blur', function() {
                if (this.value.trim() === '' && this.hasAttribute('required')) {
                    this.classList.add('is-invalid');
                } else {
                    this.classList.remove('is-invalid');
                    this.classList.add('is-valid');
                }
            });
            
            // Limpiar validación al enfocar
            input.addEventListener('focus', function() {
                this.classList.remove('is-invalid', 'is-valid');
            });
        });
        
        // Mejorar selects
        document.querySelectorAll('select').forEach(select => {
            select.classList.add('form-select');
        });
        
        // Mejorar checkboxes y radios
        document.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(input => {
            const wrapper = document.createElement('div');
            wrapper.className = 'form-check';
            
            const label = input.nextElementSibling?.tagName === 'LABEL' 
                ? input.nextElementSibling 
                : document.querySelector(`label[for="${input.id}"]`);
            
            if (label) {
                label.classList.add('form-check-label');
                input.classList.add('form-check-input');
                
                input.parentNode.insertBefore(wrapper, input);
                wrapper.appendChild(input);
                wrapper.appendChild(label);
            }
        });
    }
    
    // Mejorar navegación
    enhanceNavigation() {
        // Agregar transiciones suaves entre páginas
        document.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]').forEach(link => {
            if (link.getAttribute('href').includes('.html') && 
                !link.getAttribute('href').includes('#')) {
                
                link.addEventListener('click', (e) => {
                    // Solo aplicar si no es un enlace externo o especial
                    if (!link.target && !link.download && !link.href.includes('mailto:') && !link.href.includes('tel:')) {
                        e.preventDefault();
                        
                        // Agregar animación de salida
                        document.body.classList.add('page-transition-exit');
                        
                        // Navegar después de la animación
                        setTimeout(() => {
                            window.location.href = link.href;
                        }, 300);
                    }
                });
            }
        });
        
        // Agregar breadcrumbs si no existen
        if (!document.querySelector('.breadcrumb')) {
            this.addBreadcrumbs();
        }
    }
    
    // Agregar breadcrumbs
    addBreadcrumbs() {
        const path = window.location.pathname;
        const parts = path.split('/').filter(p => p && !p.includes('.html'));
        const currentPage = document.title.replace(' - Barrabox Gym', '');
        
        if (parts.length > 0) {
            const breadcrumb = document.createElement('nav');
            breadcrumb.className = 'breadcrumb';
            breadcrumb.setAttribute('aria-label', 'breadcrumb');
            
            let html = '<ol>';
            html += '<li><a href="/"><i class="fas fa-home"></i> Inicio</a></li>';
            
            parts.forEach((part, index) => {
                const name = part.charAt(0).toUpperCase() + part.slice(1);
                const isLast = index === parts.length - 1;
                
                if (isLast) {
                    html += `<li class="active" aria-current="page">${currentPage}</li>`;
                } else {
                    html += `<li><a href="/${parts.slice(0, index + 1).join('/')}">${name}</a></li>`;
                }
            });
            
            html += '</ol>';
            breadcrumb.innerHTML = html;
            
            // Insertar después del header
            const header = document.querySelector('header');
            if (header) {
                header.parentNode.insertBefore(breadcrumb, header.nextSibling);
            }
        }
    }
    
    // Agregar skeleton loading
    addSkeletonLoading() {
        // Identificar áreas que cargan datos dinámicamente
        const loadingAreas = [
            '.classes-grid',
            '.bookings-list',
            '.members-list',
            '.notifications-list',
            '.waitlists-list'
        ];
        
        loadingAreas.forEach(selector => {
            const element = document.querySelector(selector);
            if (element && element.children.length === 0) {
                // Agregar skeleton
                const skeleton = document.createElement('div');
                skeleton.className = 'skeleton-container';
                skeleton.innerHTML = `
                    <div class="skeleton skeleton-title"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text"></div>
                `;
                element.appendChild(skeleton);
                
                // Remover skeleton cuando se carguen datos
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.addedNodes.length > 0) {
                            skeleton.style.opacity = '0';
                            setTimeout(() => {
                                if (skeleton.parentNode) {
                                    skeleton.parentNode.removeChild(skeleton);
                                }
                            }, 300);
                            observer.disconnect();
                        }
                    });
                });
                
                observer.observe(element, { childList: true });
            }
        });
    }
    
    // Mejorar feedback visual
    enhanceVisualFeedback() {
        // Agregar tooltips
        document.querySelectorAll('[title]').forEach(element => {
            if (!element.hasAttribute('data-tooltip')) {
                element.setAttribute('data-tooltip', element.title);
                element.removeAttribute('title');
                
                element.addEventListener('mouseenter', (e) => {
                    const tooltip = document.createElement('div');
                    tooltip.className = 'tooltip';
                    tooltip.textContent = e.target.dataset.tooltip;
                    
                    const rect = e.target.getBoundingClientRect();
                    tooltip.style.position = 'fixed';
                    tooltip.style.top = `${rect.top - 40}px`;
                    tooltip.style.left = `${rect.left + (rect.width / 2)}px`;
                    tooltip.style.transform = 'translateX(-50%)';
                    
                    document.body.appendChild(tooltip);
                    
                    e.target._tooltip = tooltip;
                });
                
                element.addEventListener('mouseleave', (e) => {
                    if (e.target._tooltip) {
                        e.target._tooltip.remove();
                        delete e.target._tooltip;
                    }
                });
            }
        });
        
        // Agregar efectos hover a tarjetas
        document.querySelectorAll('.card, .class-card, .booking-card').forEach(card => {
            card.classList.add('hover-lift');
        });
        
        // Agregar efectos a botones
        document.querySelectorAll('.btn:not(.btn-ghost)').forEach(btn => {
            btn.classList.add('hover-scale');
        });
    }
    
    // Optimizar para móviles
    optimizeForMobile() {
        // Mejorar inputs para teclados virtuales
        document.querySelectorAll('input[type="tel"], input[type="number"]').forEach(input => {
            input.setAttribute('inputmode', 'numeric');
        });
        
        document.querySelectorAll('input[type="email"]').forEach(input => {
            input.setAttribute('inputmode', 'email');
        });
        
        // Agregar soporte para viewport height en móviles
        const setVH = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };
        
        setVH();
        window.addEventListener('resize', setVH);
        window.addEventListener('orientationchange', setVH);
        
        // Mejorar touch targets
        document.querySelectorAll('button, .btn, a.btn').forEach(btn => {
            const rect = btn.getBoundingClientRect();
            if (rect.width < 44 || rect.height < 44) {
                btn.style.minWidth = '44px';
                btn.style.minHeight = '44px';
                btn.style.padding = '12px 16px';
            }
        });
    }
    
    // Aplicar clases de animación
    applyAnimationClasses() {
        // Animaciones de entrada para elementos principales
        const elementsToAnimate = [
            'header',
            'main',
            'footer',
            '.hero-section',
            '.dashboard-section',
            '.booking-section'
        ];
        
        elementsToAnimate.forEach(selector => {
            document.querySelectorAll(selector).forEach((element, index) => {
                element.classList.add('animate', 'animate-fade-in-up');
                element.style.animationDelay = `${index * 100}ms`;
            });
        });
        
        // Animación staggered para grids
        document.querySelectorAll('.classes-grid, .bookings-grid, .members-grid').forEach(grid => {
            grid.classList.add('stagger-children');
        });
    }
    
    // Configurar event listeners
    setupEventListeners() {
        // Escuchar eventos de los sistemas
        document.addEventListener('theme:changed', (e) => {
        });
        
        document.addEventListener('waitlist:joined', (e) => {
        });
        
        // Configurar shortcuts de teclado
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + T para toggle de tema
            if ((e.ctrlKey || e.metaKey) && e.key === 't') {
                e.preventDefault();
                if (this.systems.theme) {
                    this.systems.theme.toggleTheme();
                }
            }
            
            // Ctrl/Cmd + / para buscar
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                const searchInput = document.querySelector('input[type="search"], .search-input');
                if (searchInput) {
                    searchInput.focus();
                }
            }
        });
        
        //// Continuación de fase6-integration.js

        // Mejorar scroll suave
        document.addEventListener('DOMContentLoaded', () => {
            // Scroll suave para enlaces internos
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    const targetId = this.getAttribute('href');
                    if (targetId === '#') return;
                    
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            });
            
            // Botón para ir arriba
            this.addBackToTopButton();
        });
        
        // Configurar Intersection Observer para animaciones al scroll
        this.setupScrollAnimations();
    }
    
    // Agregar botón para ir arriba
    addBackToTopButton() {
        const button = document.createElement('button');
        button.className = 'back-to-top';
        button.innerHTML = '<i class="fas fa-chevron-up"></i>';
        button.setAttribute('aria-label', 'Volver arriba');
        button.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background-color: var(--color-brand-primary);
            color: white;
            border: none;
            cursor: pointer;
            display: none;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
            box-shadow: var(--shadow-md);
            transition: all 0.3s var(--ease-smooth);
            z-index: 999;
        `;
        
        document.body.appendChild(button);
        
        // Mostrar/ocultar botón
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                button.style.display = 'flex';
                setTimeout(() => {
                    button.style.opacity = '1';
                    button.style.transform = 'scale(1)';
                }, 10);
            } else {
                button.style.opacity = '0';
                button.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    if (window.scrollY <= 300) {
                        button.style.display = 'none';
                    }
                }, 300);
            }
        });
        
        // Scroll suave al hacer click
        button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        // Efectos hover
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.1)';
            button.style.boxShadow = 'var(--shadow-lg)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
            button.style.boxShadow = 'var(--shadow-md)';
        });
    }
    
    // Configurar animaciones al scroll
    setupScrollAnimations() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    
                    // Animación específica según tipo de elemento
                    if (entry.target.classList.contains('stat-card')) {
                        entry.target.classList.add('animate-scale-in');
                    } else if (entry.target.classList.contains('feature-card')) {
                        entry.target.classList.add('animate-fade-in-up');
                    }
                }
            });
        }, observerOptions);
        
        // Observar elementos para animar
        document.querySelectorAll('.reveal-on-scroll, .stat-card, .feature-card').forEach(el => {
            observer.observe(el);
        });
    }
    
    // ==================== UTILIDADES ====================
    
    // Cargar script dinámicamente
    loadScript(src) {
        return new Promise((resolve, reject) => {
            // Verificar si ya está cargado
            const existingScript = document.querySelector(`script[src="${src}"]`);
            if (existingScript) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Error cargando script: ${src}`));
            
            document.head.appendChild(script);
        });
    }
    
    // Cargar CSS dinámicamente
    loadCSS(href) {
        return new Promise((resolve, reject) => {
            // Verificar si ya está cargado
            const existingLink = document.querySelector(`link[href="${href}"]`);
            if (existingLink) {
                resolve();
                return;
            }
            
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            
            link.onload = () => resolve();
            link.onerror = () => reject(new Error(`Error cargando CSS: ${href}`));
            
            document.head.appendChild(link);
        });
    }
    
    // Verificar si un script existe
    async scriptExists(src) {
        try {
            const response = await fetch(src, { method: 'HEAD' });
            return response.ok;
        } catch {
            return false;
        }
    }
    
    // Esperar por una condición
    waitForCondition(condition, timeout = 10000, interval = 100) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            const check = () => {
                if (condition()) {
                    resolve();
                } else if (Date.now() - startTime > timeout) {
                    reject(new Error('Timeout esperando condición'));
                } else {
                    setTimeout(check, interval);
                }
            };
            
            check();
        });
    }
    
    // Disparar eventos personalizados
    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, {
            detail: {
                ...detail,
                source: 'Fase6Integration',
                timestamp: new Date().toISOString()
            }
        });
        
        document.dispatchEvent(event);
    }
    
    // Obtener información del sistema
    getSystemInfo() {
        return {
            initialized: this.isInitialized,
            loadedSystems: Array.from(this.loadedSystems),
            systems: Object.keys(this.systems).filter(key => this.systems[key] !== null)
        };
    }
    
    // Debug del sistema
    debug() {
        console.group('🔧 Debug FASE 6 Integration');
        console.log('Estado:', this.getSystemInfo());
        
        if (this.systems.theme) {
        }
        
        if (this.systems.waitlist) {
        }
        
        console.groupEnd();
    }
}

// ==================== INICIALIZACIÓN ====================

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    
    // Crear instancia global
    window.barraboxFase6 = new Fase6Integration();
    
    // Exponer para debugging
    window.debugFase6 = () => {
        if (window.barraboxFase6) {
            window.barraboxFase6.debug();
        } else {
            console.log('FASE 6 Integration no está disponible');
        }
    };
    
    // Agregar estilos adicionales
    const additionalStyles = `
        /* Estilos para FASE 6 */
        .tooltip {
            position: fixed;
            background: var(--color-neutral-900);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: var(--border-radius-base);
            font-size: 0.875rem;
            z-index: 9999;
            pointer-events: none;
            white-space: nowrap;
            box-shadow: var(--shadow-lg);
            animation: fadeIn 0.2s var(--ease-out);
        }
        
        .tooltip::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border: 6px solid transparent;
            border-top-color: var(--color-neutral-900);
        }
        
        .breadcrumb {
            background: var(--color-neutral-50);
            padding: 1rem 2rem;
            border-bottom: 1px solid var(--color-border);
        }
        
        [data-theme="dark"] .breadcrumb {
            background: var(--color-neutral-800);
        }
        
        .breadcrumb ol {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            list-style: none;
            margin: 0;
            padding: 0;
        }
        
        .breadcrumb li {
            display: flex;
            align-items: center;
        }
        
        .breadcrumb li:not(:last-child)::after {
            content: '/';
            margin-left: 0.5rem;
            color: var(--color-text-disabled);
        }
        
        .breadcrumb a {
            color: var(--color-brand-primary);
            text-decoration: none;
        }
        
        .breadcrumb a:hover {
            text-decoration: underline;
        }
        
        .breadcrumb .active {
            color: var(--color-text-primary);
            font-weight: 600;
        }
        
        .skeleton-container {
            padding: 1rem;
            background: var(--color-surface);
            border-radius: var(--border-radius-lg);
            margin-bottom: 1rem;
        }
        
        .empty-state, .error-state {
            text-align: center;
            padding: 3rem 1rem;
            color: var(--color-text-secondary);
        }
        
        .empty-state i, .error-state i {
            font-size: 3rem;
            margin-bottom: 1rem;
            opacity: 0.5;
        }
        
        .waitlist-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--border-radius-lg);
            margin-bottom: 0.5rem;
            transition: all 0.3s var(--ease-smooth);
        }
        
        .waitlist-item:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
        }
        
        .waitlist-item.status-promotion {
            border-color: var(--color-brand-success);
            background: rgba(40, 167, 69, 0.05);
        }
        
        [data-theme="dark"] .waitlist-item.status-promotion {
            background: rgba(40, 167, 69, 0.1);
        }
        
        .waitlist-class {
            font-weight: 600;
            margin-bottom: 0.25rem;
        }
        
        .waitlist-details {
            display: flex;
            gap: 1rem;
            font-size: 0.875rem;
            color: var(--color-text-secondary);
        }
        
        .waitlist-actions {
            display: flex;
            gap: 0.5rem;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .waitlist-item {
                flex-direction: column;
                align-items: stretch;
                gap: 1rem;
            }
            
            .waitlist-details {
                flex-direction: column;
                gap: 0.25rem;
            }
            
            .waitlist-actions {
                justify-content: flex-end;
            }
            
            .breadcrumb {
                padding: 0.75rem 1rem;
                font-size: 0.875rem;
            }
            
            .breadcrumb ol {
                flex-wrap: wrap;
            }
        }
        
        /* Mejoras de accesibilidad */
        .focus-visible {
            outline: 2px solid var(--color-brand-primary);
            outline-offset: 2px;
        }
        
        /* Mejoras de rendimiento */
        .will-change {
            will-change: transform, opacity;
        }
    `;
    
    const style = document.createElement('style');
    style.textContent = additionalStyles;
    document.head.appendChild(style);
    
});

// ==================== POLYFILLS Y FALLBACKS ====================

// Polyfill para CustomEvent en IE
(function() {
    if (typeof window.CustomEvent === "function") return false;
    
    function CustomEvent(event, params) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    }
    
    CustomEvent.prototype = window.Event.prototype;
    window.CustomEvent = CustomEvent;
})();

// Polyfill para Object.entries
if (!Object.entries) {
    Object.entries = function(obj) {
        var ownProps = Object.keys(obj),
            i = ownProps.length,
            resArray = new Array(i);
        while (i--)
            resArray[i] = [ownProps[i], obj[ownProps[i]]];
        return resArray;
    };
}

// Polyfill para String.includes
if (!String.prototype.includes) {
    String.prototype.includes = function(search, start) {
        if (typeof start !== 'number') {
            start = 0;
        }
        
        if (start + search.length > this.length) {
            return false;
        } else {
            return this.indexOf(search, start) !== -1;
        }
    };
}

// ==================== EXPORTACIÓN PARA MÓDULOS ====================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Fase6Integration;
}
