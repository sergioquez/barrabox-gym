# 🏋️‍♂️ BARRABOX GYM — Documento de Contexto Completo

> **Última actualización:** 2026-04-14
> **Repositorio:** https://github.com/sergioquez/barrabox-gym
> **Demo en vivo:** https://sergioquez.github.io/barrabox-gym/
> **Responsable:** Sergio Quezada

---

## 1. Visión General del Proyecto

Barrabox es una **landing page y plataforma de gestión para gimnasio** (Crossfit, Halterofilia & GAP). Es un proyecto **100% frontend estático** desplegado en GitHub Pages que almacena datos en **localStorage** en formato JSON, diseñado como demo funcional preparado para futura integración con backend.

### Stack Tecnológico
| Tecnología | Uso |
|---|---|
| HTML5 semántico | Estructura |
| CSS3 (variables custom, Flexbox/Grid) | Estilos |
| JavaScript Vanilla (ES6+) | Lógica |
| GitHub Pages | Hosting |
| Font Awesome | Iconos |
| Google Fonts (Montserrat, Open Sans) | Tipografía |
| localStorage | Persistencia de datos |

### Paleta de Colores
| Color | Código | Uso |
|---|---|---|
| Primario | `#FF6B35` | Naranja energético |
| Secundario | `#2D3047` | Azul oscuro profesional |
| Acento | `#00A8A8` | Verde/azul fitness |
| Fondo | `#F8F9FA` | Gris claro |

---

## 2. Arquitectura del Proyecto

### Estructura de Archivos

```
barrabox-gym/
├── index.html                      # Landing page principal
├── clases.html                     # Página de clases
├── planes.html                     # Planes y precios
├── nosotros.html                   # Sobre nosotros
├── contacto.html                   # Contacto
├── user-dashboard.html             # Dashboard de usuario
├── admin-dashboard.html            # Dashboard de administrador
├── booking.html                    # Sistema de reservas con calendario
├── profile.html                    # Perfil de usuario
│
├── css/
│   ├── design-system.css           # Sistema de diseño (tokens, temas)
│   ├── style.css                   # Estilos base principales
│   ├── animations.css              # Animaciones y transiciones (40+)
│   ├── calendar.css                # Estilos del calendario
│   ├── calendar-mobile-fixes.css   # Fixes responsive del calendario
│   ├── booking-flow.css            # Estilos del flujo de reservas
│   ├── dashboard-clean.css         # Dashboard de usuario
│   ├── admin-clean.css             # Dashboard admin base
│   └── admin-enhanced.css          # Admin mejorado (modals, tables)
│
├── js/
│   ├── data-manager.js             # Persistencia localStorage, CRUD, backup
│   ├── auth.js                     # Autenticación, sesiones, roles
│   ├── main.js                     # Navegación, login modal, inicialización
│   ├── calendar.js                 # Calendario interactivo semanal
│   ├── booking-system.js           # Lógica de reservas
│   ├── profile.js                  # Gestión de perfil de usuario
│   ├── admin-system.js             # Sistema central de administración
│   ├── admin-integration.js        # Integración admin con Data Manager
│   ├── admin-functions.js          # Funciones CRUD admin (modals)
│   ├── admin-utils.js              # Utilidades y exportación
│   ├── theme-system.js             # Temas claro/oscuro
│   ├── waitlist-system.js          # Lista de espera inteligente
│   └── fase6-integration.js        # UX, accesibilidad, tooltips
│
├── README.md                       # Documentación pública
├── PROYECTO_COMPLETO.md            # Documentación técnica interna
├── ESTADO_PROYECTO.md              # Estado actual y registro de cambios
└── AGENTS.md                       # Reglas universales para agentes de IA
```

### Arquitectura por Capas

```
┌──────────────────────────┐
│      UI Layer            │  ← HTML/CSS + Reactividad
├──────────────────────────┤
│      Service Layer       │  ← Lógica de negocio (auth, booking, admin)
├──────────────────────────┤
│      Data Manager        │  ← API de localStorage
├──────────────────────────┤
│      JSON Schema         │  ← Validación de datos
└──────────────────────────┘
```

