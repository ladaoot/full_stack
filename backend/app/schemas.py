from typing import Optional, List
from pydantic import BaseModel, field_validator
from uuid import UUID
from datetime import datetime

class Citation(BaseModel):
    id: UUID
    text: str
    page: Optional[int] = None
    created_at: Optional[datetime] = None
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

class User(BaseModel):
    id: UUID
    email: str
    name: str
    affiliation: Optional[str] = None
    created_at: Optional[datetime] = None

class UserCreate(BaseModel):
    email: str
    password: str
    name: str
    affiliation: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[str] = None

class Article(BaseModel):
    id: UUID
    title: str
    authors: List[str] = []
    year: Optional[int] = None
    abstract: Optional[str] = None
    doi: Optional[str] = None
    journal: Optional[str] = None
    volume: Optional[str] = None
    pages: Optional[str] = None
    pdf_url: Optional[str] = None
    pdf_filename: Optional[str] = None
    s3_filename: Optional[str] = None
    tags: List[Tag] = []
    citations: List[Citation] = []
    user_id: Optional[UUID] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        v = (v or "").strip()
        if len(v) < 3:
            raise ValueError("Title must be at least 3 characters")
        if len(v) > 500:
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
    def validate_tags(cls, v: List[Tag]) -> List[Tag]:
        return v # No change needed for object list for now

class CitationCreate(BaseModel):
    text: str
    page: Optional[int] = None

class ArticleCreate(BaseModel):
    title: str
    authors: List[str] = []
    year: Optional[int] = None
    abstract: Optional[str] = None
    doi: Optional[str] = None
    journal: Optional[str] = None
    volume: Optional[str] = None
    pages: Optional[str] = None
    pdf_url: Optional[str] = None
    pdf_filename: Optional[str] = None
    s3_filename: Optional[str] = None
    tags: List[TagCreate] = []
    citations: List[CitationCreate] = []
    user_id: Optional[UUID] = None
    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        v = (v or "").strip()
        if len(v) < 3:
            raise ValueError("Title must be at least 3 characters")
        if len(v) > 500:
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
    def validate_tags(cls, v: List[TagCreate]) -> List[TagCreate]:
        return v # No change needed for now
    @field_validator("authors")
    @classmethod
    def validate_authors(cls, v: List[str]) -> List[str]:
        seen = set()
        out: List[str] = []
        for a in v or []:
            a = (a or "").strip()
            if not a:
                continue
            if a not in seen:
                seen.add(a)
                out.append(a)
        return out

class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    authors: Optional[List[str]] = None
    year: Optional[int] = None
    abstract: Optional[str] = None
    doi: Optional[str] = None
    journal: Optional[str] = None
    volume: Optional[str] = None
    pages: Optional[str] = None
    pdf_url: Optional[str] = None
    pdf_filename: Optional[str] = None
    s3_filename: Optional[str] = None
    tags: Optional[List[TagCreate]] = None
    citations: Optional[List[CitationCreate]] = None
    @field_validator("title")
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        if len(v) < 3:
            raise ValueError("Title must be at least 3 characters")
        if len(v) > 500:
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
    def validate_tags(cls, v: Optional[List[TagCreate]]) -> Optional[List[TagCreate]]:
        return v # No change needed for now
    @field_validator("authors")
    @classmethod
    def validate_authors(cls, v: Optional[List[str]]) -> Optional[List[str]]:
        if v is None:
            return v
        seen = set()
        out: List[str] = []
        for a in v or []:
            a = (a or "").strip()
            if not a:
                continue
            if a not in seen:
                seen.add(a)
                out.append(a)
        return out
