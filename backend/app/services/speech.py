"""
Speech services using Gemini Generative AI for Audio Transcription (STT) 
and gTTS (Google Text-to-Speech) for Urdu Speech Synthesis.

When USE_MOCK_SPEECH is True, returns hardcoded responses so the app
runs without external API keys during development.

Performance: Gemini client is configured once at module level to avoid
repeated API key configuration overhead on every call.
"""

import asyncio
import os
import uuid
from pathlib import Path
from app.config import settings

# Directory where generated audio files are stored
AUDIO_DIR = Path(__file__).resolve().parent.parent.parent / "static" / "audio"
AUDIO_DIR.mkdir(parents=True, exist_ok=True)

# ── Configure Gemini ONCE at module level ────────────────────
# Avoids re-importing and re-configuring on every request
_genai = None
_gemini_model = None

def _get_gemini_model():
    """Lazy-initialize and cache the Gemini model singleton."""
    global _genai, _gemini_model
    if _gemini_model is None:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        _genai = genai
        _gemini_model = genai.GenerativeModel(settings.GEMINI_MODEL_NAME)
    return _gemini_model, _genai


async def transcribe_audio(audio_bytes: bytes, mime_type: str = "audio/wav") -> str:
    """
    Convert speech audio to text using Gemini native audio understanding.

    Args:
        audio_bytes: Raw audio bytes (WAV / WebM / MP3).
        mime_type: The browser's recorded mime type (e.g. audio/webm).

    Returns:
        Transcribed text string.
    """
    if settings.USE_MOCK_SPEECH:
        return "Mujhe batayein ke saving aur investing mein kya farq hai?"

    try:
        model, genai = _get_gemini_model()
        
        # Normalise mime_type (sometimes browsers send 'audio/webm;codecs=opus')
        clean_mime_type = mime_type.split(";")[0] if mime_type else "audio/wav"

        # Run the blocking Gemini call in a thread to not block the event loop
        response = await asyncio.to_thread(
            model.generate_content,
            [
                "Aap ek financial assistant hain. Transcribe this Urdu speech audio file to text. "
                "Respond with ONLY the exact transcription in Urdu script or Roman Urdu depending on how it was spoken. "
                "Do not add any additional explanation, greeting, or translation.",
                {
                    "mime_type": clean_mime_type,
                    "data": audio_bytes
                }
            ],
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=150,
                temperature=0.0  # 0.0 temperature makes transcription faster and deterministic
            )
        )

        transcription = response.text.strip() if response.text else ""
        if not transcription:
            raise ValueError("Empty response from Gemini")
            
        return transcription

    except Exception as exc:
        print(f"[speech] Gemini transcription error: {exc}")
        return "Transcription unavailable — please type your question."


async def synthesize_speech(text: str) -> str:
    """
    Convert text to speech audio using gTTS and return a URL path.

    Args:
        text: Urdu / Roman-Urdu text to speak.

    Returns:
        Relative URL path suitable for the /static mount, e.g.
        ``/static/audio/abc123.mp3``.
    """
    if settings.USE_MOCK_SPEECH:
        return "/static/audio/mock_response.mp3"

    try:
        from gtts import gTTS

        filename = f"tts_{uuid.uuid4().hex}.mp3"
        file_path = AUDIO_DIR / filename

        # gTTS generates clean Urdu audio natively by setting lang="ur"
        # Since Roman Urdu might not read well with Urdu lang voice, we detect script
        # or use urdu voice which reads Urdu script beautifully.
        # If text is written in English script (Roman Urdu), we fall back to standard English 'en' voice or 'ur'
        # Urdu voice reads Urdu script best.
        is_urdu_script = any(ord(char) > 127 for char in text)
        tts_lang = "ur" if is_urdu_script else "en"

        tts = gTTS(text=text, lang=tts_lang, slow=False)

        # Run blocking file I/O + network call in a thread to not block the event loop
        await asyncio.to_thread(tts.save, str(file_path))

        return f"/static/audio/{filename}"

    except Exception as exc:
        print(f"[speech] gTTS Speech synthesis error: {exc}")
        return "/static/audio/mock_response.mp3"


async def translate_roman_to_urdu_script(roman_urdu_text: str) -> str:
    """
    Translate Roman Urdu text to native Urdu script using Gemini for native voice synthesis.
    """
    if settings.USE_MOCK_SPEECH:
        return "بچت اور سرمایہ کاری میں بہت فرق ہے۔"

    try:
        model, genai = _get_gemini_model()
        
        prompt = (
            "Aap ek assistant hain. Is Roman Urdu text ko saaf aur sahi Urdu script (Urdu characters/Nastaliq) mein convert/translate karein. "
            "Respond with ONLY the exact translated Urdu script text. Do not add any greeting, explanation, notes, or english letters.\n\n"
            f"Text: {roman_urdu_text}"
        )
        
        # Run the blocking Gemini call in a thread
        response = await asyncio.to_thread(
            model.generate_content,
            prompt,
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=400,
                temperature=0.0
            )
        )
        return response.text.strip() if response.text else roman_urdu_text
    except Exception as e:
        print(f"[speech] Error translating Roman Urdu to Urdu script: {e}")
        return roman_urdu_text
