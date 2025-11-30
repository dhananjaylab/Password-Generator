import sys, os
from unittest.mock import patch

# Provide a minimal streamlit stub for testing
class _DummyStreamlit:
    def __init__(self):
        self.secrets = {}
        self.session_state = {}
    def set_page_config(self, **kwargs):
        return None
    def title(self, *args, **kwargs):
        return None
    def divider(self, *args, **kwargs):
        return None
    def columns(self, *args, **kwargs):
        class Column:
            def __enter__(self):
                return self
            def __exit__(self, exc_type, exc_value, traceback):
                return False
        return [Column(), Column(), Column()][: (args[0] if args and isinstance(args[0], int) else 2) ]
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
    def write(self, *args, **kwargs):
        return None

sys.modules['streamlit'] = _DummyStreamlit()
import app


def test_generate_ps_basic(monkeypatch):
    # Set env var so app.get_random_word reads API key fallback
    monkeypatch.setenv('API_NINJA', 'fake')

    class FakeResponse:
        def __init__(self, status_code=200, json_data=None):
            self.status_code = status_code
            self._json = json_data
        def json(self):
            return self._json

    words = [{'word': 'apple'}, {'word': 'pear'}, {'word': 'kiwi'}, {'word': 'mango'}, {'word': 'banana'}]
    # side_effect returns one fake response per call
    with patch('app.requests.get', side_effect=[FakeResponse(200, w) for w in words]):
        app.generate_ps()
        assert 'pw' in app.st.session_state
        assert app.st.session_state['pw'] == 'apple-pear-kiwi-mango-banana'
