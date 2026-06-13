"""
Speech services using Gemini Generative AI for Audio Transcription (STT) 
and gTTS (Google Text-to-Speech) for Urdu Speech Synthesis.

When USE_MOCK_SPEECH is True, returns hardcoded responses so the app
runs without external API keys during development.
"""

import os
import uuid
from pathlib import Path
from app.config import settings

# Directory where generated audio files are stored
AUDIO_DIR = Path(__file__).resolve().parent.parent.parent / "static" / "audio"
AUDIO_DIR.mkdir(parents=True, exist_ok=True)


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
        import google.generativeai as genai

        # Configure Gemini
        genai.configure(api_key=settings.GEMINI_API_KEY)
        
        # We use gemini-2.5-flash as it excels at multimodal audio transcription and has active quota
        model = genai.GenerativeModel("gemini-2.5-flash")
        
        # Normalise mime_type (sometimes browsers send 'audio/webm;codecs=opus')
        clean_mime_type = mime_type.split(";")[0] if mime_type else "audio/wav"

        # Call Gemini passing the raw audio data directly
        response = model.generate_content([
            "Aap ek financial assistant hain. Transcribe this Urdu speech audio file to text. "
            "Respond with ONLY the exact transcription in Urdu script or Roman Urdu depending on how it was spoken. "
            "Do not add any additional explanation, greeting, or translation.",
            {
                "mime_type": clean_mime_type,
                "data": audio_bytes
            }
        ])

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
        tts.save(str(file_path))

        return f"/static/audio/{filename}"

    except Exception as exc:
        print(f"[speech] gTTS Speech synthesis error: {exc}")
        return "/static/audio/mock_response.mp3"
