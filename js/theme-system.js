// Theme System Simple - Versión simplificada para Barrabox Gym

class ThemeSystem {
    constructor() {
        console.log('🎨 Theme System inicializando...');
        
        this.config = {
            themeKey: 'barrabox-theme',
            animationDuration: 300
        };
        
        this.currentTheme = 'light';
        this.isInitialized = false;
        
        this.initialize();
    }
    
    initialize() {
        try {
            console.log('🎯 Configurando sistema de temas...');
            
            // Cargar tema guardado
            this.loadSavedTheme();
            
            // Aplicar tema inicial
            this.applyTheme(this.currentTheme);
            
            // Configurar event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            
            console.log(`✅ Theme System inicializado - Tema: ${this.currentTheme}`);
            
            // Crear botón de toggle
            this.createThemeToggleButton();
            
        } catch (error) {
            console.error('❌ Error inicializando Theme System:', error);
        }
    }
    
    loadSavedTheme() {
        const savedTheme = localStorage.getItem(this.config.themeKey);
        
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
            this.currentTheme = savedTheme;
            console.log(`💾 Tema cargado desde storage: ${this.currentTheme}`);
        } else {
            this.currentTheme = 'light';
            console.log(`☀️ Usando tema por defecto: ${this.currentTheme}`);
        }
    }
    
    applyTheme(theme) {
        if (theme !== 'light' && theme !== 'dark') {
            console.error('❌ Tema no válido:', theme);
            return;
        }
        
        const previousTheme = this.currentTheme;
        this.currentTheme = theme;
        
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(this.config.themeKey, theme);
        
        console.log(`🎨 Tema aplicado: ${previousTheme} → ${theme}`);
    }
    
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        return newTheme;
    }
    
    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-theme-toggle]')) {
                e.preventDefault();
                this.toggleTheme();
                
                const button = e.target.closest('[data-theme-toggle]');
                const icon = button.querySelector('[data-theme-icon]');
                
                if (icon) {
                    icon.className = this.currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
                }
            }
        });
    }
    
    createThemeToggleButton() {
        const button = document.createElement('button');
        button.className = 'theme-toggle-btn';
        button.setAttribute('data-theme-toggle', '');
        button.setAttribute('aria-label', `Cambiar a modo ${this.currentTheme === 'light' ? 'oscuro' : 'claro'}`);
        button.setAttribute('title', `Cambiar a modo ${this.currentTheme === 'light' ? 'oscuro' : 'claro'}`);
        
        Object.assign(button.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000,
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: 'var(--color-brand-primary)',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            boxShadow: 'var(--shadow-md)',
            transition: 'all 0.3s var(--ease-smooth)'
        });
        
        const icon = document.createElement('i');
        icon.className = this.currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        icon.setAttribute('data-theme-icon', '');
        button.appendChild(icon);
        
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.1)';
            button.style.boxShadow = 'var(--shadow-lg)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
            button.style.boxShadow = 'var(--shadow-md)';
        });
        
        document.body.appendChild(button);
        
        console.log('🎛️ Botón de toggle de tema creado');
        
        return button;
    }
}

// Crear instancia global
if (typeof window !== 'undefined') {
    window.barraboxTheme = new ThemeSystem();
    console.log('🎨 Theme System cargado como window.barraboxTheme');
}