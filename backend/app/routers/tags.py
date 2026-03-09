from typing import List
from uuid import UUID
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..schemas import Tag as TagSchema, TagCreate
from ..models import Tag
from ..database import get_db

router = APIRouter(prefix="/tags", tags=["tags"])

@router.get("", response_model=List[TagSchema], summary="List tags")
async def list_tags(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tag))
    return result.scalars().all()

@router.get("/{tag_id}", response_model=TagSchema, summary="Get tag by ID")
async def get_tag(tag_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tag).where(Tag.id == tag_id))
    tag = result.scalar_one_or_none()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    return tag

@router.post("", response_model=TagSchema, summary="Create tag")
async def create_tag(payload: TagCreate, db: AsyncSession = Depends(get_db)):
    # Проверка на уникальность имени тега
    result = await db.execute(select(Tag).where(Tag.name == payload.name))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Tag with this name already exists")
    
    tag = Tag(name=payload.name, color=payload.color)
    db.add(tag)
    await db.commit()
    await db.refresh(tag)
    return tag

@router.delete("/{tag_id}", summary="Delete tag")
async def delete_tag(tag_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tag).where(Tag.id == tag_id))
    tag = result.scalar_one_or_none()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    await db.delete(tag)
    await db.commit()
    return {"deleted": True}
