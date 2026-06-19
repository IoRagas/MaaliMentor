"""
Graph-based Retrieval-Augmented Generation (Graph-RAG) for the tutor.

Maintains a prerequisite graph of financial concepts and uses it to:
1. Check if a user is ready to learn a new concept.
2. Recommend the next concept based on current mastery.
3. Query semantic context from ChromaDB (with Gemini Embeddings).
4. Combine prerequisite and semantic data for Hybrid RAG.
5. Retrieve conversation history for memory.
6. Generate structured JSON tutoring responses in a single Gemini call.
"""

import re
import json
import asyncio
from pathlib import Path
from typing import Optional, List, Dict, Any

import networkx as nx
import chromadb
from chromadb.api.types import Documents, Embeddings, EmbeddingFunction
from datetime import datetime
from sqlmodel import Session, select

from app.config import settings
from app.models import ConceptMastery, ChatMessage, User

# ═══════════════════════════════════════════════════════════════
# CHROMA VECTOR STORAGE & GEMINI EMBEDDINGS
# ═══════════════════════════════════════════════════════════════

CHROMA_DB_PATH = Path(__file__).resolve().parent.parent.parent / "chroma_db"

class GeminiEmbeddingFunction(EmbeddingFunction):
    """Custom Chroma embedding function using Gemini's text-embedding-004."""
    def __call__(self, input: Documents) -> Embeddings:
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            
            embeddings = []
            for text in input:
                result = genai.embed_content(
                    model="models/gemini-embedding-001",
                    content=text,
                    task_type="retrieval_document"
                )
                embeddings.append(result["embedding"])
            return embeddings
        except Exception as e:
            print(f"[chroma] Gemini embedding generation error: {e}. Falling back to zero embeddings.")
            # text-embedding-004 has 768 dimensions
            return [[0.0] * 768 for _ in input]


_chroma_client = None
_chroma_collection = None

def get_chroma_collection():
    """Lazy initialize and return the Chroma KB collection singleton."""
    global _chroma_client, _chroma_collection
    if _chroma_collection is None:
        try:
            _chroma_client = chromadb.PersistentClient(path=str(CHROMA_DB_PATH))
            embedding_fn = GeminiEmbeddingFunction()
            _chroma_collection = _chroma_client.get_or_create_collection(
                name="maali_mentor_kb_v2",
                embedding_function=embedding_fn,
                metadata={"hnsw:space": "cosine"}
            )
        except Exception as e:
            print(f"[chroma] PersistentClient initialization failed: {e}. Falling back to EphemeralClient.")
            try:
                _chroma_client = chromadb.EphemeralClient()
                _chroma_collection = _chroma_client.get_or_create_collection(
                    name="maali_mentor_kb_fallback",
                    embedding_function=GeminiEmbeddingFunction()
                )
            except Exception as ex:
                print(f"[chroma] EphemeralClient initialization failed: {ex}")
                _chroma_collection = None
    return _chroma_collection


def chunk_text(text: str, chunk_size: int = 800, overlap: int = 150) -> List[str]:
    """Split text into manageable chunks, aiming for paragraph boundaries."""
    paragraphs = text.split("\n\n")
    chunks = []
    current_chunk = ""
    for para in paragraphs:
        para = para.strip()
        if not para:
            continue
        if len(current_chunk) + len(para) <= chunk_size:
            current_chunk += "\n\n" + para if current_chunk else para
        else:
            if current_chunk:
                chunks.append(current_chunk)
            if len(para) > chunk_size:
                # Force slice large paragraph
                for i in range(0, len(para), chunk_size - overlap):
                    chunks.append(para[i:i+chunk_size])
                current_chunk = ""
            else:
                current_chunk = para
    if current_chunk:
        chunks.append(current_chunk)
    return chunks


def initialize_vector_db() -> None:
    """Read knowledge base markdown files and index them into ChromaDB."""
    collection = get_chroma_collection()
    if collection is None:
        print("[chroma] Skipping Vector DB setup (collection is None).")
        return

    try:
        # Clear existing collection to force re-indexing of expanded files
        current_count = collection.count()
        if current_count > 0:
            print(f"[chroma] Clearing existing {current_count} documents to force re-indexing...")
            all_data = collection.get()
            if all_data and all_data.get("ids"):
                collection.delete(ids=all_data["ids"])

        print("[chroma] Indexing knowledge-base markdown files...")
        
        kb_files = list(KB_DIR.glob("*.md"))
        if not kb_files:
            print("[chroma] Warning: No markdown files found in knowledge_base directory.")
            return

        documents = []
        metadatas = []
        ids = []
        
        for file_path in kb_files:
            concept_name = file_path.stem.replace("_pakistan", "").replace("_secp", "").replace("_system", "")
            concept_mapping = {
                "islamic_banking": "islamic_banking",
                "mutual_funds": "mutual_funds",
                "national_savings_certificates": "saving",
                "tax_filer": "tax_filer"
            }
            mapped_concept = concept_mapping.get(concept_name, concept_name)

            try:
                content = file_path.read_text(encoding="utf-8")
                chunks = chunk_text(content)
                for idx, chunk in enumerate(chunks):
                    documents.append(chunk)
                    metadatas.append({
                        "source": file_path.name,
                        "concept": mapped_concept,
                        "chunk_index": idx
                    })
                    ids.append(f"{mapped_concept}_chunk_{idx}")
            except Exception as e:
                print(f"[chroma] Error indexing file {file_path.name}: {e}")

        if documents:
            collection.add(
                documents=documents,
                metadatas=metadatas,
                ids=ids
            )
            print(f"[chroma] Indexed {len(documents)} text chunks into ChromaDB.")
    except Exception as e:
        print(f"[chroma] Failed to build vector database index: {e}")


def vector_search(query: str, k: int = 3) -> str:
    """Retrieve semantically relevant knowledge chunks from ChromaDB."""
    collection = get_chroma_collection()
    if collection is None:
        return ""
    try:
        results = collection.query(
            query_texts=[query],
            n_results=k
        )
        if results and results.get("documents") and results["documents"][0]:
            return "\n\n".join(results["documents"][0])
    except Exception as e:
        print(f"[chroma] Query retrieval error: {e}")
    return ""


# ═══════════════════════════════════════════════════════════════
# CONCEPT PREREQUISITE GRAPH
# ═══════════════════════════════════════════════════════════════

CONCEPT_GRAPH = nx.DiGraph()

# Prerequisite layout
CONCEPT_GRAPH.add_edges_from([
    ("budgeting", "saving"),
    ("saving", "emergency_funds"),
    ("emergency_funds", "inflation"),
    ("inflation", "tax_basics"),
    ("tax_basics", "investing"),
    ("investing", "mutual_funds"),
    ("investing", "islamic_banking"),
    ("mutual_funds", "stock_market"),
    ("islamic_banking", "gold_real_estate"),
    ("stock_market", "diversification"),
    ("gold_real_estate", "diversification"),
    ("diversification", "retirement"),
])

