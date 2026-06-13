"""
Graph-based Retrieval-Augmented Generation (Graph-RAG) for the tutor.

Maintains a prerequisite graph of financial concepts and uses it to:
1. Check if a user is ready to learn a new concept.
2. Recommend the next concept based on current mastery.
3. Build context-aware system prompts for the LLM tutor.
4. Generate tutor responses (mock or OpenAI).
"""

from pathlib import Path
from typing import Optional

import networkx as nx
from sqlmodel import Session, select

from app.config import settings
from app.models import ConceptMastery

# ═══════════════════════════════════════════════════════════════
# CONCEPT PREREQUISITE GRAPH
# ═══════════════════════════════════════════════════════════════

CONCEPT_GRAPH = nx.DiGraph()

# Nodes represent financial concepts the learner progresses through
CONCEPT_GRAPH.add_edges_from([
    ("budgeting", "saving"),
    ("saving", "emergency_funds"),
    ("saving", "inflation"),
    ("inflation", "investing"),
    ("investing", "mutual_funds"),
    ("mutual_funds", "islamic_banking"),
    ("mutual_funds", "stock_market"),
    ("investing", "diversification"),
])

# All concepts in topological order (useful for sequencing)
ALL_CONCEPTS: list[str] = list(nx.topological_sort(CONCEPT_GRAPH))

# Mastery threshold — a concept is "mastered" at ≥ 60 %
MASTERY_THRESHOLD = 60

# ── Knowledge-base directory ─────────────────────────────────
KB_DIR = Path(__file__).resolve().parent.parent / "knowledge_base"


# ═══════════════════════════════════════════════════════════════
# GRAPH QUERIES
# ═══════════════════════════════════════════════════════════════

def get_prerequisites(concept: str) -> list[str]:
    """Return all *direct* prerequisite concepts for `concept`."""
    if concept not in CONCEPT_GRAPH:
        return []
    return list(CONCEPT_GRAPH.predecessors(concept))


def check_readiness(user_id: int, target_concept: str, session: Session) -> dict:
    """
    Check whether a user has mastered all prerequisites for a concept.

    Returns:
        {
            "ready": bool,
            "missing_concepts": ["concept_a", ...]
        }
    """
    prereqs = get_prerequisites(target_concept)
    if not prereqs:
        return {"ready": True, "missing_concepts": []}

    statement = select(ConceptMastery).where(
        ConceptMastery.user_id == user_id,
        ConceptMastery.concept_name.in_(prereqs),  # type: ignore[union-attr]
    )
    mastery_records = session.exec(statement).all()
    mastered = {r.concept_name for r in mastery_records if r.mastery_score >= MASTERY_THRESHOLD}

    missing = [p for p in prereqs if p not in mastered]
    return {"ready": len(missing) == 0, "missing_concepts": missing}


def get_next_recommended(user_id: int, session: Session) -> str:
    """
    Recommend the next concept the user should study.

    Strategy: walk the topological order and return the first concept
    whose prerequisites are met but whose own mastery is below threshold.
    Falls back to the first concept if nothing is found.
    """
    statement = select(ConceptMastery).where(ConceptMastery.user_id == user_id)
    records = session.exec(statement).all()
    scores = {r.concept_name: r.mastery_score for r in records}

    for concept in ALL_CONCEPTS:
        own_score = scores.get(concept, 0)
        if own_score >= MASTERY_THRESHOLD:
            continue  # already mastered
        readiness = check_readiness(user_id, concept, session)
        if readiness["ready"]:
            return concept

    # Everything mastered — suggest the most advanced topic for review
    return ALL_CONCEPTS[-1]


# ═══════════════════════════════════════════════════════════════
# KNOWLEDGE-BASE LOADER
# ═══════════════════════════════════════════════════════════════

def _load_knowledge_context(concept: str) -> str:
    """Load relevant markdown knowledge-base content for RAG context."""
    # Map concepts to knowledge-base files
    concept_kb_map: dict[str, str] = {
        "islamic_banking": "islamic_banking_pakistan.md",
        "mutual_funds": "mutual_funds_secp.md",
        "investing": "mutual_funds_secp.md",
        "saving": "national_savings_certificates.md",
        "emergency_funds": "national_savings_certificates.md",
        "stock_market": "mutual_funds_secp.md",
        "diversification": "mutual_funds_secp.md",
        "budgeting": "tax_filer_system.md",
        "inflation": "national_savings_certificates.md",
    }
    filename = concept_kb_map.get(concept)
    if not filename:
        return ""
    kb_path = KB_DIR / filename
    if kb_path.exists():
        return kb_path.read_text(encoding="utf-8")[:3000]  # truncate for context window
    return ""


# ═══════════════════════════════════════════════════════════════
# SYSTEM PROMPT
# ═══════════════════════════════════════════════════════════════

