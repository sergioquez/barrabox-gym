import pytest
import time
from playwright.sync_api import Page, expect

# Configuración del servidor de prueba
PORT = 8080
BASE_URL = f"http://localhost:{PORT}"

def test_user_dashboard_flow(page: Page, app_url: str):
    """Prueba el flujo de login del miembro y validación de su dashboard."""
    # Navegación y limpieza inicial
    page.goto(BASE_URL)
    page.evaluate("window.localStorage.clear()")
    page.reload()
    page.wait_for_load_state("networkidle")
    
    # 1. Abrir modal
    page.wait_for_selector(".btn-login", state="visible")
    page.click(".btn-login")
    page.wait_for_selector("#loginModal", state="visible")
    time.sleep(0.5)  # Esperar que termine la animación
    
    # 2. Login de Usuario (Pestaña por defecto)
    page.fill("#userEmail", "usuario@barrabox.cl")
    page.fill("#userPassword", "demopass")
    page.click("#userLoginBtn")
    
    # 3. Verificaciones automáticas (Redirección esperada)
    page.wait_for_url(f"**/user-dashboard.html**", timeout=10000)
    expect(page).to_have_url(f"{BASE_URL}/user-dashboard.html")
    
    # 4. Validar contenido del Dashboard
    expect(page.locator(".stat-card").first).to_be_visible(timeout=10000)
    
    # 5. Salir
    page.once("dialog", lambda dialog: dialog.accept()) # Acepta el window.confirm
    page.click("#logoutBtn")
    page.wait_for_url(f"**/index.html**", timeout=10000)
    expect(page).to_have_url(f"{BASE_URL}/index.html")

def test_admin_dashboard_flow(page: Page):
    """Prueba el flujo de login de administrador y validación de su panel."""
    page.goto(BASE_URL)
    page.evaluate("window.localStorage.clear()")
    page.reload()
    page.wait_for_load_state("networkidle")
    
    # 1. Abrir modal
    page.wait_for_selector(".btn-login", state="visible")
    page.click(".btn-login")
    page.wait_for_selector("#loginModal", state="visible")
    time.sleep(0.5)
    
    # 2. Cambiar a pestaña administrador
    page.click("button.tab-btn[data-tab='admin']")
    page.wait_for_selector("#adminTab", state="visible")
    
    # 3. Login de Admin
    page.fill("#adminEmail", "admin@barrabox.cl")
    page.fill("#adminPassword", "adminpass")
    page.click("#adminLoginBtn")
    
    # 4. Verificaciones automáticas
    page.wait_for_url(f"**/admin-dashboard.html**", timeout=10000)
    expect(page).to_have_url(f"{BASE_URL}/admin-dashboard.html")
    
    # 5. Validar contenido del Dashboard
    expect(page.locator(".adm-tabs").first).to_be_visible(timeout=10000)
    
    # 6. Salir
    page.once("dialog", lambda dialog: dialog.accept()) # Acepta el window.confirm
    page.click("#logoutBtn")
    page.wait_for_url(f"**/index.html**", timeout=10000)
    expect(page).to_have_url(f"{BASE_URL}/index.html")
