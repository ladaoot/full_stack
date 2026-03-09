from typing import Optional, List
from pydantic import BaseModel, field_validator
from uuid import UUID
from datetime import datetime

class Citation(BaseModel):
    id: UUID
    text: str
    page: Optional[int] = None
    @field_validator("text")
    @classmethod
    def validate_text(cls, v: str) -> str:
        v = (v or "").strip()
        if len(v) < 3:
            raise ValueError("Citation text must be at least 3 characters")
        if len(v) > 2000:
            raise ValueError("Citation text is too long")
        return v
    @field_validator("page")
    @classmethod
    def validate_page(cls, v: Optional[int]) -> Optional[int]:
        if v is None:
            return v
        if v <= 0:
            raise ValueError("Citation page must be a positive integer")
        return v

class Tag(BaseModel):
    id: UUID
    name: str
    color: Optional[str] = None
    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = (v or "").strip()
        if not v:
            raise ValueError("Tag name must not be empty")
        if len(v) > 64:
            raise ValueError("Tag name is too long")
        return v

class TagCreate(BaseModel):
    name: str
    color: Optional[str] = None
    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = (v or "").strip()
        if not v:
            raise ValueError("Tag name must not be empty")
        if len(v) > 64:
            raise ValueError("Tag name is too long")
        return v

class Article(BaseModel):
    id: UUID
    title: str
    abstract: Optional[str] = None
    pdf_url: Optional[str] = None
    pdf_filename: Optional[str] = None
    tags: List[str] = []
    citations: List[Citation] = []
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        v = (v or "").strip()
        if len(v) < 3:
            raise ValueError("Title must be at least 3 characters")
        if len(v) > 200:
            raise ValueError("Title is too long")
        return v
    @field_validator("abstract")
    @classmethod
    def validate_abstract(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        if len(v) > 5000:
            raise ValueError("Abstract is too long")
        return v
    @field_validator("tags")
    @classmethod
    def validate_tags(cls, v: List[str]) -> List[str]:
        seen = set()
        out: List[str] = []
        for t in v or []:
            t = (t or "").strip()
            if not t:
                raise ValueError("Tag value must not be empty")
            if len(t) > 64:
                raise ValueError("Tag value is too long")
            if t not in seen:
                seen.add(t)
                out.append(t)
        return out

class ArticleCreate(BaseModel):
    title: str
    abstract: Optional[str] = None
    pdf_url: Optional[str] = None
    pdf_filename: Optional[str] = None
    tags: List[str] = []
    citations: List[Citation] = []
    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        v = (v or "").strip()
        if len(v) < 3:
            raise ValueError("Title must be at least 3 characters")
        if len(v) > 200:
            raise ValueError("Title is too long")
        return v
    @field_validator("abstract")
    @classmethod
    def validate_abstract(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        if len(v) > 5000:
            raise ValueError("Abstract is too long")
        return v
    @field_validator("tags")
    @classmethod
    def validate_tags(cls, v: List[str]) -> List[str]:
        seen = set()
        out: List[str] = []
        for t in v or []:
            t = (t or "").strip()
            if not t:
                raise ValueError("Tag value must not be empty")
            if len(t) > 64:
                raise ValueError("Tag value is too long")
            if t not in seen:
                seen.add(t)
                out.append(t)
        return out

class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    abstract: Optional[str] = None
    pdf_url: Optional[str] = None
    pdf_filename: Optional[str] = None
    tags: Optional[List[str]] = None
    citations: Optional[List[Citation]] = None
    @field_validator("title")
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        if len(v) < 3:
            raise ValueError("Title must be at least 3 characters")
        if len(v) > 200:
            raise ValueError("Title is too long")
        return v
    @field_validator("abstract")
    @classmethod
    def validate_abstract(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        if len(v) > 5000:
            raise ValueError("Abstract is too long")
        return v
    @field_validator("tags")
    @classmethod
    def validate_tags(cls, v: Optional[List[str]]) -> Optional[List[str]]:
        if v is None:
            return v
        seen = set()
        out: List[str] = []
        for t in v or []:
            t = (t or "").strip()
            if not t:
                raise ValueError("Tag value must not be empty")
            if len(t) > 64:
                raise ValueError("Tag value is too long")
            if t not in seen:
                seen.add(t)
                out.append(t)
        return out
