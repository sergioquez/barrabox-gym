import pytest
import subprocess
import time

PORT = 8080
BASE_URL = f"http://localhost:{PORT}"

@pytest.fixture(scope="session", autouse=True)
def start_local_server():
    """Inicia el servidor HTTP de Python en background antes de toda la suite."""
    print(f"\nIniciando servidor local en el puerto {PORT}...")
    server_process = subprocess.Popen(
        ["python", "serve.py"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    time.sleep(2) # Dar tiempo para que el servidor inicie
    yield BASE_URL
    print("\nDeteniendo servidor local...")
    server_process.terminate()
    server_process.wait()

@pytest.fixture
def app_url():
    return BASE_URL
