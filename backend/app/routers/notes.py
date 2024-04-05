from typing import Annotated

from fastapi import APIRouter, Depends
from gptcotts.auth_utils import User, get_current_user
from gptcotts.indexing import update_notes
from gptcotts.markdown_processor import (
    convert_to_chunks,
    convert_to_markdown,
    convert_to_sections,
)
from gptcotts.s3_connector import get_object_from_s3, put_object_to_s3
from pydantic import BaseModel

router = APIRouter(
        prefix="/gptcotts/notes"
)

class UpdateNotesRequest(BaseModel):
    user_id: str = "tom"
    notes_class: str = "cs_notes"
    pinecone_index: str = "notes"
    pinecone_namespace: str = "tcotts-notes"
    new_notes: dict
    old_section_name: str
    new_section_name: str

@router.get("/")
def get_notes(current_user: Annotated[User, Depends(get_current_user)]):
    """Get the notes for a user and class."""
    notes = get_object_from_s3("gptcotts-notes", "tom/cs_notes.md")
    sections = convert_to_sections(notes)

    return {"sections": sections}

@router.post("/update")
def update_notes_in_s3_and_pinecone(
        current_user: Annotated[User, Depends(get_current_user)],
        request: UpdateNotesRequest
):
    """Refresh the notes for a user and class."""
    markdown = convert_to_markdown(request.new_notes)
    put_object_to_s3("gptcotts-notes", f"{request.user_id}/{request.notes_class}.md", markdown)
    notes_data = convert_to_chunks(markdown, request.notes_class)
    update_notes(
            request.pinecone_index,
            request.old_section_name,
            request.new_section_name,
            request.pinecone_namespace,
            notes_data
    )

    return {"status": "success"}


