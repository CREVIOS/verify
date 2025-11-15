"""Supabase Storage service for S3-compatible file storage."""

from typing import BinaryIO, Optional
from pathlib import Path
from uuid import UUID
import mimetypes
from loguru import logger
from supabase import create_client, Client
from storage3.utils import StorageException

from app.core.config import settings


class StorageService:
    """Service for managing document storage using Supabase Storage (S3-compatible)."""

    def __init__(self):
        """Initialize Supabase client and storage bucket."""
        self.client: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_KEY or settings.SUPABASE_KEY
        )
        self.bucket_name = settings.SUPABASE_STORAGE_BUCKET
        self._ensure_bucket_exists()

    def _ensure_bucket_exists(self):
        """Create storage bucket if it doesn't exist."""
        try:
            # Try to get bucket info
            self.client.storage.get_bucket(self.bucket_name)
            logger.info(f"Storage bucket '{self.bucket_name}' already exists")
        except StorageException:
            # Create bucket if it doesn't exist
            try:
                self.client.storage.create_bucket(
                    self.bucket_name,
                    options={
                        "public": False,
                        "allowedMimeTypes": [
                            "application/pdf",
                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                            "application/msword"
                        ],
                        "fileSizeLimit": settings.MAX_UPLOAD_SIZE
                    }
                )
                logger.info(f"Created storage bucket: {self.bucket_name}")
            except Exception as e:
                logger.error(f"Error creating storage bucket: {e}")
                raise

    def upload_file(
        self,
        file: BinaryIO,
        filename: str,
        project_id: UUID,
        content_type: Optional[str] = None
    ) -> str:
        """
        Upload file to Supabase Storage.

        Args:
            file: File object to upload
            filename: Original filename
            project_id: Project UUID for organization
            content_type: MIME type of the file

        Returns:
            Storage path of uploaded file
        """
        try:
            # Generate storage path: projects/{project_id}/{filename}
            storage_path = f"projects/{str(project_id)}/{filename}"

            # Detect content type if not provided
            if not content_type:
                content_type, _ = mimetypes.guess_type(filename)
                if not content_type:
                    content_type = "application/octet-stream"

            # Read file data
            file_data = file.read()

            # Upload to Supabase Storage
            response = self.client.storage.from_(self.bucket_name).upload(
                path=storage_path,
                file=file_data,
                file_options={
                    "content-type": content_type,
                    "cache-control": "3600",
                    "upsert": "false"
                }
            )

            logger.info(f"Uploaded file to storage: {storage_path}")
            return storage_path

        except Exception as e:
            logger.error(f"Error uploading file to storage: {e}")
            raise

    def download_file(self, storage_path: str) -> bytes:
        """
        Download file from Supabase Storage.

        Args:
            storage_path: Path to file in storage

        Returns:
            File content as bytes
        """
        try:
            response = self.client.storage.from_(self.bucket_name).download(storage_path)
            logger.info(f"Downloaded file from storage: {storage_path}")
            return response

        except Exception as e:
            logger.error(f"Error downloading file from storage: {e}")
            raise

    def get_public_url(self, storage_path: str) -> str:
        """
        Get public URL for a file (if bucket is public).

        Args:
            storage_path: Path to file in storage

        Returns:
            Public URL
        """
        try:
            url = self.client.storage.from_(self.bucket_name).get_public_url(storage_path)
            return url

        except Exception as e:
            logger.error(f"Error getting public URL: {e}")
            raise

    def get_signed_url(self, storage_path: str, expires_in: int = 3600) -> str:
        """
        Get signed URL for temporary file access.

        Args:
            storage_path: Path to file in storage
            expires_in: URL expiration time in seconds (default: 1 hour)

        Returns:
            Signed URL
        """
        try:
            response = self.client.storage.from_(self.bucket_name).create_signed_url(
                storage_path,
                expires_in
            )
            return response['signedURL']

        except Exception as e:
            logger.error(f"Error creating signed URL: {e}")
            raise

    def delete_file(self, storage_path: str):
        """
        Delete file from Supabase Storage.

        Args:
            storage_path: Path to file in storage
        """
        try:
            self.client.storage.from_(self.bucket_name).remove([storage_path])
            logger.info(f"Deleted file from storage: {storage_path}")

        except Exception as e:
            logger.error(f"Error deleting file from storage: {e}")
            raise

    def delete_project_files(self, project_id: UUID):
        """
        Delete all files for a project.

        Args:
            project_id: Project UUID
        """
        try:
            # List all files in project folder
            project_path = f"projects/{str(project_id)}"
            files = self.client.storage.from_(self.bucket_name).list(project_path)

            # Delete all files
            if files:
                file_paths = [f"{project_path}/{f['name']}" for f in files]
                self.client.storage.from_(self.bucket_name).remove(file_paths)
                logger.info(f"Deleted all files for project {project_id}")

        except Exception as e:
            logger.error(f"Error deleting project files: {e}")
            raise

    def list_project_files(self, project_id: UUID) -> list:
        """
        List all files for a project.

        Args:
            project_id: Project UUID

        Returns:
            List of file metadata
        """
        try:
            project_path = f"projects/{str(project_id)}"
            files = self.client.storage.from_(self.bucket_name).list(project_path)
            return files

        except Exception as e:
            logger.error(f"Error listing project files: {e}")
            raise

    def get_file_info(self, storage_path: str) -> dict:
        """
        Get file metadata.

        Args:
            storage_path: Path to file in storage

        Returns:
            File metadata
        """
        try:
            # Extract folder and filename
            parts = storage_path.rsplit('/', 1)
            folder = parts[0] if len(parts) > 1 else ''
            filename = parts[-1]

            # List files in folder
            files = self.client.storage.from_(self.bucket_name).list(folder)

            # Find matching file
            for file in files:
                if file['name'] == filename:
                    return file

            raise FileNotFoundError(f"File not found: {storage_path}")

        except Exception as e:
            logger.error(f"Error getting file info: {e}")
            raise


# Singleton instance
storage_service = StorageService()