ALL_CONCEPTS: list[str] = [
    "budgeting",
    "saving",
    "emergency_funds",
    "inflation",
    "tax_basics",
    "investing",
    "mutual_funds",
    "islamic_banking",
    "stock_market",
    "gold_real_estate",
    "diversification",
    "retirement",
]
MASTERY_THRESHOLD = 75


def update_mastery_and_xp(user_id: int, detected_concepts: list[str], session: Session) -> None:
    """Helper to increment mastery score and award XP for detected concepts during tutoring."""
    try:
        user = session.get(User, user_id)
        if not user:
            return
            
        xp_gained = 0
        for concept in detected_concepts:
            if concept in ALL_CONCEPTS:
                mastery_stmt = select(ConceptMastery).where(
                    ConceptMastery.user_id == user_id,
                    ConceptMastery.concept_name == concept
                )
                mastery = session.exec(mastery_stmt).first()
                if not mastery:
                    mastery = ConceptMastery(
                        user_id=user_id,
                        concept_name=concept,
                        mastery_score=5,
                        updated_at=datetime.utcnow()
                    )
                    session.add(mastery)
                    xp_gained += 10
                elif mastery.mastery_score < 50:
                    mastery.mastery_score = min(50, mastery.mastery_score + 5)
                    mastery.updated_at = datetime.utcnow()
                    session.add(mastery)
                    xp_gained += 10
                    
        if xp_gained > 0:
            user.current_xp += xp_gained
            session.add(user)
            session.commit()
            print(f"[graph_rag] Dynamic tutor update: awarded +{xp_gained} XP to user {user_id}")
    except Exception as db_err:
        print(f"[tutor] Failed to update mastery/XP during chat: {db_err}")


KB_DIR = Path(__file__).resolve().parent.parent / "knowledge_base"


def get_prerequisites(concept: str) -> list[str]:
    """Return all direct prerequisite concepts."""
    if concept not in CONCEPT_GRAPH:
        return []
    return list(CONCEPT_GRAPH.predecessors(concept))


def check_readiness(user_id: int, target_concept: str, session: Session) -> dict:
    """Check whether all prerequisites for a target concept are mastered."""
    prereqs = get_prerequisites(target_concept)
    if not prereqs:
        return {"ready": True, "missing_concepts": []}

    statement = select(ConceptMastery).where(
        ConceptMastery.user_id == user_id,
        ConceptMastery.concept_name.in_(prereqs),
    )
    mastery_records = session.exec(statement).all()
    mastered = {r.concept_name for r in mastery_records if r.mastery_score >= MASTERY_THRESHOLD}

    missing = [p for p in prereqs if p not in mastered]
    return {"ready": len(missing) == 0, "missing_concepts": missing}


def get_next_recommended(user_id: int, session: Session) -> str:
    """Recommend the next lesson concept topological order."""
    statement = select(ConceptMastery).where(ConceptMastery.user_id == user_id)
    records = session.exec(statement).all()
    scores = {r.concept_name: r.mastery_score for r in records}

    for concept in ALL_CONCEPTS:
        own_score = scores.get(concept, 0)
        if own_score >= MASTERY_THRESHOLD:
            continue
        readiness = check_readiness(user_id, concept, session)
        if readiness["ready"]:
            return concept

    return ALL_CONCEPTS[-1]


def _load_knowledge_context(concept: str) -> str:
    """Load concepts static content for fallback or supplementary context."""
    concept_kb_map: dict[str, str] = {
        "islamic_banking": "islamic_banking.md",
        "mutual_funds": "mutual_funds.md",
        "investing": "investing.md",
        "saving": "saving.md",
        "emergency_funds": "emergency_funds.md",
        "stock_market": "stock_market.md",
        "diversification": "diversification.md",
        "budgeting": "budgeting.md",
        "inflation": "inflation.md",
        "tax_basics": "tax_basics.md",
        "gold_real_estate": "gold_real_estate.md",
        "retirement": "retirement.md",
    }
    filename = concept_kb_map.get(concept)
    if not filename:
        return ""
    kb_path = KB_DIR / filename
    if kb_path.exists():
        return kb_path.read_text(encoding="utf-8")[:3000]
    return ""


# ═══════════════════════════════════════════════════════════════
# SYSTEM PROMPT BUILDER
# ═══════════════════════════════════════════════════════════════

