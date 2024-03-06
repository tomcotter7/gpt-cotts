from fastapi import APIRouter
from gptcotts.indexing import update_notes
from gptcotts.markdown_processor import (convert_to_chunks,
                                         convert_to_markdown,
                                         convert_to_sections)
from gptcotts.s3_connector import get_object_from_s3, put_object_to_s3
from pydantic import BaseModel

router = APIRouter(
        prefix="/gptcotts/notes"
)

class NotesRequest(BaseModel):
    user_id: str
    notes_class: str

class UpdateNotesRequest(BaseModel):
    user_id: str
    notes_class: str
    pinecone_index: str
    pinecone_namespace: str
    new_notes: dict

@router.get("/")
def get_notes(request: NotesRequest):
    """Get the notes for a user and class."""
    notes = get_object_from_s3("gptcotts-notes", f"{request.user_id}/{request.notes_class}.md")
    sections = convert_to_sections(notes)

    return {"sections": sections}

@router.get("/refresh")
def refresh_notes(request: UpdateNotesRequest):
    """Refresh the notes for a user and class."""
    markdown = convert_to_markdown(request.new_notes)
    put_object_to_s3("gptcotts-notes", f"{request.user_id}/{request.notes_class}.md", markdown)
    notes_data = convert_to_chunks(markdown, request.notes_class)
    update_notes(request.pinecone_index, request.pinecone_namespace, notes_data)
    return {"status": "success"}


