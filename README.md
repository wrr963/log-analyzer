# Log Analyzer

AI-powered error log analysis tool. Paste any error log, and the app identifies the root cause and provides a step-by-step solution — powered by Google Gemini.

## Features

- **AI Analysis** — Submits raw logs to Gemini and returns a root-cause summary and fix steps
- **Tag Extraction** — Automatically tags each analysis by relevant technologies
- **History Sidebar** — All past analyses are persisted in SQLite and browsable in the UI
- **Dark Theme UI** — Clean dark-mode interface with grid layout

## Architecture

```
log-analyzer/
├── backend/    FastAPI + SQLAlchemy (SQLite) + Gemini
└── frontend/   Next.js 16 (App Router), Tailwind CSS v4
```

The frontend communicates with the backend over HTTP. Default ports: frontend `3000`, backend `8000`.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, FastAPI 0.110, Uvicorn |
| AI | Google Gemini API (`google-generativeai`) |
| Database | SQLite via SQLAlchemy 2 |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |

## Prerequisites

- Python 3.10+
- Node.js 18+
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)

## Getting Started

### Backend

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# → Edit .env and set your GOOGLE_API_KEY

# Start the API server
uvicorn app.main:app --reload
```

The API will be available at [http://localhost:8000](http://localhost:8000).

### Frontend

```bash
cd frontend

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Create `backend/.env` from `backend/.env.example`:

| Variable | Required | Description |
|---|---|---|
| `GOOGLE_API_KEY` | Yes | Google Gemini API key |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `POST` | `/api/analyze` | Analyze a raw log string |
| `GET` | `/api/history` | Return the last 20 analyzed logs |

### Example request

```bash
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"raw_log": "TypeError: Cannot read properties of undefined..."}'
```

## Project Structure

```
backend/
├── app/
│   ├── main.py          # FastAPI app and route definitions
│   ├── llm_pipeline.py  # Gemini prompt and response parsing
│   └── database.py      # SQLAlchemy models and CRUD helpers
└── requirements.txt

frontend/
└── src/app/
    └── page.tsx         # Main UI (log input, results, history sidebar)
```