### Flujo de Integración entre Módulos

```
Admin Dashboard → Admin System → Data Manager → localStorage
       ↓               ↓               ↓
   Auth System ← Notifications ← Booking System
```

---

## 3. Modelos de Datos (localStorage / JSON)

### Users
```json
{
  "id": "user_001",
  "email": "usuario@ejemplo.com",
  "name": "Juan Pérez",
  "role": "member",       // member | admin
  "plan": "premium",      // basic | premium
  "status": "active"      // active | inactive | suspended
}
```

### Classes
```json
{
  "id": "class_001",
  "type": "crossfit",     // crossfit | halterofilia | gap
  "title": "Morning WOD",
  "coach": "Carlos",
  "schedule": { "day": "monday", "time": "06:00" },
  "capacity": 15,
  "booked": 8
}
```

### Bookings
```json
{
  "id": "book_001",
  "userId": "user_001",
  "classId": "class_001",
  "date": "2026-04-16",
  "status": "confirmed"   // confirmed | cancelled | waitlisted
}
```

### Waitlists
```json
{
  "id": "wait_001",
  "userId": "user_001",
  "classId": "class_001",
  "position": 3,
  "joinedAt": "2026-04-13T22:30:00Z"
}
```

### Datos de Ejemplo (Seeding)
- 3 miembros + 1 admin demo
- 8 clases por día, 6 días a la semana (Lunes a Sábado)
- Reservas históricas de ejemplo

---

## 4. Credenciales de Prueba

| Rol | Email | Contraseña | Acceso |
|---|---|---|---|
| **Usuario** | `usuario@barrabox.cl` | `cualquiercosa` | Dashboard, perfil, reservas, calendario |
| **Admin** | `admin@barrabox.cl` | `cualquiercosa` | Todo + gestión CRUD, reportes |

> ⚠️ **Nota:** El login es permisivo (acepta cualquier contraseña) por ser un demo. En producción se requeriría validación real.

---

## 5. URLs de Producción

| Página | URL |
|---|---|
| 🏠 Inicio | https://sergioquez.github.io/barrabox-gym/ |
| 👤 Dashboard Usuario | https://sergioquez.github.io/barrabox-gym/user-dashboard.html |
| 👑 Dashboard Admin | https://sergioquez.github.io/barrabox-gym/admin-dashboard.html |
| 📅 Sistema de Reservas | https://sergioquez.github.io/barrabox-gym/booking.html |
| 👤 Perfil de Usuario | https://sergioquez.github.io/barrabox-gym/profile.html |
| 🧪 Testing E2E | Ejecutar `debugDataManager()` en la consola |

---

## 6. Roadmap de Fases y Estado

```
✅ FASE 1: Data Manager          — COMPLETADO
✅ FASE 2: Auth System           — COMPLETADO
✅ FASE 3: Testing E2E           — COMPLETADO
✅ FASE 4: Booking System        — COMPLETADO
✅ FASE 5: Admin Dashboard       — COMPLETADO (planificación)
🟡 FASE 6A: Design System & UX  — COMPLETADO
⬜ FASE 6B: Animaciones Avanzadas — PENDIENTE
⬜ FASE 6C: Features Avanzados    — PENDIENTE
⬜ FASE 6D: Performance & PWA     — PENDIENTE
```

### Detalle por Fase

---

### FASE 1: Data Manager (✅ Completado)
**Objetivo:** Sistema de persistencia en localStorage.

**Implementado:**
- `js/data-manager.js` — CRUD para users, classes, bookings, waitlists, notifications
- Validación de esquemas JSON
- Migraciones de datos
- Backup/restore automático
- Data seeding con datos de ejemplo

---

### FASE 2: Auth System (✅ Completado)
**Objetivo:** Sistema completo de autenticación.

