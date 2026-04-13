// Barrabox - Main JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.innerHTML = navMenu.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
    }
    
    // Login Modal
    const loginBtn = document.querySelector('.btn-login');
    const loginModal = document.getElementById('loginModal');
    const closeModal = document.querySelector('.close-modal');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Open Modal
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            loginModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    }
    
    // Close Modal
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            loginModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Function to close modal properly
    function closeLoginModal() {
        console.log('Cerrando modal de login');
        loginModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        // Force remove any inline styles that might block
        loginModal.removeAttribute('style');
    }
    
    // Tab Switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId + 'Tab') {
                    content.classList.add('active');
                }
            });
        });
    });
    
    // User Login Form
    const userLoginForm = document.getElementById('userLoginForm');
    if (userLoginForm) {
        userLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Formulario usuario enviado');
            const email = document.getElementById('userEmail').value;
            const password = document.getElementById('userPassword').value;
            
            // Simulate login - In production this would be an API call
            simulateUserLogin(email, password);
            return false;
        });
    }
    
    // Admin Login Form
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Formulario admin enviado');
            const email = document.getElementById('adminEmail').value;
            const password = document.getElementById('adminPassword').value;
            
            // Simulate admin login
            simulateAdminLogin(email, password);
            return false;
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#login') return; // Skip login as it's handled by modal
            
            e.preventDefault();
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    hamburger.innerHTML = '<i class="fas fa-bars"></i>';
                }
            }
        });
    });
    
    // Demo data for simulation
    const demoUsers = [
        { email: 'cliente@barrabox.cl', name: 'Juan Pérez', plan: 'Premium', classes: 8 },
        { email: 'atleta@barrabox.cl', name: 'María González', plan: 'Competidor', classes: 12 }
    ];
    
    const demoAdmin = {
        email: 'admin@barrabox.cl',
        name: 'Administrador Barrabox'
    };
    
    // Simulate User Login
    function simulateUserLogin(email, password) {
        // Show loading state
        const submitBtn = userLoginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Ingresando...';
        submitBtn.disabled = true;
        
        // Simulate API delay
        setTimeout(() => {
            // For demo purposes, any email/password works
            const user = demoUsers.find(u => u.email === email) || {
                name: email.split('@')[0],
                plan: 'Básico',
                classes: 4
            };
            
            // Close modal
            closeLoginModal();
            
            // Show welcome message
            showNotification(`¡Bienvenido ${user.name}! Redirigiendo al dashboard...`, 'success');
            
            // Redirect to user dashboard immediately
            console.log('Login exitoso, redirigiendo a dashboard...');
            setTimeout(() => {
                console.log('Redirigiendo a user-dashboard.html');
                window.location.href = 'user-dashboard.html';
            }, 500);
            
            // Reset form
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            userLoginForm.reset();
        }, 1000);
    }
    
    // Simulate Admin Login
    function simulateAdminLogin(email, password) {
        const submitBtn = adminLoginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Ingresando...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            // Close modal
            closeLoginModal();
            
            // Show admin message
            showNotification(`Panel de Administración activo. Redirigiendo...`, 'admin');
            
            // Redirect to ADMIN dashboard (not user dashboard)
            console.log('Login admin exitoso, redirigiendo a ADMIN dashboard...');
            setTimeout(() => {
                console.log('Redirigiendo a admin-dashboard.html');
                window.location.href = 'admin-dashboard.html';
            }, 500);
            
            // Reset form
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            adminLoginForm.reset();
        }, 1000);
    }
    
    // Notification System
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;
        
        // Add styles if not already present
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 1rem 1.5rem;
                    border-radius: 8px;
                    color: white;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    min-width: 300px;
                    max-width: 500px;
                    z-index: 3000;
                    animation: slideIn 0.3s ease;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .notification-success { background-color: #28a745; }
                .notification-admin { background-color: #2D3047; }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                }
                .notification-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 0 0.5rem;
                }
            `;
            document.head.appendChild(styles);
        }
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
        
        // Close button
        notification.querySelector('.notification-close').addEventListener('click', function() {
            notification.remove();
        });
    }
    
    function getNotificationIcon(type) {
        switch(type) {
            case 'success': return 'fa-check-circle';
            case 'admin': return 'fa-user-shield';
            default: return 'fa-info-circle';
        }
    }
    
    // Add slideOut animation
    const slideOutStyle = document.createElement('style');
    slideOutStyle.textContent = `
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(slideOutStyle);
    
    // Demo: Auto-open login modal after 3 seconds on first visit
    if (!sessionStorage.getItem('barraboxVisited')) {
        setTimeout(() => {
            if (loginBtn && !loginModal.style.display || loginModal.style.display === 'none') {
                loginBtn.click();
            }
        }, 3000);
        sessionStorage.setItem('barraboxVisited', 'true');
    }
    
    // Console welcome message
    console.log('%c🏋️‍♂️ Barrabox - Crossfit, Halterofilia & GAP', 'color: #FF6B35; font-size: 16px; font-weight: bold;');
    console.log('%cDemo interactivo - Iteración 1: Landing Page & Login Simulation', 'color: #2D3047;');
    console.log('Próximas iteraciones: Dashboard Admin/Usuario, Calendario, Sistema de Pagos');
});