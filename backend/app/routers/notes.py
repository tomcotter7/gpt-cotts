import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from gptcotts.auth_utils import User, verify_google_token
from gptcotts.indexing import delete_object_from_pinecone, update_notes
from gptcotts.markdown_processor import (
    convert_to_chunks,
    convert_to_markdown,
    convert_to_obj,
)
from gptcotts.s3_connector import (
    delete_object_from_s3,
    get_all_objects_from_directory,
    get_object_from_s3,
    put_object_to_s3,
)
from pydantic import BaseModel

router = APIRouter(prefix="/gptcotts/notes")


class FilenameRequest(BaseModel):
    filename: str


class UpdateNotesRequest(BaseModel):
    notes_class: str
    new_notes: dict


@router.get("/get")
def get_notes(current_user: Annotated[User, Depends(verify_google_token)]):
    """Get the notes for a user and class."""

    filenames = get_all_objects_from_directory("gptcotts-notes", current_user.email)

    if len(filenames) == 0:
        return {"note": {"title": "", "content": ""}, "filenames": []}

    first_notes = get_object_from_s3(
        "gptcotts-notes", current_user.email + "/" + filenames[0] + ".md"
    )

    note_obj = convert_to_obj(first_notes)

    return {"note": note_obj, "filenames": filenames}


@router.post("/get_with_filename")
def get_notes_with_filename(
    current_user: Annotated[User, Depends(verify_google_token)],
    request: FilenameRequest,
):
    """Get the notes for a user and class."""
    try:
        filename = request.filename
        logging.info(f">> Getting notes for {filename}")
        notes = get_object_from_s3(
            "gptcotts-notes", current_user.email + "/" + filename + ".md"
        )
        note_obj = convert_to_obj(notes)

        return {"note": note_obj}
    except Exception as e:
        return HTTPException(status_code=404, detail=str(e))


@router.post("/update")
def update_notes_in_s3_and_pinecone(
    current_user: Annotated[User, Depends(verify_google_token)],
    request: UpdateNotesRequest,
):
    """Refresh the notes for a user and class."""
    markdown = convert_to_markdown(request.new_notes)
    put_object_to_s3(
        "gptcotts-notes", f"{current_user.email}/{request.notes_class}.md", markdown
    )
    notes_data = convert_to_chunks(markdown, request.notes_class)
    update_notes(current_user.email, notes_data)

    return {"status": "success"}


@router.post("/add")
def create_new_note_in_s3(
    current_user: Annotated[User, Depends(verify_google_token)],
    request: FilenameRequest,
):
    """Add new notes for a user and class."""
    filename = request.filename.replace(" ", "_").lower()
    put_object_to_s3(
        "gptcotts-notes",
        f"{current_user.email}/{filename}.md",
        f"# {request.filename}\n## Section Heading\nLorem ipsum dolor sit amet, consectetur adipiscing elit.",
    )

    return {"status": "success"}


@router.post("/delete")
def delete_note_in_s3_and_pinecone(
    current_user: Annotated[User, Depends(verify_google_token)],
    request: FilenameRequest,
):
    """Delete the notes for a user and class."""
    delete_object_from_s3(
        "gptcotts-notes", f"{current_user.email}/{request.filename}.md"
    )
    delete_object_from_pinecone(current_user.email, request.filename)

    return {"status": "success"}