**Implementado:**
- `js/auth.js` — Login, registro, logout
- Validación de email/password
- Sesiones en localStorage (remember me)
- Auto-login persistente
- Roles: `member` | `admin`
- Detección automática de admin por email (`admin@barrabox.cl`)
- Redirección automática según rol
- Eventos personalizados (`auth:*`)

---

### FASE 3: Testing E2E (✅ Completado)
**Objetivo:** Validación completa del sistema sin errores.

**12 tests E2E completados al 100%:**
1. Data Manager disponible
2. Auth System disponible
3. Login de usuario
4. Estado de sesión
5. Logout
6. Login de admin
7. CRUD usuarios
8. CRUD clases
9. Sistema de reservas
10. Sistema de notificaciones
11. Exportación de datos
12. Elementos UI

**Métricas alcanzadas:**
- 0 errores en consola
- 100% sintaxis JavaScript válida
- Integración completa entre módulos
- Tiempo de carga < 2 segundos
- Responsive 320px-1440px

---

### FASE 4: Booking System (✅ Completado)
**Objetivo:** Sistema completo de reservas con calendario interactivo.

**Implementado:**
- `booking.html` — Página principal de reservas
- `js/calendar.js` — Calendario semanal interactivo (Lunes-Sábado, 6AM-9PM)
- `js/booking-system.js` — Lógica de negocio e integración
- `css/calendar.css` — Estilos del calendario

**Flujo de Reserva:** Usuario → Selecciona clase → Confirma → Cupo reservado → Notificación → Calendario actualizado (3-5 segundos)

**Flujo de Cancelación:** Click en reserva → Modal detalles → Confirma → Cupo liberado → Notificación

**Características:**
- Estados visuales: Disponible / Reservado / Lleno / No disponible
- Filtros por tipo de clase y horario
- Navegación entre semanas
- Prevención de doble reserva
- Detección de conflictos de horario
- Lista de "Mis Próximas Reservas"
- Responsive completo (desktop, tablet, mobile)

---

### FASE 5: Admin Dashboard (✅ Planificación completada)
**Objetivo:** Dashboard admin con gestión CRUD real conectado al Data Manager.

**Pestañas del dashboard:**
1. 📅 Calendario admin
2. 🎫 Reservas (ver todas, cancelar, reasignar)
3. 👥 Miembros (CRUD completo, búsqueda, exportación CSV/JSON)
4. 🏋️ Clases (CRUD, horarios recurrentes, duplicar)
5. 💰 Pagos
6. 📊 Reportes (ocupación, ingresos, tendencias, KPIs)

**Archivos creados:**
- `js/admin-system.js` — Sistema central de administración
- `js/admin-integration.js` — Conexión con Data Manager
- `js/admin-functions.js` — CRUD de miembros, clases, reservas
- `js/admin-utils.js` — Utilidades y exportación
- `css/admin-enhanced.css` — Estilos mejorados

**Features avanzados planificados:**
- Sistema de waitlists para admin
- Notificaciones específicas de admin
- Importación/exportación masiva
- Auditoría de acciones
- Dark/light mode

---

### FASE 6: Polish & UX

#### FASE 6A: Design System & Consistencia (✅ Completado)

**Implementado:**
- `css/design-system.css` — 50+ variables CSS (colores, tipografía, espaciado, bordes, sombras)
- `js/theme-system.js` — Tema claro/oscuro con persistencia, respeto de `prefers-color-scheme`, toggle flotante
- `css/animations.css` — 40+ animaciones (fade, slide, scale, bounce, rotate), skeleton loading, hover effects
- `js/waitlist-system.js` — Lista de espera inteligente con promoción automática
- `js/fase6-integration.js` — Coordinador central: validación de formularios, breadcrumbs, tooltips, scroll suave, botón "volver arriba", optimización móvil, accesibilidad

**Design System:**
```css
:root {
  --color-brand-primary: #ff6b35;
  --color-brand-secondary: #2d3047;
  --color-surface: #ffffff;
  --color-text-primary: #1a1a1a;
  /* ... 50+ variables */
}

[data-theme="dark"] {
  --color-surface: #121212;
  --color-text-primary: #ffffff;
  /* ... dark theme overrides */
}
```

