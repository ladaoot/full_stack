from sqlalchemy import String, Text, ForeignKey, Integer, DateTime, func, JSON, Column, Table
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.ext.mutable import MutableList
from typing import List, Optional
from uuid import UUID, uuid4
from datetime import datetime
from .database import Base

# Ассоциативная таблица для связи M2M между статьями и тегами
article_tags = Table(
    "article_tags",
    Base.metadata,
    Column("article_id", ForeignKey("articles.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)

class User(Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    affiliation: Mapped[Optional[str]] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

class Article(Base):
    __tablename__ = "articles"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    authors: Mapped[List[str]] = mapped_column(MutableList.as_mutable(JSON), default=[])
    year: Mapped[Optional[int]] = mapped_column(Integer)
    abstract: Mapped[Optional[str]] = mapped_column(Text)
    doi: Mapped[Optional[str]] = mapped_column(String(100))
    journal: Mapped[Optional[str]] = mapped_column(String(200))
    volume: Mapped[Optional[str]] = mapped_column(String(50))
    pages: Mapped[Optional[str]] = mapped_column(String(50))
    pdf_url: Mapped[Optional[str]] = mapped_column(String(500))
    pdf_filename: Mapped[Optional[str]] = mapped_column(String(200))
    s3_filename: Mapped[Optional[str]] = mapped_column(String(500))
    user_id: Mapped[Optional[UUID]] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

    citations: Mapped[List["Citation"]] = relationship(back_populates="article", cascade="all, delete-orphan")
    tags: Mapped[List["Tag"]] = relationship(secondary=article_tags, back_populates="articles")

class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    color: Mapped[Optional[str]] = mapped_column(String(20))

    articles: Mapped[List["Article"]] = relationship(secondary=article_tags, back_populates="tags")

class Citation(Base):
    __tablename__ = "citations"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    page: Mapped[Optional[int]] = mapped_column(Integer)
    article_id: Mapped[UUID] = mapped_column(ForeignKey("articles.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    article: Mapped["Article"] = relationship(back_populates="citations")
