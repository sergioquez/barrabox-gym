// Use Case Analyzer - Analiza automáticamente el proyecto Barrabox

class UseCaseAnalyzer {
    constructor() {
        this.useCases = [];
        this.dataModels = {};
        this.currentId = 100;
    }
    
    analyzeProject() {
        console.log('🔍 Analizando proyecto Barrabox Gym...');
        
        // 1. Analizar Autenticación
        this.analyzeAuthentication();
        
        // 2. Analizar Gestión de Reservas
        this.analyzeBookings();
        
        // 3. Analizar Administración
        this.analyzeAdministration();
        
        // 4. Analizar Notificaciones
        this.analyzeNotifications();
        
        // 5. Definir Modelos de Datos
        this.defineDataModels();
        
        console.log(`✅ Análisis completado: ${this.useCases.length} casos de uso identificados`);
        return this.useCases;
    }
    
    analyzeAuthentication() {
        this.addUseCase({
            id: 'UC-101',
            title: 'Login de Usuario',
            description: 'Usuario ingresa con email y password para acceder a su dashboard personal.',
            actor: 'Usuario registrado',
            priority: 'high',
            status: 'completed',
            steps: [
                'Usuario hace clic en "Iniciar Sesión"',
                'Ingresa email y password',
                'Sistema valida credenciales en localStorage',
                'Redirige a user-dashboard.html',
                'Muestra bienvenida personalizada'
            ],
            dataModel: 'user'
        });
        
        this.addUseCase({
            id: 'UC-102',
            title: 'Login de Administrador',
            description: 'Administrador ingresa con credenciales especiales para acceder al panel de control.',
            actor: 'Administrador',
            priority: 'high',
            status: 'completed',
            steps: [
                'Admin ingresa email: admin@barrabox.cl',
                'Cualquier password es aceptado (demo)',
                'Sistema detecta email admin',
                'Redirige a admin-dashboard.html',
                'Muestra panel de administración'
            ]
        });
        
        this.addUseCase({
            id: 'UC-103',
            title: 'Registro de Nuevo Usuario',
            description: 'Nuevo usuario crea una cuenta en el sistema.',
            actor: 'Usuario nuevo',
            priority: 'medium',
            status: 'planned',
            steps: [
                'Usuario hace clic en "Registrarse"',
                'Completa formulario (nombre, email, password)',
                'Sistema guarda en localStorage',
                'Redirige a user-dashboard.html',
                'Muestra tutorial de bienvenida'
            ],
            dataModel: 'user'
        });
    }
    
    analyzeBookings() {
        this.addUseCase({
            id: 'UC-201',
            title: 'Reservar Clase',
            description: 'Usuario reserva una clase disponible en el calendario.',
            actor: 'Usuario autenticado',
            priority: 'high',
            status: 'in-progress',
            steps: [
                'Usuario navega al calendario',
                'Selecciona clase disponible (verde)',
                'Hace clic en "Reservar"',
                'Modal muestra detalles y confirma',
                'Sistema guarda reserva en localStorage',
                'Actualiza cupos disponibles',
                'Muestra notificación de éxito'
            ],
            dataModel: 'booking'
        });
        
        this.addUseCase({
            id: 'UC-202',
            title: 'Cancelar Reserva',
            description: 'Usuario cancela una reserva existente.',
            actor: 'Usuario autenticado',
            priority: 'high',
            status: 'in-progress',
            steps: [
                'Usuario va a "Tus próximas reservas"',
                'Selecciona reserva a cancelar',
                'Hace clic en "Cancelar"',
                'Modal de confirmación aparece',
                'Usuario confirma cancelación',
                'Sistema actualiza estado a "cancelled"',
                'Libera cupo en la clase',
                'Muestra notificación de éxito'
            ],
            dataModel: 'booking'
        });
        
        this.addUseCase({
            id: 'UC-203',
            title: 'Ver Historial de Reservas',
            description: 'Usuario consulta su historial de reservas pasadas.',
            actor: 'Usuario autenticado',
            priority: 'medium',
            status: 'planned',
            steps: [
                'Usuario hace clic en "Historial"',
                'Sistema carga reservas del usuario',
                'Muestra lista con fechas y estados',
                'Usuario puede filtrar por mes/tipo',
                'Puede ver detalles de cada reserva'
            ]
        });
        
        this.addUseCase({
            id: 'UC-204',
            title: 'Unirse a Waitlist',
            description: 'Usuario se une a la lista de espera de una clase llena.',
            actor: 'Usuario autenticado',
            priority: 'medium',
            status: 'planned',
            steps: [
                'Usuario ve clase marcada como "Lleno"',
                'Botón cambia a "Unirse a Waitlist"',
                'Hace clic y confirma',
                'Sistema lo agrega a waitlist',
                'Notifica si hay cupo disponible'
            ],
            dataModel: 'waitlist'
        });
    }
    
