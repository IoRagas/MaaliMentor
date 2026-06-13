# Maali Mentor (مالی مینٹر) — Detailed Development Plan

## Hackathon MVP Execution Strategy (48-Hour Plan)

---

## 1. Directory Structure

This layout separates concerns between the **FastAPI Python backend** (handling DB, math models, and AI APIs) and the **Next.js frontend** (handling modern dark-themed interactive UI).

```text
maali-mentor/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models.py           # SQLModel / SQLAlchemy entities (User, Goal, ConceptMastery)
│   │   ├── schemas.py          # Pydantic schemas for Request/Response validation
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py         # Onboarding, user profile
│   │   │   ├── tutor.py        # Urdu Voice chat, LLM orchestrator, Dictionary
│   │   │   ├── simulator.py    # Pakistan Life Simulator logic
│   │   │   └── goals.py        # Goal calculator API
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── speech.py       # Whisper STT & Azure/ElevenLabs TTS integration
│   │       ├── graph_rag.py    # NetworkX concept graph & local semantic vector search
│   │       ├── simulator_math.py # Financial projection functions
│   │       └── planner_math.py # Goal trajectory math
│   │   └── knowledge_base/     # RAG document source files (Markdown)
│   │       ├── tax_filer_system.md
│   │       ├── islamic_banking_pakistan.md
│   │       ├── mutual_funds_secp.md
│   │       └── national_savings_certificates.md
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx        # Homepage / Landing page
│   │   │   ├── onboarding/     # Onboarding wizard
│   │   │   ├── dashboard/      # Main analytics dashboard
│   │   │   ├── tutor/          # Voice/text chat interface
│   │   │   ├── simulator/      # 5-turn simulator
│   │   │   └── goals/          # Goal planning page
│   │   ├── components/
│   │   │   ├── ui/             # shadcn components (buttons, progress, cards)
│   │   │   ├── voice-button.tsx # Glowing microphone component
│   │   │   ├── radar-chart.tsx # Skill distribution display
│   │   │   └── wealth-chart.tsx # Nominal vs purchasing power chart
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── styles/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── .env.example
```

---

## 2. Environment Configurations

Create `.env.example` templates to ensure clean deployments on Render/Vercel.

### Backend `.env.example`
```env
# Server
PORT=8000
HOST=0.0.0.0
ENVIRONMENT=development

# Database
DATABASE_URL=sqlite:///./maali_mentor.db # Use SQLite for Hackathon simplicity

# OpenAI API (STT & LLM)
OPENAI_API_KEY=your-openai-api-key-here

# TTS Service (Select ElevenLabs or Azure)
TTS_SERVICE=azure # azure or elevenlabs
AZURE_SPEECH_KEY=your-azure-speech-key
AZURE_SPEECH_REGION=centralus
ELEVENLABS_API_KEY=your-elevenlabs-api-key
ELEVENLABS_VOICE_ID=your-urdu-voice-id
```

### Frontend `.env.example`
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 3. Hour-by-Hour Milestones

### Phase 1: Tech Setup & Core Database Schema (Hours 0 - 6)
- [ ] Initialize Python virtual environment in `backend/` and install requirements (`fastapi`, `uvicorn`, `sqlmodel`, `pydantic`, `openai`, `networkx`, `chromadb`).
- [ ] Initialize Next.js project with Tailwind CSS, TypeScript, and ESLint.
- [ ] Setup SQLModel schemas in `backend/app/models.py`.
- [ ] Configure database engine (`sqlite:///./maali_mentor.db`) and create database initialization scripts to verify table creation.
- [ ] Create basic FastAPI routes (`/api/auth/onboard`) and verify them using Swagger UI `/docs`.

### Phase 2: AI Voice & LLM Integration (Hours 6 - 14)
- [ ] Implement `backend/app/services/speech.py`:
  - Write `transcribe_audio(audio_bytes)` calling OpenAI Whisper API.
  - Write `synthesize_speech(text)` using ElevenLabs or Azure Speech (saving files to `/static/audio`).
- [ ] Create the primary System Prompt for the LLM tutor inside `backend/app/services/graph_rag.py`. Include:
  - Instructions to talk exclusively in Roman Urdu / Urdu script.
  - Instructions to use respectful pronouns ("Aap").
  - Rules to simplify concepts with simple Pakistani metaphors (e.g. comparing mutual funds to a shared local committee / *bise*).
