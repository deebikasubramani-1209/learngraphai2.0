import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.entities import Question, QuizAttempt, Mastery, MasteryHistory, Concept, Student, Recommendation
from app.schemas.api_schemas import QuestionOption, QuizSubmitRequest, QuizSubmitResponse, QuestionFeedback
from app.services.mastery import calculate_mastery_update, classify_stability
from app.services.recommendation import generate_revision_recommendations
from app.services.dependency import analyze_dependencies_and_bottlenecks
from app.graph_db import graph_service

router = APIRouter(prefix="", tags=["Quiz & Diagnostic Assessment"])

@router.get("/questions/{concept_id}", response_model=List[QuestionOption])
def get_questions_by_concept(concept_id: str, db: Session = Depends(get_db)):
    """Fetch quiz questions for a given concept."""
    questions = db.query(Question).filter(Question.concept_id == concept_id).all()
    if not questions:
        raise HTTPException(status_code=404, detail="No questions found for this concept")
    
    return [
        QuestionOption(
            id=q.id,
            question_text=q.question_text,
            option_a=q.option_a,
            option_b=q.option_b,
            option_c=q.option_c,
            option_d=q.option_d,
            difficulty=q.difficulty,
            concept_id=q.concept_id
        )
        for q in questions
    ]

@router.post("/quiz/submit", response_model=QuizSubmitResponse)
def submit_quiz(payload: QuizSubmitRequest, db: Session = Depends(get_db)):
    """
    Submits student quiz answers, calculates transparent score,
    updates concept mastery & stability, triggers dependency check,
    and updates explainable revision queue.
    """
    student = db.query(Student).filter(Student.id == payload.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    concept = db.query(Concept).filter(Concept.id == payload.concept_id).first()
    if not concept:
        raise HTTPException(status_code=404, detail="Concept not found")

    if not payload.answers:
        raise HTTPException(status_code=400, detail="No answers provided in submission")

    # Evaluate answers
    question_ids = [a.question_id for a in payload.answers]
    questions = {q.id: q for q in db.query(Question).filter(Question.id.in_(question_ids)).all()}
    
    correct_count = 0
    total_questions = len(payload.answers)
    feedback_items = []
    now = datetime.datetime.utcnow()

    for ans in payload.answers:
        q = questions.get(ans.question_id)
        if not q:
            continue
            
        is_corr = (ans.selected_answer.strip().upper() == q.correct_answer.strip().upper())
        if is_corr:
            correct_count += 1
            
        # Log attempt
        attempt = QuizAttempt(
            student_id=student.id,
            concept_id=concept.id,
            question_id=q.id,
            selected_answer=ans.selected_answer.upper(),
            is_correct=is_corr,
            created_at=now
        )
        db.add(attempt)
        
        feedback_items.append(QuestionFeedback(
            question_id=q.id,
            question_text=q.question_text,
            selected_answer=ans.selected_answer.upper(),
            correct_answer=q.correct_answer,
            is_correct=is_corr,
            explanation=q.explanation
        ))

    # Fetch previous mastery
    existing_mastery = db.query(Mastery).filter(
        Mastery.student_id == student.id,
        Mastery.concept_id == concept.id
    ).first()
    
    prev_score = existing_mastery.mastery_score if existing_mastery else None

    # Calculate mastery update
    raw_score, new_mastery, delta, stability = calculate_mastery_update(
        correct_count=correct_count,
        total_questions=total_questions,
        previous_mastery=prev_score
    )

    # Persist mastery
    if existing_mastery:
        existing_mastery.mastery_score = new_mastery
        existing_mastery.stability = stability
        existing_mastery.last_practiced = now
        existing_mastery.updated_at = now
    else:
        new_rec = Mastery(
            id=f"m-{student.id}-{concept.id}",
            student_id=student.id,
            concept_id=concept.id,
            mastery_score=new_mastery,
            stability=stability,
            last_practiced=now
        )
        db.add(new_rec)

    # Record history point
    history_entry = MasteryHistory(
        student_id=student.id,
        concept_id=concept.id,
        mastery_score=new_mastery,
        recorded_at=now,
        note=f"Quiz completed: {correct_count}/{total_questions} ({raw_score}%)"
    )
    db.add(history_entry)
    db.commit()

    # Recompute student recommendations across all concepts
    all_mastery = db.query(Mastery).filter(Mastery.student_id == student.id).all()
    mastery_map = {}
    for m in all_mastery:
        days_ago = (now - m.last_practiced).days if m.last_practiced else 0
        mastery_map[m.concept_id] = {
            "score": m.mastery_score,
            "peak_score": max(m.mastery_score, 90.0 if m.concept_id == "concept-recursion" else m.mastery_score),
            "days_ago": days_ago,
            "stability": m.stability
        }

    all_concepts = db.query(Concept).all()
    c_meta = {c.id: {"id": c.id, "name": c.name} for c in all_concepts}
    updated_recs = generate_revision_recommendations(student.id, mastery_map, c_meta)

    # Refresh recommendations in DB
    db.query(Recommendation).filter(Recommendation.student_id == student.id).delete()
    for r in updated_recs:
        rec_obj = Recommendation(
            id=f"rec-{student.id}-{r['concept_id']}",
            student_id=student.id,
            concept_id=r["concept_id"],
            priority=r["priority"],
            priority_score=r["priority_score"],
            reason=r["reason"],
            root_cause_concept_id=r.get("root_cause_concept"),
            impacted_concept_id=r["impacted_concepts"][0] if r.get("impacted_concepts") else None
        )
        db.add(rec_obj)
    db.commit()

    # Prerequisite warning if struggling
    prereq_alert = None
    if new_mastery < 70.0:
        prereqs = graph_service.get_prerequisites(concept.id)
        weak_prereqs = []
        for p in prereqs:
            p_score = mastery_map.get(p, {}).get("score", 0.0)
            if p_score < 70.0:
                p_name = c_meta.get(p, {}).get("name", p)
                weak_prereqs.append(f"{p_name} ({p_score:.0f}%)")
        if weak_prereqs:
            prereq_alert = f"Performance alert: Weak prerequisite foundation detected in {', '.join(weak_prereqs)}. Strengthening prerequisite concepts first is recommended."

    feedback_summary = (
        f"You scored {correct_count} of {total_questions} ({raw_score:.0f}%). "
        f"Concept retention is now estimated at {new_mastery:.0f}% ({stability})."
    )

    return QuizSubmitResponse(
        concept_id=concept.id,
        concept_name=concept.name,
        score=raw_score,
        total_questions=total_questions,
        correct_count=correct_count,
        previous_mastery=prev_score if prev_score is not None else raw_score,
        new_mastery=new_mastery,
        mastery_delta=delta,
        stability=stability,
        feedback_summary=feedback_summary,
        prerequisite_alert=prereq_alert,
        questions_feedback=feedback_items
    )
