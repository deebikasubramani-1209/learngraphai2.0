from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Optional, Any
from datetime import datetime

# ----------------- Student Schemas -----------------
class StudentBase(BaseModel):
    name: str
    email: str
    role: Optional[str] = "Student"

class StudentCreate(StudentBase):
    pass

class StudentResponse(StudentBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    created_at: datetime

# ----------------- Concept Schemas -----------------
class ConceptResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    subject_id: str
    name: str
    slug: str
    description: Optional[str] = None
    order_index: int = 0
    prerequisites: List[str] = []

# ----------------- Question Schemas -----------------
class QuestionOption(BaseModel):
    id: str
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    difficulty: str
    concept_id: str

class QuestionDetailResponse(QuestionOption):
    correct_answer: str
    explanation: Optional[str] = None

# ----------------- Quiz Submission -----------------
class AnswerItem(BaseModel):
    question_id: str
    selected_answer: str

class QuizSubmitRequest(BaseModel):
    student_id: str
    concept_id: str
    answers: List[AnswerItem]

class QuestionFeedback(BaseModel):
    question_id: str
    question_text: str
    selected_answer: str
    correct_answer: str
    is_correct: bool
    explanation: Optional[str] = None

class QuizSubmitResponse(BaseModel):
    concept_id: str
    concept_name: str
    score: float
    total_questions: int
    correct_count: int
    previous_mastery: float
    new_mastery: float
    mastery_delta: float
    stability: str
    feedback_summary: str
    prerequisite_alert: Optional[str] = None
    questions_feedback: List[QuestionFeedback]

# ----------------- Mastery & Graph -----------------
class ConceptMasteryItem(BaseModel):
    concept_id: str
    name: str
    slug: str
    order_index: int
    mastery_score: float
    stability: str  # Strong, Stable, Weakening, At Risk
    last_practiced: Optional[str] = None
    days_since_practice: Optional[int] = None
    prerequisites: List[str] = []
    downstream_impacts: List[str] = []
    is_bottleneck: bool = False

class StudentMasteryOverview(BaseModel):
    student_id: str
    student_name: str
    student_email: str
    overall_mastery: float
    strong_count: int
    stable_count: int
    weakening_count: int
    at_risk_count: int
    top_recommendation: Optional[str] = None
    concepts: List[ConceptMasteryItem]

class GraphNodeData(BaseModel):
    label: str
    concept_id: str
    name: str
    slug: str
    mastery_score: float
    stability: str
    days_since_practice: Optional[int] = None
    last_practiced: Optional[str] = None
    prerequisites: List[str] = []
    downstream_impacts: List[str] = []
    is_root_gap: bool = False
    is_impacted: bool = False

class GraphNode(BaseModel):
    id: str
    type: str = "conceptNode"
    position: Dict[str, float]
    data: GraphNodeData

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    animated: bool = False
    style: Optional[Dict[str, Any]] = None
    label: Optional[str] = "prereq for"

class GraphResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    engine: str

# ----------------- Decay Analysis -----------------
class DecayCurvePoint(BaseModel):
    day: int
    projected_mastery: float
    actual_mastery: Optional[float] = None
    label: str

class ConceptDecayDetail(BaseModel):
    concept_id: str
    concept_name: str
    current_mastery: float
    peak_mastery: float
    days_since_practice: int
    stability: str
    half_life_days: float
    decay_curve: List[DecayCurvePoint]
    historical_points: List[Dict[str, Any]] = []

class StudentDecayResponse(BaseModel):
    student_id: str
    concepts_decay: List[ConceptDecayDetail]

# ----------------- Recommendations -----------------
class RecommendationItem(BaseModel):
    id: str
    concept_id: str
    concept_name: str
    priority: int
    priority_score: float
    current_mastery: float
    previous_mastery: Optional[float] = None
    days_since_practice: Optional[int] = None
    stability: str
    headline: str
    reason: str
    why_factors: List[str]
    root_cause_concept: Optional[str] = None
    impacted_concepts: List[str] = []

class RecommendationResponse(BaseModel):
    student_id: str
    student_name: str
    generated_at: str
    recommendations: List[RecommendationItem]

# ----------------- Demo Mode Schemas -----------------
class DemoStageRequest(BaseModel):
    stage: str
