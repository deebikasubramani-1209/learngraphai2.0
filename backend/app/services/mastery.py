from typing import Tuple, Dict, Any
from app.config import settings

def classify_stability(score: float) -> str:
    """
    Categorizes mastery score into clear stability states:
    >= 85.0 -> Strong
    70.0 - 84.9 -> Stable
    50.0 - 69.9 -> Weakening
    < 50.0 -> At Risk
    """
    if score >= settings.THRESHOLD_STRONG:
        return "Strong"
    elif score >= settings.THRESHOLD_STABLE:
        return "Stable"
    elif score >= settings.THRESHOLD_WEAKENING:
        return "Weakening"
    else:
        return "At Risk"

def calculate_mastery_update(
    correct_count: int,
    total_questions: int,
    previous_mastery: float = None
) -> Tuple[float, float, float, str]:
    """
    Transparently calculates raw quiz score and updated mastery.
    Returns: (raw_quiz_score, new_mastery, delta, stability)
    """
    if total_questions <= 0:
        raw_score = 0.0
    else:
        raw_score = round((correct_count / total_questions) * 100.0, 1)

    if previous_mastery is None or previous_mastery <= 0.0:
        new_mastery = raw_score
    else:
        # Transparent weighted revision blend: 70% weight on recent revision, 30% on historical
        alpha = 0.70
        new_mastery = round(alpha * raw_score + (1.0 - alpha) * previous_mastery, 1)

    # Bound mastery between 0 and 100
    new_mastery = max(0.0, min(100.0, new_mastery))
    delta = round(new_mastery - (previous_mastery if previous_mastery is not None else 0.0), 1)
    stability = classify_stability(new_mastery)

    return raw_score, new_mastery, delta, stability