    analyzeAdministration() {
        this.addUseCase({
            id: 'UC-301',
            title: 'Gestionar Clases',
            description: 'Administrador crea, edita o elimina clases del sistema.',
            actor: 'Administrador',
            priority: 'high',
            status: 'in-progress',
            steps: [
                'Admin navega a "Clases" en panel',
                'Hace clic en "Nueva Clase"',
                'Completa formulario (tipo, horario, coach, capacidad)',
                'Guarda en localStorage',
                'Clase aparece en calendario'
            ],
            dataModel: 'class'
        });
        
        this.addUseCase({
            id: 'UC-302',
            title: 'Gestionar Miembros',
            description: 'Administrador gestiona usuarios del sistema (ver, editar, suspender).',
            actor: 'Administrador',
            priority: 'medium',
            status: 'planned',
            steps: [
                'Admin navega a "Miembros"',
                'Busca usuario por nombre/email',
                'Hace clic en "Editar"',
                'Modifica datos (plan, estado)',
                'Guarda cambios'
            ]
        });
        
        this.addUseCase({
            id: 'UC-303',
            title: 'Ver Reportes',
            description: 'Administrador consulta reportes de ocupación, ingresos y tendencias.',
            actor: 'Administrador',
            priority: 'medium',
            status: 'planned',
            steps: [
                'Admin navega a "Reportes"',
                'Selecciona período (semana/mes)',
                'Selecciona tipo (ocupación/ingresos)',
                'Sistema genera gráficos',
                'Opción de exportar a PDF/CSV'
            ]
        });
        
        this.addUseCase({
            id: 'UC-304',
            title: 'Gestionar Waitlists',
            description: 'Administrador gestiona listas de espera cuando hay cancelaciones.',
            actor: 'Administrador',
            priority: 'medium',
            status: 'planned',
            steps: [
                'Sistema detecta cupo liberado',
                'Notifica al admin',
                'Admin revisa waitlist',
                'Promueve siguiente en lista',
                'Notifica al usuario automáticamente'
            ]
        });
    }
    
    analyzeNotifications() {
        this.addUseCase({
            id: 'UC-401',
            title: 'Notificación de Confirmación',
            description: 'Usuario recibe notificación cuando su reserva es confirmada.',
            actor: 'Sistema',
            priority: 'high',
            status: 'in-progress',
            steps: [
                'Usuario completa reserva',
                'Sistema guarda en localStorage',
                'Muestra notificación en pantalla',
                'Guarda notificación en historial',
                'Usuario puede ver detalles'
            ]
        });
        
        this.addUseCase({
            id: 'UC-402',
            title: 'Recordatorio de Clase',
            description: 'Usuario recibe recordatorio antes de su clase programada.',
            actor: 'Sistema',
            priority: 'medium',
            status: 'planned',
            steps: [
                'Sistema verifica reservas del día',
                '2 horas antes, muestra recordatorio',
                'Incluye detalles (hora, coach, sala)',
                'Opción de cancelar desde notificación'
            ]
        });
        
        this.addUseCase({
            id: 'UC-403',
            title: 'Notificación de Waitlist',
            description: 'Usuario es notificado cuando hay cupo disponible desde waitlist.',
            actor: 'Sistema',
            priority: 'medium',
            status: 'planned',
            steps: [
                'Usuario en waitlist, cupo liberado',
                'Sistema verifica posición en lista',
                'Envía notificación al primero',
                'Tiene 1 hora para confirmar',
                'Si no confirma, pasa al siguiente'
            ]
        });
    }
    
    defineDataModels() {
        this.dataModels = {
            user: {
                id: 'user_001',
                email: 'usuario@ejemplo.com',
                name: 'Juan Pérez',
                role: 'member',
                plan: 'premium',
                joinDate: '2026-03-15',
                status: 'active'
            },
            booking: {
                id: 'book_001',
                userId: 'user_001',
                classId: 'class_001',
                date: '2026-04-16',
                time: '19:00',
                status: 'confirmed',
                createdAt: '2026-04-13T22:30:00Z'
            },
            class: {
                id: 'class_001',
                type: 'crossfit',
                title: 'Morning WOD',
                coach: 'Carlos',
                day: 'monday',
                time: '06:00',
                duration: 60,
                capacity: 15,
                booked: 8
            },
            waitlist: {
                id: 'wait_001',
                userId: 'user_001',
                classId: 'class_001',
                position: 3,
                joinedAt: '2026-04-13T22:30:00Z'
            },
            notification: {
                id: 'notif_001',
                userId: 'user_001',
                type: 'booking_confirmation',
                title: 'Reserva Confirmada',
                message: 'Tu clase de CrossFit ha sido confirmada',
                read: false,
                createdAt: '2026-04-13T22:30:00Z'
            }
        };
    }
    
