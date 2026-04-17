import pytest
import subprocess
import time

PORT = 80
BASE_URL = f"http://localhost:{PORT}"

@pytest.fixture(scope="session", autouse=True)
def start_local_server():
    """Skipped background server - Assuming User is running python serve.py on port 80"""
    print(f"\nUsando el servidor local del usuario en el puerto {PORT}...")
    yield BASE_URL

@pytest.fixture
def app_url():
    return BASE_URL
