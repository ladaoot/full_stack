from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import Dict
import uuid
from ..s3 import s3_service
from ..auth import get_current_user
from ..models import User

router = APIRouter(prefix="/files", tags=["files"])

@router.post("/upload-pdf", summary="Upload PDF to S3")
async def upload_pdf(file: UploadFile = File(...), current_user: User = Depends(get_current_user)) -> Dict[str, str]:
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    filename = f"{uuid.uuid4()}-{file.filename}"
    file_content = await file.read()
    
    try:
        # Ensure bucket exists (ideally on startup, but here for robustness)
        await s3_service.ensure_bucket_exists()
        
        file_url = await s3_service.upload_file(
            file_content=file_content,
            filename=filename,
            content_type=file.content_type
        )
        return {
            "url": file_url,
            "filename": file.filename,
            "s3_filename": filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")
