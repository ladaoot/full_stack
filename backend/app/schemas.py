from typing import Optional, List
from pydantic import BaseModel
from uuid import UUID

class Citation(BaseModel):
    id: UUID
    text: str
    page: Optional[int] = None

class Tag(BaseModel):
    id: UUID
    name: str
    color: Optional[str] = None

class TagCreate(BaseModel):
    name: str
    color: Optional[str] = None

class Article(BaseModel):
    id: UUID
    title: str
    abstract: Optional[str] = None
    tags: List[str] = []
    citations: List[Citation] = []
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class ArticleCreate(BaseModel):
    title: str
    abstract: Optional[str] = None
    tags: List[str] = []
    citations: List[Citation] = []

class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    abstract: Optional[str] = None
    tags: Optional[List[str]] = None
    citations: Optional[List[Citation]] = None
