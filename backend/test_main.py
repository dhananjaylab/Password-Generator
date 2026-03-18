from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the Password Generator API"}

def test_test_api():
    response = client.get("/api/test")
    assert response.status_code == 200
    assert response.json() == {"status": "success", "message": "API is working correctly"}

def test_generate_password():
    response = client.get("/api/password?length=16&uppercase=true&lowercase=true&numbers=true&symbols=true")
    assert response.status_code == 200
    data = response.json()
    assert "password" in data
    assert len(data["password"]) == 16

def test_generate_password_invalid_length():
    response = client.get("/api/password?length=4")
    assert response.status_code == 400
    assert response.json() == {"detail": "Password length must be between 8 and 64"}

def test_generate_password_no_types():
    response = client.get("/api/password?length=16&uppercase=false&lowercase=false&numbers=false&symbols=false")
    assert response.status_code == 400
    assert response.json() == {"detail": "At least one character type must be selected"}

def test_generate_passphrase():
    response = client.get("/api/passphrase?word_count=4&separator=-&include_number=false&include_symbol=false")
    assert response.status_code == 200
    data = response.json()
    assert "passphrase" in data
    assert len(data["passphrase"].split("-")) == 4

def test_generate_passphrase_invalid_word_count():
    response = client.get("/api/passphrase?word_count=2")
    assert response.status_code == 400
    assert response.json() == {"detail": "Word count must be between 3 and 10"}

def test_generate_pronounceable():
    response = client.get("/api/pronounceable?length=10&capitalize=true&include_number=true")
    assert response.status_code == 200
    data = response.json()
    assert "pronounceable" in data
    assert len(data["pronounceable"]) == 11 # 10 chars + 1 number
    assert data["pronounceable"][0].isupper()
    assert data["pronounceable"][-1].isdigit()

def test_generate_pronounceable_invalid_length():
    response = client.get("/api/pronounceable?length=3")
    assert response.status_code == 400
    assert response.json() == {"detail": "Length must be between 4 and 24"}
