from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.models import QuizAttempt, User, ConceptMastery
from app.schemas import (
    QuestionExplanation,
    QuizQuestionResponse,
    QuizSubmitRequest,
    QuizSubmitResponse,
)
from app.services.quiz_data import QUIZ_QUESTIONS

LEVEL_TO_CONCEPT = {
    1: "budgeting",
    2: "saving",
    3: "emergency_funds",
    4: "inflation",
    5: "investing",
    6: "mutual_funds",
    7: "islamic_banking",
    8: "stock_market",
    9: "diversification",
    10: "tax_filer",
}

router = APIRouter(prefix="/api/quiz", tags=["quiz"])


@router.get("/questions/{level}", response_model=list[QuizQuestionResponse])
def get_quiz_questions(level: int):
    """Retrieve the 20 MCQs for a given level (without correct answers or explanations)."""
    if level < 1 or level > 10:
        raise HTTPException(
            status_code=400,
            detail="Invalid level. Level must be between 1 and 10."
        )

    # Filter questions for the specific level
    level_questions = [q for q in QUIZ_QUESTIONS if q.get("level") == level]
    
    if len(level_questions) != 20:
        raise HTTPException(
            status_code=404,
            detail=f"Could not find exactly 20 questions for Level {level}."
        )

    # Return questions with correct_option and explanation stripped out
    return [
        QuizQuestionResponse(
            id=q["id"],
            level=q["level"],
            question=q["question"],
            options=q["options"],
        )
        for q in level_questions
    ]


@router.post("/submit", response_model=QuizSubmitResponse)
def submit_quiz(
    request: QuizSubmitRequest,
    session: Session = Depends(get_session),
) -> QuizSubmitResponse:
    """Grade the quiz submission, record the attempt, and increment user level if passed."""
    # 1. Fetch user (with fallback for robustness)
    user = session.get(User, request.user_id)
    if not user:
        user = session.get(User, 1) or session.exec(select(User)).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        request.user_id = user.id

    # 2. Filter questions for the specific level
    level = request.level
    if level < 1 or level > 10:
        raise HTTPException(status_code=400, detail="Invalid level. Level must be between 1 and 10.")

    questions_by_id = {q["id"]: q for q in QUIZ_QUESTIONS if q.get("level") == level}
    if len(questions_by_id) != 20:
        raise HTTPException(
            status_code=500,
            detail=f"Database configuration error: Level {level} does not have exactly 20 questions."
        )

    # 3. Validate that user has answered all 20 questions for this level
    submitted_ids = {a.question_id for a in request.answers}
    if submitted_ids != set(questions_by_id.keys()):
        raise HTTPException(
            status_code=400,
            detail="Must provide answers for all 20 questions of the specified level"
        )

    # 4. Grade submission
    score = 0
    details = []
    # Order details in the same order as request.answers (or by question ID for consistency)
    sorted_answers = sorted(request.answers, key=lambda a: a.question_id)
    for answer in sorted_answers:
        q = questions_by_id[answer.question_id]
        is_correct = answer.selected_option.lower().strip() == q["correct_option"].lower().strip()
        if is_correct:
            score += 1

        details.append(
            QuestionExplanation(
                question_id=q["id"],
                correct_option=q["correct_option"],
                explanation=q["explanation"],
                is_correct=is_correct,
            )
        )

    passed = score >= 15

    # 5. Record the attempt in the database
    attempt = QuizAttempt(
        user_id=request.user_id,
        level=level,
        score=score,
        passed=passed,
        attempted_at=datetime.utcnow(),
    )
    session.add(attempt)

    # 5b. Update ConceptMastery for the user
    mastery_percentage = int((score / 20.0) * 100)
    concept_name = LEVEL_TO_CONCEPT.get(level)
    if concept_name:
        mastery_stmt = select(ConceptMastery).where(
            ConceptMastery.user_id == request.user_id,
            ConceptMastery.concept_name == concept_name
        )
        mastery = session.exec(mastery_stmt).first()
        if not mastery:
            mastery = ConceptMastery(
                user_id=request.user_id,
                concept_name=concept_name,
                mastery_score=mastery_percentage,
                updated_at=datetime.utcnow()
            )
            session.add(mastery)
        else:
            mastery.mastery_score = max(mastery.mastery_score, mastery_percentage)
            mastery.updated_at = datetime.utcnow()
            session.add(mastery)

    # 6. Increment user level if they passed the quiz for their CURRENT level
    if passed and user.current_level == level:
        if user.current_level < 10:
            user.current_level += 1
            session.add(user)
            # Award XP bonus on levelling up
            user.current_xp += 200
            session.add(user)

    session.commit()
    session.refresh(user)

    return QuizSubmitResponse(
        score=score,
        passed=passed,
        current_level=user.current_level,
        details=details,
    )
