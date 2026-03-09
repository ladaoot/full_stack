from typing import List
from uuid import UUID
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from ..schemas import Article as ArticleSchema, ArticleCreate, ArticleUpdate, Citation as CitationSchema
from ..models import Article, Citation
from ..database import get_db

router = APIRouter(prefix="/articles", tags=["articles"])

@router.get("", response_model=List[ArticleSchema], summary="List articles")
async def list_articles(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Article).options(selectinload(Article.citations)))
    articles = result.scalars().all()
    return articles

@router.get("/{article_id}", response_model=ArticleSchema, summary="Get article by ID")
async def get_article(article_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Article)
        .where(Article.id == article_id)
        .options(selectinload(Article.citations))
    )
    article = result.scalar_one_or_none()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article

@router.post("", response_model=ArticleSchema, summary="Create article")
async def create_article(payload: ArticleCreate, db: AsyncSession = Depends(get_db)):
    article = Article(
        title=payload.title,
        abstract=payload.abstract,
        pdf_url=payload.pdf_url,
        pdf_filename=payload.pdf_filename,
        tags=payload.tags,
    )
    db.add(article)
    await db.flush()  # To get the ID for citations if needed
    
    if payload.citations:
        for c in payload.citations:
            citation = Citation(text=c.text, page=c.page, article_id=article.id)
            db.add(citation)
    
    await db.commit()
    await db.refresh(article)
    
    # Reload with citations
    result = await db.execute(
        select(Article)
        .where(Article.id == article.id)
        .options(selectinload(Article.citations))
    )
    return result.scalar_one()

@router.put("/{article_id}", response_model=ArticleSchema, summary="Update article")
async def update_article(article_id: UUID, payload: ArticleUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Article)
        .where(Article.id == article_id)
        .options(selectinload(Article.citations))
    )
    article = result.scalar_one_or_none()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    if payload.title is not None:
        article.title = payload.title
    if payload.abstract is not None:
        article.abstract = payload.abstract
    if payload.pdf_url is not None:
        article.pdf_url = payload.pdf_url
    if payload.pdf_filename is not None:
        article.pdf_filename = payload.pdf_filename
    if payload.tags is not None:
        article.tags = payload.tags
    
    if payload.citations is not None:
        # Delete old citations and add new ones
        await db.execute(delete(Citation).where(Citation.article_id == article_id))
        for c in payload.citations:
            citation = Citation(text=c.text, page=c.page, article_id=article_id)
            db.add(citation)
    
    await db.commit()
    await db.refresh(article)
    
    # Reload with citations
    result = await db.execute(
        select(Article)
        .where(Article.id == article_id)
        .options(selectinload(Article.citations))
    )
    return result.scalar_one()

@router.delete("/{article_id}", summary="Delete article")
async def delete_article(article_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Article).where(Article.id == article_id))
    article = result.scalar_one_or_none()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    await db.delete(article)
    await db.commit()
    return {"deleted": True}