    addUseCase(useCase) {
        this.useCases.push({
            ...useCase,
            category: this.getCategoryFromId(useCase.id)
        });
    }
    
    getCategoryFromId(id) {
        const prefix = id.split('-')[0];
        switch(prefix) {
            case 'UC-1': return 'Autenticación';
            case 'UC-2': return 'Reservas';
            case 'UC-3': return 'Administración';
            case 'UC-4': return 'Notificaciones';
            default: return 'General';
        }
    }
    
    generateHTML() {
        let html = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Casos de Uso - Barrabox Gym</title>
                <style>
                    /* Estilos básicos */
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
                    .container { max-width: 1200px; margin: 0 auto; }
                    .header { background: #2D3047; color: white; padding: 2rem; border-radius: 10px; margin-bottom: 2rem; }
                    .section { background: white; padding: 2rem; border-radius: 10px; margin-bottom: 2rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .use-case { border-left: 4px solid #FF6B35; padding: 1rem; margin-bottom: 1rem; background: #f8f9fa; }
                    .use-case-id { font-weight: bold; color: #2D3047; }
                    .priority-high { color: #dc3545; }
                    .priority-medium { color: #ffc107; }
                    .priority-low { color: #28a745; }
                    .status-completed { color: #28a745; }
                    .status-in-progress { color: #17a2b8; }
                    .status-planned { color: #6c757d; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Barrabox Gym - Casos de Uso</h1>
                        <p>Generado automáticamente por UseCaseAnalyzer.js</p>
                        <p>Total: ${this.useCases.length} casos identificados</p>
                    </div>
        `;
        
        // Agrupar por categoría
        const categories = {};
        this.useCases.forEach(uc => {
            if (!categories[uc.category]) {
                categories[uc.category] = [];
            }
            categories[uc.category].push(uc);
        });
        
        // Generar HTML por categoría
        for (const [category, useCases] of Object.entries(categories)) {
            html += `
                <div class="section">
                    <h2>${category}</h2>
            `;
            
            useCases.forEach(uc => {
                html += `
                    <div class="use-case">
                        <div class="use-case-id">${uc.id} - ${uc.title}</div>
                        <div>Prioridad: <span class="priority-${uc.priority}">${uc.priority}</span></div>
                        <div>Estado: <span class="status-${uc.status.replace('-', '')}">${uc.status}</span></div>
                        <p>${uc.description}</p>
                        <strong>Pasos:</strong>
                        <ol>
                            ${uc.steps.map(step => `<li>${step}</li>`).join('')}
                        </ol>
                    </div>
                `;
            });
            
            html += `</div>`;
        }
        
        // Modelos de datos
        html += `
            <div class="section">
                <h2>Modelos de Datos (JSON)</h2>
                <pre><code>${JSON.stringify(this.dataModels, null, 2)}</code></pre>
            </div>
        `;
        
        html += `
                </div>
            </body>
            </html>
        `;
        
        return html;
    }
    
    generateJSON() {
        return {
            project: 'Barrabox Gym',
            analysisDate: new Date().toISOString(),
            totalUseCases: this.useCases.length,
            useCases: this.useCases,
            dataModels: this.dataModels,
            summary: {
                authentication: this.useCases.filter(uc => uc.category === 'Autenticación').length,
                bookings: this.useCases.filter(uc => uc.category === 'Reservas').length,
                administration: this.useCases.filter(uc => uc.category === 'Administración').length,
                notifications: this.useCases.filter(uc => uc.category === 'Notificaciones').length
            }
        };
    }
}

// Ejecutar análisis si se carga en navegador
if (typeof window !== 'undefined') {
    window.UseCaseAnalyzer = UseCaseAnalyzer;
    
    document.addEventListener('DOMContentLoaded', function() {
        const analyzer = new UseCaseAnalyzer();
        const results = analyzer.analyzeProject();
        
        console.log('📊 Resultados del análisis:', analyzer.generateJSON());
        
        // Crear botón para mostrar resultados
        const showResultsBtn = document.createElement('button');
        showResultsBtn.textContent = 'Ver Análisis de Casos de Uso';
        showResultsBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 24px;
            background: #FF6B35;
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `;
        
        showResultsBtn.onclick = function() {
            const html = analyzer.generateHTML();
            const win = window.open('', '_blank');
            win.document.write(html);
            win.document.close();
        };
        
        document.body.appendChild(showResultsBtn);
    });
}

// Exportar para Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UseCaseAnalyzer;
}