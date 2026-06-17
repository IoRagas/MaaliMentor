# 🎬 Maali Mentor — Demo Video Script
**Target Duration**: 2:45 – 3:00 minutes  
**Format**: Screen recording with voiceover narration  
**Tone**: Conversational, confident, slightly informal — like pitching to a friend

---

## 🎤 Pre-Recording Checklist
- [ ] Backend running (`uvicorn app.main:app --reload`)
- [ ] Frontend running (`npm run dev` → `localhost:3000`)
- [ ] Browser: Chrome, clean tab, no bookmarks bar
- [ ] Mic quality check — record a test sentence
- [ ] Clear any old user data (fresh onboarding experience)
- [ ] Keep browser zoom at 90-100% so the full UI is visible

---

## SCENE 1 — The Problem *(0:00 – 0:25)*

| Screen | Narration |
|--------|-----------|
| **Black screen** with text fading in: *"More than 4 out of 5 adults lack basic financial literacy"* | *"In Pakistan, more than four out of five adults lack basic financial literacy."* |
| Fade to: **Google search results** showing "financial literacy Pakistan statistics" or a relevant news headline screenshot | *"Millions use digital wallets like Easypaisa and JazzCash every day — but most don't understand inflation, investing, or even how to budget properly."* |
| Fade to: **Landing page of Maali Mentor** (hero section visible with the glowing orb) | *"The information that does exist? It's either in English, full of jargon, or locked behind expensive courses. We thought — what if learning finance felt like chatting with a friend… in your own language?"* |

> **TIP**: Keep this section **punchy and fast**. Don't linger — the audience should feel the urgency.

---

## SCENE 2 — The Solution *(0:25 – 0:55)*