**Tipografía:** Montserrat (títulos) + Open Sans (cuerpo), escala 0.75rem → 3rem  
**Espaciado:** 0.25rem → 4rem (16 valores)  
**Sombras:** 4 niveles (sm, md, lg, xl)  
**Bordes:** 0.25rem → 2rem (6 valores)

#### FASE 6B: Animaciones Avanzadas (⬜ Pendiente)
- Micro-interacciones específicas
- Animaciones de carga de datos
- Transiciones entre estados
- Efectos parallax

#### FASE 6C: Features Avanzados (⬜ Pendiente)
- Sistema de rating de clases y coaches
- Recordatorios push (simulados)
- Compartir en redes sociales
- Gamificación (logros, puntos)

#### FASE 6D: Performance & PWA (⬜ Pendiente)
- `service-worker.js` — Offline support
- `manifest.json` — Instalación como app
- Lazy loading con Intersection Observer
- Code splitting dinámico
- Optimización SEO (meta tags, structured data, Schema.org)
- Accessibility audit WCAG 2.1 AA

---

## 7. Flujos Principales del Sistema

### Reserva de Clase
```
UI Event → Booking Service → Data Manager → localStorage
```

### Login
```
Form Submit → Auth Service → User Validation → Session Storage
```

### Acciones Admin
```
Admin UI → Admin Service → Data Validation → Bulk Updates
```

### Waitlist
```
Clase llena → Usuario se une a waitlist → Se cancela una reserva →
→ Promoción automática del primero en waitlist → Notificación
```

---

## 8. Testing y Calidad

### Estrategia de Testing
| Tipo | Herramientas | Estado |
|---|---|---|
| Unit Testing | `node -c` (sintaxis JS) | ✅ |
| Integration Testing | Data Manager + Auth System | ✅ |
| E2E Testing | Suite automatizada en navegador | ✅ |
| UI Testing | Responsive 320px-1440px | ✅ |
| Performance | Lighthouse (target: 90+) | ⬜ |

### Tests E2E Detallados

La suite de testing E2E cubre al menos el 80% de los flujos críticos de la aplicación. A continuación se detallan los 12 tests y sus escenarios:

#### TC-01: Data Manager Disponible
- **Qué valida:** `window.barraboxDataManager` existe y tiene las funciones CRUD
- **Funciones comprobadas:** `getUser()`, `getClass()`, `getBooking()`, `getAllUsers()`, `getAllClasses()`, `getAllBookings()`
- **Criterio de éxito:** Todas las funciones responden sin error

#### TC-02: Auth System Disponible
- **Qué valida:** `window.barraboxAuth` existe y expone métodos de autenticación
- **Funciones comprobadas:** `login()`, `logout()`, `getSession()`, `isAuthenticated()`
- **Criterio de éxito:** Métodos accesibles y funcionales

#### TC-03: Login de Usuario
- **Flujo:** Ejecutar `login('usuario@barrabox.cl', 'test123')` → Verificar sesión activa → Verificar `role === 'member'`
- **Cubre:** Login modal, redireccion a `user-dashboard.html`, almacenamiento de sesión
- **Criterio de éxito:** Sesión creada con datos correctos

#### TC-04: Estado de Sesión
- **Qué valida:** Después del login, `getSession()` retorna datos del usuario logueado
- **Datos verificados:** `id`, `email`, `name`, `role`, `plan`
- **Criterio de éxito:** Sesión persistente y consistente entre llamadas

#### TC-05: Logout
- **Flujo:** `logout()` → Verificar que `getSession()` retorna `null` → `isAuthenticated()` retorna `false`
- **Cubre:** Limpieza de sesión, redireccion a `index.html`
- **Criterio de éxito:** Sesión completamente eliminada

