from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Engagement, Phase
from app.schemas import (
    EngagementCreate, EngagementUpdate, EngagementOut, EngagementListOut,
    PhaseOut, PhaseUpdate,
)

router = APIRouter(prefix="/api/engagements", tags=["engagements"])

DEFAULT_PHASES = [
    {"name": "Mobilisation", "order": 1},
    {"name": "Analysis", "order": 2},
    {"name": "Working Sessions", "order": 3},
    {"name": "Consolidation", "order": 4},
]


@router.get("", response_model=list[EngagementListOut])
def list_engagements(
    category: str | None = None,
    status: str | None = None,
    q: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(Engagement)
    if category:
        query = query.filter(Engagement.service_category == category)
    if status:
        query = query.filter(Engagement.status == status)
    if q:
        query = query.filter(
            Engagement.title.ilike(f"%{q}%") | Engagement.client_name.ilike(f"%{q}%")
        )
    return query.order_by(Engagement.updated_at.desc()).all()


@router.post("", response_model=EngagementOut, status_code=201)
def create_engagement(data: EngagementCreate, db: Session = Depends(get_db)):
    engagement = Engagement(**data.model_dump())
    db.add(engagement)
    db.flush()

    # Create default phases
    for p in DEFAULT_PHASES:
        db.add(Phase(engagement_id=engagement.id, **p))

    db.commit()
    db.refresh(engagement)
    return engagement


@router.get("/{engagement_id}", response_model=EngagementOut)
def get_engagement(engagement_id: int, db: Session = Depends(get_db)):
    engagement = db.query(Engagement).filter(Engagement.id == engagement_id).first()
    if not engagement:
        raise HTTPException(status_code=404, detail="Engagement not found")
    return engagement


@router.put("/{engagement_id}", response_model=EngagementOut)
def update_engagement(engagement_id: int, data: EngagementUpdate, db: Session = Depends(get_db)):
    engagement = db.query(Engagement).filter(Engagement.id == engagement_id).first()
    if not engagement:
        raise HTTPException(status_code=404, detail="Engagement not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(engagement, key, value)

    db.commit()
    db.refresh(engagement)
    return engagement


@router.delete("/{engagement_id}", status_code=204)
def delete_engagement(engagement_id: int, db: Session = Depends(get_db)):
    engagement = db.query(Engagement).filter(Engagement.id == engagement_id).first()
    if not engagement:
        raise HTTPException(status_code=404, detail="Engagement not found")
    db.delete(engagement)
    db.commit()


# ---------- Phases ----------

@router.get("/{engagement_id}/phases", response_model=list[PhaseOut])
def list_phases(engagement_id: int, db: Session = Depends(get_db)):
    return db.query(Phase).filter(Phase.engagement_id == engagement_id).order_by(Phase.order).all()


@router.put("/phases/{phase_id}", response_model=PhaseOut)
def update_phase(phase_id: int, data: PhaseUpdate, db: Session = Depends(get_db)):
    phase = db.query(Phase).filter(Phase.id == phase_id).first()
    if not phase:
        raise HTTPException(status_code=404, detail="Phase not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(phase, key, value)

    db.commit()
    db.refresh(phase)
    return phase
