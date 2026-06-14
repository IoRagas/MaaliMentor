# 🏆 Maali Mentor (مالی مینٹر) — Your AI-Powered Roman Urdu Financial Guide

> **"Aapka Apna Maali Masheer"** — Democratizing financial literacy for 240 million Pakistanis through voice-first AI, interactive learning maps, and real-time simulators.

---

## 💡 Inspiration

In Pakistan, formal financial literacy is critically low, hovering around **18%**. While millions of citizens actively use digital wallets like *Easypaisa*, *JazzCash*, and *Nayapay*, a vast majority do not understand the silent erosion of their money due to inflation, the difference between simple saving and active investing, or the benefits of becoming a tax filer. 

The primary barrier isn't a lack of interest—it's **accessibility**. Financial concepts are heavily gatekept behind dense English jargon or dry, text-heavy curricula that do not resonate. 

We built **Maali Mentor (مالی مینٹر)** to shatter this barrier. We wanted to create an experience that felt like chatting with a knowledgeable friend over a cup of chai. By building a **voice-first AI tutor that speaks and understands Roman Urdu** (Urdu words written in English script) alongside an interactive **financial life simulator**, we are putting personalized, jargon-free financial education directly into everyone's pocket.

---

## 🚀 What It Does

Maali Mentor is an immersive personal finance companion that guides users from absolute financial novices to advanced planners through an adaptive, game-like experience:

1. **Gamified 10-Level Ascension Roadmap**: Users explore a visually rich learning map, progressing from *Level 1: Budgeting (the 50-30-20 rule)* to *Level 10: Tax Planning & Filing in Pakistan*.
2. **Interactive Level Quizzes**: At the end of each level, users test their knowledge with 20 comprehensive Roman Urdu MCQs. Passing grading ($score \ge 15$) unlocks the next rank and awards XP points.
3. **Interactive Investment & Inflation Simulator**: A 10-turn financial life game where users balance their lifestyle spending and allocate savings across **Cash, Bank Savings (8% yield), Mutual Funds (16% yield), or Shariah-compliant Islamic Funds (14% yield)** while battling random life events (medical bills, weddings, salary raises) and a dynamic inflation rate.
4. **Roman Urdu Voice AI Tutor**: A real-time voice chat companion. Users can talk or type in Roman Urdu, receive instant context-aware voice responses, and use intuitive floating controls to play, pause, or stop the audio stream.

---

## 🛠️ How We Built It

Maali Mentor is designed as a modular, decoupled full-stack application built using:

* **Frontend**: **Next.js 16** (using React hooks and Tailwind CSS) styled with a high-fidelity glassmorphic dark theme, Nastaliq typography rendering, smooth micro-animations, and dynamic canvas graphs.
* **Backend**: **FastAPI** with **SQLModel (SQLite)** for high-throughput, structured storage of user profiles, learning progress, XP metrics, and simulator states.
* **AI Brain**: **Gemini 3.1 Flash Lite** API. We selected this model for its sub-second latency, robust multilingual understanding, and cost-effective token parameters, making it ideal for real-time mobile chat.
* **Voice Pipeline**:
  - **Speech-to-Text (STT)**: Gemini's native multimodal audio framework directly processes raw recorded user voice messages (`audio/webm`).
  - **Text-to-Speech (TTS)**: To maintain a native, warm Urdu accent rather than a robotic English voice pronouncing Urdu words, the LLM translates its Roman Urdu response to native Urdu script behind the scenes. This script is synthesized via Google Text-To-Speech (`gTTS`) in Urdu (`lang="ur"`) and played back to the user at a natural cadence ($1.2\times$ human speech speed).

---

## ⚔️ Challenges We Faced & How We Overcame Them

