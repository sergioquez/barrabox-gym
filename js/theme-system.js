// Theme System - Sistema de temas y animaciones para Barrabox Gym

class ThemeSystem {
    constructor() {
        console.log('🎨 Theme System inicializando...');
        
        // Configuración
        this.config = {
            themeKey: 'barrabox-theme',
            animationDuration: 300,
            enableAnimations: true,
            respectSystemPreference: true
        };
        
        // Estado
        this.currentTheme = 'light';
        this.isInitialized = false;
        this.animationsEnabled = true;
        
        // Inicializar
        this.initialize();
    }
    
    // Inicializar sistema
    initialize() {
        try {
            console.log('🎯 Configurando sistema de temas...');
            
            // Detectar preferencia del sistema
            this.detectSystemPreference();
            
            // Cargar tema guardado
            this.loadSavedTheme();
            
            // Aplicar tema inicial
            this.applyTheme(this.currentTheme);
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Configurar animaciones
            this.setupAnimations();
            
            // Marcar como inicializado
            this.isInitialized = true;
            
            console.log(`✅ Theme System inicializado - Tema: ${this.currentTheme}`);
            
            // Disparar evento
            this.dispatchEvent('theme:initialized', {
                theme: this.currentTheme,
                animationsEnabled: this.animationsEnabled
            });
            
        } catch (error) {
            console.error('❌ Error inicializando Theme System:', error);
        }
    }
    
