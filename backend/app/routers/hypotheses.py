from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Hypothesis
from app.schemas import HypothesisCreate, HypothesisUpdate, HypothesisOut

router = APIRouter(tags=["hypotheses"])


@router.get(
    "/api/engagements/{engagement_id}/hypotheses",
    response_model=list[HypothesisOut],
)
def list_hypotheses(engagement_id: int, db: Session = Depends(get_db)):
    return (
        db.query(Hypothesis)
        .filter(Hypothesis.engagement_id == engagement_id)
        .order_by(Hypothesis.created_at.desc())
        .all()
    )


@router.post(
    "/api/engagements/{engagement_id}/hypotheses",
    response_model=HypothesisOut,
    status_code=201,
)
def create_hypothesis(engagement_id: int, data: HypothesisCreate, db: Session = Depends(get_db)):
    hypothesis = Hypothesis(engagement_id=engagement_id, **data.model_dump())
    db.add(hypothesis)
    db.commit()
    db.refresh(hypothesis)
    return hypothesis


@router.put("/api/hypotheses/{hypothesis_id}", response_model=HypothesisOut)
def update_hypothesis(hypothesis_id: int, data: HypothesisUpdate, db: Session = Depends(get_db)):
    hypothesis = db.query(Hypothesis).filter(Hypothesis.id == hypothesis_id).first()
    if not hypothesis:
        raise HTTPException(status_code=404, detail="Hypothesis not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(hypothesis, key, value)

    db.commit()
    db.refresh(hypothesis)
    return hypothesis


@router.delete("/api/hypotheses/{hypothesis_id}", status_code=204)
def delete_hypothesis(hypothesis_id: int, db: Session = Depends(get_db)):
    hypothesis = db.query(Hypothesis).filter(Hypothesis.id == hypothesis_id).first()
    if not hypothesis:
        raise HTTPException(status_code=404, detail="Hypothesis not found")
    db.delete(hypothesis)
    db.commit()
