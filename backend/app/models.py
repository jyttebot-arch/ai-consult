import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
import enum

from app.database import Base


class ServiceCategory(str, enum.Enum):
    STRATEGY_ORGANIZATION = "strategy_organization"
    BUSINESS_TRANSFORMATION = "business_transformation"
    COMMERCIAL_EXCELLENCE = "commercial_excellence"
    DATA_AI = "data_ai"


class EngagementStatus(str, enum.Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    ON_HOLD = "on_hold"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class PhaseStatus(str, enum.Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class HypothesisStatus(str, enum.Enum):
    OPEN = "open"
    CONFIRMED = "confirmed"
    REJECTED = "rejected"


class Engagement(Base):
    __tablename__ = "engagements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    client_name = Column(String(255), nullable=False)
    service_category = Column(String(50), nullable=False)
    service_type = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    scope = Column(Text, nullable=True)
    ambition_level = Column(String(50), nullable=True)
    success_criteria = Column(Text, nullable=True)
    status = Column(String(20), default=EngagementStatus.DRAFT.value, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    phases = relationship("Phase", back_populates="engagement", cascade="all, delete-orphan", order_by="Phase.order")
    hypotheses = relationship("Hypothesis", back_populates="engagement", cascade="all, delete-orphan")


class Phase(Base):
    __tablename__ = "phases"

    id = Column(Integer, primary_key=True, index=True)
    engagement_id = Column(Integer, ForeignKey("engagements.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    order = Column(Integer, nullable=False)
    start_date = Column(String(10), nullable=True)  # ISO date string
    end_date = Column(String(10), nullable=True)
    status = Column(String(20), default=PhaseStatus.NOT_STARTED.value, nullable=False)

    engagement = relationship("Engagement", back_populates="phases")


class Hypothesis(Base):
    __tablename__ = "hypotheses"

    id = Column(Integer, primary_key=True, index=True)
    engagement_id = Column(Integer, ForeignKey("engagements.id", ondelete="CASCADE"), nullable=False)
    statement = Column(Text, nullable=False)
    status = Column(String(20), default=HypothesisStatus.OPEN.value, nullable=False)
    evidence_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    engagement = relationship("Engagement", back_populates="hypotheses")