- [ ] Write the `/api/tutor/voice` endpoint that accepts an audio blob, transcribes it, runs it through the tutor agent, generates the response voice, and returns both text and audio URL.

### Phase 3: Concept Graph & Knowledge Base (Hours 14 - 20)
- [ ] Define the concept graph inside `backend/app/services/graph.py` using NetworkX:
  ```python
  import networkx as nx
  G = nx.DiGraph()
  G.add_edge("budgeting", "saving")
  G.add_edge("saving", "emergency_funds")
  G.add_edge("inflation", "investing")
  G.add_edge("investing", "mutual_funds")
  G.add_edge("mutual_funds", "islamic_banking")
  ```
- [ ] Implement a lookup function to cross-reference user concept mastery:
  - If a user asks about `mutual_funds` but their database score for `inflation` is $<50$, flag it.
- [ ] Build a lightweight RAG system using ChromeDB or an in-memory document store.
  - Load the localized markdown documents (`knowledge_base/`).
  - Extract relevant fragments based on user questions (e.g. current tax rates for Non-Filers vs. Filers) and inject them as context into the LLM tutor prompt.

### Phase 4: Life Simulator & Goal Calculations (Hours 20 - 26)
- [ ] Code the turn-based Simulator logic in `backend/app/services/simulator_math.py`:
  - Define outcomes for decisions (e.g., choice to keep money in *cash* under 20% inflation leads to $20\%$ purchasing power loss per turn).
  - Create random event generator (e.g. *“Gari kharab ho gayi! PKR 40,000 ka kharcha.”*).
- [ ] Code the Goal Planner logic in `backend/app/services/planner_math.py`:
  - Implement the PMT formula adjusted for inflation to compute monthly investment targets.
- [ ] Build endpoints:
  - `POST /api/simulator/start` (Initializes user stats: age=22, wealth=50k, cash=100%).
  - `POST /api/simulator/turn` (Processes year decision and returns updated nominal wealth, real purchasing power, and triggered events).
  - `POST /api/goals/calculate` (Returns required savings and asset recommendations).

### Phase 5: Next.js Frontend Development (Hours 26 - 38)
- [ ] Install shadcn/ui components (`npm i lucide-react clsx tailwind-merge` + components).
- [ ] Create layout with deep obsidian theme background and sidebar menu navigation.
- [ ] Build **Onboarding Wizard**:
  - Questionnaire capturing user experience level, starting wealth, and general understanding of finance.
- [ ] Build **Tutor Chat screen**:
  - Add text message bubbles.
  - Implement a glowing voice-input button. Use standard Web Audio API to record audio from client microphone and send as FormData to `/api/tutor/voice`.
- [ ] Build **Simulator Dashboard**:
  - Slider options for decisions.
  - A Chart.js/Recharts graphic showing the divergence between *Nominal Cash Wealth* and *Real Purchasing Power*.
- [ ] Build **Analytics Dashboard**:
  - Use a radar chart to show Financial IQ categories (Investing, Saving, Tax, Budgeting, Risk).

### Phase 6: E2E Integration & Polish (Hours 38 - 44)
- [ ] Connect all Next.js API calls to the FastAPI backend port.
- [ ] Implement frontend state persistence (saving active user session in LocalStorage or cookies).
- [ ] **Optimize Latency:** Add typing animations while waiting for LLM output, and pre-buffer audio play.
- [ ] Add sound effects for XP achievements and level-ups.

### Phase 7: Deployment & Slide Preparation (Hours 44 - 48)
- [ ] Deploy backend to **Render** or **Railway** (using SQLite file persistent storage or a quick Supabase Postgres database).
- [ ] Deploy frontend to **Vercel**.
- [ ] Run complete end-to-end user tests. Record a backup screen video (high quality) showing the full workflow (Onboarding -> Audio Lesson -> Life Simulator -> Dashboard update).
- [ ] Prepare slides targeting hackathon scoring criteria: Design, Tech Depth, Innovation, and Business Value.

---

## 4. Key Logic & Math Specifications

