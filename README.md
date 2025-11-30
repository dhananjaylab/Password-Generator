# Password-Generator

Small Streamlit app to generate secure passwords and passphrases.

## Setup

Install dependencies (recommended in a virtual environment):

```bash
python3 -m pip install -r requirements.txt
```

Run the app:

```bash
streamlit run app.py
```

## Security note

This project uses an API key for the API Ninjas word endpoint. Do not commit the key to version control. Create a `.streamlit/secrets.toml` file locally with the following structure (root-level keys, not nested):

```toml
API_NINJA = "your_api_key_here"
```

We added `.streamlit/secrets.toml` to `.gitignore` to avoid accidental commits.

If your key was exposed in public Git history, do the following:

1) Revoke/rotate the API key in the provider dashboard (API Ninjas) and create a new key.
2) Remove the exposed key from the repository and local files.
3) If you need to remove the key from the Git history, follow GitHub's guide for removing sensitive data:
	https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository

