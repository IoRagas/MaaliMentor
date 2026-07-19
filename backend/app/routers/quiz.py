from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.models import QuizAttempt, User, ConceptMastery, ActivityLog
from app.schemas import (
    QuestionExplanation,
    QuizQuestionResponse,
    QuizSubmitRequest,
    QuizSubmitResponse,
    StudyCompleteRequest,
    StudyCompleteResponse,
)
from app.services.quiz_data import QUIZ_QUESTIONS
from app.services.streak import update_streak

LEVEL_TO_CONCEPT = {
    1: "budgeting",
    2: "saving",
    3: "emergency_funds",
    4: "inflation",
    5: "tax_basics",
    6: "investing",
    71: "mutual_funds",
    72: "islamic_banking",
    81: "stock_market",
    82: "gold_real_estate",
    9: "diversification",
    10: "retirement",
}

router = APIRouter(prefix="/api/quiz", tags=["quiz"])


@router.get("/questions/{level}", response_model=list[QuizQuestionResponse])
def get_quiz_questions(level: int):
    """Retrieve the 20 MCQs for a given level (without correct answers or explanations)."""
    valid_levels = {1, 2, 3, 4, 5, 6, 71, 72, 81, 82, 9, 10}
    if level not in valid_levels:
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
    valid_levels = {1, 2, 3, 4, 5, 6, 71, 72, 81, 82, 9, 10}
    if level not in valid_levels:
        raise HTTPException(status_code=400, detail="Invalid level. Level must be a valid curriculum node level.")

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
    is_first_pass = False

    if concept_name:
        mastery_stmt = select(ConceptMastery).where(
            ConceptMastery.user_id == request.user_id,
            ConceptMastery.concept_name == concept_name
        )
        mastery = session.exec(mastery_stmt).first()
        if not mastery:
            is_first_pass = (mastery_percentage >= 75)
            mastery = ConceptMastery(
                user_id=request.user_id,
                concept_name=concept_name,
                mastery_score=mastery_percentage,
                updated_at=datetime.utcnow()
            )
            session.add(mastery)
        else:
            is_first_pass = (mastery.mastery_score < 75 and mastery_percentage >= 75)
            mastery.mastery_score = max(mastery.mastery_score, mastery_percentage)
            mastery.updated_at = datetime.utcnow()
            session.add(mastery)

    # Award XP systematically and track breakdown:
    xp_breakdown: dict = {}
    xp_total = 0

    # 1. Effort XP for attempting the quiz
    user.current_xp += 20
    xp_breakdown["attempt"] = 20
    xp_total += 20

    # 2. Achievement XP for passing the concept for the first time
    if is_first_pass:
        user.current_xp += 100
        xp_breakdown["first_pass"] = 100
        xp_total += 100

    # 3. Level-up XP for passing the current-level quiz
    is_current_level_match = (
        user.current_level == level or
        (user.current_level == 7 and level in (71, 72)) or
        (user.current_level == 8 and level in (81, 82))
    )
    level_did_up = False
    if passed and is_current_level_match:
        if user.current_level < 10:
            user.current_level += 1
            user.current_xp += 200
            xp_breakdown["level_up"] = 200
            xp_total += 200
            level_did_up = True

    # Update user level dynamically based on mastery count
    mastery_records = session.exec(select(ConceptMastery).where(ConceptMastery.user_id == user.id)).all()
    mastered_count = sum(1 for m in mastery_records if m.mastery_score >= 75)
    if mastered_count <= 2:
        new_user_level = "Beginner"
    elif mastered_count <= 6:
        new_user_level = "Intermediate"
    else:
        new_user_level = "Advanced"

    if user.user_level != new_user_level:
        user.user_level = new_user_level
        session.add(user)

    # Create activity logs
    if passed:
        log_detail = f"Passed Level {level} Quiz ({concept_name}) with score {score}/20! 🎓"
        log = ActivityLog(
            user_id=user.id,
            activity_type="quiz_passed",
            detail=log_detail,
            xp_earned=xp_total
        )
        session.add(log)
    else:
        log_detail = f"Attempted Level {level} Quiz ({concept_name}) with score {score}/20."
        log = ActivityLog(
            user_id=user.id,
            activity_type="quiz_attempted",
            detail=log_detail,
            xp_earned=20
        )
        session.add(log)

    if level_did_up:
        lvl_log = ActivityLog(
            user_id=user.id,
            activity_type="level_up",
            detail=f"Ascended to Level {user.current_level}: {new_user_level}! 🌟",
            xp_earned=0
        )
        session.add(lvl_log)

    update_streak(user, session)
    session.commit()
    session.refresh(user)

    return QuizSubmitResponse(
        score=score,
        passed=passed,
        current_level=user.current_level,
        current_xp=user.current_xp,
        details=details,
        xp_awarded=xp_total,
        xp_breakdown=xp_breakdown,
    )


@router.post("/study/complete", response_model=StudyCompleteResponse)
def complete_study(
    request: StudyCompleteRequest,
    session: Session = Depends(get_session),
) -> StudyCompleteResponse:
    """Mark a concept study lesson as completed, update mastery score and award XP."""
    user = session.get(User, request.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if concept_name is valid
    if request.concept_name not in LEVEL_TO_CONCEPT.values():
        raise HTTPException(
            status_code=400,
            detail=f"Invalid concept name '{request.concept_name}'."
        )

    # Fetch or create ConceptMastery record
    mastery_stmt = select(ConceptMastery).where(
        ConceptMastery.user_id == request.user_id,
        ConceptMastery.concept_name == request.concept_name
    )
    mastery = session.exec(mastery_stmt).first()
    
    # We set a baseline mastery score of 50% for studying the guide.
    # If the user has already achieved a higher score (e.g. by passing the quiz), we keep it.
    old_score = 0
    study_completed = False
    if mastery:
        old_score = mastery.mastery_score
        study_completed = mastery.study_completed

    xp_awarded = 0
    if not study_completed:
        xp_awarded = 50
        user.current_xp += xp_awarded
        session.add(user)

    target_score = max(old_score, 50)

    if not mastery:
        mastery = ConceptMastery(
            user_id=request.user_id,
            concept_name=request.concept_name,
            mastery_score=target_score,
            study_completed=True,
            updated_at=datetime.utcnow()
        )
    else:
        mastery.mastery_score = target_score
        mastery.study_completed = True
        mastery.updated_at = datetime.utcnow()
    
    session.add(mastery)
    
    # Log study completion activity
    log = ActivityLog(
        user_id=request.user_id,
        activity_type="study_complete",
        detail=f"Finished studying the lesson guide for: {request.concept_name.replace('_', ' ').title()} 📖",
        xp_earned=xp_awarded
    )
    session.add(log)

    update_streak(user, session)
    session.commit()
    session.refresh(user)
    session.refresh(mastery)

    return StudyCompleteResponse(
        success=True,
        concept_name=request.concept_name,
        mastery_score=mastery.mastery_score,
        xp_awarded=xp_awarded,
        current_xp=user.current_xp
    )

