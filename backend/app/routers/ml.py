from fastapi import APIRouter, HTTPException, UploadFile, File, Response, Depends
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel
from typing import Optional, List, Dict
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

import traceback

from ..ml import ml_service
from ..auth import get_current_user
from ..models import User, Article
from ..database import get_db
from ..s3 import s3_service

router = APIRouter(prefix="/ml", tags=["ml"])

class ExtractRequest(BaseModel):
    text: str

class SummarizeRequest(BaseModel):
    article_id: UUID

@router.post("/extract-metadata", summary="Extract metadata from text using NER")
async def extract_metadata(payload: ExtractRequest, current_user: User = Depends(get_current_user)):
    try:
        metadata = ml_service.extract_metadata(payload.text)
        
        # Форматируем метаданные в текстовый файл
        text_content = f"РЕЗУЛЬТАТЫ ИЗВЛЕЧЕНИЯ МЕТАДАННЫХ\n\n"
        text_content += f"НАЗВАНИЕ: {metadata.get('title', 'Не найдено')}\n"
        text_content += f"АВТОРЫ: {', '.join(metadata.get('authors', [])) if metadata.get('authors') else 'Не найдено'}\n"
        text_content += f"ГОД: {metadata.get('year', 'Не найдено')}\n"
        text_content += f"ЖУРНАЛ: {metadata.get('journal', 'Не найдено')}\n"
        text_content += f"DOI: {metadata.get('doi', 'Не найдено')}\n\n"
        text_content += f"АННОТАЦИЯ (СУММАРИЗАЦИЯ):\n{metadata.get('abstract', 'Не найдено')}\n"
        
        return PlainTextResponse(
            content=text_content,
            headers={"Content-Disposition": "attachment; filename=metadata.txt"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Metadata extraction failed: {str(e)}")

@router.post("/extract-from-pdf", summary="Extract metadata directly from PDF file")
async def extract_from_pdf(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    try:
        content = await file.read()
        text = ml_service.extract_text_from_pdf(content)
        metadata = ml_service.extract_metadata(text)
        return metadata
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF extraction failed: {str(e)}")

@router.post("/summarize", summary="Generate abstract using rut5-small")
async def summarize(
    payload: SummarizeRequest, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # 1. Находим статью в БД
        result = await db.execute(select(Article).where(Article.id == payload.article_id))
        article = result.scalar_one_or_none()
        
        if not article:
            raise HTTPException(status_code=404, detail="Article not found")
            
        if not article.pdf_url:
            raise HTTPException(status_code=400, detail="Article has no PDF file attached")

        # 2. Скачиваем PDF из S3
        pdf_content = await s3_service.get_file(article.pdf_url.split('/')[-1])
        
        # 3. Извлекаем текст
        text = ml_service.extract_text_from_pdf(pdf_content)
        
        # 4. Делаем суммаризацию (1000 слов)
        summary = ml_service.summarize(text, 500)
        
        return PlainTextResponse(
            content=summary,
            headers={"Content-Disposition": f"attachment; filename=summary_{article.id}.txt"}
        )
    except HTTPException:
        raise
    except Exception as e:
        tb_str = "".join(traceback.format_exception(type(e), e, e.__traceback__))
        raise HTTPException(status_code=500, detail=f"Summarization failed: {tb_str}")
