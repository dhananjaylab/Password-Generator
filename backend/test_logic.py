import pytest
from logic import generate_pw, generate_passphrase_logic, generate_pronounceable_logic

def test_generate_pw_length():
    pw = generate_pw(length=12, uppercase=True, lowercase=True, numbers=True, symbols=True)
    assert len(pw) == 12

def test_generate_pw_uppercase_only():
    pw = generate_pw(length=10, uppercase=True, lowercase=False, numbers=False, symbols=False)
    assert all(c.isupper() for c in pw)

def test_generate_pw_lowercase_only():
    pw = generate_pw(length=10, uppercase=False, lowercase=True, numbers=False, symbols=False)
    assert all(c.islower() for c in pw)

def test_generate_pw_numbers_only():
    pw = generate_pw(length=10, uppercase=False, lowercase=False, numbers=True, symbols=False)
    assert all(c.isdigit() for c in pw)

def test_generate_pw_symbols_only():
    symbols = "!@#$%^&*()_+~`|}{[]:;?><,./-="
    pw = generate_pw(length=10, uppercase=False, lowercase=False, numbers=False, symbols=True)
    assert all(c in symbols for c in pw)

def test_generate_pw_all_types():
    pw = generate_pw(length=20, uppercase=True, lowercase=True, numbers=True, symbols=True)
    assert any(c.isupper() for c in pw)
    assert any(c.islower() for c in pw)
    assert any(c.isdigit() for c in pw)
    assert any(c in "!@#$%^&*()_+~`|}{[]:;?><,./-=" for c in pw)

def test_generate_passphrase_logic():
    # Since this relies on an external API or local file, we can test the basic structure
    passphrase = generate_passphrase_logic(word_count=3, separator="-", include_number=False, include_symbol=False)
    assert isinstance(passphrase, str)
    assert len(passphrase.split("-")) == 3

def test_generate_passphrase_with_number_and_symbol():
    passphrase = generate_passphrase_logic(word_count=3, separator="-", include_number=True, include_symbol=True)
    assert any(c.isdigit() for c in passphrase)
    assert any(c in "!@#$%^&*" for c in passphrase)

def test_generate_pronounceable_logic():
    pw = generate_pronounceable_logic(length=8, capitalize=False, include_number=False)
    assert len(pw) == 8
    assert pw.islower()

def test_generate_pronounceable_logic_capitalize():
    pw = generate_pronounceable_logic(length=8, capitalize=True, include_number=False)
    assert len(pw) == 8
    assert pw[0].isupper()

def test_generate_pronounceable_logic_number():
    pw = generate_pronounceable_logic(length=8, capitalize=False, include_number=True)
    assert len(pw) == 9 # 8 chars + 1 number
    assert pw[-1].isdigit()
