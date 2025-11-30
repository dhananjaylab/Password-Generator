import os
import types
import pytest
from unittest.mock import patch, MagicMock
import sys

# Create a minimal streamlit stub so tests can import `app` without installing streamlit
class _DummyStreamlit:
    def __init__(self):
        self.secrets = {}
    def set_page_config(self, **kwargs):
        return None
    def title(self, *args, **kwargs):
        return None
    def divider(self, *args, **kwargs):
        return None
    def columns(self, *args, **kwargs):
        return [None, None]
    def caption(self, *args, **kwargs):
        return None
    def button(self, *args, **kwargs):
        return None
    def subheader(self, *args, **kwargs):
        return None
    def code(self, *args, **kwargs):
        return None
    def info(self, *args, **kwargs):
        return None
    def spinner(self, *args, **kwargs):
        import contextlib
        return contextlib.nullcontext()

sys.modules['streamlit'] = _DummyStreamlit()
import app


@pytest.fixture(autouse=True)
def fake_api_key(monkeypatch):
    # Ensure function uses environment fallback for the API key
    monkeypatch.setenv('API_NINJA', 'fake-key')
    yield


class FakeResponse:
    def __init__(self, status_code=200, json_data=None):
        self.status_code = status_code
        self._json = json_data

    def json(self):
        return self._json


def test_get_random_word_dict():
    with patch('app.requests.get') as fake_get:
        fake_get.return_value = FakeResponse(200, {'word': 'apple'})
        assert app.get_random_word() == 'apple'


def test_get_random_word_list_of_dicts():
    with patch('app.requests.get') as fake_get:
        fake_get.return_value = FakeResponse(200, [{'word': 'pear'}])
        assert app.get_random_word() == 'pear'


def test_get_random_word_list_of_strings():
    with patch('app.requests.get') as fake_get:
        fake_get.return_value = FakeResponse(200, ['kiwi'])
        assert app.get_random_word() == 'kiwi'


def test_get_random_word_missing_word():
    with patch('app.requests.get') as fake_get:
        fake_get.return_value = FakeResponse(200, {})
        assert app.get_random_word() == 'unknown'


def test_get_random_word_error_status():
    with patch('app.requests.get') as fake_get:
        fake_get.return_value = FakeResponse(500, None)
        assert app.get_random_word() == 'Error'


def test_get_random_word_raises_exception():
    with patch('app.requests.get', side_effect=Exception('boom')):
        assert app.get_random_word() == 'Error'
