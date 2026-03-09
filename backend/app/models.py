from sqlalchemy import String, Text, ForeignKey, Integer, DateTime, func, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional
from uuid import UUID, uuid4
from datetime import datetime
from .database import Base

class Article(Base):
    __tablename__ = "articles"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    abstract: Mapped[Optional[str]] = mapped_column(Text)
    pdf_url: Mapped[Optional[str]] = mapped_column(String(500))
    pdf_filename: Mapped[Optional[str]] = mapped_column(String(200))
    tags: Mapped[List[str]] = mapped_column(JSON, default=[])
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

    citations: Mapped[List["Citation"]] = relationship(back_populates="article", cascade="all, delete-orphan")

class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    color: Mapped[Optional[str]] = mapped_column(String(20))

class Citation(Base):
    __tablename__ = "citations"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    page: Mapped[Optional[int]] = mapped_column(Integer)
    article_id: Mapped[UUID] = mapped_column(ForeignKey("articles.id"))

    article: Mapped["Article"] = relationship(back_populates="citations")