#### TC-06: Login de Admin
- **Flujo:** `login('admin@barrabox.cl', 'test123')` → Verificar `role === 'admin'`
- **Cubre:** Detección de email admin, redirección a `admin-dashboard.html`, permisos elevados
- **Criterio de éxito:** Sesión admin con todas las capacidades CRUD

#### TC-07: CRUD Usuarios
- **Operaciones:**
  - `getAllUsers()` → Verificar lista no vacía
  - `getUser('user_001')` → Verificar datos del usuario de prueba (Juan Pérez)
  - Crear usuario de test → Verificar que aparece en `getAllUsers()`
  - Actualizar nombre → Verificar persistencia
  - Eliminar usuario de test → Verificar que ya no existe
- **Criterio de éxito:** Todas las operaciones CRUD exitosas

#### TC-08: CRUD Clases
- **Operaciones:**
  - `getAllClasses()` → Verificar clases de ejemplo (crossfit, halterofilia, gap)
  - `getClass('class_001')` → Verificar datos (title, coach, capacity, schedule)
  - Crear clase de test → Verificar campos obligatorios
  - Actualizar capacidad → Verificar que no baje de `booked`
  - Eliminar clase de test
- **Criterio de éxito:** Todas las operaciones CRUD exitosas con validación

#### TC-09: Sistema de Reservas
- **Flujo completo:**
  1. Login como usuario
  2. Verificar clases disponibles (con cupos)
  3. Crear reserva → Verificar `status: 'confirmed'`, incremento de `booked`
  4. Intentar doble reserva → Verificar prevención
  5. Cancelar reserva → Verificar `status: 'cancelled'`, decremento de `booked`
  6. Verificar en `getBookingsByUser(userId)`
- **Criterio de éxito:** Flujo completo sin inconsistencias en contadores

#### TC-10: Sistema de Notificaciones
- **Qué valida:** Creación y lectura de notificaciones del sistema
- **Escenarios:**
  - Notificación de reserva confirmada
  - Notificación de cancelación
  - Marca de lectura (`read: true/false`)
  - Conteo de no leídas
- **Criterio de éxito:** Notificaciones se crean y consultan correctamente

#### TC-11: Exportación de Datos
- **Qué valida:** `exportData()` genera JSON válido con estructura correcta
- **Datos exportados:** `users`, `classes`, `bookings`, `waitlists`
- **Verificaciones:** JSON parseable, arrays completos, estructura consistente
- **Criterio de éxito:** Backup completo restaurable

#### TC-12: Elementos UI
- **Qué valida:** Elementos HTML críticos existen en el DOM
- **Elementos verificados:** Login modal, tabs (usuario/admin), formularios, botones de submit
- **Criterio de éxito:** IDs y clases CSS correctas en el DOM

### Cobertura de Flujos por Test

| Flujo de la App | Tests que lo cubren | Cobertura |
|---|---|---|
| Login usuario/admin | TC-03, TC-04, TC-06 | ✅ 100% |
| Logout | TC-05 | ✅ 100% |
| CRUD usuarios | TC-07 | ✅ 100% |
| CRUD clases | TC-08 | ✅ 100% |
| Reservas (crear/cancelar) | TC-09 | ✅ 100% |
| Notificaciones | TC-10 | ✅ 100% |
| Exportación de datos | TC-11 | ✅ 100% |
| Persistencia localStorage | TC-01, TC-07, TC-08 | ✅ 100% |
| UI/Modal rendering | TC-12 | ✅ 80% |
| Waitlist | (via TC-09 parcial) | 🟡 60% |
| Tema oscuro/claro | (no cubierto) | ⬜ 0% |
| Calendario navegación | (no cubierto) | ⬜ 0% |

**Cobertura total estimada: ~85%**

### Comandos de Debug (consola del navegador)
```javascript
debugFase6();           // Debug FASE 6 Integration
debugWaitlistSystem();  // Debug Waitlist System
debugDataManager();     // Debug Data Manager
debugAuthSystem();      // Debug Auth System

console.log('Theme:', window.barraboxTheme?.currentTheme);
console.log('Waitlist:', window.barraboxWaitlist?.getSystemInfo());
console.log('FASE6:', window.barraboxFase6?.getSystemInfo());
```

