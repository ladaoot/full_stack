from typing import List
from uuid import UUID
from fastapi import APIRouter, HTTPException
from ..schemas import Article, ArticleCreate, ArticleUpdate
from ..storage import storage

router = APIRouter(prefix="/articles", tags=["articles"])

@router.get("", response_model=List[Article], summary="List articles")
def list_articles():
    return storage.list_articles()

@router.get("/{article_id}", response_model=Article, summary="Get article by ID")
def get_article(article_id: UUID):
    article = storage.get_article(article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article

@router.post("", response_model=Article, summary="Create article")
def create_article(payload: ArticleCreate):
    return storage.create_article(payload)

@router.put("/{article_id}", response_model=Article, summary="Update article")
def update_article(article_id: UUID, payload: ArticleUpdate):
    updated = storage.update_article(article_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Article not found")
    return updated

@router.delete("/{article_id}", summary="Delete article")
def delete_article(article_id: UUID):
    deleted = storage.delete_article(article_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Article not found")
    return {"deleted": True}