    // Detectar preferencia del sistema
    detectSystemPreference() {
        if (this.config.respectSystemPreference && window.matchMedia) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
            
            if (prefersDark.matches) {
                this.systemPreference = 'dark';
            } else {
                this.systemPreference = 'light';
            }
            
            console.log(`🌗 Preferencia del sistema: ${this.systemPreference}`);
            
            // Escuchar cambios en la preferencia del sistema
            prefersDark.addEventListener('change', (e) => {
                this.systemPreference = e.matches ? 'dark' : 'light';
                console.log(`🌗 Preferencia del sistema cambiada a: ${this.systemPreference}`);
                
                // Si no hay tema guardado, seguir la preferencia del sistema
                if (!localStorage.getItem(this.config.themeKey)) {
                    this.applyTheme(this.systemPreference);
                }
            });
        }
    }
    
    // Cargar tema guardado
    loadSavedTheme() {
        const savedTheme = localStorage.getItem(this.config.themeKey);
        
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
            this.currentTheme = savedTheme;
            console.log(`💾 Tema cargado desde storage: ${this.currentTheme}`);
        } else if (this.systemPreference) {
            this.currentTheme = this.systemPreference;
            console.log(`🌗 Usando preferencia del sistema: ${this.currentTheme}`);
        } else {
            this.currentTheme = 'light';
            console.log(`☀️ Usando tema por defecto: ${this.currentTheme}`);
        }
    }
    
    // Aplicar tema
    applyTheme(theme) {
        if (theme !== 'light' && theme !== 'dark') {
            console.error('❌ Tema no válido:', theme);
            return;
        }
        
        // Guardar tema anterior para transición
        const previousTheme = this.currentTheme;
        this.currentTheme = theme;
        
        // Aplicar al documento
        document.documentElement.setAttribute('data-theme', theme);
        
        // Guardar en localStorage
        localStorage.setItem(this.config.themeKey, theme);
        
        // Actualizar meta tag para theme-color
        this.updateThemeColorMeta(theme);
        
        console.log(`🎨 Tema aplicado: ${previousTheme} → ${theme}`);
        
        // Disparar evento
        this.dispatchEvent('theme:changed', {
            previousTheme,
            currentTheme: theme
        });
    }
    
    // Cambiar tema (toggle)
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        return newTheme;
    }
    
    // Actualizar meta tag para theme-color
    updateThemeColorMeta(theme) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        
        // Colores para cada tema
        const themeColors = {
            light: '#ffffff',
            dark: '#121212'
        };
        
        metaThemeColor.content = themeColors[theme] || themeColors.light;
    }
    
    // Configurar animaciones
    setupAnimations() {
        if (!this.config.enableAnimations) {
            this.animationsEnabled = false;
            document.documentElement.classList.add('no-animations');
            console.log('⏸️ Animaciones deshabilitadas');
            return;
        }
        
        // Verificar preferencia de reducción de movimiento
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.animationsEnabled = false;
            document.documentElement.classList.add('reduce-motion');
            console.log('♿ Reducción de movimiento activada');
        } else {
            this.animationsEnabled = true;
            document.documentElement.classList.add('animations-enabled');
            console.log('✨ Animaciones habilitadas');
        }
        
        // Escuchar cambios en la preferencia de reducción de movimiento
        window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
            this.animationsEnabled = !e.matches;
            
            if (e.matches) {
                document.documentElement.classList.add('reduce-motion');
                document.documentElement.classList.remove('animations-enabled');
                console.log('♿ Reducción de movimiento activada');
            } else {
                document.documentElement.classList.remove('reduce-motion');
                document.documentElement.classList.add('animations-enabled');
                console.log('✨ Animaciones habilitadas');
            }
            
            this.dispatchEvent('animations:changed', {
                enabled: this.animationsEnabled
            });
        });
    }
    
    // Configurar event listeners
    setupEventListeners() {
        // Botón de toggle de tema
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-theme-toggle]')) {
                e.preventDefault();
                const newTheme = this.toggleTheme();
                
                // Actualizar texto del botón si existe
                const button = e.target.closest('[data-theme-toggle]');
                const icon = button.querySelector('[data-theme-icon]');
                
                if (icon) {
                    icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
                }
                
                // Actualizar texto del botón si existe
                const text = button.querySelector('[data-theme-text]');
                if (text) {
                    text.textContent = newTheme === 'dark' ? 'Modo Claro' : 'Modo Oscuro';
                }
            }
        });
        
        // Botón para habilitar/deshabilitar animaciones
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-animations-toggle]')) {
                e.preventDefault();
                this.toggleAnimations();
            }
        });
    }
    
    // Habilitar/deshabilitar animaciones
    toggleAnimations() {
        this.animationsEnabled = !this.animationsEnabled;
        
        if (this.animationsEnabled) {
            document.documentElement.classList.remove('no-animations');
            document.documentElement.classList.add('animations-enabled');
            console.log('✨ Animaciones habilitadas manualmente');
        } else {
            document.documentElement.classList.add('no-animations');
            document.documentElement.classList.remove('animations-enabled');
            console.log('⏸️ Animaciones deshabilitadas manualmente');
        }
        
        this.dispatchEvent('animations:toggled', {
            enabled: this.animationsEnabled
        });
        
        return this.animationsEnabled;
    }
    
    // Crear botón de toggle de tema
    createThemeToggleButton(options = {}) {
        const defaults = {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000,
            size: 'medium',
            showText: true,
            animation: true
        };
        
        const config = { ...defaults, ...options };
        
        const button = document.createElement('button');
        button.className = 'theme-toggle-btn';
        button.setAttribute('data-theme-toggle', '');
        button.setAttribute('aria-label', `Cambiar a modo ${this.currentTheme === 'light' ? 'oscuro' : 'claro'}`);
        button.setAttribute('title', `Cambiar a modo ${this.currentTheme === 'light' ? 'oscuro' : 'claro'}`);
        
        // Estilos inline
        Object.assign(button.style, {
            position: config.position,
            bottom: config.bottom,
            right: config.right,
            zIndex: config.zIndex,
            width: config.size === 'large' ? '56px' : config.size === 'small' ? '40px' : '48px',
            height: config.size === 'large' ? '56px' : config.size === 'small' ? '40px' : '48px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: 'var(--color-brand-primary)',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: config.size === 'large' ? '1.5rem' : config.size === 'small' ? '1rem' : '1.25rem',
            boxShadow: 'var(--shadow-md)',
            transition: 'all 0.3s var(--ease-smooth)'
        });
        
        // Icono
        const icon = document.createElement('i');
        icon.className = this.currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        icon.setAttribute('data-theme-icon', '');
        button.appendChild(icon);
        
        // Texto (opcional)
        if (config.showText) {
            const text = document.createElement('span');
            text.className = 'theme-toggle-text';
            text.setAttribute('data-theme-text', '');
            text.textContent = this.currentTheme === 'light' ? 'Modo Oscuro' : 'Modo Claro';
            text.style.cssText = `
                position: absolute;
                right: calc(100% + 10px);
                white-space: nowrap;
                background: var(--color-surface);
                color: var(--color-text-primary);
                padding: 0.5rem 1rem;
                border-radius: var(--border-radius-lg);
                font-size: 0.875rem;
                font-weight: 600;
                opacity: 0;
                transform: translateX(10px);
                transition: all 0.3s var(--ease-smooth);
                pointer-events: none;
                box-shadow: var(--shadow-sm);
                border: 1px solid var(--color-border);
            `;
            button.appendChild(text);
            
            // Mostrar/ocultar texto al hover
            button.addEventListener('mouseenter', () => {
                text.style.opacity = '1';
                text.style.transform = 'translateX(0)';
            });
            
            button.addEventListener('mouseleave', () => {
                text.style.opacity = '0';
                text.style.transform = 'translateX(10px)';
            });
        }
        
        // Efecto hover
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.1)';
            button.style.boxShadow = 'var(--shadow-lg)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
            button.style.boxShadow = 'var(--shadow-md)';
        });
        
        // Efecto click
        button.addEventListener('click', () => {
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 150);
        });
        
        // Agregar al documento
        document.body.appendChild(button);
        
        console.log('🎛️ Botón de toggle de tema creado');
        
        return button;
    }
    
    // Crear botón de toggle de animaciones
    createAnimationsToggleButton(options = {}) {
        const defaults = {
            position: 'fixed',
            bottom: '80px',
            right: '20px',
            zIndex: 1000,
            size: 'medium'
        };
        
        const config = { ...defaults, ...options };
        
        const button = document.createElement('button');
        button.className = 'animations-toggle-btn';
        button.setAttribute('data-animations-toggle', '');
        button.setAttribute('aria-label', this.animationsEnabled ? 'Deshabilitar animaciones' : 'Habilitar animaciones');
        button.setAttribute('title', this.animationsEnabled ? 'Deshabilitar animaciones' : 'Habilitar animaciones');
        
        // Estilos inline
        Object.assign(button.style, {
            position: config.position,
            bottom: config.bottom,
            right: config.right,
            zIndex: config.zIndex,
            width: config.size === 'large' ? '56px' : config.size === 'small' ? '40px' : '48px',
            height: config.size === 'large' ? '56px' : config.size === 'small' ? '40px' : '48px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: 'var(--color-brand-secondary)',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: config.size === 'large' ? '1.5rem' : config.size === 'small' ? '1rem' : '1.25rem',
            boxShadow: 'var(--shadow-md)',
            transition: 'all 0.3s var(--ease-smooth)'
        });
        
        // Icono
        const icon = document.createElement('i');
        icon.className = this.animationsEnabled ? 'fas fa-play' : 'fas fa-pause';
        button.appendChild(icon);
        
        // Efectos hover/click similares al botón de tema
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.1)';
            button.style.boxShadow = 'var(--shadow-lg)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
            button.style.boxShadow = 'var(--shadow-md)';
        });
        
        button.addEventListener('click', () => {
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 150);
            
            // Actualizar icono después del toggle
            setTimeout(() => {
                icon.className = this.animationsEnabled ? 'fas fa-play' : 'fas fa-pause';
                button.setAttribute('aria-label', this.animationsEnabled ? 'Deshabilitar animaciones' : 'Habilitar animaciones');
                button.setAttribute('title', this.animationsEnabled ? 'Deshabilitar animaciones' : 'Habilitar animaciones');
            }, 300);
        });
        
        // Agregar al documento
        document.body.appendChild(button);
        
        console.log('🎬 Botón de toggle de animaciones creado');
        
        return button;
    }
    
    // Aplicar animación de entrada a elemento
    animateIn(element, animation = 'fadeIn', duration = 300) {
        if (!this.animationsEnabled || !element) return;
        
        element.style.animation = `${animation} ${duration}ms var(--ease-smooth)`;
        element.style.opacity = '1';
        
        return new Promise(resolve => {
            setTimeout(() => {
                element.style.animation = '';
                resolve();
            }, duration);
        });
    }
    
    // Aplicar animación de salida a elemento
    animateOut(element, animation = 'fadeOut', duration = 300) {
        if (!this.animationsEnabled || !element) return;
        
        element.style.animation = `${animation} ${duration}ms var(--ease-smooth)`;
        element.style.opacity = '0';
        
        return new Promise(resolve => {
            setTimeout(() => {
                element.style.animation = '';
                resolve();
            }, duration);
        });
    }
    
    // Crear skeleton loading
    createSkeleton(type = 'text', options = {}) {
        const defaults = {
            width: '100%',
            height: '1rem',
            borderRadius: 'var(--border-radius-base)'
        };
        
        const config = { ...defaults, ...options };
        
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton';
        
        Object.assign(skeleton.style, {
            width: config.width,
            height: config.height,
            borderRadius: config.borderRadius,
            backgroundColor: 'var(--color-neutral-200)',
            position: 'relative',
            overflow: 'hidden'
        });
        
        // Efecto de shimmer
        if (this.animationsEnabled) {
            const shimmer = document.createElement('div');
            shimmer.style.cssText = `
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
                animation: shimmer 1.5s infinite;
            `;
            skeleton.appendChild(shimmer);
        }
        
        // Tipos predefinidos
        switch (type) {
            case 'card':
                skeleton.style.height = '200px';
                skeleton.style