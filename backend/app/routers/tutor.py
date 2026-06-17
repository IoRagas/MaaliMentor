"""
Tutor router — voice and text-based financial tutoring.

Provides REST and WebSocket endpoints for low-latency, in-memory voice/text tutoring.
"""

import json
import base64
import asyncio
from typing import Optional
from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    WebSocket,
    WebSocketDisconnect,
)
from sqlmodel import Session, select

from app.database import get_session
from app.models import ChatMessage
from app.schemas import (
    DictionaryResponse,
    TutorTextRequest,
    TutorTextResponse,
    TutorVoiceResponse,
)
from app.services.graph_rag import generate_tutor_response
from app.services.speech import (
    synthesize_speech_bytes,
    transcribe_audio,
    translate_roman_to_urdu_script,
)
from app.services.profiler import ConsoleProfiler

router = APIRouter(prefix="/api/tutor", tags=["Tutor"])


# ═══════════════════════════════════════════════════════════════
# FINANCIAL DICTIONARY (hardcoded for MVP)
# ═══════════════════════════════════════════════════════════════

FINANCIAL_DICTIONARY: dict[str, dict] = {
    "inflation": {
        "urdu_term": "افراطِ زر (Mehngai)",
        "definition": "Jab cheezon ki qeematein waqt ke saath barhti hain aur aap ke paison ki quwwat-e-khareed kam hoti jaati hai. Matlab aaj Rs.100 mein jo cheez milti hai, kal woh Rs.115 ki ho jaati hai.",
        "example": "Agar aaj 1 kg cheeni Rs.150 ki hai, aur inflation 15% hai, toh agle saal yeh Rs.172 ki ho jayegi.",
        "related_concepts": ["purchasing_power", "investing", "saving"],
    },
    "mutual_fund": {
        "urdu_term": "باهمی فنڈ (Bahami Fund)",
        "definition": "Bohut se logon ka paisa ikattha karke ek professional fund manager invest karta hai. Aap ko shares ki jagah 'units' milte hain.",
        "example": "Al-Meezan Islamic Fund mein aap Rs.5,000 se start kar sakte hain. Aap ka paisa aur logon ke saath mil kar shares aur sukuk mein lagaya jata hai.",
        "related_concepts": ["investing", "diversification", "islamic_banking"],
    },
    "budgeting": {
        "urdu_term": "بجٹ بنانا (Budget Banana)",
        "definition": "Apni amdani (income) aur kharche (expenses) ka hisaab rakhna taake aap ko pata ho paisa kahan ja raha hai.",
        "example": "50-30-20 rule: 50% zaroorat (rent, khana), 30% khwahish (shopping), 20% bachat (savings).",
        "related_concepts": ["saving", "emergency_funds"],
    },
    "saving": {
        "urdu_term": "بچت (Bachat)",
        "definition": "Apni amdani mein se kuch hissa alag rakhna — mustaqbil ke liye. Yeh paisa bank mein, committee mein, ya ghar mein ho sakta hai.",
        "example": "Har maah apni tankha ka 20% alag rakhein. Rs.50,000 ki tankha mein se Rs.10,000 bachat karein.",
        "related_concepts": ["budgeting", "emergency_funds", "inflation"],
    },
    "emergency_fund": {
        "urdu_term": "ہنگامی فنڈ (Hangami Fund)",
        "definition": "3 se 6 maah ke kharche ke barabar paisa jo sirf mushkil waqt ke liye rakha jaye — naukri chale jaaye, beemar ho jayein, ya koi aur masla ho.",
        "example": "Agar aap ka monthly kharcha Rs.40,000 hai, toh emergency fund Rs.1,20,000 se Rs.2,40,000 hona chahiye.",
        "related_concepts": ["saving", "budgeting"],
    },
    "islamic_banking": {
        "urdu_term": "اسلامی بینکنگ (Islami Banking)",
        "definition": "Shariah ke usoolon ke mutabiq banking — jismein sood (riba) nahi hota. Mudarabah, Musharakah aur Ijara jaise tareeqe istemal hote hain.",
        "example": "Meezan Bank ka Islamic savings account — aap ko profit milta hai lekin yeh sood nahi, balke halal karobaar ka munafa hai.",
        "related_concepts": ["mutual_fund", "investing", "halal_finance"],
    },
    "stock_market": {
        "urdu_term": "حصص بازار (Hissas Bazaar)",
        "definition": "Woh bazaar jahan companies ke shares (hisse) khareede aur beche jaate hain. Pakistan mein PSX (Pakistan Stock Exchange) hai.",
        "example": "Aap Lucky Cement ka 1 share Rs.800 mein khareed sakte hain. Agar company ka munafa barhe toh share ki qeemat bhi barhegi.",
        "related_concepts": ["investing", "mutual_fund", "diversification"],
    },
    "diversification": {
        "urdu_term": "تنوع (Tanawwu)",
        "definition": "Apna paisa mukhtalif jagah lagana taake risk kam ho. 'Saare ande ek tokri mein mat rakhein.'",
        "example": "Rs.1,00,000 mein se Rs.40,000 savings mein, Rs.30,000 mutual funds mein, aur Rs.30,000 gold mein lagayein.",
        "related_concepts": ["investing", "mutual_fund", "risk_management"],
    },
    "compound_interest": {
        "urdu_term": "مرکب سود / منافع (Murakkab Munafa)",
        "definition": "Jab aap ke munafe par bhi munafa milta hai. Yeh paisa ko tezi se barhane ka sabse taqatwar tareeqa hai.",
        "example": "Rs.10,000 @ 12% saalana → 1 saal baad Rs.11,200 → 2 saal baad Rs.12,544 (sirf Rs.12,400 nahi!).",
        "related_concepts": ["investing", "saving", "mutual_fund"],
    },
    "tax_filer": {
        "urdu_term": "ٹیکس فائلر (Tax Filer)",
        "definition": "Jo shakhs FBR ke paas apna income tax return file karta hai. Filer hone se bohut se faide milte hain — kam tax, kam withholding.",
        "example": "Non-filer par bank profit par 30% tax lagta hai, jabke filer par sirf 15%. Property khareedne par bhi filer ko kam tax dena parta hai.",
        "related_concepts": ["budgeting", "saving", "investing"],
    },
}


