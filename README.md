# Maali Mentor (مالی مینٹر) 📊

**Maali Mentor** is a premium, interactive financial literacy and rank-ascension platform designed to uplift financial education in Pakistan. Leveraging modern web design and state-of-the-art AI, the application offers learning materials, interactive simulations, and quiz challenges in both **Urdu** and **Roman Urdu**.

---

## 🌟 Key Features

### 1. Interactive Learning Flow Graph
* **Visual Prerequisites Map:** A step-by-step prerequisite flow showing concept masteries (Budgeting ➔ Saving habits ➔ Emergency Funds / Inflation ➔ Investing ➔ Mutual Funds ➔ Stocks / Islamic Banking / Diversification ➔ Tax Planning).
* **3-Level Buffer Unlocking:** Initially unlocks Levels 1, 2, and 3. As you pass level quizzes, a rolling buffer of 3 unlocked future levels is maintained (e.g., passing Level 1 unlocks Level 4).
* **Linear Final Sequence:** The advanced levels (8: Stock Market, 9: Diversification, 10: Tax Filer) are strictly linear, requiring sequential completion.

### 2. Comprehensive 10-Level Study Guides
* **Highly Detailed Content:** Features customized lesson points detailing mathematical calculations (such as the *Rule of 72* and *Real Rate of Return*), specific tax differences (e.g., Filer vs. Non-filer cash withdrawal and PLS profit taxes), and Islamic banking PLS rules (*Mudarabah*, *Musharakah*, *Ijarah*, *Murabahah*, *Takaful*).
* **Roman Urdu & Urdu Script Support:** Styled with custom Nastaliq typography to make reading both scripts natural and readable.

### 3. Rank Ascension & Quiz System
* **10 Numerical Ranks:** Progress through the ranks from **Bachat Rookie** (Level 1) to **Maali Master** (Level 10).
* **Dynamic Grading & Anti-Cheat:** 200 high-quality MCQs (20 per level) graded securely. Correct option keys and explanations are omitted from network payloads to prevent browser inspector cheating.
* **Offline Quiz Fallback:** If the backend API goes offline, the frontend transparently transitions to **Offline Mode**, loading questions from static assets, grading locally, and persisting rank ascension in `localStorage`.

### 4. Urdu Voice Coach (AI Tutor)
* **Audio Transcription (STT):** Uses Google Gemini Flash to transcribe user voice messages spoken in Urdu or Roman Urdu.
* **Speech Synthesis (TTS):** Converts text responses back to Urdu speech using Google TTS.
* **Conversational Speed Control:** Configured with a natural `1.2x` voice playback rate so synthesized speech flows clearly and conversational pace feels organic.

### 5. Financial Simulator & Goals Planner
* **Wealth Simulator:** Compare nominal wealth vs. real purchasing power over a 10-year timeline under adjustable inflation rates.
* **Goals Tracker:** Allocate target goals and calculate the exact monthly savings required based on personalized risk metrics.

---

## 🛠️ Technology Stack

### Backend
* **FastAPI:** Python web framework for asynchronous API endpoints.
* **SQLModel & SQLite:** Combined database modeling and ORM engine with SQLite storage.
* **Google Gemini AI SDK:** Generates context-aware, Roman Urdu financial advisory responses and transcribes audio uploads.
* **gTTS (Google Text-to-Speech):** Synthesizes response text into Urdu speech.
* **Pydantic Validation:** Sanitizes usernames, message lengths, and simulator parameters against SQL injection and DoS attacks.

### Frontend
* **Next.js (App Router):** Fast, React-based static and dynamic route renderer.
* **Tailwind CSS:** Modern utility-first CSS configurations for glassmorphism styling.
* **Lucide Icons:** Premium, modern vector iconography.
* **TypeScript:** Strong type safety across pages and components.

---

## 📂 Project Structure

```text
maali-mentor/
├── backend/                  # FastAPI Backend Service
│   ├── app/
│   │   ├── config.py         # App configurations (Pydantic settings)
│   │   ├── database.py       # SQLModel SQLite engine setup
│   │   ├── models.py         # DB models (User, QuizAttempt, Goal, etc.)
│   │   ├── schemas.py        # Validation schemas & constraints
│   │   ├── main.py           # FastAPI initialization & routers registry
│   │   ├── routers/          # Endpoints (auth, tutor, simulator, quiz, goals)
│   │   └── services/         # speech, gemini_client, quiz_data
│   └── requirements.txt      # Python package dependencies
├── frontend/                 # Next.js Frontend Service
│   ├── src/
│   │   ├── app/              # Onboarding, Dashboard, Study, Quiz, Tutor, Simulator, Goals pages
│   │   ├── components/       # GlassCard, Sidebar, VoiceButton, LineChart, ProgressRing
│   │   └── styles/           # CSS design rules & font imports
│   └── package.json          # Node dependencies & scripts
├── README.md                 # Project documentation
├── PRD.md                    # Product Requirements Document
└── DEVELOPMENT_PLAN.md       # Development plan & architectural design
```

---

## 🚀 How to Run Locally

### 1. Start the FastAPI Backend
1. Open your terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure your `.env` file inside `backend/.env`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   USE_MOCK_SPEECH=false
   USE_MOCK_LLM=false
   ```
5. Run the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload
   ```
   *The backend will be running at `http://localhost:8000`.*

### 2. Start the Next.js Frontend
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Run the development environment:
   ```bash
   npm run dev
   ```
4. Open your browser and go to `http://localhost:3000`.

---

## 🔒 Security & Input Safeguards
* **Username Sanitization:** Backed by regex verification (`^[a-zA-Z0-9_\s\-]+$`) to prevent database exploit attempts.
* **Payload Constraints:** Voice tutor queries are constrained to a maximum of 2,000 characters.
* **Audio Upload Limits:** File uploads on `/api/tutor/voice` are restricted to a maximum size of **10MB** to safeguard against memory depletion.
* **Option Range Safeguards:** Quiz answer submissions must match the regex `^[a-d]$`.
