import os
import secrets
import string
import requests
import concurrent.futures
import urllib.request

API_NINJA_URL = "https://api.api-ninjas.com/v1/randomword"
WORDLIST_PATH = os.path.join(os.path.dirname(__file__), "eff_large_wordlist.txt")

_local_words = []

def load_local_words():
    """Loads the EFF large wordlist into memory. Downloads it if it doesn't exist."""
    global _local_words
    if not _local_words:
        if not os.path.exists(WORDLIST_PATH):
            try:
                print("Downloading EFF wordlist...")
                urllib.request.urlretrieve("https://www.eff.org/files/2016/07/18/eff_large_wordlist.txt", WORDLIST_PATH)
            except Exception as e:
                print(f"Failed to download wordlist: {e}")
        
        try:
            with open(WORDLIST_PATH, "r", encoding="utf-8") as f:
                for line in f:
                    parts = line.strip().split()
                    # EFF list format is usually "11111 abacus"
                    if len(parts) >= 2:
                        _local_words.append(parts[1])
                    elif len(parts) == 1:
                        _local_words.append(parts[0])
        except Exception as e:
            print(f"Error loading local wordlist: {e}")
            # Fallback tiny list just in case file system fails
            _local_words = ["apple", "banana", "cherry", "mango", "kiwi", "lemon", "peach", "grape"]
            
    return _local_words

def generate_password_logic(length: int, uppercase: bool, lowercase: bool, numbers: bool, symbols: bool) -> str:
    """Core logic for generating a secure password."""
    pools = []
    if uppercase: pools.append(string.ascii_uppercase)
    if lowercase: pools.append(string.ascii_lowercase)
    if numbers: pools.append(string.digits)
    if symbols: pools.append(string.punctuation)

    if not pools:
        pools.append(string.ascii_lowercase)

    all_chars = "".join(pools)
    
    pwd_chars = []
    # Ensure at least one character from each selected pool
    for p in pools:
        pwd_chars.append(secrets.choice(p))
    
    # Fill the rest of the password length
    while len(pwd_chars) < length:
        pwd_chars.append(secrets.choice(all_chars))
        
    # Shuffle the characters to ensure randomness
    secrets.SystemRandom().shuffle(pwd_chars)
    return ''.join(pwd_chars[:length])

def get_random_word_api(api_key: str) -> str:
    """Fetches a single random word from API Ninjas."""
    if not api_key:
        return "Error"
    try:
        response = requests.get(API_NINJA_URL, headers={"X-Api-Key": api_key}, timeout=5)
        if response.status_code == 200:
            data = response.json()
            word = None
            if isinstance(data, dict):
                word = data.get('word')
                if isinstance(word, (list, tuple)) and len(word) > 0:
                    word = word[0]
            elif isinstance(data, list):
                first = data[0] if len(data) > 0 else None
                if isinstance(first, dict):
                    word = first.get('word')
                else:
                    word = first
            
            if word is None:
                return 'unknown'
            return str(word)
        else:
            return "Error"
    except Exception:
        return "Error"

def get_random_word_local() -> str:
    """Fetches a random word from the local EFF wordlist."""
    words = load_local_words()
    return secrets.choice(words)

def generate_pronounceable_logic(length: int, capitalize: bool, include_number: bool) -> str:
    """Core logic for generating a pronounceable (phonetic) password inspired by Bubble Babble."""
    vowels = "aeiouy"
    consonants = "bcdfghjklmnprstvz"
    
    pwd = []
    for i in range(length):
        if i % 2 == 0:
            pwd.append(secrets.choice(consonants))
        else:
            pwd.append(secrets.choice(vowels))
            
    res = "".join(pwd)
    
    if capitalize:
        res = res.capitalize()
        
    if include_number:
        # Append a random digit to the end
        res += str(secrets.choice(string.digits))
        
    return res

def generate_passphrase_logic(word_count: int, separator: str, include_number: bool, include_symbol: bool, api_key: str) -> str:
    """Core logic for generating a passphrase, utilizing parallel API requests and local fallback."""
    words = []
    
    # 1. Try to fetch words in parallel from the API
    if api_key:
        with concurrent.futures.ThreadPoolExecutor(max_workers=word_count) as executor:
            # Map executes the calls concurrently
            results = executor.map(lambda _: get_random_word_api(api_key), range(word_count))
            for res in results:
                if res != "Error":
                    words.append(res)
    
    # 2. Offline Fallback: Fill any missing words using the local Diceware list
    while len(words) < word_count:
        words.append(get_random_word_local())
        
    # 3. Format the passphrase
    sep = " " if separator == "space" else separator
    passphrase = sep.join(words)
    
    if include_number:
        passphrase += str(secrets.choice(string.digits))
    if include_symbol:
        passphrase += secrets.choice(string.punctuation)
        
    return passphrase
