"""
Pydantic request / response schemas for the Maali Mentor API.

These are intentionally separate from the SQLModel table classes in models.py
so the API surface can evolve independently of the database schema.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# ═══════════════════════════════════════════════════════════════
# AUTH / ONBOARDING
# ═══════════════════════════════════════════════════════════════

class OnboardingAnswer(BaseModel):
    """One answer to an assessment question."""
    question_id: int
    selected_option: str = Field(..., pattern=r"^[a-d]$", description="Must be one of a, b, c, or d")


class OnboardingRequest(BaseModel):
    """Payload for the onboarding / assessment endpoint."""
    username: str = Field(
        ...,
        min_length=2,
        max_length=30,
        pattern=r"^[a-zA-Z0-9_\s\-]+$",
        description="Username must contain only alphanumeric characters, underscores, spaces, or hyphens",
    )
    password: str = Field(
        ...,
        min_length=4,
        max_length=30,
        description="Password must be between 4 and 30 characters",
    )
    email: Optional[str] = Field(default=None, max_length=100, description="Optional valid email address")
    answers: list[OnboardingAnswer] = Field(
        ...,
        min_length=4,
        max_length=4,
        description="Answers to the 4 assessment questions",
    )


class OnboardingResponse(BaseModel):
    """Returned after successful onboarding."""
    user_id: int
    assigned_level: str
    recommended_topics: list[str]
    current_level: int


class LoginRequest(BaseModel):
    """Payload to login a user."""
    username: str = Field(..., min_length=2, max_length=30)
    password: str = Field(..., min_length=4, max_length=30)


class LoginResponse(BaseModel):
    """Returned after successful login."""
    user_id: int
    username: str
    user_level: str
    current_level: int


# ═══════════════════════════════════════════════════════════════
# TUTOR
# ═══════════════════════════════════════════════════════════════

class TutorVoiceResponse(BaseModel):
    """Response from the voice-based tutoring endpoint."""
    user_transcript: str
    tutor_text_response: str
    roman_urdu: Optional[str] = None
    urdu_script: Optional[str] = None
    audio_response_url: Optional[str] = None
    audio_response_base64: Optional[str] = None
    detected_concepts: list[str] = []
    next_recommended_lesson: Optional[str] = None


class TutorTextRequest(BaseModel):
    """Text chat message from the learner."""
    user_id: int
    message: str = Field(..., max_length=2000, description="Chat message text (maximum 2000 characters)")


class TutorTextResponse(BaseModel):
    """Response from the text-based tutoring endpoint."""
    tutor_response: str
    roman_urdu: Optional[str] = None
    urdu_script: Optional[str] = None
    detected_concepts: list[str] = []
    next_recommended_lesson: Optional[str] = None
    audio_response_url: Optional[str] = None
    audio_response_base64: Optional[str] = None



class DictionaryResponse(BaseModel):
    """Urdu financial term definition."""
    term: str
    urdu_term: str
    definition: str
    example: str
    related_concepts: list[str] = []


# ═══════════════════════════════════════════════════════════════
# SIMULATOR
# ═══════════════════════════════════════════════════════════════

class SimulatorStartRequest(BaseModel):
    """Kick off a new simulator session."""
    user_id: int
    starting_age: int = Field(default=25, ge=18, le=60)
    starting_income: float = Field(default=50000.0, gt=0)


class SimulatorTurnRequest(BaseModel):
    """Player decision for one simulator turn (1 year)."""
    user_id: int
    decision_lifestyle_spend: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Fraction of income spent on lifestyle (0-1)",
    )
    # Portfolio allocation split (percentages summing to 1.0)
    allocation_cash: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    allocation_savings: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    allocation_mutual_funds: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    allocation_islamic_funds: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    allocation_gold: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    allocation_real_estate: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    
    # Backwards compatibility
    decision_saving_method: Optional[str] = Field(
        default=None,
        description="One of: cash, savings_account, mutual_funds, islamic_funds",
    )


class SimulatorTurnResponse(BaseModel):
    """Results after processing one simulator turn."""
    new_turn: int
    nominal_wealth: float
    real_purchasing_power: float
    purchasing_power_loss_pct: float
    current_inflation_rate: float
    event_triggered: Optional[str] = None
    cash_value: float
    invested_value: float
    monthly_income: float
    # Individual asset values
    savings_value: Optional[float] = 0.0
    mutual_funds_value: Optional[float] = 0.0
    islamic_funds_value: Optional[float] = 0.0
    gold_value: Optional[float] = 0.0
    real_estate_value: Optional[float] = 0.0


class SimulatorStateResponse(BaseModel):
    """Current simulator snapshot."""
    user_id: int
    current_turn: int
    nominal_wealth: float
    real_purchasing_power: float
    cash_pct: float
    # Individual asset values
    cash_value: Optional[float] = 0.0
    savings_value: Optional[float] = 0.0
    mutual_funds_value: Optional[float] = 0.0
    islamic_funds_value: Optional[float] = 0.0
    gold_value: Optional[float] = 0.0
    real_estate_value: Optional[float] = 0.0


# ═══════════════════════════════════════════════════════════════
# GOALS / PLANNER
# ═══════════════════════════════════════════════════════════════

class GoalCalculateRequest(BaseModel):
    """Inputs for goal savings calculation."""
    target_amount: float = Field(..., gt=0)
    target_years: int = Field(..., ge=1)
    risk_tolerance: str = Field(default="moderate")
    expected_annual_return: float = Field(default=0.12, ge=0.0, le=1.0)
    inflation_rate: float = Field(default=0.15, ge=0.0, le=1.0)


class SuggestedProduct(BaseModel):
    """A Pakistani financial product recommendation."""
    name: str
    category: str
    expected_return: str
    risk_level: str
    description: str


class GoalCalculateResponse(BaseModel):
    """Results of a goal savings calculation."""
    future_target_amount: float
    monthly_saving_needed: float
    total_months: int
    suggested_products: list[SuggestedProduct] = []


class GoalSaveRequest(BaseModel):
    """Save a goal for a user."""
    user_id: int
    goal_type: str = Field(..., min_length=2, max_length=50, pattern=r"^[a-zA-Z0-9_\-]+$")
    target_amount: float = Field(..., gt=0, description="Target amount must be positive")
    target_years: int = Field(..., ge=1, le=100, description="Target years must be between 1 and 100")
    risk_tolerance: str = Field(
        default="moderate",
        pattern=r"^(low|moderate|high|conservative|aggressive)$",
        description="Must be low, moderate, high, conservative, or aggressive"
    )


class GoalResponse(BaseModel):
    """A persisted goal."""
    id: int
    goal_type: str
    target_amount: float
    current_savings: float
    target_years: int
    risk_tolerance: str
    created_at: datetime


# ═══════════════════════════════════════════════════════════════
# DASHBOARD
# ═══════════════════════════════════════════════════════════════

class ConceptMasteryItem(BaseModel):
    """Single concept mastery entry for the dashboard."""
    concept_name: str
    mastery_score: int


class DashboardResponse(BaseModel):
    """Aggregated dashboard data for a user."""
    user_id: int
    username: str
    user_level: str
    current_level: int
    current_xp: int
    onboarding_completed: bool
    concept_mastery: list[ConceptMasteryItem] = []
    goals: list[GoalResponse] = []


# ═══════════════════════════════════════════════════════════════
# QUIZ / LEVELS
# ═══════════════════════════════════════════════════════════════

class QuizQuestionResponse(BaseModel):
    """Question representation sent to the client (excludes correct_option and explanation)."""
    id: int
    level: int
    question: str
    options: dict[str, str]


class QuizAnswer(BaseModel):
    """User response to a single quiz question."""
    question_id: int
    selected_option: str = Field(..., pattern=r"^[a-d]?$", description="Must be one of a, b, c, d, or empty if skipped")


class QuizSubmitRequest(BaseModel):
    """Payload to submit quiz answers for grading."""
    user_id: int
    level: int
    answers: list[QuizAnswer] = Field(..., min_length=20, max_length=20, description="Answers to all 20 questions")


class QuestionExplanation(BaseModel):
    """Detailed result for a single question after grading."""
    question_id: int
    correct_option: str
    explanation: str
    is_correct: bool


class QuizSubmitResponse(BaseModel):
    """Grading results returned to the client."""
    score: int
    passed: bool
    current_level: int
    current_xp: int
    details: list[QuestionExplanation]


# STUDY / LESSON COMPLETION
# ═══════════════════════════════════════════════════════════════

class StudyCompleteRequest(BaseModel):
    """Payload to mark a concept study lesson as completed."""
    user_id: int
    concept_name: str


class StudyCompleteResponse(BaseModel):
    """Result of marking a lesson as completed."""
    success: bool
    concept_name: str
    mastery_score: int
    xp_awarded: int
    current_xp: int


