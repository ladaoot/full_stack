from typing import List
from uuid import UUID
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from ..schemas import Article as ArticleSchema, ArticleCreate, ArticleUpdate, Citation as CitationSchema
from ..models import Article, Citation, User, Tag
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/articles", tags=["articles"])

@router.get("", response_model=List[ArticleSchema], summary="List articles")
async def list_articles(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(Article)
        .options(selectinload(Article.citations), selectinload(Article.tags))
    )
    articles = result.scalars().all()
    return articles

@router.get("/{article_id}", response_model=ArticleSchema, summary="Get article by ID")
async def get_article(article_id: UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(Article)
        .where(Article.id == article_id)
        .options(selectinload(Article.citations), selectinload(Article.tags))
    )
    article = result.scalar_one_or_none()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article

@router.post("", response_model=ArticleSchema, summary="Create article")
async def create_article(payload: ArticleCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    article = Article(
        title=payload.title,
        authors=payload.authors,
        year=payload.year,
        abstract=payload.abstract,
        doi=payload.doi,
        journal=payload.journal,
        volume=payload.volume,
        pages=payload.pages,
        pdf_url=payload.pdf_url,
        pdf_filename=payload.pdf_filename,
        s3_filename=payload.s3_filename,
        user_id=current_user.id,
    )
    
    # Обработка тегов
    if payload.tags:
        for t_payload in payload.tags:
            # Ищем существующий тег или создаем новый
            result = await db.execute(select(Tag).where(Tag.name == t_payload.name))
            tag = result.scalar_one_or_none()
            if not tag:
                tag = Tag(name=t_payload.name, color=t_payload.color)
                db.add(tag)
            article.tags.append(tag)

    db.add(article)
    await db.flush()  # To get the ID for citations if needed
    
    if payload.citations:
        for c in payload.citations:
            citation = Citation(text=c.text, page=c.page, article_id=article.id)
            db.add(citation)
    
    await db.commit()
    await db.refresh(article)
    
    # Reload with relations
    result = await db.execute(
        select(Article)
        .where(Article.id == article.id)
        .options(selectinload(Article.citations), selectinload(Article.tags))
    )
    return result.scalar_one()

@router.put("/{article_id}", response_model=ArticleSchema, summary="Update article")
async def update_article(article_id: UUID, payload: ArticleUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(Article)
        .where(Article.id == article_id)
        .where(Article.user_id == current_user.id)
        .options(selectinload(Article.citations), selectinload(Article.tags))
    )
    article = result.scalar_one_or_none()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    if payload.title is not None:
        article.title = payload.title
    if payload.authors is not None:
        article.authors = payload.authors
    if payload.year is not None:
        article.year = payload.year
    if payload.abstract is not None:
        article.abstract = payload.abstract
    if payload.doi is not None:
        article.doi = payload.doi
    if payload.journal is not None:
        article.journal = payload.journal
    if payload.volume is not None:
        article.volume = payload.volume
    if payload.pages is not None:
        article.pages = payload.pages
    if payload.pdf_url is not None:
        article.pdf_url = payload.pdf_url
    if payload.pdf_filename is not None:
        article.pdf_filename = payload.pdf_filename
    if payload.s3_filename is not None:
        article.s3_filename = payload.s3_filename
    
    if payload.tags is not None:
        # Очищаем старые связи и добавляем новые
        article.tags = []
        for t_payload in payload.tags:
            result = await db.execute(select(Tag).where(Tag.name == t_payload.name))
            tag = result.scalar_one_or_none()
            if not tag:
                tag = Tag(name=t_payload.name, color=t_payload.color)
                db.add(tag)
            article.tags.append(tag)
    
    if payload.citations is not None:
        # Delete old citations and add new ones
        await db.execute(delete(Citation).where(Citation.article_id == article_id))
        for c in payload.citations:
            citation = Citation(text=c.text, page=c.page, article_id=article_id)
            db.add(citation)
    
    await db.commit()
    await db.refresh(article)
    
    # Reload with relations
    result = await db.execute(
        select(Article)
        .where(Article.id == article.id)
        .options(selectinload(Article.citations), selectinload(Article.tags))
    )
    return result.scalar_one()

@router.delete("/{article_id}", summary="Delete article")
async def delete_article(article_id: UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(Article)
        .where(Article.id == article_id)
        .where(Article.user_id == current_user.id)
    )
    article = result.scalar_one_or_none()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    await db.delete(article)
    await db.commit()
    return {"deleted": True}