def get_tutor_system_prompt(
    context: str = "",
    user_level: str = "Beginner (Mubtadi)",
    level_instruction: str = "",
    mastery_scores_str: str = ""
) -> str:
    """Build the LLM system prompt requesting structured JSON output."""
    base_prompt = (
        "Aap 'Maali Mentor' hain — ek dost-anaas, mahir Urdu financial literacy tutor.\n\n"
        f"USER MASTERY PROFILE:\n"
        f"- User Current Level: {user_level}\n"
        f"- User Concept Mastery Scores:\n{mastery_scores_str}\n"
        f"- Response Style Instruction: {level_instruction}\n\n"
        "RULES:\n"
        "1. ALWAYS output your response as a valid JSON object. Do not include markdown code block formatting (like ```json ... ```). Output the raw JSON text directly.\n"
        "2. The JSON object MUST contain exactly two fields:\n"
        "   - \"roman_urdu\": Detailed response explanation written in Roman Urdu (Urdu words in English letters).\n"
        "   - \"urdu_script\": Precise translation of the Roman Urdu explanation written in native Urdu script (Nastaliq characters).\n"
        "3. Use respectful 'Aap' pronouns — never 'Tum' or 'Tu'.\n"
        "4. Explain financial concepts using Pakistani everyday analogies "
        "(chai ki dukaan, sabzi mandi, rickshaw driver, school fees).\n"
        "5. Structure response content clearly. Pehle concept define karein, phir analogy dein, phir practical example dein.\n"
        "6. If mentioning numbers, use Pakistani Rupee (PKR / Rs.).\n"
        "7. Encourage the learner and celebrate small wins.\n"
        "8. NEVER GIVE SPECIFIC INVESTMENT ADVICE: General principles only, and include 'apne financial advisor se zaroor mashwara karein'.\n"
        "9. STRICTLY DECLINE INVALID / OFF-TOPIC REQUESTS: Decline queries unrelated to finance, personal budgeting, saving, investing or taxation in Roman Urdu. Return JSON with the message: 'Maaf kijiyega, main aapka Maali Mentor hoon aur main sirf personal finance, bachat, aur sarmayakari ke sawalaat ke jawaabaat de sakta hoon. Chalein, bachat ke baare mein baat karte hain!'\n"
        "10. PROVIDE DETAILED EXPLANATIONS: Avoid short acknowledgements like 'Acha sawal hai' without definitions and analogies.\n"
        "11. DO NOT USE ANY MARKDOWN OR SPECIAL SYMBOLS in the response text fields (no *, **, #, [], etc.).\n"
    )

    if context:
        base_prompt += (
            "\n--- REFERENCE MATERIAL (Use this facts to answer) ---\n"
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
# TUTOR RESPONSE CACHE (For ultra-fast demo responses with pre-translated script)
# ═══════════════════════════════════════════════════════════════

_TUTOR_RESPONSE_CACHE: dict[str, dict[str, str]] = {
    "mutual funds kya hota hai": {
        "roman_urdu": (
            "Mutual Fund ko aasan lafzon mein samjhein toh yeh ek pooled investment hai. Yani bohot se log jaise aap aur hum thore thore paise ek jagah jama karte hain, aur ek professional Fund Manager jo market ka expert hota hai, us poore sarmaye ko mukhtalif shares, gold ya sarkari bonds mein invest karta hai.\n\n"
            "Iska sab se bara faida yeh hai ke agar aap ke paas sirf Rs. 5,000 hain, tab bhi aap mutual fund ke zariye Pakistan ki top companies mein hissedar ban sakte hain. Aap ka risk spread yani diversified ho jata hai kyunke sara paisa ek company mein nahi laga hota.\n\n"
            "Pakistan mein SECP in companies ko regulate karti hai. Kya aap mutual funds ke rules ke baare mein mazeed jaan-na chahenge? Apne financial advisor se zaroor mashwara karein!"
        ),
        "urdu_script": (
            "میوچوئل فنڈ کو آسان لفظوں میں سمجھیں تو یہ ایک پولڈ انویسٹمنٹ ہے۔ یعنی بہت سے لوگ جیسے آپ اور ہم تھوڑے تھوڑے پیسے ایک جگہ جمع کرتے ہیں، اور ایک پروفیشنل فنڈ مینیجر جو مارکیٹ کا ایکسپرٹ ہوتا ہے، اس پورے سرمایہ کو مختلف شیئرز، گولڈ یا سرکاری بانڈز میں انویسٹ کرتا ہے۔\n\nاس کا سب سے بڑا فائدہ یہ ہے کہ اگر آپ کے پاس صرف 5,000 روپے ہیں، تب بھی آپ میوچوئل فنڈ کے ذریعے پاکستان کی ٹاپ کمپنیوں میں حصہ دار بن سکتے ہیں۔ آپ کا رسک ڈائیورسیفائی ہو جاتا ہے کیونکہ سارا پیسہ ایک کمپنی میں نہیں لگا ہوتا۔\n\nپاکستان میں ایس ای سی پی ان کمپنیوں کو ریگولیٹ کرتی ہے۔ کیا آپ میوچوئل فنڈز کے رولز کے بارے میں مزید جاننا چاہیں گے؟ اپنے فائنینشل ایڈوائزر سے ضرور مشورہ کریں!"
        )
    },
    "mutual fund kya hota hai": {
        "roman_urdu": (
            "Mutual Fund ko aasan lafzon mein samjhein toh yeh ek pooled investment hai. Yani bohot se log jaise aap aur hum thore thore paise ek jagah jama karte hain, aur ek professional Fund Manager jo market ka expert hota hai, us poore sarmaye ko mukhtalif shares, gold ya sarkari bonds mein invest karta hai.\n\n"
            "Iska sab se bara faida yeh hai ke agar aap ke paas sirf Rs. 5,000 hain, tab bhi aap mutual fund ke zariye Pakistan ki top companies mein hissedar ban sakte hain. Aap ka risk spread yani diversified ho jata hai kyunke sara paisa ek company mein nahi laga hota.\n\n"
            "Pakistan mein SECP in companies ko regulate karti hai. Kya aap mutual funds ke rules ke baare mein mazeed jaan-na chahenge? Apne financial advisor se zaroor mashwara karein!"
        ),
        "urdu_script": (
            "میوچوئل فنڈ کو آسان لفظوں میں سمجھیں تو یہ ایک پولڈ انویسٹمنٹ ہے۔ یعنی بہت سے لوگ جیسے آپ اور ہم تھوڑے تھوڑے پیسے ایک جگہ جمع کرتے ہیں، اور ایک پروفیشنل فنڈ مینیجر جو مارکیٹ کا ایکسپرٹ ہوتا ہے، اس پورے سرمایہ کو مختلف شیئرز، گولڈ یا سرکاری بانڈز میں انویسٹ کرتا ہے۔\n\nاس کا سب سے بڑا فائدہ یہ ہے کہ اگر آپ کے پاس صرف 5,000 روپے ہیں، تب بھی آپ میوچوئل فنڈ کے ذریعے پاکستان کی ٹاپ کمپنیوں میں حصہ دار بن سکتے ہیں۔ آپ کا رسک ڈائیورسیفائی ہو جاتا ہے کیونکہ سارا پیسہ ایک کمپنی میں نہیں لگا ہوتا۔\n\nپاکستان میں ایس ای سی پی ان کمپنیوں کو ریگولیٹ کرتی ہے۔ کیا آپ میوچوئل فنڈز کے رولز کے بارے میں مزید جاننا چاہیں گے؟ اپنے فائنینشل ایڈوائزر سے ضرور مشورہ کریں!"
        )
    },
    "mutual funds": {
        "roman_urdu": (
            "Mutual Fund ko aasan lafzon mein samjhein toh yeh ek pooled investment hai. Yani bohot se log jaise aap aur hum thore thore paise ek jagah jama karte hain, aur ek professional Fund Manager jo market ka expert hota hai, us poore sarmaye ko mukhtalif shares, gold ya sarkari bonds mein invest karta hai.\n\n"
            "Iska sab se bara faida yeh hai ke agar aap ke paas sirf Rs. 5,000 hain, tab bhi aap mutual fund ke zariye Pakistan ki top companies mein hissedar ban sakte hain. Aap ka risk spread yani diversified ho jata hai kyunke sara paisa ek company mein nahi laga hota.\n\n"
            "Pakistan mein SECP in companies ko regulate karti hai. Kya aap mutual funds ke rules ke baare mein mazeed jaan-na chahenge? Apne financial advisor se zaroor mashwara karein!"
        ),
        "urdu_script": (
            "میوچوئل فنڈ کو آسان لفظوں میں سمجھیں تو یہ ایک پولڈ انویسٹمنٹ ہے۔ یعنی بہت سے لوگ جیسے آپ اور ہم تھوڑے تھوڑے پیسے ایک جگہ جمع کرتے ہیں، اور ایک پروفیشنل فنڈ مینیجر جو مارکیٹ کا ایکسپرٹ ہوتا ہے، اس پورے سرمایہ کو مختلف شیئرز، گولڈ یا سرکاری بانڈز میں انویسٹ کرتا ہے۔\n\nاس کا سب سے بڑا فائدہ یہ ہے کہ اگر آپ کے پاس صرف 5,000 روپے ہیں، تب بھی آپ میوچوئل فنڈ کے ذریعے پاکستان کی ٹاپ کمپنیوں میں حصہ دار بن سکتے ہیں۔ آپ کا رسک ڈائیورسیفائی ہو جاتا ہے کیونکہ سارا پیسہ ایک کمپنی میں نہیں لگا ہوتا۔\n\nپاکستان میں ایس ای سی پی ان کمپنیوں کو ریگولیٹ کرتی ہے۔ کیا آپ میوچوئل فنڈز کے رولز کے بارے میں مزید جاننا چاہیں گے؟ اپنے فائنینشل ایڈوائزر سے ضرور مشورہ کریں!"
        )
    },
    "saving aur investing mein kya farq hai": {
        "roman_urdu": (
            "Assalam-o-Alaikum! Bahut acha sawal hai aap ka. Dekhein, saving yani bachat aur investing yani sarmayakari mein asal farq yeh hai ke saving mein aap apna paisa mehfooz aur liquid rakhte hain, jaise emergency ke liye bank account mein ya cash rakhna.\n\n"
            "Lekin investing ka maqsad apne paise ko kaam par lagana hai taake woh barh sake aur inflation yani mehngai ko hara sake, jaise mutual funds, gold ya stocks mein sarmaya lagana.\n\n"
            "Soochiye aise ke saving ek matka hai jismein aap paani jama karte hain taake achanak pyaas lagne par pee sakein. Aur investing ek khet hai jahan aap beej bote hain taake future mein fasal aae. Lekin khet mein thora risk bhi hota hai! Pehle emergency fund banana behtar hai."
        ),
        "urdu_script": (
            "السلام علیکم! بہت اچھا سوال ہے آپ کا۔ دیکھیں، سیونگ یعنی بچت اور انویسٹنگ یعنی سرمایہ کاری میں اصل فرق یہ ہے کہ بچت میں آپ اپنا پیسہ محفوظ اور لکوئڈ رکھتے ہیں، جیسے ایمرجنسی کے لیے بینک اکاؤنٹ میں یا کیش رکھنا۔\n\nلیکن سرمایہ کاری کا مقصد اپنے پیسے کو کام پر لگانا ہے تاکہ وہ بڑھ سکے اور انفلیشن یعنی مہنگائی کو ہرا سکے، جیسے میوچوئل فنڈز، گولڈ یا اسٹاکس میں سرمایہ لگانا۔\n\nسوچیے ایسے کہ بچت ایک مٹکا ہے جس میں آپ پانی جمع کرتے ہیں تاکہ اچانک پیاس لگنے پر پی سکیں۔ اور سرمایہ کاری ایک کھیت ہے جہاں آپ بیج بوتے ہیں تاکہ مستقبل میں فصل آئے۔ لیکن کھیت میں تھوڑا رسک بھی ہوتا ہے! پہلے ایمرجنسی فنڈ بنانا بہتر ہے۔"
        )
    },
    "saving vs investing": {
        "roman_urdu": (
            "Assalam-o-Alaikum! Bahut acha sawal hai aap ka. Dekhein, saving yani bachat aur investing yani sarmayakari mein asal farq yeh hai ke saving mein aap apna paisa mehfooz aur liquid rakhte hain, jaise emergency ke liye bank account mein ya cash rakhna.\n\n"
            "Lekin investing ka maqsad apne paise ko kaam par lagana hai taake woh barh sake aur inflation yani mehngai ko hara sake, jaise mutual funds, gold ya stocks mein sarmaya lagana.\n\n"
            "Soochiye aise ke saving ek matka ismein aap paani jama karte hain taake achanak pyaas lagne par pee sakein. Aur investing ek khet hai jahan aap beej bote hain taake future mein fasal aae. Lekin khet mein thora risk bhi hota hai! Pehle emergency fund banana behtar hai."
        ),
        "urdu_script": (
            "السلام علیکم! بہت اچھا سوال ہے آپ کا۔ دیکھیں، سیونگ یعنی بچت اور انویسٹنگ یعنی سرمایہ کاری میں اصل فرق یہ ہے کہ بچت میں آپ اپنا پیسہ محفوظ اور لکوئڈ رکھتے ہیں، جیسے ایمرجنسی کے لیے بینک اکاؤنٹ میں یا کیش رکھنا۔\n\nلیکن سرمایہ کاری کا مقصد اپنے پیسے کو کام پر لگانا ہے تاکہ وہ بڑھ سکے اور انفلیشن یعنی مہنگائی کو ہرا سکے، جیسے میوچوئل فنڈز، گولڈ یا اسٹاکس میں سرمایہ لگانا۔\n\nسوچیے ایسے کہ بچت ایک مٹکا ہے جس میں آپ پانی جمع کرتے ہیں تاکہ اچانک پیاس لگنے پر پی سکیں۔ اور سرمایہ کاری ایک کھیت ہے جہاں آپ بیج بوتے ہیں تاکہ مستقبل میں فصل آئے۔ لیکن کھیت میں تھوڑا رسک بھی ہوتا ہے! پہلے ایمرجنسی فنڈ بنانا بہتر ہے۔"
        )
    },
    "budgeting kya hai": {
        "roman_urdu": (
            "Budgeting ka matlab hai apni monthly amdani yani Income aur kharchon yani Expenses ka mukammal hisab rakhna taake paisa zaya na ho. Kamyab budgeting ke liye 50-30-20 Rule sab se behtareen hai.\n\n"
            "Is rule ke mutabiq aap 50 percent hissa apni bunyadi zarooriyat jaise rent, bills, rashan ke liye rakhte hain, 30 percent apni khwahishat jaise entertainment aur shopping ke liye, aur 20 percent savings aur investments ke liye alag karte hain.\n\n"
            "Jab kharcha income se barh jaye toh use Budget Deficit kehte hain. Rozana ke kharche note karne se budget deficit se bacha ja sakta hai. Kya aap is bare mein kuch poochhna chahenge?"
        ),
        "urdu_script": (
            "بجٹنگ کا مطلب ہے اپنی ماہانہ آمدنی یعنی انکم اور خرچوں یعنی ایکسپنسز کا مکمل حساب رکھنا تاکہ پیسہ ضائع نہ ہو۔ کامیاب بجٹنگ کے لیے 50-30-20 اصول سب سے بہترین ہے۔\n\nاس اصول کے مطابق آپ 50 فیصد حصہ اپنی بنیادی ضروریات جیسے کرایہ، بلز، راشن کے لیے رکھتے ہیں، 30 فیصد اپنی خواہشات جیسے انٹرٹینمنٹ اور شاپنگ کے لیے، اور 20 فیصد بچت اور سرمایہ کاری کے لیے الگ کرتے ہیں۔\n\nجب خرچہ آمدنی سے بڑھ جائے تو اسے بجٹ خسارہ کہتے ہیں۔ روزانہ کے خرچے نوٹ کرنے سے بجٹ خسارے سے بچا جا سکتا ہے۔ کیا آپ اس بارے میں کچھ پوچھنا چاہیں گے؟"
        )
    },
    "budgeting basics": {
        "roman_urdu": (
            "Budgeting ka matlab hai apni monthly amdani yani Income aur kharchon yani Expenses ka mukammal hisab rakhna taake paisa zaya na ho. Kamyab budgeting ke liye 50-30-20 Rule sab se behtareen hai.\n\n"
            "Is rule ke mutabiq aap 50 percent hissa apni bunyadi zarooriyat jaise rent, bills, rashan ke liye rakhte hain, 30 percent apni khwahishat jaise entertainment aur shopping ke liye, aur 20 percent savings aur investments ke liye alag karte hain.\n\n"
            "Jab kharcha income se barh jaye toh use Budget Deficit kehte hain. Rozana ke kharche note karne se budget deficit se bacha ja sakta hai. Kya aap is bare mein kuch poochhna chahenge?"
        ),
        "urdu_script": (
            "بجٹنگ کا مطلب ہے اپنی ماہانہ آمدنی یعنی انکم اور خرچوں یعنی ایکسپنسز کا مکمل حساب رکھنا تاکہ پیسہ ضائع نہ ہو۔ کامیاب بجٹنگ کے لیے 50-30-20 اصول سب سے بہترین ہے۔\n\nاس اصول کے مطابق آپ 50 فیصد حصہ اپنی بنیادی ضروریات جیسے کرایہ، بلز، راشن کے لیے رکھتے ہیں، 30 فیصد اپنی خواہشات جیسے انٹرٹینمنٹ اور شاپنگ کے لیے، اور 20 فیصد بچت اور سرمایہ کاری کے لیے الگ کرتے ہیں۔\n\nجب خرچہ آمدنی سے بڑھ جائے تو اسے بجٹ خسارہ کہتے ہیں۔ روزانہ کے خرچے نوٹ کرنے سے بجٹ خسارے سے بچا جا سکتا ہے۔ کیا آپ اس بارے میں کچھ پوچھنا چاہیں گے؟"
        )
    },
    "inflation kya hai": {
        "roman_urdu": (
            "Inflation yani afrao-te-zar ko aam zaban mein MEHNGAI kehte hain. Yeh waqt ke sath cheezon ke daam barhne aur aap ke paise ki quwwat-e-khareed yani purchasing power girne ka naam hai.\n\n"
            "Misal ke tor par, agar aaj Rs. 1,00,000 bank mein pare hon aur inflation 15 percent ho, toh agle saal nominal value Rs. 1,00,000 hi rahega par uski real value gir kar Rs. 85,000 ke barabar ho jayegi.\n\n"
            "SBP policy rate barha kar inflation control karta hai. Is se bachne ke liye humein apne paise ko aisi assets mein lagana chahiye jo inflation se zyada return dein, jaise Stocks ya Gold."
        ),
        "urdu_script": (
            "انفلیشن یعنی افراطِ زر کو عام زبان میں مہنگائی کہتے ہیں۔ یہ وقت کے ساتھ چیزوں کے دام بڑھنے اور آپ کے پیسے کی قوتِ خرید یعنی پرچیزنگ پاور گرنے کا نام ہے۔\n\nمثال کے طور پر، اگر آج 1,00,000 روپے بینک میں پڑے ہوں اور مہنگائی 15 فیصد ہو، تو اگلے سال نامیاتی قدر 1,00,000 روپے ہی رہے گی پر اس کی اصل قدر گر کر 85,000 روپے کے برابر ہو جائے گی۔\n\nاسٹیٹ بینک آف پاکستان پالیسی ریٹ بڑھا کر مہنگائی کو کنٹرول کرتا ہے۔ اس سے بچنے کے لیے ہمیں اپنے پیسے کو ایسی اثاثوں میں لگانا چاہیے جو مہنگائی سے زیادہ منافع دیں، جیسے اسٹاکس یا گولڈ۔"
        )
    },
    "inflation kya hoti hai": {
        "roman_urdu": (
            "Inflation yani afrao-te-zar ko aam zaban mein MEHNGAI kehte hain. Yeh waqt ke sath cheezon ke daam barhne aur aap ke paise ki quwwat-e-khareed yani purchasing power girne ka naam hai.\n\n"
            "Misal ke tor par, agar aaj Rs. 1,00,000 bank mein pare hon aur inflation 15 percent ho, toh agle saal nominal value Rs. 1,00,000 hi rahega par uski real value gir kar Rs. 85,000 ke barabar ho jayegi.\n\n"
            "SBP policy rate barha kar inflation control karta hai. Is se bachne ke liye humein apne paise ko aisi assets mein lagana chahiye jo inflation se zyada return dein, jaise Stocks ya Gold."
        ),
        "urdu_script": (
            "انفلیشن یعنی افراطِ زر کو عام زبان میں مہنگائی کہتے ہیں۔ یہ وقت کے ساتھ چیزوں کے دام بڑھنے اور آپ کے پیسے کی قوتِ خرید یعنی پرچیزنگ پاور گرنے کا نام ہے۔\n\nمثال کے طور پر، اگر آج 1,00,000 روپے بینک میں پڑے ہوں اور مہنگائی 15 فیصد ہو، تو اگلے سال نامیاتی قدر 1,00,000 روپے ہی رہے گی پر اس کی اصل قدر گر کر 85,000 روپے کے برابر ہو جائے گی۔\n\nاسٹیٹ بینک آف پاکستان پالیسی ریٹ بڑھا کر مہنگائی کو کنٹرول کرتا ہے۔ اس سے بچنے کے لیے ہمیں اپنے پیسے کو ایسی اثاثوں میں لگانا چاہیے جو مہنگائی سے زیادہ منافع دیں، جیسے اسٹاکس یا گولڈ۔"
        )
    },
    "emergency fund kya hota hai": {
        "roman_urdu": (
            "Emergency Fund yani hangami fund ghair-mutawaqqe haadsaat ya mushkil waqt jaise achanak beemari, naukri chale jana ya repair kharche ke liye rakha gaya paisa hota hai.\n\n"
            "Har shakhs ke paas kam az kam 3 se 6 mahine ke essential kharchon ke barabar emergency fund hona chahiye, jo liquid bank account ya money market funds mein ho taake zaroorat par foran nikala ja sake.\n\n"
            "Emergency fund ko gold ya real estate mein nahi rakhna chahiye kyunke unhein foran cash mein tabdeel karna mushkil hota hai. Apne normal savings se ise separate rakhna behtar hai."
        ),
        "urdu_script": (
            "ایمرجنسی فنڈ یعنی ہنگامی فنڈ غیر متوقع حادثات یا مشکل وقت جیسے اچانک بیماری، نوکری چلے جانا یا مرمت کے خرچے کے لیے رکھا گیا پیسہ ہوتا ہے۔\n\nہر شخص کے پاس کم از کم 3 سے 6 ماہ کے ضروری خرچوں کے برابر ایمرجنسی فنڈ ہونا چاہیے، جو کسی بھی وقت نکالنے والے بینک اکاؤنٹ یا منی مارکیٹ فنڈز میں ہو تاکہ ضرورت پڑنے پر فوراً نکالا جا سکے۔\n\nایمرجنسی فنڈ کو سونے یا رئیل اسٹیٹ میں نہیں رکھنا چاہیے کیونکہ انہیں فوراً کیش میں تبدیل کرنا مشکل ہوتا ہے۔ اپنی عام بچت سے اسے الگ رکھنا بہتر ہے۔"
        )
    },
    "emergency funds": {
        "roman_urdu": (
            "Emergency Fund yani hangami fund ghair-mutawaqqe haadsaat ya mushkil waqt jaise achanak beemari, naukri chale jana ya repair kharche ke liye rakha gaya paisa hota hai.\n\n"
            "Har shakhs ke paas kam az kam 3 se 6 mahine ke essential kharchon ke barabar emergency fund hona chahiye, jo liquid bank account ya money market funds mein ho taake zaroorat par foran nikala ja sake.\n\n"
            "Emergency fund ko gold ya real estate mein nahi rakhna chahiye kyunke unhein foran cash mein tabdeel karna mushkil hota hai. Apne normal savings se ise separate rakhna behtar hai."
        ),
        "urdu_script": (
            "ایمرجنسی فنڈ یعنی ہنگامی فنڈ غیر متوقع حادثات یا مشکل وقت جیسے اچانک بیماری، نوکری چلے جانا یا مرمت کے خرچے کے لیے رکھا گیا پیسہ ہوتا ہے۔\n\nہر شخص کے پاس کم از کم 3 سے 6 ماہ کے ضروری خرچوں کے برابر ایمرجنسی فنڈ ہونا چاہیے، جو کسی بھی وقت نکالنے والے بینک اکاؤنٹ یا منی مارکیٹ فنڈز میں ہو تاکہ ضرورت پڑنے پر فوراً نکالا جا سکے۔\n\nایمرجنسی فنڈ کو سونے یا رئیل اسٹیٹ میں نہیں رکھنا چاہیے کیونکہ انہیں فوراً کیش میں تبدیل کرنا مشکل ہوتا ہے۔ اپنی عام بچت سے اسے الگ رکھنا بہتر ہے۔"
        )
    },
    "islamic banking kya hai": {
        "roman_urdu": (
            "Islami Banking sood yani Riba se paak banking system hai jo Shariah ke principles par chalta hai. Conventional bank guaranteed fixed interest dete hain jo sood hai, jabke Islamic banks Profit and Loss Sharing yani PLS par kaam karte hain.\n\n"
            "Is mein Mudarabah yani ek partner paisa deta hai aur dusra mehnat karta hai, aur Musharakah yani sajhedari ke contracts hote hain. Bank products ko Shariah Board aur scholars supervise karte hain.\n\n"
            "Gari ke liye bank direct loan nahi deta balke cost-plus sale yani Murabahah ya renting yani Ijarah ke zariye asset farahim karta hai. Yeh halal finance ki behtareen misal hai."
        ),
        "urdu_script": (
            "اسلامی بینکنگ سود یعنی ربا سے پاک بینکنگ سسٹم ہے جو شریعت کے اصولوں پر چلتا ہے۔ روایتی بینک گارنٹیڈ فکسڈ سود دیتے ہیں جو سود ہے، جبکہ اسلامی بینک منافع اور نقصان کی شراکت یعنی پی ایل ایس پر کام کرتے ہیں۔\n\nاس میں مضاربہ یعنی ایک پارٹنر پیسہ دیتا ہے اور دوسرا محنت کرتا ہے، اور مشارکہ یعنی ساجھے داری کے معاہدے ہوتے ہیں۔ بینک کی مصنوعات کی نگرانی شرعی بورڈ اور علماء کرتے ہیں۔\n\nگاڑی کے لیے بینک براہ راست قرض نہیں دیتا بلکہ لاگت پلس فروخت یعنی مرابحہ یا کرایہ یعنی اجارہ کے ذریعے اثاثہ فراہم کرتا ہے۔ یہ حلال فنانس کی بہترین مثال ہے۔"
        )
    },
    "islamic banking": {
        "roman_urdu": (
            "Islami Banking sood yani Riba se paak banking system hai jo Shariah ke principles par chalta hai. Conventional bank guaranteed fixed interest dete hain jo sood hai, jabke Islamic banks Profit and Loss Sharing yani PLS par kaam karte hain.\n\n"
            "Is mein Mudarabah yani ek partner paisa deta hai aur dusra mehnat karta hai, aur Musharakah yani sajhedari ke contracts hote hain. Bank products ko Shariah Board aur scholars supervise karte hain.\n\n"
            "Gari ke liye bank direct loan nahi deta balke cost-plus sale yani Murabahah ya renting yani Ijarah ke zariye asset farahim karta hai. Yeh halal finance ki behtareen misal hai."
        ),
        "urdu_script": (
            "اسلامی بینکنگ سود یعنی ربا سے پاک بینکنگ سسٹم ہے جو شریعت کے اصولوں پر چلتا ہے۔ روایتی بینک گارنٹیڈ فکسڈ سود دیتے ہیں جو سود ہے، جبکہ اسلامی بینک منافع اور نقصان کی شراکت یعنی پی ایل ایس پر کام کرتے ہیں۔\n\nاس میں مضاربہ یعنی ایک پارٹنر پیسہ دیتا ہے اور دوسرا محنت کرتا ہے، اور مشارکہ یعنی ساجھے داری کے معاہدے ہوتے ہیں۔ بینک کی مصنوعات کی نگرانی شرعی بورڈ اور علماء کرتے ہیں۔\n\nگاڑی کے لیے بینک براہ راست قرض نہیں دیتا بلکہ لاگت پلس فروخت یعنی مرابحہ یا کرایہ یعنی اجارہ کے ذریعے اثاثہ فراہم کرتا ہے۔ یہ حلال فنانس کی بہترین مثال ہے۔"
        )
    },
    "stock market kya hai": {
        "roman_urdu": (
            "Stock Market yani Hissas Bazaar listed companies ke shares ki khareed-o-ferokht ka platform hai, jaise Pakistan Stock Exchange yani PSX. Share khareedne se aap company ke fractional owner yani hissadar ban jate hain.\n\n"
            "Shareholders do tarah se kamate hain. Pehla tareeqa Dividend hai yani company ke munafay ka cash hissa, aur dusra Capital Gain hai yani share price barhne par sasta khareed kar mehnga bechne par hota hai.\n\n"
            "Stock market mein invest karne ke liye licensed broker ke paas trading aur CDC account hona zaroori hai. Speculation se bach kar fundamental analysis ke sath blue chip stocks mein invest karna safe rehta hai."
        ),
        "urdu_script": (
            "اسٹاک مارکیٹ یعنی حصص بازار لسٹڈ کمپنیوں کے شیئرز کی خرید و فروخت کا پلیٹ فارم ہے، جیسے پاکستان اسٹاک ایکسچینج یعنی پی ایس ایکس۔ شیئر خریدنے سے آپ کمپنی کے حصہ دار بن جاتے ہیں۔\n\nشیئر ہولڈرز دو طرح سے کماتے ہیں۔ پہلا طریقہ ڈیویڈنڈ ہے یعنی کمپنی کے منافع کا کیش حصہ، اور دوسرا کیپیٹل گین ہے یعنی شیئر کی قیمت بڑھنے پر سستا خرید کر مہنگا بیچنے پر ہوتا ہے۔\n\nاسٹاک مارکیٹ میں انویسٹ کرنے کے لیے لائسنس یافتہ بروکر کے پاس ٹریڈنگ اور سی ڈی سی اکاؤنٹ ہونا ضروری ہے۔ اسٹے بازی سے بچ کر بنیادی تجزیہ کے ساتھ اچھی کمپنیوں میں انویسٹ کرنا محفوظ رہتا ہے۔"
        )
    },
    "stock market": {
        "roman_urdu": (
            "Stock Market yani Hissas Bazaar listed companies ke shares ki khareed-o-ferokht ka platform hai, jaise Pakistan Stock Exchange yani PSX. Share khareedne se aap company ke fractional owner yani hissadar ban jate hain.\n\n"
            "Shareholders do tarah se kamate hain. Pehla tareeqa Dividend hai yani company ke munafay ka cash hissa, aur dusra Capital Gain hai yani share price barhne par sasta khareed kar mehnga bechne par hota hai.\n\n"
            "Stock market mein invest karne ke liye licensed broker ke paas trading aur CDC account hona zaroori hai. Speculation se bach kar fundamental analysis ke sath blue chip stocks mein invest karna safe rehta hai."
        ),
        "urdu_script": (
            "اسٹاک مارکیٹ یعنی حصص بازار لسٹڈ کمپنیوں کے شیئرز کی خرید و فروخت کا پلیٹ فارم ہے، جیسے پاکستان اسٹاک ایکسچینج یعنی پی ایس ایکس۔ شیئر خریدنے سے آپ کمپنی کے حصہ دار بن جاتے ہیں۔\n\nشیئر ہولڈرز دو طرح سے کماتے ہیں۔ پہلا طریقہ ڈیویڈنڈ ہے یعنی کمپنی کے منافع کا کیش حصہ، اور دوسرا کیپیٹل گین ہے یعنی شیئر کی قیمت بڑھنے پر سستا خرید کر مہنگا بیچنے پر ہوتا ہے۔\n\nاسٹاک مارکیٹ میں انویسٹ کرنے کے لیے لائسنس یافتہ بروکر کے پاس ٹریڈنگ اور سی ڈی سی اکاؤنٹ ہونا ضروری ہے۔ اسٹے بازی سے بچ کر بنیادی تجزیہ کے ساتھ اچھی کمپنیوں میں انویسٹ کرنا محفوظ رہتا ہے۔"
        )
    },
}


def _strip_markdown(text: str) -> str:
    """Remove markdown formatting symbols."""
    text = re.sub(r'\*{1,3}', '', text)
    text = re.sub(r'^#{1,6}\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)
    text = re.sub(r'\[([^\]]+)\]', r'\1', text)
    text = re.sub(r'^\s*[-•]\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'`', '', text)
    text = re.sub(r'  +', ' ', text)
    return text.strip()


# ═══════════════════════════════════════════════════════════════
# TUTOR RESPONSE GENERATION
# ═══════════════════════════════════════════════════════════════

async def generate_tutor_response(
    user_message: str,
    user_id: int,
    session: Session,
) -> dict:
    """
    Generate a tutor response for the user's message using Hybrid Graph-RAG,
    conversation memory, caching, and a unified Gemini JSON call.
    """
    from app.services.profiler import ConsoleProfiler
    
    with ConsoleProfiler("Total generate_tutor_response pipeline", "tutor"):
        # ── Check cache first (Redis with InMemory fallback) ────────
        from app.services.cache import cache
        cache_key = f"tutor_msg_v2:{user_message.strip().lower()}"
        
        with ConsoleProfiler("Persistent Cache Lookup (Redis/In-Memory)", "tutor"):
            try:
                cached_val = cache.get(cache_key)
                if cached_val:
                    cached_data = json.loads(cached_val)
                    # Fetch recommended lesson dynamically
                    cached_data["next_lesson"] = get_next_recommended(user_id, session)
                    return cached_data
            except Exception as e:
                print(f"[tutor] Cache retrieval error: {e}")

        detected = _detect_concepts(user_message)
        next_lesson = get_next_recommended(user_id, session)

        # ── Match demo cache lookups for immediate responses ────────
        clean_msg = user_message.strip().lower().replace("?", "").replace(".", "").replace(",", "")
        cached_response = None
        
        with ConsoleProfiler("Demo Static Cache Check", "tutor"):
            for cache_k, cache_val in _TUTOR_RESPONSE_CACHE.items():
                if cache_k in clean_msg or clean_msg == cache_k:
                    cached_response = cache_val
                    break

            if cached_response:
                roman_urdu = _strip_markdown(cached_response["roman_urdu"])
                urdu_script = _strip_markdown(cached_response["urdu_script"])
                all_detected = list(set(detected + _detect_concepts(roman_urdu)))
                
                result_payload = {
                    "roman_urdu": roman_urdu,
                    "urdu_script": urdu_script,
                    "detected_concepts": all_detected,
                    "next_lesson": next_lesson,
                }
                
                # Save to cache
                try:
                    cache.set(cache_key, json.dumps(result_payload), expire=3600)
                except Exception:
                    pass
                
                # Award XP and update concept mastery
                update_mastery_and_xp(user_id, all_detected, session)
                    
                return result_payload

        # ── Hybrid Graph-RAG Retrieval ─────────────────────────────
        with ConsoleProfiler("Hybrid Graph-RAG Retrieval", "tutor"):
            # 1. Semantic search via ChromaDB vector index
            kb_context_vector = vector_search(user_message, k=3)
            
            # 2. Graph recommendation context
            kb_context_graph = _load_knowledge_context(next_lesson)
            
            # 3. Combine contexts
            kb_context = ""
            if kb_context_vector:
                kb_context += "### RELEVANT INFORMATION CHUNKS:\n" + kb_context_vector + "\n\n"
            if kb_context_graph:
                kb_context += f"### CURRENT CONCEPT STUDY MATERIAL ({next_lesson.upper()}):\n" + kb_context_graph

        # ── Conversation Memory ────────────────────────────────────
        with ConsoleProfiler("DB Chat History Memory Retrieval", "tutor"):
            # Load last 5 messages from database
            statement = select(ChatMessage).where(ChatMessage.user_id == user_id).order_by(ChatMessage.timestamp.desc()).limit(5)
            history_records = list(session.exec(statement).all())
            history_records.reverse()
            
            history_context = ""
            if history_records:
                history_context = "### RECENT CHAT HISTORY:\n"
                for msg in history_records:
                    sender_name = "User" if msg.sender == "user" else "Tutor"
                    history_context += f"{sender_name}: {msg.text}\n"
                history_context += "\n"

        # ── Mock LLM logic ─────────────────────────────────────────
        if settings.USE_MOCK_LLM:
            mock_roman = (
                "Assalam-o-Alaikum! Saving aur investing mein farq yeh hai ke saving mein aap apna paisa "
                "mehfooz rakhte hain jaise bank mein ya kameti mein. Investing mein aap apna paisa "
                "shares ya mutual funds mein lagate hain taake woh barh sake aur inflation ko hara sake. "
                "Pehle saving karein phir investing! Apne advisor se zaroor mashwara karein."
            )
            mock_urdu = (
                "السلام علیکم! بچت اور سرمایہ کاری میں فرق یہ ہے کہ بچت میں آپ اپنا پیسہ محفوظ رکھتے ہیں "
                "جیسے بینک میں۔ سرمایہ کاری میں آپ اپنا پیسہ حصص یا باہمی فنڈز میں لگاتے ہیں تاکہ وہ بڑھ سکے "
                "اور مہنگائی کو ہرا سکے۔ پہلے بچت کریں پھر سرمایہ کاری! اپنے مشیر سے ضرور مشورہ کریں۔"
            )
            all_detected = list(set(detected + _detect_concepts(mock_roman)))
            
            # Award XP and update concept mastery
            update_mastery_and_xp(user_id, all_detected, session)
            
            return {
                "roman_urdu": mock_roman,
                "urdu_script": mock_urdu,
                "detected_concepts": all_detected,
                "next_lesson": next_lesson,
            }

        # ── Real: Gemini Chat Completion (Structured JSON) ──────────
        with ConsoleProfiler("Gemini LLM Call (Roman + Script Urdu)", "tutor"):
            # Query User Mastery scores from DB
            mastery_records = session.exec(
                select(ConceptMastery).where(ConceptMastery.user_id == user_id)
            ).all()
            
            total_score = 0
            mastered_count = 0
            mastery_details = []
            for record in mastery_records:
                total_score += record.mastery_score
                mastery_details.append(f"- {record.concept_name}: {record.mastery_score}%")
                if record.mastery_score >= 75:
                    mastered_count += 1
            
            # Classify user level based on mastery score count
            if mastered_count <= 2:
                user_level = "Beginner (Mubtadi)"
                level_instruction = (
                    "The user is a BEGINNER. Keep your language simple, avoid complex financial jargon, "
                    "explain everything with basic analogies, and focus on fundamental concepts like saving "
                    "and simple budgeting. Keep sentences short and use basic everyday examples."
                )
            elif mastered_count <= 6:
                user_level = "Intermediate (Darmiyana)"
                level_instruction = (
                    "The user is an INTERMEDIATE learner. You can use standard financial terms but explain them briefly. "
                    "Use slightly more advanced analogies and practical calculations, focusing on inflation, mutual funds, "
                    "and risk-return balance."
                )
            else:
                user_level = "Advanced (Mahir)"
                level_instruction = (
                    "The user is an ADVANCED learner. You can use advanced financial concepts, speak at a professional level, "
                    "discuss complex portfolio asset allocation, stock market strategies, SECP regulations, tax brackets, "
                    "and Shariah compliance rules in detail without over-simplifying."
                )

            mastery_scores_str = "\n".join(mastery_details) if mastery_details else "No masteries recorded yet."
            print(f"[tutor] User ID {user_id} evaluated: level={user_level}, mastered_count={mastered_count}")

            try:
                import google.generativeai as genai

                genai.configure(api_key=settings.GEMINI_API_KEY)
                system_prompt = get_tutor_system_prompt(
                    context=kb_context,
                    user_level=user_level,
                    level_instruction=level_instruction,
                    mastery_scores_str=mastery_scores_str
                )
                
                # Combine system prompt with memory history context
                full_system_prompt = system_prompt
                if history_context:
                    full_system_prompt += "\n" + history_context

                model = genai.GenerativeModel(
                    model_name=settings.GEMINI_MODEL_NAME,
                    system_instruction=full_system_prompt,
                )

                response = await asyncio.to_thread(
                    model.generate_content,
                    user_message,
                    generation_config=genai.types.GenerationConfig(
                        max_output_tokens=800,
                        temperature=0.7,
                        response_mime_type="application/json"
                    )
                )

                raw_text = response.text.strip() if response.text else "{}"
                roman_urdu = ""
                urdu_script = ""
                parsed_success = False

                # 1. Clean markdown code blocks from JSON
                cleaned_text = raw_text
                if cleaned_text.startswith("```"):
                    cleaned_text = re.sub(r"^```(?:json)?\n", "", cleaned_text, flags=re.IGNORECASE)
                    cleaned_text = re.sub(r"\n```$", "", cleaned_text)
                    cleaned_text = cleaned_text.strip()

                # 2. Try standard json loads
                try:
                    parsed = json.loads(cleaned_text)
                    roman_urdu = _strip_markdown(parsed.get("roman_urdu", ""))
                    urdu_script = _strip_markdown(parsed.get("urdu_script", ""))
                    parsed_success = True
                except Exception as parse_exc:
                    print(f"[graph_rag] json.loads failed on raw text: {parse_exc}")

                # 3. Regex extraction fallback if JSON loads failed
                if not parsed_success:
                    roman_match = re.search(r'"roman_urdu"\s*:\s*"((?:[^"\\]|\\.)*)"', cleaned_text)
                    urdu_match = re.search(r'"urdu_script"\s*:\s*"((?:[^"\\]|\\.)*)"', cleaned_text)

                    if roman_match:
                        try:
                            roman_urdu = json.loads(f'"{roman_match.group(1)}"')
                        except Exception:
                            roman_urdu = roman_match.group(1)
                    if urdu_match:
                        try:
                            urdu_script = json.loads(f'"{urdu_match.group(1)}"')
                        except Exception:
                            urdu_script = urdu_match.group(1)

                    if roman_urdu or urdu_script:
                        roman_urdu = _strip_markdown(roman_urdu)
                        urdu_script = _strip_markdown(urdu_script)
                        parsed_success = True

                # 4. Ultimate fallback: assume plain text (prevent JSON syntax leaking to user)
                if not parsed_success:
                    print(f"[graph_rag] JSON & Regex parsing failed. Treating as plain text. Raw: {raw_text}")
                    cleaned_fallback = cleaned_text
                    for key in ["roman_urdu", "urdu_script"]:
                        cleaned_fallback = re.sub(rf'"{key}"\s*:\s*', '', cleaned_fallback, flags=re.IGNORECASE)
                    cleaned_fallback = cleaned_fallback.strip('{}[]"\' \n\t,')
                    roman_urdu = _strip_markdown(cleaned_fallback)
                    from app.services.speech import translate_roman_to_urdu_script
                    urdu_script = await translate_roman_to_urdu_script(roman_urdu)

                all_detected = list(set(detected + _detect_concepts(roman_urdu)))

                result_payload = {
                    "roman_urdu": roman_urdu,
                    "urdu_script": urdu_script,
                    "detected_concepts": all_detected,
                    "next_lesson": next_lesson,
                }

                # Cache successful response
                try:
                    cache.set(cache_key, json.dumps(result_payload), expire=3600)
                except Exception:
                    pass

                # Award XP and update concept mastery
                update_mastery_and_xp(user_id, all_detected, session)

                return result_payload

            except Exception as exc:
                print(f"[graph_rag] Gemini LLM generation error: {exc}")
                return {
                    "roman_urdu": "Maaf kijiye, is waqt jawab dene mein kuch masla ho raha hai.",
                    "urdu_script": "معاف کیجیے، اس وقت جواب دینے میں کچھ مسئلہ ہو رہا ہے۔",
                    "detected_concepts": detected,
                    "next_lesson": next_lesson,
                }
