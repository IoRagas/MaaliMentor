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
        "10. PROVIDE COMPREHENSIVE EXPLANATIONS: Aap ka bunyadi maqsad user ke financial sawalaat ka mukammal, wazeh aur detailed jawab dena hai. Sirf sawal ki tareef (acknowledgement) na karein, balkay us ke peeche chupay financial concepts ko detail mein define karein, aam misal (analogy) dein aur aasan zaban mein samjhein taake user seekh sake.\n"
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
# TUTOR RESPONSE CACHE (For ultra-fast demo video responses)
# ═══════════════════════════════════════════════════════════════

_TUTOR_RESPONSE_CACHE: dict[str, str] = {
    "mutual funds kya hota hai": (
        "Mutual Fund ko aasan lafzon mein samjhein toh yeh ek 'pooled investment' hai. Yani bohot se log (jaise aap aur hum) thore thore paise ek jagah jama karte hain, aur ek professional **Fund Manager** (jo market ka expert hota hai) us poore sarmaye ko mukhtalif shares, gold ya sarkari bonds mein invest karta hai.\n\n"
        "Iska sab se bara faida yeh hai ke agar aap ke paas sirf Rs. 5,000 hain, tab bhi aap mutual fund ke zariye Pakistan ki top companies mein hissedar ban sakte hain. Aap ka risk spread (diversified) ho jata hai kyunke sara paisa ek company mein nahi laga hota.\n\n"
        "Pakistan mein SECP in companies ko regulate karti hai. Kya aap mutual funds ke rules ke baare mein mazeed jaan-na chahenge? Apne financial advisor se zaroor mashwara karein!"
    ),
    "mutual fund kya hota hai": (
        "Mutual Fund ko aasan lafzon mein samjhein toh yeh ek 'pooled investment' hai. Yani bohot se log (jaise aap aur hum) thore thore paise ek jagah jama karte hain, aur ek professional **Fund Manager** (jo market ka expert hota hai) us poore sarmaye ko mukhtalif shares, gold ya sarkari bonds mein invest karta hai.\n\n"
        "Iska sab se bara faida yeh hai ke agar aap ke paas sirf Rs. 5,000 hain, tab bhi aap mutual fund ke zariye Pakistan ki top companies mein hissedar ban sakte hain. Aap ka risk spread (diversified) ho jata hai kyunke sara paisa ek company mein nahi laga hota.\n\n"
        "Pakistan mein SECP in companies ko regulate karti hai. Kya aap mutual funds ke rules ke baare mein mazeed jaan-na chahenge? Apne financial advisor se zaroor mashwara karein!"
    ),
    "mutual funds": (
        "Mutual Fund ko aasan lafzon mein samjhein toh yeh ek 'pooled investment' hai. Yani bohot se log (jaise aap aur hum) thore thore paise ek jagah jama karte hain, aur ek professional **Fund Manager** (jo market ka expert hota hai) us poore sarmaye ko mukhtalif shares, gold ya sarkari bonds mein invest karta hai.\n\n"
        "Iska sab se bara faida yeh hai ke agar aap ke paas sirf Rs. 5,000 hain, tab bhi aap mutual fund ke zariye Pakistan ki top companies mein hissedar ban sakte hain. Aap ka risk spread (diversified) ho jata hai kyunke sara paisa ek company mein nahi laga hota.\n\n"
        "Pakistan mein SECP in companies ko regulate karti hai. Kya aap mutual funds ke rules ke baare mein mazeed jaan-na chahenge? Apne financial advisor se zaroor mashwara karein!"
    ),
    "saving aur investing mein kya farq hai": (
        "Assalam-o-Alaikum! Bahut acha sawal hai aap ka. Dekhein, saving (bachat) aur investing (sarmayakari) mein asal farq yeh hai ke saving mein aap apna paisa mehfooz aur liquid rakhte hain (jaise emergency ke liye bank account mein ya cash rakhna).\n\n"
        "Lekin investing ka maqsad apne paise ko kaam par lagana hai taake woh barh sake aur inflation (mehngai) ko hara sake, jaise mutual funds, gold ya stocks mein sarmaya lagana.\n\n"
        "Soochiye aise ke saving ek matka hai jismein aap paani jama karte hain taake achanak pyaas lagne par pee sakein. Aur investing ek khet hai jahan aap beej bote hain taake future mein fasal aae. Lekin khet mein thora risk bhi hota hai! Pehle emergency fund banana behtar hai."
    ),
    "saving vs investing": (
        "Assalam-o-Alaikum! Bahut acha sawal hai aap ka. Dekhein, saving (bachat) aur investing (sarmayakari) mein asal farq yeh hai ke saving mein aap apna paisa mehfooz aur liquid rakhte hain (jaise emergency ke liye bank account mein ya cash rakhna).\n\n"
        "Lekin investing ka maqsad apne paise ko kaam par lagana hai taake woh barh sake aur inflation (mehngai) ko hara sake, jaise mutual funds, gold ya stocks mein sarmaya lagana.\n\n"
        "Soochiye aise ke saving ek matka hai jismein aap paani jama karte hain taake achanak pyaas lagne par pee sakein. Aur investing ek khet hai jahan aap beej bote hain taake future mein fasal aae. Lekin khet mein thora risk bhi hota hai! Pehle emergency fund banana behtar hai."
    ),
    "budgeting kya hai": (
        "Budgeting ka matlab hai apni monthly amdani (Income) aur kharchon (Expenses) ka mukammal hisab rakhna taake paisa zaya na ho. Kamyab budgeting ke liye **50-30-20 Rule** sab se behtareen hai.\n\n"
        "Is rule ke mutabiq aap 50% hissa apni bunyadi zarooriyat (rent, bills, rashan) ke liye rakhte hain, 30% apni khwahishat (entertainment, shopping) ke liye, aur 20% savings aur investments ke liye alag karte hain.\n\n"
        "Jab kharcha income se barh jaye toh use **Budget Deficit** kehte hain. Rozana ke kharche note karne se budget deficit se bacha ja sakta hai. Kya aap is bare mein kuch poochhna chahenge?"
    ),
    "budgeting basics": (
        "Budgeting ka matlab hai apni monthly amdani (Income) aur kharchon (Expenses) ka mukammal hisab rakhna taake paisa zaya na ho. Kamyab budgeting ke liye **50-30-20 Rule** sab se behtareen hai.\n\n"
        "Is rule ke mutabiq aap 50% hissa apni bunyadi zarooriyat (rent, bills, rashan) ke liye rakhte hain, 30% apni khwahishat (entertainment, shopping) ke liye, aur 20% savings aur investments ke liye alag karte hain.\n\n"
        "Jab kharcha income se barh jaye toh use **Budget Deficit** kehte hain. Rozana ke kharche note karne se budget deficit se bacha ja sakta hai. Kya aap is bare mein kuch poochhna chahenge?"
    ),
    "inflation kya hai": (
        "Inflation (afrao-te-zar) ko aam zaban mein **Mehngai** kehte hain. Yeh waqt ke sath cheezon ke daam barhne aur aap ke paise ki quwwat-e-khareed (purchasing power) girne ka naam hai.\n\n"
        "Misal ke tor par, agar aaj Rs. 1,00,000 bank mein pare hon aur inflation 15% ho, toh agle saal nominal value Rs. 1,00,000 hi rahega par uski real value/purchasing power gir kar Rs. 85,000 ke barabar ho jayegi.\n\n"
        "SBP policy rate barha kar inflation control karta hai. Is se bachne ke liye humein apne paise ko aisi assets mein lagana chahiye jo inflation se zyada return dein, jaise Stocks ya Gold."
    ),
    "inflation kya hoti hai": (
        "Inflation (afrao-te-zar) ko aam zaban mein **Mehngai** kehte hain. Yeh waqt ke sath cheezon ke daam barhne aur aap ke paise ki quwwat-e-khareed (purchasing power) girne ka naam hai.\n\n"
        "Misal ke tor par, agar aaj Rs. 1,00,000 bank mein pare hon aur inflation 15% ho, toh agle saal nominal value Rs. 1,00,000 hi rahega par uski real value/purchasing power gir kar Rs. 85,000 ke barabar ho jayegi.\n\n"
        "SBP policy rate barha kar inflation control karta hai. Is se bachne ke liye humein apne paise ko aisi assets mein lagana chahiye jo inflation se zyada return dein, jaise Stocks ya Gold."
    ),
    "emergency fund kya hota hai": (
        "Emergency Fund (hangami fund) ghair-mutawaqqe haadsaat ya mushkil waqt (jaise achanak beemari, naukri chale jana ya repair kharche) ke liye rakha gaya paisa hota hai.\n\n"
        "Har shakhs ke paas kam az kam **3 se 6 mahine ke essential kharchon** ke barabar emergency fund hona chahiye, jo dynamic liquid bank account ya money market funds mein ho taake zaroorat par foran nikala ja sake.\n\n"
        "Emergency fund ko gold ya real estate mein nahi rakhna chahiye kyunke unhein foran cash mein tabdeel karna mushkil hota hai. Apne normal savings se ise separate rakhna behtar hai."
    ),
    "emergency funds": (
        "Emergency Fund (hangami fund) ghair-mutawaqqe haadsaat ya mushkil waqt (jaise achanak beemari, naukri chale jana ya repair kharche) ke liye rakha gaya paisa hota hai.\n\n"
        "Har shakhs ke paas kam az kam **3 se 6 mahine ke essential kharchon** ke barabar emergency fund hona chahiye, jo dynamic liquid bank account ya money market funds mein ho taake zaroorat par foran nikala ja sake.\n\n"
        "Emergency fund ko gold ya real estate mein nahi rakhna chahiye kyunke unhein foran cash mein tabdeel karna mushkil hota hai. Apne normal savings se ise separate rakhna behtar hai."
    ),
    "islamic banking kya hai": (
        "Islami Banking sood (Riba) se paak banking system hai jo Shariah ke principles par chalta hai. Conventional bank guaranteed fixed interest dete hain jo sood hai, jabke Islamic banks **Profit and Loss Sharing (PLS)** par kaam karte hain.\n\n"
        "Is mein **Mudarabah** (ek partner paisa deta hai aur dusra mehnat karta hai) aur **Musharakah** (sajhedari / joint venture) ke contracts hote hain. Bank products ko Shariah Board aur scholars supervise karte hain.\n\n"
        "Gari ke liye bank direct loan nahi deta balke cost-plus sale (**Murabahah**) ya renting (**Ijarah**) ke zariye asset farahim karta hai. Yeh halal finance ki behtareen misal hai."
    ),
    "islamic banking": (
        "Islami Banking sood (Riba) se paak banking system hai jo Shariah ke principles par chalta hai. Conventional bank guaranteed fixed interest dete hain jo sood hai, jabke Islamic banks **Profit and Loss Sharing (PLS)** par kaam karte hain.\n\n"
        "Is mein **Mudarabah** (ek partner paisa deta hai aur dusra mehnat karta hai) aur **Musharakah** (sajhedari / joint venture) ke contracts hote hain. Bank products ko Shariah Board aur scholars supervise karte hain.\n\n"
        "Gari ke liye bank direct loan nahi deta balke cost-plus sale (**Murabahah**) ya renting (**Ijarah**) ke zariye asset farahim karta hai. Yeh halal finance ki behtareen misal hai."
    ),
    "stock market kya hai": (
        "Stock Market (Hissas Bazaar) listed companies ke shares ki khareed-o-ferokht ka platform hai, jaise Pakistan Stock Exchange (PSX). Share khareedne se aap company ke fractional owner (hissadar) ban jate hain.\n\n"
        "Shareholders do tarah se kamate hain: **Dividend** (company ke munafay ka cash hissa) aur **Capital Gain** (share price barhne par sasta khareed kar mehnga bechne par hota hai).\n\n"
        "Stock market mein invest karne ke liye licensed broker ke paas trading aur CDC account hona zaroori hai. Speculation se bach kar fundamental analysis ke sath blue chip stocks mein invest karna safe rehta hai."
    ),
    "stock market": (
        "Stock Market (Hissas Bazaar) listed companies ke shares ki khareed-o-ferokht ka platform hai, jaise Pakistan Stock Exchange (PSX). Share khareedne se aap company ke fractional owner (hissadar) ban jate hain.\n\n"
        "Shareholders do tarah se kamate hain: **Dividend** (company ke munafay ka cash hissa) aur **Capital Gain** (share price barhne par sasta khareed kar mehnga bechne par hota hai).\n\n"
        "Stock market mein invest karne ke liye licensed broker ke paas trading aur CDC account hona zaroori hai. Speculation se bach kar fundamental analysis ke sath blue chip stocks mein invest karna safe rehta hai."
    ),
}

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

    # Clean and check cached responses for ultra-fast demo presentation
    clean_msg = user_message.strip().lower().replace("?", "").replace(".", "").replace(",", "")
    cached_response = None
    for cache_key, cache_val in _TUTOR_RESPONSE_CACHE.items():
        if cache_key in clean_msg or clean_msg == cache_key:
            cached_response = cache_val
            break

    if cached_response:
        all_detected = list(set(detected + _detect_concepts(cached_response)))
        return {
            "response": cached_response,
            "detected_concepts": all_detected,
            "next_lesson": next_lesson,
        }

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
