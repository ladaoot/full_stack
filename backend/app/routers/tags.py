from typing import List
from uuid import UUID
from fastapi import APIRouter, HTTPException
from ..schemas import Tag, TagCreate
from ..storage import storage

router = APIRouter(prefix="/tags", tags=["tags"])

@router.get("", response_model=List[Tag], summary="List tags")
def list_tags():
    return storage.list_tags()

@router.get("/{tag_id}", response_model=Tag, summary="Get tag by ID")
def get_tag(tag_id: UUID):
    tag = storage.get_tag(tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    return tag

@router.post("", response_model=Tag, summary="Create tag")
def create_tag(payload: TagCreate):
    return storage.create_tag(payload)

@router.delete("/{tag_id}", summary="Delete tag")
def delete_tag(tag_id: UUID):
    deleted = storage.delete_tag(tag_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Tag not found")
    return {"deleted": True}
