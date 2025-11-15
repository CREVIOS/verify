"""Document schemas."""

from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field

from app.db.models import DocumentType


class DocumentBase(BaseModel):
    """Base document schema."""
    filename: str
    original_filename: str
    file_size: int
    mime_type: str
    document_type: DocumentType
    page_count: Optional[int] = None
    metadata: Optional[dict] = {}


class DocumentCreate(DocumentBase):
    """Schema for creating a document."""
    project_id: UUID
    file_path: str


class DocumentUpdate(BaseModel):
    """Schema for updating a document."""
    document_type: Optional[DocumentType] = None
    metadata: Optional[dict] = None


class DocumentResponse(DocumentBase):
    """Schema for document response."""
    id: UUID
    project_id: UUID
    file_path: str
    indexed: bool
    indexed_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class DocumentUploadResponse(BaseModel):
    """Schema for document upload response."""
    document_id: UUID
    filename: str
    file_size: int
    document_type: DocumentType
    message: str