# ═══════════════════════════════════════════════════════════════
# REST ENDPOINTS
# ═══════════════════════════════════════════════════════════════

@router.post("/voice", response_model=TutorVoiceResponse)
async def voice_tutor(
    user_id: int = Form(...),
    audio: UploadFile = File(...),
    session: Session = Depends(get_session),
) -> TutorVoiceResponse:
    """Voice-based tutoring endpoint using Whisper (local) and memory logging."""
    MAX_AUDIO_SIZE = 10 * 1024 * 1024
    audio_bytes = await audio.read()
    if len(audio_bytes) > MAX_AUDIO_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Audio file exceeds the 10MB size limit.",
        )

    with ConsoleProfiler("REST /voice request handler pipeline", "tutor_api"):
        # 1 — Transcribe audio using Whisper
        transcript = await transcribe_audio(audio_bytes, mime_type=audio.content_type)

        # 2 — Log user request
        with ConsoleProfiler("DB User message log", "tutor_api"):
            user_msg = ChatMessage(user_id=user_id, sender="user", text=transcript)
            session.add(user_msg)
            session.commit()

        # 3 — Generate tutor response
        result = await generate_tutor_response(transcript, user_id, session)
        roman_urdu = result["roman_urdu"]
        urdu_script = result["urdu_script"]

        # 4 — Log tutor response
        with ConsoleProfiler("DB Tutor message log", "tutor_api"):
            tutor_msg = ChatMessage(
                user_id=user_id,
                sender="tutor",
                text=roman_urdu,
                roman_urdu=roman_urdu,
                urdu_script=urdu_script,
            )
            session.add(tutor_msg)
            session.commit()

        # 5 — Generate speech in memory (base64)
        audio_base64 = None
        try:
            speech_bytes, _ = await synthesize_speech_bytes(urdu_script)
            if speech_bytes:
                audio_base64 = base64.b64encode(speech_bytes).decode("utf-8")
        except Exception as e:
            print(f"[tutor] Speech generation error: {e}")

        return TutorVoiceResponse(
            user_transcript=transcript,
            tutor_text_response=roman_urdu,
            roman_urdu=roman_urdu,
            urdu_script=urdu_script,
            audio_response_base64=audio_base64,
            detected_concepts=result["detected_concepts"],
            next_recommended_lesson=result["next_lesson"],
        )