### 1. The Accent Gap in Roman Urdu TTS
Using typical English speech engines to read Roman Urdu text (e.g., *"mehangai"* or *"bachat"*) sounds robotic and incomprehensible. However, Urdu speech engines cannot read English letters. 
* **The Solution**: We built a fast, internal translation layer. When the AI tutor generates a response, it returns clean Roman Urdu text for the UI, but asynchronously triggers a Gemini task to output the equivalent text in native Nastaliq Urdu script. The backend feeds this Urdu script to `gTTS`, which pronounces it with a perfect native accent.

### 2. Eliminating Event Loop Blocking (Saving ~1.5 Seconds)
Early versions felt slow due to the sequential execution of transcription, response generation, Urdu translation, and voice synthesis.
* **The Solution**: We optimized the backend pipeline by using `asyncio.gather` to execute the translation task and the text-to-speech audio synthesis concurrently. We also wrapped the blocking I/O calls (like gTTS filesaving and Gemini client initialization) inside `asyncio.to_thread` to prevent thread-blocking on the main event loop, reducing overall response-to-voice latency by **over 40%**.

### 3. Visual Layout Scaling on Small Screens
During initial tests on mobile devices (e.g. 375px wide), text wrapped awkwardly and layout borders conflicted with padding boundaries.
* **The Solution**: We refactored typography sizes using responsive fluid scale bounds (e.g. changing `text-5xl md:text-8xl` to `text-4xl sm:text-6xl md:text-7xl lg:text-8xl`), configured our Tailwind compiler to scan all components directories explicitly, and safely removed custom universal style resets, letting Tailwind's Preflight layout engine render beautiful padding.

---

## 📈 Mathematics of Wealth (LaTeX Support)

Maali Mentor makes mathematical modeling transparent and accessible by displaying clear equations dynamically on screen:

### 1. Real Rate of Return
To teach users that a nominal bank yield is not their actual purchasing power gain, we display the inflation adjustment:
\[R_{\text{real}} = \frac{1 + R_{\text{nominal}}}{1 + I_{\text{inflation}}} - 1\]

### 2. The Rule of 72 (Doubling Time)
To encourage compound interest habits, we present the approximate doubling duration equation:
\[T_{\text{double}} \approx \frac{72}{R_{\text{annual}}}\]

---

## 🏆 Accomplishments We're Proud Of

* **Sub-Millisecond Caching Engine**: Built a smart cache mapper for common beginner questions (e.g., *"mutual funds kiya hai"*, *"saving vs investing"*), bypassing LLM calls entirely to deliver instant, pre-loaded audio guides.
* **Dual-Mode Quiz Engine**: Developed a robust grading system that automatically switches to a lightweight frontend local engine (`/quiz_data.json` and `localStorage` tracking) if the backend API is unreachable, ensuring zero learning interruptions.
* **Clean & Secure Input Sanitization**: Implemented strict Pydantic regex sanitizers on usernames (`^[a-zA-Z0-9_\s\-]+$`), quiz options, and file upload size caps (10MB max limits on `/voice` endpoint) to guard against injection or DDoS.

---

## 🧠 What We Learned

* **Adaptive TTS Formatting**: Synthesized audio engines will literally read out Markdown symbols like asterisks (`*`) or hash signs (`#`). We learned to create custom parser regexes to sanitize text streams before feeding them to speech synthesizers.
* **Multimodal Context Window Management**: Running STT and conversation inside the same LLM window requires careful system prompting to ensure the model distinguishes between audio transcription instructions and chat history.
* **Shariah-compliant Retail Structures**: Structuring Level 7 required deep research into Islamic banking contracts such as *Mudarabah* (profit-sharing) and *Murabahah* (cost-plus markup).

---

## 🔮 What's Next for Maali Mentor

* **WhatsApp Business Integration**: Porting the voice agent directly to a WhatsApp chatbot, enabling users to send voice notes and receive audio messages on the platform they use daily.
* **SMS-based Offline Quizzes**: Allowing users without internet connectivity to complete level quizzes and receive lessons via basic SMS strings.
* **Digital Wallet Integration**: Partnering with local fintech applications to let users practice mock investments using their real-world wallets in a sandboxed learning environment.