### 1. Goal Planner Calculations
When a user sets a goal (e.g., Buying a car worth 1,500,000 PKR in 5 years), the backend must adjust the goal cost for inflation and calculate monthly savings required.

**Python Formula Implementation:**
```python
def calculate_goal_savings(
    target_amount_today: float,
    years: int,
    expected_annual_return: float, # e.g. 0.15 (15% Mutual Fund)
    inflation_rate: float = 0.15   # 15% estimated average inflation
) -> dict:
    # 1. Calculate future cost of goal adjusted for inflation
    future_target_amount = target_amount_today * ((1 + inflation_rate) ** years)
    
    # 2. Calculate monthly rate and total months
    monthly_return_rate = (1 + expected_annual_return) ** (1/12) - 1
    total_months = years * 12
    
    # 3. Apply sinking fund formula (PMT)
    # PMT = FV * r / ((1 + r)^n - 1)
    if monthly_return_rate > 0:
        monthly_saving_needed = (future_target_amount * monthly_return_rate) / (
            ((1 + monthly_return_rate) ** total_months) - 1
        )
    else:
        monthly_saving_needed = future_target_amount / total_months
        
    return {
        "future_target_amount": round(future_target_amount, 2),
        "monthly_saving_needed": round(monthly_saving_needed, 2),
        "total_months": total_months
    }
```

### 2. Simulator Progression
Every year (turn) is calculated to show the user how inflation erodes cash compared to compound investments.

**Python Turn Evaluation:**
```python
def progress_simulator_turn(
    current_wealth: float,
    current_cash_pct: float,        # 0.0 to 1.0 (portion in cash vs investments)
    investment_yield: float,        # expected returns from investments (e.g., 0.18)
    inflation_rate: float,          # dynamic inflation (e.g., 0.20)
    monthly_savings: float          # savings added over the year
) -> dict:
    # Split wealth
    cash_portion = current_wealth * current_cash_pct
    invested_portion = current_wealth * (1.0 - current_cash_pct)
    
    # Apply rates over 1 year (nominal values)
    cash_end = cash_portion + (monthly_savings * 12 * current_cash_pct)
    invested_end = (invested_portion + (monthly_savings * 12 * (1.0 - current_cash_pct))) * (1 + investment_yield)
    
    nominal_wealth = cash_end + invested_end
    
    # Real purchasing power calculation (discounted by cumulative inflation)
    # If starting base year = 0, this tracks buying power relative to year 0
    real_purchasing_power = nominal_wealth / (1 + inflation_rate)
    
    return {
        "nominal_wealth": round(nominal_wealth, 2),
        "real_purchasing_power": round(real_purchasing_power, 2),
        "cash_value": round(cash_end, 2),
        "invested_value": round(invested_end, 2)
    }
```

---

## 5. Mocking & Cost-Saving Plan for Development

To prevent exceeding OpenAI API budgets and hitting rate limits during development, follow this fallback structure:

1. **Mock STT / TTS Flag:**
   * Create a local mock flag `USE_MOCK_SPEECH=True` in `config.py`.
   * When `True`, the backend bypasses Whisper and ElevenLabs, returning static translated text and referencing pre-recorded audio files stored in `backend/app/static/audio/mocks/`.
2. **LLM Chat Caching:**
   * Log LLM prompts and responses to a local SQLite table.
   * If an identical question is asked during testing, retrieve the cached answer immediately to save cost and speed up response times.

---

## 6. Verification Checklist

| Area | Test Case | Target Behavior | Verified (Yes/No) |
| :--- | :--- | :--- | :--- |
| **API** | `/api/auth/onboard` | Submits assessment, saves user with Level "Beginner" to SQLite. | [ ] |
| **API** | `/api/tutor/voice` | Sends a `.wav` file, returns exact transcription + Urdu explanation. | [ ] |
| **Math** | Sinking Fund Calculator | Input: 1,000,000 PKR, 5 years, return 15%, inflation 15%. Target returns should match expected sinking fund tables. | [ ] |
| **Frontend**| Audio Recorder | Click mic, record speech, stop, audio wave file uploads to server successfully. | [ ] |
| **Frontend**| Dashboard Charts | Recharts displays line chart of nominal wealth separating from real purchasing power. | [ ] |
