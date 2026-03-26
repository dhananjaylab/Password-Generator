import os
import requests
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Import the decoupled logic
from logic import generate_password_logic, generate_passphrase_logic, generate_pronounceable_logic

load_dotenv()

app = FastAPI(title="Password Generator API")

# Allow CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_NINJA_KEY = os.getenv("API_NINJA")
API_NINJA_URL = "https://api.api-ninjas.com/v1/randomword"

@app.get("/api/password")
def generate_password(
    length: int = Query(14, ge=4, le=128),
    uppercase: bool = True,
    lowercase: bool = True,
    numbers: bool = True,
    symbols: bool = False
):
    """Generates a secure password based on criteria."""
    pwd = generate_password_logic(length, uppercase, lowercase, numbers, symbols)
    return {"password": pwd}

@app.get("/api/pronounceable")
def generate_pronounceable(
    length: int = Query(10, ge=4, le=64),
    capitalize: bool = False,
    include_number: bool = False
):
    """Generates a pronounceable (phonetic) password."""
    pwd = generate_pronounceable_logic(length, capitalize, include_number)
    return {"pronounceable": pwd}

@app.get("/api/passphrase")
def generate_passphrase(
    word_count: int = Query(5, ge=2, le=15),
    separator: str = Query("-"),
    include_number: bool = False,
    include_symbol: bool = False
):
    """Generates a secure passphrase of random words."""
    # The logic handles parallel API requests and offline fallback automatically
    passphrase = generate_passphrase_logic(word_count, separator, include_number, include_symbol, API_NINJA_KEY)
    return {"passphrase": passphrase}

@app.get("/api/test")
def test_api():
    """Tests connectivity to API Ninjas."""
    if not API_NINJA_KEY:
        raise HTTPException(status_code=400, detail="API_NINJA key not found. Add it to your .env file.")
        
    try:
        response = requests.get(API_NINJA_URL, headers={"X-Api-Key": API_NINJA_KEY}, timeout=5)
        if response.status_code == 200:
            return {"status": "success", "message": "API responded successfully."}
        else:
            raise HTTPException(status_code=response.status_code, detail=f"API returned status code {response.status_code}: {response.text[:120]}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not contact API: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
