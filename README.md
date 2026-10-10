# 🎓 WGU Student Support Session Booking App

A full-stack student support session booking application built with **React**, **FastAPI**, and **SQLite** — featuring an AI-powered assistant using OpenRouter.

---

## ✨ Features

- 📅 **Session Booking & Cancellation** — Book or cancel support sessions with real-time seat tracking
- 🔒 **Duplicate & Overlap Prevention** — Transactional backend checks prevent double-bookings and time conflicts
- 🤖 **AI Assistant (OpenRouter)** — Students can chat with an AI to find sessions, request bookings, and get confirmations
- ✅ **Confirmation Flow** — AI always asks for student confirmation before executing any booking or cancellation
- 🧪 **Concurrent Request Safety** — Database transactions with row-level locking handle concurrent bookings gracefully
- 🎨 **Modern React Dashboard** — Clean UI showing sessions, available seats, and booking options

---

## 🛠 Tech Stack

| Layer     | Technology            |
|-----------|-----------------------|
| Frontend  | React + Vite          |
| Backend   | FastAPI (Python)      |
| Database  | SQLite (SQLAlchemy)   |
| AI        | OpenRouter API        |
| Styling   | Vanilla CSS           |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- An [OpenRouter](https://openrouter.ai/) API key

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/wgu-booking-app.git
cd wgu-booking-app
```

### 2. Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Environment Variables

Copy the example `.env` file and add your OpenRouter API key:

```bash
cp .env.example .env
```

Edit `.env`:
```
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### 4. Run the Backend

```bash
# From project root
backend/venv/bin/uvicorn backend.main:app --reload --port 8000
```

### 5. Run the Frontend

```bash
npm install
npm run dev
```

The app will be available at **http://localhost:5173**  
API docs available at **http://localhost:8000/docs**

---

## 📁 Project Structure

```
wgu-booking-app/
├── backend/
│   ├── main.py          # FastAPI routes & endpoints
│   ├── models.py        # SQLAlchemy models
│   ├── schemas.py       # Pydantic request/response schemas
│   ├── database.py      # SQLite connection & session
│   ├── seed.py          # Sample data seeding
│   ├── ai_assistant.py  # OpenRouter AI chat handler
│   └── requirements.txt
├── src/
│   ├── components/      # React UI components
│   ├── App.jsx
│   └── main.jsx
├── .env.example         # Environment variable template
├── index.html
├── package.json
└── vite.config.js
```

---

## 🔐 Security

- The `.env` file is **git-ignored** — your API key is never committed
- Backend validates all booking/cancellation actions independently
- AI assistant **cannot bypass** backend validation checks

---

## 📝 API Endpoints

| Method | Endpoint              | Description                   |
|--------|-----------------------|-------------------------------|
| GET    | `/api/health`         | Health check                  |
| GET    | `/api/student`        | Get current student info      |
| GET    | `/api/sessions`       | List all sessions             |
| GET    | `/api/bookings`       | Get student bookings          |
| POST   | `/api/book`           | Book a session                |
| POST   | `/api/cancel/{id}`    | Cancel a booking              |
| POST   | `/api/chat`           | AI assistant chat             |

---

## 📄 License

MIT License — feel free to use, modify, and distribute.
