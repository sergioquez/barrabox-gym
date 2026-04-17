import time
from playwright.sync_api import Page, expect

def clear_session_and_go(page: Page, app_url: str):
    """Limpia el local storage y fuerza una recarga para empezar limpio."""
    page.goto(app_url)
    page.evaluate("window.localStorage.clear()")
    page.reload()
    page.wait_for_load_state("networkidle")

def test_user_uc0_login_error_prevention(page: Page, app_url: str):
    """Prueba la prevención de errores en Login (UX)."""
    clear_session_and_go(page, app_url)
    
    # Abrir modal mediante un selector accesible
    page.get_by_role("link", name="Iniciar Sesión").click()
    page.locator("#loginModal").wait_for(state="visible")
    
    # Try logging in with wrong password
    page.get_by_label("Email").first.fill("usuario@barrabox.cl")
    page.locator("#userPassword").fill("wrongpass")
    
    # Click but it should show an error
    page.get_by_role("button", name="Ingresar", exact=True).click()
    
    # UX Check: Aparece un toast con el error y no navega
    toast_error = page.locator(".notification-error")
    expect(toast_error).to_contain_text("incorrecta", ignore_case=True)

def test_user_uc1_empty_state_and_booking(page: Page, app_url: str):
    """UC-U1: Empty State y Reserva de Clase."""
    clear_session_and_go(page, app_url)
    
    # Login Exitoso
    page.get_by_role("link", name="Iniciar Sesión").click()
    page.locator("#loginModal").wait_for(state="visible")
    page.get_by_label("Email").first.fill("usuario@barrabox.cl")
    page.locator("#userPassword").fill("demopass")
    page.get_by_role("button", name="Ingresar", exact=True).click()
    
    # Esperar Dashboard
    page.wait_for_url("**/user-dashboard.html")
    
    # --- VALIDACIÓN DE EMPTY STATE (UX) ---
    # Limpiamos las reservas via API del cliente para garantizar el empty state para el test
    page.evaluate("""
        const data = JSON.parse(localStorage.getItem('barrabox_gym_data'));
        if (data) {
            data.bookings = [];
            localStorage.setItem('barrabox_gym_data', JSON.stringify(data));
        }
    """)
    page.reload()
    page.wait_for_load_state("networkidle")
    
    # Debería mostrar un Empty State claro que invita al usuario a reservar
    empty_state = page.locator(".empty-bookings")
    expect(empty_state).to_be_visible()
    expect(empty_state.get_by_role("heading", name="Sin reservas próximas")).to_be_visible()
    
    # --- FLUJO DE RESERVA ---
    # Buscar el primer botón "Reservar" disponible
    book_btn = page.locator(".class-slot.available").get_by_role("button", name="Reservar").first
    
    if not book_btn.is_visible():
        page.get_by_title("Siguiente semana").click()
        time.sleep(0.5)
        
    expect(book_btn).to_be_visible()
    book_btn.click()
    
    # Validar que el Modal sea claro
    modal = page.locator("#bookingModal")
    expect(modal).to_have_class("booking-modal active")
    expect(modal.locator("h4")).to_be_visible() # El título de la clase
    
    # Confirmar
    page.get_by_role("button", name="Confirmar Reserva").click()
    
    # --- VALIDACIÓN DE RETROALIMENTACIÓN (UX) ---
    # Toast
    expect(page.locator(".toast.success")).to_be_visible()
    
    # El Empty state debe haber desparecido!
    expect(empty_state).not_to_be_visible()
    
    # En su lugar aparece una tarjeta con el rol de la clase
    expect(page.locator("#upcomingBookings .booking-card").first).to_be_visible()
    expect(page.locator("#statUpcoming")).to_have_text("1")

def test_user_uc2_cancel_booking(page: Page, app_url: str):
    """UC-U2: Flujo de Cancelación y retorno al estado vacío."""
    # Para ser asertivos, corremos la reserva primero
    test_user_uc1_empty_state_and_booking(page, app_url)
    
    cancel_btn = page.locator("#upcomingBookings").get_by_role("button", name="Cancelar reserva").first
    expect(cancel_btn).to_be_visible()
    
    # Cuando cancelemos:
    page.once("dialog", lambda dialog: dialog.accept())
    cancel_btn.click()
    
    expect(page.locator(".toast.info")).to_contain_text("cancelada")
    
    # El status bajó a 0
    expect(page.locator("#statUpcoming")).to_have_text("0")
    
    # El Empty State volvió a aparecer, conteniendo al usuario en un loop de empatía
    expect(page.locator(".empty-bookings")).to_be_visible()

def test_user_uc3_read_notifications(page: Page, app_url: str):
    """UC-U3: Notificaciones coherentes."""
    # Como cancelamos recién, debería haber notificaciones
    test_user_uc2_cancel_booking(page, app_url)
    
    notifications_btn = page.locator("#notifToggle")
    badge = page.locator(".notif-badge")
    expect(badge).to_be_visible()
    
    notifications_btn.click()
    
    # El panel de notif existe
    panel = page.locator("#notifPanel")
    expect(panel).to_have_class("notif-panel open")
    
    # Validar que existe el texto de la alerta que acabamos de realizar
    expect(panel).to_contain_text("cancelada", ignore_case=True)
    
    # Marcar todo como leido
    page.get_by_role("button", name="Marcar todas como leídas").click()
    
    # Feedback visual para el usuario: la burbuja roja se va
    expect(badge).not_to_be_visible()

def test_user_uc4_filter_classes(page: Page, app_url: str):
    """UC-U4: Mejora de UX - Filtrado del calendario por tipo de clase."""
    clear_session_and_go(page, app_url)
    
    # Login Exitoso
    page.get_by_role("link", name="Iniciar Sesión").click()
    page.locator("#loginModal").wait_for(state="visible")
    page.get_by_label("Email").first.fill("usuario@barrabox.cl")
    page.locator("#userPassword").fill("demopass")
    page.get_by_role("button", name="Ingresar", exact=True).click()
    
    # Esperar Dashboard
    page.wait_for_url("**/user-dashboard.html")
    
    # Seleccionar filtro "CrossFit"
    filter_dropdown = page.locator("#userClassFilter")
    expect(filter_dropdown).to_be_visible()
    
    filter_dropdown.select_option(value="crossfit")
    time.sleep(0.5) # Wait for render
    
    # Después de filtrar por crossfit, no debería haber clases de gap visibles
    expect(page.locator(".class-type.gap").first).not_to_be_visible()
    # Las clases visibles deben ser de tipo crossfit
    expect(page.locator(".class-type.crossfit").first).to_be_visible()
