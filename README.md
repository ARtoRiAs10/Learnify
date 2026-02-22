# 🧠 Learnify AI – AI-Powered Learning Assistant

Transform any YouTube video or PDF into an interactive learning experience powered by Google Gemini, RAG, and vector embeddings.

## ✨ Features

- 🎥 **YouTube Transcript Processing** – Extract transcripts from any YouTube video
- 📄 **PDF Upload & Processing** – Upload PDFs and extract text automatically
- 🧠 **AI Flashcards** – Generate 10–15 smart flashcards with flip animations
- 🏆 **Interactive Quiz** – Multiple-choice questions with auto-evaluation
- 💬 **RAG Chat** – Streaming AI chat grounded in your actual content
- 🔐 **Clerk Authentication** – Secure sign-in/sign-up
- 🎨 **Beautiful UI** – Dark theme, glass morphism, smooth animations

## 🏗️ Architecture

```
Next.js 14 (Frontend)  ←→  FastAPI (Backend)
                              ├── YouTube Transcript API
                              ├── pdfplumber (PDF extraction)
                              ├── Sentence Transformers (embeddings)
                              ├── ChromaDB (vector store)
                              └── Google Gemini Flash (AI)
```

### RAG Pipeline
```
Input → Extract Text → Chunk (500 words) → Embed (MiniLM) → ChromaDB
Query → Embed Query → Semantic Search → Top-K Chunks → Gemini → Stream
```

## 🆓 Free Tier Stack

| Service | Model/Tool | Free Tier |
|---------|-----------|-----------|
| AI | Google Gemini 1.5 Flash | 15 RPM, 1M tokens/day |
| Embeddings | all-MiniLM-L6-v2 | 100% local |
| Auth | Clerk | 10,000 MAU free |

---

## 🚀 Setup Instructions

### Step 1 – Clone and navigate
```bash
git clone <your-repo-url>
cd ai-learning-assistant
```

### Step 2 – Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Mac/Linux
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
```

Edit `backend/.env`:
```env
GEMINI_API_KEY=your_key_here
FRONTEND_URL=http://localhost:3000
```

**Get free Gemini API Key:**
→ https://aistudio.google.com/app/apikey → Create API Key

```bash
# Start backend
uvicorn main:app --reload --port 8000
```
API docs at: http://localhost:8000/docs

---

### Step 3 – Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create env file
cp .env.example .env.local
```

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key
CLERK_SECRET_KEY=sk_test_your_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Get free Clerk Keys:**
→ https://clerk.com → Create app → API Keys section

```bash
# Start frontend
npm run dev
```
App at: http://localhost:3000

---

## 🏃 Run Both Together

**Terminal 1 (Backend):**
```bash
cd backend && source venv/bin/activate && uvicorn main:app --reload --port 8000
```

**Terminal 2 (Frontend):**
```bash
cd frontend && npm run dev
```

Open http://localhost:3000 🎉

---

## 📡 API Reference

| Method | Endpoint | Body |
|--------|----------|------|
| POST | `/process-video` | `{url, session_id}` |
| POST | `/process-pdf` | `form: file, session_id` |
| POST | `/generate-flashcards` | `{session_id, num_cards}` |
| POST | `/generate-quiz` | `{session_id, num_questions}` |
| POST | `/chat` | `{session_id, message, chat_history}` |
| GET | `/session/{id}` | — |

---

## 📁 Project Structure

```
ai-learning-assistant/
├── README.md
├── backend/
│   ├── main.py                    # FastAPI routes
│   ├── requirements.txt
│   ├── .env.example
│   └── services/
│       ├── youtube_service.py     # YouTube transcript
│       ├── pdf_service.py         # PDF extraction
│       ├── embedding_service.py   # ChromaDB + embeddings
│       └── ai_service.py          # Gemini AI
│
└── frontend/
    ├── middleware.ts              # Clerk auth
    ├── app/
    │   ├── page.tsx               # Landing page
    │   ├── sign-in/               # Auth pages
    │   ├── sign-up/
    │   └── dashboard/
    │       ├── layout.tsx         # Sidebar layout
    │       ├── page.tsx           # Home
    │       ├── chat/              # RAG chat
    │       ├── flashcards/        # Study mode
    │       ├── quiz/              # MCQ quiz
    │       ├── youtube/           # YouTube processing
    │       └── pdf/               # PDF upload
    └── lib/
        ├── api.ts                 # API client
        └── utils.ts
```

---

## 🐛 Troubleshooting

**YouTube fails:** Some videos disable transcripts. Try videos with CC enabled.

**Gemini rate limit:** Free tier = 15 req/min. Wait and retry.

**CORS errors:** Check backend is on port 8000 and `FRONTEND_URL` is set.