@router.post("/chat", response_model=TutorTextResponse)
async def text_chat(
    request: TutorTextRequest,
    session: Session = Depends(get_session),
) -> TutorTextResponse:
    """Text-based chat endpoint with memory logs and base64 audio response."""
    with ConsoleProfiler("REST /chat request handler pipeline", "tutor_api"):
        # 1 — Log user request
        with ConsoleProfiler("DB User message log", "tutor_api"):
            user_msg = ChatMessage(user_id=request.user_id, sender="user", text=request.message)
            session.add(user_msg)
            session.commit()

        # 2 — Generate tutor response
        result = await generate_tutor_response(request.message, request.user_id, session)
        roman_urdu = result["roman_urdu"]
        urdu_script = result["urdu_script"]

        # 3 — Log tutor response
        with ConsoleProfiler("DB Tutor message log", "tutor_api"):
            tutor_msg = ChatMessage(
                user_id=request.user_id,
                sender="tutor",
                text=roman_urdu,
                roman_urdu=roman_urdu,
                urdu_script=urdu_script,
            )
            session.add(tutor_msg)
            session.commit()

        # 4 — Generate audio in memory (base64)
        audio_base64 = None
        try:
            speech_bytes, _ = await synthesize_speech_bytes(urdu_script)
            if speech_bytes:
                audio_base64 = base64.b64encode(speech_bytes).decode("utf-8")
        except Exception as e:
            print(f"[tutor] Speech generation error: {e}")

        return TutorTextResponse(
            tutor_response=roman_urdu,
            roman_urdu=roman_urdu,
            urdu_script=urdu_script,
            detected_concepts=result["detected_concepts"],
            next_recommended_lesson=result["next_lesson"],
            audio_response_base64=audio_base64,
        )


@router.get("/dictionary/{term}", response_model=DictionaryResponse)
def get_dictionary_entry(term: str) -> DictionaryResponse:
    """Look up a financial term and return its Urdu definition."""
    key = term.lower().replace(" ", "_").replace("-", "_")
    entry = FINANCIAL_DICTIONARY.get(key)

    if not entry:
        raise HTTPException(
            status_code=404,
            detail=f"Term '{term}' abhi dictionary mein nahi hai. Jald add hoga!",
        )

    return DictionaryResponse(
        term=term,
        urdu_term=entry["urdu_term"],
        definition=entry["definition"],
        example=entry["example"],
        related_concepts=entry["related_concepts"],
    )


# ═══════════════════════════════════════════════════════════════
# WEBSOCKET STREAMING ENDPOINT
# ═══════════════════════════════════════════════════════════════

