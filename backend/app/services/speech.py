"""
Speech services using:
1. Local Whisper (ASR) via transformers pipeline, with Gemini fallback for Audio Transcription (STT).
2. ElevenLabs API and gTTS (Google Text-to-Speech) for text-to-speech (TTS) bytes synthesis.

Avoids saving audio files to disk by generating bytes in-memory.
"""

import asyncio
import os
import io
import uuid
import tempfile
from pathlib import Path
from typing import Optional, Tuple
from app.config import settings

# Directory where generated audio files are stored (kept for legacy support)
AUDIO_DIR = Path(__file__).resolve().parent.parent.parent / "static" / "audio"
AUDIO_DIR.mkdir(parents=True, exist_ok=True)

# Cache singletons
_genai = None
_gemini_model = None
_whisper_pipeline = None

def _get_gemini_model():
    """Lazy-initialize and cache the Gemini model singleton."""
    global _genai, _gemini_model
    if _gemini_model is None:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        _genai = genai
        _gemini_model = genai.GenerativeModel(settings.GEMINI_MODEL_NAME)
    return _gemini_model, _genai


def _get_whisper_pipeline():
    """Lazy-initialize and cache the local Whisper pipeline singleton."""
    global _whisper_pipeline
    if _whisper_pipeline is None:
        from app.services.profiler import ConsoleProfiler
        with ConsoleProfiler("Loading local Whisper model", "speech"):
            from transformers import pipeline
            import torch
            device = "cuda" if torch.cuda.is_available() else "cpu"
            torch_dtype = torch.float16 if device == "cuda" else torch.float32
            print(f"[speech] Loading local Whisper model on {device}...")
            _whisper_pipeline = pipeline(
                "automatic-speech-recognition",
                model="openai/whisper-tiny",
                dtype=torch_dtype,
                device=device
            )
            print("[speech] Local Whisper model loaded successfully.")
    return _whisper_pipeline


async def transcribe_audio(audio_bytes: bytes, mime_type: str = "audio/wav") -> str:
    """
    Convert speech audio to text using local Whisper ASR or fall back to Gemini.
    """
    from app.services.profiler import ConsoleProfiler
    
    with ConsoleProfiler("transcribe_audio pipeline", "speech"):
        if settings.USE_MOCK_SPEECH:
            return "Mujhe batayein ke saving aur investing mein kya farq hai?"

        # Try local Whisper first
        try:
            ext = ".wav"
            if mime_type:
                clean_mime = mime_type.lower()
                if "webm" in clean_mime:
                    ext = ".webm"
                elif "mp4" in clean_mime:
                    ext = ".mp4"
                elif "ogg" in clean_mime:
                    ext = ".ogg"
                elif "mp3" in clean_mime:
                    ext = ".mp3"

            # Write audio bytes to a temporary file for the transformers pipeline to read
            with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as temp_file:
                temp_file.write(audio_bytes)
                temp_path = temp_file.name

            try:
                def _run_whisper():
                    pipe = _get_whisper_pipeline()
                    with ConsoleProfiler("Whisper Model Inference Execution", "speech"):
                        result = pipe(temp_path, generate_kwargs={"task": "transcribe"})
                        return result["text"].strip()

                transcription = await asyncio.to_thread(_run_whisper)
                return transcription
            finally:
                if os.path.exists(temp_path):
                    os.remove(temp_path)

        except Exception as exc:
            print(f"[speech] Local Whisper transcription failed: {exc}. Falling back to Gemini.")
            return await transcribe_audio_gemini(audio_bytes, mime_type)


async def transcribe_audio_gemini(audio_bytes: bytes, mime_type: str = "audio/wav") -> str:
    """Gemini-based speech-to-text fallback."""
    from app.services.profiler import ConsoleProfiler
    
    with ConsoleProfiler("Gemini Audio STT Fallback API Call", "speech"):
        try:
            model, genai = _get_gemini_model()
            clean_mime_type = mime_type.split(";")[0] if mime_type else "audio/wav"

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
                    temperature=0.0
                )
            )

            transcription = response.text.strip() if response.text else ""
            if not transcription:
                raise ValueError("Empty response from Gemini")
                
            return transcription

        except Exception as exc:
            print(f"[speech] Gemini transcription error: {exc}")
            return "Transcription unavailable — please type your question."


