from typing import List, Dict, Any, Optional
from app.config import settings
from app.services.dependency import analyze_dependencies_and_bottlenecks
from app.graph_db import graph_service

def generate_revision_recommendations(
    student_id: str,
    mastery_map: Dict[str, Dict[str, Any]],
    concept_metadata: Dict[str, Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Module 4: Revision Recommender
    Computes explainable, multi-factor priority score:
    Score = W1 * (100 - mastery) + W2 * (decay_urgency) + W3 * (dependency_impact)
    
    Generates transparent 'Why?' explanations for each recommendation.
    """
    dep_analysis = analyze_dependencies_and_bottlenecks(mastery_map)
    bottlenecks = dep_analysis["bottlenecks"]
    
    recommendation_candidates = []

    for concept_id, m_data in mastery_map.items():
        score = m_data.get("score", 0.0)
        days_ago = m_data.get("days_ago") or 0
        stability = m_data.get("stability", "Stable")
        peak_score = m_data.get("peak_score", score)
        c_meta = concept_metadata.get(concept_id, {})
        concept_name = c_meta.get("name", concept_id.replace("concept-", "").capitalize())
        
        # Don't recommend concepts not yet unlocked or untouched (e.g., Graphs if score 0 and no prereqs met)
        prereqs = graph_service.get_prerequisites(concept_id)
        prereqs_met = all(mastery_map.get(p, {}).get("score", 0.0) >= settings.THRESHOLD_STABLE for p in prereqs)
        
        # We focus revision on concepts that were studied (peak_score > 0) or currently attempted
        if peak_score <= 0.0 and score <= 0.0:
            continue

        # 1. Mastery Deficit Component (0 to 100)
        mastery_deficit = max(0.0, 100.0 - score)

        # 2. Decay Urgency Component (0 to 100)
        # 21+ days without practice yields high urgency
        decay_urgency = min(100.0, (days_ago / 25.0) * 100.0) if days_ago > 0 else 0.0

        # 3. Dependency Impact Component (0 to 100)
        # Heavy bonus if this concept is an identified bottleneck blocking downstream learning!
        is_bottleneck = concept_id in bottlenecks
        blocking_concepts = bottlenecks[concept_id]["blocking_concepts"] if is_bottleneck else []
        blocking_names = [concept_metadata.get(cid, {}).get("name", cid) for cid in blocking_concepts]
        
        downstream_all = graph_service.get_downstream_dependents(concept_id)
        downstream_importance = len(downstream_all) * 20.0
        if is_bottleneck:
            downstream_importance += 40.0
        downstream_importance = min(100.0, downstream_importance)

        # Combined multi-factor priority score
        priority_score = (
            settings.WEIGHT_MASTERY_DEFICIT * mastery_deficit +
            settings.WEIGHT_DECAY_URGENCY * decay_urgency +
            settings.WEIGHT_DOWNSTREAM_IMPACT * downstream_importance
        )
        priority_score = round(priority_score, 1)

        # Build Explainable 'Why?' Rationales
        why_factors = [
            f"Current estimated mastery: {score:.0f}% ({stability})",
        ]
        if peak_score > score:
            why_factors.append(f"Previous verified mastery was {peak_score:.0f}% (decayed after {days_ago} days)")
        elif days_ago > 0:
            why_factors.append(f"Days since last practice: {days_ago} days")

        if is_bottleneck:
            why_factors.append(f"Prerequisite bottleneck for: {', '.join(blocking_names)}")
            why_factors.append("Struggles in downstream concepts stem from foundational decay here")
            headline = f"Revise {concept_name} first."
            reason = f"Recursion is a critical prerequisite for {', '.join(blocking_names)}. Addressing this foundation resolves downstream blockers."
        elif score < settings.THRESHOLD_WEAKENING:
            headline = f"Urgent review: {concept_name} is at risk."
            reason = f"Mastery has fallen to {score:.0f}%, placing core comprehension at risk."
        elif decay_urgency >= 60.0:
            headline = f"Scheduled refresh: {concept_name}."
            reason = f"Retention decay estimated at {decay_urgency:.0f}% urgency due to {days_ago} days without practice."
        else:
            headline = f"Reinforce {concept_name}."
            reason = f"Consolidate {concept_name} to maintain long-term stability above {settings.THRESHOLD_STRONG}%."

        recommendation_candidates.append({
            "id": f"rec-{concept_id}",
            "concept_id": concept_id,
            "concept_name": concept_name,
            "priority_score": priority_score,
            "current_mastery": score,
            "previous_mastery": peak_score if peak_score > score else None,
            "days_since_practice": days_ago if days_ago > 0 else None,
            "stability": stability,
            "headline": headline,
            "reason": reason,
            "why_factors": why_factors,
            "root_cause_concept": concept_id if is_bottleneck else None,
            "impacted_concepts": blocking_names
        })

    # Sort descending by priority score (highest score = Priority 1)
    recommendation_candidates.sort(key=lambda x: x["priority_score"], reverse=True)

    # Assign 1-based ranks
    for rank, item in enumerate(recommendation_candidates, 1):
        item["priority"] = rank

    return recommendation_candidates