async def process_ws_text(text: str, user_id: int, websocket: WebSocket, session: Session):
    """Log user text query, stream typewriter tokens, and send generated TTS audio."""
    with ConsoleProfiler("WebSocket process_ws_text pipeline", "websocket"):
        # 1. Log user message
        with ConsoleProfiler("DB User log", "websocket"):
            user_msg = ChatMessage(user_id=user_id, sender="user", text=text)
            session.add(user_msg)
            session.commit()

        # 2. Generate tutor response
        result = await generate_tutor_response(text, user_id, session)
        roman_urdu = result["roman_urdu"]
        urdu_script = result["urdu_script"]
        detected_concepts = result["detected_concepts"]
        next_lesson = result["next_lesson"]

        # 3. Stream Roman Urdu text chunks for premium look & feel
        with ConsoleProfiler("Text typewriter WebSocket streaming delay", "websocket"):
            words = roman_urdu.split(" ")
            for i, word in enumerate(words):
                is_final = (i == len(words) - 1)
                await websocket.send_json({
                    "type": "text_chunk",
                    "text": word + (" " if not is_final else ""),
                    "is_final": is_final
                })
                await asyncio.sleep(0.03)

        # 4. Save tutor message to database
        with ConsoleProfiler("DB Tutor log", "websocket"):
            tutor_msg = ChatMessage(
                user_id=user_id,
                sender="tutor",
                text=roman_urdu,
                roman_urdu=roman_urdu,
                urdu_script=urdu_script,
            )
            session.add(tutor_msg)
            session.commit()

        # 5. Generate TTS in memory
        audio_base64 = None
        try:
            speech_bytes, _ = await synthesize_speech_bytes(urdu_script)
            if speech_bytes:
                audio_base64 = base64.b64encode(speech_bytes).decode("utf-8")
        except Exception as e:
            print(f"[websocket] Speech generation failed: {e}")

        # 6. Send final metadata package with audio payload
        await websocket.send_json({
            "type": "metadata",
            "roman_urdu": roman_urdu,
            "urdu_script": urdu_script,
            "audio_base64": audio_base64,
            "detected_concepts": detected_concepts,
            "next_recommended_lesson": next_lesson
        })


async def process_ws_audio(audio_bytes: bytes, user_id: int, websocket: WebSocket, session: Session):
    """Transcribe client binary audio stream and proceed with chat generation."""
    with ConsoleProfiler("WebSocket process_ws_audio pipeline", "websocket"):
        await websocket.send_json({"type": "status", "message": "Transcribing speech..."})

        # Run Speech-to-Text using Whisper service
        transcript = await transcribe_audio(audio_bytes)
        
        # Broadcast decoded transcription back to user interface
        await websocket.send_json({"type": "user_transcript", "text": transcript})
        
        # Proceed to trigger LLM response
        await process_ws_text(transcript, user_id, websocket, session)


@router.websocket("/ws")
async def tutor_websocket(
    websocket: WebSocket,
    user_id: int,
    session: Session = Depends(get_session)
):
    """
    WebSocket endpoint for real-time speech and text tutoring.
    
    Connection parameters:
        user_id: ID of the active user session.
    """
    await websocket.accept()
    audio_buffer = bytearray()
    
    try:
        while True:
            # Receive frame
            frame = await websocket.receive()
            
            if "bytes" in frame:
                # Accumulate raw microphone binary audio streams
                audio_buffer.extend(frame["bytes"])
                
            elif "text" in frame:
                payload = json.loads(frame["text"])
                msg_type = payload.get("type")
                
                if msg_type == "text_message":
                    user_text = payload.get("text", "")
                    await process_ws_text(user_text, user_id, websocket, session)
                    
                elif msg_type == "stop_speaking":
                    if audio_buffer:
                        await process_ws_audio(bytes(audio_buffer), user_id, websocket, session)
                        audio_buffer.clear()
                    else:
                        await websocket.send_json({"type": "error", "message": "Empty audio stream received."})
                        
    except WebSocketDisconnect:
        print(f"[websocket] Client session {user_id} disconnected.")
    except Exception as e:
        print(f"[websocket] Session error: {e}")
        try:
            await websocket.send_json({"type": "error", "message": str(e)})
        except Exception:
            pass
