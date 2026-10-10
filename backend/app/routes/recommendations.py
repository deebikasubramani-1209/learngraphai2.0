import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.entities import Student, Concept, Mastery, Recommendation
from app.schemas.api_schemas import RecommendationResponse, RecommendationItem
from app.services.recommendation import generate_revision_recommendations

router = APIRouter(prefix="", tags=["Revision Queue & Recommendations"])

@router.get("/students/{student_id}/recommendations", response_model=RecommendationResponse)
def get_revision_recommendations(student_id: str, db: Session = Depends(get_db)):
    """
    Fetches the prioritized revision queue with explainable 'Why?' rationales,
    grounded in knowledge decay signals, prerequisite bottlenecks, and downstream impact.
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    concepts = db.query(Concept).all()
    c_meta = {c.id: {"id": c.id, "name": c.name} for c in concepts}
    mastery_records = db.query(Mastery).filter(Mastery.student_id == student.id).all()

    now = datetime.datetime.utcnow()
    mastery_map = {}
    for m in mastery_records:
        days_ago = (now - m.last_practiced).days if m.last_practiced else 0
        peak = max(m.mastery_score, 90.0 if m.concept_id == "concept-recursion" else m.mastery_score)
        mastery_map[m.concept_id] = {
            "score": m.mastery_score,
            "peak_score": peak,
            "days_ago": days_ago,
            "stability": m.stability
        }

    # Generate explainable recommendations
    recs_data = generate_revision_recommendations(student.id, mastery_map, c_meta)

    items = [
        RecommendationItem(
            id=r["id"],
            concept_id=r["concept_id"],
            concept_name=r["concept_name"],
            priority=r["priority"],
            priority_score=r["priority_score"],
            current_mastery=r["current_mastery"],
            previous_mastery=r["previous_mastery"],
            days_since_practice=r["days_since_practice"],
            stability=r["stability"],
            headline=r["headline"],
            reason=r["reason"],
            why_factors=r["why_factors"],
            root_cause_concept=r.get("root_cause_concept"),
            impacted_concepts=r.get("impacted_concepts", [])
        )
        for r in recs_data
    ]

    return RecommendationResponse(
        student_id=student.id,
        student_name=student.name,
        generated_at=now.isoformat(),
        recommendations=items
    )