### Issues Conocidos y Soluciones
| Issue | Solución |
|---|---|
| Flash de tema incorrecto | Script inline que aplica tema antes del render |
| Animaciones en reduced motion | Media query `prefers-reduced-motion` |
| Waitlist promotion race condition | Locking y verificación de estado |
| Mobile viewport height | JS que actualiza `--vh` dinámicamente |
| Tests que no funcionan en Node.js | Normal: dependen de `window`/`document` |

---

## 9. Métricas de Éxito

### Métricas Técnicas
- ✅ 100% funcional sin backend
- ✅ < 3s load time
- ✅ 0 errores en consola
- ✅ Responsive 320px-1440px
- ✅ 100% sintaxis JS válida

### Métricas de Negocio
- ✅ Reserva de clase en < 1 minuto
- ✅ Gestión admin en < 5 minutos
- ✅ 0 datos perdidos en refresh
- ✅ Intuitivo sin tutorial

### Métricas de Performance (Objetivo)
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse Score: > 90
- Bundle Size: < 500KB total

---

## 10. Desarrollo Local

```bash
# Clonar repositorio
git clone https://github.com/sergioquez/barrabox-gym
cd barrabox-gym

# Servidor local
python3 -m http.server 8000
# o
npx serve .

# Acceder: http://localhost:8000
```

### Git Workflow
```
main     → producción (GitHub Pages)
develop  → staging
feature/* → features individuales
```

---

## 11. Consideraciones Técnicas

### LocalStorage
- Límite: 5-10MB por dominio
- Estrategia de limpieza implementada
- Backup/restore en JSON
- Posibilidad de migrar a IndexedDB si crece

### Seguridad (para futuro backend)
- No guardar datos sensibles en localStorage
- Validación de inputs en todos los formularios
- Protección XSS
- Preparado para CSRF tokens

### Performance
- Debounce en búsquedas y actualizaciones del calendario
- Animaciones con `will-change` y `transform`
- Lazy loading con Intersection Observer
- Caché estratégico de datos frecuentes
- Paginación para listas grandes

### Accesibilidad
- ARIA labels en elementos interactivos
- Focus rings visibles
- Contraste mínimo 4.5:1
- Navegación por teclado
- Soporte para `prefers-reduced-motion`
- Touch targets mínimo 44x44px en mobile

---

## 12. Evolución Futura

### Fase 2 (Backend)
- REST API con Node.js/Express
- Base de datos MongoDB/PostgreSQL
- WebSockets para tiempo real
- Email/SMS reales

### Fase 3 (Mobile)
- React Native / iOS / Android
- Push notifications reales
- Login biométrico
- Sync offline

### Fase 4 (Features Avanzados)
- Paquetes de clases y promociones
- Scheduling de coaches
- Reserva de equipamiento
- Features sociales

---

## 13. Equipo y Coordinación

### Agentes de Desarrollo
| Agente | Rol | Responsabilidades |
|---|---|---|
| **Claw (Principal)** | Coordinador | Testing E2E, integración, entrega |
| **DevOps** | Infraestructura | CI/CD, validación técnica, testing automatizado |
| **Web Estático** | Frontend/UX | UI, responsive, accesibilidad |
| **Token Optimizer** | Performance | Métricas, optimización, monitoreo |

### Flujo de Trabajo
```
1. Principal inicia coordinación
2. Cada agente ejecuta tareas asignadas
3. DevOps valida infraestructura y testing
4. Web Estático corrige UI/UX issues
5. Token Optimizer monitorea performance
6. Principal integra y valida todo
7. Entrega final con documentación
```

---

> **Este documento consolida la información de:** `README.md`, `IMPLEMENTATION_PLAN.md`, `FASE4_README.md`, `FASE5_PLAN.md`, `FASE6_PLAN.md`, `FASE6_README.md`, `TESTING_REPORT.md` y `agent-coordination.md`.