async def synthesize_speech_bytes(text: str) -> Tuple[bytes, str]:
    """
    Convert text to speech audio using ElevenLabs or gTTS in-memory.
    Returns:
        (audio_bytes, mime_type)
    """
    from app.services.profiler import ConsoleProfiler
    
    with ConsoleProfiler("synthesize_speech_bytes pipeline", "speech"):
        if settings.USE_MOCK_SPEECH:
            return b"\x00" * 100, "audio/mpeg"

        # Try ElevenLabs first if key is configured
        if settings.ELEVENLABS_API_KEY:
            with ConsoleProfiler("ElevenLabs API Synthesis Call", "speech"):
                try:
                    import httpx
                    voice_id = settings.ELEVENLABS_VOICE_ID
                    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
                    headers = {
                        "xi-api-key": settings.ELEVENLABS_API_KEY,
                        "Content-Type": "application/json"
                    }
                    data = {
                        "text": text,
                        "model_id": "eleven_multilingual_v2",
                        "voice_settings": {
                            "stability": 0.5,
                            "similarity_boost": 0.75
                        }
                    }
                    async with httpx.AsyncClient() as client:
                        response = await client.post(url, json=data, headers=headers, timeout=20.0)
                        if response.status_code == 200:
                            return response.content, "audio/mpeg"
                        else:
                            print(f"[speech] ElevenLabs API error {response.status_code}: {response.text}")
                except Exception as e:
                    print(f"[speech] ElevenLabs synthesis failed: {e}. Falling back to gTTS.")

        # Try Edge-TTS second (Free Azure Neural voice, high quality, no keys required)
        try:
            import edge_tts
            with ConsoleProfiler("Edge-TTS Azure Neural Synthesis Call", "speech"):
                is_urdu_script = any(ord(char) > 127 for char in text)
                # We use ur-PK-UzmaNeural which is a natural-sounding female Urdu reader
                voice = "ur-PK-UzmaNeural" if is_urdu_script else "en-US-AvaNeural"
                
                async def _run_edge_tts():
                    communicate = edge_tts.Communicate(text, voice)
                    data = b""
                    async for chunk in communicate.stream():
                        if chunk["type"] == "audio":
                            data += chunk["data"]
                    return data
                    
                speech_data = await _run_edge_tts()
                if len(speech_data) > 200:
                    return speech_data, "audio/mpeg"
                else:
                    print("[speech] Edge-TTS output too small, falling back to legacy gTTS.")
        except Exception as e:
            print(f"[speech] Edge-TTS synthesis failed: {e}. Falling back to legacy gTTS.")

        # Fallback to gTTS
        with ConsoleProfiler("gTTS public API fallback Synthesis Call", "speech"):
            try:
                from gtts import gTTS
                is_urdu_script = any(ord(char) > 127 for char in text)
                tts_lang = "ur" if is_urdu_script else "en"

                def _run_gtts():
                    tts = gTTS(text=text, lang=tts_lang, slow=False)
                    fp = io.BytesIO()
                    tts.write_to_fp(fp)
                    fp.seek(0)
                    return fp.read()

                audio_bytes = await asyncio.to_thread(_run_gtts)
                return audio_bytes, "audio/mpeg"

            except Exception as exc:
                print(f"[speech] gTTS Speech synthesis error: {exc}")
                return b"\x00" * 100, "audio/mpeg"


async def synthesize_speech(text: str) -> str:
    """Legacy wrapper that saves generated audio to disk and returns static URL."""
    try:
        audio_bytes, _ = await synthesize_speech_bytes(text)
        filename = f"tts_{uuid.uuid4().hex}.mp3"
        file_path = AUDIO_DIR / filename

        import aiofiles
        async with aiofiles.open(file_path, "wb") as f:
            await f.write(audio_bytes)

        return f"/static/audio/{filename}"

    except Exception as exc:
        print(f"[speech] Legacy gTTS file write error: {exc}")
        return "/static/audio/mock_response.mp3"


async def translate_roman_to_urdu_script(roman_urdu_text: str) -> str:
    """
    Translate Roman Urdu text to native Urdu script using Gemini.
    (Kept for legacy support; newer pipelines request both simultaneously).
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


def warmup_speech_models() -> None:
    """Pre-load local Whisper pipeline to prevent first-query cold start delay."""
    if settings.USE_MOCK_SPEECH:
        return
    try:
        _get_whisper_pipeline()
    except Exception as e:
        print(f"[speech] Warmup failed: {e}")