def get_tutor_system_prompt(context: str = "") -> str:
    """
    Build the LLM system prompt for the Maali Mentor tutor persona.

    Args:
        context: Optional RAG context (knowledge-base text) to inject.
    """
    base_prompt = (
        "Aap 'Maali Mentor' hain — ek dost-anaas, mahir Urdu financial literacy tutor.\n\n"
        "RULES:\n"
        "1. ALWAYS respond in Roman Urdu (Urdu words written in English script).\n"
        "2. Use respectful 'Aap' pronouns — never 'Tum' or 'Tu'.\n"
        "3. Explain financial concepts using Pakistani everyday analogies "
        "(chai ki dukaan, sabzi mandi, rickshaw driver, school fees).\n"
        "4. Keep responses concise — 3 to 4 short paragraphs maximum.\n"
        "5. If mentioning numbers, use Pakistani Rupee (PKR / Rs.).\n"
        "6. Encourage the learner and celebrate small wins.\n"
        "7. If the user asks about a concept they are not ready for, gently redirect "
        "them to the prerequisite concept first.\n"
        "8. NEVER GIVE SPECIFIC INVESTMENT ADVICE: Do not tell the user to buy specific stocks, cryptocurrencies, or assets. "
        "Always redirect to general principles and state: 'apne financial advisor se zaroor mashwara karein'.\n"
        "9. STRICTLY DECLINE INVALID / OFF-TOPIC REQUESTS: If the user asks about topics unrelated to finance, budgeting, "
        "saving, investing, taxation, or financial/economic education, gently but firmly decline to answer. "
        "For example, if asked about recipes, writing code, sports, history, or gossip, reply in Roman Urdu: "
        "'Maaf kijiyega, main aapka Maali Mentor hoon aur main sirf personal finance, bachat, aur sarmayakari ke sawalaat ke jawaabaat de sakta hoon. Chalein, bachat ke baare mein baat karte hain!'\n"
    )

    if context:
        base_prompt += (
            "\n--- REFERENCE MATERIAL (use this to ground your answer) ---\n"
            f"{context}\n"
            "--- END REFERENCE MATERIAL ---\n"
        )

    return base_prompt


# ═══════════════════════════════════════════════════════════════
# CONCEPT DETECTION (simple keyword matching for MVP)
# ═══════════════════════════════════════════════════════════════

# Keywords that signal a concept is being discussed
_CONCEPT_KEYWORDS: dict[str, list[str]] = {
    "budgeting": ["budget", "kharcha", "expenses", "income", "amdani"],
    "saving": ["saving", "bachat", "paisa jama", "savings account"],
    "emergency_funds": ["emergency", "emergency fund", "mushkil waqt"],
    "inflation": ["inflation", "mehngai", "qeemat", "price rise"],
    "investing": ["invest", "sarmaya kari", "paisa lagana", "return"],
    "mutual_funds": ["mutual fund", "fund", "amc", "nav"],
    "islamic_banking": ["islamic", "halal", "mudarabah", "musharakah", "riba"],
    "stock_market": ["stock", "share", "psx", "market"],
    "diversification": ["diversif", "risk spread", "mukhtalif"],
}


def _detect_concepts(text: str) -> list[str]:
    """Return concepts mentioned in a text string."""
    text_lower = text.lower()
    found: list[str] = []
    for concept, keywords in _CONCEPT_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            found.append(concept)
    return found


# ═══════════════════════════════════════════════════════════════
# TUTOR RESPONSE GENERATION
# ═══════════════════════════════════════════════════════════════

async def generate_tutor_response(
    user_message: str,
    user_id: int,
    session: Session,
) -> dict:
    """
    Generate a tutor response for the user's message.

    Returns:
        {
            "response": str,
            "detected_concepts": [str, ...],
            "next_lesson": str,
        }
    """
    detected = _detect_concepts(user_message)
    next_lesson = get_next_recommended(user_id, session)

    # Load RAG context for the most relevant detected concept (or next lesson)
    rag_concept = detected[0] if detected else next_lesson
    kb_context = _load_knowledge_context(rag_concept)

    if settings.USE_MOCK_LLM:
        mock_response = (
            "Assalam-o-Alaikum! Bahut acha sawal hai aap ka. "
            "Dekhein, saving aur investing mein farq yeh hai ke saving mein "
            "aap apna paisa mehfooz rakhte hain — jaise bank mein ya ghar mein. "
            "Lekin investing mein aap apna paisa kisi kaam mein lagate hain "
            "taake woh barh sake, jaise mutual funds ya shares mein.\n\n"
            "Soochiye aise ke saving ek matka hai jismein aap paani jama karte hain. "
            "Investing ek khet hai jahan aap beej bote hain aur fasal aati hai. "
            "Lekin khet mein risk bhi hota hai — kabhi fasal achi aati hai, kabhi nahi.\n\n"
            "Aap ke liye meri salah yeh hai ke pehle 3 mahine ka emergency fund "
            "saving mein rakkhein, phir investing ke baare mein sochein. "
            "Apne financial advisor se zaroor mashwara karein!"
        )
        return {
            "response": mock_response,
            "detected_concepts": detected,
            "next_lesson": next_lesson,
        }

    # ── Real: Gemini Chat Completion ─────────────────────────
    try:
        import google.generativeai as genai

        genai.configure(api_key=settings.GEMINI_API_KEY)

        system_prompt = get_tutor_system_prompt(context=kb_context)

        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            system_instruction=system_prompt,
        )

        response = model.generate_content(
            user_message,
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=600,
                temperature=0.7,
            )
        )

        response_text = response.text or ""
        # Re-detect concepts from the LLM response to augment user-side detection
        all_detected = list(set(detected + _detect_concepts(response_text)))

        return {
            "response": response_text,
            "detected_concepts": all_detected,
            "next_lesson": next_lesson,
        }

    except Exception as exc:
        print(f"[graph_rag] Gemini LLM error: {exc}")
        return {
            "response": "Maaf kijiye, is waqt jawaab dene mein mushkil ho rahi hai. Thodi der baad dobara koshish karein.",
            "detected_concepts": detected,
            "next_lesson": next_lesson,
        }
