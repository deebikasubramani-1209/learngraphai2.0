import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.entities import Student, Concept, Mastery
from app.schemas.api_schemas import GraphResponse, GraphNode, GraphNodeData, GraphEdge
from app.graph_db import graph_service
from app.services.dependency import analyze_dependencies_and_bottlenecks
from app.services.mastery import classify_stability

router = APIRouter(prefix="", tags=["Knowledge Graph"])

@router.get("/students/{student_id}/graph", response_model=GraphResponse)
def get_student_knowledge_graph(student_id: str, db: Session = Depends(get_db)):
    """
    Returns an interactive, personalized knowledge graph structure
    ready for React Flow canvas rendering, complete with node stability states,
    prerequisite edges, root-gap bottleneck flags, and downstream impact cascades.
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Fetch concepts and student mastery
    concepts = db.query(Concept).order_by(Concept.order_index).all()
    mastery_records = {m.concept_id: m for m in db.query(Mastery).filter(Mastery.student_id == student.id).all()}

    now = datetime.datetime.utcnow()
    mastery_map = {}
    for c in concepts:
        m = mastery_records.get(c.id)
        if m:
            days_ago = (now - m.last_practiced).days if m.last_practiced else 0
            mastery_map[c.id] = {
                "score": m.mastery_score,
                "stability": m.stability,
                "days_ago": days_ago,
                "last_practiced": m.last_practiced.isoformat() if m.last_practiced else None
            }
        else:
            mastery_map[c.id] = {
                "score": 0.0,
                "stability": "At Risk",
                "days_ago": None,
                "last_practiced": None
            }

    # Run dependency bottleneck analysis
    dep_analysis = analyze_dependencies_and_bottlenecks(mastery_map)
    bottlenecks = dep_analysis["bottlenecks"]
    
    # Identify impacted concepts
    impacted_set = set()
    for b_info in bottlenecks.values():
        impacted_set.update(b_info["blocking_concepts"])

    # Base coordinates for visual layout
    coord_map = {
        "concept-functions": {"x": 60, "y": 180},
        "concept-arrays": {"x": 280, "y": 180},
        "concept-recursion": {"x": 500, "y": 180},
        "concept-trees": {"x": 720, "y": 180},
        "concept-graphs": {"x": 940, "y": 180}
    }

    nodes = []
    for c in concepts:
        m_info = mastery_map[c.id]
        prereqs = graph_service.get_prerequisites(c.id)
        downstream = graph_service.get_downstream_dependents(c.id)
        pos = coord_map.get(c.id, {"x": 100 + c.order_index * 200, "y": 180})

        is_root = c.id in bottlenecks
        is_imp = c.id in impacted_set

        nodes.append(GraphNode(
            id=c.id,
            type="conceptNode",
            position=pos,
            data=GraphNodeData(
                label=c.name,
                concept_id=c.id,
                name=c.name,
                slug=c.slug,
                mastery_score=m_info["score"],
                stability=m_info["stability"],
                days_since_practice=m_info["days_ago"],
                last_practiced=m_info["last_practiced"],
                prerequisites=prereqs,
                downstream_impacts=downstream,
                is_root_gap=is_root,
                is_impacted=is_imp
            )
        ))

    # Build React Flow edges with dynamic styling
    topology = graph_service.get_graph_topology()
    edges = []
    for e in topology["edges"]:
        source_id = e["source"]
        target_id = e["target"]
        
        # Check if this edge is an active bottleneck link (e.g. Recursion -> Trees)
        is_critical_edge = (source_id in bottlenecks and target_id in bottlenecks[source_id]["blocking_concepts"])
        
        edge_style = {
            "strokeWidth": 3 if is_critical_edge else 2,
            "stroke": "#ef4444" if is_critical_edge else "#64748b"
        }
        
        edges.append(GraphEdge(
            id=e["id"],
            source=source_id,
            target=target_id,
            animated=is_critical_edge,
            style=edge_style,
            label="blocks prereq" if is_critical_edge else "prerequisite for"
        ))

    return GraphResponse(
        nodes=nodes,
        edges=edges,
        engine="Neo4j AuraDB" if graph_service.is_neo4j_active() else "NetworkX Embedded"
    )