| Screen | Narration |
|--------|-----------|
| **Scroll down the landing page** slowly — show the feature cards, the chat mockup, the timeline | *"This is Maali Mentor — مالی مینٹر. A voice-first AI tutor that teaches personal finance in Roman Urdu — the way Pakistanis actually talk."* |
| **Click "Shuru Karein"** (Get Started) button → transition to **Onboarding page** | *"Users start by telling us their name and taking a quick 5-question assessment. This helps our AI understand where they're starting from."* |
| **Type a name** (e.g., "Ahmed") → **answer 2-3 quiz questions quickly** (don't show all 5, keep it snappy) | *"Based on their answers, we place them at the right level — no one starts too easy or too hard."* |
| **Onboarding completes** → lands on **Dashboard** | *"And just like that — they're in."* |

---

## SCENE 3 — The Dashboard & Learning Path *(0:45 – 1:05)*

| Screen | Narration |
|--------|-----------|
| **Dashboard overview** — show the welcome banner, XP stats, level indicator | *"The dashboard shows your current level, XP progress, and a visual learning roadmap."* |
| **Scroll to the Learning Flow Graph** — hover over a few nodes to show locked/unlocked states | *"We've designed a 10-level curriculum — from Budgeting basics all the way up to Tax Planning and Filing. Each level unlocks as you progress, and the last three levels are strictly sequential."* |
| **Click on an unlocked node** (e.g., "Budgeting") → navigates to **Study Page** | *"Clicking a topic opens a detailed study guide — written entirely in Roman Urdu with real Pakistani examples, actual numbers, and formulas that matter."* |
| **Briefly scroll the study page** — show bullet points | *"From here, you can see key notes and formulas before you practice or take the quiz."* |

---

## SCENE 4 — Investment & Inflation Simulator *(1:05 – 1:30)*

| Screen | Narration |
|--------|-----------|
| **Click "Simulator"** in the sidebar → transition to the **Simulator page** | *"Next, we have our interactive Investment and Inflation Simulator."* |
| **Show the starting state** (Age 25, 50k wealth, 15% inflation rate). Adjust the spending slider and select "Mutual Funds" (16% return). | *"Users start at age 25 with 50,000 rupees and a salary, facing a dynamic inflation rate. They choose how to save — cash, savings accounts, or mutual funds — and control their lifestyle spending."* |
| **Click "Advance 1 Year"** → show the graph lines updating (Nominal vs. Real Wealth) and show a Toast event triggering (e.g., "Salary Raise!"). | *"As they advance through 10 years, they experience random life events like salary raises or medical emergencies, visually seeing how inflation eats their cash purchasing power compared to investing."* |

---

## SCENE 5 — Voice AI Tutor (KEY FEATURE) *(1:30 – 2:15)*

| Screen | Narration |
|--------|-----------|
| **Click "Tutor"** in the sidebar (or "Ask AI Tutor" from study page) → lands on **Tutor Chat page** | *"This is the heart of Maali Mentor — the AI voice tutor."* |
| **Wait for the AI response** to appear in the chat bubble | *"It responds in clean Roman Urdu — no jargon, no English-heavy explanations. Just simple, relatable language."* |
| **Audio plays automatically** — let the Urdu voice speak for 3-4 seconds, then lower the volume slightly while you continue narrating | *"And here's the magic — listen to that. That's native Urdu speech. Behind the scenes, our backend translates the Roman Urdu response into Urdu script and then synthesizes it with a native Urdu voice. The user reads Roman Urdu on screen, but hears proper Urdu pronunciation."* |
| **Click the microphone button** → **record a short voice question** in Roman Urdu (e.g., *"Inflation kya hota hai?"*) | *"Users can also ask questions by voice. I'll ask — Inflation kya hota hai?"* |
| **Voice gets transcribed** → AI responds with explanation + audio plays | *"Gemini transcribes the audio, processes the question through our Graph-RAG knowledge engine, and responds — both in text and voice. All in a few seconds."* |
| **Optionally type a follow-up** in the text box (e.g., *"iska asar savings par kya hoga?"*) | *"You can also just type. The tutor keeps context and builds on the conversation naturally."* |

> **IMPORTANT**: This is the **most important scene**. Let the AI voice play clearly for the audience. Pause your narration while the Urdu speech plays so viewers can hear it.

---

## SCENE 6 — Quiz & Level Progression *(2:15 – 2:40)*

| Screen | Narration |
|--------|-----------|
| **Navigate to Quiz** (click "Take Level Quiz" from study page, or go to `/quiz` to select a level) | *"When you're ready, take the level quiz — 20 multiple-choice questions, all in Roman Urdu."* |
| **Answer 3-4 questions quickly** (click through fast, don't read each one) | *"You need at least 15 out of 20 to pass and level up."* |
| **Skip to results screen** (or quickly finish) — show the pass/fail result with score | *"Pass — and you earn XP, unlock the next level, and move forward on the roadmap."* |
| **Show the expandable explanation panel** for one question — click to reveal | *"Every question comes with a detailed explanation, so even wrong answers become learning moments."* |

---

## SCENE 7 — Closing *(2:40 – 3:00)*

| Screen | Narration |
|--------|-----------|
| **Go back to Dashboard** — show the updated level/XP | *"Maali Mentor is built with Next.js, FastAPI, and Google's Gemini 3.1 Flash Lite — entirely free-tier friendly."* |
| **Landing page hero section** (or a closing title card you prepare) | *"Our goal is simple: to make financial literacy not a privilege for the few, but a civic superpower in the hands of every household. Let’s build a financially inclusive Pakistan, together."* |
| **Fade to black** with text: **"Maali Mentor — مالی مینٹر"** and your team name | *"This is Maali Mentor. Aapka apna maali masheer."* *(Your own financial advisor.)* |

---

## 📝 Recording Tips

> **Pacing**: Speak at a natural, relaxed pace. Don't rush. Silence between sections is okay — it makes cuts easier in editing.

> **Mouse Movement**: Move the cursor slowly and deliberately. Avoid rapid clicking. Hover over elements you want the viewer to notice.

> **Audio Balance**: When the Urdu AI voice plays, pause your narration and let it be heard for 3-4 seconds. This is a wow moment — don't talk over it.

> **Editing**: Record the full flow in one take if possible. Use jump-cuts to trim waiting time (e.g., while the AI is loading a response). Add subtle background music (lo-fi or ambient) at ~10% volume.
