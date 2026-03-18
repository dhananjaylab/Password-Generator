# Password & Passphrase Generator

A robust and user-friendly password and passphrase generation tool with a modern web stack (React frontend, FastAPI backend) and enhanced features for customization, security, and user experience.

## Features

- **Password Generation:**
  - Customizable length (8-64 characters).
  - Toggles for uppercase, lowercase, numbers, and symbols.
  - Real-time password strength estimation using `zxcvbn`.
- **Passphrase Generation:**
  - Customizable word count (3-10 words).
  - Separator options (hyphen, underscore, space, period, comma).
  - Optional trailing number and symbol.
  - Parallel API requests for faster generation.
  - Offline fallback using the EFF Large Wordlist.
- **Phonetic (Pronounceable) Password Generation:**
  - Generates pronounceable, nonsensical passwords.
  - Customizable length.
  - Options to capitalize the first letter and include a trailing number.
- **User Interface & Experience:**
  - Modern, dark-themed UI built with React and Tailwind CSS.
  - Tabbed interface for easy switching between generators.
  - QR Code generation for easy sharing/scanning of long passwords.
  - One-click "Copy to Clipboard" with visual feedback.
  - Graceful error handling and fallback mechanisms.

## Tech Stack

- **Frontend:** React, Tailwind CSS, Lucide React, `zxcvbn`, `react-qr-code`.
- **Backend:** FastAPI, `uvicorn`, `requests`, `python-dotenv`, `concurrent.futures`.
- **External APIs:** API Ninjas (for random words).

## Prerequisites

- Node.js (v18+)
- Python (3.9+)

## Setup Instructions

### 1. Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
3. Create a `.env` file in the `backend` directory and add your API Ninjas key:
   ```env
   API_NINJA=your_api_key_here
   ```
   *(Note: The application includes an offline fallback, so it will still work without an API key, but using the API provides a wider variety of words.)*
4. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
   The backend will be available at `http://localhost:8000`.

### 2. Frontend Setup

1. Navigate to the root directory (or `frontend` if applicable).
2. Install the required npm packages:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:3000` (or the port specified by Vite).

## Running Tests

The backend includes comprehensive unit and integration tests using `pytest`.

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install the test dependencies:
   ```bash
   pip install pytest httpx
   ```
3. Run the tests:
   ```bash
   pytest
   ```

## Deployment

### Dockerization (Recommended)

You can containerize the application using Docker.

1. Create a `Dockerfile` for the backend and a `Dockerfile` for the frontend.
2. Use `docker-compose` to orchestrate the containers.

### CI/CD Pipeline

Set up a CI/CD pipeline (e.g., GitHub Actions, GitLab CI) to automate testing and deployment.

- **Testing:** Run `pytest` for the backend and `npm test` (if applicable) for the frontend on every push.
- **Deployment:** Deploy the backend to a platform like Heroku, Render, or AWS, and deploy the frontend to Vercel, Netlify, or AWS S3/CloudFront.

## API Key Management

For production, **do not** commit your `.env` file to version control. Use secure secret management solutions provided by your hosting platform (e.g., AWS Secrets Manager, HashiCorp Vault, or environment variables in your deployment dashboard).

## Accessibility

The application has been designed with accessibility in mind, but a thorough review using tools like Lighthouse or axe DevTools is recommended before production deployment. Ensure sufficient color contrast, keyboard navigability, and proper ARIA labels where necessary.
