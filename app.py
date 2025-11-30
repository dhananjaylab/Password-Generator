import streamlit as st
import requests
import os
import secrets
import string

# streamlit settings
page_title = "PW & Passphrase Generator"
page_icon = ":building_construction:"
layout = "centered"

# page config
st.set_page_config(page_title=page_title,page_icon=page_icon,layout=layout)

st.title(f"{page_icon} {page_title}")

# Note: configure your API key in `.streamlit/secrets.toml` or via the environment
# Example `secrets.toml` entry: API_NINJA = "<your_api_key>" — do not commit this file.

# # streamlit config hide
# hide_st_style = """<style>
#                     #MainMenu {visibility: hidden;}
#                     footer {visibility: hidden;}
#                     header {visibility: hidden;}  
#                     </style>    
#                     """

# st.markdown(hide_st_style, unsafe_allow_html=True)

#--PW GENERATOR FUNCTION--#
def generate_pw() -> None:
    """Uses the string module to get the letters and digits that make up the alphabet used to generate the random characters. These characters are
    appended to the pwd string which is then assigned to the session_state variable [pw]"""
    letters = string.ascii_letters
    digits = string.digits
    alphabet = letters + digits
    pwd_length = 14
    # Efficiently build the string
    pwd = ''.join(secrets.choice(alphabet) for _ in range(pwd_length))
    
    st.session_state["pw"] = pwd

    
#--PASSPHRASE GENERATOR FUNCTIONS--#

##--GET RANDOM WORD--##
def get_random_word() -> str:
    """Uses the API Ninja API to request a word string. 
       This string is then parsed to extract only the
       word and return it."""
    api_url = 'https://api.api-ninjas.com/v1/randomword'
    api_key = st.secrets.get("API_NINJA") or os.environ.get("API_NINJA")
    if not api_key:
        # If no API key is available, return an error so caller falls back to placeholder words
        return "Error"
    try:
        response = requests.get(api_url, headers={"X-Api-Key": api_key})
        if response.status_code == requests.codes.ok:
            data = response.json()
            # API Ninjas typically responds with {'word': 'example'} or sometimes a list
            word = None
            if isinstance(data, dict):
                word = data.get('word')
                # Sometimes the word entry is a list inside the dict ({'word': ['abc']})
                if isinstance(word, (list, tuple)) and len(word) > 0:
                    word = word[0]
            elif isinstance(data, list):
                # Could be list of dicts or list of strings
                first = data[0] if len(data) > 0 else None
                if isinstance(first, dict):
                    word = first.get('word')
                else:
                    word = first
            # Ensure we return a string (or fallback)
            if word is None:
                return 'unknown'
            return str(word)
        else:
            return "Error"
    except Exception:
        # Could not request / parse the response
        return "Error"

##--GENERATING THE PHRASE--##
def generate_ps() -> None:
    """Uses the get_random_word function to request five words. These are concatenated into a string with dashes and then
    assigned these to the session_state variable [pw] """
    # Gather 5 words using helper, show a spinner while waiting for network calls
    with st.spinner('Fetching random words...'):
        words = []
        for _ in range(5):
            w = get_random_word()
            if w != "Error":
                words.append(str(w))
            else:
                # Fallback on error
                words.append("xxxx")
        passphrase_final = "-".join(str(p) for p in words)
        # If all entries rolled back to the generic 'xxxx', signal to user there was a problem
        if all(p == "xxxx" for p in words):
            # Show an error message and do not blithely display falling-back passphrases
            st.error("Could not fetch words from the API — check your API_NINJA key or network connectivity.")
            # Clear the passphrase (or leave the old one)
            passphrase_final = ""
    st.session_state["pw"] = passphrase_final
    
##--MAIN PAGE--##

if "pw" not in st.session_state:
    st.session_state["pw"] = ""
    
st.divider()

col1, col2 = st.columns(2, gap='large')
with col1:
    st.caption("Secure password length is set at 14 chars.")
    st.button("Generate secure password", key="pw_button", on_click=generate_pw, use_container_width=True)
    # Quick API test button for debugging connectivity to API Ninjas
    if st.button("Test API", key="api_test_button"):
        # Call the API once and show status
        api_key = st.secrets.get("API_NINJA") or os.environ.get("API_NINJA")
        if not api_key:
            st.error("API_NINJA key not found — add it to .streamlit/secrets.toml or export API_NINJA env var.")
        else:
            try:
                r = requests.get('https://api.api-ninjas.com/v1/randomword', headers={"X-Api-Key": api_key}, timeout=5)
                if r.status_code == requests.codes.ok:
                    st.success("API responded successfully — check passphrase generator again.")
                else:
                    st.error(f"API returned status code {r.status_code}: {r.text[:120]}")
            except Exception as e:
                st.error(f"Could not contact API: {e}")
with col2:
    st.caption("Secure passphrase length is set at 5 words.")
    st.button("Generate secure password sentence", key="ps_button", on_click=generate_ps, use_container_width=True)
st.write("#")

ocol1, ocol2, ocol3 = st.columns([1, 4, 1])
with ocol1:
    ''
with ocol2:
    st.caption("Generated Result")
    st.divider()
    if st.session_state["pw"]:
        st.subheader(st.session_state["pw"])
        st.code(st.session_state["pw"], language=None)
    else:
        st.info("Click a button above to generate.")
    st.divider()
with ocol3:
    ''

    
    
    